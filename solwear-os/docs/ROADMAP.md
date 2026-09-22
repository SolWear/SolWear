# SolWear — Roadmap

> Orientation for engineers and agents. This is a **living** document. Anything not yet
> settled is marked `UNKNOWN / NEEDS DECISION` and is a **human product-owner decision** —
> agents must not silently commit the project to any of it. The binding technical contract is
> [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Where we are (v0.1)

- SolWear OS runs on Raspberry Pi 4/5 (arm64, Raspberry Pi OS Lite).
- Single Rust daemon (`solweard`): JSON-RPC API, HAL (`PiHal`/`MockHal`), app lifecycle,
  signature verification, encrypted Solana keystore.
- TypeScript shell; five first-party apps (watchface, signer, store, stats, games).
- Typed SDK (`@solwear/sdk`) + developer CLI (`solwear`) + VS Code extension.
- Two emulator levels (fast host simulator, QEMU) and a signed app store with a validated
  registry.
- CI covers registry, docs, daemon (fmt/clippy/build/test), Node components, e2e, and repo
  hygiene. See `docs/LEGACY_MIGRATION.md` for the ESP32→SolWear OS migration status.

The architecture is described as **settled** in the spec. The roadmap below is about product
reach, not re-litigating settled platform decisions.

## Near-term themes (candidates — confirm with product owner)

These follow directly from gaps this audit noted; none are commitments:

- **Developer-experience polish:** the repo-wide `scripts/dev.sh` runner (done), optional
  ESLint (`UNKNOWN / NEEDS DECISION`), richer templates.
- **Ecosystem hardening:** hosted package distribution, publisher identity, key-rotation
  policy, store curation.
- **App breadth:** more first-party apps and third-party onboarding materials.

## Longer-term / open questions (all `UNKNOWN / NEEDS DECISION`)

- **Production hardware:** SoC, display panel, battery, enclosure, buttons/crown, haptics,
  radios (BLE/NFC/Wi-Fi), and a **secure element** for hardware-backed keys. See
  [`HARDWARE.md`](HARDWARE.md).
- **Security maturity:** secure boot, signed OTA updates, anti-tamper, formal threat model,
  independent audit. See [`SECURITY.md`](SECURITY.md).
- **Solana reach:** mainnet transaction policy (a v0.1 non-goal), dApp/wallet-standard
  integration, companion-optional pairing UX. Phone remains **optional and untrusted**.
- **Ecosystem economics:** developer monetisation. **No speculative tokenomics** unless the
  product owner explicitly specifies them.

## How roadmap items become work

An item here is not a task. To act on one: the human product owner promotes it into a scoped
unit in [`../tasks/backlog.md`](../tasks/backlog.md) using [`../tasks/TEMPLATE.md`](../tasks/TEMPLATE.md),
Claude plans it, Codex implements it, and it flows through the workflow in
[`AI_WORKFLOW.md`](AI_WORKFLOW.md).
