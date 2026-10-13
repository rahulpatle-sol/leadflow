import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "../../../lib/db";
import { users } from "../../../lib/db/schema";
import { verifyPassword } from "../../../lib/auth/password";
import { setSessionCookie, toPublicUser } from "../../../lib/auth/session";
import { loginSchema } from "../../../lib/auth/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
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

  const { email, password } = parsed.data;
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const user = rows[0];

  const invalid = NextResponse.json(
    { error: "Incorrect email or password." },
    { status: 401 }
  );
  if (!user) return invalid;

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return invalid;

  try {
    await setSessionCookie(user.id);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Session error." },
      { status: 500 }
    );
  }

  return NextResponse.json({ user: toPublicUser(user) });
}
