import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL);

import { migrate } from 'drizzle-orm/neon-serverless/migrator'
import { db, closeDatabaseConnection } from './connection'

export async function runMigrations() {
 try {
 console.log('Running database migrations...')
 await migrate(db, { migrationsFolder: './drizzle' })
 console.log('Migrations completed successfully')
 } catch (error) {
 console.error('Migration failed:', error)
 throw error
 } finally {
 await closeDatabaseConnection()
 }
}

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
 runMigrations()
 .then(() => {
 console.log('Migration process completed')
 process.exit(0)
 })
 .catch((error) => {
 console.error('Migration process failed:', error)
 process.exit(1)
 })
}