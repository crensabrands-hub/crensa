-- Add series_count column to creator_profiles table
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS series_count INTEGER DEFAULT 0 NOT NULL;

-- Backfill series_count with actual counts from series table
UPDATE creator_profiles
SET series_count = (
  SELECT COUNT(*)
  FROM series
  WHERE series.creator_id = creator_profiles.user_id
    AND series.is_active = true
);

-- Verify the update
SELECT 
  display_name,
  series_count,
  video_count,
  (SELECT COUNT(*) FROM series WHERE creator_id = creator_profiles.user_id AND is_active = true) as actual_series_count
FROM creator_profiles
ORDER BY series_count DESC
LIMIT 10;
