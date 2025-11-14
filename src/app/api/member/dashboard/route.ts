

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories/users';
import { db } from '@/lib/database/connection';
import { 
 transactions, 
 creatorFollows, 
 videoLikes, 
 videoSaves,
 videos,
 users,
 memberProfiles
} from '@/lib/database/schema';
import { eq, sql, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
 try {
 const { userId } = await auth();
 
 if (!userId) {
 return NextResponse.json(
 { error: 'Unauthorized' },
 { status: 401 }
 );
 }

 const user = await userRepository.findByClerkId(userId);
 if (!user) {
 return NextResponse.json(
 { error: 'User not found' },
 { status: 404 }
 );
 }

 if (user.role !== 'member') {
 return NextResponse.json(
 { error: 'Access denied. Member role required.' },
 { status: 403 }
 );
 }

 const stats = await getMemberStats(user.id);

 const recentActivity = await getRecentActivity(user.id, 10);

 const followedCreators = await getFollowedCreators(user.id, 5);

 return NextResponse.json({
 success: true,
 data: {
 stats,
 recentActivity,
 followedCreators,
 profile: user.memberProfile
 }
 });
 } catch (error) {
 console.error('Member dashboard API error:', error);
 return NextResponse.json(
 { 
 error: 'Internal server error',
 details: error instanceof Error ? error.message : 'Unknown error'
 },
 { status: 500 }
 );
 }
}

async function getMemberStats(userId: string) {
 try {

 const [
 videosWatchedResult,
 creditsSpentResult,
 followedCreatorsResult,
 memberProfile
 ] = await Promise.all([

 db.select({ count: sql<number>`count(*)` })
 .from(transactions)
 .where(and(
 eq(transactions.userId, userId),
 eq(transactions.type, 'video_view'),
 eq(transactions.status, 'completed')
 )),

 db.select({ total: sql<number>`coalesce(sum(amount), 0)` })
 .from(transactions)
 .where(and(
 eq(transactions.userId, userId),
 eq(transactions.type, 'video_view'),
 eq(transactions.status, 'completed')
 )),

 db.select({ count: sql<number>`count(*)` })
 .from(creatorFollows)
 .where(eq(creatorFollows.followerId, userId)),

 db.select({ walletBalance: memberProfiles.walletBalance })
 .from(memberProfiles)
 .where(eq(memberProfiles.userId, userId))
 .limit(1)
 ]);

 return {
 totalVideosWatched: videosWatchedResult[0]?.count || 0,
 totalCreditsSpent: parseFloat(creditsSpentResult[0]?.total?.toString() || '0'),
 followedCreatorsCount: followedCreatorsResult[0]?.count || 0,
 currentBalance: parseFloat(memberProfile[0]?.walletBalance || '0'),
 favoriteCategory: 'Entertainment', // Default for now
 monthlyGrowth: {
 videosWatched: 0, // Simplified for performance
 creditsSpent: 0,
 newFollows: 0
 }
 };
 } catch (error) {
 console.error('Error getting member stats:', error);
 return {
 totalVideosWatched: 0,
 totalCreditsSpent: 0,
 followedCreatorsCount: 0,
 currentBalance: 0,
 favoriteCategory: 'Entertainment',
 monthlyGrowth: {
 videosWatched: 0,
 creditsSpent: 0,
 newFollows: 0
 }
 };
 }
}

async function getRecentActivity(userId: string, limit: number) {
 try {

 const recentTransactions = await db
 .select({
 id: transactions.id,
 type: transactions.type,
 amount: transactions.amount,
 createdAt: transactions.createdAt
 })
 .from(transactions)
 .where(eq(transactions.userId, userId))
 .orderBy(desc(transactions.createdAt))
 .limit(limit);

 const activities = recentTransactions.map(t => ({
 id: t.id,
 type: t.type === 'video_view' ? 'video_watch' : t.type,
 title: t.type === 'video_view' ? 'Watched Video' : 
 t.type === 'credit_purchase' ? 'Purchased Credits' : 'Transaction',
 description: t.type === 'video_view' ? `Spent ${t.amount} credits` : 
 t.type === 'credit_purchase' ? `Added ${t.amount} credits` : '',
 timestamp: t.createdAt,
 metadata: {
 amount: t.amount
 }
 }));

 return activities;
 } catch (error) {
 console.error('Error getting recent activity:', error);
 return [];
 }
}

async function getFollowedCreators(userId: string, limit: number) {
 try {

 const followedCreators = await db
 .select({
 id: users.id,
 username: users.username,
 avatar: users.avatar,
 followedAt: creatorFollows.createdAt
 })
 .from(creatorFollows)
 .innerJoin(users, eq(creatorFollows.creatorId, users.id))
 .where(eq(creatorFollows.followerId, userId))
 .orderBy(desc(creatorFollows.createdAt))
 .limit(limit);

 return followedCreators.map(creator => ({
 id: creator.id,
 username: creator.username,
 avatar: creator.avatar,
 videoCount: 0, // Will be loaded separately if needed
 totalViews: 0, // Will be loaded separately if needed
 followedAt: creator.followedAt,
 isFollowing: true
 }));
 } catch (error) {
 console.error('Error getting followed creators:', error);
 return [];
 }
}