

import { db } from "@/lib/database/connection";
import { 
 users, 
 creatorProfiles, 
 videos, 
 series, 
 creatorFollows, 
 videoLikes, 
 profileVisits,
 transactions 
} from "@/lib/database/schema";
import { desc, sql, and, gte, eq, isNotNull } from "drizzle-orm";
import { CacheService } from "./cacheService";

export interface TrendingCreator {
 id: string;
 username: string;
 displayName: string;
 avatar: string | null;
 followerCount: number;
 videoCount: number;
 category: string;
 isVerified?: boolean;
 trendingScore: number;
 recentViews: number;
 recentFollowers: number;
}

export interface TrendingShow {
 id: string;
 type: 'video' | 'series';
 title: string;
 thumbnailUrl: string;
 creatorName: string;
 creatorId: string;
 viewCount: number;
 rating?: number;
 duration?: number;
 videoCount?: number; // for series
 price: number;
 trendingScore: number;
 recentViews: number;
 category: string;
}

export class TrendingService {
 private static readonly TRENDING_PERIOD_DAYS = 7;
 private static readonly CACHE_TTL = 300; // 5 minutes

 static async calculateTrendingCreators(limit: number = 10): Promise<TrendingCreator[]> {
 const cacheKey = `${CacheService.CACHE_KEYS.TRENDING_CREATORS}:${limit}`;
 
 return CacheService.getOrSet(
 cacheKey,
 () => this._calculateTrendingCreatorsFromDB(limit),
 CacheService.CACHE_TTL.TRENDING_CREATORS
 );
 }

 private static async _calculateTrendingCreatorsFromDB(limit: number): Promise<TrendingCreator[]> {
 const sevenDaysAgo = new Date();
 sevenDaysAgo.setDate(sevenDaysAgo.getDate() - this.TRENDING_PERIOD_DAYS);

 try {

 const trendingCreators = await db
 .select({
 id: users.id,
 username: users.username,
 displayName: creatorProfiles.displayName,
 avatar: users.avatar,
 totalFollowers: creatorProfiles.totalViews,
 videoCount: creatorProfiles.videoCount,
 totalEarnings: creatorProfiles.totalEarnings,

 recentFollowers: sql<number>`
 COALESCE((
 SELECT COUNT(*)::int 
 FROM ${creatorFollows} 
 WHERE ${creatorFollows.creatorId} = ${users.id} 
 AND ${creatorFollows.followedAt} >= ${sevenDaysAgo}
 ), 0)
 `,

 recentViews: sql<number>`
 COALESCE((
 SELECT SUM(${videos.viewCount})::int 
 FROM ${videos} 
 WHERE ${videos.creatorId} = ${users.id} 
 AND ${videos.createdAt} >= ${sevenDaysAgo}
 AND ${videos.isActive} = true
 AND ${videos.moderationStatus} = 'approved'
 ), 0)
 `,

 recentProfileVisits: sql<number>`
 COALESCE((
 SELECT COUNT(*)::int 
 FROM ${profileVisits} 
 WHERE ${profileVisits.creatorId} = ${users.id} 
 AND ${profileVisits.visitedAt} >= ${sevenDaysAgo}
 ), 0)
 `,

 primaryCategory: sql<string>`
 COALESCE((
 SELECT ${videos.category}
 FROM ${videos}
 WHERE ${videos.creatorId} = ${users.id}
 AND ${videos.isActive} = true
 AND ${videos.moderationStatus} = 'approved'
 GROUP BY ${videos.category}
 ORDER BY COUNT(*) DESC
 LIMIT 1
 ), 'General')
 `
 })
 .from(users)
 .innerJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
 .where(
 and(
 eq(users.role, 'creator'),
 eq(users.isActive, true),
 eq(users.isSuspended, false)
 )
 )
 .orderBy(desc(sql`
 -- Trending score calculation
 (
 -- Recent followers weight (40%)
 COALESCE((
 SELECT COUNT(*) 
 FROM ${creatorFollows} 
 WHERE ${creatorFollows.creatorId} = ${users.id} 
 AND ${creatorFollows.followedAt} >= ${sevenDaysAgo}
 ), 0) * 0.4 +
 
 -- Recent views weight (35%)
 COALESCE((
 SELECT SUM(${videos.viewCount}) 
 FROM ${videos} 
 WHERE ${videos.creatorId} = ${users.id} 
 AND ${videos.createdAt} >= ${sevenDaysAgo}
 AND ${videos.isActive} = true
 AND ${videos.moderationStatus} = 'approved'
 ), 0) * 0.35 +
 
 -- Recent profile visits weight (15%)
 COALESCE((
 SELECT COUNT(*) 
 FROM ${profileVisits} 
 WHERE ${profileVisits.creatorId} = ${users.id} 
 AND ${profileVisits.visitedAt} >= ${sevenDaysAgo}
 ), 0) * 0.15 +
 
 -- Video count boost (10%)
 ${creatorProfiles.videoCount} * 0.1
 )
 `))
 .limit(limit);

 return trendingCreators.map((creator) => {
 const trendingScore = 
 (creator.recentFollowers * 0.4) +
 (creator.recentViews * 0.35) +
 (creator.recentProfileVisits * 0.15) +
 (creator.videoCount * 0.1);

 return {
 id: creator.id,
 username: creator.username,
 displayName: creator.displayName,
 avatar: creator.avatar,
 followerCount: creator.totalFollowers,
 videoCount: creator.videoCount,
 category: creator.primaryCategory,
 isVerified: false, // TODO: Add verification system
 trendingScore: Math.round(trendingScore),
 recentViews: creator.recentViews,
 recentFollowers: creator.recentFollowers
 };
 });

 } catch (error) {
 console.error('Error calculating trending creators:', error);
 throw new Error('Failed to calculate trending creators');
 }
 }

