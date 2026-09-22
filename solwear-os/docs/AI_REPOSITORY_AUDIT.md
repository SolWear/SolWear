# SolWear — AI Repository Audit

_Audit date: 2026-09-15. Author: AI engineering architect (initial inspection pass)._

This report is a snapshot of the repository as it exists today, written to bootstrap an
AI-assisted development workflow. It describes what is actually in the tree. It does **not**
propose product or architecture changes — those belong to the human product owner. Where a
fact could not be established from the code, it is marked `UNKNOWN / NEEDS DECISION`.

The binding technical contract for the product is and remains
[`docs/ARCHITECTURE.md`](ARCHITECTURE.md). This audit summarises and points at it; it never
replaces it.

---

## 1. What SolWear is

SolWear is a **wearable platform built for Solana**. It combines wearable hardware, an
on-device operating environment (SolWear OS), an open SDK, an emulator, first-party
applications, a developer ecosystem (signed app store), and Solana-native interactions
(the on-device signer and keystore).

The full system arc is:

```
Hardware → SolWear OS → SDK → Emulator → Apps → Developers → Users → Solana ecosystem
```

The Solana signer that the project started as is now **one app of five** running on the
platform. SolWear is deliberately *not* "a Ledger on your wrist" — it is a wearable OS and
developer platform that happens to have first-class, hardware-isolated Solana signing.

---

## 2. Current architecture (as built)

The whole product runs as ordinary web content over a single Rust system daemon. The
emulator runs the identical UI code the device runs; only the hardware abstraction layer is
swapped underneath.

| Layer | Where | Language | Role |
| --- | --- | --- | --- |
| System daemon | `os/solweard/` | Rust | JSON-RPC 2.0 server (`:8730`), static asset HTTP (`:8731`), HAL, app lifecycle, signature verification, Solana keystore |
| System shell | `os/shell/` | TypeScript | Watchface host, launcher, notification tray, settings, wallet confirmation UI |
| App runtime SDK | `sdk/runtime/` (`@solwear/sdk`) | TypeScript | Typed app API over the capability-gated bridge |
| Developer CLI | `sdk/cli/` (`solwear`) | Node/TypeScript | `new`, `build`, `run`, `package`, `sign`, `install`, `publish`, `verify`, `doctor` |
| VS Code extension | `sdk/vscode/` | TypeScript | Editor commands, templates, emulator control |
| Host emulator | `emulator/host/` | Node | Fast desktop simulator: real shell + real app bundle + `MockHal` |
| QEMU emulator | `emulator/qemu/` | Shell/Node | Full aarch64 Debian boot, production daemon under systemd |
| Apps | `apps/{watchface,signer,store,stats,games}/` | TypeScript | First-party apps on the platform |
| Store / registry | `store/registry/` | Node | Signed `.swa` registry, JSON Schemas, validator, package verifier |
| Device image | `image/` | Shell/systemd | Raspberry Pi OS Lite image build + systemd units |
| Docs site | `docs/` | Node | Zero-dependency documentation site generator |
| E2E harness | `tests/e2e/` | Node | Whole stack in one process tree, no hardware/QEMU |

### Trust and security spine

- Private keys live only in `solweard` (`os/solweard/src/wallet.rs`): Argon2id +
  ChaCha20-Poly1305, `zeroize` on lock. The key never crosses the JSON-RPC boundary.
- `wallet.signTransaction` always requires an affirmative on-device user confirmation.
- Apps run in a **sandboxed iframe** and reach the system only through a capability-gated
  bridge. A call outside an app's granted capabilities is rejected with JSON-RPC `-32001`.
- `.swa` packages are Ed25519-signed over a canonical per-file SHA-256 list; the registry
  additionally pins the whole-archive SHA-256 and the publisher key. Both store and daemon
  verify before install.

### Hardware target (as specified)

