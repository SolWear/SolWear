# AGENTS.md — Engineering rules for coding agents on SolWear

This file is the shared contract for **every** coding agent working in this repository —
Claude, Codex, and any other. It is loaded by Codex directly and referenced by
[`CLAUDE.md`](CLAUDE.md). Keep shared engineering rules here; put Claude-specific behaviour
in `CLAUDE.md`. Do not duplicate contradictory instructions between the two.

Read this before writing code. Then read the module you are touching and the relevant part
of the binding specification, [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## What SolWear is (do not drift from this)

SolWear is a **wearable platform built for Solana** — wearable hardware, SolWear OS, an open
SDK, an emulator, applications, a developer ecosystem, and Solana-native interactions.

```
Hardware → SolWear OS → SDK → Emulator → Apps → Developers → Users → Solana ecosystem
```

The Solana signer is **one app of five**, not the whole product. Never reduce SolWear back to
"a hardware wallet" or "a Ledger on your wrist" in code, comments, docs, or naming. Design
every API as part of a wearable platform with a third-party developer ecosystem.

---

## Core rules (non-negotiable)

1. **Never expose private keys to application code.** Keys live only in `solweard`
   (`os/solweard/src/wallet.rs`) and never cross the JSON-RPC boundary.
2. **Never assume the phone is trusted.** A companion phone, if present, is an untrusted peer.
3. **SolWear is phone-optional, not phone-dependent.** Features must degrade sensibly with no
   companion device. Do not make core flows require a phone.
4. **Never invent hardware capabilities.** Only use HAL surfaces that exist. If a capability
   is not in the HAL, it does not exist — do not fake it in a way that misleads.
5. **Security-sensitive code requires explicit review.** Anything touching the keystore,
   signature verification, the capability gate, or the sandbox needs a dedicated security
   review (Claude) and a second human reviewer before merge.
6. **Emulator behaviour must match real hardware wherever possible.** Every HAL method must
   work under `MockHal`. A method that only exists on real hardware is a bug.
7. **SDK APIs are for third-party developers.** Design `@solwear/sdk` surfaces to be typed,
   documented, stable, and hard to misuse. Assume the caller is not on the core team.
8. **Prefer reusable platform abstractions over one-off hacks.**
9. **Do not introduce dependencies without justification.** The docs site and registry are
   deliberately dependency-free; keep them that way. New deps need a stated reason.
10. **Do not silently change public APIs.** The JSON-RPC surface (spec §4.2), the manifest
    (§5), the registry format (§10), and `@solwear/sdk` are contracts.
11. **Every public SDK API has documentation.** Add or update `docs/pages/*` in the same change.
12. **Every important feature has tests.** See spec §12 for the coverage the project is held to.
13. **Never claim cryptographic security without evidence.** No "secure"/"unbreakable" claims
    without a concrete scheme, parameters, and a test — including a rejection test.
14. **Do not implement speculative tokenomics.** No tokens, points, or on-chain economics
    unless the human product owner has explicitly specified them.
15. **Keep the ecosystem/platform in mind when designing APIs.** Ask: how does a third-party
    app or store publisher use this?
16. **Preserve backwards compatibility** unless a breaking change is explicitly approved by
    the human product owner, and then update the spec and docs in the same change.

---

## The specification wins

`docs/ARCHITECTURE.md` is the single source of truth. A change that contradicts it breaks
components you may not be looking at. If you believe the spec is wrong, propose the spec
change **first**, in its own diff, with the reasoning — do not quietly diverge from it.

Any change to the JSON-RPC surface, the manifest format, or the registry format **must**
include the matching specification and `docs/pages/*` updates in the same change.

---

## How to build, test and verify

There is no root workspace; components are independent packages. Use the repo task runner,
which mirrors CI:

```bash
scripts/dev.sh doctor     # toolchain check (node, rust, qemu, ssh, keys)
scripts/dev.sh setup      # install deps + build in dependency order
scripts/dev.sh build      # build every component in order
scripts/dev.sh test       # run every component's tests + the registry + e2e
scripts/dev.sh lint       # rustfmt --check, clippy -D warnings, tsc typechecks, repo hygiene
scripts/dev.sh emulator   # start the host emulator (add -- --profile pi-round-480)
scripts/dev.sh e2e        # the whole-stack end-to-end test
```

Per-component commands (what CI actually runs) are in
[`CONTRIBUTING.md`](CONTRIBUTING.md) and mirrored by the script above. Key invariants:

- Build order is `sdk/runtime` → `sdk/cli` → everything else. Apps invoke the built CLI,
  which resolves the built SDK.
- No component may require hardware to build or to test. Tests run with `SOLWEAR_HAL=mock`.
- Rust: `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings`, `cargo test`.
- Nothing assumes a fixed screen size; sizes come from `system.screen`.

Before requesting review, run the checklist in `CONTRIBUTING.md` for the surfaces you touched.

---

## Conventions

- **Commits:** Conventional Commits with a component scope. Types: `feat`, `fix`, `docs`,
  `test`, `refactor`, `perf`, `build`, `ci`, `chore`. Scopes: `solweard`, `shell`, `sdk`,
  `cli`, `vscode`, `emulator`, `apps`, `registry`, `image`, `docs`, `ci`.
  Example: `feat(solweard): reject wallet calls without the wallet capability`.
- **Branches:** `<type>/<short-slug>` off `main`.
- **Do not commit signing keys.** `.gitignore` blocks the obvious cases; the responsibility
  is still yours. CI fails on any `*.pem`/`*.key`/`*.p12`/`*.pfx` outside `testdata/`.
- **Match surrounding code.** Comment density, naming, and idiom of the file you edit.

---

## Scope discipline for agents

- Prefer the smallest change that satisfies the task's Definition of Done.
- Do not refactor unrelated code, rename across the tree, or bump dependencies as a side
  effect. If you find such work is needed, note it as a new task in `tasks/backlog.md`.
- Do not make product decisions (direction, priorities, hardware, security tradeoffs)
  silently. Surface them to the human product owner. See `tasks/` and
  [`docs/AI_WORKFLOW.md`](docs/AI_WORKFLOW.md).
