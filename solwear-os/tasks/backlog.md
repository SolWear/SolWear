# Backlog

Proposed, not-yet-started tasks. The human product owner adds and prioritises these. Use
[`TEMPLATE.md`](TEMPLATE.md). The first entry is a worked example of the format.

---

# SOLWEAR-001 — Implement a transaction approval abstraction

- **ID:** SOLWEAR-001
- **Title:** Implement a transaction approval abstraction
- **Status:** backlog
- **Owner:** unassigned
- **Worktree:** solwear-os
- **Security-gated:** yes

## Objective

Introduce a single, reusable "approval" abstraction in `solweard` that every
confirmation-requiring action (starting with `wallet.signTransaction`) routes through, so the
on-device confirmation flow is defined once, testable, and consistent across future
sensitive operations — instead of being special-cased per method.

## Context

Today `wallet.signTransaction` must always raise an on-device confirmation and must never sign
without an affirmative user action (spec §4.2, `docs/SECURITY.md`). As more sensitive
operations appear, we want one place that owns "ask the user, wait for an explicit yes/no,
time out safely, and record the result." This task does **not** change what signing does — it
factors out *how approval is requested and enforced*. Relevant code: `os/solweard/src/rpc.rs`,
`os/solweard/src/wallet.rs`, `os/solweard/src/state.rs`; shell prompt in `os/shell/`.

## Affected modules

- `os/solweard/src/` — new approval module + wiring `wallet.signTransaction` through it.
- `os/shell/` — the confirmation prompt talks to the abstraction (no visual redesign).
- `docs/ARCHITECTURE.md` / `docs/pages/*` — only if a public contract detail changes.

## Requirements

- An approval request carries: requesting `appId`, a human-readable summary of what is being
  approved, and the payload hash/context needed for the UI to show what the user signs.
- Signing proceeds **only** on an explicit affirmative user action; any other outcome
  (reject, timeout, disconnect) results in JSON-RPC `USER_REJECTED` and no signature.
- The private key is never exposed and never used before approval resolves affirmatively.
- No change to the JSON-RPC method names or params unless the spec is updated in the same diff.

## Constraints

- From `AGENTS.md`: never expose private keys; never bypass the confirmation; no silent public
  API change; preserve backwards compatibility; every HAL/UI path must work under `MockHal`.

## Dependencies

- None.

## Definition of Done

- [ ] `wallet.signTransaction` routes through the approval abstraction with identical external
      behaviour.
- [ ] `scripts/dev.sh build test lint` pass; `tests/e2e/run.sh` passes.
- [ ] No unrelated changes.

## Tests

- Unit: approval resolves on affirmative action → signature returned; reject/timeout/disconnect
  → `USER_REJECTED`, no signature, key never used.
- The existing e2e wallet-signature-through-confirmation path still passes, plus the refusal
  cases it already checks.

## Documentation requirements

- Update `docs/SECURITY.md` if the approval contract is worth stating there. Update
  `docs/ARCHITECTURE.md`/`docs/pages/json-rpc-api-reference.md` only if a public detail changes.

## Security considerations

- Security-gated: touches the keystore/signing path. Requires a Claude security review and a
  second human reviewer. Threat model: an app must not be able to obtain a signature without a
  fresh, explicit, correctly-scoped user approval; approvals must not be replayable or
  confusable between apps.
