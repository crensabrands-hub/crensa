

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories/users';
import { videoRepository } from '@/lib/database/repositories/videos';
import { sql, and, eq, gte, lte, desc } from 'drizzle-orm';
import { db } from '@/lib/database/connection';
import { videos, coinTransactions } from '@/lib/database/schema';
import { coinsToRupees } from '@/lib/utils/coin-utils';

interface AnalyticsData {
 summary: {
 totalCoinsEarned: number;
 totalCoinsEarnedRupees: number;
 totalViews: number;
 totalVideos: number;
 avgCoinsPerVideo: number;
 avgCoinsPerVideoRupees: number;
 avgViewsPerVideo: number;
 };
 charts: {
 earnings: { date: string; coins: number; rupees: number }[];
 views: { date: string; views: number }[];
 };
 videoPerformance: {
 id: string;
 title: string;
 views: number;
 coinsEarned: number;
 coinsEarnedRupees: number;
 coinPrice: number;
 coinPriceRupees: number;
 createdAt: string;
 category: string;
 }[];
 transactions: {
 id: string;
 coins: number;
 rupees: number;
 contentType?: string;
 contentId: string | null;
 createdAt: string;
 description: string;
 }[];
}

interface AnalyticsError {
 error: string;
 details?: string;
 code?: string;
}

