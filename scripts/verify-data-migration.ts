#!/usr/bin/env tsx

import { config } from 'dotenv'
import { Pool } from 'pg'

config({ path: '.env.local' })

const COINS_PER_RUPEE = 20

interface VerificationResults {
 videosWithCoinPrice: number
 videosWithoutCoinPrice: number
 seriesWithCoinPrice: number
 seriesWithoutCoinPrice: number
 usersWithCoinBalance: number
 creatorsWithCoinEarnings: number
 coinTransactions: number
 issues: string[]
}

async function verifyDataMigration() {
 const databaseUrl = process.env.DATABASE_URL
 
 if (!databaseUrl) {
 console.error('❌ DATABASE_URL not found in environment variables')
 process.exit(1)
 }

 console.log('🔍 Verifying Data Migration to Coin System...')
 console.log('📍 Database URL:', databaseUrl.replace(/:[^:@]*@/, ':****@'))
 console.log('')

 const pool = new Pool({
 connectionString: databaseUrl,
 ssl: {
 rejectUnauthorized: false
 }
 })

 const results: VerificationResults = {
 videosWithCoinPrice: 0,
 videosWithoutCoinPrice: 0,
 seriesWithCoinPrice: 0,
 seriesWithoutCoinPrice: 0,
 usersWithCoinBalance: 0,
 creatorsWithCoinEarnings: 0,
 coinTransactions: 0,
 issues: []
 }

 try {
 const client = await pool.connect()
 console.log('✅ Database connection successful\n')

 console.log('📹 Verifying video prices...')
 await verifyVideoPrices(client, results)

 console.log('\n📺 Verifying series prices...')
 await verifySeriesPrices(client, results)

 console.log('\n👤 Verifying user balances...')
 await verifyUserBalances(client, results)

 console.log('\n🎨 Verifying creator earnings...')
 await verifyCreatorEarnings(client, results)

 console.log('\n📝 Verifying coin transactions...')
 await verifyCoinTransactions(client, results)

 printVerificationSummary(results)
 
 client.release()
 
 } catch (error) {
 console.error('\n❌ Verification error:', error)
 process.exit(1)
 } finally {
 await pool.end()
 }
}

async function verifyVideoPrices(client: any, results: VerificationResults) {
 try {

 const columnCheck = await client.query(`
 SELECT column_name 
 FROM information_schema.columns 
 WHERE table_name = 'videos' 
 AND column_name = 'coin_price'
 `)
 
 if (columnCheck.rows.length === 0) {
 results.issues.push('coin_price column does not exist in videos table')
 console.log(' ❌ coin_price column does not exist')
 return
 }

 const withCoinPrice = await client.query(`
 SELECT COUNT(*) as count
 FROM videos
 WHERE coin_price IS NOT NULL AND coin_price > 0
 `)
 results.videosWithCoinPrice = parseInt(withCoinPrice.rows[0].count)

 const withoutCoinPrice = await client.query(`
 SELECT COUNT(*) as count
 FROM videos
 WHERE credit_cost > 0 AND (coin_price IS NULL OR coin_price = 0)
 `)
 results.videosWithoutCoinPrice = parseInt(withoutCoinPrice.rows[0].count)
 
 console.log(` ✅ Videos with coin prices: ${results.videosWithCoinPrice}`)
 
 if (results.videosWithoutCoinPrice > 0) {
 console.log(` ⚠️ Videos without coin prices: ${results.videosWithoutCoinPrice}`)
 results.issues.push(`${results.videosWithoutCoinPrice} videos still need coin price conversion`)
 }

 const sampleVideos = await client.query(`
 SELECT id, title, credit_cost, coin_price
 FROM videos
 WHERE credit_cost > 0 AND coin_price > 0
 LIMIT 3
 `)
 
 if (sampleVideos.rows.length > 0) {
 console.log(' 📊 Sample conversions:')
 for (const video of sampleVideos.rows) {
 const expectedCoins = Math.floor(parseFloat(video.credit_cost) * COINS_PER_RUPEE)
 const actualCoins = parseInt(video.coin_price)
 const match = expectedCoins === actualCoins ? '✅' : '❌'
 console.log(` ${match} "${video.title}": ₹${video.credit_cost} → ${actualCoins} coins (expected: ${expectedCoins})`)
 
 if (expectedCoins !== actualCoins) {
 results.issues.push(`Video "${video.title}" has incorrect coin price: ${actualCoins} (expected: ${expectedCoins})`)
 }
 }
 }
 
 } catch (error) {
 results.issues.push(`Failed to verify video prices: ${error}`)
 console.error(` ❌ Error: ${error}`)
 }
}

