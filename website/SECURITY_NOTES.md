# SolWear Website Security Notes

## May 2026 audit

- `npm audit --omit=dev` still reports the upstream PostCSS advisory through `next`'s bundled dependency range.
- The project pins `next` to `^15.5.18` and top-level `postcss` to `^8.5.14`; the remaining advisory is inside Next's dependency metadata and `npm audit fix --force` proposes a destructive downgrade to `next@9.3.3`.
- Server-only routes are excluded from GitHub Pages static export and are only built in Docker/server mode.
- Dynamic features require signed OAuth state cookies, httpOnly session cookies, input validation, rate limiting, and SQLite persistence under `SOLWEAR_DATA_DIR`.

Do not run `npm audit fix --force` on this app without reviewing the generated Next downgrade.
