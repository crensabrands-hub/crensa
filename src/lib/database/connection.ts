import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

function getDatabaseUrl(): string {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL is required');
    }
    // channel_binding=require is not supported by Neon's serverless HTTP driver — strip it
    return databaseUrl
        .replace(/[?&]channel_binding=require/g, (match) => match.startsWith('?') ? '?' : '')
        .replace(/\?$/, '');
}

const connectionString = getDatabaseUrl();
const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

// Pool export kept for backward compat — not used in serverless context
export const pool = null as any;

export async function testDatabaseConnection(): Promise<boolean> {
    try {
        await sql`SELECT 1`;
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}

export async function closeDatabaseConnection(): Promise<void> {
    // No-op for HTTP driver — no persistent connection to close
}

export { schema }
