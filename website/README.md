# SolWear website

Next.js 15 (App Router) + SQLite. Self-hosted with Docker.

## Run

```bash
cp .env.local.example .env      # fill in real values
docker compose up -d --build
```

Dev: `npm install && npm run dev`.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Home — what SolWear is, the problem, the device, the ecosystem, waitlist |
| `/product/` | SolWear MK1 — design, technology, specifications, what's next |
| `/ecosystem/` | Device → OS → SDK → portal → apps, each with an honest status |
| `/community/` | Gated: Turnstile → X sign-in → waitlist state |
| `/community/board/` | Idea board for signed-in members |
| `/admin/` | Site settings, all site copy, waitlist, community, analytics, partners |

Legacy routes (`/pitch`, `/pinboard`, `/thanks`, `/achievements`, `/preview`) 308-redirect.

## Admin

Admin is whoever signs in with the X account matching `SOLWEAR_X_USER_ID`.
Sign in through `/community/` — the Turnstile gate applies to admins too.

Everything on the site is editable from `/admin/` without touching source:
site copy is one JSON document rendered as a form, so adding a field to
`src/lib/siteContent.ts` automatically produces an input for it.

**Coming-soon mode** is a toggle in the SITE tab. Visitors get the holding
page; signed-in admins still see the real site and the admin panel.

## Content honesty

`Status` tags (`AVAILABLE` / `IN DEVELOPMENT` / `PLANNED`) are part of the
content model. Anything not shipping today must carry one. The technology
claims on `/product/` are written to match `firmware/` — check there before
changing them.

## The cube system

`src/lib/cubes/` is one WebGL2 canvas shared by the whole site:

- a persistent background field of instanced cubes that never disappears
- an assembly system that detaches cubes to form a UI element, then releases
  them back into the field
- one pointer wave per idle→moving transition, driven from the frame loop
  rather than from the `pointermove` handler
- density adapts to viewport and device, and degrades further if frames are slow

**Copy is never hidden by the animation.** `Reveal` owns visibility as React
state and has its own IntersectionObserver safety net independent of the
renderer; the `cubes-active` class is only added by an inline script when
WebGL2 is present and reduced motion is off. With no JS, no WebGL, or a failed
hydration, all content is simply visible.

## Analytics

First-party and cookie-less: the server derives a daily-rotating hash from
IP + user agent. Page views, unique visitors, sources, waitlist conversions
and community sign-ins are visible in the admin ANALYTICS tab.
