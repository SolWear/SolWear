# One remaining fix — needs root

The nginx Content-Security-Policy blocks Cloudflare Turnstile, so the captcha
cannot load and the server rejects every waitlist signup. This is almost
certainly why `notify_emails` has zero rows despite the site being live.

Turnstile needs three directives: `script-src`, `frame-src` and `connect-src`.

## Apply

```bash
sudo cp /etc/nginx/sites-available/solwear.tech \
        /etc/nginx/sites-available/solwear.tech.bak-$(date +%F)

sudo sed -i \
  -e "s#script-src 'self' 'unsafe-inline' https://www.googletagmanager.com#script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com#" \
  -e "s#connect-src 'self' https://api.x.com#connect-src 'self' https://challenges.cloudflare.com https://api.x.com#" \
  -e "s#frame-src 'self' https://www.youtube-nocookie.com#frame-src 'self' https://challenges.cloudflare.com https://www.youtube-nocookie.com#" \
  /etc/nginx/sites-available/solwear.tech

sudo nginx -t && sudo systemctl reload nginx
```

## Verify

```bash
curl -sI https://solwear.tech/ | grep -i content-security-policy
```

All three directives should now contain `https://challenges.cloudflare.com`.
Then load https://solwear.tech/#waitlist — the captcha widget should appear,
and a signup should succeed.

## If you would rather not touch nginx right now

Removing `TURNSTILE_SECRET_KEY` from `website/.env` and running
`docker compose up -d` makes the waitlist accept signups immediately, because
the app treats Turnstile as optional when no secret is configured. That trades
away bot protection on a public form, so the CSP fix is the better option.
