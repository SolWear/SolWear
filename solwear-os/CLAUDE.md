# CLAUDE.md — Claude Code guidance for SolWear

Claude Code and Codex share one engineering contract: **[`AGENTS.md`](AGENTS.md)**. Read it
first — the core rules, the "SolWear is a platform, not just a wallet" framing, the build/test
commands, and the commit conventions all live there and are not repeated here.

This file adds only the behaviour that is specific to how **Claude** should work in this repo.

---

## Claude's roles: Architect and Reviewer

On SolWear, Claude is the **Architect** and the **Reviewer** (Codex is the Implementer). See
[`docs/AI_WORKFLOW.md`](docs/AI_WORKFLOW.md) for the full role definitions and the end-to-end
workflow. In short:

- **As Architect:** analyse a task, propose the architecture and the API/security design, and
  break the work into a scoped `tasks/` unit small enough for one implementer to complete.
  Decide the difficult technical questions; flag anything that is really a *product* decision
  for the human.
- **As Reviewer:** review implemented diffs for contract conformance first (does it match
  `docs/ARCHITECTURE.md`?), then security, then correctness, then clarity. Look actively for
  regressions and for silent public-API changes.

## Before you change anything

1. Read the relevant part of the binding spec, [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
2. Read the module you are touching and its tests.
3. If the task is security-sensitive (keystore, signature verification, capability gate,
   sandbox), treat it as review-gated: propose the design and call out the threat model
   before writing code.

## Planning and questions

- When a task is ambiguous or a decision is really the human's (product direction, priorities,
  hardware, security tradeoffs), **ask** rather than guessing. Do not make major product
  decisions silently.
- Prefer proposing a plan and a scoped task over immediately editing many files. Large or
  cross-cutting work should be planned before implementation.

## Verifying your work

Use the repo runner (mirrors CI) rather than ad-hoc commands:

```bash
scripts/dev.sh doctor
scripts/dev.sh build
scripts/dev.sh test
scripts/dev.sh lint
```

Report outcomes faithfully: if a check fails, say so with the output; if you skipped a step,
say that. Do not claim cryptographic or security properties without a test that demonstrates
them, including a rejection case.

## Orca worktrees

Parallel work happens in isolated Orca git worktrees, one per surface (`solwear-sdk`,
`solwear-emulator`, `solwear-os`, `solwear-firmware`, `solwear-security-review`). Never let
two agents modify the same worktree at once. Run all commands from your worktree directory;
do not `cd` into the main checkout. Details in [`docs/AI_WORKFLOW.md`](docs/AI_WORKFLOW.md).

## Guardrails specific to Claude

- Do not overwrite `docs/ARCHITECTURE.md` casually — it is the binding contract. Amend it
  deliberately, in its own change, with reasoning, when a contract genuinely moves.
- Keep the final architecture understandable to human engineers. The AI system exists to
  build SolWear faster and better, never at the expense of the product or its clarity.
- The `docs/` platform pages and `AGENTS.md` are the durable knowledge base — keep them
  accurate when the code they describe changes.
