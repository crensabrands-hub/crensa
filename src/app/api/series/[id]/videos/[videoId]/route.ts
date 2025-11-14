

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { userRepository } from "@/lib/database/repositories/users";
import { db } from "@/lib/database";
import {
 series,
 seriesVideos,
 videos,
} from "@/lib/database";
import { eq, and, gt, sql } from "drizzle-orm";

export async function DELETE(
 request: NextRequest,
 { params }: { params: Promise<{ id: string; videoId: string }> }
) {
 try {

 const { userId } = await auth();
 if (!userId) {
 return NextResponse.json(
 { success: false, error: "Authentication required" },
 { status: 401 }
 );
 }

 const user = await userRepository.findByClerkId(userId);
 if (!user) {
 return NextResponse.json(
 { success: false, error: "User not found" },
 { status: 404 }
 );
 }

 if (user.role !== "creator") {
 return NextResponse.json(
 { success: false, error: "Only creators can manage series videos" },
 { status: 403 }
 );
 }

 const { id: seriesId, videoId } = await params;

 const existingSeries = await db
 .select({
 id: series.id,
 creatorId: series.creatorId,
 title: series.title,
 isActive: series.isActive,
 videoCount: series.videoCount,
 totalDuration: series.totalDuration,
 })
 .from(series)
 .where(eq(series.id, seriesId))
 .limit(1);

 if (existingSeries.length === 0) {
 return NextResponse.json(
 { success: false, error: "Series not found" },
 { status: 404 }
 );
 }

 const seriesInfo = existingSeries[0];

 if (seriesInfo.creatorId !== user.id) {
 return NextResponse.json(
 { success: false, error: "You can only manage your own series" },
 { status: 403 }
 );
 }

 const existingVideo = await db
 .select({
 id: videos.id,
 creatorId: videos.creatorId,
 title: videos.title,
 duration: videos.duration,
 seriesId: videos.seriesId,
 })
 .from(videos)
 .where(eq(videos.id, videoId))
 .limit(1);

 if (existingVideo.length === 0) {
 return NextResponse.json(
 { success: false, error: "Video not found" },
 { status: 404 }
 );
 }

 const videoInfo = existingVideo[0];

 if (videoInfo.creatorId !== user.id) {
 return NextResponse.json(
 { success: false, error: "You can only remove your own videos from series" },
 { status: 403 }
 );
 }

 const existingSeriesVideo = await db
 .select({
 id: seriesVideos.id,
 orderIndex: seriesVideos.orderIndex,
 })
 .from(seriesVideos)
 .where(
 and(
 eq(seriesVideos.seriesId, seriesId),
 eq(seriesVideos.videoId, videoId)
 )
 )
 .limit(1);

 if (existingSeriesVideo.length === 0) {
 return NextResponse.json(
 { success: false, error: "Video is not in this series" },
 { status: 400 }
 );
 }

 const seriesVideoInfo = existingSeriesVideo[0];

 const deletedSeriesVideo = await db
 .delete(seriesVideos)
 .where(eq(seriesVideos.id, seriesVideoInfo.id))
 .returning({
 id: seriesVideos.id,
 orderIndex: seriesVideos.orderIndex,
 });

 if (deletedSeriesVideo.length === 0) {
 return NextResponse.json(
 { success: false, error: "Failed to remove video from series" },
 { status: 500 }
 );
 }

 await db
 .update(videos)
 .set({ seriesId: null, updatedAt: new Date() })
 .where(eq(videos.id, videoId));

 await db.execute(sql`
 UPDATE series_videos 
 SET order_index = order_index - 1 
 WHERE series_id = ${seriesId} 
 AND order_index > ${seriesVideoInfo.orderIndex}
 `);

 const newVideoCount = Math.max(0, seriesInfo.videoCount - 1);
 const newTotalDuration = Math.max(0, seriesInfo.totalDuration - (videoInfo.duration || 0));

 await db
 .update(series)
 .set({
 videoCount: newVideoCount,
 totalDuration: newTotalDuration,
 updatedAt: new Date(),
 })
 .where(eq(series.id, seriesId));

 return NextResponse.json({
 success: true,
 message: `Video "${videoInfo.title}" removed from series successfully`,
 removedVideoId: videoId,
 updatedCounts: {
 videoCount: newVideoCount,
 totalDuration: newTotalDuration,
 },
 });
 } catch (error) {
 console.error("Error removing video from series:", error);
 return NextResponse.json(
 {
 success: false,
 error: "Failed to remove video from series",
 details: error instanceof Error ? error.message : "Unknown error",
 },
 { status: 500 }
 );
 }
}