#!/usr/bin/env bash
#
# scripts/dev.sh — repository-wide developer/agent entry point for SolWear.
#
# There is no root npm workspace: each component is an independent package, and the
# authoritative build/test recipe lives in .github/workflows/ci.yml. This script mirrors that
# recipe so a human or a coding agent can clone the repo and run one command per intent.
#
# It only orchestrates commands that already exist in the tree. It invents nothing.
#
# Usage:
#   scripts/dev.sh doctor        Check the toolchain (delegates to `solwear doctor` when built)
#   scripts/dev.sh setup         Install Node deps + build in dependency order
#   scripts/dev.sh build         Build every component in dependency order
#   scripts/dev.sh test          Run every component's tests + registry + e2e
#   scripts/dev.sh lint          rustfmt --check, clippy -D warnings, tsc typechecks, hygiene
#   scripts/dev.sh emulator [..] Start the host emulator (extra args pass through)
#   scripts/dev.sh e2e           Run the whole-stack end-to-end test
#   scripts/dev.sh clean         Remove build output
#   scripts/dev.sh help          This message
#
set -euo pipefail

# Resolve the repository root from this script's location so it works from any cwd / worktree.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

DAEMON_MANIFEST="os/solweard/Cargo.toml"
export SOLWEAR_HAL="${SOLWEAR_HAL:-mock}"   # No component may require hardware to build or test.

# Node components in dependency order: sdk/runtime and sdk/cli first (apps invoke the built CLI,
# which resolves the built SDK), then everything else that has a package.json.
NODE_ORDERED=(
  sdk/runtime
  sdk/cli
  os/shell
  sdk/vscode
  emulator/host
  apps/watchface
  apps/signer
  apps/store
  apps/stats
  apps/games
  store/registry
  docs
)

log()  { printf '\033[1;36m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m warn:\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31merror:\033[0m %s\n' "$*" >&2; exit 1; }

have() { command -v "$1" >/dev/null 2>&1; }

# Run an npm script in a component only if that script is defined (mirrors `--if-present`).
npm_if_present() {
  local dir="$1" script="$2"
  [ -f "$dir/package.json" ] || return 0
  if node -e "process.exit(require('./$dir/package.json').scripts?.['$script']?0:1)" 2>/dev/null; then
    log "npm run $script  ($dir)"
    ( cd "$dir" && npm run "$script" )
  fi
}

npm_install_one() {
  local dir="$1"
  [ -f "$dir/package.json" ] || return 0
  if [ -f "$dir/package-lock.json" ]; then
    log "npm ci  ($dir)"
    ( cd "$dir" && npm ci )
  else
    warn "$dir has no package-lock.json; using npm install"
    ( cd "$dir" && npm install )
  fi
}

cmd_setup() {
  have node || die "node not found (need Node 22+). Run: scripts/dev.sh doctor"
  have cargo || warn "cargo not found; the Rust daemon will be skipped"
  for dir in "${NODE_ORDERED[@]}"; do
    npm_install_one "$dir"
    npm_if_present "$dir" build
  done
  if have cargo; then
    log "cargo build  ($DAEMON_MANIFEST)"
    cargo build --manifest-path "$DAEMON_MANIFEST" --locked
  fi
  log "setup complete"
}

cmd_build() {
  for dir in "${NODE_ORDERED[@]}"; do
    npm_if_present "$dir" build
  done
  if have cargo; then
    log "cargo build  ($DAEMON_MANIFEST)"
    cargo build --manifest-path "$DAEMON_MANIFEST" --locked --all-features
  else
    warn "cargo not found; skipping the daemon build"
  fi
}

cmd_test() {
  if have cargo; then
    log "cargo test  ($DAEMON_MANIFEST)"
    cargo test --manifest-path "$DAEMON_MANIFEST" --all-features
  else
    warn "cargo not found; skipping the daemon tests"
  fi
  for dir in "${NODE_ORDERED[@]}"; do
    npm_if_present "$dir" test
  done
  # The registry gate (its `test` script runs test.mjs; also validate the live index + packages).
  log "registry: validate + verify packages (offline)"
  node store/registry/validate.mjs
  node store/registry/verify-packages.mjs --offline
  cmd_e2e
}

