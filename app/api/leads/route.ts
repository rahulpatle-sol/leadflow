import { NextResponse } from "next/server";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  type SQL,
} from "drizzle-orm";
import { getDb } from "../../lib/db";
import { LEAD_STATUSES, discussions, leads, type Lead } from "../../lib/db/schema";
import type { LeadStatus } from "../../lib/db/schema";
import type { LeadItem, PaginatedLeads } from "../../lib/leads/types";
import { createLeadSchema } from "../../lib/leads/schemas";
import { getSessionUserId } from "../../lib/auth/session";

export function serializeLead(
  row: Lead,
  extra?: { lastNote?: string | null; lastDiscussionAt?: Date | null }
): LeadItem {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    phone: row.phone,
    status: row.status,
    nextFollowUpAt: row.nextFollowUpAt ? row.nextFollowUpAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    lastNote: extra?.lastNote ?? null,
    lastDiscussionAt: extra?.lastDiscussionAt
      ? extra.lastDiscussionAt.toISOString()
      : null,
  };
}

// GET /api/leads?page=2&pageSize=10&status=&q=
// -> { items, total, page, pageSize, totalPages }
export async function GET(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const rawSize = Number(url.searchParams.get("pageSize")) || 10;
  const pageSize = Math.min(50, Math.max(1, rawSize));
  const q = (url.searchParams.get("q") ?? "").trim();
  const statusParam = (url.searchParams.get("status") ?? "").trim();

  let status: LeadStatus | undefined;
  if (statusParam) {
    if (!(LEAD_STATUSES as readonly string[]).includes(statusParam)) {
      return NextResponse.json({ error: "Invalid status filter." }, { status: 400 });
    }
    status = statusParam as LeadStatus;
  }

  let db;
  try {
    db = getDb();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "DB not configured." },
      { status: 503 }
    );
  }

  const filters: SQL[] = [eq(leads.userId, userId)];
  if (status) filters.push(eq(leads.status, status));
  if (q) {
    const like = `%${q}%`;
    filters.push(
      or(
        ilike(leads.name, like),
        ilike(leads.company, like),
        ilike(leads.phone, like)
      )!
    );
  }
  const where = and(...filters)!;

  const [totalRows, rows] = await Promise.all([
    db.select({ n: count() }).from(leads).where(where),
    db
      .select()
      .from(leads)
      .where(where)
      .orderBy(desc(leads.createdAt), asc(leads.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
  ]);

  const total = totalRows[0]?.n ?? 0;

  // Latest discussion per lead on this page (one query, mapped in JS)
  const ids = rows.map((r) => r.id);
  const latestByLead = new Map<string, { note: string; createdAt: Date }>();
  if (ids.length > 0) {
    const notes = await db
      .select({
        leadId: discussions.leadId,
        note: discussions.note,
        createdAt: discussions.createdAt,
      })
      .from(discussions)
      .where(inArray(discussions.leadId, ids))
      .orderBy(desc(discussions.createdAt));
    for (const n of notes) {
      if (!latestByLead.has(n.leadId)) {
        latestByLead.set(n.leadId, { note: n.note, createdAt: n.createdAt });
      }
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const body: PaginatedLeads = {
    items: rows.map((r) => {
      const latest = latestByLead.get(r.id);
      return serializeLead(r, {
        lastNote: latest?.note ?? null,
        lastDiscussionAt: latest?.createdAt ?? null,
      });
    }),
    total,
    page,
    pageSize,
    totalPages,
  };
  return NextResponse.json(body);
}

// POST /api/leads { name, company?, phone?, status?, nextFollowUpAt? }
export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = createLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  let followUp: Date | null = null;
  const rawFollowUp = parsed.data.nextFollowUpAt?.trim();
  if (rawFollowUp) {
    const d = new Date(rawFollowUp);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json(
        { error: "The follow-up date is invalid." },
        { status: 400 }
      );
    }
    followUp = d;
  }

  let db;
  try {
    db = getDb();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "DB not configured." },
      { status: 503 }
    );
  }

  const rows = await db
    .insert(leads)
    .values({
      userId,
      name: parsed.data.name.trim(),
      company: parsed.data.company?.trim() || null,
      phone: parsed.data.phone?.trim() || null,
      status: parsed.data.status ?? "new",
      nextFollowUpAt: followUp,
    })
    .returning();
  const lead = rows[0];
  if (!lead) {
    return NextResponse.json({ error: "Could not create the lead." }, { status: 500 });
  }

  return NextResponse.json({ lead: serializeLead(lead) }, { status: 201 });
}
