# SolWear — AI-Assisted Development Workflow

This document defines how humans and coding agents build SolWear together: the roles, the
task flow, the automation, and how to run everything in isolated Orca worktrees.

The engineering rules every agent must follow are in [`../AGENTS.md`](../AGENTS.md).
Claude-specific behaviour is in [`../CLAUDE.md`](../CLAUDE.md). The task system is in
[`../tasks/`](../tasks/). The binding product contract is [`ARCHITECTURE.md`](ARCHITECTURE.md).

> Principle: **the AI system exists to build SolWear faster and better — never at the expense
> of the product.** The final architecture must remain understandable to human engineers.

---

## Roles

### ARCHITECT — Claude

Owns:

- Architecture and difficult technical decisions.
- Security design (keystore, signing, capability gate, sandbox).
- SDK design (third-party-facing surfaces).
- OS architecture and large refactors.
- Technical planning: turning a human's task into a scoped, implementable unit.

### IMPLEMENTER — Codex

Owns:

- Implementation of a scoped task.
- Tests for the change.
- Refactoring within the task's scope.
- Bug fixes and repetitive engineering work.
- Documentation updates that accompany the code.

### REVIEWER — Claude

Owns:

- Reviewing Codex's changes: **contract conformance first** (does it match
  `ARCHITECTURE.md`?), then security, then correctness, then clarity.
- Architecture review and API review.
- Security review of anything touching the keystore, signing, capability gate, or sandbox.
- Testing review and regression hunting.

### HUMAN — Product Owner

Decides:

- Product direction and priorities.
- Architecture decisions with major consequences.
- Hardware decisions.
- Security tradeoffs.
- What gets merged.

**Agents must not make major product decisions silently.** When a task turns out to require a
product-owner decision, stop and surface it (see the `UNKNOWN / NEEDS DECISION` marker used
throughout the docs).

---

## The workflow

### Standard task

1. **Human creates a task** in [`../tasks/backlog.md`](../tasks/backlog.md) using
   [`../tasks/TEMPLATE.md`](../tasks/TEMPLATE.md).
2. **Claude (Architect) analyses** the task and confirms scope, or asks clarifying questions.
3. **Claude proposes the architecture** — API/security/OS design, and any spec change needed.
4. **Codex (Implementer) implements** the change and its tests, moving the task to
   [`../tasks/active.md`](../tasks/active.md).
5. **Automated tests run** (`scripts/dev.sh test`; CI on push).
6. **Claude (Reviewer) reviews** the diff: conformance, security, correctness, regressions.
7. **Codex fixes** the review issues.
8. **Human reviews the final diff.**
9. **Human merges** and moves the task to [`../tasks/completed.md`](../tasks/completed.md).

### Larger / security-sensitive task

```
Claude Architect
  → Codex Implementation
    → Codex Tests
      → Claude Security Review
        → Claude Architecture Review
          → Human Approval
```

Security-relevant changes additionally require a **second human reviewer** (per
`CONTRIBUTING.md`).

---

## Automation: `scripts/dev.sh`

There is no root workspace, so `scripts/dev.sh` is the one entry point that mirrors CI across
all components. An agent (or a new human) can clone, set up, test, and start the emulator with
no tribal knowledge:

```bash
scripts/dev.sh doctor     # toolchain: node, rust, cargo, qemu, ssh, keys
scripts/dev.sh setup      # install deps + build in dependency order (sdk/runtime → sdk/cli → rest)
scripts/dev.sh build      # build every component in order
scripts/dev.sh test       # every component's tests + registry + e2e
scripts/dev.sh lint       # rustfmt --check, clippy -D warnings, tsc typechecks, repo hygiene
scripts/dev.sh emulator   # host emulator (append -- --profile pi-round-480, etc.)
scripts/dev.sh e2e        # whole-stack end-to-end test
scripts/dev.sh clean      # remove build output
```

`scripts/dev.sh` (repository-wide) is distinct from the `solwear` CLI (single app project).
Both are legitimate; use the right one.

---

## Orca worktrees — parallel agent work

Work runs in **isolated Orca git worktrees** so multiple agents proceed in parallel without
stepping on each other.

```
SolWear repository
  ↓  Orca
isolated git worktree  ──→  Claude / Codex  ──→  implementation → tests → diff → review → merge
```

### Conventions

- **One worktree per surface**, named for the area of work. Suggested names:
  - `solwear-sdk` — `sdk/runtime`, `sdk/cli`, `sdk/vscode`
  - `solwear-emulator` — `emulator/host`, `emulator/qemu`
  - `solwear-os` — `os/solweard`, `os/shell`
  - `solwear-firmware` — image/hardware-facing work (`image/`, HAL)
  - `solwear-security-review` — read-mostly review of the keystore/signing/capability/sandbox
- **Never let two agents modify the same worktree simultaneously.** One worktree = one active
  agent. Parallelism comes from *separate* worktrees on *separate* branches.
- **Run every command from your worktree directory.** Do not `cd` into the main checkout.
- **The git stash stack is shared** across worktrees. Do not use bare `git stash` / `git stash
  pop`; prefer a temporary WIP commit, or a uniquely-tagged `git stash push -u -m "<tag>"`.
- Each worktree gets its own branch (`<type>/<slug>` off `main`). Merge through a pull request
  after review, as usual.

### Why worktrees and not branches-in-place

Independent worktrees let the Architect review one surface while an Implementer builds
another, with independent build output (`dist/`, `target/`) and no lockstep on a single
working tree. It maps cleanly onto the role split above.

---

## Definition of "done" for an agent

A task is done when its Definition of Done (in the task file) is met **and**:

- `scripts/dev.sh build test lint` pass for the surfaces touched (or the specific CI checks
  in `CONTRIBUTING.md`).
- New behaviour has tests, including rejection tests for anything security-relevant.
- Public API / spec / docs changes travel in the same diff.
- The change is the smallest one that satisfies the task; unrelated cleanup was filed as new
  backlog items, not smuggled in.
- Outcomes are reported faithfully (failing tests are reported as failing).
