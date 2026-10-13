# LeadFlow — Developer Guide

How to set up, contribute to, and deploy LeadFlow.

## 1. Local setup

Prerequisites: Node.js 20+, npm, a Neon Postgres database (free tier works).

```bash
git clone https://github.com/rahulpatle-sol/leadflow.git 
cd leadflow
npm install
cp .env.example .env      # then fill in DATABASE_URL + AUTH_SECRET
npm run db:migrate        # apply SQL migrations
npm run db:seed           # demo user + 6 leads + discussions
npm run dev               # http://localhost:3000
```

Demo login after seeding: `demo@leadflow.app` / `LeadFlow123`.

Env vars (`DATABASE_URL`, `AUTH_SECRET` 32+ chars, optional
`SEED_EMAIL`/`SEED_PASSWORD`) are documented in `.env.example`.
Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 2. Scripts

| Script       | What it does                                              |
| ------------ | --------------------------------------------------------- |
| `npm run dev`          | Dev server with Turbopack                      |
| `npm run build`        | Production build (standalone output for Docker) |
| `npm run start`        | Serve the production build                     |
| `npm run lint`         | ESLint (Next core-web-vitals + TypeScript rules) |
| `npx tsc --noEmit`     | Typecheck without emitting                    |
| `npm run db:generate`  | Generate SQL migration from `app/lib/db/schema.ts` |
| `npm run db:migrate`   | Apply migrations via drizzle-kit (dev)        |
| `npm run db:studio`    | Drizzle Studio DB browser                     |
| `npm run db:seed`      | Seed demo data (`tsx scripts/seed.ts`, idempotent) |

Production/Docker migrations use `node scripts/migrate.mjs` instead — a
zero-dependency script that reads `drizzle/meta/_journal.json` and applies
pending `.sql` files (safe to re-run; "already exists" errors are ignored).

## 3. Project structure

```
app/
  page.tsx                    # landing
  auth/login | auth/register  # auth pages (client forms → API)
  dashboard/
    page.tsx / layout.tsx     # server shell + auth guard, providers
    components/               # sidebar, stat-cards, leads-table, followups,
                              # pinned-followups, monthly-chart, activity-feed,
                              # add-lead-dialog, timeline-dialog, status-pill, api.ts
  api/auth|leads|dashboard/   # Route Handlers — the entire API (see guide/apiguide.md)
  lib/auth/                   # scrypt passwords, JWT sessions (jose), zod schemas
  lib/db/                     # lazy drizzle client + schema (source of truth)
  lib/leads/                  # shared zod schemas + response types
  components/                 # theme-provider, theme-toggle, landing scene
scripts/seed.ts | migrate.mjs | generate_docs_diagrams.py
drizzle/                      # committed SQL migrations (never edit by hand)
docs/                         # architecture.png, dfd.png, schema.png
Dockerfile / render.yaml / .dockerignore
.github/workflows/           # CI (currently empty — see §7)
```

Key diagrams live in `docs/`. Regenerate them after structural changes:

```bash
python scripts/generate_docs_diagrams.py
```

## 4. Contributing

1. **Branch**: create a short branch from `main` (`feat/pinned-search`,
   `fix/overdue-timezone`). Never commit to `main` directly.
2. **Change**: keep PRs small and focused — one feature/fix per PR.
3. **Verify** (must all be green before pushing):
   ```bash
   npm run lint && npx tsc --noEmit && npm run build
   ```
4. **Commit**: imperative mood, scope prefix, e.g. `feat(leads): add status filter`,
   `fix(auth): clear session on logout`. Reference issue numbers when they exist.
5. **Push + PR**: describe what changed, how you tested it (seeded demo data
   + screenshots for UI changes), and any migration included.

## 5. Linting & formatting

- ESLint extends `eslint-config-next/core-web-vitals` + TypeScript rules
  (`eslint.config.mjs`). Run `npm run lint` and fix everything — CI treats
  warnings as failures on touched files.
- TypeScript is strict (`tsconfig.json`). No `any` in new code; prefer
  `unknown` + narrowing, and reuse the inferred types (`RegisterInput`,
  `CreateLeadInput`, `LeadItem`…) instead of redeclaring shapes.
- No Prettier config is committed — match surrounding style (2-space indent,
  double quotes, trailing commas, `~/` → `@/` imports for `app/`).

## 6. Best practices (repo conventions)

- **Validate at the boundary.** Every Route Handler parses input with a zod
  schema from `lib/auth/validation.ts` or `lib/leads/schemas.ts` and returns
  the first issue message as `{ error }` with `400`. Never trust client input.
