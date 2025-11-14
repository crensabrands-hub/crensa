-- Add metadata columns to existing creator_follows table
ALTER TABLE "creator_follows" ADD COLUMN IF NOT EXISTS "followed_at" timestamp DEFAULT now() NOT NULL;
ALTER TABLE "creator_follows" ADD COLUMN IF NOT EXISTS "notification_enabled" boolean DEFAULT true NOT NULL;
ALTER TABLE "creator_follows" ADD COLUMN IF NOT EXISTS "source" varchar(50) DEFAULT 'dashboard' NOT NULL;

-- Create member_stats table for storing member statistics
CREATE TABLE IF NOT EXISTS "member_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"total_videos_watched" integer DEFAULT 0 NOT NULL,
	"total_credits_spent" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"followed_creators_count" integer DEFAULT 0 NOT NULL,
	"favorite_category" varchar(100),
	"monthly_videos_watched" integer DEFAULT 0 NOT NULL,
	"monthly_credits_spent" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"monthly_new_follows" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "member_stats_user_id_unique" UNIQUE("user_id")
);

-- Create profile_visits table for tracking creator profile visits
CREATE TABLE IF NOT EXISTS "profile_visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"visited_at" timestamp DEFAULT now() NOT NULL,
	"source" varchar(50) NOT NULL,
	"duration" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create member_activities table for activity logging
CREATE TABLE IF NOT EXISTS "member_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for new columns in creator_follows
CREATE INDEX IF NOT EXISTS "creator_follows_followed_at_idx" ON "creator_follows" USING btree ("followed_at");
CREATE INDEX IF NOT EXISTS "creator_follows_source_idx" ON "creator_follows" USING btree ("source");

-- Create indexes for member_stats table
CREATE INDEX IF NOT EXISTS "member_stats_user_id_idx" ON "member_stats" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "member_stats_last_updated_idx" ON "member_stats" USING btree ("last_updated");

-- Create indexes for profile_visits table
CREATE INDEX IF NOT EXISTS "profile_visits_user_id_idx" ON "profile_visits" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "profile_visits_creator_id_idx" ON "profile_visits" USING btree ("creator_id");
CREATE INDEX IF NOT EXISTS "profile_visits_visited_at_idx" ON "profile_visits" USING btree ("visited_at");
CREATE INDEX IF NOT EXISTS "profile_visits_source_idx" ON "profile_visits" USING btree ("source");

-- Create indexes for member_activities table
CREATE INDEX IF NOT EXISTS "member_activities_user_id_idx" ON "member_activities" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "member_activities_activity_type_idx" ON "member_activities" USING btree ("activity_type");
CREATE INDEX IF NOT EXISTS "member_activities_created_at_idx" ON "member_activities" USING btree ("created_at");

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "member_stats" ADD CONSTRAINT "member_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "profile_visits" ADD CONSTRAINT "profile_visits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "profile_visits" ADD CONSTRAINT "profile_visits_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "member_activities" ADD CONSTRAINT "member_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;