async function verifySeriesPrices(client: any, results: VerificationResults) {
 try {

 const columnCheck = await client.query(`
 SELECT column_name 
 FROM information_schema.columns 
 WHERE table_name = 'series' 
 AND column_name = 'coin_price'
 `)
 
 if (columnCheck.rows.length === 0) {
 results.issues.push('coin_price column does not exist in series table')
 console.log(' ❌ coin_price column does not exist')
 return
 }

 const withCoinPrice = await client.query(`
 SELECT COUNT(*) as count
 FROM series
 WHERE coin_price IS NOT NULL AND coin_price > 0
 `)
 results.seriesWithCoinPrice = parseInt(withCoinPrice.rows[0].count)

 const withoutCoinPrice = await client.query(`
 SELECT COUNT(*) as count
 FROM series
 WHERE total_price > 0 AND (coin_price IS NULL OR coin_price = 0)
 `)
 results.seriesWithoutCoinPrice = parseInt(withoutCoinPrice.rows[0].count)
 
 console.log(` ✅ Series with coin prices: ${results.seriesWithCoinPrice}`)
 
 if (results.seriesWithoutCoinPrice > 0) {
 console.log(` ⚠️ Series without coin prices: ${results.seriesWithoutCoinPrice}`)
 results.issues.push(`${results.seriesWithoutCoinPrice} series still need coin price conversion`)
 }

 const sampleSeries = await client.query(`
 SELECT id, title, total_price, coin_price
 FROM series
 WHERE total_price > 0 AND coin_price > 0
 LIMIT 3
 `)
 
 if (sampleSeries.rows.length > 0) {
 console.log(' 📊 Sample conversions:')
 for (const series of sampleSeries.rows) {
 const expectedCoins = Math.floor(parseFloat(series.total_price) * COINS_PER_RUPEE)
 const actualCoins = parseInt(series.coin_price)
 const match = expectedCoins === actualCoins ? '✅' : '❌'
 console.log(` ${match} "${series.title}": ₹${series.total_price} → ${actualCoins} coins (expected: ${expectedCoins})`)
 
 if (expectedCoins !== actualCoins) {
 results.issues.push(`Series "${series.title}" has incorrect coin price: ${actualCoins} (expected: ${expectedCoins})`)
 }
 }
 }
 
 } catch (error) {
 results.issues.push(`Failed to verify series prices: ${error}`)
 console.error(` ❌ Error: ${error}`)
 }
}

async function verifyUserBalances(client: any, results: VerificationResults) {
 try {

 const columnCheck = await client.query(`
 SELECT column_name 
 FROM information_schema.columns 
 WHERE table_name = 'users' 
 AND column_name = 'coin_balance'
 `)
 
 if (columnCheck.rows.length === 0) {
 results.issues.push('coin_balance column does not exist in users table')
 console.log(' ❌ coin_balance column does not exist')
 return
 }

 const withCoinBalance = await client.query(`
 SELECT COUNT(*) as count
 FROM users
 WHERE coin_balance > 0
 `)
 results.usersWithCoinBalance = parseInt(withCoinBalance.rows[0].count)
 
 console.log(` ✅ Users with coin balances: ${results.usersWithCoinBalance}`)

 const sampleUsers = await client.query(`
 SELECT u.id, u.username, u.coin_balance, mp.wallet_balance
 FROM users u
 LEFT JOIN member_profiles mp ON u.id = mp.user_id
 WHERE u.coin_balance > 0
 LIMIT 3
 `)
 
 if (sampleUsers.rows.length > 0) {
 console.log(' 📊 Sample user balances:')
 for (const user of sampleUsers.rows) {
 console.log(` ✅ ${user.username}: ${user.coin_balance} coins`)
 }
 }
 
 } catch (error) {
 results.issues.push(`Failed to verify user balances: ${error}`)
 console.error(` ❌ Error: ${error}`)
 }
}

