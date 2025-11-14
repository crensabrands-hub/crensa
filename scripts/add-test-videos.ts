

import dotenv from 'dotenv';
import { db } from '../src/lib/database/connection';
import { videos, users } from '../src/lib/database/schema';
import { eq } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

async function addTestVideos() {
 try {
 console.log('Adding test videos for category filtering...');

 const creators = await db.select().from(users).where(eq(users.role, 'creator')).limit(2);
 
 if (creators.length === 0) {
 console.log('No creators found. Please run the seed script first.');
 return;
 }

 const creator1 = creators[0];
 const creator2 = creators[1] || creators[0];

 const testVideos = [
 {
 creatorId: creator1.id,
 title: 'Amazing Dance Moves Tutorial',
 description: 'Learn the latest dance moves that are trending on social media.',
 videoUrl: 'https://example.com/videos/dance-tutorial.mp4',
 thumbnailUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&h=300&fit=crop',
 duration: 180,
 creditCost: '2.00',
 coinPrice: 40, // 2.00 * 20 coins per rupee
 category: 'Dance',
 tags: ['dance', 'tutorial', 'trending', 'moves'],
 viewCount: 450,
 totalEarnings: '90.00',
 isActive: true
 },
 {
 creatorId: creator2.id,
 title: 'Hilarious Comedy Sketch',
 description: 'A funny comedy sketch that will make you laugh out loud.',
 videoUrl: 'https://example.com/videos/comedy-sketch.mp4',
 thumbnailUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
 duration: 240,
 creditCost: '1.50',
 coinPrice: 30, // 1.50 * 20 coins per rupee
 category: 'Comedy',
 tags: ['comedy', 'funny', 'sketch', 'humor'],
 viewCount: 680,
 totalEarnings: '102.00',
 isActive: true
 },
 {
 creatorId: creator1.id,
 title: 'Learn JavaScript in 10 Minutes',
 description: 'Quick JavaScript tutorial for beginners covering the basics.',
 videoUrl: 'https://example.com/videos/javascript-tutorial.mp4',
 thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
 duration: 600,
 creditCost: '3.00',
 coinPrice: 60, // 3.00 * 20 coins per rupee
 category: 'Education',
 tags: ['javascript', 'programming', 'tutorial', 'coding'],
 viewCount: 320,
 totalEarnings: '96.00',
 isActive: true
 },
 {
 creatorId: creator2.id,
 title: 'Relaxing Music for Study',
 description: 'Peaceful instrumental music perfect for studying and concentration.',
 videoUrl: 'https://example.com/videos/study-music.mp4',
 thumbnailUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
 duration: 1800,
 creditCost: '1.00',
 coinPrice: 20, // 1.00 * 20 coins per rupee
 category: 'Music',
 tags: ['music', 'instrumental', 'study', 'relaxing'],
 viewCount: 890,
 totalEarnings: '89.00',
 isActive: true
 },
 {
 creatorId: creator1.id,
 title: 'Quick Pasta Recipe',
 description: 'Learn to make delicious pasta in just 15 minutes.',
 videoUrl: 'https://example.com/videos/pasta-recipe.mp4',
 thumbnailUrl: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop',
 duration: 900,
 creditCost: '2.50',
 coinPrice: 50, // 2.50 * 20 coins per rupee
 category: 'Cooking',
 tags: ['cooking', 'recipe', 'pasta', 'quick'],
 viewCount: 560,
 totalEarnings: '140.00',
 isActive: true
 },
 {
 creatorId: creator2.id,
 title: '10 Minute Home Workout',
 description: 'Effective home workout routine that requires no equipment.',
 videoUrl: 'https://example.com/videos/home-workout.mp4',
 thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
 duration: 600,
 creditCost: '2.00',
 coinPrice: 40, // 2.00 * 20 coins per rupee
 category: 'Fitness',
 tags: ['fitness', 'workout', 'home', 'exercise'],
 viewCount: 720,
 totalEarnings: '144.00',
 isActive: true
 }
 ];

 const insertedVideos = await db.insert(videos).values(testVideos).returning();
 
 console.log(`Successfully added ${insertedVideos.length} test videos:`);
 insertedVideos.forEach(video => {
 console.log(`- ${video.title} (${video.category})`);
 });

 console.log('\nTest videos added successfully! You can now test category filtering.');

 } catch (error) {
 console.error('Error adding test videos:', error);
 throw error;
 }
}

if (require.main === module) {
 addTestVideos()
 .then(() => {
 console.log('Script completed successfully');
 process.exit(0);
 })
 .catch((error) => {
 console.error('Script failed:', error);
 process.exit(1);
 });
}

export { addTestVideos };