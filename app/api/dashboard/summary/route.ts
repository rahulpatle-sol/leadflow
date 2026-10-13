import { NextResponse } from "next/server";
import { and, asc, count, desc, eq, gte, lt, lte, ne } from "drizzle-orm";
import { endOfDay, format, startOfDay, startOfMonth, subMonths } from "date-fns";
import { getDb } from "../../../lib/db";
import { discussions, leads } from "../../../lib/db/schema";
import type {
  DashboardSummary,
  LeadItem,
  MonthlyBucket,
} from "../../../lib/leads/types";
import { getSessionUserId } from "../../../lib/auth/session";
import { serializeLead } from "../../leads/route";

// GET /api/dashboard/summary
// One round trip for: stats, 12-month chart, recent activity,
// today's follow-ups (pinned) + overdue list.
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in karo." }, { status: 401 });
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

  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);
  const open = and(ne(leads.status, "won"), ne(leads.status, "lost"))!;

  const [
    totalRows,
    wonRows,
    dueTodayRows,
    overdueRows,
    createdRows,
    activityRows,
    dueTodayLeads,
    overdueLeads,
  ] = await Promise.all([
    db.select({ n: count() }).from(leads).where(eq(leads.userId, userId)),
    db
      .select({ n: count() })
      .from(leads)
      .where(and(eq(leads.userId, userId), eq(leads.status, "won"))),
    db
      .select({ n: count() })
      .from(leads)
      .where(
        and(
          eq(leads.userId, userId),
          open,
          gte(leads.nextFollowUpAt, dayStart),
          lte(leads.nextFollowUpAt, dayEnd)
        )
      ),
    db
      .select({ n: count() })
      .from(leads)
      .where(
        and(eq(leads.userId, userId), open, lt(leads.nextFollowUpAt, dayStart))
      ),
    db
      .select({ createdAt: leads.createdAt })
      .from(leads)
      .where(
        and(
          eq(leads.userId, userId),
          gte(leads.createdAt, startOfMonth(subMonths(now, 11)))
        )
      ),
    db
      .select({
        id: discussions.id,
        note: discussions.note,
        leadId: discussions.leadId,
        leadName: leads.name,
        createdAt: discussions.createdAt,
      })
      .from(discussions)
      .innerJoin(leads, eq(discussions.leadId, leads.id))
      .where(eq(leads.userId, userId))
      .orderBy(desc(discussions.createdAt))
      .limit(8),
    db
      .select()
      .from(leads)
      .where(
        and(
          eq(leads.userId, userId),
          open,
          gte(leads.nextFollowUpAt, dayStart),
          lte(leads.nextFollowUpAt, dayEnd)
        )
      )
      .orderBy(asc(leads.nextFollowUpAt))
      .limit(20),
    db
      .select()
      .from(leads)
      .where(
        and(eq(leads.userId, userId), open, lt(leads.nextFollowUpAt, dayStart))
      )
      .orderBy(asc(leads.nextFollowUpAt))
      .limit(20),
  ]);

  const total = totalRows[0]?.n ?? 0;
  const won = wonRows[0]?.n ?? 0;

  // Last 12 months, oldest -> newest
  const monthly: MonthlyBucket[] = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return {
      key: format(d, "yyyy-MM"),
      label: format(d, "MMM"),
      count: 0,
    };
  });
  const byKey = new Map(monthly.map((m) => [m.key, m]));
  for (const row of createdRows) {
    const key = format(row.createdAt, "yyyy-MM");
    const bucket = byKey.get(key);
    if (bucket) bucket.count += 1;
  }

  const toLead = (r: (typeof dueTodayLeads)[number]): LeadItem =>
    serializeLead(r);

  const body: DashboardSummary = {
    stats: {
      total,
      dueToday: dueTodayRows[0]?.n ?? 0,
      overdue: overdueRows[0]?.n ?? 0,
      conversionPct: total === 0 ? 0 : Math.round((won / total) * 1000) / 10,
    },
    monthly,
    recentActivity: activityRows.map((r) => ({
      id: r.id,
      note: r.note,
      leadId: r.leadId,
      leadName: r.leadName,
      createdAt: r.createdAt.toISOString(),
    })),
    dueToday: dueTodayLeads.map(toLead),
    overdue: overdueLeads.map(toLead),
  };
  return NextResponse.json(body);
}
