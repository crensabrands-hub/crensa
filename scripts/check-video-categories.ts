import 'dotenv/config';
import { db } from '../src/lib/database/connection';
import { videos } from '../src/lib/database/schema';
import { sql } from 'drizzle-orm';

async function checkVideoCategories() {
 try {
 console.log('Checking video categories in database...\n');

 const categories = await db
 .select({
 category: videos.category,
 count: sql<number>`count(*)`,
 })
 .from(videos)
 .where(sql`${videos.isActive} = true`)
 .groupBy(videos.category)
 .orderBy(sql`count(*) DESC`);

 console.log('Categories found:');
 console.table(categories);

 const totalVideos = await db
 .select({ count: sql<number>`count(*)` })
 .from(videos)
 .where(sql`${videos.isActive} = true`);

 console.log(`\nTotal active videos: ${totalVideos[0]?.count || 0}`);

 const sampleVideos = await db
 .select({
 id: videos.id,
 title: videos.title,
 category: videos.category,
 isActive: videos.isActive,
 })
 .from(videos)
 .limit(10);

 console.log('\nSample videos:');
 console.table(sampleVideos);

 } catch (error) {
 console.error('Error checking video categories:', error);
 } finally {
 process.exit(0);
 }
}

checkVideoCategories();
