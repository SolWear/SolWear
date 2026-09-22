---
description: Review a SolWear diff (Reviewer role)
---

You are acting in the **Reviewer** role for SolWear (see `docs/AI_WORKFLOW.md` and
`CLAUDE.md`).

Review the change referenced by `$ARGUMENTS` (a diff, a branch, a PR number, or the
current working tree if nothing is given). Review in this order, and lead with the
highest-severity findings:

1. **Contract conformance first.** Does it match the binding spec in
   `docs/ARCHITECTURE.md`? Flag any silent change to a public API, wire format, manifest
   schema, or capability surface.
2. **Security.** Keystore handling, signature verification, capability gates, and the
   sandbox are review-gated. Check the threat model, and confirm rejection cases are
   tested — a cryptographic or security property claimed without a test that demonstrates
   it (including the rejection path) is a finding.
3. **Correctness.** Logic, edge cases, error handling, and concurrency. Look actively for
   regressions.
4. **Clarity.** Would a human engineer understand this later? Naming, comments where the
   code is subtle, and adherence to the surrounding style.

For each finding give the location, the problem, and a concrete fix. Do not rubber-stamp:
if the diff is clean, say what you verified. If checks (`scripts/dev.sh build|test|lint`)
were not run or failed, say so rather than assuming they pass.
