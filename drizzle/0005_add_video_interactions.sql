-- Migration: Add video interaction tables
-- This migration adds tables for video likes, saves, comments, and creator follows

-- Video likes table
CREATE TABLE IF NOT EXISTS "video_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"video_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Video saves table
CREATE TABLE IF NOT EXISTS "video_saves" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"video_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Video comments table
CREATE TABLE IF NOT EXISTS "video_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"video_id" uuid NOT NULL,
	"content" text NOT NULL,
	"parent_id" uuid,
	"is_edited" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Creator follows table
CREATE TABLE IF NOT EXISTS "creator_follows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "video_likes" ADD CONSTRAINT "video_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "video_likes" ADD CONSTRAINT "video_likes_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "video_saves" ADD CONSTRAINT "video_saves_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "video_saves" ADD CONSTRAINT "video_saves_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "video_comments" ADD CONSTRAINT "video_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "video_comments" ADD CONSTRAINT "video_comments_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "video_comments" ADD CONSTRAINT "video_comments_parent_id_video_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "video_comments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "creator_follows" ADD CONSTRAINT "creator_follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "creator_follows" ADD CONSTRAINT "creator_follows_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS "video_likes_user_id_idx" ON "video_likes" ("user_id");
CREATE INDEX IF NOT EXISTS "video_likes_video_id_idx" ON "video_likes" ("video_id");
CREATE UNIQUE INDEX IF NOT EXISTS "video_likes_user_video_unique" ON "video_likes" ("user_id","video_id");

CREATE INDEX IF NOT EXISTS "video_saves_user_id_idx" ON "video_saves" ("user_id");
CREATE INDEX IF NOT EXISTS "video_saves_video_id_idx" ON "video_saves" ("video_id");
CREATE UNIQUE INDEX IF NOT EXISTS "video_saves_user_video_unique" ON "video_saves" ("user_id","video_id");

CREATE INDEX IF NOT EXISTS "video_comments_user_id_idx" ON "video_comments" ("user_id");
CREATE INDEX IF NOT EXISTS "video_comments_video_id_idx" ON "video_comments" ("video_id");
CREATE INDEX IF NOT EXISTS "video_comments_parent_id_idx" ON "video_comments" ("parent_id");
CREATE INDEX IF NOT EXISTS "video_comments_created_at_idx" ON "video_comments" ("created_at");

CREATE INDEX IF NOT EXISTS "creator_follows_follower_id_idx" ON "creator_follows" ("follower_id");
CREATE INDEX IF NOT EXISTS "creator_follows_creator_id_idx" ON "creator_follows" ("creator_id");
CREATE UNIQUE INDEX IF NOT EXISTS "creator_follows_follower_creator_unique" ON "creator_follows" ("follower_id","creator_id");

-- Update notifications table to support new notification types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('earning', 'follower', 'video_view', 'payment', 'system', 'like', 'comment'));