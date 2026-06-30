# Souls Align

> For those who'd rather meet one worthy soul than a hundred strangers.

A premium dating & meaningful-connection web app that lets **the universe do the
screening** — matching people on who they innately are via a destiny-based
compatibility engine (Chinese Ba Zi, Western astrology, Chinese zodiac) rather
than augmented profiles. Structured, not mystical — a considered reading, never a
prophecy.

## Stack

- **Next.js 16** (App Router, React 19, TypeScript) + **Tailwind CSS v4**
- **Prisma** ORM — SQLite locally, **Supabase Postgres** in production
- **Owned auth** — email/password, hashed (bcrypt), JWT session cookies (jose)
- **Storage adapter** — local disk in dev, **Supabase Storage** in production
- **Anthropic API** — in-character AI chat for seeded profiles (server-side only)
- **Real ephemeris** — `circular-natal-horoscope-js` for genuine sun/moon/rising
- Installable **PWA** (manifest, icons, service worker); **PostHog** analytics

## Quick start

```bash
npm install
npm run db:reset     # SQLite schema + migrations
npm run db:seed      # 21 demo souls (committed portrait assets)
npm run dev          # http://localhost:3000
```

Demo logins use password `souls-demo-1234` — e.g. `seraphina@souls.demo`,
`adrian@souls.demo`, `kai@souls.demo`. Or create a fresh account to walk the full
onboarding + astrology flow.

## The matching engine

A 0–100 alignment score, blended ~34/33/33 and clamped to 70–99, then mapped to a
tier (**Destined / Kindred / Attuned / Spark**). Gender + connection preferences
gate **before** scoring. See `src/lib/` (`bazi.ts`, `astrology.ts`, `zodiac.ts`,
`matching.ts`, `tiers.ts`) and the in-app **Our Method** page.

## Project layout

```
src/
  app/            screens + route handlers (auth, onboarding, discover,
                  profile, match, chat, you, plans, method, safety, api/*)
  components/     orbit emblem, score ring, tier badge, avatar (w/ fallback)…
  lib/            destiny engine, auth, db, storage, ephemeris, discovery, chat
prisma/           schema, migrations, seed (+ portrait generator)
public/           icons, manifest, sw.js, seed/ portraits
```

## Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the local-first → Supabase + Vercel +
Anthropic + PostHog switch (env vars + one Prisma provider line).

## Notes

- Keep `ANTHROPIC_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` server-side only.
- Birth details lock permanently after verification (they anchor every alignment).
- Monetization is depth/accuracy/privacy only — never visibility or boosts.
