# Codex configuration for SolWear

Codex reads **[`AGENTS.md`](../AGENTS.md)** at the repository root automatically. That file is
the single shared engineering contract for all coding agents and is the authoritative source
of the rules, the build/test commands, and the "SolWear is a platform, not just a wallet"
framing. This directory does not duplicate it.

## Codex's role

On SolWear, Codex is the **Implementer** (Claude is the Architect and the Reviewer). See
[`../docs/AI_WORKFLOW.md`](../docs/AI_WORKFLOW.md) for the full role split and the end-to-end
workflow. In short, Codex:

- Implements a **scoped** task from `tasks/active.md` (moved there from `tasks/backlog.md`).
- Writes the tests for the change, including rejection tests for anything security-relevant.
- Updates the docs that travel with the code.
- Keeps the change minimal; files unrelated cleanup as new `tasks/backlog.md` items.

## Before implementing

- Read `AGENTS.md` and the relevant part of `docs/ARCHITECTURE.md` (the binding contract).
- Do not change a public contract (JSON-RPC surface, manifest, registry format, `@solwear/sdk`)
  without the matching spec + `docs/pages/*` update in the same change.
- Never expose private keys or bypass the on-device signing confirmation.
- Security-gated work (keystore, signing, capability gate, sandbox) must be handed to Claude
  for security review and needs a second human reviewer before merge — do not merge it on the
  strength of tests alone.

## Verifying

Use the repo runner, which mirrors CI:

```bash
scripts/dev.sh build
scripts/dev.sh test
scripts/dev.sh lint
```

Run all commands from your Orca worktree directory; do not `cd` into the main checkout.
