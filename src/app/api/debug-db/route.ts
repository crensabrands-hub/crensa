import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// TEMPORARY DIAGNOSTIC ENDPOINT — remove after debugging
// Access: GET /api/debug-db
export async function GET() {
  const result: Record<string, any> = {};

  // 1. Check env var presence
  const raw = process.env.DATABASE_URL;
  result.env_present = !!raw;
  result.env_length = raw?.length ?? 0;

  if (!raw) {
    return NextResponse.json({ ...result, error: 'DATABASE_URL is not set' }, { status: 500 });
  }

  // 2. Parse the URL safely (no credentials in response)
  try {
    const parsed = new URL(raw);
    result.protocol = parsed.protocol;
    result.hostname = parsed.hostname;
    result.port = parsed.port || '5432 (default)';
    result.database = parsed.pathname.slice(1);
    result.has_username = !!parsed.username;
    result.has_password = !!parsed.password;
    result.sslmode = parsed.searchParams.get('sslmode');
    result.channel_binding = parsed.searchParams.get('channel_binding');
    result.is_pooled = parsed.hostname.includes('-pooler');
  } catch (e) {
    result.url_parse_error = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ...result, error: 'Failed to parse DATABASE_URL' }, { status: 500 });
  }

  // 3. Strip channel_binding exactly as connection.ts does
  const cleaned = raw
    .replace(/[?&]channel_binding=require/g, (match) => match.startsWith('?') ? '?' : '')
    .replace(/\?$/, '');
  result.url_changed_by_strip = cleaned !== raw;

  // 4. Attempt raw query
  try {
    const sql = neon(cleaned);
    const rows = await sql`SELECT current_database() as db, current_user as db_user, version() as pg_version`;
    result.query_success = true;
    result.connected_db = rows[0]?.db;
    result.connected_user = rows[0]?.db_user;
    result.pg_version = (rows[0]?.pg_version as string)?.split(' ').slice(0, 2).join(' ');
  } catch (e: any) {
    result.query_success = false;
    result.query_error = e?.message ?? String(e);
    result.query_error_code = e?.code;
    result.query_error_cause = e?.cause?.message ?? null;
  }

  const status = result.query_success ? 200 : 500;
  return NextResponse.json(result, { status });
}
