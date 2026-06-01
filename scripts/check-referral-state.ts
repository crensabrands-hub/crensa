import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log("=== Referral System DB Diagnostic ===\n");

  // 1. Check if Crensa user exists
  console.log("── 1. Crensa system user ──");
  const crensaUser = await sql`
    SELECT id, username, email, role, clerk_id
    FROM users
    WHERE username = 'crensa' OR clerk_id = 'system_crensa_platform'
  `;
  if (crensaUser.length === 0) {
    console.log("  ✗ NOT FOUND — seed script has not been run successfully");
  } else {
    console.log("  ✓ Found:", JSON.stringify(crensaUser[0], null, 2));
  }

  // 2. Check if Crensa creator_profile exists
  console.log("\n── 2. Crensa creator profile ──");
  if (crensaUser.length > 0) {
    const profile = await sql`
      SELECT id, display_name, referral_code
      FROM creator_profiles
      WHERE user_id = ${crensaUser[0].id}
    `;
    if (profile.length === 0) {
      console.log("  ✗ NOT FOUND — creator_profiles row missing");
    } else {
      console.log("  ✓ Found:", JSON.stringify(profile[0], null, 2));
    }
  } else {
    console.log("  ✗ Skipped — no Crensa user to check");
  }

  // 3. Check referrals table exists and row count
  console.log("\n── 3. Referrals table ──");
  try {
    const refCount = await sql`SELECT COUNT(*) as total FROM referrals`;
    console.log(`  Total referral rows: ${refCount[0].total}`);

    if (crensaUser.length > 0) {
      const crensaRefs = await sql`
        SELECT COUNT(*) as total FROM referrals WHERE referrer_id = ${crensaUser[0].id}
      `;
      console.log(`  Rows pointing to Crensa: ${crensaRefs[0].total}`);
    }
  } catch (e: any) {
    console.log("  ✗ referrals table may not exist:", e.message);
  }

  // 4. Count un-referred members (no row in referrals at all)
  console.log("\n── 4. Un-referred members ──");
  try {
    const unreferred = await sql`
      SELECT COUNT(*) as total
      FROM users u
      WHERE u.role = 'member'
        AND NOT EXISTS (
          SELECT 1 FROM referrals r WHERE r.referred_user_id = u.id
        )
    `;
    console.log(`  Members with NO referral record: ${unreferred[0].total}`);
  } catch (e: any) {
    console.log("  ✗ Error:", e.message);
  }

  // 5. All creators visible in the referral analytics query
  console.log("\n── 5. Creators visible in admin referral analytics ──");
  try {
    const creators = await sql`
      SELECT
        u.id,
        u.username,
        cp.display_name,
        cp.referral_code,
        COUNT(r.id) as total_referred
      FROM creator_profiles cp
      INNER JOIN users u ON cp.user_id = u.id
      LEFT JOIN referrals r ON r.referrer_id = u.id
      WHERE u.role = 'creator'
      GROUP BY u.id, u.username, cp.display_name, cp.referral_code
      ORDER BY total_referred DESC
    `;
    if (creators.length === 0) {
      console.log("  No creators found");
    } else {
      creators.forEach((c: any) => {
        console.log(`  ${c.display_name} (@${c.username}) — code: ${c.referral_code} — referred: ${c.total_referred}`);
      });
    }
  } catch (e: any) {
    console.log("  ✗ Error:", e.message);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Diagnostic failed:", err.message);
  process.exit(1);
});
