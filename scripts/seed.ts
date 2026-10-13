// Seed script: demo user + 6 leads + discussions.
// Usage: npm run db:seed
// Needs DATABASE_URL in .env. Re-running wipes + reseeds the demo user.
import "dotenv/config";
import { eq } from "drizzle-orm";
import { getDb } from "../app/lib/db";
import { discussions, leads, users } from "../app/lib/db/schema";
import { hashPassword } from "../app/lib/auth/password";

const EMAIL = process.env.SEED_EMAIL ?? "demo@leadflow.app";
const PASSWORD = process.env.SEED_PASSWORD ?? "LeadFlow123";

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000);
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000);
const atTime = (dayOffset: number, h: number, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d;
};

async function main() {
  const db = getDb();

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, EMAIL))
    .limit(1);
  if (existing[0]) {
    await db.delete(users).where(eq(users.id, existing[0].id));
    console.log(`Removed old seed data for ${EMAIL}`);
  }

  const [user] = await db
    .insert(users)
    .values({
      name: "Demo Rep",
      email: EMAIL,
      passwordHash: await hashPassword(PASSWORD),
    })
    .returning();
  if (!user) throw new Error("Could not create the demo user.");
  console.log(`Demo user: ${EMAIL}`);

  const seed: {
    name: string;
    company: string | null;
    phone: string | null;
    status: (typeof leads.$inferInsert)["status"];
    nextFollowUpAt: Date | null;
    notes: { note: string; createdAt: Date; followUpAt?: Date }[];
  }[] = [
    {
      name: "Sarah Connor",
      company: "Acme Corp",
      phone: "555-0199",
      status: "proposal_sent",
      nextFollowUpAt: atTime(0, 14),
      notes: [
        { note: "Lead created via web form.", createdAt: daysAgo(6) },
        {
          note: "Initial discovery call. They need a CRM for 50 reps. Pain points include dropping leads and no follow-up tracking.",
          createdAt: daysAgo(5),
        },
        {
          note: "Sent pricing tier PDF. Said she would review with her boss.",
          createdAt: daysAgo(2),
          followUpAt: atTime(0, 14),
        },
      ],
    },
    {
      name: "Hank Scorpio",
      company: "Globex",
      phone: null,
      status: "new",
      nextFollowUpAt: null,
      notes: [
        { note: "Inbound lead from website contact form.", createdAt: hoursAgo(2) },
      ],
    },
    {
      name: "Bill Lumbergh",
      company: "Initech",
      phone: "555-0123",
      status: "contacted",
      nextFollowUpAt: null,
      notes: [
        { note: "Left a voicemail with his assistant.", createdAt: daysAgo(7) },
      ],
    },
    {
      name: "Bruce Wayne",
      company: "Wayne Ent",
      phone: "555-0100",
      status: "won",
      nextFollowUpAt: null,
      notes: [
        { note: "Contract signed! Sending welcome package.", createdAt: daysAgo(21) },
      ],
    },
    {
      name: "Diana Prince",
      company: "Themyscira Ltd",
      phone: "555-0177",
      status: "qualified",
      nextFollowUpAt: atTime(-1, 16),
      notes: [
        {
          note: "Demo done. Team loved the follow-up reminders.",
          createdAt: daysAgo(3),
        },
        {
          note: "Asked for a security questionnaire. Sending today.",
          createdAt: daysAgo(1),
          followUpAt: atTime(-1, 16),
        },
      ],
    },
    {
      name: "Clark Kent",
      company: "Daily Planet",
      phone: null,
      status: "lost",
      nextFollowUpAt: null,
      notes: [
        { note: "Budget freeze this quarter. Revisit in 6 months.", createdAt: daysAgo(10) },
      ],
    },
  ];

  for (const l of seed) {
    const [row] = await db
      .insert(leads)
      .values({
        userId: user.id,
        name: l.name,
        company: l.company,
        phone: l.phone,
        status: l.status,
        nextFollowUpAt: l.nextFollowUpAt,
      })
      .returning();
    if (!row) throw new Error(`Could not create lead: ${l.name}`);
    for (const n of l.notes) {
      await db.insert(discussions).values({
        leadId: row.id,
        note: n.note,
        createdAt: n.createdAt,
        followUpAt: n.followUpAt ?? null,
      });
    }
    console.log(`  + ${l.name} (${l.notes.length} notes)`);
  }

  console.log("\nSeed done. Login with:");
  console.log(`  Email:    ${EMAIL}`);
  console.log(`  Password: ${PASSWORD}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
