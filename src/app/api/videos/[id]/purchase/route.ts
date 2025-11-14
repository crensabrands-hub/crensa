

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { userRepository } from "@/lib/database/repositories/users";
import { db } from "@/lib/database/connection";
import { videos, transactions } from "@/lib/database/schema";
import { eq, and, sql } from "drizzle-orm";
import { coinTransactionService } from "@/lib/services/coinTransactionService";
import { seriesAccessService } from "@/lib/services/seriesAccessService";

export async function POST(
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

 const { id: videoId } = await params;

 const videoData = await db
 .select({
 id: videos.id,
 coinPrice: videos.coinPrice,
 creatorId: videos.creatorId,
 title: videos.title,
 seriesId: videos.seriesId,
 })
 .from(videos)
 .where(and(eq(videos.id, videoId), eq(videos.isActive, true)))
 .limit(1);

 if (videoData.length === 0) {
 return NextResponse.json(
 { success: false, error: "Video not found" },
 { status: 404 }
 );
 }

 const video = videoData[0];
 const coinPrice = video.coinPrice || 0;

 const accessCheck = await seriesAccessService.checkVideoAccess({
 userId: user.id,
 videoId: videoId
 });

 if (accessCheck.hasAccess) {

 let message = "You already have access to this video";
 if (accessCheck.accessType === 'series_purchase') {
 message = "You have access to this video through your series purchase";
 } else if (accessCheck.accessType === 'video_purchase') {
 message = "You already purchased this video";
 } else if (accessCheck.accessType === 'creator_access') {
 message = "You have access to this video as the creator";
 }

 return NextResponse.json({
 success: true,
 message,
 hasAccess: true,
 accessType: accessCheck.accessType,
 purchaseDate: accessCheck.purchaseDate,
 coinsSpent: 0,
 });
 }

 const balanceCheck = await coinTransactionService.checkSufficientCoins(
 user.id,
 coinPrice
 );

 if (!balanceCheck.sufficient) {
 return NextResponse.json(
 {
 success: false,
 error: "Insufficient coins",
 details: balanceCheck.error,
 coinsRequired: coinPrice,
 coinsAvailable: balanceCheck.balance,
 coinsShortfall: balanceCheck.error?.shortfall,
 },
 { status: 400 }
 );
 }

 let newBalance: number = 0;
 
 await db.transaction(async (tx) => {

 const coinResult = await coinTransactionService.createCoinTransaction({
 userId: user.id,
 transactionType: "spend",
 coinAmount: coinPrice,
 relatedContentType: "video",
 relatedContentId: videoId,
 description: `Purchased video: ${video.title}`,
 });

 if (!coinResult.success) {
 throw new Error(coinResult.error || "Failed to process coin transaction");
 }

 newBalance = coinResult.newBalance || 0;

 await tx.insert(transactions).values({
 userId: user.id,
 type: "video_view",
 amount: coinPrice.toString(),
 videoId: videoId,
 creatorId: video.creatorId,
 status: "completed",
 metadata: {
 videoTitle: video.title,
 purchaseType: "coin_payment",
 coinsSpent: coinPrice,
 },
 });

 await tx
 .update(videos)
 .set({
 viewCount: sql`${videos.viewCount} + 1`,
 updatedAt: new Date(),
 })
 .where(eq(videos.id, videoId));

 await coinTransactionService.recordCreatorEarning(
 video.creatorId,
 coinPrice,
 "video",
 videoId,
 `Earned from video purchase: ${video.title}`
 );
 });

 return NextResponse.json({
 success: true,
 message: "Video access purchased successfully",
 coinsSpent: coinPrice,
 remainingBalance: newBalance,
 hasAccess: true,
 accessType: "video_purchase",
 purchaseDate: new Date(),
 });
 } catch (error) {
 console.error("Error purchasing video access:", error);
 return NextResponse.json(
 {
 success: false,
 error: "Failed to purchase video access",
 details: error instanceof Error ? error.message : "Unknown error",
 },
 { status: 500 }
 );
 }
}
