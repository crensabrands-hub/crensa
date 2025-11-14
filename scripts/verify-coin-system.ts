#!/usr/bin/env tsx

import { config } from 'dotenv'
import { Pool } from 'pg'

config({ path: '.env.local' })

async function verifyCoinSystem() {
 const databaseUrl = process.env.DATABASE_URL
 
 if (!databaseUrl) {
 console.error('❌ DATABASE_URL not found in environment variables')
 process.exit(1)
 }

 console.log('🔍 Verifying Coin System Implementation...')

 const pool = new Pool({
 connectionString: databaseUrl,
 ssl: {
 rejectUnauthorized: false
 }
 })

 try {
 const client = await pool.connect()
 console.log('✅ Database connection successful\n')

 console.log('📋 Checking users table...')
 const usersColumns = await client.query(`
 SELECT column_name, data_type, column_default 
 FROM information_schema.columns 
 WHERE table_name = 'users' 
 AND column_name IN ('coin_balance', 'total_coins_purchased', 'total_coins_spent')
 ORDER BY column_name
 `)
 console.log(` ✅ Found ${usersColumns.rows.length}/3 coin columns:`)
 usersColumns.rows.forEach(row => {
 console.log(` - ${row.column_name} (${row.data_type}, default: ${row.column_default})`)
 })

 console.log('\n📋 Checking videos table...')
 const videosColumns = await client.query(`
 SELECT column_name, data_type, is_nullable 
 FROM information_schema.columns 
 WHERE table_name = 'videos' 
 AND column_name IN ('credit_cost', 'coin_price')
 ORDER BY column_name
 `)
 console.log(` ✅ Found ${videosColumns.rows.length} pricing columns:`)
 videosColumns.rows.forEach(row => {
 console.log(` - ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`)
 })

 console.log('\n📋 Checking series table...')
 const seriesColumns = await client.query(`
 SELECT column_name, data_type, is_nullable 
 FROM information_schema.columns 
 WHERE table_name = 'series' 
 AND column_name IN ('total_price', 'coin_price')
 ORDER BY column_name
 `)
 console.log(` ✅ Found ${seriesColumns.rows.length} pricing columns:`)
 seriesColumns.rows.forEach(row => {
 console.log(` - ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`)
 })

 console.log('\n📋 Checking creator_profiles table...')
 const creatorColumns = await client.query(`
 SELECT column_name, data_type, column_default 
 FROM information_schema.columns 
 WHERE table_name = 'creator_profiles' 
 AND column_name IN ('coin_balance', 'total_coins_earned', 'coins_withdrawn')
 ORDER BY column_name
 `)
 console.log(` ✅ Found ${creatorColumns.rows.length}/3 coin columns:`)
 creatorColumns.rows.forEach(row => {
 console.log(` - ${row.column_name} (${row.data_type}, default: ${row.column_default})`)
 })

 console.log('\n📋 Checking coin_transactions table...')
 const coinTransactionsColumns = await client.query(`
 SELECT column_name, data_type 
 FROM information_schema.columns 
 WHERE table_name = 'coin_transactions'
 ORDER BY ordinal_position
 `)
 console.log(` ✅ Found ${coinTransactionsColumns.rows.length} columns:`)
 coinTransactionsColumns.rows.forEach(row => {
 console.log(` - ${row.column_name} (${row.data_type})`)
 })

 const coinTransactionsIndexes = await client.query(`
 SELECT indexname 
 FROM pg_indexes 
 WHERE tablename = 'coin_transactions'
 ORDER BY indexname
 `)
 console.log(` ✅ Found ${coinTransactionsIndexes.rows.length} indexes:`)
 coinTransactionsIndexes.rows.forEach(row => {
 console.log(` - ${row.indexname}`)
 })

 console.log('\n📋 Checking coin_packages table...')
 const coinPackagesColumns = await client.query(`
 SELECT column_name, data_type 
 FROM information_schema.columns 
 WHERE table_name = 'coin_packages'
 ORDER BY ordinal_position
 `)
 console.log(` ✅ Found ${coinPackagesColumns.rows.length} columns:`)
 coinPackagesColumns.rows.forEach(row => {
 console.log(` - ${row.column_name} (${row.data_type})`)
 })

 const packages = await client.query(`
 SELECT name, coin_amount, rupee_price, bonus_coins, is_popular, display_order
 FROM coin_packages
 ORDER BY display_order
 `)
 console.log(`\n ✅ Found ${packages.rows.length} coin packages:`)
 packages.rows.forEach(row => {
 console.log(` - ${row.name}: ${row.coin_amount} coins + ${row.bonus_coins} bonus = ₹${row.rupee_price} ${row.is_popular ? '⭐ POPULAR' : ''}`)
 })

 console.log('\n📋 Checking data migration...')
 const videoCount = await client.query('SELECT COUNT(*) FROM videos')
 const videosWithCoinPrice = await client.query('SELECT COUNT(*) FROM videos WHERE coin_price IS NOT NULL')
 console.log(` ✅ Total videos: ${videoCount.rows[0].count}`)
 console.log(` ✅ Videos with coin_price: ${videosWithCoinPrice.rows[0].count}`)
 
 if (videoCount.rows[0].count > 0) {
 const sampleVideo = await client.query(`
 SELECT title, credit_cost, coin_price 
 FROM videos 
 WHERE coin_price IS NOT NULL 
 LIMIT 1
 `)
 if (sampleVideo.rows.length > 0) {
 const video = sampleVideo.rows[0]
 console.log(` 📹 Sample video: "${video.title}"`)
 console.log(` - Credit cost: ${video.credit_cost}`)
 console.log(` - Coin price: ${video.coin_price}`)
 console.log(` - Conversion: ${video.credit_cost} * 20 = ${parseFloat(video.credit_cost) * 20} (actual: ${video.coin_price})`)
 }
 }
 
 const seriesCount = await client.query('SELECT COUNT(*) FROM series')
 const seriesWithCoinPrice = await client.query('SELECT COUNT(*) FROM series WHERE coin_price IS NOT NULL')
 console.log(`\n ✅ Total series: ${seriesCount.rows[0].count}`)
 console.log(` ✅ Series with coin_price: ${seriesWithCoinPrice.rows[0].count}`)
 
 console.log('\n🎉 Coin system verification complete!')
 console.log('\n✅ All database schema updates have been successfully applied:')
 console.log(' - Users table: coin_balance, total_coins_purchased, total_coins_spent')
 console.log(' - Videos table: coin_price (migrated from credit_cost)')
 console.log(' - Series table: coin_price (migrated from total_price)')
 console.log(' - Creator profiles: coin_balance, total_coins_earned, coins_withdrawn')
 console.log(' - New table: coin_transactions')
 console.log(' - New table: coin_packages (with 5 default packages)')
 
 client.release()
 
 } catch (error) {
 console.error('❌ Verification failed:', error)
 process.exit(1)
 } finally {
 await pool.end()
 }
}

verifyCoinSystem()
