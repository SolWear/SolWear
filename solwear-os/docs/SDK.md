# SolWear — SDK

> Orientation for engineers and agents. Binding contract: [`ARCHITECTURE.md`](ARCHITECTURE.md)
> §6, §8. Detailed pages: [`pages/installing-the-sdk.md`](pages/installing-the-sdk.md),
> [`pages/app-manifest-reference.md`](pages/app-manifest-reference.md),
> [`pages/your-first-watchface.md`](pages/your-first-watchface.md).

The SDK is what third-party developers use to build SolWear apps. It has two parts: the app
**runtime** (`@solwear/sdk`) and the developer **CLI** (`solwear`). Design everything here for
someone who is **not** on the core team.

## App runtime — `@solwear/sdk` (`sdk/runtime/`)

Apps import a typed client that speaks the JSON-RPC API through the shell's sandbox bridge —
**never** directly to the socket.

```ts
import { solwear } from "@solwear/sdk";

const battery = await solwear.power.status();
solwear.on("tick", (t) => render(t));   // one event per second
const screen = solwear.system.screen;    // { width, height, shape }
```

Surface (contract): `system`, `power`, `display`, `sensors`, `notifications`, `apps`,
`wallet`, `nfc`, plus an event emitter with events `tick`, `visibility`, `button`, `gesture`.
Every method is typed and returns a promise. Key source: `src/index.ts` (public surface),
`src/protocol.ts` (wire protocol), `src/bridge.ts` (transport), `src/types.ts`.

SDK design rules:

- **Typed, documented, hard to misuse.** Every public API has a type and a `docs/pages/*`
  entry. Assume the caller misreads the name — make the safe path the easy path.
- **Stable.** The surface is a contract. Do not change it silently; preserve backwards
  compatibility unless a breaking change is explicitly approved, and then update the spec and
  docs in the same change.
- **Capability-aware.** A method's namespace maps to a manifest capability; calling without
  the capability fails with JSON-RPC `-32001`. Document which capability each method needs.
- **Emulator-equal.** Anything the SDK exposes must work against `MockHal` in the emulator.

## Developer CLI — `solwear` (`sdk/cli/`)

Modelled on `esp-idf`: one tool covers the whole developer loop. Commands (source in
`sdk/cli/src/commands/`):

```
solwear new <name> [--template watchface|app|signer]
solwear build              # bundle TypeScript, emit dist/
solwear run                # launch the host emulator with this app loaded
solwear run --qemu         # boot the full aarch64 image under QEMU
solwear package            # produce dist/<id>-<version>.swa
solwear sign --key <path>  # add signature.json
solwear install --device <host>   # push .swa to a real watch over SSH
solwear publish            # submit to the registry
solwear verify             # verify a package's hashes and signature
solwear doctor             # verify toolchain: node, rust, qemu, ssh, keys
```

`solwear doctor` never reports a problem without the exact command that fixes it.

> Note: `solwear` is the **app developer** CLI (operates on a single app project). For
> repository-wide build/test/lint across all components, use `scripts/dev.sh` (see
> [`AI_WORKFLOW.md`](AI_WORKFLOW.md)). The two are distinct on purpose.

## App package and manifest

Apps ship as `.swa` ZIP archives (`manifest.json`, `index.html`, optional `assets/`,
`signature.json`). Manifest fields and the signing scheme are the contract in spec §5 and
[`pages/package-format-and-signing.md`](pages/package-format-and-signing.md). Ids are
reverse-DNS and immutable. `type` is `app` or `watchface`.

## VS Code extension (`sdk/vscode/`)

Editor commands, templates, and emulator control for the developer loop.

## Rules for agents touching the SDK

- Never expose key material or a way to bypass the on-device signing confirmation.
- Every new public method: typed, documented, capability-mapped, tested, working under mock.
- Do not add dependencies to the runtime or CLI without justification.

## Open items

- `UNKNOWN / NEEDS DECISION`: SDK versioning/compatibility policy across OS releases (the
  manifest carries an `sdk` field, currently `"0.1"`).
- `UNKNOWN / NEEDS DECISION`: language bindings beyond TypeScript, if any.
