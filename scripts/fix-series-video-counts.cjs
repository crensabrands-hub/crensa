/**
 * Fix Series Video Counts
 * Recalculates video counts and durations for all series
 */

const { Pool } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function fixSeriesVideoCounts() {
  console.log('🔧 Fixing series video counts...\n');

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Update all series with correct video counts and durations
    console.log('📊 Updating series video counts and durations...');
    const result = await pool.query(`
      UPDATE series
      SET 
        video_count = (
          SELECT COUNT(*)
          FROM videos
          WHERE videos.series_id = series.id
            AND videos.is_active = true
        ),
        total_duration = (
          SELECT COALESCE(SUM(duration), 0)
          FROM videos
          WHERE videos.series_id = series.id
            AND videos.is_active = true
        ),
        updated_at = NOW()
    `);
    console.log(`✅ Updated ${result.rowCount} series\n`);

    // Show results
    console.log('📋 Series with videos:');
    const verification = await pool.query(`
      SELECT 
        s.title,
        s.video_count,
        s.total_duration,
        (SELECT COUNT(*) FROM videos WHERE series_id = s.id AND is_active = true) as actual_count
      FROM series s
      WHERE s.video_count > 0 OR EXISTS (SELECT 1 FROM videos WHERE series_id = s.id)
      ORDER BY s.video_count DESC
    `);
    
    console.table(verification.rows);

    console.log('\n✨ Fix completed! Refresh your browser to see updated counts.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

fixSeriesVideoCounts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
