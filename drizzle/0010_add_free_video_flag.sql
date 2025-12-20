-- Add isFree column to videos table for free video feature
ALTER TABLE "videos" ADD COLUMN "is_free" boolean DEFAULT false NOT NULL;

-- Add index for efficient querying of free videos
CREATE INDEX "videos_is_free_idx" ON "videos" ("is_free");
