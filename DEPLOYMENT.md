# Deploying Souls Align

Souls Align is built **local-first**: it runs immediately with zero cloud
accounts (SQLite + local photo storage + an in-character AI fallback). Moving to
production means swapping in real services. Nothing in the app code needs to
change beyond environment variables and one line in the Prisma schema.

---

## 0. Local development (no accounts needed)

```bash
npm install
npm run db:reset      # creates the SQLite db + runs migrations
npm run db:seed       # 21 demo souls with committed portrait assets
npm run dev           # http://localhost:3000
```

All demo accounts use the password `souls-demo-1234` (e.g. `seraphina@souls.demo`).
AI chat replies use a graceful in-character fallback until you add an Anthropic key.

---

## 1. Production stack

| Concern   | Local dev            | Production (recommended)        |
| --------- | -------------------- | ------------------------------- |
| Hosting   | `next dev`           | **Vercel**                      |
| Database  | SQLite (`dev.db`)    | **Supabase Postgres**           |
| Photos    | `./public/uploads`   | **Supabase Storage**            |
| AI chat   | in-character fallback| **Anthropic API**               |
| Analytics | off                  | **PostHog**                     |

---

## 2. Switch the database to Supabase Postgres

1. Create a Supabase project → copy the Postgres connection string
   (Project Settings → Database → Connection string → URI). Use the **pooled**
   connection (port 6543) for serverless on Vercel.
2. In `prisma/schema.prisma`, change the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"   // was "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
3. Set `DATABASE_URL` to the Supabase URI.
4. Create the schema in the new database:
   ```bash
   npx prisma migrate deploy   # applies prisma/migrations to Postgres
   npm run db:seed             # optional: load the demo roster
   ```

> The schema is portable (no native enums, no scalar arrays — strings + a
> JSON-encoded interests field), so SQLite → Postgres needs no other edits.

## 3. Switch photo storage to Supabase Storage

1. In Supabase → Storage, create a **public** bucket named `photos`.
2. Set environment variables:
   ```
   STORAGE_DRIVER=supabase
   SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=...        # Project Settings → API → service_role
   SUPABASE_STORAGE_BUCKET=photos
   ```
   The service role key is used **server-side only** (in `src/lib/storage.ts`).
   Never expose it to the client.
3. Re-run the seed if you want the demo portraits in object storage, or upload
   real photos through the app. Uploaded photo URLs are public bucket URLs that
   survive deploys (the local filesystem on Vercel is ephemeral — never use
   `STORAGE_DRIVER=local` in production).

## 4. Enable live AI chat (Anthropic)

```
ANTHROPIC_API_KEY=sk-ant-...
CHAT_MODEL=claude-haiku-4-5-20251001   # optional override
```

The key is read only in `src/app/api/chat/[id]/route.ts` (server-side). It is
**never** sent to the browser. Without it, chat uses the in-character fallback.

## 5. Analytics (PostHog)

```
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Analytics initialize only when the key is present.

## 6. Session secret

Generate a strong secret and set it in production:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```
AUTH_SECRET=<the generated value>
```

---

## 7. Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. Add **all** of the environment variables above in
   **Vercel → Project → Settings → Environment Variables** (Production scope —
   not just Preview/Development).
3. Build settings (defaults work):
   - Build command: `prisma generate && prisma migrate deploy && next build`
     (add `prisma migrate deploy` so the prod DB stays in sync), or run
     migrations manually.
   - Output: handled by Next.js automatically.
4. Deploy. Confirm:
   - [ ] Photos load on the deployed URL (not just dev).
   - [ ] The transition screen appears on every login and session restore.
   - [ ] `ANTHROPIC_API_KEY` is set in Production (test a chat reply).
   - [ ] `AUTH_SECRET` is a strong production value.
   - [ ] The app is installable (manifest + icons + service worker served).

---

## 8. Upgrade notes / future work

- **Payments:** `setPlan` in `src/app/plans/actions.ts` switches plans directly.
  Gate it behind Stripe Checkout for real billing.
- **Verification:** `src/app/api/verify/route.ts` accepts a selfie and grants the
  badge. Wire it to a liveness / face-match provider for production trust.
- **Ba Zi depth:** `src/lib/bazi.ts` uses the MVP year-element model. Upgrade to a
  full day-master (四柱) calculation without touching the matching engine.
