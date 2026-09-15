# SolWear backend/auth/email/admin hardening report

Reviewed and tested 2026-09-13. No deployment was performed.

## X login

### Verified

The implemented flow is X OAuth 1.0a three-legged authentication:

1. `/api/community/gate/` verifies Turnstile and sets a signed, HttpOnly 30-minute gate cookie.
2. `/api/auth/x1/start/` obtains an X request token using `X_API_KEY` and `X_API_SECRET`, stores the request token and secret in a signed, HttpOnly, 10-minute cookie, and redirects to X.
3. `/api/auth/x1/callback/` requires the returned `oauth_token` to equal the cookie token, exchanges it with `oauth_verifier`, creates/updates the community user, and sets the signed session cookie.

OAuth 1.0a does not use PKCE. Its request-token secret plus the callback token match provide request binding. `X_CLIENT_ID` and `X_CLIENT_SECRET` are OAuth 2.0 credentials and are intentionally unused by these `/x1/` routes. The flow uses `SESSION_SECRET` for HMAC-signed gate, OAuth, session, and CSRF tokens. `SOLWEAR_X_USER_ID` is the sole admin identity.

The local configured API credentials successfully obtained a real request token from X and produced an X authorization redirect. A complete callback could not be performed without a human authenticating an X account.

### Fixed

- Corrected the configured callback from the nonexistent `/api/auth/x/callback/` to `/api/auth/x1/callback/` and made startup reject any other callback path.
- Verify `oauth_callback_confirmed=true`, callback token equality, and 10-minute request-cookie age.
- Added a server-checked 14-day expiry to signed sessions. Old copied cookies without an expiry are rejected.
- Recheck admin sessions against the current `SOLWEAR_X_USER_ID`, allowing immediate revocation by changing the environment value and restarting.
- Best-effort X avatar lookup; the signed-in community state displays avatar and handle, with sign-out.
- Posting and voting require a valid signed X session. Banned members cannot post or vote.
- Removed the false implication that OAuth proves the user follows SolWear; it authenticates identity only.
- Split the community gate and waitlist Turnstile widgets. The old client reused the gate token after Siteverify had consumed it, so the later waitlist call was guaranteed to fail as `timeout-or-duplicate`.
- Added a community-scoped widget hook that waits for conditionally rendered containers; the old one-shot hook could finish before the gate, waitlist, or board container mounted and never render a widget.

### Human checks

- In the X Developer Portal, enable OAuth 1.0a / 3-legged OAuth for a Web App and set App permissions to **Read** (the site does not need write or DM access).
- Set the exact callback/redirect URL to `https://solwear.tech/api/auth/x1/callback/`, including HTTPS, the `x1` path, and trailing slash.
- Set Website URL to `https://solwear.tech/`.
- Configure matching `X_API_KEY`, `X_API_SECRET`, and `X_CALLBACK_URL`; keep OAuth 2.0 client credentials only if another flow uses them.
- Set `SESSION_SECRET` to at least 32 random characters (64 hex characters recommended) and `SOLWEAR_X_USER_ID` to the numeric ID of the only admin account.
- Manually complete: community Turnstile -> Sign in with X -> X consent -> callback -> verify avatar/handle -> open board -> post/vote -> sign out. Confirm a non-admin cannot open `/admin/` and the configured admin can.

## Email

### Capture verified and fixed

`POST /api/waitlist/` validates and normalizes the address, rate-limits by IP, verifies Turnstile server-side, then calls `joinWaitlist`, which writes `notify_emails`. Email uniqueness is enforced by a unique index. The join is now transactional with `INSERT OR IGNORE`, so concurrent duplicate submissions return `created:false` instead of intermittently producing a 500. Source/referrer/handle lengths are bounded and all SQL values are parameterized.

Turnstile errors now distinguish:

- missing client token: 400 with “Complete the verification check first”;
- rejected/expired/duplicate token: 400 with a refresh instruction and logged Cloudflare error codes;
- missing production secret or Siteverify outage: 503, not a misleading validation error.

The observed live zero-row condition is upstream of SQLite and had two causes. First, the live CSP currently omits `https://challenges.cloudflare.com` from both `script-src` and `frame-src`, so the client cannot load/render Turnstile and cannot obtain a token. That CSP is owned by the parallel middleware job and was not edited here. Second, the community page reused the already-consumed gate token for waitlist signup; that client bug is fixed with a separate waitlist widget/token. Separately, the public site key must be paired with `TURNSTILE_SECRET_KEY`, and `solwear.tech` (plus `www.solwear.tech` if used) must be authorized in that widget's Cloudflare Hostname Management. A wrong hostname produces client error `110200`; a wrong key pair or expired/single-use token is rejected by Siteverify.

Required parallel-owner CSP change:

```text
script-src ... https://challenges.cloudflare.com
frame-src ... https://challenges.cloudflare.com
```

### Outbound added

There was no invoked outbound mailer. `src/lib/server/mail.ts` now provides a small provider interface with Resend and Postmark HTTP adapters. A newly created (not duplicate) signup triggers a subscriber confirmation and, when configured, an admin notification. It is inert unless `WAITLIST_EMAIL_ENABLED=1`. Delivery failure is logged but never rolls back a saved signup.

Configure one provider:

```dotenv
WAITLIST_EMAIL_ENABLED=1
MAIL_PROVIDER=resend
MAIL_FROM=SolWear <hello@updates.solwear.tech>
WAITLIST_ADMIN_EMAIL=developers@solwear.tech
RESEND_API_KEY=...
```

or:

