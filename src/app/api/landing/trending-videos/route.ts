

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/connection";
import { videos, users, creatorProfiles, transactions, videoLikes } from "@/lib/database/schema";
import { desc, and, eq, gte, isNull, sql } from "drizzle-orm";
import { CacheService } from "@/lib/services/cacheService";

interface TrendingVideo {
 id: string;
 title: string;
 thumbnailUrl: string;
 duration: number;
 viewCount: number;
 creatorName: string;
 creatorAvatar: string;
 creatorId: string;
 price: number;
 category: string;
 href: string;
 trendingScore: number;
}

async function getTrendingVideosFromDB(limit: number): Promise<TrendingVideo[]> {
 try {
 const sevenDaysAgo = new Date();
 sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

 const trendingVideosList = await db
 .select({
 id: videos.id,
 title: videos.title,
 thumbnailUrl: videos.thumbnailUrl,
 duration: videos.duration,
 viewCount: videos.viewCount,
 creditCost: videos.creditCost,
 category: videos.category,
 creatorName: creatorProfiles.displayName,
 creatorAvatar: users.avatar,
 creatorId: videos.creatorId,

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
 `,
 })
 .from(videos)
 .innerJoin(users, eq(videos.creatorId, users.id))
 .innerJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
 .where(
 and(
 eq(videos.isActive, true),
 eq(videos.moderationStatus, "approved"),
 eq(users.isActive, true),
 eq(users.isSuspended, false),
 isNull(videos.seriesId) // Only standalone videos, not part of series
 )
 )
 .orderBy(
 desc(sql`
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
 `)
 )
 .limit(limit);

 return trendingVideosList.map((video) => {
 const trendingScore =
 video.recentViews * 0.5 + video.recentLikes * 0.3 + video.viewCount * 0.2;

 return {
 id: video.id,
 title: video.title,
 thumbnailUrl: video.thumbnailUrl,
 duration: video.duration,
 viewCount: video.viewCount,
 creatorName: video.creatorName,
 creatorAvatar: video.creatorAvatar || "",
 creatorId: video.creatorId,
 price: parseFloat(video.creditCost.toString()),
 category: video.category,
 href: `/watch/${video.id}`,
 trendingScore: Math.round(trendingScore),
 };
 });
 } catch (error) {
 console.error("Error fetching trending videos:", error);
 throw new Error("Failed to fetch trending videos");
 }
}

export async function GET(request: NextRequest) {
 try {
 const { searchParams } = new URL(request.url);
 const limit = parseInt(searchParams.get("limit") || "10");

 if (limit < 1 || limit > 50) {
 return NextResponse.json(
 { error: "Limit must be between 1 and 50" },
 { status: 400 }
 );
 }

 const cacheKey = `landing:trending-videos:${limit}`;

 const cached = CacheService.get<TrendingVideo[]>(cacheKey);

 let trendingVideos;
 if (cached) {
 trendingVideos = cached;
 } else {
 trendingVideos = await getTrendingVideosFromDB(limit);
 CacheService.set(cacheKey, trendingVideos, CacheService.CACHE_TTL.TRENDING_SHOWS);
 }

 return NextResponse.json({
 success: true,
 data: trendingVideos,
 count: trendingVideos.length,
 metadata: {
 calculatedAt: new Date().toISOString(),
 period: "7 days",
 cached: !!cached,
 },
 });
 } catch (error) {
 console.error("Error in trending-videos endpoint:", error);

 return NextResponse.json(
 {
 error: "Failed to fetch trending videos",
 success: false,
 },
 { status: 500 }
 );
 }
}
