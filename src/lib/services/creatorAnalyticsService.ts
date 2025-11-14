

import { userRepository } from "../database/repositories/users";
import { videoRepository } from "../database/repositories/videos";
import { sql, eq, and, desc } from "drizzle-orm";
import { db } from "../database/connection";
import {
 videos,
 transactions,
 coinTransactions,
 creatorProfiles,
 series,
} from "../database/schema";
import { coinsToRupees } from "../utils/coin-utils";

export interface CreatorDashboardStats {
 totalCoinsEarned: number;
 totalEarnings: number; // Rupee equivalent for backward compatibility
 totalViews: number;
 videoCount: number;
 seriesCount: number;
 avgCoinsPerVideo: number;
 avgEarningsPerVideo: number; // Rupee equivalent for backward compatibility
 avgViewsPerVideo: number;
 monthlyGrowth: {
 earnings: number;
 views: number;
 videos: number;
 series: number;
 };
}

export interface RecentActivity {
 id: string;
 type: "video_upload" | "earning" | "milestone" | "payout";
 title: string;
 description: string;
 timestamp: Date;
 metadata?: any;
}

export interface VideoPerformance {
 id: string;
 title: string;
 views: number;
 earnings: number;
 createdAt: Date;
 thumbnailUrl: string;
}

export class CreatorAnalyticsService {
 private cache = new Map<string, { data: any; expiry: number }>();

 private getFromCache(key: string): any | null {
 const cached = this.cache.get(key);
 if (cached && cached.expiry > Date.now()) {
 return cached.data;
 }
 this.cache.delete(key);
 return null;
 }

 private setCache(key: string, data: any, ttl: number): void {
 this.cache.set(key, {
 data,
 expiry: Date.now() + ttl,
 });
 }
 
 async getDashboardStats(creatorId: string): Promise<CreatorDashboardStats> {
 try {

 const cacheKey = `dashboard_stats_${creatorId}`;
 const cached = this.getFromCache(cacheKey);
 if (cached) {
 return cached;
 }

 const creatorProfileResult = await db
 .select({
 coinBalance: creatorProfiles.coinBalance,
 totalCoinsEarned: creatorProfiles.totalCoinsEarned,
 coinsWithdrawn: creatorProfiles.coinsWithdrawn,
 videoCount: creatorProfiles.videoCount,
 seriesCount: creatorProfiles.seriesCount,
 totalViews: creatorProfiles.totalViews,
 })
 .from(creatorProfiles)
 .where(eq(creatorProfiles.userId, creatorId))
 .limit(1);

 if (creatorProfileResult.length === 0) {
 throw new Error("Creator profile not found");
 }

 const profile = creatorProfileResult[0];
 const totalCoinsEarned = profile.totalCoinsEarned || 0;
 const totalEarnings = coinsToRupees(totalCoinsEarned);

 const avgCoinsPerVideo =
 profile.videoCount > 0 ? totalCoinsEarned / profile.videoCount : 0;

 const avgEarningsPerVideo = coinsToRupees(avgCoinsPerVideo);

 const avgViewsPerVideo =
 profile.videoCount > 0 ? profile.totalViews / profile.videoCount : 0;

 const monthlyGrowthPromise = this.getMonthlyGrowth(creatorId);
 const monthlyGrowth = await monthlyGrowthPromise;

 const stats = {
 totalCoinsEarned,
 totalEarnings,
 totalViews: profile.totalViews,
 videoCount: profile.videoCount,
 seriesCount: profile.seriesCount || 0,
 avgCoinsPerVideo,
 avgEarningsPerVideo,
 avgViewsPerVideo,
 monthlyGrowth,
 };

 this.setCache(cacheKey, stats, 5 * 60 * 1000); // 5 minutes

 return stats;
 } catch (error) {
 console.error("Error fetching creator dashboard stats:", error);
 throw error;
 }
 }

