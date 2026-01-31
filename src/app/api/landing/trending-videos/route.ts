

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

        // 1. Get recent transaction counts (views)
        const recentViewsSubquery = db
            .select({
                videoId: transactions.videoId,
                count: sql<number>`count(*)::int`.as('recent_views'),
            })
            .from(transactions)
            .where(
                and(
                    eq(transactions.type, 'video_view'),
                    eq(transactions.status, 'completed'),
                    gte(transactions.createdAt, sevenDaysAgo)
                )
            )
            .groupBy(transactions.videoId)
            .as('rv');

        // 2. Get recent like counts
        const recentLikesSubquery = db
            .select({
                videoId: videoLikes.videoId,
                count: sql<number>`count(*)::int`.as('recent_likes'),
            })
            .from(videoLikes)
            .where(gte(videoLikes.createdAt, sevenDaysAgo))
            .groupBy(videoLikes.videoId)
            .as('rl');

        // 3. Main query joining with subqueries
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
                recentViews: sql<number>`COALESCE(${recentViewsSubquery.count}, 0)`,
                recentLikes: sql<number>`COALESCE(${recentLikesSubquery.count}, 0)`,
            })
            .from(videos)
            .innerJoin(users, eq(videos.creatorId, users.id))
            .innerJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
            .leftJoin(recentViewsSubquery, eq(videos.id, recentViewsSubquery.videoId))
            .leftJoin(recentLikesSubquery, eq(videos.id, recentLikesSubquery.videoId))
            .where(
                and(
                    eq(videos.isActive, true),
                    eq(videos.moderationStatus, "approved"),
                    eq(users.isActive, true),
                    eq(users.isSuspended, false),
                    isNull(videos.seriesId)
                )
            )
            .orderBy(
                desc(sql`
        COALESCE(${recentViewsSubquery.count}, 0) * 0.5 + 
        COALESCE(${recentLikesSubquery.count}, 0) * 0.3 + 
        ${videos.viewCount} * 0.2
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
