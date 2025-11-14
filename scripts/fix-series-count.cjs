/**
 * Fix Series Count - Simple Node Script
 * Run with: node scripts/fix-series-count.js
 */

const { Pool } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function fixSeriesCount() {
  console.log('🚀 Starting series count fix...\n');

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Step 1: Add column if it doesn't exist
    console.log('📝 Step 1: Adding series_count column...');
    await pool.query(`
      ALTER TABLE creator_profiles 
      ADD COLUMN IF NOT EXISTS series_count INTEGER DEFAULT 0 NOT NULL
    `);
    console.log('✅ Column added\n');

    // Step 2: Backfill data
    console.log('📊 Step 2: Backfilling series counts...');
    const result = await pool.query(`
      UPDATE creator_profiles
      SET series_count = (
        SELECT COUNT(*)
        FROM series
        WHERE series.creator_id = creator_profiles.user_id
          AND series.is_active = true
      )
    `);
    console.log(`✅ Updated ${result.rowCount} creator profiles\n`);

    // Step 3: Verify
    console.log('🔍 Step 3: Verifying results...');
    const verification = await pool.query(`
      SELECT 
        display_name,
        series_count,
        video_count,
        (SELECT COUNT(*) FROM series WHERE creator_id = creator_profiles.user_id AND is_active = true) as actual_count
      FROM creator_profiles
      WHERE series_count > 0 OR video_count > 0
      ORDER BY series_count DESC
      LIMIT 5
    `);
    
    console.log('\n📋 Sample Results:');
    console.table(verification.rows);

    console.log('\n✨ Series count fix completed successfully!');
    console.log('📌 Refresh your dashboard to see the updated series count\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

fixSeriesCount()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
