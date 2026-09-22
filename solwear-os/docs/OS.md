# SolWear OS

> Orientation for engineers and agents. Binding contract: [`ARCHITECTURE.md`](ARCHITECTURE.md)
> §2, §4, §7, §11. JSON-RPC detail: [`pages/json-rpc-api-reference.md`](pages/json-rpc-api-reference.md).

SolWear OS is the on-device operating environment. The key architectural consequence, which
everything else follows from: **the shell and every app are ordinary web content**, running
over a single Rust system daemon. The emulator runs the identical UI code the device runs;
only the HAL is swapped.

## The two OS processes

### 1. `solweard` — the system daemon (`os/solweard/`, Rust)

A single static Rust binary, started by systemd before the UI. Responsibilities:

1. Serve the **JSON-RPC 2.0 API** over a WebSocket on `127.0.0.1:8730`.
2. Serve **shell and app static assets** over HTTP on `127.0.0.1:8731`.
3. Own the **HAL** (`PiHal` | `MockHal`; see [`HARDWARE.md`](HARDWARE.md)).
4. Manage installed **app packages**: install, verify signature, list, uninstall, launch.
5. Hold the **Solana keystore**, gated behind explicit user confirmation (see
   [`SECURITY.md`](SECURITY.md)).

Key source: `src/rpc.rs` (method dispatch), `src/wallet.rs` (keystore), `src/manifest.rs` /
`src/package.rs` (`.swa` parsing + verification), `src/hal/*` (HAL), `src/server.rs` (I/O),
`src/apps.rs` / `src/state.rs` (lifecycle + state).

### 2. The shell (`os/shell/`, TypeScript)

The system UI: watchface host, app launcher, notification tray, settings, and the wallet
confirmation prompt. A TypeScript single-page app served by `solweard`.

Mandatory layout rules (the display is adaptive):

- The root sizes itself from `system.screen`, never from constants.
- Round screens get a safe inset so no content lands in clipped corners.
- Typography and spacing derive from the **smaller** screen dimension.
- Target 60fps on a Pi 4; avoid layout thrash and heavy shadows.

## JSON-RPC surface (contract — spec §4.2)

Namespaced methods; all params and results are JSON objects, never positional arrays.
Namespaces: `system`, `power`, `display`, `sensors`, `notifications`, `apps`, `wallet`,
`nfc`. `wallet.signTransaction` always requires an on-device confirm and never exposes the
key. Adding or changing a method means amending the spec and the docs in the same change.

## App lifecycle and isolation

Apps are installed as signed `.swa` packages, launched into a **sandboxed iframe**, and reach
the system only through a **capability-gated bridge**. A call outside an app's granted
capabilities is rejected with JSON-RPC `-32001`. See [`SDK.md`](SDK.md) and
[`SECURITY.md`](SECURITY.md).

## Boot and image

systemd starts `solweard.service`, then `solwear-ui.service` (cage + Chromium kiosk). First
boot runs `solwear-firstboot.service` for Wi-Fi provisioning. Image build lives in `image/`.

## Rules for agents touching the OS

- Treat the JSON-RPC surface, the manifest, and the capability map as contracts (spec §4, §5).
- Every HAL method must have a working `MockHal` path; tests run with `SOLWEAR_HAL=mock`.
- Rust must pass `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings`, `cargo test`.
- Do not add a method or capability without documenting it and adding contract tests.

## Open items

- `UNKNOWN / NEEDS DECISION`: OTA / system update mechanism and its signing.
- `UNKNOWN / NEEDS DECISION`: multi-app concurrency and background execution model beyond the
  current single-foreground-app iframe.
