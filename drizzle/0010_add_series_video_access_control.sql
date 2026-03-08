-- Migration: Add access control to series videos
-- This allows creators to set individual video access types within a series

-- Add access_type column (free, paid, series-only)
ALTER TABLE "series_videos" 
ADD COLUMN "access_type" VARCHAR(20) DEFAULT 'series-only' NOT NULL;

-- Add individual_coin_price column for paid videos
ALTER TABLE "series_videos" 
ADD COLUMN "individual_coin_price" INTEGER DEFAULT 0;

-- Create index for access_type for better query performance
CREATE INDEX IF NOT EXISTS "series_videos_access_type_idx" ON "series_videos" ("access_type");

-- Add check constraint to ensure valid access types
ALTER TABLE "series_videos" 
ADD CONSTRAINT "series_videos_access_type_check" 
CHECK ("access_type" IN ('free', 'paid', 'series-only'));

-- Add check constraint to ensure paid videos have a price
ALTER TABLE "series_videos" 
ADD CONSTRAINT "series_videos_paid_price_check" 
CHECK (
  ("access_type" != 'paid') OR 
  ("access_type" = 'paid' AND "individual_coin_price" > 0)
);