 static async calculateTrendingShows(limit: number = 20): Promise<TrendingShow[]> {
 const cacheKey = `${CacheService.CACHE_KEYS.TRENDING_SHOWS}:${limit}`;
 
 return CacheService.getOrSet(
 cacheKey,
 () => this._calculateTrendingShowsFromDB(limit),
 CacheService.CACHE_TTL.TRENDING_SHOWS
 );
 }

 private static async _calculateTrendingShowsFromDB(limit: number): Promise<TrendingShow[]> {
 const sevenDaysAgo = new Date();
 sevenDaysAgo.setDate(sevenDaysAgo.getDate() - this.TRENDING_PERIOD_DAYS);

 try {

 const trendingVideos = await db
 .select({
 id: videos.id,
 type: sql<'video'>`'video'`,
 title: videos.title,
 thumbnailUrl: videos.thumbnailUrl,
 creatorName: creatorProfiles.displayName,
 creatorId: videos.creatorId,
 viewCount: videos.viewCount,
 duration: videos.duration,
 price: videos.creditCost,
 category: videos.category,
 createdAt: videos.createdAt,

 recentViews: sql<number>`
 COALESCE((
 SELECT COUNT(*)::int 
 FROM ${transactions} 
 WHERE ${transactions.videoId} = ${videos.id} 
 AND ${transactions.type} = 'video_view'
 AND ${transactions.createdAt} >= ${sevenDaysAgo}
 AND ${transactions.status} = 'completed'
 ), 0)
 `,

 recentLikes: sql<number>`
 COALESCE((
 SELECT COUNT(*)::int 
 FROM ${videoLikes} 
 WHERE ${videoLikes.videoId} = ${videos.id} 
 AND ${videoLikes.createdAt} >= ${sevenDaysAgo}
 ), 0)
 `
 })
 .from(videos)
 .innerJoin(users, eq(videos.creatorId, users.id))
 .innerJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
 .where(
 and(
 eq(videos.isActive, true),
 eq(videos.moderationStatus, 'approved'),
 eq(users.isActive, true),
 eq(users.isSuspended, false)
 )
 )
 .orderBy(desc(sql`
 -- Video trending score
 (
 -- Recent views weight (50%)
 COALESCE((
 SELECT COUNT(*) 
 FROM ${transactions} 
 WHERE ${transactions.videoId} = ${videos.id} 
 AND ${transactions.type} = 'video_view'
 AND ${transactions.createdAt} >= ${sevenDaysAgo}
 AND ${transactions.status} = 'completed'
 ), 0) * 0.5 +
 
 -- Recent likes weight (30%)
 COALESCE((
 SELECT COUNT(*) 
 FROM ${videoLikes} 
 WHERE ${videoLikes.videoId} = ${videos.id} 
 AND ${videoLikes.createdAt} >= ${sevenDaysAgo}
 ), 0) * 0.3 +
 
 -- Total view count boost (20%)
 ${videos.viewCount} * 0.2
 )
 `))
 .limit(Math.ceil(limit * 0.7)); // 70% videos

 const trendingSeries = await db
 .select({
 id: series.id,
 type: sql<'series'>`'series'`,
 title: series.title,
 thumbnailUrl: series.thumbnailUrl,
 creatorName: creatorProfiles.displayName,
 creatorId: series.creatorId,
 viewCount: series.viewCount,
 videoCount: series.videoCount,
 price: series.totalPrice,
 category: series.category,
 createdAt: series.createdAt,

 recentPurchases: sql<number>`
 COALESCE((
 SELECT COUNT(*)::int 
 FROM ${transactions} 
 WHERE ${transactions.seriesId} = ${series.id} 
 AND ${transactions.type} = 'series_purchase'
 AND ${transactions.createdAt} >= ${sevenDaysAgo}
 AND ${transactions.status} = 'completed'
 ), 0)
 `,

 recentSeriesViews: sql<number>`
 COALESCE((
 SELECT COUNT(*)::int 
 FROM ${transactions} t
 INNER JOIN ${videos} v ON t.video_id = v.id
 WHERE v.series_id = ${series.id}
 AND t.type = 'video_view'
 AND t.created_at >= ${sevenDaysAgo}
 AND t.status = 'completed'
 ), 0)
 `
 })
 .from(series)
 .innerJoin(users, eq(series.creatorId, users.id))
 .innerJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
 .where(
 and(
 eq(series.isActive, true),
 eq(series.moderationStatus, 'approved'),
 eq(users.isActive, true),
 eq(users.isSuspended, false)
 )
 )
 .orderBy(desc(sql`
 -- Series trending score
 (
 -- Recent purchases weight (60%)
 COALESCE((
 SELECT COUNT(*) 
 FROM ${transactions} 
 WHERE ${transactions.seriesId} = ${series.id} 
 AND ${transactions.type} = 'series_purchase'
 AND ${transactions.createdAt} >= ${sevenDaysAgo}
 AND ${transactions.status} = 'completed'
 ), 0) * 0.6 +
 
 -- Recent series views weight (25%)
 COALESCE((
 SELECT COUNT(*) 
 FROM ${transactions} t
 INNER JOIN ${videos} v ON t.video_id = v.id
 WHERE v.series_id = ${series.id}
 AND t.type = 'video_view'
 AND t.created_at >= ${sevenDaysAgo}
 AND t.status = 'completed'
 ), 0) * 0.25 +
 
 -- Total view count boost (15%)
 ${series.viewCount} * 0.15
 )
 `))
 .limit(Math.ceil(limit * 0.3)); // 30% series

 const allTrendingShows: TrendingShow[] = [];

 trendingVideos.forEach((video) => {
 const trendingScore = 
 (video.recentViews * 0.5) +
 (video.recentLikes * 0.3) +
 (video.viewCount * 0.2);

 allTrendingShows.push({
 id: video.id,
 type: 'video',
 title: video.title,
 thumbnailUrl: video.thumbnailUrl,
 creatorName: video.creatorName,
 creatorId: video.creatorId,
 viewCount: video.viewCount,
 duration: video.duration,
 price: parseFloat(video.price.toString()),
 trendingScore: Math.round(trendingScore),
 recentViews: video.recentViews,
 category: video.category
 });
 });

 trendingSeries.forEach((seriesItem) => {
 const trendingScore = 
 (seriesItem.recentPurchases * 0.6) +
 (seriesItem.recentSeriesViews * 0.25) +
 (seriesItem.viewCount * 0.15);

 allTrendingShows.push({
 id: seriesItem.id,
 type: 'series',
 title: seriesItem.title,
 thumbnailUrl: seriesItem.thumbnailUrl || '',
 creatorName: seriesItem.creatorName,
 creatorId: seriesItem.creatorId,
 viewCount: seriesItem.viewCount,
 videoCount: seriesItem.videoCount,
 price: parseFloat(seriesItem.price.toString()),
 trendingScore: Math.round(trendingScore),
 recentViews: seriesItem.recentSeriesViews,
 category: seriesItem.category
 });
 });

 return allTrendingShows
 .sort((a, b) => b.trendingScore - a.trendingScore)
 .slice(0, limit);

 } catch (error) {
 console.error('Error calculating trending shows:', error);
 throw new Error('Failed to calculate trending shows');
 }
 }

