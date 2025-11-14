

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { videos, series } from "@/lib/database/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
 const { id: seriesId } = await params;

 const [seriesData] = await db
 .select()
 .from(series)
 .where(eq(series.id, seriesId))
 .limit(1);

 if (!seriesData) {
 return NextResponse.json(
 { success: false, error: "Series not found" },
 { status: 404 }
 );
 }

 const seriesVideos = await db
 .select({
 id: videos.id,
 title: videos.title,
 description: videos.description,
 thumbnailUrl: videos.thumbnailUrl,
 duration: videos.duration,
 coinPrice: videos.coinPrice,
 viewCount: videos.viewCount,
 isActive: videos.isActive,
 createdAt: videos.createdAt,
 })
 .from(videos)
 .where(eq(videos.seriesId, seriesId))
 .orderBy(asc(videos.createdAt));

 return NextResponse.json({
 success: true,
 videos: seriesVideos.map((v) => ({
 videoId: v.id,
 seriesId: seriesId,
 video: {
 id: v.id,
 title: v.title,
 description: v.description,
 thumbnailUrl: v.thumbnailUrl,
 duration: v.duration,
 coinPrice: v.coinPrice,
 viewCount: v.viewCount,
 isActive: v.isActive,
 createdAt: v.createdAt,
 },
 })),
 count: seriesVideos.length,
 });
 } catch (error) {
 console.error("Error fetching series videos:", error);
 return NextResponse.json(
 { success: false, error: "Failed to fetch series videos" },
 { status: 500 }
 );
 }
}