 private async getMonthlyGrowth(creatorId: string): Promise<{
 earnings: number;
 views: number;
 videos: number;
 series: number;
 }> {
 try {
 const now = new Date();
 const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
 const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

 const earningsGrowth = await db
 .select({
 thisMonth: sql<number>`
 COALESCE(SUM(CASE 
 WHEN ${coinTransactions.createdAt} >= ${thisMonth} 
 AND ${coinTransactions.transactionType} = 'earn' 
 AND ${coinTransactions.status} = 'completed' 
 THEN ${coinTransactions.coinAmount}
 ELSE 0 
 END), 0)
 `,
 lastMonth: sql<number>`
 COALESCE(SUM(CASE 
 WHEN ${coinTransactions.createdAt} >= ${lastMonth} 
 AND ${coinTransactions.createdAt} < ${thisMonth} 
 AND ${coinTransactions.transactionType} = 'earn' 
 AND ${coinTransactions.status} = 'completed' 
 THEN ${coinTransactions.coinAmount}
 ELSE 0 
 END), 0)
 `,
 })
 .from(coinTransactions)
 .where(eq(coinTransactions.userId, creatorId));

 const videoGrowth = await db
 .select({
 thisMonth: sql<number>`
 COUNT(CASE WHEN ${videos.createdAt} >= ${thisMonth} THEN 1 END)
 `,
 lastMonth: sql<number>`
 COUNT(CASE WHEN ${videos.createdAt} >= ${lastMonth} AND ${videos.createdAt} < ${thisMonth} THEN 1 END)
 `,
 })
 .from(videos)
 .where(eq(videos.creatorId, creatorId));

 const viewsGrowth = await db
 .select({
 thisMonth: sql<number>`
 COALESCE(SUM(CASE WHEN ${videos.createdAt} >= ${thisMonth} THEN ${videos.viewCount} ELSE 0 END), 0)
 `,
 lastMonth: sql<number>`
 COALESCE(SUM(CASE WHEN ${videos.createdAt} >= ${lastMonth} AND ${videos.createdAt} < ${thisMonth} THEN ${videos.viewCount} ELSE 0 END), 0)
 `,
 })
 .from(videos)
 .where(eq(videos.creatorId, creatorId));

 const seriesGrowth = await db
 .select({
 thisMonth: sql<number>`
 COUNT(CASE WHEN ${series.createdAt} >= ${thisMonth} AND ${series.isActive} = true THEN 1 END)
 `,
 lastMonth: sql<number>`
 COUNT(CASE WHEN ${series.createdAt} >= ${lastMonth} AND ${series.createdAt} < ${thisMonth} AND ${series.isActive} = true THEN 1 END)
 `,
 })
 .from(series)
 .where(eq(series.creatorId, creatorId));

 const earnings = earningsGrowth[0] || { thisMonth: 0, lastMonth: 0 };
 const videoCount = videoGrowth[0] || { thisMonth: 0, lastMonth: 0 };
 const views = viewsGrowth[0] || { thisMonth: 0, lastMonth: 0 };
 const seriesCount = seriesGrowth[0] || { thisMonth: 0, lastMonth: 0 };

 return {
 earnings:
 earnings.lastMonth > 0
 ? ((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth) *
 100
 : earnings.thisMonth > 0
 ? 100
 : 0,
 views:
 views.lastMonth > 0
 ? ((views.thisMonth - views.lastMonth) / views.lastMonth) * 100
 : views.thisMonth > 0
 ? 100
 : 0,
 videos:
 videoCount.lastMonth > 0
 ? ((videoCount.thisMonth - videoCount.lastMonth) /
 videoCount.lastMonth) *
 100
 : videoCount.thisMonth > 0
 ? 100
 : 0,
 series:
 seriesCount.lastMonth > 0
 ? ((seriesCount.thisMonth - seriesCount.lastMonth) /
 seriesCount.lastMonth) *
 100
 : seriesCount.thisMonth > 0
 ? 100
 : 0,
 };
 } catch (error) {
 console.error("Error calculating monthly growth:", error);
 return { earnings: 0, views: 0, videos: 0, series: 0 };
 }
 }

 async getRecentActivity(
 creatorId: string,
 limit: number = 10
 ): Promise<RecentActivity[]> {
 try {
 const activities: RecentActivity[] = [];

 const recentVideos = await videoRepository.findByCreator(creatorId, {
 limit: 3,
 sortBy: "createdAt",
 sortOrder: "desc",
 });

 recentVideos.videos.forEach((video) => {
 activities.push({
 id: `video-${video.id}`,
 type: "video_upload",
 title: "Video uploaded successfully",
 description: `"${video.title}" is now live`,
 timestamp: video.createdAt,
 metadata: { videoId: video.id, videoTitle: video.title },
 });
 });

 const recentEarnings = await db
 .select()
 .from(coinTransactions)
 .where(
 and(
 eq(coinTransactions.userId, creatorId),
 eq(coinTransactions.transactionType, "earn"),
 eq(coinTransactions.status, "completed")
 )
 )
 .orderBy(desc(coinTransactions.createdAt))
 .limit(3);

 recentEarnings.forEach((transaction) => {
 const coins = transaction.coinAmount;
 const rupees = coinsToRupees(coins);
 activities.push({
 id: `earning-${transaction.id}`,
 type: "earning",
 title: "Coins earned",
 description: `🪙 ${coins.toLocaleString()} coins (₹${rupees.toFixed(
 2
 )}) from content purchase`,
 timestamp: transaction.createdAt,
 metadata: {
 coins,
 rupees,
 contentId: transaction.relatedContentId,
 contentType: transaction.relatedContentType,
 },
 });
 });

 return activities
 .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
 .slice(0, limit);
 } catch (error) {
 console.error("Error fetching recent activity:", error);
 return [];
 }
 }

 async getTopPerformingVideos(
 creatorId: string,
 limit: number = 5
 ): Promise<VideoPerformance[]> {
 try {
 const { videos } = await videoRepository.findByCreator(creatorId, {
 limit,
 sortBy: "totalEarnings",
 sortOrder: "desc",
 });

 return videos.map((video) => ({
 id: video.id,
 title: video.title,
 views: video.viewCount,
 earnings: parseFloat(video.totalEarnings),
 createdAt: video.createdAt,
 thumbnailUrl: video.thumbnailUrl,
 }));
 } catch (error) {
 console.error("Error fetching top performing videos:", error);
 return [];
 }
 }

 async updateCreatorStats(creatorId: string): Promise<void> {
 try {

 const videoStats = await db
 .select({
 totalViews: sql<number>`COALESCE(SUM(view_count), 0)`,
 videoCount: sql<number>`COUNT(*)`,
 totalVideoEarnings: sql<number>`COALESCE(SUM(CAST(total_earnings AS DECIMAL)), 0)`,
 })
 .from(videos)
 .where(sql`creator_id = ${creatorId} AND is_active = true`);

 const transactionStats = await db
 .select({
 totalEarnings: sql<number>`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)`,
 })
 .from(transactions)
 .where(
 sql`creator_id = ${creatorId} AND type = 'creator_earning' AND status = 'completed'`
 );

 const videoData = videoStats[0];
 const transactionData = transactionStats[0];

 await userRepository.updateCreatorProfile(creatorId, {
 totalViews: videoData.totalViews,
 videoCount: videoData.videoCount,
 totalEarnings: transactionData.totalEarnings.toString(),
 updatedAt: new Date(),
 });
 } catch (error) {
 console.error("Error updating creator stats:", error);
 throw error;
 }
 }
}

export const creatorAnalyticsService = new CreatorAnalyticsService();
