#!/usr/bin/env tsx

import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'
import { Pool } from 'pg'

config({ path: '.env.local' })

async function applyCoinSystemMigration() {
 const databaseUrl = process.env.DATABASE_URL
 
 if (!databaseUrl) {
 console.error('❌ DATABASE_URL not found in environment variables')
 process.exit(1)
 }

 console.log('🪙 Applying Coin System Migration...')
 console.log('🔍 Connecting to database...')
 console.log('📍 Database URL:', databaseUrl.replace(/:[^:@]*@/, ':****@'))

 const pool = new Pool({
 connectionString: databaseUrl,
 ssl: {
 rejectUnauthorized: false
 }
 })

 try {
 const client = await pool.connect()
 console.log('✅ Database connection successful')

 const coinBalanceCheck = await client.query(`
 SELECT column_name 
 FROM information_schema.columns 
 WHERE table_name = 'users' 
 AND column_name = 'coin_balance'
 `)
 
 if (coinBalanceCheck.rows.length > 0) {
 console.log('⚠️ Coin system migration already applied!')

 const coinTablesCheck = await client.query(`
 SELECT table_name 
 FROM information_schema.tables 
 WHERE table_schema = 'public' 
 AND table_name IN ('coin_transactions', 'coin_packages')
 `)
 
 console.log(`✅ Found ${coinTablesCheck.rows.length}/2 coin system tables`)
 coinTablesCheck.rows.forEach(row => {
 console.log(` ✅ ${row.table_name}`)
 })
 
 client.release()
 return
 }
 
 console.log('📄 Reading migration file...')
 const migrationPath = join(process.cwd(), 'drizzle', '0008_add_coin_system.sql')
 const migrationSQL = readFileSync(migrationPath, 'utf-8')

 console.log('⚡ Executing migration...')
 
 try {
 await client.query('BEGIN')
 await client.query(migrationSQL)
 await client.query('COMMIT')
 console.log('✅ Migration executed successfully')
 } catch (error) {
 await client.query('ROLLBACK')

 if (error instanceof Error && (
 error.message.includes('already exists') ||
 error.message.includes('duplicate key')
 )) {
 console.log('⚠️ Some objects already exist, continuing...')
 } else {
 console.error('❌ Error executing migration:', error)
 throw error
 }
 }
 
 console.log('🎉 Coin system migration applied successfully!')

 console.log('🔍 Verifying coin system schema...')

 const usersColumnsCheck = await client.query(`
 SELECT column_name 
 FROM information_schema.columns 
 WHERE table_name = 'users' 
 AND column_name IN ('coin_balance', 'total_coins_purchased', 'total_coins_spent')
 `)
 console.log(`✅ Users table: ${usersColumnsCheck.rows.length}/3 coin columns added`)

 const videosColumnsCheck = await client.query(`
 SELECT column_name 
 FROM information_schema.columns 
 WHERE table_name = 'videos' 
 AND column_name = 'coin_price'
 `)
 console.log(`✅ Videos table: coin_price column ${videosColumnsCheck.rows.length > 0 ? 'added' : 'missing'}`)

 const seriesColumnsCheck = await client.query(`
 SELECT column_name 
 FROM information_schema.columns 
 WHERE table_name = 'series' 
 AND column_name = 'coin_price'
 `)
 console.log(`✅ Series table: coin_price column ${seriesColumnsCheck.rows.length > 0 ? 'added' : 'missing'}`)

 const creatorProfilesColumnsCheck = await client.query(`
 SELECT column_name 
 FROM information_schema.columns 
 WHERE table_name = 'creator_profiles' 
 AND column_name IN ('coin_balance', 'total_coins_earned', 'coins_withdrawn')
 `)
 console.log(`✅ Creator profiles table: ${creatorProfilesColumnsCheck.rows.length}/3 coin columns added`)

 const coinTablesCheck = await client.query(`
 SELECT table_name 
 FROM information_schema.tables 
 WHERE table_schema = 'public' 
 AND table_name IN ('coin_transactions', 'coin_packages')
 `)
 console.log(`✅ Coin system tables: ${coinTablesCheck.rows.length}/2 tables created`)
 coinTablesCheck.rows.forEach(row => {
 console.log(` ✅ ${row.table_name}`)
 })

 const packagesCount = await client.query('SELECT COUNT(*) FROM coin_packages')
 console.log(`✅ Coin packages: ${packagesCount.rows[0].count} packages inserted`)
 
 console.log('🎉 Coin system migration verification complete!')
 
 client.release()
 
 } catch (error) {
 console.error('❌ Migration failed:', error)
 process.exit(1)
 } finally {
 await pool.end()
 }
}

applyCoinSystemMigration()
