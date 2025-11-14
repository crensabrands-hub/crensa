CREATE TABLE IF NOT EXISTS "video_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"share_token" varchar(255) NOT NULL,
	"platform" varchar(50),
	"click_count" integer DEFAULT 0 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"conversion_count" integer DEFAULT 0 NOT NULL,
	"last_accessed_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "video_shares_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "video_shares" ADD CONSTRAINT "video_shares_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "video_shares" ADD CONSTRAINT "video_shares_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "video_shares_video_id_idx" ON "video_shares" ("video_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "video_shares_creator_id_idx" ON "video_shares" ("creator_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "video_shares_share_token_idx" ON "video_shares" ("share_token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "video_shares_platform_idx" ON "video_shares" ("platform");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "video_shares_created_at_idx" ON "video_shares" ("created_at");