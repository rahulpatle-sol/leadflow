# LeadFlow

A single-screen lead management tool (lightweight CRM). A sales rep can track
leads, log every discussion, and set follow-up reminders — all from one
dashboard.

Built with **Next.js only** (App Router + Route Handlers act as the API).
White-and-blue minimal UI (Inter + Instrument Serif accent).

## Features

- **Lead list** — name, status badge, last discussion note, time-since-contact
- **Today's follow-ups pinned** above the list, outside pagination
- **Timeline dialog** — full discussion history (newest first), add-note form
  with optional follow-up date/time, status dropdown that persists
- **Add New Lead** — name required; company/phone optional; status defaults to New
- **Filters** — status filter, debounced search (name/company/phone), page size
- **Server-side pagination** — state lives in the URL (`?page=&status=&q=`),
  so the back button and link sharing work; `keepPreviousData` avoids flicker
- **Analytics** — GitHub-style contribution heatmap of monthly lead activity,
  conversion stats, recent-activity feed
- **Auth** — register/login/logout with JWT cookie sessions, per-user data scoping
- **Extras** — overdue follow-ups highlighted, seed script, dark/light theme

## Tech stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript ·
Tailwind CSS v4 · Drizzle ORM + Neon Postgres · TanStack Query v5 ·
Zod validation · date-fns · Sonner toasts · next-themes

## System architecture

![System architecture](docs/architecture.png)

## Data flow diagram (Level 1)

![Data flow diagram](docs/dfd.png)

## Database schema

![Database schema](docs/schema.png)

`lead_status` enum: `new · contacted · qualified · proposal_sent · won · lost`.
Deletes cascade `users → leads → discussions`. Diagrams are generated with
Pillow only — regenerate via `python scripts/generate_docs_diagrams.py`.

## Getting started (local)

### 1. Clone + install

```bash
git clone <your-repo-url> leadflow
cd leadflow
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

| Variable        | Required | Purpose                                |
| --------------- | -------- | -------------------------------------- |
| `DATABASE_URL`  | yes      | Neon Postgres connection string        |
| `AUTH_SECRET`   | yes      | 32+ char random string (JWT signing)   |
| `SEED_EMAIL`    | no       | Seed demo login (default below)        |
| `SEED_PASSWORD` | no       | Seed demo password (default below)     |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Database

```bash
npm run db:generate   # create a migration from the schema (already committed)
npm run db:migrate    # apply migrations to your database
npm run db:seed       # demo user + 6 leads + discussions (idempotent)
```

Demo login after seeding: `demo@leadflow.app` / `LeadFlow123`

### 4. Run

```bash
npm run dev            # http://localhost:3000
npm run build && npm start
```

## Docker (Alpine, small image)

The multi-stage `Dockerfile` uses `node:20-alpine` throughout and ships only
the Next.js standalone server — no dev dependencies, no source maps cruft.

```bash
# Build
docker build -t leadflow:latest .

# Run (migrations are applied automatically on start when DATABASE_URL is set)
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host/db?sslmode=require" \
  -e AUTH_SECRET="a-long-random-string-32-chars-minimum" \
  leadflow:latest
