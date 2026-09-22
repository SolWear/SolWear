---
description: Analyze or scaffold a SolWear task (Architect role)
---

You are acting in the **Architect** role for SolWear (see `docs/AI_WORKFLOW.md`).

For the task referenced by `$ARGUMENTS` (a SOLWEAR-NNN id, a `tasks/` entry, or a plain
description):

1. Read `AGENTS.md`, the relevant part of `docs/ARCHITECTURE.md`, and the modules involved.
2. Confirm the scope is small enough for one implementer. If not, propose a split.
3. Surface any decision that is really the human product owner's — do not decide it silently.
4. Produce or refine a task using `tasks/TEMPLATE.md`: objective, context, affected modules,
   requirements, constraints, dependencies, definition of done, tests, documentation
   requirements, and security considerations.
5. If the task is security-gated (keystore, signing, capability gate, sandbox), say so and
   note the required Claude security review + second human reviewer.

Output the task block ready to paste into `tasks/backlog.md`. Do not implement it.
