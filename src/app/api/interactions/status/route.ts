

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories/users';
import { videoInteractionService } from '@/lib/services/videoInteractionService';
import { db } from '@/lib/database/connection';
import { creatorFollows, videos } from '@/lib/database/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
 try {
 const { userId } = await auth();
 
 if (!userId) {
 return NextResponse.json(
 { error: 'Unauthorized' },
 { status: 401 }
 );
 }

 const user = await userRepository.findByClerkId(userId);
 if (!user) {
 return NextResponse.json(
 { error: 'User not found' },
 { status: 404 }
 );
 }

 const { searchParams } = new URL(request.url);
 const videoId = searchParams.get('videoId');
 const creatorId = searchParams.get('creatorId');
 const videoIds = searchParams.get('videoIds')?.split(',');
 const creatorIds = searchParams.get('creatorIds')?.split(',');

 if (videoId) {

 const status = await videoInteractionService.getInteractionStatus(user.id, videoId);
 
 return NextResponse.json({
 success: true,
 data: {
 videoId,
 ...status
 }
 });
 } else if (creatorId) {

 const isFollowing = await getFollowStatus(user.id, creatorId);
 
 return NextResponse.json({
 success: true,
 data: {
 creatorId,
 isFollowing
 }
 });
 } else if (videoIds && videoIds.length > 0) {

 const statuses = await Promise.all(
 videoIds.map(async (vId) => {
 const status = await videoInteractionService.getInteractionStatus(user.id, vId);
 return {
 videoId: vId,
 ...status
 };
 })
 );
 
 return NextResponse.json({
 success: true,
 data: {
 videoStatuses: statuses
 }
 });
 } else if (creatorIds && creatorIds.length > 0) {

 const statuses = await Promise.all(
 creatorIds.map(async (cId) => {
 const isFollowing = await getFollowStatus(user.id, cId);
 return {
 creatorId: cId,
 isFollowing
 };
 })
 );
 
 return NextResponse.json({
 success: true,
 data: {
 creatorStatuses: statuses
 }
 });
 } else {
 return NextResponse.json(
 { error: 'Either videoId, creatorId, videoIds, or creatorIds parameter is required' },
 { status: 400 }
 );
 }
 } catch (error) {
 console.error('Interaction status API error:', error);
 return NextResponse.json(
 { 
 error: 'Internal server error',
 details: error instanceof Error ? error.message : 'Unknown error'
 },
 { status: 500 }
 );
 }
}

export async function POST(request: NextRequest) {
 try {
 const { userId } = await auth();
 
 if (!userId) {
 return NextResponse.json(
 { error: 'Unauthorized' },
 { status: 401 }
 );
 }

 const user = await userRepository.findByClerkId(userId);
 if (!user) {
 return NextResponse.json(
 { error: 'User not found' },
 { status: 404 }
 );
 }

 const body = await request.json();
 const { videoIds, creatorIds } = body;

 const result: any = {};

 if (videoIds && Array.isArray(videoIds)) {

 const videoStatuses = await Promise.all(
 videoIds.map(async (videoId: string) => {
 try {
 const status = await videoInteractionService.getInteractionStatus(user.id, videoId);
 return {
 videoId,
 ...status
 };
 } catch (error) {
 console.error(`Error getting status for video ${videoId}:`, error);
 return {
 videoId,
 isLiked: false,
 isSaved: false,
 isFollowingCreator: false,
 likeCount: 0,
 commentCount: 0,
 error: 'Failed to get status'
 };
 }
 })
 );
 
 result.videoStatuses = videoStatuses;
 }

 if (creatorIds && Array.isArray(creatorIds)) {

 const creatorStatuses = await Promise.all(
 creatorIds.map(async (creatorId: string) => {
 try {
 const isFollowing = await getFollowStatus(user.id, creatorId);
 return {
 creatorId,
 isFollowing
 };
 } catch (error) {
 console.error(`Error getting follow status for creator ${creatorId}:`, error);
 return {
 creatorId,
 isFollowing: false,
 error: 'Failed to get status'
 };
 }
 })
 );
 
 result.creatorStatuses = creatorStatuses;
 }

 if (Object.keys(result).length === 0) {
 return NextResponse.json(
 { error: 'Either videoIds or creatorIds array is required' },
 { status: 400 }
 );
 }

 return NextResponse.json({
 success: true,
 data: result
 });
 } catch (error) {
 console.error('Interaction status POST API error:', error);
 return NextResponse.json(
 { 
 error: 'Internal server error',
 details: error instanceof Error ? error.message : 'Unknown error'
 },
 { status: 500 }
 );
 }
}

async function getFollowStatus(userId: string, creatorId: string): Promise<boolean> {
 try {
 const followRecord = await db
 .select()
 .from(creatorFollows)
 .where(and(
 eq(creatorFollows.followerId, userId),
 eq(creatorFollows.creatorId, creatorId)
 ))
 .limit(1);

 return followRecord.length > 0;
 } catch (error) {
 console.error('Error checking follow status:', error);
 return false;
 }
}