```

Check the image size:

```bash
docker images leadflow:latest
```

Useful notes:

- The container runs `node scripts/migrate.mjs` before `node server.js`.
  The script reads `drizzle/meta/_journal.json`, applies pending `.sql`
  files, and ignores "already exists" errors — safe to run on every start.
- Without `DATABASE_URL` the app still boots; API routes answer `503`
  until a database is configured.
- Seed a remote database from your machine (image carries no seed tooling):

```bash
DATABASE_URL="<neon-url>" npm run db:seed
```

## Deploy to Render (Docker)

Option A — Blueprint (recommended, `render.yaml` is committed):

1. Push this repo to GitHub.
2. Render Dashboard → **New → Blueprint** → select the repo.
3. Set `DATABASE_URL` (your Neon connection string) and `SEED_PASSWORD`
   (`AUTH_SECRET` is auto-generated). `preDeployCommand` runs migrations
   before every deploy.
4. Deploy. Health checks hit `GET /`.

Option B — manual Docker service:

1. Render Dashboard → **New → Web Service** → **Deploy an existing image**
   or point at the repo with **Runtime: Docker**.
2. Dockerfile path `./Dockerfile`, health check path `/`.
3. Add env vars `DATABASE_URL` and `AUTH_SECRET`, deploy.

To verify the deployment, open the Render URL, register an account, add a
lead, add a discussion note with a follow-up time, and confirm the lead
appears under Today's follow-ups and in Analytics.

## CI/CD (GitHub Actions)

`.github/workflows/ci.yml` runs on every push and pull request:

| Job      | What it does                                                        |
| -------- | ------------------------------------------------------------------- |
| `web`    | `npm ci` → ESLint → `tsc --noEmit` → `next build`                   |
| `docker` | Builds the Alpine image; pushes to GHCR (`ghcr.io/<repo>`) on `main` |
| `render` | Calls `RENDER_DEPLOY_HOOK` if the secret is set (optional)          |

Render can also auto-deploy straight from the repo (Docker runtime), in
which case CI is your quality gate and no hook is needed. To enable hook
deploys: Render service → Settings → Deploy Hook → copy the URL into a
`RENDER_DEPLOY_HOOK` GitHub secret.

## API (all JSON, correct status codes)

Auth — `POST /api/auth/register` (201) · `POST /api/auth/login` (200) ·
`POST /api/auth/logout` (200) · `GET /api/auth/me` (200/401)

Leads (login required, scoped to your user):

| Method  | Route                            | Success                        | Notes                                              |
| ------- | -------------------------------- | ------------------------------ | -------------------------------------------------- |
| `GET`   | `/api/leads?page=&pageSize=&status=&q=` | 200 `{ items, total, page, pageSize, totalPages }` | items carry `lastNote` + `lastDiscussionAt` |
| `POST`  | `/api/leads`                     | 201 `{ lead }`                 | name required                                      |
| `GET`   | `/api/leads/[id]`                | 200 `{ lead, discussions }`    | discussions newest-first                           |
| `PATCH` | `/api/leads/[id]`                | 200 `{ lead }`                 | partial update (status etc.)                       |
| `GET`   | `/api/leads/[id]/discussions`    | 200                            | newest-first                                       |
| `POST`  | `/api/leads/[id]/discussions`    | 201 `{ discussion, lead }`     | with `followUpAt`, also updates the lead           |
| `GET`   | `/api/dashboard/summary`         | 200                            | stats, monthly, activity, due-today, overdue       |

Error shape: `{ error: "message" }` — 400 validation · 401 unauthenticated ·
404 not found (also for other users' leads) · 503 DB/env misconfigured.

## Scripts

| Script                  | What                                     |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Dev server                               |
| `npm run build`         | Production build (standalone output)     |
| `npm run start`         | Serve the production build               |
| `npm run lint`          | ESLint                                   |
| `npm run db:generate`   | Drizzle migration from schema            |
| `npm run db:migrate`    | Apply migrations (dev, via drizzle-kit)  |
| `npm run db:studio`     | Drizzle Studio DB browser                |
| `npm run db:seed`       | Seed demo data (idempotent)              |
| `node scripts/migrate.mjs` | Apply migrations in production/Docker |
| `python scripts/generate_docs_diagrams.py` | Regenerate `docs/*.png`      |

## Project structure

```
app/
  page.tsx                    # landing
  auth/login|register/        # auth pages (client forms -> API)
  dashboard/                  # single-screen app (server shell + guard)
    components/               # sidebar, stats, chart, table, dialogs…
    layout.tsx                # QueryClient + Toaster providers
  api/auth|leads|dashboard/   # Route Handlers (the API)
  lib/auth/                   # scrypt passwords, JWT session, zod schemas
  lib/db/                     # drizzle client (lazy) + schema
  lib/leads/                  # shared API schemas + response types
scripts/
  seed.ts                     # demo data (6 leads + discussions)
  migrate.mjs                 # zero-dependency production migrations
  generate_docs_diagrams.py   # docs PNG generator (Pillow)
drizzle/                      # generated SQL migrations
docs/                         # architecture.png, schema.png, dfd.png
Dockerfile                    # multi-stage Alpine image (standalone)
render.yaml                   # Render Blueprint (Docker + preDeploy migrate)
.github/workflows/ci.yml      # lint, typecheck, build, docker push, deploy hook
```

## Submission checklist

- [ ] Public GitHub repo with meaningful commits
- [ ] `.env.example` complete (no secrets)
- [ ] `npm run build` green, `docker build` green
- [ ] Render URL live with migrations applied and demo data seeded
