-- Migration: Add Coin System
-- This migration adds coin-based payment system to replace direct rupee pricing

-- 1. Add coin balance columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS coin_balance INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_coins_purchased INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_coins_spent INTEGER DEFAULT 0;

-- 2. Convert videos.credit_cost to videos.coin_price (INTEGER, multiply existing values by 20)
ALTER TABLE videos ADD COLUMN IF NOT EXISTS coin_price INTEGER;
UPDATE videos SET coin_price = CAST((credit_cost::numeric * 20) AS INTEGER) WHERE coin_price IS NULL;
ALTER TABLE videos ALTER COLUMN coin_price SET NOT NULL;

-- 3. Convert series.total_price to series.coin_price (INTEGER, multiply existing values by 20)
ALTER TABLE series ADD COLUMN IF NOT EXISTS coin_price INTEGER;
UPDATE series SET coin_price = CAST((total_price::numeric * 20) AS INTEGER) WHERE coin_price IS NULL;
ALTER TABLE series ALTER COLUMN coin_price SET NOT NULL;

-- 4. Create coin_transactions table
CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL,
  coin_amount INTEGER NOT NULL,
  rupee_amount DECIMAL(10,2),
  related_content_type VARCHAR(50),
  related_content_id UUID,
  payment_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'completed',
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create indexes for coin_transactions
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_type ON coin_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created ON coin_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_status ON coin_transactions(status);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_payment_id ON coin_transactions(payment_id);

-- 6. Create coin_packages table
CREATE TABLE IF NOT EXISTS coin_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  coin_amount INTEGER NOT NULL,
  rupee_price DECIMAL(10,2) NOT NULL,
  bonus_coins INTEGER DEFAULT 0,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Create indexes for coin_packages
CREATE INDEX IF NOT EXISTS idx_coin_packages_is_active ON coin_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_coin_packages_display_order ON coin_packages(display_order);

-- 8. Insert default coin packages (will skip if already exist)
INSERT INTO coin_packages (name, coin_amount, rupee_price, bonus_coins, is_popular, display_order) 
SELECT 'Starter Pack', 200, 10.00, 0, false, 1
WHERE NOT EXISTS (SELECT 1 FROM coin_packages WHERE name = 'Starter Pack');

INSERT INTO coin_packages (name, coin_amount, rupee_price, bonus_coins, is_popular, display_order) 
SELECT 'Basic Pack', 500, 25.00, 20, false, 2
WHERE NOT EXISTS (SELECT 1 FROM coin_packages WHERE name = 'Basic Pack');

INSERT INTO coin_packages (name, coin_amount, rupee_price, bonus_coins, is_popular, display_order) 
SELECT 'Popular Pack', 1000, 50.00, 50, true, 3
WHERE NOT EXISTS (SELECT 1 FROM coin_packages WHERE name = 'Popular Pack');

INSERT INTO coin_packages (name, coin_amount, rupee_price, bonus_coins, is_popular, display_order) 
SELECT 'Premium Pack', 2500, 125.00, 150, false, 4
WHERE NOT EXISTS (SELECT 1 FROM coin_packages WHERE name = 'Premium Pack');

INSERT INTO coin_packages (name, coin_amount, rupee_price, bonus_coins, is_popular, display_order) 
SELECT 'Ultimate Pack', 5000, 250.00, 400, false, 5
WHERE NOT EXISTS (SELECT 1 FROM coin_packages WHERE name = 'Ultimate Pack');

-- 9. Add coin tracking columns to creator_profiles table
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS coin_balance INTEGER DEFAULT 0;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS total_coins_earned INTEGER DEFAULT 0;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS coins_withdrawn INTEGER DEFAULT 0;

-- 10. Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_users_coin_balance ON users(coin_balance);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_coin_balance ON creator_profiles(coin_balance);
CREATE INDEX IF NOT EXISTS idx_videos_coin_price ON videos(coin_price);
CREATE INDEX IF NOT EXISTS idx_series_coin_price ON series(coin_price);
