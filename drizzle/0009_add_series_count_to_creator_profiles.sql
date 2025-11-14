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

-- Add comment for documentation
COMMENT ON COLUMN creator_profiles.series_count IS 'Total number of active series created by the creator';
