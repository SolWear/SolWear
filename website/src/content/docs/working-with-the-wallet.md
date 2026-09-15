# Working with the Wallet

Every SolWear device holds one Ed25519 keypair — the device identity. It is the
Solana account the device signs for, and the whole platform exists to keep its
private key on the device and behind a deliberate human action. This guide walks
through the wallet API from a developer's point of view: reading the identity,
protecting it, signing with it, and generating a fresh one.

All of it lives under the `wallet` capability. Declare it in your manifest:

```json
{
  "id": "tech.example.signer",
  "name": "Example Signer",
  "capabilities": ["system", "wallet"],
  "entry": "index.html"
}
```

A call to any `wallet.*` method from an app that did not declare `wallet` is
rejected by `solweard` with error `-32001` before it reaches the keystore. The
private key itself never crosses the API boundary under any circumstances — the
only piece of the keystore you can read is the public key.

## The wallet lifecycle

A wallet moves through four observable states, all reported by
`wallet.status`:

```
                 setPassphrase              lock
  unprotected  ───────────────▶  protected ──────▶  protected
  (raw seed)                     (unlocked)          (locked)
      ▲                              │  ▲                │
      │                              │  └────────────────┘
      │          generate           │       unlock
      └──────────────────────────────
              (mints a new identity, back to unprotected)
```

- **`onboarded`** — always `true` on a provisioned device; a wallet exists.
- **`protected`** — a passphrase has been set, so the seed is encrypted at rest
  with Argon2id + ChaCha20-Poly1305.
- **`locked`** — the decrypted key is not in memory; signing is refused until
  `wallet.unlock` succeeds. Only a protected wallet can be locked, and a
  protected wallet always starts locked after a daemon restart.

```ts
const status = await solwear.wallet.status();
// { onboarded, locked, protected, name, publicKey }
```

## Reading the identity

```ts
const { publicKey } = await solwear.wallet.publicKey();
```

`publicKey` is base58, the way Solana addresses are written everywhere else. Use
it to look up balances, build transactions, or render a receive QR code. It is
safe to display and to share.

## Protecting the wallet

A fresh device wallet is an unprotected raw seed — convenient for development,
but anyone who can reach the daemon can sign with it. Set a passphrase to
encrypt it at rest:

```ts
await solwear.wallet.setPassphrase("correct horse battery staple", "My SolWear");
await solwear.wallet.lock();          // drop the key from memory
await solwear.wallet.unlock("correct horse battery staple");
```

Passphrases must be at least eight characters. Encryption happens inside
`solweard`; the passphrase is used to derive the key and is never stored.

## Signing

Signing is the point of the whole system, and it is the one operation that
**always** requires a human. `wallet.signTransaction` raises a confirmation
prompt on the device screen showing your app and the decoded transaction, and it
never signs without an affirmative action. There is no flag that bypasses this.

```ts
try {
  const { signature } = await solwear.wallet.signTransaction({
    appId: "tech.example.signer",
    message: base64EncodedTransactionMessage,
  });
  // broadcast `signature` from your own backend or a companion app
} catch (err) {
  // The user declined, or the prompt timed out. This is a normal outcome —
  // handle it, do not treat it as a crash.
}
```

The wallet must be unlocked to sign. If it is locked, the call returns an error;
prompt the user to unlock first with `wallet.unlock`.

## Generating a new identity

`wallet.generate` mints a brand-new Ed25519 keypair and makes it the device
identity, returning the new public key:

```ts
const { publicKey, protected: isProtected } = await solwear.wallet.generate();
// isProtected === false — the new wallet has no passphrase yet
await solwear.wallet.setPassphrase("a new strong passphrase", "My SolWear");
```

Three things to know before you call it:

1. **It is destructive and irreversible.** The previous private key is discarded
   the moment you generate. Any funds or on-chain state controlled by the old
   address are gone from the device's reach. Confirm intent with the user in
   your own UI first — treat it like wiping the device.
2. **A protected, locked wallet is refused.** Generation of a protected wallet
   requires it to be unlocked first, so a lost or stolen locked device cannot
   have its identity swapped without the passphrase. Unlock, then generate.
3. **The new wallet is unprotected.** The old passphrase does not carry over.
   Call `wallet.setPassphrase` again if the new identity should be protected.

Listen for `wallet.changed` to refresh anything that displays the address:

```ts
solwear.on("wallet.changed", ({ publicKey }) => showAddress(publicKey));
```

> **Security note.** Unlike signing, `wallet.generate` does not currently raise
> an on-device confirmation prompt. Any app granted the `wallet` capability can
> therefore replace the identity of an *unlocked* wallet with a single call.
> Grant `wallet` only to apps you trust, and prefer to drive regeneration from
> the shell's settings UI rather than from a third-party app.

## Signing history

`wallet.activity` returns recent successful signatures — digests and labels
only, never private keys or the signed message contents. Use it to show a
history view.

```ts
const history = await solwear.wallet.activity();
```

## Trying it in the emulator

The host emulator ships a protocol-compatible mock wallet, so every method above
works without a device — including `generate`, `setPassphrase`, `lock`,
`unlock`, and the confirmation prompt for signing. The mock wallet is thrown
away and regenerated on every start, so a signature produced there means nothing
on chain. See [Using the Emulator](using-the-emulator.html).
