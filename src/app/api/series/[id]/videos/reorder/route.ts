

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { userRepository } from "@/lib/database/repositories/users";
import { db } from "@/lib/database";
import {
 series,
 seriesVideos,
} from "@/lib/database";
import { eq, and, inArray } from "drizzle-orm";

interface ReorderVideosRequest {
 videoOrders: Array<{
 videoId: string;
 orderIndex: number;
 }>;
}

function validateReorderVideos(data: any): {
 isValid: boolean;
 errors: string[];
 validatedData?: ReorderVideosRequest;
} {
 const errors: string[] = [];
 const validatedData: ReorderVideosRequest = {
 videoOrders: [],
 };

 if (!data.videoOrders || !Array.isArray(data.videoOrders)) {
 errors.push("Video orders must be an array");
 } else if (data.videoOrders.length === 0) {
 errors.push("Video orders array cannot be empty");
 } else {
 const videoIds = new Set<string>();
 const orderIndexes = new Set<number>();

 for (let i = 0; i < data.videoOrders.length; i++) {
 const item = data.videoOrders[i];

 if (!item || typeof item !== "object") {
 errors.push(`Video order item ${i} must be an object`);
 continue;
 }

 if (!item.videoId || typeof item.videoId !== "string") {
 errors.push(`Video order item ${i} must have a valid videoId string`);
 continue;
 }

 if (videoIds.has(item.videoId)) {
 errors.push(`Duplicate videoId found: ${item.videoId}`);
 continue;
 }
 videoIds.add(item.videoId);

 const orderIndex = Number(item.orderIndex);
 if (isNaN(orderIndex) || !Number.isInteger(orderIndex) || orderIndex < 1) {
 errors.push(`Video order item ${i} must have a valid positive integer orderIndex`);
 continue;
 }

 if (orderIndexes.has(orderIndex)) {
 errors.push(`Duplicate orderIndex found: ${orderIndex}`);
 continue;
 }
 orderIndexes.add(orderIndex);

 validatedData.videoOrders.push({
 videoId: item.videoId.trim(),
 orderIndex,
 });
 }

 const sortedIndexes = Array.from(orderIndexes).sort((a, b) => a - b);
 for (let i = 0; i < sortedIndexes.length; i++) {
 if (sortedIndexes[i] !== i + 1) {
 errors.push("Order indexes must be consecutive starting from 1");
 break;
 }
 }
 }

 return {
 isValid: errors.length === 0,
 errors,
 validatedData: errors.length === 0 ? validatedData : undefined,
 };
}

export async function PUT(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
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

 const { id: seriesId } = await params;

 let requestData;
 try {
 const body = await request.text();
 if (!body.trim()) {
 return NextResponse.json(
 { success: false, error: "Request body is required" },
 { status: 400 }
 );
 }
 requestData = JSON.parse(body);
 } catch (parseError) {
 return NextResponse.json(
 { success: false, error: "Invalid JSON format in request body" },
 { status: 400 }
 );
 }

 const validation = validateReorderVideos(requestData);
 if (!validation.isValid) {
 return NextResponse.json(
 {
 success: false,
 error: "Validation failed",
 details: validation.errors,
 },
 { status: 400 }
 );
 }

 const { videoOrders } = validation.validatedData!;

 const existingSeries = await db
 .select({
 id: series.id,
 creatorId: series.creatorId,
 title: series.title,
 isActive: series.isActive,
 videoCount: series.videoCount,
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

 if (!seriesInfo.isActive) {
 return NextResponse.json(
 { success: false, error: "Cannot reorder videos in inactive series" },
 { status: 400 }
 );
 }

 const videoIds = videoOrders.map(vo => vo.videoId);
 const existingSeriesVideos = await db
 .select({
 id: seriesVideos.id,
 videoId: seriesVideos.videoId,
 orderIndex: seriesVideos.orderIndex,
 })
 .from(seriesVideos)
 .where(
 and(
 eq(seriesVideos.seriesId, seriesId),
 inArray(seriesVideos.videoId, videoIds)
 )
 );

 if (existingSeriesVideos.length !== videoOrders.length) {
 const existingVideoIds = new Set(existingSeriesVideos.map(sv => sv.videoId));
 const missingVideoIds = videoIds.filter(id => !existingVideoIds.has(id));
 return NextResponse.json(
 {
 success: false,
 error: "Some videos are not in this series",
 details: { missingVideoIds },
 },
 { status: 400 }
 );
 }

 if (existingSeriesVideos.length !== seriesInfo.videoCount) {
 return NextResponse.json(
 {
 success: false,
 error: "Must provide order for all videos in the series",
 details: {
 providedCount: existingSeriesVideos.length,
 totalCount: seriesInfo.videoCount,
 },
 },
 { status: 400 }
 );
 }

 const videoOrderMap = new Map(
 videoOrders.map(vo => [vo.videoId, vo.orderIndex])
 );

 const updatePromises = existingSeriesVideos.map(async (seriesVideo) => {
 const newOrderIndex = videoOrderMap.get(seriesVideo.videoId);
 if (newOrderIndex && newOrderIndex !== seriesVideo.orderIndex) {
 return db
 .update(seriesVideos)
 .set({
 orderIndex: newOrderIndex,
 })
 .where(eq(seriesVideos.id, seriesVideo.id));
 }
 return Promise.resolve();
 });

 await Promise.all(updatePromises);

 await db
 .update(series)
 .set({ updatedAt: new Date() })
 .where(eq(series.id, seriesId));

 const updatedSeriesVideos = await db
 .select({
 id: seriesVideos.id,
 videoId: seriesVideos.videoId,
 orderIndex: seriesVideos.orderIndex,
 })
 .from(seriesVideos)
 .where(eq(seriesVideos.seriesId, seriesId))
 .orderBy(seriesVideos.orderIndex);

 return NextResponse.json({
 success: true,
 message: "Videos reordered successfully",
 updatedVideoOrders: updatedSeriesVideos.map(sv => ({
 videoId: sv.videoId,
 orderIndex: sv.orderIndex,
 })),
 });
 } catch (error) {
 console.error("Error reordering series videos:", error);
 return NextResponse.json(
 {
 success: false,
 error: "Failed to reorder series videos",
 details: error instanceof Error ? error.message : "Unknown error",
 },
 { status: 500 }
 );
 }
}