# LeadFlow

A single-screen Lead Management tool (lightweight CRM) built for the PravarAI
fullstack intern assessment. A sales rep can track leads, log every discussion,
and set follow-up reminders — all from one dashboard.

Built with **Next.js only** (App Router + Route Handlers act as the API; no
separate FastAPI backend needed). AI assistance was used throughout development
(see [Use of AI](#use-of-ai)).

## Features (maps to the assessment rubric)

- **Lead list** — name, status badge, last discussion note, time-since-last-discussion
- **Today's follow-ups pinned** at the top of the Leads view (outside pagination)
- **Timeline dialog** — click any lead: full discussion history (newest first),
  add-note form with optional follow-up date+time, status dropdown that persists
- **Add New Lead** — name required; company/phone optional; status defaults to New
- **Filters** — status filter, debounced search (name/company/phone), page-size
- **Server-side pagination** — state lives in the URL (`?page=&status=&q=`), so
  back-button and link-sharing work; `keepPreviousData` avoids flicker
- **Bonus**: overdue follow-ups highlighted in red, search, seed script
- **Extras**: auth (register/login/logout, JWT cookie sessions), stats row,
  dotted monthly chart, recent-activity feed, dark/light theme

## Tech stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript ·
Tailwind CSS v4 · Drizzle ORM + Neon Postgres · TanStack Query v5 ·
Zod validation · date-fns · Sonner toasts · next-themes

## Setup

### 1. Clone + install

```bash
git clone <your-repo-url> leadflow
cd leadflow
npm install
```

### 2. Env

```bash
cp .env.example .env
```

| Variable       | Required | What                                 |
| -------------- | -------- | ------------------------------------ |
| `DATABASE_URL` | yes      | Neon Postgres connection string      |
| `AUTH_SECRET`  | yes      | 32+ char random string (JWT signing) |
| `SEED_EMAIL`   | no       | Seed demo login (default below)      |
| `SEED_PASSWORD`| no       | Seed demo password (default below)   |

Generate a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 3. Database

```bash
npm run db:generate   # create migration from schema (already committed)
npm run db:migrate    # apply to your database
npm run db:seed       # demo user + 6 leads + discussions (idempotent)
```

Demo login after seeding: `demo@leadflow.app` / `LeadFlow123`

### 4. Run

```bash
npm run dev      # http://localhost:3000
npm run build && npm start   # production
```

## Scripts

| Script            | What                              |
| ----------------- | --------------------------------- |
| `npm run dev`     | Dev server                        |
| `npm run build`   | Production build                  |
| `npm run lint`    | ESLint                            |
| `npm run db:generate` | Drizzle migration from schema |
| `npm run db:migrate`  | Apply migrations              |
| `npm run db:studio`   | Drizzle Studio DB browser     |
| `npm run db:seed`     | Seed demo data (idempotent)   |

## API (all JSON, correct status codes)

Auth — `POST /api/auth/register` (201) · `POST /api/auth/login` (200) ·
`POST /api/auth/logout` (200) · `GET /api/auth/me` (200/401)

Leads (require login, scoped to your user):

| Method | Route | Success | Notes |
| ------ | ----- | ------- | ----- |
| `GET`  | `/api/leads?page=&pageSize=&status=&q=` | 200 `{ items, total, page, pageSize, totalPages }` | items carry `lastNote` + `lastDiscussionAt` |
| `POST` | `/api/leads` | 201 `{ lead }` | name required |
| `GET`  | `/api/leads/[id]` | 200 `{ lead, discussions }` | discussions newest-first |
| `PATCH`| `/api/leads/[id]` | 200 `{ lead }` | partial update (status etc.) |
| `GET`  | `/api/leads/[id]/discussions` | 200 | newest-first |
| `POST` | `/api/leads/[id]/discussions` | 201 `{ discussion, lead }` | with `followUpAt`, also updates lead |
| `GET`  | `/api/dashboard/summary` | 200 | stats, monthly, activity, due-today, overdue |

Error shape: `{ error: "message" }` — 400 validation · 401 unauthenticated ·
404 not found (also for other users' leads) · 503 DB/env misconfigured.

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
scripts/seed.ts               # demo data (6 leads + discussions)
drizzle/                      # generated SQL migrations
```

## Screenshots / video

> TODO: add `docs/` screenshots of (1) lead list + pinned follow-ups,
> (2) timeline dialog, (3) add-lead dialog, and a short walkthrough video
> before submitting.

## Use of AI

Development was fast-tracked with an AI coding assistant (planning, boilerplate,
and review), as the brief recommends. Every file was read, tested (`tsc` +
`next build` green), and adjusted by hand; the final code and submission are
the author's own work.

## Submission checklist

- [ ] Public GitHub repo with meaningful commits
- [ ] `.env.example` complete (no secrets)
- [ ] `npm run build` green
- [ ] Screenshots/video recorded on seeded demo data
