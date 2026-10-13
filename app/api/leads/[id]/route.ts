import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../lib/db";
import { discussions, leads } from "../../../lib/db/schema";
import type { DiscussionItem, LeadDetail } from "../../../lib/leads/types";
import { updateLeadSchema } from "../../../lib/leads/schemas";
import { getSessionUserId } from "../../../lib/auth/session";
import { serializeLead } from "../route";

type Ctx = { params: Promise<{ id: string }> };

function serializeDiscussion(row: typeof discussions.$inferSelect): DiscussionItem {
  return {
    id: row.id,
    note: row.note,
    followUpAt: row.followUpAt ? row.followUpAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

async function getOwnedLead(userId: string, id: string) {
  const rows = await getDb()
    .select()
    .from(leads)
    .where(and(eq(leads.id, id), eq(leads.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

const notFound = () =>
  NextResponse.json({ error: "Lead not found." }, { status: 404 });

// GET /api/leads/[id] -> { lead, discussions } (newest first)
export async function GET(_request: Request, { params }: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }
  const { id } = await params;

  let lead;
  try {
    lead = await getOwnedLead(userId, id);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "DB not configured." },
      { status: 503 }
    );
  }
  if (!lead) return notFound();

  const rows = await getDb()
    .select()
    .from(discussions)
    .where(eq(discussions.leadId, id))
    .orderBy(desc(discussions.createdAt));

  const body: LeadDetail = {
    lead: serializeLead(lead, {
      lastNote: rows[0]?.note ?? null,
      lastDiscussionAt: rows[0]?.createdAt ?? null,
    }),
    discussions: rows.map(serializeDiscussion),
  };
  return NextResponse.json(body);
}

// PATCH /api/leads/[id] { name?, company?, phone?, status?, nextFollowUpAt? }
export async function PATCH(request: Request, { params }: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = updateLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }
  const input = parsed.data;
  if (
    input.name == null &&
    input.company == null &&
    input.phone == null &&
    input.status == null &&
    input.nextFollowUpAt == null
  ) {
    return NextResponse.json(
      { error: "Provide at least one field to update." },
      { status: 400 }
    );
  }

  let followUp: Date | null | undefined;
  if (input.nextFollowUpAt != null) {
    const raw = input.nextFollowUpAt.trim();
    if (raw === "") {
      followUp = null;
    } else {
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json(
          { error: "The follow-up date is invalid." },
          { status: 400 }
        );
      }
      followUp = d;
    }
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

  const existing = await db
    .select({ id: leads.id })
    .from(leads)
    .where(and(eq(leads.id, id), eq(leads.userId, userId)))
    .limit(1);
  if (existing.length === 0) return notFound();

  const patch: Partial<typeof leads.$inferInsert> = {};
  if (input.name != null) patch.name = input.name.trim();
  if (input.company != null) patch.company = input.company.trim() || null;
  if (input.phone != null) patch.phone = input.phone.trim() || null;
  if (input.status != null) patch.status = input.status;
  if (followUp !== undefined) patch.nextFollowUpAt = followUp;

  const rows = await db
    .update(leads)
    .set(patch)
    .where(and(eq(leads.id, id), eq(leads.userId, userId)))
    .returning();
  const updated = rows[0];
  if (!updated) {
    return NextResponse.json({ error: "Could not update the lead." }, { status: 500 });
  }
  return NextResponse.json({ lead: serializeLead(updated) });
}