export async function GET(request: NextRequest) {
 try {
 const { userId } = await auth();
 
 if (!userId) {
 return NextResponse.json(
 { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
 { status: 401 }
 );
 }

 const user = await userRepository.findByClerkId(userId);
 if (!user) {
 return NextResponse.json(
 { error: 'User not found', code: 'USER_NOT_FOUND' },
 { status: 404 }
 );
 }

 if (user.role !== 'creator') {
 return NextResponse.json(
 { error: 'Access denied. Creator role required.', code: 'INSUFFICIENT_PERMISSIONS' },
 { status: 403 }
 );
 }

 const { searchParams } = new URL(request.url);
 const timeRange = searchParams.get('timeRange') || 'month';
 const startDate = searchParams.get('startDate');
 const endDate = searchParams.get('endDate');
 const videoId = searchParams.get('videoId'); // For individual video analytics

 if (!['week', 'month', 'year'].includes(timeRange)) {
 return NextResponse.json(
 { error: 'Invalid time range. Must be week, month, or year.', code: 'INVALID_TIME_RANGE' },
 { status: 400 }
 );
 }

 let dateFilter: { start: Date; end: Date };
 
 if (startDate && endDate) {
 const start = new Date(startDate);
 const end = new Date(endDate);

 if (isNaN(start.getTime()) || isNaN(end.getTime())) {
 return NextResponse.json(
 { error: 'Invalid date format. Use YYYY-MM-DD format.', code: 'INVALID_DATE_FORMAT' },
 { status: 400 }
 );
 }
 
 if (start > end) {
 return NextResponse.json(
 { error: 'Start date must be before end date.', code: 'INVALID_DATE_RANGE' },
 { status: 400 }
 );
 }
 
 dateFilter = { start, end };
 } else {
 const now = new Date();
 switch (timeRange) {
 case 'week':
 dateFilter = {
 start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
 end: now
 };
 break;
 case 'year':
 dateFilter = {
 start: new Date(now.getFullYear(), 0, 1),
 end: now
 };
 break;
 case 'month':
 default:
 dateFilter = {
 start: new Date(now.getFullYear(), now.getMonth(), 1),
 end: now
 };
 break;
 }
 }

 const analyticsData = await getCreatorAnalytics(user.id, dateFilter, videoId);

 if (!analyticsData || typeof analyticsData !== 'object') {
 throw new Error('Invalid analytics data structure');
 }

 if (!analyticsData.summary || typeof analyticsData.summary !== 'object') {
 throw new Error('Invalid analytics summary structure');
 }

 return NextResponse.json(analyticsData);
 } catch (error) {
 console.error('Creator analytics API error:', error);

 if (error instanceof Error) {
 if (error.message.includes('Invalid analytics')) {
 return NextResponse.json(
 { 
 error: 'Data processing error',
 details: error.message,
 code: 'DATA_PROCESSING_ERROR'
 },
 { status: 500 }
 );
 }
 
 if (error.message.includes('database') || error.message.includes('connection')) {
 return NextResponse.json(
 { 
 error: 'Database connection error',
 details: 'Unable to fetch analytics data',
 code: 'DATABASE_ERROR'
 },
 { status: 503 }
 );
 }
 }
 
 return NextResponse.json(
 { 
 error: 'Internal server error',
 details: error instanceof Error ? error.message : 'Unknown error',
 code: 'INTERNAL_ERROR'
 },
 { status: 500 }
 );
 }
}

async function getCreatorAnalytics(creatorId: string, dateFilter: { start: Date; end: Date }, videoId?: string | null): Promise<AnalyticsData> {
 try {

 if (!creatorId || typeof creatorId !== 'string') {
 throw new Error('Invalid creator ID provided');
 }

 if (!dateFilter || !dateFilter.start || !dateFilter.end) {
 throw new Error('Invalid date filter provided');
 }

 let totalCoinsEarned = 0;
 try {
 const conditions = [
 eq(coinTransactions.userId, creatorId),
 eq(coinTransactions.transactionType, 'earn'),
 eq(coinTransactions.status, 'completed')
 ];

 if (videoId) {
 conditions.push(eq(coinTransactions.relatedContentId, videoId));
 }

 const earningsResult = await db
 .select({
 totalCoins: sql<number>`COALESCE(SUM(${coinTransactions.coinAmount}), 0)`
 })
 .from(coinTransactions)
 .where(and(...conditions));

 totalCoinsEarned = Number(earningsResult[0]?.totalCoins || 0);
 } catch (error) {
 console.error('Error fetching total coins earned:', error);
 totalCoinsEarned = 0;
 }

 let summaryStats;
 try {
 let whereCondition = sql`creator_id = ${creatorId} AND is_active = true`;

 if (videoId) {
 whereCondition = sql`creator_id = ${creatorId} AND is_active = true AND id = ${videoId}`;
 }
 
 summaryStats = await db
 .select({
 totalViews: sql<number>`COALESCE(SUM(view_count), 0)`,
 totalVideos: sql<number>`COUNT(*)`
 })
 .from(videos)
 .where(whereCondition);
 } catch (error) {
 console.error('Error fetching summary statistics:', error);
 throw new Error('Failed to fetch summary statistics');
 }

 if (!summaryStats || summaryStats.length === 0) {

 return {
 summary: {
 totalCoinsEarned: 0,
 totalCoinsEarnedRupees: 0,
 totalViews: 0,
 totalVideos: 0,
 avgCoinsPerVideo: 0,
 avgCoinsPerVideoRupees: 0,
 avgViewsPerVideo: 0
 },
 charts: {
 earnings: [],
 views: []
 },
 videoPerformance: [],
 transactions: []
 };
 }

 const summary = summaryStats[0];

 const totalViews = Number(summary.totalViews) || 0;
 const totalVideos = Number(summary.totalVideos) || 0;
 
 const totalCoinsEarnedRupees = coinsToRupees(totalCoinsEarned);
 const avgCoinsPerVideo = totalVideos > 0 ? totalCoinsEarned / totalVideos : 0;
 const avgCoinsPerVideoRupees = coinsToRupees(avgCoinsPerVideo);
 const avgViewsPerVideo = totalVideos > 0 ? totalViews / totalVideos : 0;

 let earningsData: { date: string; coins: number; rupees: number }[] = [];
 try {
 const conditions = [
 eq(coinTransactions.userId, creatorId),
 eq(coinTransactions.transactionType, 'earn'),
 eq(coinTransactions.status, 'completed'),
 gte(coinTransactions.createdAt, dateFilter.start),
 lte(coinTransactions.createdAt, dateFilter.end)
 ];

 if (videoId) {
 conditions.push(eq(coinTransactions.relatedContentId, videoId));
 }

 const rawEarningsData = await db
 .select({
 date: sql<string>`DATE(${coinTransactions.createdAt})`,
 coins: sql<number>`COALESCE(SUM(${coinTransactions.coinAmount}), 0)`,
 })
 .from(coinTransactions)
 .where(and(...conditions))
 .groupBy(sql`DATE(${coinTransactions.createdAt})`)
 .orderBy(sql`DATE(${coinTransactions.createdAt})`);

 earningsData = rawEarningsData.map(item => ({
 date: item.date,
 coins: Number(item.coins),
 rupees: coinsToRupees(Number(item.coins))
 }));
 } catch (error) {
 console.error('Error fetching earnings data:', error);
 earningsData = [];
 }

 let viewsData: { date: string; views: number }[] = [];
 try {
 let viewsWhereCondition = sql`
 creator_id = ${creatorId} 
 AND is_active = true 
 AND created_at >= ${dateFilter.start} 
 AND created_at <= ${dateFilter.end}
 `;

 if (videoId) {
 viewsWhereCondition = sql`
 creator_id = ${creatorId} 
 AND is_active = true 
 AND id = ${videoId}
 AND created_at >= ${dateFilter.start} 
 AND created_at <= ${dateFilter.end}
 `;
 }
 
 viewsData = await db
 .select({
 date: sql<string>`DATE(created_at)`,
 views: sql<number>`COALESCE(SUM(view_count), 0)`
 })
 .from(videos)
 .where(viewsWhereCondition)
 .groupBy(sql`DATE(created_at)`)
 .orderBy(sql`DATE(created_at)`);
 } catch (error) {
 console.error('Error fetching views data:', error);
 viewsData = [];
 }

 let videoPerformanceData: any[] = [];
 try {
 let performanceWhereCondition = sql`
 ${videos.creatorId} = ${creatorId} 
 AND ${videos.isActive} = true 
 AND ${videos.createdAt} >= ${dateFilter.start} 
 AND ${videos.createdAt} <= ${dateFilter.end}
 `;

 if (videoId) {
 performanceWhereCondition = sql`
 ${videos.creatorId} = ${creatorId} 
 AND ${videos.isActive} = true 
 AND ${videos.id} = ${videoId}
 AND ${videos.createdAt} >= ${dateFilter.start} 
 AND ${videos.createdAt} <= ${dateFilter.end}
 `;
 }

 const videosWithEarnings = await db
 .select({
 id: videos.id,
 title: videos.title,
 views: videos.viewCount,
 coinPrice: videos.coinPrice,
 createdAt: videos.createdAt,
 category: videos.category,
 coinsEarned: sql<number>`
 COALESCE(
 (SELECT SUM(${coinTransactions.coinAmount}) 
 FROM ${coinTransactions} 
 WHERE ${coinTransactions.relatedContentId} = ${videos.id} 
 AND ${coinTransactions.relatedContentType} = 'video'
 AND ${coinTransactions.transactionType} = 'earn'
 AND ${coinTransactions.status} = 'completed'),
 0
 )
 `
 })
 .from(videos)
 .where(performanceWhereCondition)
 .orderBy(sql`
 COALESCE(
 (SELECT SUM(${coinTransactions.coinAmount}) 
 FROM ${coinTransactions} 
 WHERE ${coinTransactions.relatedContentId} = ${videos.id} 
 AND ${coinTransactions.relatedContentType} = 'video'
 AND ${coinTransactions.transactionType} = 'earn'
 AND ${coinTransactions.status} = 'completed'),
 0
 ) DESC
 `)
 .limit(videoId ? 1 : 20);

 videoPerformanceData = videosWithEarnings;
 } catch (error) {
 console.error('Error fetching video performance data:', error);
 videoPerformanceData = [];
 }

 let recentTransactions: any[] = [];
 try {
 const conditions = [
 eq(coinTransactions.userId, creatorId),
 eq(coinTransactions.transactionType, 'earn'),
 eq(coinTransactions.status, 'completed'),
 gte(coinTransactions.createdAt, dateFilter.start),
 lte(coinTransactions.createdAt, dateFilter.end)
 ];

 if (videoId) {
 conditions.push(eq(coinTransactions.relatedContentId, videoId));
 }

 recentTransactions = await db
 .select()
 .from(coinTransactions)
 .where(and(...conditions))
 .orderBy(desc(coinTransactions.createdAt))
 .limit(10);
 } catch (error) {
 console.error('Error fetching recent transactions:', error);
 recentTransactions = [];
 }

 const analyticsData: AnalyticsData = {
 summary: {
 totalCoinsEarned,
 totalCoinsEarnedRupees,
 totalViews,
 totalVideos,
 avgCoinsPerVideo,
 avgCoinsPerVideoRupees,
 avgViewsPerVideo
 },
 charts: {
 earnings: earningsData,
 views: (viewsData || []).map(item => ({
 date: item.date || '',
 views: Number(item.views) || 0
 }))
 },
 videoPerformance: (videoPerformanceData || []).map(video => ({
 id: video.id || '',
 title: video.title || 'Untitled',
 views: Number(video.views) || 0,
 coinsEarned: Number(video.coinsEarned) || 0,
 coinsEarnedRupees: coinsToRupees(Number(video.coinsEarned) || 0),
 coinPrice: Number(video.coinPrice) || 0,
 coinPriceRupees: coinsToRupees(Number(video.coinPrice) || 0),
 createdAt: video.createdAt ? video.createdAt.toISOString() : new Date().toISOString(),
 category: video.category || 'Uncategorized'
 })),
 transactions: (recentTransactions || []).map(transaction => ({
 id: transaction.id || '',
 coins: Number(transaction.coinAmount) || 0,
 rupees: coinsToRupees(Number(transaction.coinAmount) || 0),
 contentType: transaction.relatedContentType || undefined,
 contentId: transaction.relatedContentId || null,
 createdAt: transaction.createdAt ? transaction.createdAt.toISOString() : new Date().toISOString(),
 description: transaction.description || ''
 }))
 };

 if (!analyticsData.summary || typeof analyticsData.summary !== 'object') {
 throw new Error('Invalid analytics summary structure generated');
 }

 if (!Array.isArray(analyticsData.charts.earnings) || !Array.isArray(analyticsData.charts.views)) {
 throw new Error('Invalid analytics charts structure generated');
 }

 if (!Array.isArray(analyticsData.videoPerformance) || !Array.isArray(analyticsData.transactions)) {
 throw new Error('Invalid analytics arrays structure generated');
 }

 return analyticsData;
 } catch (error) {
 console.error('Error fetching creator analytics:', error);

 if (error instanceof Error && error.message.includes('Invalid analytics')) {
 throw error; // Re-throw validation errors
 }

 console.warn('Returning empty analytics data due to error:', error);
 return {
 summary: {
 totalCoinsEarned: 0,
 totalCoinsEarnedRupees: 0,
 totalViews: 0,
 totalVideos: 0,
 avgCoinsPerVideo: 0,
 avgCoinsPerVideoRupees: 0,
 avgViewsPerVideo: 0
 },
 charts: {
 earnings: [],
 views: []
 },
 videoPerformance: [],
 transactions: []
 };
 }
}