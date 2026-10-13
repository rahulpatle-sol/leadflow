import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "../../../lib/db";
import { users } from "../../../lib/db/schema";
import { hashPassword } from "../../../lib/auth/password";
import { setSessionCookie, toPublicUser } from "../../../lib/auth/session";
import { registerSchema } from "../../../lib/auth/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Valid JSON bhejo." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
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

  const { name, email, password } = parsed.data;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Ye email already registered hai. Sign in karo." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const rows = await db
    .insert(users)
    .values({ name: name.trim(), email, passwordHash })
    .returning();
  const user = rows[0];
  if (!user) {
    return NextResponse.json({ error: "Account nahi bana." }, { status: 500 });
  }

  try {
    await setSessionCookie(user.id);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Session error." },
      { status: 500 }
    );
  }

  return NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
}
