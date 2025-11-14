import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { seriesPurchasesRepository } from '@/lib/database/repositories/seriesPurchases';
import { userRepository } from '@/lib/database/repositories/users';
import { db } from '@/lib/database';
import { series } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';

export interface SeriesAccessContext {
 userId: string;
 seriesId: string;
 hasAccess: boolean;
 isCreator: boolean;
 purchase?: any;
 series?: any;
}

export async function checkSeriesAccess(
 request: NextRequest,
 seriesId: string
): Promise<{ success: boolean; context?: SeriesAccessContext; error?: string; status?: number }> {
 try {

 const { userId } = await auth();
 if (!userId) {
 return {
 success: false,
 error: 'Unauthorized',
 status: 401,
 };
 }

 const user = await userRepository.findByClerkId(userId);
 if (!user) {
 return {
 success: false,
 error: 'User not found',
 status: 404,
 };
 }

 const [seriesData] = await db
 .select()
 .from(series)
 .where(eq(series.id, seriesId))
 .limit(1);

 if (!seriesData) {
 return {
 success: false,
 error: 'Series not found',
 status: 404,
 };
 }

 const isCreator = seriesData.creatorId === user.id;

 if (isCreator) {
 return {
 success: true,
 context: {
 userId: user.id,
 seriesId,
 hasAccess: true,
 isCreator: true,
 series: seriesData,
 },
 };
 }

 const purchase = await seriesPurchasesRepository.findByUserAndSeries(
 user.id,
 seriesId
 );

 const hasAccess = !!purchase;

 return {
 success: true,
 context: {
 userId: user.id,
 seriesId,
 hasAccess,
 isCreator: false,
 purchase,
 series: seriesData,
 },
 };
 } catch (error) {
 console.error('Error checking series access:', error);
 return {
 success: false,
 error: 'Internal server error',
 status: 500,
 };
 }
}

export async function enforceSeriesAccess(
 request: NextRequest,
 seriesId: string
): Promise<{ success: boolean; context?: SeriesAccessContext; response?: NextResponse }> {
 const accessCheck = await checkSeriesAccess(request, seriesId);

 if (!accessCheck.success) {
 return {
 success: false,
 response: NextResponse.json(
 { error: accessCheck.error },
 { status: accessCheck.status || 500 }
 ),
 };
 }

 if (!accessCheck.context?.hasAccess) {
 return {
 success: false,
 response: NextResponse.json(
 { 
 error: 'Access denied. You need to purchase this series to access its content.',
 requiresPurchase: true,
 seriesId,
 },
 { status: 403 }
 ),
 };
 }

 return {
 success: true,
 context: accessCheck.context,
 };
}

export async function checkSeriesVideoAccess(
 request: NextRequest,
 seriesId: string,
 videoId: string
): Promise<{ success: boolean; context?: SeriesAccessContext; error?: string; status?: number }> {

 const seriesAccess = await checkSeriesAccess(request, seriesId);
 
 if (!seriesAccess.success) {
 return seriesAccess;
 }

 if (!seriesAccess.context?.hasAccess) {
 return {
 success: false,
 error: 'Access denied. You need to purchase this series to watch its videos.',
 status: 403,
 };
 }

 return seriesAccess;
}

export async function updateSeriesProgress(
 userId: string,
 seriesId: string,
 videoId: string,
 options?: {
 markAsWatched?: boolean;
 updateCurrentVideo?: boolean;
 }
): Promise<void> {
 try {
 const { markAsWatched = false, updateCurrentVideo = true } = options || {};

 const currentProgress = await seriesPurchasesRepository.getSeriesProgress(
 userId,
 seriesId
 );

 const [seriesData] = await db
 .select({
 videoCount: series.videoCount,
 })
 .from(series)
 .where(eq(series.id, seriesId))
 .limit(1);

 const totalVideos = seriesData?.videoCount || 0;
 let videosWatched = currentProgress?.videosWatched || 0;

 if (markAsWatched && currentProgress?.currentVideoId !== videoId) {
 videosWatched += 1;
 }

 const progressPercentage = totalVideos > 0 
 ? Math.min((videosWatched / totalVideos) * 100, 100)
 : 0;

 await seriesPurchasesRepository.updateProgress({
 seriesId,
 userId,
 currentVideoId: updateCurrentVideo ? videoId : currentProgress?.currentVideoId,
 videosWatched,
 totalVideos,
 progressPercentage: progressPercentage.toFixed(2),
 completedAt: progressPercentage >= 100 ? new Date() : undefined,
 });
 } catch (error) {
 console.error('Error updating series progress:', error);

 }
}

export async function getSeriesAccessSummary(
 userId: string,
 seriesId: string
) {
 try {
 const accessDetails = await seriesPurchasesRepository.getSeriesAccess(
 userId,
 seriesId
 );

 const [seriesData] = await db
 .select({
 id: series.id,
 title: series.title,
 totalPrice: series.totalPrice,
 videoCount: series.videoCount,
 creatorId: series.creatorId,
 })
 .from(series)
 .where(eq(series.id, seriesId))
 .limit(1);

 if (!seriesData) {
 return null;
 }

 const user = await userRepository.findById(userId);
 const isCreator = user && seriesData.creatorId === user.id;

 return {
 seriesId,
 seriesTitle: seriesData.title,
 totalPrice: seriesData.totalPrice,
 videoCount: seriesData.videoCount,
 hasAccess: accessDetails.hasAccess || isCreator,
 isCreator: !!isCreator,
 purchaseDate: accessDetails.purchaseDate,
 expiresAt: accessDetails.expiresAt,
 progress: accessDetails.progress,
 };
 } catch (error) {
 console.error('Error getting series access summary:', error);
 return null;
 }
}