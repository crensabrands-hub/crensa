import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

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

// Only run if executed directly via npm run db:migrate
const isMainModule = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('migrate.ts');

if (isMainModule) {
 console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL);
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
