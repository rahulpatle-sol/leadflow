import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let cached: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string."
    );
  }
  cached = drizzle(neon(url), { schema });
  return cached;
}

// Lazy proxy so importing { db } never throws at build time.
// Real connection is created on first query via getDb().
export const db: ReturnType<typeof getDb> = new Proxy({} as never, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
