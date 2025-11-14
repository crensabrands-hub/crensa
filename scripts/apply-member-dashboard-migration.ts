

import { Pool } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

config({ path: '.env.local' })

async function applyMigration() {
 const connectionString = process.env.DATABASE_URL
 
 if (!connectionString) {
 throw new Error('DATABASE_URL is required')
 }

 const pool = new Pool({ connectionString })
 
 try {
 console.log('Connecting to database...')
 const client = await pool.connect()

 const migrationPath = join(process.cwd(), 'drizzle', '0007_add_member_dashboard_features.sql')
 const migrationSQL = readFileSync(migrationPath, 'utf-8')
 
 console.log('Applying member dashboard migration...')

 const statements = migrationSQL
 .split(';')
 .map(stmt => stmt.trim())
 .filter(stmt => stmt.length > 0)
 
 for (const statement of statements) {
 if (statement.trim()) {
 console.log(`Executing: ${statement.substring(0, 50)}...`)
 await client.query(statement)
 }
 }
 
 console.log('Migration applied successfully!')
 client.release()
 
 } catch (error) {
 console.error('Migration failed:', error)
 throw error
 } finally {
 await pool.end()
 }
}

applyMigration()
 .then(() => {
 console.log('Member dashboard migration completed successfully')
 process.exit(0)
 })
 .catch((error) => {
 console.error('Migration failed:', error)
 process.exit(1)
 })