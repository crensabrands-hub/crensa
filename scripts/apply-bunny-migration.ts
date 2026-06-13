/**
 * scripts/apply-bunny-migration.ts
 * Run once: npx tsx scripts/apply-bunny-migration.ts
 */

import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not set in .env.local");
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  console.log("🐰 Applying Bunny Stream migration...");

  try {
    await client.query(`
      ALTER TABLE videos
        ADD COLUMN IF NOT EXISTS bunny_video_id VARCHAR(255);
    `);
    console.log("✅ bunny_video_id column added (or already existed)");

    await client.query(`
      CREATE INDEX IF NOT EXISTS videos_bunny_video_id_idx
        ON videos (bunny_video_id);
    `);
    console.log("✅ Index created (or already existed)");

  } catch (err: any) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
