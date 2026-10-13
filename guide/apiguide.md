# LeadFlow — API Guide

All API routes are Next.js Route Handlers under `app/api`. Every route speaks
JSON. There is no separate backend server.

Base URL (local): `http://localhost:3000`

## Authentication

Auth is cookie-based. Register or login once and the browser sends the
`leadflow_session` JWT cookie automatically. For `fetch` from the app this is
default same-origin behavior; for cross-origin clients use
`credentials: "include"`.

All lead and dashboard routes require login and are **scoped to your user**:
requesting another user's lead ID returns `404`, never their data.

## Conventions

- Request and response bodies are JSON (`Content-Type: application/json`).
- Dates are ISO-8601 strings, e.g. `"2026-10-13T14:00:00.000Z"`.
- Errors always look like `{ "error": "message" }`.
- Lead status is one of: `new`, `contacted`, `qualified`, `proposal_sent`,
  `won`, `lost`.

| Status code | Meaning                                                        |
| ----------- | -------------------------------------------------------------- |
| `200`       | OK                                                             |
| `201`       | Created (register, new lead, new discussion)                   |
| `400`       | Validation failed (see `error` message)                        |
| `401`       | Not signed in, or wrong email/password on login                |
| `404`       | Lead not found (includes leads owned by other users)           |
| `409`       | Email already registered                                       |
| `500`       | Server failed to complete the operation                        |
| `503`       | Database / environment misconfigured (`DATABASE_URL`, secret)  |

## Data shapes

**LeadItem** (returned by lead routes):

```json
{
  "id": "uuid",
  "name": "Sarah Connor",
  "company": "Acme Corp",
  "phone": "555-0199",
  "status": "proposal_sent",
  "nextFollowUpAt": "2026-10-13T14:00:00.000Z",
  "createdAt": "2026-10-01T09:12:00.000Z",
  "lastNote": "Sent pricing tier PDF.",
  "lastDiscussionAt": "2026-10-11T16:40:00.000Z"
}
```

`company`, `phone`, `nextFollowUpAt`, `lastNote`, `lastDiscussionAt` are
nullable. List endpoints populate `lastNote` / `lastDiscussionAt` from the
newest discussion; create/update endpoints return them as `null` unless a
note was just saved.

**DiscussionItem**:

```json
{
  "id": "uuid",
  "note": "Demo went great, wants pricing.",
  "followUpAt": "2026-10-13T14:00:00.000Z",
  "createdAt": "2026-10-11T16:40:00.000Z"
}
```

**PublicUser**: `{ id, name, email, createdAt }` — the password hash is never
returned.

---

## Auth routes

### `POST /api/auth/register` — Create an account (→ `201`)

Body:

```json
{ "name": "Demo Rep", "email": "rep@company.com", "password": "secret123" }
```

Rules: name ≥ 2 chars · valid email (lowercased) · password 6–72 chars.
Sets the session cookie and returns `{ "user": PublicUser }`.
Duplicate email → `409 { "error": "This email is already registered..." }`.

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Rep","email":"rep@company.com","password":"secret123"}'
```

### `POST /api/auth/login` — Sign in (→ `200`)

Body: `{ "email": "rep@company.com", "password": "secret123" }`.
Sets the session cookie, returns `{ "user": PublicUser }`.
Wrong credentials → `401 { "error": "Incorrect email or password." }`
(generic on purpose — it never reveals whether the email exists).

### `POST /api/auth/logout` — Sign out (→ `200`)

No body. Clears the session cookie, returns `{ "ok": true }`.

### `GET /api/auth/me` — Current session user

- Signed in → `200 { "user": PublicUser }`
- Signed out → `401 { "user": null }`

---

## Lead routes (login required)

### `GET /api/leads` — List leads (paginated)

Query params (all optional):

| Param      | Default | Notes                                                    |
| ---------- | ------- | -------------------------------------------------------- |
| `page`     | `1`     | 1-based, clamped to ≥ 1                                  |
| `pageSize` | `10`    | Clamped to 1–50                                          |
| `status`   | —       | One of the six statuses; anything else → `400`           |
| `q`        | —       | Case-insensitive match on name, company, or phone        |

Sorted newest-first. Response:

```json
{
  "items": [ "/* LeadItem[], each with lastNote + lastDiscussionAt */" ],
  "total": 42,
  "page": 2,
  "pageSize": 10,
  "totalPages": 5
}
```

```bash
curl "http://localhost:3000/api/leads?page=1&pageSize=10&status=qualified&q=acme" \
  --cookie "leadflow_session=<token>"
