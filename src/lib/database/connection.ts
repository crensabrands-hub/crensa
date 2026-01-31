import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import * as schema from './schema'

// Set WebSocket constructor for server-side environments
if (typeof window === 'undefined') {
    neonConfig.webSocketConstructor = ws;
    // Enable connection caching for better performance and stability
    neonConfig.fetchConnectionCache = true;
}

function getDatabaseUrl(): string {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL is required');
    }
    return databaseUrl;
}

// Singleton pattern for database connection in Next.js development
const globalForDb = global as unknown as {
    pool: Pool | undefined;
    db: ReturnType<typeof drizzle> | undefined;
};

const connectionString = getDatabaseUrl();

// Log connection attempt (masked)
if (typeof window === 'undefined') {
    const maskedUrl = connectionString.replace(/:[^@:]+@/, ':****@');
    console.log(`🔌 Connecting to database: ${maskedUrl.split('@')[1] || 'URL format unexpected'}`);
}

if (!globalForDb.pool) {
    globalForDb.pool = new Pool({
        connectionString,
        max: 20,
        idleTimeoutMillis: 60000, // Increase idle timeout to 60s
        connectionTimeoutMillis: 30000, // Increase connection timeout to 30s
        maxUses: 7500,
    });
}

if (!globalForDb.db) {
    globalForDb.db = drizzle(globalForDb.pool, { schema });
}

export const pool = globalForDb.pool;
export const db = globalForDb.db;

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
    if (globalForDb.pool) {
        await globalForDb.pool.end();
        globalForDb.pool = undefined;
        globalForDb.db = undefined;
    }
}

export { schema }
