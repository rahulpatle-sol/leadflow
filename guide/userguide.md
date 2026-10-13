# LeadFlow — User Manual

LeadFlow is a lightweight CRM for sales reps: track leads, log every
discussion, and never miss a follow-up — all from one dashboard screen.

## 1. Getting started

### Create an account

1. Open the app and choose **Register**.
2. Enter your name, email, and a password (minimum 6 characters).
3. You land directly on your dashboard — no email confirmation needed.

### Sign in / sign out

- **Sign in** with your email + password on the login page.
- **Logout** is the button in the top-right header. Your session lasts 7 days
  on that browser; simply sign in again afterwards.

### Try the demo

A demo account (`demo@leadflow.app` / `LeadFlow123`) may be available on
shared deployments. It behaves exactly like a normal account.

## 2. Dashboard tour

The dashboard has three views, switched from the left sidebar. Your filters
and view live in the address bar, so the browser back button works and you
can bookmark or share a filtered view.

The **stat cards** on top always show: total leads, follow-ups due today,
overdue follow-ups, and your conversion rate (% of leads marked **Won**).

| View          | What it's for                                              |
| ------------- | ---------------------------------------------------------- |
| **Leads**     | Your pipeline: pinned follow-ups + searchable lead table   |
| **Follow-ups**| Only what needs action: due today and overdue              |
| **Analytics** | Monthly activity heatmap + recent discussion feed          |

You can also toggle **dark / light theme** from the header.

## 3. Managing leads

### Add a lead

1. In the **Leads** view, click **New lead** (top-right).
2. **Name** is required (at least 2 characters).
3. Optionally add **company**, **phone**, a starting **status**, and a
   **follow-up date**.
4. Click **Add lead**. It appears at the top of your table (newest first).

### Find a lead

- **Search** matches name, company, or phone as you type.
- **Status filter** shows one stage at a time (e.g. only `Qualified`).
- **Page size** switches between 10, 25, or 50 rows per page; use the
  pager at the bottom for more.

### Lead statuses

| Status           | Meaning                              |
| ---------------- | ------------------------------------ |
| `New`            | Just captured, not contacted yet     |
| `Contacted`      | First outreach done                  |
| `Qualified`      | Real opportunity, worth pursuing     |
| `Proposal sent`  | Pricing/proposal with the customer   |
| `Won`            | Deal closed 🎉 (leaves follow-up lists) |
| `Lost`           | Dead for now (leaves follow-up lists)   |

Change status anytime from the dropdown inside the timeline dialog.

## 4. Timeline dialog (notes + follow-ups)

Click any lead row to open its **timeline**:

- **History** — every discussion, newest first, each with its timestamp and
  any follow-up that was set with it.
- **Log a discussion** — type a note (up to 2000 characters) and press
  **Save Note**.
- **Set a follow-up** — tick **Set Follow-up**, pick a date + time, then save.
  The lead's next follow-up is updated automatically.
- **Clear a follow-up** — save a note without the follow-up box, or clear it
  via the lead update; the lead simply leaves the due lists.

Press `Esc` or click outside the dialog to close it.

## 5. Follow-ups view

This view shows only leads that need action:

- **Today's follow-ups** — pinned above everything in the Leads view too,
  each with its time and latest note.
- **Overdue** — follow-ups whose date has passed, highlighted so nothing
  slips through. Open the lead, log the outcome, set the next date.

A calm day with empty lists means you're fully caught up.

## 6. Analytics view

- **Monthly activity** — a GitHub-style heatmap of leads created per month
  over the last 12 months (darker = busier), with totals and a Less→More
  legend. Hover any cell for exact counts.
- **Recent activity** — your 8 newest discussion notes across all leads,
  each stamped with lead name and time.

## 7. A typical day with LeadFlow

1. Open **Follow-ups** — work the **Overdue** list first, then **Today**.
2. After each call, open the lead, **log the discussion**, set the **next
   follow-up date**.
3. Move the **status** forward (`New → Contacted → Qualified →
   Proposal sent → Won/Lost`).
4. Add fresh inbound leads with **New lead** the moment they arrive.
5. Friday: glance at **Analytics** to review the month.

## 8. FAQ & troubleshooting

**I can't sign in.** Double-check email/password spelling. Sessions expire
after 7 days — just sign in again.

**My lead/table is empty.** Clear the search box and reset the status filter
to *All statuses*.

**A follow-up isn't showing as due.** Check the date saved on the timeline —
only open leads (`Won`/`Lost` excluded) with a follow-up date of today
appear under Today; past dates appear under Overdue.

**Something failed to save.** Check your connection and retry; the app
retries reads automatically. If errors persist, note the message and contact
your workspace admin.

**Is my data private?** Yes — every lead and note belongs to your account
only. Other users cannot see, guess, or open your leads.
