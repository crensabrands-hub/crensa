import type { Config } from 'drizzle-kit'
import { config } from 'dotenv'

config({ path: '.env.local' })

export default {
 schema: './src/lib/database/schema.ts',
 out: './drizzle',
 dialect: 'postgresql',
 dbCredentials: {
 url: process.env.DATABASE_URL!,
 ssl: {
 rejectUnauthorized: false
 }
 },
 verbose: true,
 strict: true
} satisfies Config