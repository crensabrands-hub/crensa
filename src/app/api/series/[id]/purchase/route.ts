import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { seriesPurchasesRepository } from '@/lib/database/repositories/seriesPurchases';
import { userRepository } from '@/lib/database/repositories/users';
import { db } from '@/lib/database';
import { series } from '@/lib/database/schema';
import { eq, sql } from 'drizzle-orm';
import { coinTransactionService } from '@/lib/services/coinTransactionService';
import { seriesAccessService } from '@/lib/services/seriesAccessService';

export interface SeriesPurchaseRequest {

}

export interface OwnedVideoInfo {
 videoTitle: string;
 coinPrice: number;
}

export interface SeriesPurchaseResponse {
 success: boolean;
 message: string;
 coinsSpent?: number;
 originalPrice?: number;
 adjustedPrice?: number;
 deductions?: OwnedVideoInfo[];
 remainingBalance?: number;
 hasAccess?: boolean;
}

export async function POST(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {

 const { userId } = await auth();
 if (!userId) {
 console.error('[SeriesPurchase] Authentication required');
 return NextResponse.json(
 { success: false, error: 'Authentication required' },
 { status: 401 }
 );
 }

 const { id: seriesId } = await params;

 const user = await userRepository.findByClerkId(userId);
 if (!user) {
 console.error('[SeriesPurchase] User not found:', userId);
 return NextResponse.json(
 { success: false, error: 'User not found' },
 { status: 404 }
 );
 }

 const [seriesData] = await db
 .select({
 id: series.id,
 title: series.title,
 coinPrice: series.coinPrice,
 creatorId: series.creatorId,
 isActive: series.isActive,
 })
 .from(series)
 .where(eq(series.id, seriesId))
 .limit(1);

 if (!seriesData) {
 console.error('[SeriesPurchase] Series not found:', seriesId);
 return NextResponse.json(
 { success: false, error: 'Series not found' },
 { status: 404 }
 );
 }

 if (!seriesData.isActive) {
 console.error('[SeriesPurchase] Series is inactive:', seriesId);
 return NextResponse.json(
 { success: false, error: 'Series is not available for purchase' },
 { status: 400 }
 );
 }

 const existingPurchase = await seriesPurchasesRepository.findByUserAndSeries(
 user.id,
 seriesId
 );

 if (existingPurchase) {
 console.log('[SeriesPurchase] User already owns series:', { userId: user.id, seriesId });
 return NextResponse.json({
 success: true,
 message: 'You have already purchased this series',
 hasAccess: true,
 });
 }

 if (seriesData.creatorId === user.id) {

 await seriesPurchasesRepository.create({
 seriesId,
 userId: user.id,
 purchasePrice: "0.00",
 status: "completed",
 metadata: {
 type: "creator_access",
 grantedAt: new Date().toISOString(),
 },
 });

 console.log('[SeriesPurchase] Creator access granted:', { userId: user.id, seriesId });
 return NextResponse.json({
 success: true,
 message: "Creator access granted",
 hasAccess: true,
 });
 }

 const priceCalculation = await seriesAccessService.calculateAdjustedPrice({
 userId: user.id,
 seriesId
 });

 const originalPrice = seriesData.coinPrice || 0;
 const adjustedPrice = priceCalculation.adjustedPrice;
 const ownedVideos = priceCalculation.ownedVideos;

 console.log('[SeriesPurchase] Price calculation:', {
 userId: user.id,
 seriesId,
 originalPrice,
 adjustedPrice,
 ownedVideosCount: ownedVideos.length,
 totalDeduction: priceCalculation.totalDeduction,
 allVideosOwned: priceCalculation.allVideosOwned
 });

 if (priceCalculation.allVideosOwned) {

 await seriesPurchasesRepository.create({
 seriesId,
 userId: user.id,
 purchasePrice: "0.00",
 status: "completed",
 metadata: {
 type: "all_videos_owned",
 originalPrice,
 ownedVideos: ownedVideos.map(v => ({
 videoId: v.videoId,
 title: v.title,
 coinPrice: v.coinPrice
 })),
 grantedAt: new Date().toISOString(),
 },
 });

 console.log('[SeriesPurchase] All videos owned, series access granted for free:', {
 userId: user.id,
 seriesId
 });

 return NextResponse.json({
 success: true,
 message: 'You own all videos in this series',
 coinsSpent: 0,
 originalPrice,
 adjustedPrice: 0,
 deductions: ownedVideos.map(v => ({
 videoTitle: v.title,
 coinPrice: v.coinPrice
 })),
 hasAccess: true,
 });
 }

 const balanceCheck = await coinTransactionService.checkSufficientCoins(
 user.id,
 adjustedPrice
 );

 if (!balanceCheck.sufficient) {
 const shortfall = adjustedPrice - balanceCheck.balance;
 console.error('[SeriesPurchase] Insufficient coins:', {
 userId: user.id,
 seriesId,
 required: adjustedPrice,
 available: balanceCheck.balance,
 shortfall
 });

 return NextResponse.json(
 {
 success: false,
 error: `Insufficient coins. You need ${shortfall} more coins.`,
 coinsRequired: adjustedPrice,
 coinsAvailable: balanceCheck.balance,
 coinsShortfall: shortfall,
 originalPrice,
 adjustedPrice,
 deductions: ownedVideos.map(v => ({
 videoTitle: v.title,
 coinPrice: v.coinPrice
 })),
 },
 { status: 400 }
 );
 }

 let newBalance: number = 0;

 await db.transaction(async (tx) => {

 const coinResult = await coinTransactionService.createCoinTransaction({
 userId: user.id,
 transactionType: "spend",
 coinAmount: adjustedPrice,
 relatedContentType: "series",
 relatedContentId: seriesId,
 description: `Purchased series: ${seriesData.title}${ownedVideos.length > 0 ? ` (adjusted price, ${ownedVideos.length} videos already owned)` : ''}`,
 });

 if (!coinResult.success) {
 throw new Error(coinResult.error || "Failed to process coin transaction");
 }

 newBalance = coinResult.newBalance || 0;

 await seriesPurchasesRepository.create({
 seriesId,
 userId: user.id,
 purchasePrice: (adjustedPrice / 20).toFixed(2), // Convert coins to rupees for legacy field
 status: "completed",
 metadata: {
 type: "coin_payment",
 coinsSpent: adjustedPrice,
 originalPrice,
 adjustedPrice,
 ownedVideos: ownedVideos.map(v => ({
 videoId: v.videoId,
 title: v.title,
 coinPrice: v.coinPrice
 })),
 totalDeduction: priceCalculation.totalDeduction,
 purchasedAt: new Date().toISOString(),
 },
 });

 await tx
 .update(series)
 .set({
 viewCount: sql`${series.viewCount} + 1`,
 updatedAt: new Date(),
 })
 .where(eq(series.id, seriesId));

 await coinTransactionService.recordCreatorEarning(
 seriesData.creatorId,
 adjustedPrice,
 "series",
 seriesId,
 `Earned from series purchase: ${seriesData.title}`
 );
 });

 console.log('[SeriesPurchase] Series purchased successfully:', {
 userId: user.id,
 seriesId,
 coinsSpent: adjustedPrice,
 newBalance
 });

 const response: SeriesPurchaseResponse = {
 success: true,
 message: ownedVideos.length > 0 
 ? `Series purchased successfully with adjusted price (${ownedVideos.length} video${ownedVideos.length > 1 ? 's' : ''} already owned)`
 : "Series purchased successfully",
 coinsSpent: adjustedPrice,
 originalPrice,
 adjustedPrice,
 deductions: ownedVideos.map(v => ({
 videoTitle: v.title,
 coinPrice: v.coinPrice
 })),
 remainingBalance: newBalance,
 hasAccess: true,
 };

 return NextResponse.json(response);
 } catch (error) {

 console.error('[SeriesPurchase] Error purchasing series:', {
 error: error instanceof Error ? error.message : 'Unknown error',
 stack: error instanceof Error ? error.stack : undefined,
 seriesId: (await params).id
 });

 if (error instanceof Error && error.message.includes('network')) {
 return NextResponse.json(
 { 
 success: false,
 error: 'Network error. Please check your connection.',
 },
 { status: 503 }
 );
 }
 
 return NextResponse.json(
 { 
 success: false,
 error: 'Payment failed. Please try again.',
 details: error instanceof Error ? error.message : 'Unknown error',
 },
 { status: 500 }
 );
 }
}

export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {

 const { userId } = await auth();
 if (!userId) {
 return NextResponse.json(
 { error: 'Unauthorized' },
 { status: 401 }
 );
 }

 const { id: seriesId } = await params;

 const user = await userRepository.findByClerkId(userId);
 if (!user) {
 return NextResponse.json(
 { error: 'User not found' },
 { status: 404 }
 );
 }

 const accessDetails = await seriesPurchasesRepository.getSeriesAccess(
 user.id,
 seriesId
 );

 return NextResponse.json(accessDetails);
 } catch (error) {
 console.error('Error getting series purchase status:', error);
 return NextResponse.json(
 { error: 'Failed to get purchase status' },
 { status: 500 }
 );
 }
}