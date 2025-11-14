

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { db } from "../src/lib/database/connection";
import { categories } from "../src/lib/database/schema";
import { sql } from "drizzle-orm";

async function checkAndSeedCategories() {
 try {
 console.log("🔍 Checking categories table...");

 const existingCategories = await db
 .select()
 .from(categories);

 console.log(`Found ${existingCategories.length} categories`);

 if (existingCategories.length > 0) {
 console.log("\n📋 Existing categories:");
 existingCategories.forEach(cat => {
 console.log(` - ${cat.name} (slug: ${cat.slug})`);
 });
 }

 if (existingCategories.length === 0) {
 console.log("\n🌱 Seeding default categories...");

 const defaultCategories = [
 {
 name: 'Entertainment',
 slug: 'entertainment',
 description: 'Fun and entertaining content',
 displayOrder: 1,
 isActive: true,
 },
 {
 name: 'Education',
 slug: 'education',
 description: 'Educational and learning content',
 displayOrder: 2,
 isActive: true,
 },
 {
 name: 'Music',
 slug: 'music',
 description: 'Music videos and performances',
 displayOrder: 3,
 isActive: true,
 },
 {
 name: 'Comedy',
 slug: 'comedy',
 description: 'Funny and humorous content',
 displayOrder: 4,
 isActive: true,
 },
 {
 name: 'Lifestyle',
 slug: 'lifestyle',
 description: 'Lifestyle and personal content',
 displayOrder: 5,
 isActive: true,
 },
 {
 name: 'Technology',
 slug: 'technology',
 description: 'Tech reviews and tutorials',
 displayOrder: 6,
 isActive: true,
 },
 {
 name: 'Gaming',
 slug: 'gaming',
 description: 'Gaming content and streams',
 displayOrder: 7,
 isActive: true,
 },
 {
 name: 'Sports',
 slug: 'sports',
 description: 'Sports and fitness content',
 displayOrder: 8,
 isActive: true,
 },
 {
 name: 'Dance',
 slug: 'dance',
 description: 'Dance performances and tutorials',
 displayOrder: 9,
 isActive: true,
 },
 ];

 await db.insert(categories).values(defaultCategories);
 console.log("✅ Default categories seeded successfully");
 }

 console.log("\n🎬 Checking categories used in videos...");
 const videoCategories = await db.execute(sql`
 SELECT DISTINCT category, COUNT(*) as count
 FROM videos
 WHERE is_active = true AND moderation_status = 'approved'
 GROUP BY category
 ORDER BY count DESC
 `);

 console.log("Video categories:");
 videoCategories.rows.forEach((row: any) => {
 console.log(` - ${row.category}: ${row.count} videos`);
 });

 console.log("\n📺 Checking categories used in series...");
 const seriesCategories = await db.execute(sql`
 SELECT DISTINCT category, COUNT(*) as count
 FROM series
 WHERE is_active = true AND moderation_status = 'approved'
 GROUP BY category
 ORDER BY count DESC
 `);

 console.log("Series categories:");
 seriesCategories.rows.forEach((row: any) => {
 console.log(` - ${row.category}: ${row.count} series`);
 });

 console.log("\n✅ Category check complete!");

 } catch (error) {
 console.error("❌ Error:", error);
 process.exit(1);
 }
}

checkAndSeedCategories()
 .then(() => process.exit(0))
 .catch((error) => {
 console.error(error);
 process.exit(1);
 });
