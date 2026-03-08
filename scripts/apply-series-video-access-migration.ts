import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from '@neondatabase/serverless';

async function applyMigration() {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    console.log('Applying series video access control migration...');

    // Check if columns already exist
    const checkColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'series_videos' 
      AND column_name IN ('access_type', 'individual_coin_price')
    `;

    const existingColumns = checkColumns.map(row => row.column_name);
    console.log('Existing columns:', existingColumns);

    // Add access_type column if it doesn't exist
    if (!existingColumns.includes('access_type')) {
      console.log('Adding access_type column...');
      await sql`
        ALTER TABLE "series_videos" 
        ADD COLUMN "access_type" VARCHAR(20) DEFAULT 'series-only' NOT NULL
      `;
      console.log('✓ access_type column added');
    } else {
      console.log('✓ access_type column already exists');
    }

    // Add individual_coin_price column if it doesn't exist
    if (!existingColumns.includes('individual_coin_price')) {
      console.log('Adding individual_coin_price column...');
      await sql`
        ALTER TABLE "series_videos" 
        ADD COLUMN "individual_coin_price" INTEGER DEFAULT 0
      `;
      console.log('✓ individual_coin_price column added');
    } else {
      console.log('✓ individual_coin_price column already exists');
    }

    // Fix any invalid access_type values before adding constraints
    console.log('Checking for invalid access_type values...');
    const invalidRows = await sql`
      SELECT id, access_type 
      FROM series_videos 
      WHERE access_type NOT IN ('free', 'paid', 'series-only')
    `;

    if (invalidRows.length > 0) {
      console.log(`Found ${invalidRows.length} rows with invalid access_type values`);
      console.log('Fixing invalid values...');
      await sql`
        UPDATE series_videos 
        SET access_type = 'series-only' 
        WHERE access_type NOT IN ('free', 'paid', 'series-only')
      `;
      console.log('✓ Invalid values fixed');
    } else {
      console.log('✓ No invalid access_type values found');
    }

    // Fix paid videos with 0 price
    console.log('Checking for paid videos with 0 price...');
    const paidWithZeroPrice = await sql`
      SELECT id, access_type, individual_coin_price 
      FROM series_videos 
      WHERE access_type = 'paid' AND (individual_coin_price IS NULL OR individual_coin_price = 0)
    `;

    if (paidWithZeroPrice.length > 0) {
      console.log(`Found ${paidWithZeroPrice.length} paid videos with 0 price`);
      console.log('Converting them to series-only...');
      await sql`
        UPDATE series_videos 
        SET access_type = 'series-only' 
        WHERE access_type = 'paid' AND (individual_coin_price IS NULL OR individual_coin_price = 0)
      `;
      console.log('✓ Paid videos with 0 price converted to series-only');
    } else {
      console.log('✓ No paid videos with 0 price found');
    }

    // Create index for access_type if it doesn't exist
    console.log('Creating access_type index...');
    await sql`
      CREATE INDEX IF NOT EXISTS "series_videos_access_type_idx" 
      ON "series_videos" ("access_type")
    `;
    console.log('✓ Index created');

    // Check if constraints exist before adding
    const checkConstraints = await sql`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'series_videos' 
      AND constraint_name IN ('series_videos_access_type_check', 'series_videos_paid_price_check')
    `;

    const existingConstraints = checkConstraints.map(row => row.constraint_name);

    // Add check constraint for valid access types
    if (!existingConstraints.includes('series_videos_access_type_check')) {
      console.log('Adding access_type check constraint...');
      await sql`
        ALTER TABLE "series_videos" 
        ADD CONSTRAINT "series_videos_access_type_check" 
        CHECK ("access_type" IN ('free', 'paid', 'series-only'))
      `;
      console.log('✓ access_type check constraint added');
    } else {
      console.log('✓ access_type check constraint already exists');
    }

    // Add check constraint for paid videos
    if (!existingConstraints.includes('series_videos_paid_price_check')) {
      console.log('Adding paid price check constraint...');
      await sql`
        ALTER TABLE "series_videos" 
        ADD CONSTRAINT "series_videos_paid_price_check" 
        CHECK (
          ("access_type" != 'paid') OR 
          ("access_type" = 'paid' AND "individual_coin_price" > 0)
        )
      `;
      console.log('✓ paid price check constraint added');
    } else {
      console.log('✓ paid price check constraint already exists');
    }

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
