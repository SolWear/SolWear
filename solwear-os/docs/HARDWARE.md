# SolWear — Hardware

> Orientation for engineers and agents. Binding contract: [`ARCHITECTURE.md`](ARCHITECTURE.md)
> §1, §4.1, §11. **Do not invent hardware capabilities.** If a peripheral is not in the HAL,
> it does not exist for the purposes of the code.

## Current target

- **Board:** Raspberry Pi 4 / Raspberry Pi 5 development board, arm64.
- **Base OS:** Raspberry Pi OS Lite (arm64, Bookworm).
- **Display stack:** `cage` (Wayland kiosk) + Chromium in kiosk mode against
  `http://127.0.0.1:8731`.
- **Display:** adaptive. Every UI surface must render correctly on **round and square**
  screens from **240×240 up to 800×480**. Nothing may assume a fixed pixel size. Shipped
  emulator profiles: `pi-round-240`, `pi-round-480`, `pi-square-320`, `pi-wide-800x480`.

## The Hardware Abstraction Layer (HAL)

The HAL is a Rust trait (`os/solweard/src/hal/mod.rs`) with two implementations selected at
startup:

- **`PiHal`** (`hal/pi.rs`) — real hardware.
- **`MockHal`** (`hal/mock.rs`) — deterministic fake, enabled with `SOLWEAR_HAL=mock`, used
  by the emulator and all tests. Values are scriptable from a JSON file so tests can drive
  battery level, time, and sensor readings.

**Every HAL method must work under `MockHal`.** A method that only exists on real hardware is
a bug, not a feature. This is what makes the emulator faithful and CI hardware-free.

## Peripherals surfaced today (via the HAL / RPC)

| Surface | On real hardware | RPC |
| --- | --- | --- |
| Battery / power | sysfs (`/sys/class/power_supply`) | `power.status` |
| Sensors | I2C | `sensors.read` |
| Backlight / brightness | `/sys/class/backlight` | `display.setBrightness` |
| Network | `nmcli` / NetworkManager | (system status) |
| NFC | HAL surface, mock-backed today | `nfc.status`, `nfc.setEnabled`, `nfc.walletRecord`, `nfc.diagnostics` |

If you need a peripheral that is not listed here, it is `UNKNOWN / NEEDS DECISION` — raise it
with the product owner and add it to the HAL trait (with a working `MockHal` path) before any
app or API depends on it.

## Image build

`image/` takes a Raspberry Pi OS Lite arm64 image and adds the `solweard` binary, shell
assets, preinstalled system apps, a `solwear` system user, the systemd units
(`solweard.service`, `solwear-ui.service`, `solwear-firstboot.service`), read-only root where
practical, and first-boot Wi-Fi provisioning. See
[`pages/flashing-a-raspberry-pi.md`](pages/flashing-a-raspberry-pi.md).

## Explicit non-goals (v0.1) and unknowns

- Non-goals (per spec): custom compositor, custom kernel, Yocto image, real Bluetooth pairing
  stack, on-chain mainnet transactions.
- `UNKNOWN / NEEDS DECISION`: production wearable hardware — SoC, display panel, battery,
  enclosure, buttons/crown, haptics, radios (BLE/NFC/Wi-Fi), secure element.
- `UNKNOWN / NEEDS DECISION`: real sensor suite (heart rate, accelerometer, temperature) on
  production hardware; today `stats` reads what the HAL/`MockHal` provides.
- Physical Pi peripherals remain a **hardware test**; neither emulator level exercises them.
  See [`LEGACY_MIGRATION.md`](LEGACY_MIGRATION.md) for the ESP32→SolWear OS boundary.
