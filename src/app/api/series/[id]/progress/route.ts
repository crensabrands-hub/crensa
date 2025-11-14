import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories/users';
import { updateSeriesProgress, getSeriesAccessSummary } from '@/lib/middleware/seriesAccess';

export interface UpdateProgressRequest {
 videoId: string;
 markAsWatched?: boolean;
 updateCurrentVideo?: boolean;
}

export interface ProgressResponse {
 success: boolean;
 progress?: {
 videosWatched: number;
 totalVideos: number;
 progressPercentage: number;
 currentVideoId?: string;
 lastWatchedAt: Date;
 completedAt?: Date;
 };
}

export async function POST(
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
 const body: UpdateProgressRequest = await request.json();
 const { videoId, markAsWatched = false, updateCurrentVideo = true } = body;

 if (!videoId) {
 return NextResponse.json(
 { error: 'Video ID is required' },
 { status: 400 }
 );
 }

 const user = await userRepository.findByClerkId(userId);
 if (!user) {
 return NextResponse.json(
 { error: 'User not found' },
 { status: 404 }
 );
 }

 const accessSummary = await getSeriesAccessSummary(user.id, seriesId);
 if (!accessSummary || !accessSummary.hasAccess) {
 return NextResponse.json(
 { 
 error: 'Access denied. You need to purchase this series to track progress.',
 requiresPurchase: true,
 seriesId,
 },
 { status: 403 }
 );
 }

 await updateSeriesProgress(user.id, seriesId, videoId, {
 markAsWatched,
 updateCurrentVideo,
 });

 const updatedAccessSummary = await getSeriesAccessSummary(user.id, seriesId);
 const progress = updatedAccessSummary?.progress;

 if (!progress) {
 return NextResponse.json(
 { error: 'Failed to retrieve updated progress' },
 { status: 500 }
 );
 }

 const response: ProgressResponse = {
 success: true,
 progress: {
 videosWatched: progress.videosWatched,
 totalVideos: progress.totalVideos,
 progressPercentage: parseFloat(progress.progressPercentage),
 currentVideoId: progress.currentVideoId || undefined,
 lastWatchedAt: progress.lastWatchedAt,
 completedAt: progress.completedAt || undefined,
 },
 };

 return NextResponse.json(response);
 } catch (error) {
 console.error('Error updating series progress:', error);
 return NextResponse.json(
 { error: 'Failed to update progress' },
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

 const accessSummary = await getSeriesAccessSummary(user.id, seriesId);
 if (!accessSummary) {
 return NextResponse.json(
 { error: 'Series not found' },
 { status: 404 }
 );
 }

 if (!accessSummary.hasAccess) {
 return NextResponse.json(
 { 
 error: 'Access denied. You need to purchase this series to view progress.',
 requiresPurchase: true,
 seriesId,
 },
 { status: 403 }
 );
 }

 const progress = accessSummary.progress;

 const response: ProgressResponse = {
 success: true,
 progress: progress ? {
 videosWatched: progress.videosWatched,
 totalVideos: progress.totalVideos,
 progressPercentage: parseFloat(progress.progressPercentage),
 currentVideoId: progress.currentVideoId || undefined,
 lastWatchedAt: progress.lastWatchedAt,
 completedAt: progress.completedAt || undefined,
 } : {
 videosWatched: 0,
 totalVideos: accessSummary.videoCount,
 progressPercentage: 0,
 lastWatchedAt: new Date(),
 },
 };

 return NextResponse.json(response);
 } catch (error) {
 console.error('Error getting series progress:', error);
 return NextResponse.json(
 { error: 'Failed to get progress' },
 { status: 500 }
 );
 }
}