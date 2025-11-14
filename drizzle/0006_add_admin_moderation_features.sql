-- Add admin and moderation fields to existing users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_suspended" boolean DEFAULT false NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "suspension_reason" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "suspended_at" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "suspended_by" uuid;

-- Add moderation fields to existing videos table
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "moderation_status" varchar(20) DEFAULT 'approved' NOT NULL;
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "moderation_reason" text;
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "moderated_at" timestamp;
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "moderated_by" uuid;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" ("role");
CREATE INDEX IF NOT EXISTS "users_is_suspended_idx" ON "users" ("is_suspended");

-- Create reports table
CREATE TABLE IF NOT EXISTS "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" uuid NOT NULL,
	"reported_user_id" uuid,
	"reported_video_id" uuid,
	"type" varchar(50) NOT NULL,
	"reason" varchar(100) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"resolution" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"target_id" uuid NOT NULL,
	"details" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create content_filters table
CREATE TABLE IF NOT EXISTS "content_filters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(50) NOT NULL,
	"pattern" text NOT NULL,
	"severity" varchar(20) NOT NULL,
	"action" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "videos_moderation_status_idx" ON "videos" USING btree ("moderation_status");
CREATE INDEX IF NOT EXISTS "reports_status_idx" ON "reports" USING btree ("status");
CREATE INDEX IF NOT EXISTS "reports_type_idx" ON "reports" USING btree ("type");
CREATE INDEX IF NOT EXISTS "reports_created_at_idx" ON "reports" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "audit_logs_admin_id_idx" ON "audit_logs" USING btree ("admin_id");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs" USING btree ("action");
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "content_filters_type_idx" ON "content_filters" USING btree ("type");
CREATE INDEX IF NOT EXISTS "content_filters_severity_idx" ON "content_filters" USING btree ("severity");
CREATE INDEX IF NOT EXISTS "content_filters_is_active_idx" ON "content_filters" USING btree ("is_active");

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "videos" ADD CONSTRAINT "videos_moderated_by_users_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "users"("id") ON DELETE set null;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_user_id_users_id_fk" FOREIGN KEY ("reported_user_id") REFERENCES "users"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_video_id_videos_id_fk" FOREIGN KEY ("reported_video_id") REFERENCES "videos"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE set null;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "content_filters" ADD CONSTRAINT "content_filters_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;