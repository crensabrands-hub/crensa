

import { db } from '../src/lib/database/connection';
import { notifications, users } from '../src/lib/database/schema';
import { eq } from 'drizzle-orm';

async function seedNotifications() {
 try {
 console.log('Seeding test notifications...');

 const existingUsers = await db.select().from(users).limit(4);
 
 if (existingUsers.length === 0) {
 console.log('No users found. Please run the main seed script first.');
 return;
 }

 console.log(`Found ${existingUsers.length} users`);

 const testNotifications = [];

 for (const user of existingUsers) {

 if (user.role === 'creator') {
 testNotifications.push(
 {
 userId: user.id,
 type: 'earning' as const,
 title: 'New Earning! 💰',
 message: `You earned ₹25.50 from "Creative Process Behind My Latest Art"`,
 isRead: false,
 metadata: {
 videoId: 'video-123',
 transactionId: 'txn-456',
 amount: 25.50,
 actionUrl: '/creator/analytics?video=video-123',
 },
 },
 {
 userId: user.id,
 type: 'follower' as const,
 title: 'New Follower! 👤',
 message: `John Doe (@johndoe) started following you`,
 isRead: false,
 metadata: {
 followerId: 'follower-123',
 followerUsername: 'johndoe',
 actionUrl: '/creator/analytics?tab=followers',
 },
 },
 {
 userId: user.id,
 type: 'comment' as const,
 title: 'New Comment! 💬',
 message: `Sarah commented on "Digital Painting Masterclass": "Amazing tutorial!"`,
 isRead: true,
 metadata: {
 videoId: 'video-456',
 commentId: 'comment-789',
 commenterId: 'commenter-123',
 actionUrl: '/creator/videos/video-456?comment=comment-789',
 },
 },
 {
 userId: user.id,
 type: 'like' as const,
 title: 'Video Liked! ❤️',
 message: `Mike liked your video "Color Theory Fundamentals"`,
 isRead: true,
 metadata: {
 videoId: 'video-789',
 likerId: 'liker-456',
 actionUrl: '/creator/videos/video-789',
 },
 }
 );
 } else {

 testNotifications.push(
 {
 userId: user.id,
 type: 'payment' as const,
 title: 'Payment Successful! ✅',
 message: `Successfully added ₹50 credits to your wallet!`,
 isRead: false,
 metadata: {
 transactionId: 'txn-payment-123',
 amount: 50,
 type: 'credit_purchase',
 status: 'completed',
 actionUrl: '/wallet',
 },
 },
 {
 userId: user.id,
 type: 'system' as const,
 title: 'Welcome to Crensa! 🎉',
 message: 'Discover amazing content and support your favorite creators!',
 isRead: true,
 metadata: {
 actionUrl: '/dashboard',
 isWelcome: true,
 },
 },
 {
 userId: user.id,
 type: 'system' as const,
 title: 'New Feature Available! ✨',
 message: 'Check out our new video discovery features in the Discover tab',
 isRead: false,
 metadata: {
 actionUrl: '/discover',
 featureName: 'enhanced-discovery',
 },
 }
 );
 }
 }

 const batchSize = 10;
 let insertedCount = 0;

 for (let i = 0; i < testNotifications.length; i += batchSize) {
 const batch = testNotifications.slice(i, i + batchSize);
 await db.insert(notifications).values(batch);
 insertedCount += batch.length;
 console.log(`Inserted ${insertedCount}/${testNotifications.length} notifications`);
 }

 console.log(`✅ Successfully seeded ${insertedCount} test notifications!`);

 for (const user of existingUsers) {
 const userNotifications = await db
 .select()
 .from(notifications)
 .where(eq(notifications.userId, user.id));
 
 const unreadCount = userNotifications.filter(n => !n.isRead).length;
 console.log(`📧 ${user.username} (${user.role}): ${userNotifications.length} total, ${unreadCount} unread`);
 }

 } catch (error) {
 console.error('❌ Failed to seed notifications:', error);
 throw error;
 }
}

if (require.main === module) {
 seedNotifications()
 .then(() => {
 console.log('✅ Notification seeding completed');
 process.exit(0);
 })
 .catch((error) => {
 console.error('❌ Notification seeding failed:', error);
 process.exit(1);
 });
}

export { seedNotifications };