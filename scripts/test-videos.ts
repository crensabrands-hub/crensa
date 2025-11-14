#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { db } from '../src/lib/database/connection';
import { videos, users } from '../src/lib/database/schema';
import { eq } from 'drizzle-orm';

async function testVideos() {
 try {
 console.log('Testing video database...');

 const allVideos = await db
 .select({
 id: videos.id,
 title: videos.title,
 category: videos.category,
 isActive: videos.isActive,
 creatorId: videos.creatorId
 })
 .from(videos)
 .limit(10);

 console.log(`Found ${allVideos.length} videos in database:`);
 allVideos.forEach((video, index) => {
 console.log(`${index + 1}. ${video.title} (${video.category}) - Active: ${video.isActive} - ID: ${video.id}`);
 });

 const creators = await db
 .select({
 id: users.id,
 username: users.username,
 role: users.role
 })
 .from(users)
 .where(eq(users.role, 'creator'))
 .limit(5);

 console.log(`\nFound ${creators.length} creators in database:`);
 creators.forEach((creator, index) => {
 console.log(`${index + 1}. ${creator.username} - ID: ${creator.id}`);
 });

 if (allVideos.length > 0) {
 const testVideoId = allVideos[0].id;
 console.log(`\nTesting lookup for video ID: ${testVideoId}`);
 
 const videoWithCreator = await db
 .select({
 video: videos,
 creator: users
 })
 .from(videos)
 .innerJoin(users, eq(videos.creatorId, users.id))
 .where(eq(videos.id, testVideoId))
 .limit(1);

 if (videoWithCreator.length > 0) {
 console.log('✅ Video lookup successful');
 console.log('Video:', videoWithCreator[0].video.title);
 console.log('Creator:', videoWithCreator[0].creator.username);
 } else {
 console.log('❌ Video lookup failed');
 }
 }

 } catch (error) {
 console.error('Error testing videos:', error);
 }
}

testVideos()
 .then(() => {
 console.log('\nTest completed');
 process.exit(0);
 })
 .catch((error) => {
 console.error('Test failed:', error);
 process.exit(1);
 });