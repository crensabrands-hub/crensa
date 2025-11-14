#!/usr/bin/env tsx

import { config } from 'dotenv'
import { Pool } from 'pg'

config({ path: '.env.local' })

const COINS_PER_RUPEE = 20

interface MigrationStats {
 videosConverted: number
 seriesConverted: number
 usersConverted: number
 creatorsConverted: number
 transactionsCreated: number
 errors: string[]
}

async function migrateDataToCoins() {
 const databaseUrl = process.env.DATABASE_URL
 
 if (!databaseUrl) {
 console.error('❌ DATABASE_URL not found in environment variables')
 process.exit(1)
 }

 console.log('🪙 Starting Data Migration to Coin System...')
 console.log('🔍 Connecting to database...')
 console.log('📍 Database URL:', databaseUrl.replace(/:[^:@]*@/, ':****@'))
 console.log('💱 Conversion rate: 1 rupee = 20 coins\n')

 const pool = new Pool({
 connectionString: databaseUrl,
 ssl: {
 rejectUnauthorized: false
 }
 })

 const stats: MigrationStats = {
 videosConverted: 0,
 seriesConverted: 0,
 usersConverted: 0,
 creatorsConverted: 0,
 transactionsCreated: 0,
 errors: []
 }

 try {
 const client = await pool.connect()
 console.log('✅ Database connection successful\n')

 await client.query('BEGIN')
 
 try {

 console.log('📹 Step 1: Migrating video prices...')
 await migrateVideoPrices(client, stats)

 console.log('\n📺 Step 2: Migrating series prices...')
 await migrateSeriesPrices(client, stats)

 console.log('\n👤 Step 3: Migrating user balances...')
 await migrateUserBalances(client, stats)

 console.log('\n🎨 Step 4: Migrating creator earnings...')
 await migrateCreatorEarnings(client, stats)

 console.log('\n📝 Step 5: Creating historical coin transactions...')
 await createHistoricalTransactions(client, stats)

 await client.query('COMMIT')
 console.log('\n✅ All migration steps completed successfully!')
 
 } catch (error) {
 await client.query('ROLLBACK')
 console.error('\n❌ Migration failed, rolling back changes...')
 throw error
 }

 printMigrationSummary(stats)
 
 client.release()
 
 } catch (error) {
 console.error('\n❌ Migration error:', error)
 process.exit(1)
 } finally {
 await pool.end()
 }
}

async function migrateVideoPrices(client: any, stats: MigrationStats) {
 try {

 const columnCheck = await client.query(`
 SELECT column_name 
 FROM information_schema.columns 
 WHERE table_name = 'videos' 
 AND column_name = 'coin_price'
 `)
 
 if (columnCheck.rows.length === 0) {
 console.log('⚠️ coin_price column does not exist in videos table')
 console.log(' Please run the schema migration first (apply-coin-system-migration.ts)')
 return
 }

 const videosToConvert = await client.query(`
 SELECT id, title, credit_cost, coin_price
 FROM videos
 WHERE credit_cost IS NOT NULL 
 AND credit_cost > 0
 AND (coin_price IS NULL OR coin_price = 0)
 `)
 
 console.log(` Found ${videosToConvert.rows.length} videos to convert`)
 
 if (videosToConvert.rows.length === 0) {
 console.log(' ✅ No videos need conversion')
 return
 }

 for (const video of videosToConvert.rows) {
 const coinPrice = Math.floor(parseFloat(video.credit_cost) * COINS_PER_RUPEE)
 
 await client.query(`
 UPDATE videos
 SET coin_price = $1
 WHERE id = $2
 `, [coinPrice, video.id])
 
 stats.videosConverted++
 
 if (stats.videosConverted <= 5) {
 console.log(` ✅ "${video.title}": ₹${video.credit_cost} → ${coinPrice} coins`)
 }
 }
 
 if (stats.videosConverted > 5) {
 console.log(` ... and ${stats.videosConverted - 5} more videos`)
 }
 
 console.log(` ✅ Converted ${stats.videosConverted} video prices`)
 
 } catch (error) {
 const errorMsg = `Failed to migrate video prices: ${error}`
 stats.errors.push(errorMsg)
 console.error(` ❌ ${errorMsg}`)
 }
}

