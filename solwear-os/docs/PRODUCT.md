# SolWear — Product Overview

> This is an orientation document for engineers and coding agents. The binding technical
> contract is [`ARCHITECTURE.md`](ARCHITECTURE.md). Where product intent is not yet settled,
> it is marked `UNKNOWN / NEEDS DECISION`.

## What SolWear is

SolWear is a **wearable platform built for Solana**. It combines:

- **Wearable hardware** — a wrist-worn device (Raspberry Pi 4/5 development target today).
- **SolWear OS** — the on-device operating environment, comparable in role to watchOS or
  Wear OS, built on ordinary Linux.
- **An open SDK** — apps are TypeScript / HTML / CSS, the lowest barrier for third-party
  developers, adapting to any screen size for free.
- **An emulator** — two levels (fast host simulator, full QEMU boot) so developers build
  without hardware.
- **Applications** — first-party apps (watchface, signer, store, stats, games) and a path
  for third-party apps.
- **A developer ecosystem** — a signed app store where publishing is a reviewed pull request.
- **Solana-native interactions** — an on-device, hardware-isolated Solana signer and keystore
  where the private key never leaves the device.

The product arc:

```
Hardware → SolWear OS → SDK → Emulator → Apps → Developers → Users → Solana ecosystem
```

## What SolWear is not

- It is **not** "a Ledger on your wrist." The Solana signer is one app of five on a general
  wearable platform, not the whole product.
- It is **not** phone-dependent. A companion phone is optional and, when present, untrusted.
- It does **not** ship speculative tokenomics. No tokens or on-chain economics unless the
  product owner specifies them.

## Who it is for

- **Users** who want a Solana-capable wearable with trustworthy on-device signing plus the
  everyday utility of a smartwatch (watchfaces, stats, notifications, games).
- **Developers** who want to build wearable apps in web technologies and publish them through
  a signed store.

## Product principles

1. **Platform first.** Every feature and API is designed as part of a wearable OS with a
   third-party ecosystem, not as a one-off wallet feature.
2. **Trust is on-device.** Signing and keys are isolated in the system daemon; the UI shows
   the user exactly what they are approving.
3. **Adaptive by default.** Round and square screens, 240×240 to 800×480; nothing assumes a
   fixed size.
4. **Emulator-equal.** Developers build the real thing without hardware; the emulator runs
   the identical UI code.
5. **Low barrier, high safety.** Web apps for reach; a capability-gated sandbox for safety.

## Current status

v0.1, under active development. Runs on Raspberry Pi 4/5. The signer, watchface, store,
stats and games apps ship as first-party apps. See [`ROADMAP.md`](ROADMAP.md) for direction
and [`docs/LEGACY_MIGRATION.md`](LEGACY_MIGRATION.md) for the ESP32-era migration boundary.

## Open product questions

- `UNKNOWN / NEEDS DECISION`: the production hardware beyond the Raspberry Pi development
  target (industrial design, SoC, display, battery, radios).
- `UNKNOWN / NEEDS DECISION`: companion-app scope, if any, and the phone-optional pairing UX.
- `UNKNOWN / NEEDS DECISION`: mainnet transaction policy (v0.1 non-goal is on-chain mainnet).
- `UNKNOWN / NEEDS DECISION`: monetisation / store economics for third-party developers.
