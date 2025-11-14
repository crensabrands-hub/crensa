

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories/users';
import { videoInteractionService } from '@/lib/services/videoInteractionService';

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
 const { creatorId } = body;

 if (!creatorId) {
 return NextResponse.json(
 { error: 'Creator ID is required' },
 { status: 400 }
 );
 }

 const creator = await userRepository.findById(creatorId);
 if (!creator) {
 return NextResponse.json(
 { error: 'Creator not found' },
 { status: 404 }
 );
 }

 if (creator.role !== 'creator') {
 return NextResponse.json(
 { error: 'User is not a creator' },
 { status: 400 }
 );
 }

 const result = await videoInteractionService.toggleFollow(user.id, creatorId);

 return NextResponse.json({
 success: true,
 data: {
 isFollowing: result.isFollowing,
 creatorId,
 message: result.isFollowing ? 'Successfully followed creator' : 'Successfully unfollowed creator'
 }
 });
 } catch (error) {
 console.error('Follow API error:', error);

 if (error instanceof Error && error.message === 'Cannot follow yourself') {
 return NextResponse.json(
 { error: 'Cannot follow yourself' },
 { status: 400 }
 );
 }

 return NextResponse.json(
 { 
 error: 'Internal server error',
 details: error instanceof Error ? error.message : 'Unknown error'
 },
 { status: 500 }
 );
 }
}

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
 const creatorId = searchParams.get('creatorId');
 const limit = parseInt(searchParams.get('limit') || '20');
 const offset = parseInt(searchParams.get('offset') || '0');

 if (creatorId) {

 const creator = await userRepository.findById(creatorId);
 if (!creator) {
 return NextResponse.json(
 { error: 'Creator not found' },
 { status: 404 }
 );
 }

 const status = await videoInteractionService.getInteractionStatus(user.id, 'dummy-video-id');

 return NextResponse.json({
 success: true,
 data: {
 creatorId,
 isFollowing: false // This would need to be implemented properly
 }
 });
 } else {

 return NextResponse.json({
 success: true,
 data: {
 followedCreators: [],
 total: 0,
 limit,
 offset
 }
 });
 }
 } catch (error) {
 console.error('Follow GET API error:', error);
 return NextResponse.json(
 { 
 error: 'Internal server error',
 details: error instanceof Error ? error.message : 'Unknown error'
 },
 { status: 500 }
 );
 }
}