```

### `POST /api/leads` — Create a lead (→ `201`)

Body:

```json
{
  "name": "Sarah Connor",
  "company": "Acme Corp",
  "phone": "555-0199",
  "status": "new",
  "nextFollowUpAt": "2026-10-13T14:00:00.000Z"
}
```

Only `name` is required (≥ 2 chars, ≤ 120). `company`/`phone` default to
`null`, `status` defaults to `"new"`, `nextFollowUpAt` defaults to `null`
(no follow-up). Returns `201 { "lead": LeadItem }`.

### `GET /api/leads/[id]` — Lead + full timeline (→ `200`)

Returns `{ "lead": LeadItem, "discussions": DiscussionItem[] }` with
discussions **newest-first**. Unknown ID or another user's lead → `404`.

### `PATCH /api/leads/[id]` — Update a lead (→ `200`)

Partial body — any of `name`, `company`, `phone`, `status`,
`nextFollowUpAt`. Empty body → `400`. To **clear** a follow-up, send
`"nextFollowUpAt": ""`. To clear company/phone, send `""` or `null`.
Returns `200 { "lead": LeadItem }`.

```bash
curl -X PATCH http://localhost:3000/api/leads/<id> \
  -H "Content-Type: application/json" \
  --cookie "leadflow_session=<token>" \
  -d '{"status":"qualified"}'
```

### `GET /api/leads/[id]/discussions` — Timeline only (→ `200`)

Returns `{ "discussions": DiscussionItem[] }`, newest-first. `404` for
unknown / foreign leads.

### `POST /api/leads/[id]/discussions` — Log a discussion (→ `201`)

Body:

```json
{ "note": "Sent pricing, follow up Thursday.", "followUpAt": "2026-10-16T10:00:00.000Z" }
```

`note` is required (1–2000 chars). `followUpAt` is optional — when present,
the lead's `nextFollowUpAt` is updated to the same value in the same call.
Returns `201 { "discussion": DiscussionItem, "lead": LeadItem }` where the
lead carries the new note as `lastNote`.

---

## Dashboard route (login required)

### `GET /api/dashboard/summary` — Everything for one screen (→ `200`)

One round trip that powers stats, charts, activity, and pinned lists:

```json
{
  "stats": { "total": 128, "dueToday": 5, "overdue": 2, "conversionPct": 12.5 },
  "monthly": [{ "key": "2025-11", "label": "Nov", "count": 9 }],
  "recentActivity": [{ "id": "...", "note": "...", "leadId": "...", "leadName": "...", "createdAt": "..." }],
  "dueToday": ["/* LeadItem[], max 20, oldest follow-up first */"],
  "overdue": ["/* LeadItem[], max 20, oldest follow-up first */"]
}
```

- `monthly`: last 12 months, oldest → newest.
- `conversionPct`: `%` of leads with status `won` (0 when empty).
- `dueToday` / `overdue` only include open leads (status is not `won`/`lost`)
  and carry each lead's latest note. `recentActivity` holds the 8 newest
  discussions across your leads.

## Quick test script

```bash
BASE=http://localhost:3000
curl -c jar.txt -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@leadflow.app","password":"LeadFlow123"}'
curl -b jar.txt -X POST $BASE/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Lead","company":"Test Co"}'
curl -b jar.txt $BASE/api/dashboard/summary | head -c 400
```
