# SolWear — Developer Ecosystem

> Orientation for engineers and agents. Binding contract: [`ARCHITECTURE.md`](ARCHITECTURE.md)
> §5, §10. Detailed pages: [`pages/publishing-to-the-store.md`](pages/publishing-to-the-store.md),
> [`pages/package-format-and-signing.md`](pages/package-format-and-signing.md),
> [`store/registry/README.md`](../store/registry/README.md).

SolWear is a **platform with a third-party developer ecosystem**, not a closed appliance. The
ecosystem is what turns "a watch that signs Solana transactions" into "a wearable OS people
build on."

## The pieces

```
Developer → SDK (@solwear/sdk + solwear CLI) → .swa package → signed → registry PR → store app → user's device
```

1. **Build** an app in TypeScript/HTML/CSS with `@solwear/sdk`.
2. **Package** it into a `.swa` (`solwear package`).
3. **Sign** it with an Ed25519 publisher key (`solwear sign`). Keys never enter the repo.
4. **Publish** by opening a pull request that adds an entry to
   `store/registry/index.json` (`solwear publish` helps prepare it).
5. CI **independently validates** the manifest, whole-archive SHA-256, full per-file hash
   set, publisher key, and signature.
6. The **store app** on the device fetches the index and installs, re-verifying everything
   before it lands.

## The registry (`store/registry/`)

- `index.json` — the published app list (schema-versioned).
- `schema/*.json` — JSON Schemas for the manifest and the registry.
- `validate.mjs`, `test.mjs`, `verify-packages.mjs` — the gate: schema validation,
  cryptographic rejection cases, and package hash/signature verification.
- `fixtures/invalid/*` — a rich set of things that MUST be rejected (tampered manifest,
  version regression, rotated/malformed publisher key, path escape, watchface asking for the
  wallet capability, and more). These fixtures are the executable definition of "the ecosystem
  is safe."

**Publishing is a reviewed pull request.** Trust in the store comes from the review plus the
independent CI verification, not from any single party.

## Why this matters for API design (rule for agents)

Every OS/SDK API is also an **ecosystem** API. When you design a method, a manifest field, or
a capability, assume a third-party developer will use it and a store reviewer will have to
reason about it. Prefer reusable platform abstractions. Keep capabilities least-privilege
(a watchface cannot hold `wallet`). Document every public surface. Do not silently change a
contract that published apps or the registry depend on.

## First-party apps as ecosystem examples

`apps/watchface`, `apps/signer`, `apps/store`, `apps/stats`, `apps/games` are both product and
reference: they show third-party developers what a well-formed SolWear app looks like. Keep
them exemplary.

## Open items

- `UNKNOWN / NEEDS DECISION`: hosted package distribution (today first-party `.swa`s are
  checked in under `store/registry/packages/`; the registry supports `url` + hosted verify).
- `UNKNOWN / NEEDS DECISION`: publisher identity/verification, key rotation policy in
  production, and store curation/moderation process.
- `UNKNOWN / NEEDS DECISION`: developer monetisation and any economics. **No speculative
  tokenomics** until the product owner specifies them.
