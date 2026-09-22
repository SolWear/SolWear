---
name: build-a-solwear-app
description: Build an app for SolWear OS — the wearable operating system. Use when the user wants to create, build, run, preview, package, sign, or publish a SolWear app, watchface, or signer, mentions the `solwear` CLI or `@solwear/sdk`, or asks how to develop for a SolWear device. Covers scaffolding, the app manifest, the SDK API, the host emulator, packaging to `.swa`, signing, and publishing to the store.
---

# Build a SolWear app

SolWear apps are web apps (HTML/CSS/TypeScript) that run on the SolWear OS shell,
bundled against `@solwear/sdk` and driven by the `solwear` CLI. Everything below
uses the published npm packages — no monorepo checkout is required.

## Prerequisites

- Node.js >= 22.
- The CLI, installed globally: `npm install --global @solwear/cli`. This also
  installs the host emulator (`@solwear/emulator-host`) as a dependency, so
  `solwear run` works without a monorepo.

Confirm the toolchain with `solwear doctor`, which checks Node, the SDK, the
emulator, a browser for the emulator window, and the signing tools.

## The developer loop

1. **Scaffold.** `solwear new <name> --template <app|watchface|signer>`. This
   creates a project with a `manifest.json`, a `src/main.ts` that imports from
   `@solwear/sdk`, an `index.html`, styles, and `@solwear/sdk` in its
   `package.json`. Run `npm install` in the new directory to fetch the SDK.
2. **Write the app.** Import the API from `@solwear/sdk` — `layout` for the
   device-safe layout (round vs square screens have different safe insets),
   `solwear` for the JSON-RPC bridge to the OS (RPC calls fail with a clear
   error outside a shell rather than hanging). Keep the entry small; the shell
   hosts the app full-screen inside the device bezel.
3. **Run.** `solwear run --profile <profile>` builds the app and opens the host
   emulator — the real shell and your app against a mock HAL, in a window that
   draws the device bezel. Use `--no-window` on a headless machine or over SSH:
   it serves the shell and prints the URL instead. `--list-profiles` shows the
   device profiles (for example `pi-round-480`, `pi-round-240`,
   `pi-square-320`, `pi-wide-800x480`). `--qemu` boots the full aarch64 image
   and needs a monorepo checkout plus QEMU; the default host emulator does not.
4. **Package.** `solwear package` produces an installable `.swa` archive named
   after the manifest id and version, in `dist/`.
5. **Sign.** `solwear keygen` creates a publisher keypair; `solwear sign`
   signs the `.swa`; `solwear verify` checks a signature and rejects tampered,
   unsigned, or wrong-key packages. Never claim a package is signed or verified
   without running `verify` and showing the rejection case.
6. **Publish.** `solwear publish` submits the signed package to the store
   registry, which enforces the manifest schema, secure URLs, ordered version
   history, and signature validity.

## The manifest

`manifest.json` declares the app `id` (reverse-DNS, e.g. `dev.solwear.pulse`),
`name`, `version`, `type` (`app`, `watchface`, or `signer`), the SDK version,
the `entry` HTML file, and the capabilities the app requests. Capabilities are
gated by the OS — request only what the app uses. Signing and store-side checks
depend on the manifest being well-formed, so validate it (the CLI does this on
`build` and `package`) before publishing.

## Working style

- Prefer the CLI over hand-rolled build steps — it mirrors what the store and
  the device expect.
- Report check outcomes faithfully: if `build`, `verify`, or `doctor` fails,
  show the decisive output rather than asserting success.
- Security-sensitive work (keystore, signing, capabilities) is review-gated:
  explain the threat model before writing code, and always demonstrate a
  rejection case in tests, not just the happy path.
- Full reference lives in the docs at https://docs.solwear.tech.
