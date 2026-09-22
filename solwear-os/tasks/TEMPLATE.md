# SOLWEAR-NNN — <short imperative title>

> Copy this block to create a task. Keep it small enough for one agent to finish independently.

- **ID:** SOLWEAR-NNN
- **Title:** <short imperative title>
- **Status:** backlog | active | completed
- **Owner:** <agent or human, e.g. Codex / worktree name>
- **Worktree:** <solwear-sdk | solwear-emulator | solwear-os | solwear-firmware | solwear-security-review>
- **Security-gated:** yes | no  <!-- yes if it touches keystore, signing, capability gate, or sandbox -->

## Objective

One or two sentences: what outcome this task produces and why it matters.

## Context

Links and background an implementer needs: the relevant part of `docs/ARCHITECTURE.md`, the
files/modules involved, prior decisions, related tasks. Assume the implementer starts cold.

## Affected modules

- `path/to/module` — what changes here
- `path/to/other` — what changes here

## Requirements

- Concrete, checkable requirements. What the code must do.
- Include the exact API/manifest/registry shape if a contract is involved.

## Constraints

- Rules this task must respect (from `AGENTS.md`): e.g. no key exposure, phone-optional,
  no new dependencies, no fixed screen sizes, backwards compatibility, no silent API changes.

## Dependencies

- Other SOLWEAR-NNN tasks or external prerequisites that must land first. "None" if independent.

## Definition of Done

- [ ] The requirements above are met.
- [ ] `scripts/dev.sh build test lint` pass for the surfaces touched.
- [ ] No unrelated changes; unrelated cleanup filed as new backlog items.

## Tests

- What tests are added/updated, and where. For security-relevant work, include the
  **rejection** cases (tampered/invalid input must be refused).

## Documentation requirements

- Which `docs/pages/*` and/or `docs/ARCHITECTURE.md` sections change. "None" only if the
  change is genuinely internal with no public surface.

## Security considerations

- Threat model notes. What could go wrong, what is trusted, what is not. If security-gated,
  name the review needed (Claude security review + second human reviewer).
