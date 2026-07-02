# Deploying Souls Align

Souls Align runs on **PostgreSQL (Supabase)** in every environment. Moving to
production is only environment variables + wiring in real photo storage and the
Anthropic key — no schema or code changes.

---

## 0. Local development

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL + DIRECT_URL (Supabase) and AUTH_SECRET
npx prisma migrate deploy   # apply the schema to your Postgres
npm run db:seed             # 21 demo souls with committed portrait assets
npm run dev                 # http://localhost:3000
```

`DATABASE_URL` = Supabase transaction pooler (`:6543`, `?pgbouncer=true`);
`DIRECT_URL` = session pooler (`:5432`, used for migrations). All demo accounts
use the password `souls-demo-1234` (e.g. `seraphina@souls.demo`). AI chat uses a
graceful in-character fallback until you add an Anthropic key.

---

## 1. Production stack

| Concern   | Value                                   |
| --------- | --------------------------------------- |
| Hosting   | **Vercel**                              |
| Database  | **Supabase Postgres** (pooled + direct) |
| Photos    | **Supabase Storage**                    |
| AI chat   | **Anthropic API**                       |
| Analytics | **PostHog** (optional)                  |

---

## 2. Database — PostgreSQL (Supabase)

`prisma/schema.prisma` targets `postgresql` with `url = env("DATABASE_URL")`
(pooled, app runtime) and `directUrl = env("DIRECT_URL")` (direct, migrations).
There's one committed migration in `prisma/migrations/`.

On Vercel, the **`vercel-build`** script handles everything:

```
prisma generate && prisma migrate deploy && next build
```

Set-up:

1. Create a Supabase project. Copy **two** connection strings from
   Settings → Database → Connection string:
   - **Transaction pooler** (`:6543`) → append `?pgbouncer=true` → `DATABASE_URL`
   - **Session pooler** (`:5432`) → `DIRECT_URL`
   URL-encode special characters in the password.
2. In Vercel, set `DATABASE_URL` and `DIRECT_URL` (Production scope).
3. Deploy. `vercel-build` runs `prisma migrate deploy` (via `DIRECT_URL`),
   creating the tables. No manual migration step needed.
4. (Optional) Load the demo roster — from your machine with the same env vars:
   ```bash
   npm run db:seed
   ```

> Changing the schema later: edit `prisma/schema.prisma`, then
> `npx prisma migrate dev --name <change>` (or generate a new migration folder
> with `migrate diff`), and commit `prisma/migrations/`.

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
3. Build settings — **leave as default**. Vercel automatically runs the
   `vercel-build` script (derive Postgres schema → generate client →
   `prisma migrate deploy` → `next build`). Do not override the build command.
4. Required env vars (Production scope): `DATABASE_URL`, `AUTH_SECRET`,
   `ANTHROPIC_API_KEY`, `STORAGE_DRIVER=supabase`, `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`. **Do NOT** set
   `NEXT_PUBLIC_TEST_MODE`.
5. Deploy. Confirm:
   - [ ] Build log shows `prisma migrate deploy` applied the migration.
   - [ ] Photos upload AND load on the deployed URL (needs `STORAGE_DRIVER=supabase`).
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
