#!/usr/bin/env tsx

import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'
import { Pool } from 'pg'

config({ path: '.env.local' })

async function applyMigration() {
 const databaseUrl = process.env.DATABASE_URL
 
 if (!databaseUrl) {
 console.error('❌ DATABASE_URL not found in environment variables')
 process.exit(1)
 }

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

 const tablesCheck = await client.query(`
 SELECT table_name 
 FROM information_schema.tables 
 WHERE table_schema = 'public' 
 AND table_name = 'users'
 `)
 
 const migrations = []
 
 if (tablesCheck.rows.length === 0) {
 console.log('📄 Base tables not found, applying initial migration first...')
 migrations.push({
 name: '0000_orange_amazoness.sql',
 description: 'Initial schema (users, profiles, videos, transactions)'
 })
 }

 const newTablesCheck = await client.query(`
 SELECT table_name 
 FROM information_schema.tables 
 WHERE table_schema = 'public' 
 AND table_name IN ('user_preferences', 'notifications')
 `)
 
 if (newTablesCheck.rows.length < 2) {
 migrations.push({
 name: '0001_glorious_squadron_supreme.sql',
 description: 'Add user_preferences and notifications tables'
 })
 }
 
 if (migrations.length === 0) {
 console.log('✅ All migrations already applied!')
 client.release()
 return
 }

 for (const migration of migrations) {
 console.log(`📄 Applying migration: ${migration.name}`)
 console.log(`📝 ${migration.description}`)
 
 const migrationPath = join(process.cwd(), 'drizzle', migration.name)
 const migrationSQL = readFileSync(migrationPath, 'utf-8')

 const statements = migrationSQL
 .split('--> statement-breakpoint')
 .map(stmt => stmt.trim())
 .filter(stmt => stmt.length > 0)
 
 console.log(`📝 Found ${statements.length} SQL statements to execute`)

 for (let i = 0; i < statements.length; i++) {
 const statement = statements[i]
 if (statement.trim()) {
 try {
 console.log(`⚡ Executing statement ${i + 1}/${statements.length}`)
 await client.query(statement)
 console.log(`✅ Statement ${i + 1} executed successfully`)
 } catch (error) {

 if (error instanceof Error && (
 error.message.includes('already exists') ||
 error.message.includes('duplicate key')
 )) {
 console.log(`⚠️ Statement ${i + 1} skipped (already exists):`, error.message.split('\n')[0])
 } else {
 console.error(`❌ Error executing statement ${i + 1}:`, error)
 throw error
 }
 }
 }
 }
 
 console.log(`🎉 Migration ${migration.name} applied successfully!`)
 }

 console.log('🔍 Verifying database schema...')
 
 const allTablesResult = await client.query(`
 SELECT table_name 
 FROM information_schema.tables 
 WHERE table_schema = 'public' 
 ORDER BY table_name
 `)
 
 console.log('📋 Database tables:')
 allTablesResult.rows.forEach(row => {
 console.log(` ✅ ${row.table_name}`)
 })
 
 client.release()
 
 } catch (error) {
 console.error('❌ Migration failed:', error)
 process.exit(1)
 } finally {
 await pool.end()
 }
}

applyMigration()