 static async getFeaturedContent(limit: number = 5): Promise<any[]> {
 const cacheKey = `${CacheService.CACHE_KEYS.FEATURED_CONTENT}:${limit}`;
 
 return CacheService.getOrSet(
 cacheKey,
 () => this._getFeaturedContentFromDB(limit),
 CacheService.CACHE_TTL.FEATURED_CONTENT
 );
 }

 private static async _getFeaturedContentFromDB(limit: number): Promise<any[]> {
 try {

 const thirtyDaysAgo = new Date();
 thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

 const featuredVideos = await db
 .select({
 id: videos.id,
 type: sql<'video'>`'video'`,
 title: videos.title,
 description: videos.description,
 imageUrl: videos.thumbnailUrl,
 creatorName: creatorProfiles.displayName,
 creatorAvatar: users.avatar,
 category: videos.category,
 viewCount: videos.viewCount,
 creditCost: videos.creditCost
 })
 .from(videos)
 .innerJoin(users, eq(videos.creatorId, users.id))
 .innerJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
 .where(
 and(
 eq(videos.isActive, true),
 eq(videos.moderationStatus, 'approved'),
 eq(users.isActive, true),
 eq(users.isSuspended, false),
 gte(videos.createdAt, thirtyDaysAgo)
 )
 )
 .orderBy(desc(videos.viewCount), desc(videos.createdAt))
 .limit(Math.ceil(limit * 0.6));

 const featuredSeries = await db
 .select({
 id: series.id,
 type: sql<'series'>`'series'`,
 title: series.title,
 description: series.description,
 imageUrl: series.thumbnailUrl,
 creatorName: creatorProfiles.displayName,
 creatorAvatar: users.avatar,
 category: series.category,
 viewCount: series.viewCount,
 totalPrice: series.totalPrice,
 videoCount: series.videoCount
 })
 .from(series)
 .innerJoin(users, eq(series.creatorId, users.id))
 .innerJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
 .where(
 and(
 eq(series.isActive, true),
 eq(series.moderationStatus, 'approved'),
 eq(users.isActive, true),
 eq(users.isSuspended, false),
 gte(series.createdAt, thirtyDaysAgo)
 )
 )
 .orderBy(desc(series.viewCount), desc(series.createdAt))
 .limit(Math.ceil(limit * 0.4));

 const allFeatured = [
 ...featuredVideos.map(video => ({
 id: video.id,
 type: video.type,
 title: video.title,
 description: video.description || '',
 imageUrl: video.imageUrl,
 creatorName: video.creatorName,
 creatorAvatar: video.creatorAvatar || '',
 category: video.category,
 href: `/watch/${video.id}`
 })),
 ...featuredSeries.map(seriesItem => ({
 id: seriesItem.id,
 type: seriesItem.type,
 title: seriesItem.title,
 description: seriesItem.description || '',
 imageUrl: seriesItem.imageUrl || '',
 creatorName: seriesItem.creatorName,
 creatorAvatar: seriesItem.creatorAvatar || '',
 category: seriesItem.category,
 href: `/series/${seriesItem.id}`
 }))
 ];

 return allFeatured
 .sort(() => Math.random() - 0.5)
 .slice(0, limit);

 } catch (error) {
 console.error('Error getting featured content:', error);
 throw new Error('Failed to get featured content');
 }
 }
}