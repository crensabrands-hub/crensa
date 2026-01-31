import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import * as schema from './schema'

// Set WebSocket constructor for server-side environments
if (typeof window === 'undefined') {
    // Node.js 22+ has built-in WebSocket. Prefer it to avoid 'ws' native module issues.
    if (typeof globalThis.WebSocket !== 'undefined') {
        neonConfig.webSocketConstructor = globalThis.WebSocket;
    } else if (ws) {
        neonConfig.webSocketConstructor = ws;
    } else {
        console.warn('⚠️ No WebSocket constructor found. Database connections might fail.');
    }

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
        max: 20, // Increased max connections
        idleTimeoutMillis: 60000, // 60s
        connectionTimeoutMillis: 30000, // 30s
        maxUses: 7500,
    });

    // Handle pool errors to prevent process crashes
    globalForDb.pool.on('error', (err: Error) => {
        console.error('Unexpected error on idle database client', err);
        globalForDb.pool = undefined;
        globalForDb.db = undefined;
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
