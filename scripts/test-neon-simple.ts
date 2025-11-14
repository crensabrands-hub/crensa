#!/usr/bin/env tsx

import { config } from 'dotenv';
import { Pool } from '@neondatabase/serverless';

config({ path: '.env.local' });

async function testNeonConnection() {
 const databaseUrl = process.env.DATABASE_URL;
 
 if (!databaseUrl) {
 console.error('❌ DATABASE_URL not found in environment');
 process.exit(1);
 }
 
 console.log('🔍 Testing Neon connection...');
 console.log('📍 Database URL:', databaseUrl.replace(/:[^:@]*@/, ':****@'));
 
 const pool = new Pool({ connectionString: databaseUrl });
 
 try {
 const client = await pool.connect();
 console.log('✅ Connected to Neon database');

 const result = await client.query('SELECT version()');
 console.log('✅ Database version:', result.rows[0].version);

 const tablesResult = await client.query(`
 SELECT table_name 
 FROM information_schema.tables 
 WHERE table_schema = 'public' 
 AND table_name IN ('users', 'creator_profiles', 'member_profiles')
 `);
 
 console.log('📋 Found tables:', tablesResult.rows.map(r => r.table_name));
 
 client.release();
 await pool.end();
 
 console.log('✅ Neon connection test completed successfully!');
 
 } catch (error) {
 console.error('❌ Neon connection failed:', error);
 await pool.end();
 process.exit(1);
 }
}

testNeonConnection();