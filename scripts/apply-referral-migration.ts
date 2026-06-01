import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

async function applyMigration() {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    console.log("Applying referral system migration...");

    // 1. Add referral_code column to creator_profiles
    const checkCol = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'creator_profiles'
      AND column_name = 'referral_code'
    `;

    if (checkCol.length === 0) {
      console.log("Adding referral_code column to creator_profiles...");
      await sql`
        ALTER TABLE creator_profiles
        ADD COLUMN referral_code VARCHAR(20)
      `;
      console.log("✓ referral_code column added");
    } else {
      console.log("✓ referral_code column already exists");
    }

    // 2. Backfill existing creators
    console.log("Backfilling referral codes for existing creators...");
    await sql`
      UPDATE creator_profiles
      SET referral_code = 'CRNS' || UPPER(SUBSTRING(MD5(id::text || RANDOM()::text), 1, 6))
      WHERE referral_code IS NULL
    `;
    console.log("✓ Existing creators backfilled");

    // 3. Add UNIQUE constraint if not present
    const checkUnique = await sql`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'creator_profiles'
      AND constraint_name = 'creator_profiles_referral_code_unique'
    `;

    if (checkUnique.length === 0) {
      console.log("Adding UNIQUE constraint on referral_code...");
      await sql`
        ALTER TABLE creator_profiles
        ADD CONSTRAINT creator_profiles_referral_code_unique UNIQUE (referral_code)
      `;
      console.log("✓ UNIQUE constraint added");
    } else {
      console.log("✓ UNIQUE constraint already exists");
    }

    // 4. Add NOT NULL constraint
    console.log("Setting referral_code NOT NULL...");
    await sql`
      ALTER TABLE creator_profiles
      ALTER COLUMN referral_code SET NOT NULL
    `;
    console.log("✓ NOT NULL set");

    // 5. Create referrals table
    console.log("Creating referrals table...");
    await sql`
      CREATE TABLE IF NOT EXISTS referrals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        referral_code VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'completed',
        reward_issued_at TIMESTAMP,
        reward_amount INTEGER,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        CONSTRAINT referrals_referred_user_unique UNIQUE (referred_user_id)
      )
    `;
    console.log("✓ referrals table ready");

    // 6. Indexes
    console.log("Creating indexes...");
    await sql`CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON referrals(referred_user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON referrals(referral_code)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_creator_profiles_referral_code ON creator_profiles(referral_code)`;
    console.log("✓ Indexes created");

    console.log("\n✅ Referral migration complete.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

applyMigration();
