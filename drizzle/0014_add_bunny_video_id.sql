-- Migration: Add bunny_video_id to videos table
-- Existing rows get NULL (they are legacy Cloudinary videos and still play fine)
-- New uploads will have this populated with the Bunny Stream GUID

ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS bunny_video_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS videos_bunny_video_id_idx ON videos (bunny_video_id);
