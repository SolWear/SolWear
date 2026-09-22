# SolWear — Security Model

> Orientation for engineers and agents. The binding contract is
> [`ARCHITECTURE.md`](ARCHITECTURE.md) (§4, §5, §10) and the detailed page
> [`pages/capabilities-and-security.md`](pages/capabilities-and-security.md). This document
> summarises the model and states the rules agents must follow. It does **not** claim
> properties the code has not been shown to have.

## Trust boundaries

```
Untrusted            Semi-trusted (sandbox)        Trusted (TCB)
─────────            ─────────────────────         ─────────────
companion phone      third-party apps              solweard (Rust daemon)
network / store      shell UI (system web app)       ├─ keystore / signer
                     @solwear/sdk in the app          ├─ signature verification
                                                       ├─ capability gate
                                                       └─ HAL
```

- The **companion phone is never trusted.** SolWear is phone-optional; treat any phone as an
  untrusted peer.
- **Apps are sandboxed.** Each app runs in a sandboxed iframe and reaches the system only
  through a capability-gated bridge. It never talks to the socket directly.
- **The daemon is the trusted computing base.** Keys, signing, verification, and the
  capability gate all live in `solweard`.

## Keystore and signing

- The Solana private key lives only in `solweard` (`os/solweard/src/wallet.rs`) and **never
  crosses the JSON-RPC boundary**. There is no API that returns it.
- A development wallet starts as an owner-only raw seed and is upgraded in place by
  `wallet.setPassphrase` to an authenticated encrypted document using **Argon2id** (key
  derivation) and **ChaCha20-Poly1305** (authenticated encryption). Locking drops the
  decrypted key from memory (`zeroize`); signing cannot resume until the correct passphrase
  is supplied.
- `wallet.signTransaction` **must always** raise an on-device confirmation prompt and must
  never sign without an affirmative user action. The user sees what they are signing.

## App isolation and capabilities

- Each app declares capabilities in its manifest. `solweard` rejects any RPC method outside
  the calling app's granted capabilities with JSON-RPC error `-32001`.
- Capability names map to method prefixes: `system`, `power`, `display`, `sensors`,
  `notifications`, `apps`, `wallet`, `nfc`.
- A watchface may not hold the `wallet` capability (enforced; see registry fixtures).

## Package integrity (`.swa`)

- Packages are Ed25519-signed over a canonical, domain-separated, per-file SHA-256 list. Any
  added, removed, or changed file invalidates the signature.
- The registry additionally pins the **whole-archive SHA-256** and the **publisher key**.
  Both the store app and the daemon verify the archive hash, the embedded public key against
  the pinned `publisherKey`, and the signature **before install**, and refuse on any failure.
- Publishing is a reviewed pull request; CI independently re-validates the manifest, hashes,
  full per-file hash set, publisher key, and signature.

## Rules for agents on security-sensitive code

1. Never expose or log private keys, seeds, or decrypted signing material.
2. Never assume the phone (or any external peer) is trusted.
3. Never add an API that returns key material or bypasses the confirmation prompt.
4. Never weaken or skip signature/hash/capability verification, including in test helpers
   that could leak into production paths.
5. Never claim a cryptographic property without a concrete scheme, parameters, and a test
   that includes a **rejection** case (tampered package, wrong hash, wrong key, unsigned on
   the store path, capability violation, app impersonation — all exercised by `tests/e2e`).
6. Security-relevant changes (keystore, signature verification, capability gate, sandbox)
   require an explicit Claude security review **and** a second human reviewer before merge.

## Reporting a vulnerability

Do not open a public issue. Email `security@solwear.tech` (per `CONTRIBUTING.md`).

## Open items

- `UNKNOWN / NEEDS DECISION`: secure element / hardware-backed key storage on production
  hardware (today keys are software-encrypted at rest on the device filesystem).
- `UNKNOWN / NEEDS DECISION`: anti-tamper, secure boot, and firmware update signing for
  production hardware.
- `UNKNOWN / NEEDS DECISION`: formal threat model document and independent audit.
