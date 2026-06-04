import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool, neonConfig } from '@neondatabase/serverless'
import * as schema from './schema'

// In Vercel/production, Node 22+ has a native WebSocket.
// In older Node or local dev, fall back to the 'ws' package.
if (typeof window === 'undefined') {
    if (typeof globalThis.WebSocket !== 'undefined') {
        neonConfig.webSocketConstructor = globalThis.WebSocket;
    } else {
        // Dynamic require so Next.js doesn't try to bundle 'ws' for the client
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const ws = require('ws');
        neonConfig.webSocketConstructor = ws;
    }
}

function getDatabaseUrl(): string {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL is required');
    }
    // channel_binding=require is not supported by Neon's serverless WebSocket driver
    // Strip it to prevent connection failures in serverless environments
    return databaseUrl.replace(/[?&]channel_binding=require/g, (match) =>
        match.startsWith('?') ? '?' : ''
    ).replace(/\?$/, '');
}

// Singleton pattern for database connection in Next.js development
const globalForDb = global as unknown as {
    pool: Pool | undefined;
    db: ReturnType<typeof drizzle> | undefined;
};

const connectionString = getDatabaseUrl();

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