```dotenv
WAITLIST_EMAIL_ENABLED=1
MAIL_PROVIDER=postmark
MAIL_FROM=SolWear <hello@updates.solwear.tech>
WAITLIST_ADMIN_EMAIL=developers@solwear.tech
POSTMARK_SERVER_TOKEN=...
POSTMARK_MESSAGE_STREAM=outbound
```

For DNS/deliverability, add and verify `updates.solwear.tech` in the selected provider, then copy the provider-generated DKIM and return-path/SPF records exactly. Do not add a second SPF TXT record to the same hostname; merge authorized senders if a hostname is shared. Publish DMARC at `_dmarc.solwear.tech`, initially `v=DMARC1; p=none; rua=mailto:dmarc@solwear.tech;`, ensure that reporting mailbox exists, verify SPF/DKIM/DMARC pass in received headers, then advance to `p=quarantine` and finally `p=reject`. The current public DNS has a root SPF record for Cloudflare Email Routing but no DMARC record was observed.

Before enabling the flag, send provider test messages to Gmail/Outlook, verify inbox placement and aligned SPF/DKIM/DMARC, configure bounce/complaint monitoring in the provider, and ensure the admin notification address can receive mail.

## Admin security

### Attack surface found

- Admin authentication is a signed X session whose user ID must equal `SOLWEAR_X_USER_ID`; database community roles do not grant panel access.
- Previously, the admin flag was trusted for the full browser cookie lifetime and the signed payload had no server expiry.
- Admin mutations had cookie authentication but no explicit Origin or CSRF validation.
- `/api/admin/pinboard/` also accepts `PINBOARD_ADMIN_TOKEN`; this is a separate bearer-token access path.
- Banned community accounts retained active posting/voting sessions.
- Vote mutations lacked same-origin validation, rate limits, and an approved-idea existence check.
- SQL injection exposure is low: queries use bound parameters; the achievement update builds column names only from a fixed allowlist.
- ID-based admin operations were authorization-gated; numeric validation was tightened for waitlist deletion. Public voting is now restricted to approved ideas.
- Admin data includes subscriber email addresses, so account or bearer-token compromise is a personal-data breach risk.

### Fixed

- Server-side session expiry and minimum 32-character session secret.
- Live admin-ID comparison on the page and every admin API.
- Signed per-session CSRF token plus strict same-origin scheme/host check on every admin mutation, including achievements.
- Admin mutation throttling (per admin/IP) and pinboard-admin throttling.
- Constant-time comparison for `PINBOARD_ADMIN_TOKEN`.
- Runtime enum validation for member role/status and stricter numeric IDs/offsets.
- Banned-user enforcement, vote rate limits, and approved-idea authorization.
- Logout requires same-origin POST.

### Prioritized remaining work

1. **Immediately:** rotate `SESSION_SECRET` and `PINBOARD_ADMIN_TOKEN` if they have ever been copied/logged; store them only in the deployment secret store. Use at least 256 bits of entropy. Remove `PINBOARD_ADMIN_TOKEN` entirely if no automation needs it.
2. **Immediately:** protect the admin X account with phishing-resistant 2FA/passkey/security keys. Keep X App permissions at Read only.
3. **High:** place `/admin/` and `/api/admin/*` behind Cloudflare Access with identity-provider MFA and, if operationally practical, an IP/device allowlist. This adds a control independent of X.
4. **High:** replace the in-memory rate limiter with a shared edge/Redis/Durable Object limiter before running multiple replicas; current limits are per process and reset on restart.
5. **High:** add durable audit logs for admin actor ID, action, target, timestamp, request ID, and source IP; ship append-only copies off-host and alert on role/status changes and bulk exports.
6. **High:** encrypt sensitive SQLite data/backups at rest, restrict `/data` permissions, automate encrypted backups, test restore, and define waitlist retention/deletion policy.
7. **Medium:** add CSP allowances required by Turnstile while keeping `frame-ancestors 'none'`; remove `'unsafe-inline'` from scripts through nonces/hashes when the parallel frontend work can support it.
8. **Medium:** add provider bounce/complaint webhooks and suppression handling before any large mail volume.
9. **Medium:** add integration tests for OAuth callback token mismatch/expiry, session expiry, admin CSRF/origin failures, banned users, concurrent waitlist dedupe, and Turnstile response classes.

## Verification record

- `npm install --ignore-scripts --no-audit --no-fund`: success. Native SQLite was intentionally skipped on Node 26.
- `npm rebuild better-sqlite3` on Node 26: expected failure because the installed native addon does not support Node 26's V8 API.
- Rebuilt `better-sqlite3` under Node 20.20.2, matching Docker: success.
- Local Node 20 API checks: first normalized waitlist insert returned `created:true`; case/whitespace duplicate returned `created:false`; unauthenticated admin returned 403; unauthenticated vote returned 401; logout without Origin returned 403 and same-origin logout returned 200; real X request-token initiation returned a 307 X authorization URL; forged callback without the signed OAuth cookie returned a state failure.
- Synthetic signed-admin local checks: read returned 200; mutation without Origin returned 403; mutation without CSRF returned 403; valid Origin+CSRF reached request validation (400 for intentionally missing settings).
- Production-mode missing-secret test returned 503 with `Verification is temporarily unavailable.` before any database write.
- Live read-only checks: `/api/config/` reports both Turnstile sides configured; auth start without a gate pass fails closed; callback without state fails closed; invalid email is rejected; invalid Turnstile token is rejected. Live CSP confirms the Turnstile origin omissions described above.
- `npm run build`: exit 0 on Next.js 15.5.15, 34/34 static pages generated, all API/community/admin routes compiled and type-checked.
