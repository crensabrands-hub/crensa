import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL);

import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import * as schema from './schema'

if (typeof window === 'undefined') {
    neonConfig.webSocketConstructor = ws
}

function getDatabaseUrl(): string {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error('DATABASE_URL is required');
    }

    return databaseUrl;
}

const connectionString = getDatabaseUrl()
const pool = new Pool({
    connectionString,
    max: 20, // Maximum number of connections in the pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 10000, // Timeout for new connections
    maxUses: 7500, // Maximum number of times a connection can be used
})

export const db = drizzle(pool, { schema })

export async function testDatabaseConnection(): Promise<boolean> {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}

export async function closeDatabaseConnection(): Promise<void> {
    await pool.end()
}

export { schema }