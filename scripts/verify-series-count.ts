

import { db } from "../src/lib/database/connection";
import { sql } from "drizzle-orm";

async function verifySeriesCount() {
 console.log("🔍 Verifying Series Count Implementation\n");

 try {

 console.log("✓ Check 1: Verifying series_count column exists...");
 const columnCheck = await db.execute(sql`
 SELECT column_name, data_type, column_default
 FROM information_schema.columns
 WHERE table_name = 'creator_profiles'
 AND column_name = 'series_count'
 `);

 if (columnCheck.rows.length === 0) {
 console.log("❌ series_count column not found!");
 console.log(
 " Run: npm run ts-node scripts/apply-series-count-migration.ts\n"
 );
 return;
 }
 console.log("✅ Column exists:", columnCheck.rows[0]);
 console.log("");

 console.log("✓ Check 2: Verifying data consistency...");
 const consistencyCheck = await db.execute(sql`
 SELECT 
 cp.display_name,
 cp.series_count as stored_count,
 (SELECT COUNT(*) FROM series WHERE creator_id = cp.user_id AND is_active = true) as actual_count,
 CASE 
 WHEN cp.series_count = (SELECT COUNT(*) FROM series WHERE creator_id = cp.user_id AND is_active = true)
 THEN '✅ Match'
 ELSE '❌ Mismatch'
 END as status
 FROM creator_profiles cp
 LIMIT 10
 `);

 console.table(consistencyCheck.rows);

 const mismatches = consistencyCheck.rows.filter(
 (row: any) => row.status === "❌ Mismatch"
 );
 if (mismatches.length > 0) {
 console.log(
 `⚠️ Found ${mismatches.length} mismatches. Run recalculateAllSeriesCounts() to fix.\n`
 );
 } else {
 console.log("✅ All series counts are consistent!\n");
 }

 console.log("✓ Check 3: Testing analytics service...");
 const { creatorAnalyticsService } = await import(
 "../src/lib/services/creatorAnalyticsService"
 );

 const creatorWithSeries = await db.execute(sql`
 SELECT user_id, display_name, series_count
 FROM creator_profiles
 WHERE series_count > 0
 LIMIT 1
 `);

 if (creatorWithSeries.rows.length > 0) {
 const creator = creatorWithSeries.rows[0] as any;
 console.log(
 ` Testing with creator: ${creator.display_name} (${creator.series_count} series)`
 );

 const stats = await creatorAnalyticsService.getDashboardStats(
 creator.user_id
 );
 console.log(` Dashboard stats seriesCount: ${stats.seriesCount}`);

 if (stats.seriesCount === creator.series_count) {
 console.log("✅ Analytics service correctly returns series count!\n");
 } else {
 console.log(
 `❌ Mismatch: Expected ${creator.series_count}, got ${stats.seriesCount}\n`
 );
 }
 } else {
 console.log(
 "⚠️ No creators with series found. Create a series to test.\n"
 );
 }

 console.log("✓ Check 4: Summary Statistics");
 const summary = await db.execute(sql`
 SELECT 
 COUNT(*) as total_creators,
 SUM(series_count) as total_series,
 ROUND(AVG(series_count), 2) as avg_series_per_creator,
 MAX(series_count) as max_series,
 COUNT(CASE WHEN series_count > 0 THEN 1 END) as creators_with_series
 FROM creator_profiles
 `);

 console.table(summary.rows);

 console.log("\n✨ Verification complete!");
 console.log("📌 Summary:");
 console.log(" - Schema: ✅ series_count column exists");
 console.log(" - Data: Check consistency results above");
 console.log(" - Service: Check analytics service test above");
 console.log(
 " - Dashboard: Visit /creator/dashboard to see series count\n"
 );
 } catch (error) {
 console.error("❌ Verification failed:", error);
 throw error;
 }
}

verifySeriesCount()
 .then(() => {
 console.log("🎉 Done!");
 process.exit(0);
 })
 .catch((error) => {
 console.error("💥 Error:", error);
 process.exit(1);
 });
