# SolWear Task System

Scoped units of work for coding agents. Each task is small enough for **one agent to complete
independently** and is written so an implementer needs no out-of-band context.

## Files

- [`TEMPLATE.md`](TEMPLATE.md) — copy this to create a task.
- [`backlog.md`](backlog.md) — proposed / not-yet-started tasks.
- [`active.md`](active.md) — tasks currently being implemented (one owner each).
- [`completed.md`](completed.md) — finished tasks (kept as a log).

## Lifecycle

```
backlog.md  →  active.md  →  completed.md
 (human)      (Codex)        (human on merge)
```

1. The **human product owner** writes a task in `backlog.md` from `TEMPLATE.md`.
2. **Claude (Architect)** analyses it, confirms scope, proposes the architecture, and asks
   clarifying questions if needed.
3. **Codex (Implementer)** moves it to `active.md`, implements it with tests, and opens a PR.
4. **Claude (Reviewer)** reviews; Codex fixes.
5. The **human** reviews the final diff, merges, and moves the entry to `completed.md`.

See [`../docs/AI_WORKFLOW.md`](../docs/AI_WORKFLOW.md) for the full role and review flow, and
[`../AGENTS.md`](../AGENTS.md) for the engineering rules every task inherits.

## Rules

- **IDs are `SOLWEAR-NNN`**, sequential, never reused.
- **One agent per active task.** Parallel tasks run in **separate Orca worktrees** (see
  AI_WORKFLOW). Two agents never share a worktree.
- **Keep tasks small.** If a task needs more than a couple of components or a hard product
  decision, split it or escalate to the product owner.
- **Every task carries its own Definition of Done, tests, docs, and security notes.** A task
  that touches the keystore, signing, the capability gate, or the sandbox is security-gated
  and needs an explicit security review plus a second human reviewer.
- **Contracts travel with code.** A task that changes the JSON-RPC surface, the manifest, or
  the registry format must update `docs/ARCHITECTURE.md` and `docs/pages/*` in the same change.
