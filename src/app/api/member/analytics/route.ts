

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories/users';
import { db } from '@/lib/database/connection';
import { 
 transactions, 
 videos,
 users,
 creatorFollows,
 videoLikes,
 videoSaves
} from '@/lib/database/schema';
import { eq, sql, desc, and, gte, lte } from 'drizzle-orm';

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

 const { searchParams } = new URL(request.url);
 const period = searchParams.get('period') || '30'; // days
 const startDate = searchParams.get('startDate');
 const endDate = searchParams.get('endDate');

 let dateFilter;
 if (startDate && endDate) {
 dateFilter = and(
 gte(transactions.createdAt, new Date(startDate)),
 lte(transactions.createdAt, new Date(endDate))
 );
 } else {
 const daysAgo = new Date();
 daysAgo.setDate(daysAgo.getDate() - parseInt(period));
 dateFilter = gte(transactions.createdAt, daysAgo);
 }

 const viewingHistory = await getViewingHistory(user.id, dateFilter);
 const spendingAnalytics = await getSpendingAnalytics(user.id, dateFilter);
 const engagementMetrics = await getEngagementMetrics(user.id, dateFilter);
 const categoryPreferences = await getCategoryPreferences(user.id, dateFilter);
 const timeAnalytics = await getTimeAnalytics(user.id, dateFilter);

 return NextResponse.json({
 success: true,
 data: {
 viewingHistory,
 spendingAnalytics,
 engagementMetrics,
 categoryPreferences,
 timeAnalytics,
 period: parseInt(period),
 dateRange: {
 start: startDate || new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString(),
 end: endDate || new Date().toISOString()
 }
 }
 });
 } catch (error) {
 console.error('Member analytics API error:', error);
 return NextResponse.json(
 { 
 error: 'Internal server error',
 details: error instanceof Error ? error.message : 'Unknown error'
 },
 { status: 500 }
 );
 }
}

async function getViewingHistory(userId: string, dateFilter: any) {
 try {

 const dailyViews = await db
 .select({
 date: sql<string>`date(${transactions.createdAt})`,
 count: sql<number>`count(*)`,
 totalSpent: sql<number>`sum(${transactions.amount})`
 })
 .from(transactions)
 .where(and(
 eq(transactions.userId, userId),
 eq(transactions.type, 'video_view'),
 eq(transactions.status, 'completed'),
 dateFilter
 ))
 .groupBy(sql`date(${transactions.createdAt})`)
 .orderBy(sql`date(${transactions.createdAt})`);

 const categoryViews = await db
 .select({
 category: videos.category,
 count: sql<number>`count(*)`,
 totalSpent: sql<number>`sum(${transactions.amount})`
 })
 .from(transactions)
 .innerJoin(videos, eq(transactions.videoId, videos.id))
 .where(and(
 eq(transactions.userId, userId),
 eq(transactions.type, 'video_view'),
 eq(transactions.status, 'completed'),
 dateFilter
 ))
 .groupBy(videos.category)
 .orderBy(desc(sql`count(*)`))
 .limit(10);

 const [totalStats] = await db
 .select({
 totalVideos: sql<number>`count(*)`,
 totalSpent: sql<number>`sum(${transactions.amount})`,
 avgPerVideo: sql<number>`avg(${transactions.amount})`
 })
 .from(transactions)
 .where(and(
 eq(transactions.userId, userId),
 eq(transactions.type, 'video_view'),
 eq(transactions.status, 'completed'),
 dateFilter
 ));

 return {
 dailyViews,
 categoryViews,
 totalStats: {
 totalVideos: totalStats.totalVideos || 0,
 totalSpent: parseFloat(totalStats.totalSpent?.toString() || '0'),
 avgPerVideo: parseFloat(totalStats.avgPerVideo?.toString() || '0')
 }
 };
 } catch (error) {
 console.error('Error getting viewing history:', error);
 return {
 dailyViews: [],
 categoryViews: [],
 totalStats: { totalVideos: 0, totalSpent: 0, avgPerVideo: 0 }
 };
 }
}

async function getSpendingAnalytics(userId: string, dateFilter: any) {
 try {

 const spendingByType = await db
 .select({
 type: transactions.type,
 count: sql<number>`count(*)`,
 totalAmount: sql<number>`sum(${transactions.amount})`
 })
 .from(transactions)
 .where(and(
 eq(transactions.userId, userId),
 eq(transactions.status, 'completed'),
 dateFilter
 ))
 .groupBy(transactions.type)
 .orderBy(desc(sql`sum(${transactions.amount})`));

 const monthlySpending = await db
 .select({
 month: sql<string>`date_trunc('month', ${transactions.createdAt})`,
 totalSpent: sql<number>`sum(case when ${transactions.type} = 'video_view' then ${transactions.amount} else 0 end)`,
 creditsAdded: sql<number>`sum(case when ${transactions.type} = 'credit_purchase' then ${transactions.amount} else 0 end)`
 })
 .from(transactions)
 .where(and(
 eq(transactions.userId, userId),
 eq(transactions.status, 'completed'),
 dateFilter
 ))
 .groupBy(sql`date_trunc('month', ${transactions.createdAt})`)
 .orderBy(sql`date_trunc('month', ${transactions.createdAt})`);

 return {
 spendingByType: spendingByType.map(item => ({
 type: item.type,
 count: item.count,
 totalAmount: parseFloat(item.totalAmount?.toString() || '0')
 })),
 monthlySpending: monthlySpending.map(item => ({
 month: item.month,
 totalSpent: parseFloat(item.totalSpent?.toString() || '0'),
 creditsAdded: parseFloat(item.creditsAdded?.toString() || '0')
 }))
 };
 } catch (error) {
 console.error('Error getting spending analytics:', error);
 return {
 spendingByType: [],
 monthlySpending: []
 };
 }
}