Raspberry Pi 4 / 5, arm64, Raspberry Pi OS Lite (Bookworm), `cage` Wayland kiosk +
Chromium kiosk. Adaptive display 240×240 → 800×480, round and square. Non-goals for v0.1:
custom compositor, custom kernel, Yocto, real Bluetooth pairing stack, on-chain mainnet
transactions. NFC exists as a HAL surface (`nfc.*` RPC methods, mock-backed today).

---

## 3. Important modules

- `os/solweard/src/rpc.rs` — the JSON-RPC method dispatch; the surface every app depends on.
- `os/solweard/src/wallet.rs` — the keystore; the highest-sensitivity code in the repo.
- `os/solweard/src/hal/{mod,pi,mock}.rs` — the HAL trait and its two implementations.
- `os/solweard/src/manifest.rs` / `package.rs` — manifest parsing and `.swa` verification.
- `sdk/runtime/src/{index,protocol,bridge}.ts` — the typed public SDK and wire protocol.
- `sdk/cli/src/commands/*` — the developer loop (`build`/`run`/`package`/`sign`/…).
- `store/registry/{validate,verify-packages,test}.mjs` — registry gate and crypto tests.
- `tests/e2e/harness.mjs` — the closest thing to a full integration definition of "working".

---

## 4. Current problems / rough edges

- **No repository-root task runner.** Each component is an independent npm package (no root
  `package.json`, no workspace, no Makefile). Newcomers and agents must know the per-component
  incantations. CI encodes them; nothing local mirrors CI in one command. _(Addressed by the
  new `scripts/dev.sh`; see [AI_WORKFLOW.md](AI_WORKFLOW.md).)_
- **No lint scripts defined.** CI runs `npm run lint --if-present`, but no Node component
  defines a `lint` script, so JS/TS linting is effectively formatting + `tsc --noEmit` only.
  Rust has `clippy -D warnings`. `UNKNOWN / NEEDS DECISION`: whether to add ESLint.
- **Build ordering is implicit.** Apps invoke the local CLI, which resolves the local SDK.
  `sdk/runtime` → `sdk/cli` → everything else must build in order. CI hard-codes this; there
  was no local script that did until now.
- **No existing Claude/Codex configuration** (`.claude/`, `.codex/`, `AGENTS.md`, `CLAUDE.md`
  were all absent before this pass).
- **Two emulation levels, differing fidelity.** The host emulator is fast but mock-only; QEMU
  is faithful but needs `qemu-system-aarch64`. Neither exercises real Pi peripherals — that
  remains a hardware test (`docs/LEGACY_MIGRATION.md` documents the boundary).

---

## 5. Missing infrastructure (before this pass)

- AI agent knowledge base (`AGENTS.md`, `CLAUDE.md`, the `docs/*.md` platform docs).
- A task system for handing scoped units of work to coding agents (`tasks/`).
- A one-command developer/agent entry point (`scripts/dev.sh`: setup, build, test, lint,
  emulator, doctor).
- Documented Orca worktree conventions for parallel agent work.

All of the above are created by this pass. None of them change product behaviour.

---

## 6. Recommended AI workflow (summary)

- **Claude = Architect + Reviewer.** Architecture, security design, SDK/OS design, large
  refactors, planning, and review of implemented diffs.
- **Codex = Implementer.** Implementation, tests, refactors, bug fixes, docs updates.
- **Human = Product Owner.** Direction, priorities, hardware and security tradeoffs, merges.
- Work flows through the `tasks/` system: the human writes a scoped task → Claude plans →
  Codex implements + tests → CI runs → Claude reviews → Codex fixes → human approves + merges.
- Parallel work happens in **isolated Orca git worktrees** (one per surface:
  `solwear-sdk`, `solwear-emulator`, `solwear-os`, `solwear-firmware`,
  `solwear-security-review`). Two agents never share a worktree.

Full detail: [AI_WORKFLOW.md](AI_WORKFLOW.md). Engineering rules: [`AGENTS.md`](../AGENTS.md).