- **Auth pattern.** Read the user with `getSessionUserId()` / `getCurrentUser()`
  first; unauthenticated → `401`. Scope every query with
  `eq(leads.userId, userId)` — foreign IDs must return `404`, never `403`
  (avoids leaking which IDs exist).
- **DB access.** Always go through `getDb()` (lazy, throws a clear error when
  `DATABASE_URL` is missing → map to `503`). Put tables/indexes in
  `lib/db/schema.ts`, then `db:generate` — never hand-edit `drizzle/*.sql`.
- **Client vs server.** Pages that need the session are server components;
  interactivity lives in `"use client"` components under
  `dashboard/components`. Data fetching uses TanStack Query (`api.ts`
  helpers, keys like `["leads", page, pageSize, status, q]`); invalidate
  `["leads"]` + `["dashboard","summary"]` after mutations.
- **URL as state.** Filters, pagination, and the active view live in search
  params so back-button and link-sharing work. Debounce search input (~400ms)
  before writing to the URL.
- **Errors & copy.** API errors are user-facing English strings. Toasts via
  `sonner`; loading skeletons for every query; empty states that tell the
  user what to do next.
- **Security basics.** Passwords are scrypt-hashed (never logged/returned —
  `toPublicUser` strips the hash). Sessions are `httpOnly` JWT cookies.
  Secrets only in env vars — `.env` is gitignored, `.env.example` holds no
  real values. Login errors stay generic to avoid user enumeration.

## 7. CI (GitHub Actions)

`.github/workflows/` is currently empty. Recommended minimal pipeline:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run build
        env:
          DATABASE_URL: postgresql://user:pass@localhost:5432/db
          AUTH_SECRET: ci-only-dummy-secret-32-chars-minimum
```

(Build is DB-independent — `getDb()` is lazy — so dummy env values suffice.)

## 8. Deployment strategies

The app is a standard Next.js Node server plus Neon Postgres. Any host that
runs Node 20 or Docker works. `render.yaml` (Docker Blueprint) is committed.

### Option A — Render (Docker) · recommended, free to start

- **Free tier**: Starter plan hosts the Docker web service; Neon has a free
  tier. Good for demos and low traffic (service sleeps/spins down on free).
- **Deploy**: push to GitHub → Dashboard → New → Blueprint → select repo →
  set `DATABASE_URL` + `AUTH_SECRET` → deploy. `preDeployCommand`
  (`node scripts/migrate.mjs`) runs migrations before every deploy;
  health checks hit `GET /`.
- **Scale up**: move to Starter/Standard (always-on, more RAM), add
  horizontal instances behind Render's load balancer, enable autoscaling.
  Scale Neon compute separately (autoscaling + read replicas). Nothing in
  the app needs to change — sessions are stateless JWT cookies.

### Option B — Vercel (serverless) · free Hobby tier

- **Free tier**: Hobby plan with generous serverless execution; connect the
  GitHub repo, set `DATABASE_URL` + `AUTH_SECRET`, deploy. preview
  deployments per PR are included.
- **Notes**: Route Handlers become serverless functions (cold starts are
  small here); `@neondatabase/serverless` uses HTTP so no connection-pool
  issues. Run `npm run db:migrate` from your machine against Neon on schema
  changes (or wire `migrate.mjs` into a post-deploy step).
- **Scale up**: Pro plan (more execution, concurrency, monitoring) → Fluid
  compute for spiky traffic; add Vercel Cron later for e.g. overdue digests.

### Option C — Railway (containers) · free trial, simple scaling

- **Free tier**: trial credit on signup; deploy the repo as a Docker service
  using the committed `Dockerfile`, add `DATABASE_URL` + `AUTH_SECRET` as
  variables, expose port `3000`. Add the pre-deploy/start command
  `node scripts/migrate.mjs; node server.js` is already the image `CMD`.
- **Scale up**: vertical (more vCPU/RAM per service) then horizontal replicas;
  Railway volumes aren't needed (state lives in Neon). Migrate to
  Railway's managed Postgres later only if you want to leave Neon.

### Scaling guidance (all platforms)

1. **Database first**: Neon autoscaling + indexes already cover the hot paths
   (`leads_user_idx`, `leads_next_follow_up_idx`,
   `discussions_lead_created_idx`). Watch slow queries before adding cache.
2. **Stateless app**: any number of instances is safe (JWT sessions, no local
   uploads). Prefer horizontal replicas over bigger boxes.
3. **Later needs**: rate-limit login/register (e.g. Upstash Redis), add
   Sentry-style error tracking, and move the seed/demo flow out of prod envs.