async function migrateSeriesPrices(client: any, stats: MigrationStats) {
 try {

 const columnCheck = await client.query(`
 SELECT column_name 
 FROM information_schema.columns 
 WHERE table_name = 'series' 
 AND column_name = 'coin_price'
 `)
 
 if (columnCheck.rows.length === 0) {
 console.log('⚠️ coin_price column does not exist in series table')
 console.log(' Please run the schema migration first (apply-coin-system-migration.ts)')
 return
 }

 const seriesToConvert = await client.query(`
 SELECT id, title, total_price, coin_price
 FROM series
 WHERE total_price IS NOT NULL 
 AND total_price > 0
 AND (coin_price IS NULL OR coin_price = 0)
 `)
 
 console.log(` Found ${seriesToConvert.rows.length} series to convert`)
 
 if (seriesToConvert.rows.length === 0) {
 console.log(' ✅ No series need conversion')
 return
 }

 for (const series of seriesToConvert.rows) {
 const coinPrice = Math.floor(parseFloat(series.total_price) * COINS_PER_RUPEE)
 
 await client.query(`
 UPDATE series
 SET coin_price = $1
 WHERE id = $2
 `, [coinPrice, series.id])
 
 stats.seriesConverted++
 
 if (stats.seriesConverted <= 5) {
 console.log(` ✅ "${series.title}": ₹${series.total_price} → ${coinPrice} coins`)
 }
 }
 
 if (stats.seriesConverted > 5) {
 console.log(` ... and ${stats.seriesConverted - 5} more series`)
 }
 
 console.log(` ✅ Converted ${stats.seriesConverted} series prices`)
 
 } catch (error) {
 const errorMsg = `Failed to migrate series prices: ${error}`
 stats.errors.push(errorMsg)
 console.error(` ❌ ${errorMsg}`)
 }
}

async function migrateUserBalances(client: any, stats: MigrationStats) {
 try {

 const columnCheck = await client.query(`
 SELECT column_name 
 FROM information_schema.columns 
 WHERE table_name = 'users' 
 AND column_name = 'coin_balance'
 `)
 
 if (columnCheck.rows.length === 0) {
 console.log('⚠️ coin_balance column does not exist in users table')
 console.log(' Please run the schema migration first (apply-coin-system-migration.ts)')
 return
 }

 const memberProfilesCheck = await client.query(`
 SELECT column_name 
 FROM information_schema.columns 
 WHERE table_name = 'member_profiles' 
 AND column_name = 'wallet_balance'
 `)
 
 if (memberProfilesCheck.rows.length === 0) {
 console.log(' ℹ️ No wallet_balance column in member_profiles, skipping user balance migration')
 return
 }

 const usersWithBalance = await client.query(`
 SELECT u.id, u.username, mp.wallet_balance, u.coin_balance
 FROM users u
 INNER JOIN member_profiles mp ON u.id = mp.user_id
 WHERE mp.wallet_balance > 0
 AND (u.coin_balance IS NULL OR u.coin_balance = 0)
 `)
 
 console.log(` Found ${usersWithBalance.rows.length} users with wallet balances`)
 
 if (usersWithBalance.rows.length === 0) {
 console.log(' ✅ No user balances need conversion')
 return
 }

 for (const user of usersWithBalance.rows) {
 const coinBalance = Math.floor(parseFloat(user.wallet_balance) * COINS_PER_RUPEE)
 
 await client.query(`
 UPDATE users
 SET coin_balance = $1
 WHERE id = $2
 `, [coinBalance, user.id])
 
 stats.usersConverted++
 
 if (stats.usersConverted <= 5) {
 console.log(` ✅ ${user.username}: ₹${user.wallet_balance} → ${coinBalance} coins`)
 }
 }
 
 if (stats.usersConverted > 5) {
 console.log(` ... and ${stats.usersConverted - 5} more users`)
 }
 
 console.log(` ✅ Converted ${stats.usersConverted} user balances`)
 
 } catch (error) {
 const errorMsg = `Failed to migrate user balances: ${error}`
 stats.errors.push(errorMsg)
 console.error(` ❌ ${errorMsg}`)
 }
}

async function migrateCreatorEarnings(client: any, stats: MigrationStats) {
 try {

 const columnCheck = await client.query(`
 SELECT column_name 
 FROM information_schema.columns 
 WHERE table_name = 'creator_profiles' 
 AND column_name IN ('coin_balance', 'total_coins_earned')
 `)
 
 if (columnCheck.rows.length < 2) {
 console.log('⚠️ Coin columns do not exist in creator_profiles table')
 console.log(' Please run the schema migration first (apply-coin-system-migration.ts)')
 return
 }

 const creatorsWithEarnings = await client.query(`
 SELECT id, user_id, total_earnings, coin_balance, total_coins_earned
 FROM creator_profiles
 WHERE total_earnings > 0
 AND (coin_balance IS NULL OR coin_balance = 0)
 AND (total_coins_earned IS NULL OR total_coins_earned = 0)
 `)
 
 console.log(` Found ${creatorsWithEarnings.rows.length} creators with earnings`)
 
 if (creatorsWithEarnings.rows.length === 0) {
 console.log(' ✅ No creator earnings need conversion')
 return
 }

 for (const creator of creatorsWithEarnings.rows) {
 const totalCoinsEarned = Math.floor(parseFloat(creator.total_earnings) * COINS_PER_RUPEE)

 await client.query(`
 UPDATE creator_profiles
 SET coin_balance = $1,
 total_coins_earned = $1
 WHERE id = $2
 `, [totalCoinsEarned, creator.id])
 
 stats.creatorsConverted++
 
 if (stats.creatorsConverted <= 5) {
 console.log(` ✅ Creator earnings: ₹${creator.total_earnings} → ${totalCoinsEarned} coins`)
 }
 }
 
 if (stats.creatorsConverted > 5) {
 console.log(` ... and ${stats.creatorsConverted - 5} more creators`)
 }
 
 console.log(` ✅ Converted ${stats.creatorsConverted} creator earnings`)
 
 } catch (error) {
 const errorMsg = `Failed to migrate creator earnings: ${error}`
 stats.errors.push(errorMsg)
 console.error(` ❌ ${errorMsg}`)
 }
}