async function getEngagementMetrics(userId: string, dateFilter: any) {
 try {

 const [likesGiven] = await db
 .select({ count: sql<number>`count(*)` })
 .from(videoLikes)
 .where(and(
 eq(videoLikes.userId, userId),
 dateFilter ? gte(videoLikes.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) : sql`true`
 ));

 const [savesMade] = await db
 .select({ count: sql<number>`count(*)` })
 .from(videoSaves)
 .where(and(
 eq(videoSaves.userId, userId),
 dateFilter ? gte(videoSaves.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) : sql`true`
 ));

 const [followsMade] = await db
 .select({ count: sql<number>`count(*)` })
 .from(creatorFollows)
 .where(and(
 eq(creatorFollows.followerId, userId),
 dateFilter ? gte(creatorFollows.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) : sql`true`
 ));

 const creatorEngagement = await db
 .select({
 creatorId: users.id,
 creatorUsername: users.username,
 creatorAvatar: users.avatar,
 videosWatched: sql<number>`count(distinct ${transactions.videoId})`,
 totalSpent: sql<number>`sum(${transactions.amount})`
 })
 .from(transactions)
 .innerJoin(videos, eq(transactions.videoId, videos.id))
 .innerJoin(users, eq(videos.creatorId, users.id))
 .where(and(
 eq(transactions.userId, userId),
 eq(transactions.type, 'video_view'),
 eq(transactions.status, 'completed'),
 dateFilter
 ))
 .groupBy(users.id, users.username, users.avatar)
 .orderBy(desc(sql`sum(${transactions.amount})`))
 .limit(10);

 return {
 likesGiven: likesGiven.count || 0,
 savesMade: savesMade.count || 0,
 followsMade: followsMade.count || 0,
 creatorEngagement: creatorEngagement.map(item => ({
 creatorId: item.creatorId,
 creatorUsername: item.creatorUsername,
 creatorAvatar: item.creatorAvatar,
 videosWatched: item.videosWatched,
 totalSpent: parseFloat(item.totalSpent?.toString() || '0')
 }))
 };
 } catch (error) {
 console.error('Error getting engagement metrics:', error);
 return {
 likesGiven: 0,
 savesMade: 0,
 followsMade: 0,
 creatorEngagement: []
 };
 }
}

async function getCategoryPreferences(userId: string, dateFilter: any) {
 try {
 const categoryStats = await db
 .select({
 category: videos.category,
 videosWatched: sql<number>`count(*)`,
 totalSpent: sql<number>`sum(${transactions.amount})`,
 avgCostPerVideo: sql<number>`avg(${transactions.amount})`
 })
 .from(transactions)
 .innerJoin(videos, eq(transactions.videoId, videos.id))
 .where(and(
 eq(transactions.userId, userId),
 eq(transactions.type, 'video_view'),
 eq(transactions.status, 'completed'),
 dateFilter
 ))
 .groupBy(videos.category)
 .orderBy(desc(sql`count(*)`));

 return categoryStats.map(item => ({
 category: item.category,
 videosWatched: item.videosWatched,
 totalSpent: parseFloat(item.totalSpent?.toString() || '0'),
 avgCostPerVideo: parseFloat(item.avgCostPerVideo?.toString() || '0')
 }));
 } catch (error) {
 console.error('Error getting category preferences:', error);
 return [];
 }
}

async function getTimeAnalytics(userId: string, dateFilter: any) {
 try {

 const hourlyActivity = await db
 .select({
 hour: sql<number>`extract(hour from ${transactions.createdAt})`,
 count: sql<number>`count(*)`
 })
 .from(transactions)
 .where(and(
 eq(transactions.userId, userId),
 eq(transactions.type, 'video_view'),
 eq(transactions.status, 'completed'),
 dateFilter
 ))
 .groupBy(sql`extract(hour from ${transactions.createdAt})`)
 .orderBy(sql`extract(hour from ${transactions.createdAt})`);

 const weeklyActivity = await db
 .select({
 dayOfWeek: sql<number>`extract(dow from ${transactions.createdAt})`,
 count: sql<number>`count(*)`
 })
 .from(transactions)
 .where(and(
 eq(transactions.userId, userId),
 eq(transactions.type, 'video_view'),
 eq(transactions.status, 'completed'),
 dateFilter
 ))
 .groupBy(sql`extract(dow from ${transactions.createdAt})`)
 .orderBy(sql`extract(dow from ${transactions.createdAt})`);

 return {
 hourlyActivity: hourlyActivity.map(item => ({
 hour: item.hour,
 count: item.count
 })),
 weeklyActivity: weeklyActivity.map(item => ({
 dayOfWeek: item.dayOfWeek,
 count: item.count
 }))
 };
 } catch (error) {
 console.error('Error getting time analytics:', error);
 return {
 hourlyActivity: [],
 weeklyActivity: []
 };
 }
}