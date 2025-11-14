-- Add autoRenew field to member_profiles table
ALTER TABLE "member_profiles" ADD COLUMN "auto_renew" boolean DEFAULT false NOT NULL;