// Production migration runner (zero extra dependencies).
//
// Reads drizzle/meta/_journal.json and applies each migration's SQL file,
// split on "--> statement-breakpoint" (the drizzle-kit convention).
// "Already exists" errors are ignored so the script is safe to re-run on
// every deploy / container start.
//
// Usage:
//   DATABASE_URL=postgresql://... node scripts/migrate.mjs
//
// Exits 0 with a warning when DATABASE_URL is not set.

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const url = process.env.DATABASE_URL;
if (!url) {
  console.warn("[migrate] DATABASE_URL is not set — skipping migrations.");
  process.exit(0);
}

const journalPath = join(root, "drizzle", "meta", "_journal.json");
if (!existsSync(journalPath)) {
  console.warn("[migrate] No drizzle journal found — nothing to apply.");
  process.exit(0);
}

const journal = JSON.parse(readFileSync(journalPath, "utf8"));
const entries = journal.entries ?? [];
const sql = neon(url);

// Postgres codes that mean "already applied, safe to ignore".
const IGNORED = new Set([
  "42P07", // duplicate_table
  "42710", // duplicate_object (types, constraints)
  "42P16", // invalid_table_definition (column already exists)
  "42701", // duplicate_column
]);

let applied = 0;
for (const entry of entries) {
  const file = join(root, "drizzle", `${entry.tag}.sql`);
  if (!existsSync(file)) {
    console.warn(`[migrate] Missing file for ${entry.tag}, skipping.`);
    continue;
  }
  const statements = readFileSync(file, "utf8")
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    try {
      await sql(statement);
      applied += 1;
    } catch (err) {
      const code = err?.code ?? err?.cause?.code;
      if (code && IGNORED.has(String(code))) continue;
      // Fallback: match common "already exists" messages.
      if (/already exists/i.test(err?.message ?? "")) continue;
      console.error(`[migrate] Failed on ${entry.tag}:`, err?.message ?? err);
      process.exit(1);
    }
  }
  console.log(`[migrate] ${entry.tag}: ok`);
}

console.log(`[migrate] Done. ${applied} statement(s) executed.`);
