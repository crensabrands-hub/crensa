-- Migration: Add watch_sessions table for real watch time tracking

CREATE TABLE IF NOT EXISTS watch_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  -- user_id is nullable — anonymous/unauthenticated views still count
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  -- How many seconds the user actually watched in this session
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  -- True if the video played to the end
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_watch_sessions_video_id ON watch_sessions(video_id);
CREATE INDEX IF NOT EXISTS idx_watch_sessions_user_id ON watch_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_sessions_created_at ON watch_sessions(created_at DESC);
