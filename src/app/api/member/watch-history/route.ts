

import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories/users';
import { db } from '@/lib/database/connection';
import { memberProfiles, videos, users, transactions, creatorProfiles } from '@/lib/database/schema';
import { eq, desc, and, like, or, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
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

 const { searchParams } = new URL(request.url);
 const page = parseInt(searchParams.get("page") || "1");
 const limit = parseInt(searchParams.get("limit") || "20");
 const category = searchParams.get("category");
 const search = searchParams.get("search");

 let whereConditions = [
 eq(transactions.userId, user.id),
 eq(transactions.type, 'video_view'),
 eq(transactions.status, 'completed')
 ];

 if (search) {
 whereConditions.push(
 or(
 like(videos.title, `%${search}%`),
 like(users.username, `%${search}%`)
 )!
 );
 }

 if (category && category !== "all") {
 whereConditions.push(eq(videos.category, category));
 }

 const [totalCountResult] = await db
 .select({ count: sql<number>`count(*)` })
 .from(transactions)
 .innerJoin(videos, eq(transactions.videoId, videos.id))
 .innerJoin(users, eq(videos.creatorId, users.id))
 .leftJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
 .where(and(...whereConditions));

 const totalCount = totalCountResult.count || 0;

 const historyData = await db
 .select({
 id: transactions.id,
 videoId: transactions.videoId,
 watchedAt: transactions.createdAt,
 amount: transactions.amount,
 videoTitle: videos.title,
 videoThumbnail: videos.thumbnailUrl,
 videoDuration: videos.duration,
 videoCategory: videos.category,
 creatorUsername: users.username,
 creatorDisplayName: creatorProfiles.displayName
 })
 .from(transactions)
 .innerJoin(videos, eq(transactions.videoId, videos.id))
 .innerJoin(users, eq(videos.creatorId, users.id))
 .leftJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
 .where(and(...whereConditions))
 .orderBy(desc(transactions.createdAt))
 .limit(limit)
 .offset((page - 1) * limit);

 const transformedHistory = historyData.map(item => ({
 id: item.id,
 videoId: item.videoId!,
 title: item.videoTitle,
 creator: item.creatorDisplayName || item.creatorUsername,
 thumbnail: item.videoThumbnail,
 watchedAt: item.watchedAt.toISOString(),
 duration: item.videoDuration,
 watchProgress: 100, // Assume completed since it's a transaction
 category: item.videoCategory
 }));

 const totalPages = Math.ceil(totalCount / limit);

 return NextResponse.json({
 success: true,
 history: transformedHistory,
 pagination: {
 page,
 limit,
 total: totalCount,
 totalPages,
 hasNext: page < totalPages,
 hasPrev: page > 1
 }
 });
 } catch (error) {
 console.error("Error fetching watch history:", error);
 return NextResponse.json(
 {
 success: false,
 error: "Failed to fetch watch history"
 },
 { status: 500 }
 );
 }
}

export async function DELETE(request: NextRequest) {
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

 const { searchParams } = new URL(request.url);
 const videoId = searchParams.get("videoId");

 if (videoId) {

 await db
 .delete(transactions)
 .where(and(
 eq(transactions.userId, user.id),
 eq(transactions.videoId, videoId),
 eq(transactions.type, 'video_view')
 ));

 return NextResponse.json({
 success: true,
 message: "Video removed from history"
 });
 } else {

 await db
 .delete(transactions)
 .where(and(
 eq(transactions.userId, user.id),
 eq(transactions.type, 'video_view')
 ));

 return NextResponse.json({
 success: true,
 message: "Watch history cleared"
 });
 }
 } catch (error) {
 console.error("Error clearing watch history:", error);
 return NextResponse.json(
 {
 success: false,
 error: "Failed to clear watch history"
 },
 { status: 500 }
 );
 }
}