/**
 * POST /api/videos/save
 *
 * Called after client-side upload to Bunny Stream completes.
 * Expects { bunnyVideoId, metadata, duration? }
 *
 * Backward-compatible: still accepts the legacy cloudinaryResult shape
 * but ignores it – the video URL is built from bunnyVideoId.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/database";
import { videos, users, creatorProfiles, series, seriesVideos } from "@/lib/database/schema";
import { eq, sql, and } from "drizzle-orm";
import { CacheService } from "@/lib/services/cacheService";
import {
  buildVideoUrls,
  uploadThumbnailToBunny,
  buildThumbnailPath,
  getBunnyVideo,
} from "@/lib/services/bunnyService";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (!user || user.role !== "creator") {
      return NextResponse.json(
        { error: "Only creators can upload videos" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { bunnyVideoId, metadata } = body;

    if (!bunnyVideoId || !metadata) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    if (!metadata.title || !metadata.category) {
      return NextResponse.json(
        { error: "Title and category are required" },
        { status: 400 }
      );
    }

    const coinPrice = metadata.coinPrice ?? (metadata.creditCost ? metadata.creditCost * 20 : 20);

    if (coinPrice < 0 || coinPrice > 2000) {
      return NextResponse.json(
        { error: "Video price must be between 0 and 2000 coins" },
        { status: 400 }
      );
    }

    if (metadata.seriesId) {
      const [seriesData] = await db
        .select()
        .from(series)
        .where(and(eq(series.id, metadata.seriesId), eq(series.creatorId, user.id)))
        .limit(1);

      if (!seriesData) {
        return NextResponse.json(
          { error: "Series not found or you do not have permission" },
          { status: 403 }
        );
      }
    }

    // Build Bunny playback URL
    const { playbackUrl } = buildVideoUrls(bunnyVideoId);

    // Fetch duration from Bunny (may still encode; default 0)
    let duration = body.duration || 0;
    try {
      const bunnyMeta = await getBunnyVideo(bunnyVideoId);
      duration = Math.round(bunnyMeta.length || duration);
    } catch { /* non-fatal */ }

    // Mirror Bunny auto-thumb to Storage CDN
    const bunnyAutoThumb = `https://${process.env.BUNNY_STREAM_CDN_HOSTNAME}/${bunnyVideoId}/thumbnail.jpg`;
    let thumbnailUrl = bunnyAutoThumb;
    try {
      const thumbRes = await fetch(bunnyAutoThumb);
      if (thumbRes.ok) {
        const thumbBuffer = Buffer.from(await thumbRes.arrayBuffer());
        const thumbPath = buildThumbnailPath(user.id);
        const uploaded = await uploadThumbnailToBunny(thumbPath, thumbBuffer, "image/jpeg");
        thumbnailUrl = uploaded.thumbnailUrl;
      }
    } catch { /* non-fatal */ }

    // neon-http driver does not support transactions — run statements sequentially.
    // If the video insert fails the function throws and nothing else runs.
    const [newVideo] = await db
      .insert(videos)
      .values({
        creatorId: user.id,
        title: metadata.title.trim(),
        description: metadata.description?.trim() || null,
        videoUrl: playbackUrl,
        thumbnailUrl,
        bunnyVideoId,
        duration,
        creditCost: (coinPrice / 20).toFixed(2),
        coinPrice,
        category: metadata.category,
        tags: metadata.tags || [],
        viewCount: 0,
        totalEarnings: "0.00",
        isActive: true,
        aspectRatio: metadata.aspectRatio || "16:9",
        seriesId: metadata.seriesId || null,
      })
      .returning();

    // Update creator video count
    const [profile] = await db
      .select()
      .from(creatorProfiles)
      .where(eq(creatorProfiles.userId, user.id))
      .limit(1);

    if (profile) {
      await db
        .update(creatorProfiles)
        .set({ videoCount: profile.videoCount + 1, updatedAt: new Date() })
        .where(eq(creatorProfiles.userId, user.id));
    }

    // If part of a series, insert into seriesVideos and update series totals
    if (newVideo.seriesId) {
      const [maxOrderResult] = await db
        .select({ maxOrder: sql<number>`COALESCE(MAX(${seriesVideos.orderIndex}), -1)` })
        .from(seriesVideos)
        .where(eq(seriesVideos.seriesId, newVideo.seriesId!));

      const nextOrderIndex = (maxOrderResult?.maxOrder ?? -1) + 1;

      await db.insert(seriesVideos).values({
        seriesId: newVideo.seriesId,
        videoId: newVideo.id,
        orderIndex: nextOrderIndex,
      });

      await db.execute(sql`
        UPDATE series
        SET
          video_count = video_count + 1,
          total_duration = total_duration + ${newVideo.duration},
          updated_at = NOW()
        WHERE id = ${newVideo.seriesId}
      `);
    }

    const result = newVideo;

    CacheService.deleteByPrefix("landing:unified-content:");
    if (result.seriesId) CacheService.delete("landing:featured-series");

    return NextResponse.json({
      success: true,
      video: {
        ...result,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      },
    });
  } catch (error) {
    console.error("Video save error:", error);
    return NextResponse.json(
      { error: "Failed to save video. Please try again." },
      { status: 500 }
    );
  }
}
