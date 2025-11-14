-- Migration: Add additional membership transaction types
-- This migration adds support for membership_upgrade, membership_renewal, and membership_cancellation transaction types

-- Update the type constraint to include new membership transaction types
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
  CHECK (type IN ('credit_purchase', 'video_view', 'creator_earning', 'membership_activation', 'membership_upgrade', 'membership_renewal', 'membership_cancellation'));