async function verifyCreatorEarnings(client: any, results: VerificationResults) {
 try {

 const columnCheck = await client.query(`
 SELECT column_name 
 FROM information_schema.columns 
 WHERE table_name = 'creator_profiles' 
 AND column_name IN ('coin_balance', 'total_coins_earned')
 `)
 
 if (columnCheck.rows.length < 2) {
 results.issues.push('Coin columns do not exist in creator_profiles table')
 console.log(' ❌ Coin columns do not exist')
 return
 }

 const withCoinEarnings = await client.query(`
 SELECT COUNT(*) as count
 FROM creator_profiles
 WHERE total_coins_earned > 0
 `)
 results.creatorsWithCoinEarnings = parseInt(withCoinEarnings.rows[0].count)
 
 console.log(` ✅ Creators with coin earnings: ${results.creatorsWithCoinEarnings}`)

 const sampleCreators = await client.query(`
 SELECT cp.id, u.username, cp.total_earnings, cp.coin_balance, cp.total_coins_earned
 FROM creator_profiles cp
 INNER JOIN users u ON cp.user_id = u.id
 WHERE cp.total_coins_earned > 0
 LIMIT 3
 `)
 
 if (sampleCreators.rows.length > 0) {
 console.log(' 📊 Sample creator earnings:')
 for (const creator of sampleCreators.rows) {
 const expectedCoins = Math.floor(parseFloat(creator.total_earnings) * COINS_PER_RUPEE)
 const actualCoins = parseInt(creator.total_coins_earned)
 const match = expectedCoins === actualCoins ? '✅' : '⚠️'
 console.log(` ${match} ${creator.username}: ${actualCoins} coins earned (₹${creator.total_earnings})`)
 }
 }
 
 } catch (error) {
 results.issues.push(`Failed to verify creator earnings: ${error}`)
 console.error(` ❌ Error: ${error}`)
 }
}

async function verifyCoinTransactions(client: any, results: VerificationResults) {
 try {

 const tableCheck = await client.query(`
 SELECT table_name 
 FROM information_schema.tables 
 WHERE table_schema = 'public' 
 AND table_name = 'coin_transactions'
 `)
 
 if (tableCheck.rows.length === 0) {
 results.issues.push('coin_transactions table does not exist')
 console.log(' ❌ coin_transactions table does not exist')
 return
 }

 const transactionCount = await client.query(`
 SELECT COUNT(*) as count
 FROM coin_transactions
 `)
 results.coinTransactions = parseInt(transactionCount.rows[0].count)
 
 console.log(` ✅ Total coin transactions: ${results.coinTransactions}`)

 const byType = await client.query(`
 SELECT transaction_type, COUNT(*) as count
 FROM coin_transactions
 GROUP BY transaction_type
 ORDER BY count DESC
 `)
 
 if (byType.rows.length > 0) {
 console.log(' 📊 Transactions by type:')
 for (const row of byType.rows) {
 console.log(` - ${row.transaction_type}: ${row.count}`)
 }
 }

 const sampleTransactions = await client.query(`
 SELECT 
 transaction_type,
 coin_amount,
 rupee_amount,
 description,
 created_at
 FROM coin_transactions
 ORDER BY created_at DESC
 LIMIT 3
 `)
 
 if (sampleTransactions.rows.length > 0) {
 console.log(' 📊 Recent transactions:')
 for (const txn of sampleTransactions.rows) {
 console.log(` - ${txn.transaction_type}: ${txn.coin_amount} coins (${txn.description})`)
 }
 }
 
 } catch (error) {
 results.issues.push(`Failed to verify coin transactions: ${error}`)
 console.error(` ❌ Error: ${error}`)
 }
}

function printVerificationSummary(results: VerificationResults) {
 console.log('\n' + '='.repeat(60))
 console.log('📊 VERIFICATION SUMMARY')
 console.log('='.repeat(60))
 console.log(`📹 Videos with coin prices: ${results.videosWithCoinPrice}`)
 console.log(` Videos needing conversion: ${results.videosWithoutCoinPrice}`)
 console.log(`📺 Series with coin prices: ${results.seriesWithCoinPrice}`)
 console.log(` Series needing conversion: ${results.seriesWithoutCoinPrice}`)
 console.log(`👤 Users with coin balances: ${results.usersWithCoinBalance}`)
 console.log(`🎨 Creators with coin earnings: ${results.creatorsWithCoinEarnings}`)
 console.log(`📝 Coin transaction records: ${results.coinTransactions}`)
 console.log('='.repeat(60))
 
 if (results.issues.length > 0) {
 console.log('\n⚠️ ISSUES FOUND:')
 results.issues.forEach((issue, index) => {
 console.log(` ${index + 1}. ${issue}`)
 })
 console.log('\n💡 Run the migration script again to fix these issues')
 } else {
 console.log('\n✅ All verifications passed! Data migration is complete.')
 }
 
 console.log('')
}

verifyDataMigration()
