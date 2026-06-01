-- Migration: Add Referral Tracking System
-- Adds referral_code to creator_profiles and a dedicated referrals table
-- NO reward logic — tracking + analytics only

-- 1. Add referral_code to creator_profiles (unique per creator)
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;

-- 2. Backfill existing creators with a generated referral code
-- Format: CRNS + 6 uppercase alphanumeric chars
UPDATE creator_profiles
SET referral_code = 'CRNS' || UPPER(SUBSTRING(MD5(id::text || RANDOM()::text), 1, 6))
WHERE referral_code IS NULL;

-- 3. Make referral_code NOT NULL after backfill
ALTER TABLE creator_profiles ALTER COLUMN referral_code SET NOT NULL;

-- 4. Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- The creator who owns the referral code
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- The new user who signed up using the referral code
  referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- The referral code used at signup (immutable record)
  referral_code VARCHAR(20) NOT NULL,
  -- Status: pending = signed up but not yet verified, completed = fully onboarded
  -- Future: 'rewarded' when reward system is added
  status VARCHAR(20) NOT NULL DEFAULT 'completed',
  -- Future-ready: reward tracking fields (null until reward system is implemented)
  reward_issued_at TIMESTAMP,
  reward_amount INTEGER, -- coins, null until rewards are enabled
  -- Metadata for analytics and debugging
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  -- Enforce: one user can only be referred once
  CONSTRAINT referrals_referred_user_unique UNIQUE (referred_user_id)
);

-- 5. Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at DESC);

-- 6. Index on creator_profiles.referral_code for fast lookup during signup
CREATE INDEX IF NOT EXISTS idx_creator_profiles_referral_code ON creator_profiles(referral_code);
