import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Auth error." },
      { status: 503 }
    );
  }
}
