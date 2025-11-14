

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

import { db } from '../src/lib/database/connection.js';
import { sql } from 'drizzle-orm';

async function applySeriesCountMigration() {
 console.log('🚀 Starting series count migration...\n');

 try {

 console.log('📝 Step 1: Adding series_count column to creator_profiles...');
 await db.execute(sql`
 ALTER TABLE creator_profiles 
 ADD COLUMN IF NOT EXISTS series_count INTEGER DEFAULT 0 NOT NULL
 `);
 console.log('✅ Column added successfully\n');

 console.log('📊 Step 2: Backfilling series counts from series table...');
 const result = await db.execute(sql`
 UPDATE creator_profiles
 SET series_count = (
 SELECT COUNT(*)
 FROM series
 WHERE series.creator_id = creator_profiles.user_id
 AND series.is_active = true
 )
 `);
 console.log('✅ Series counts backfilled successfully\n');

 console.log('🔍 Step 3: Verifying migration...');
 const verification = await db.execute(sql`
 SELECT 
 COUNT(*) as total_creators,
 SUM(series_count) as total_series,
 AVG(series_count) as avg_series_per_creator,
 MAX(series_count) as max_series
 FROM creator_profiles
 `);
 
 console.log('📈 Migration Statistics:');
 console.log(verification.rows[0]);
 console.log('');

 console.log('📋 Sample creator profiles with series counts:');
 const sample = await db.execute(sql`
 SELECT 
 cp.display_name,
 cp.series_count,
 cp.video_count,
 u.username
 FROM creator_profiles cp
 JOIN users u ON u.id = cp.user_id
 ORDER BY cp.series_count DESC
 LIMIT 5
 `);
 
 console.table(sample.rows);

 console.log('\n✨ Migration completed successfully!');
 console.log('📌 Next steps:');
 console.log(' 1. Restart your development server');
 console.log(' 2. Check the creator dashboard to see series counts');
 console.log(' 3. Create a new series to verify auto-increment works\n');

 } catch (error) {
 console.error('❌ Migration failed:', error);
 throw error;
 }
}

applySeriesCountMigration()
 .then(() => {
 console.log('🎉 All done!');
 process.exit(0);
 })
 .catch((error) => {
 console.error('💥 Fatal error:', error);
 process.exit(1);
 });
