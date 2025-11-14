

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

if (require.main === module) {
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