import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../../lib/db";
import { discussions, leads } from "../../../../lib/db/schema";
import { createDiscussionSchema } from "../../../../lib/leads/schemas";
import { getSessionUserId } from "../../../../lib/auth/session";
import { serializeLead } from "../../route";

type Ctx = { params: Promise<{ id: string }> };

const notFound = () =>
  NextResponse.json({ error: "Lead nahi mila." }, { status: 404 });

// GET /api/leads/[id]/discussions -> { discussions } (newest first)
export async function GET(_request: Request, { params }: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in karo." }, { status: 401 });
  }
  const { id } = await params;

  let db;
  try {
    db = getDb();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "DB not configured." },
      { status: 503 }
    );
  }

  const owned = await db
    .select({ id: leads.id })
    .from(leads)
    .where(and(eq(leads.id, id), eq(leads.userId, userId)))
    .limit(1);
  if (owned.length === 0) return notFound();

  const rows = await db
    .select()
    .from(discussions)
    .where(eq(discussions.leadId, id))
    .orderBy(desc(discussions.createdAt));

  return NextResponse.json({
    discussions: rows.map((r) => ({
      id: r.id,
      note: r.note,
      followUpAt: r.followUpAt ? r.followUpAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}

// POST /api/leads/[id]/discussions { note, followUpAt? }
// Saving with a follow-up also updates the lead's follow-up field. -> 201
export async function POST(request: Request, { params }: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in karo." }, { status: 401 });
  }
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Valid JSON bhejo." }, { status: 400 });
  }

  const parsed = createDiscussionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  let followUp: Date | null = null;
  const rawFollowUp = parsed.data.followUpAt?.trim();
  if (rawFollowUp) {
    const d = new Date(rawFollowUp);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json(
        { error: "Follow-up date sahi nahi hai." },
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

  const owned = await db
    .select({ id: leads.id })
    .from(leads)
    .where(and(eq(leads.id, id), eq(leads.userId, userId)))
    .limit(1);
  if (owned.length === 0) return notFound();

  const inserted = await db
    .insert(discussions)
    .values({ leadId: id, note: parsed.data.note.trim(), followUpAt: followUp })
    .returning();
  const discussion = inserted[0];
  if (!discussion) {
    return NextResponse.json({ error: "Note save nahi hua." }, { status: 500 });
  }

  let leadRow = (
    await db.select().from(leads).where(eq(leads.id, id)).limit(1)
  )[0]!;
  if (followUp) {
    const updated = await db
      .update(leads)
      .set({ nextFollowUpAt: followUp })
      .where(and(eq(leads.id, id), eq(leads.userId, userId)))
      .returning();
    if (updated[0]) leadRow = updated[0];
  }

  return NextResponse.json(
    {
      discussion: {
        id: discussion.id,
        note: discussion.note,
        followUpAt: discussion.followUpAt
          ? discussion.followUpAt.toISOString()
          : null,
        createdAt: discussion.createdAt.toISOString(),
      },
      lead: serializeLead(leadRow, {
        lastNote: discussion.note,
        lastDiscussionAt: discussion.createdAt,
      }),
    },
    { status: 201 }
  );
}
