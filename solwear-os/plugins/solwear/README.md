# SolWear plugin for Claude Code

Tools for building on SolWear OS and contributing to the monorepo.

## Install

```
/plugin marketplace add SolWear/SolWear_OS
/plugin install solwear
```

## What it provides

- **Skill `build-a-solwear-app`** — the app developer loop for SolWear OS:
  scaffold, build, run in the host emulator, package to `.swa`, sign, and
  publish to the store, all through the published `@solwear/cli`. Claude loads
  it automatically when you ask to build, run, or publish a SolWear app.
- **`/solwear:task`** — act as the Architect: analyse a task and produce a
  scoped `tasks/` unit (used inside the SolWear monorepo).
- **`/solwear:review`** — act as the Reviewer: review a diff for contract
  conformance, security, correctness, and clarity.

The commands assume the SolWear monorepo; the skill only needs
`npm install --global @solwear/cli`.

See https://docs.solwear.tech for the full platform documentation.
