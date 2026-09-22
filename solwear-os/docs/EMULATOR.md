# SolWear — Emulator

> Orientation for engineers and agents. Binding contract: [`ARCHITECTURE.md`](ARCHITECTURE.md)
> §9. Detailed page: [`pages/using-the-emulator.md`](pages/using-the-emulator.md).

The emulator is how developers build SolWear without hardware. There are **two levels, both
required**, and the guiding principle is: **emulator behaviour should match real hardware
wherever possible.** The emulator runs the identical shell and app code the device runs; only
the HAL is swapped for `MockHal`.

## Level 1 — Host simulator (`emulator/host/`)

A desktop window that renders the **real shell plus the real app bundle**, backed by
`MockHal` through a protocol-compatible mock daemon. Starts in under two seconds.

- Device profiles are JSON files describing screen size, shape, buttons, and mock sensor
  scripts (`emulator/host/profiles/`): `pi-round-240`, `pi-round-480`, `pi-square-320`,
  `pi-wide-800x480`. Ship-blocking profiles are `pi-round-480`, `pi-square-320`,
  `pi-wide-800x480` — a layout change is not finished until seen on all three.
- The window frame draws the device bezel so round screens are visibly round.
- Live HAL controls and RPC diagnostics let you drive battery, time, sensors.

Run it:

```bash
scripts/dev.sh emulator                      # default profile
scripts/dev.sh emulator -- --profile pi-round-480
# or directly:
npm --prefix emulator/host start -- --profile pi-square-320
```

Key source: `src/daemon.mjs`, `src/mock-hal.mjs`, `src/server.mjs`, `src/ws.mjs`,
`src/launch.mjs`; web shell under `web/`.

## Level 2 — QEMU emulator (`emulator/qemu/`)

Boots a **real Debian Bookworm ARM64 guest** with `qemu-system-aarch64`, running the
production `solweard` under systemd with port forwards to the daemon. It uses a UEFI/virtio
disk rather than the Pi firmware image; **physical Pi peripherals remain a hardware test**.

- Must detect a missing `qemu-system-aarch64` and print the exact install command rather than
  crashing with a stack trace.
- Reached from the CLI via `solwear run --qemu`.

Scripts: `emulator/qemu/build-image.sh`, `run.sh`, `smoke.mjs`.

## Fidelity boundary

- The host simulator is **fast but mock-only** — great for UI, layout, and app logic.
- QEMU is **faithful OS/daemon behaviour** — great for the systemd boot path and the real
  Rust daemon — but still not real peripherals.
- Real sensors, backlight, NFC radio, and network on actual Pi hardware are a **hardware
  test**. Do not present emulator results as hardware validation.

## Rules for agents

- Any HAL/RPC surface you add must have a working `MockHal` path and, ideally, a host-emulator
  control, so the emulator stays faithful (spec §4.1, §9).
- Test with `SOLWEAR_HAL=mock`; no test may require hardware or QEMU to pass (the QEMU smoke
  test is opt-in and gated on `qemu-system-aarch64` being present).

## Open items

- `UNKNOWN / NEEDS DECISION`: emulating production-hardware peripherals (real sensor models,
  radios) once that hardware is defined.
