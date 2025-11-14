#!/usr/bin/env node

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
 connectionString: process.env.DATABASE_URL,
});

const createTableSQL = `
-- Create profile_visits table
CREATE TABLE IF NOT EXISTS "profile_visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"visited_at" timestamp DEFAULT now() NOT NULL,
	"source" varchar(50) NOT NULL,
	"duration" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "profile_visits" ADD CONSTRAINT "profile_visits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "profile_visits" ADD CONSTRAINT "profile_visits_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "profile_visits_user_id_idx" ON "profile_visits" ("user_id");
CREATE INDEX IF NOT EXISTS "profile_visits_creator_id_idx" ON "profile_visits" ("creator_id");
CREATE INDEX IF NOT EXISTS "profile_visits_visited_at_idx" ON "profile_visits" ("visited_at");
CREATE INDEX IF NOT EXISTS "profile_visits_source_idx" ON "profile_visits" ("source");
`;

async function createTable() {
 try {
 console.log('Creating profile_visits table...');
 await pool.query(createTableSQL);
 console.log('✅ profile_visits table created successfully!');

 const result = await pool.query('SELECT COUNT(*) FROM profile_visits');
 console.log(`✅ Table is working. Current rows: ${result.rows[0].count}`);
 
 } catch (error) {
 console.error('❌ Error creating table:', error.message);
 } finally {
 await pool.end();
 }
}

createTable();