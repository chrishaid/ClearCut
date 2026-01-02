/**
 * Import passages.json and items.json into Supabase.
 * Usage:
 *   node scripts/importBank.mjs
 *
 * Required env vars:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const bankDir = path.join(process.cwd(), "content", "hsat_full_item_bank");
const passages = JSON.parse(fs.readFileSync(path.join(bankDir, "passages.json"), "utf8"));
const items = JSON.parse(fs.readFileSync(path.join(bankDir, "items.json"), "utf8"));

async function chunkedInsert(table, rows, chunkSize = 500) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) throw error;
    console.log(`Inserted ${Math.min(i + chunkSize, rows.length)} / ${rows.length} into ${table}`);
  }
}

async function main() {
  // Insert passages first
  await chunkedInsert("passages", passages, 250);

  // Insert items next
  await chunkedInsert("items", items, 500);

  console.log("✅ Import complete");
}

main().catch((e) => {
  console.error("Import failed:", e);
  process.exit(1);
});