async function createHistoricalTransactions(client: any, stats: MigrationStats) {
 try {

 const tableCheck = await client.query(`
 SELECT table_name 
 FROM information_schema.tables 
 WHERE table_schema = 'public' 
 AND table_name = 'coin_transactions'
 `)
 
 if (tableCheck.rows.length === 0) {
 console.log('⚠️ coin_transactions table does not exist')
 console.log(' Please run the schema migration first (apply-coin-system-migration.ts)')
 return
 }

 const existingTransactions = await client.query(`
 SELECT 
 id,
 user_id,
 type,
 amount,
 video_id,
 series_id,
 creator_id,
 razorpay_payment_id,
 status,
 created_at
 FROM transactions
 WHERE type IN ('credit_purchase', 'video_view', 'creator_earning', 'series_purchase')
 AND status = 'completed'
 ORDER BY created_at ASC
 `)
 
 console.log(` Found ${existingTransactions.rows.length} historical transactions`)
 
 if (existingTransactions.rows.length === 0) {
 console.log(' ℹ️ No historical transactions to convert')
 return
 }

 for (const txn of existingTransactions.rows) {
 const coinAmount = Math.floor(parseFloat(txn.amount) * COINS_PER_RUPEE)
 const rupeeAmount = parseFloat(txn.amount)

 let transactionType = 'spend'
 let description = ''
 let relatedContentType = null
 let relatedContentId = null
 
 if (txn.type === 'credit_purchase') {
 transactionType = 'purchase'
 description = `Coin purchase (migrated from credit purchase)`
 } else if (txn.type === 'video_view') {
 transactionType = 'spend'
 description = `Video purchase (migrated from video view)`
 relatedContentType = 'video'
 relatedContentId = txn.video_id
 } else if (txn.type === 'series_purchase') {
 transactionType = 'spend'
 description = `Series purchase (migrated)`
 relatedContentType = 'series'
 relatedContentId = txn.series_id
 } else if (txn.type === 'creator_earning') {
 transactionType = 'earn'
 description = `Creator earnings (migrated)`
 if (txn.video_id) {
 relatedContentType = 'video'
 relatedContentId = txn.video_id
 } else if (txn.series_id) {
 relatedContentType = 'series'
 relatedContentId = txn.series_id
 }
 }

 const existingCoinTxn = await client.query(`
 SELECT id FROM coin_transactions
 WHERE payment_id = $1
 `, [txn.razorpay_payment_id || txn.id])
 
 if (existingCoinTxn.rows.length > 0) {
 continue // Skip if already migrated
 }

 await client.query(`
 INSERT INTO coin_transactions (
 user_id,
 transaction_type,
 coin_amount,
 rupee_amount,
 related_content_type,
 related_content_id,
 payment_id,
 status,
 description,
 created_at,
 updated_at
 ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
 `, [
 txn.user_id,
 transactionType,
 coinAmount,
 rupeeAmount,
 relatedContentType,
 relatedContentId,
 txn.razorpay_payment_id || txn.id,
 txn.status,
 description,
 txn.created_at
 ])
 
 stats.transactionsCreated++
 }
 
 console.log(` ✅ Created ${stats.transactionsCreated} historical coin transaction records`)
 
 } catch (error) {
 const errorMsg = `Failed to create historical transactions: ${error}`
 stats.errors.push(errorMsg)
 console.error(` ❌ ${errorMsg}`)
 }
}

function printMigrationSummary(stats: MigrationStats) {
 console.log('\n' + '='.repeat(60))
 console.log('📊 MIGRATION SUMMARY')
 console.log('='.repeat(60))
 console.log(`📹 Videos converted: ${stats.videosConverted}`)
 console.log(`📺 Series converted: ${stats.seriesConverted}`)
 console.log(`👤 User balances converted: ${stats.usersConverted}`)
 console.log(`🎨 Creator earnings converted: ${stats.creatorsConverted}`)
 console.log(`📝 Transactions created: ${stats.transactionsCreated}`)
 console.log('='.repeat(60))
 
 if (stats.errors.length > 0) {
 console.log('\n⚠️ ERRORS ENCOUNTERED:')
 stats.errors.forEach((error, index) => {
 console.log(` ${index + 1}. ${error}`)
 })
 } else {
 console.log('\n✅ Migration completed successfully with no errors!')
 }
 
 console.log('\n💡 Next steps:')
 console.log(' 1. Verify the migrated data in your database')
 console.log(' 2. Test the coin system functionality')
 console.log(' 3. Update your application to use coin-based pricing')
 console.log(' 4. Consider removing old rupee-based columns after verification')
 console.log('')
}

migrateDataToCoins()