cmd_lint() {
  if have cargo; then
    log "cargo fmt --check"
    cargo fmt --manifest-path "$DAEMON_MANIFEST" --all -- --check
    log "cargo clippy -D warnings"
    cargo clippy --manifest-path "$DAEMON_MANIFEST" --all-targets --all-features -- -D warnings
  else
    warn "cargo not found; skipping rustfmt/clippy"
  fi
  for dir in "${NODE_ORDERED[@]}"; do
    npm_if_present "$dir" lint
    npm_if_present "$dir" typecheck
  done
  # Repository hygiene (mirrors the CI `lint` job).
  log "hygiene: trailing whitespace"
  if git ls-files '*.json' '*.yml' '*.yaml' '*.mjs' '*.ts' '*.rs' '*.css' | xargs -r grep -n '[[:space:]]$'; then
    die "trailing whitespace found; see .editorconfig"
  fi
  log "hygiene: no committed signing keys"
  if git ls-files | grep -E '\.(pem|key|key\.json|p12|pfx)$' | grep -v '/testdata/'; then
    die "a key-shaped file is tracked; signing keys must never enter the repository"
  fi
  log "lint complete"
}

cmd_emulator() {
  [ -f emulator/host/package.json ] || die "emulator/host not found"
  log "starting host emulator (Ctrl-C to stop)"
  ( cd emulator/host && npm start -- "$@" )
}

cmd_e2e() {
  [ -x tests/e2e/run.sh ] || die "tests/e2e/run.sh not found or not executable"
  log "end-to-end test"
  tests/e2e/run.sh
}

cmd_doctor() {
  # Prefer the real CLI's doctor if it is built; otherwise do a minimal check and point at setup.
  if [ -f sdk/cli/dist/bin.js ]; then
    log "solwear doctor"
    node sdk/cli/dist/bin.js doctor "$@"
    return
  fi
  warn "sdk/cli is not built yet; running a minimal check. Build it with: scripts/dev.sh setup"
  local ok=1
  for tool in node cargo git; do
    if have "$tool"; then printf '  ok   %s: %s\n' "$tool" "$($tool --version 2>&1 | head -1)"; else printf '  MISS %s\n' "$tool"; ok=0; fi
  done
  have qemu-system-aarch64 && printf '  ok   qemu-system-aarch64\n' || printf '  warn qemu-system-aarch64 (optional; needed for solwear run --qemu)\n'
  [ "$ok" = 1 ] || die "missing required tools above"
}

cmd_clean() {
  for dir in "${NODE_ORDERED[@]}"; do
    npm_if_present "$dir" clean
  done
  have cargo && { log "cargo clean"; cargo clean --manifest-path "$DAEMON_MANIFEST"; } || true
}

usage() {
  cat <<'EOF'
scripts/dev.sh — repository-wide developer/agent entry point for SolWear.

Usage:
  scripts/dev.sh doctor        Check the toolchain (delegates to `solwear doctor` when built)
  scripts/dev.sh setup         Install Node deps + build in dependency order
  scripts/dev.sh build         Build every component in dependency order
  scripts/dev.sh test          Run every component's tests + registry + e2e
  scripts/dev.sh lint          rustfmt --check, clippy -D warnings, tsc typechecks, hygiene
  scripts/dev.sh emulator [..] Start the host emulator (extra args pass through)
  scripts/dev.sh e2e           Run the whole-stack end-to-end test
  scripts/dev.sh clean         Remove build output
  scripts/dev.sh help          This message
EOF
}

main() {
  local sub="${1:-help}"; shift || true
  case "$sub" in
    setup)    cmd_setup "$@" ;;
    build)    cmd_build "$@" ;;
    test)     cmd_test "$@" ;;
    lint)     cmd_lint "$@" ;;
    emulator) cmd_emulator "$@" ;;
    e2e)      cmd_e2e "$@" ;;
    doctor)   cmd_doctor "$@" ;;
    clean)    cmd_clean "$@" ;;
    help|-h|--help) usage ;;
    *) die "unknown command '$sub' (try: scripts/dev.sh help)" ;;
  esac
}

main "$@"
