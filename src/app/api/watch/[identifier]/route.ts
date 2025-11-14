

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories/users';
import { identifierResolutionService, type IdentifierResult, type VideoData, type ShareTokenData } from '@/lib/services/identifierResolutionService';

export async function GET(
 request: NextRequest,
 context: { params: Promise<{ identifier: string }> }
) {
 let identifier: string | undefined;
 let userId: string | undefined;
 
 try {
 const params = await context.params;
 identifier = params.identifier;

 if (!identifier || typeof identifier !== 'string' || identifier.trim().length === 0) {
 return NextResponse.json(
 { 
 success: false,
 error: 'Invalid identifier provided' 
 },
 { status: 400 }
 );
 }

 let user: any = null;
 
 try {
 const authResult = await auth();
 userId = authResult.userId || undefined;
 
 if (userId) {
 user = await userRepository.findByClerkId(userId);
 }
 } catch (authError) {

 console.log('Authentication not available, continuing without user context');
 }

 const resolution: IdentifierResult = await identifierResolutionService.resolveIdentifier(
 identifier.trim(),
 user?.id
 );

 if (!resolution.success) {
 const statusCode = getErrorStatusCode(resolution.error);
 return NextResponse.json(
 { 
 success: false,
 error: resolution.error || 'Failed to resolve identifier' 
 },
 { status: statusCode }
 );
 }

 if (resolution.type === 'video_id') {
 return handleVideoIdResponse(resolution, user?.id);
 } else {
 return handleShareTokenResponse(resolution);
 }

 } catch (error) {
 console.error('Unified watch API error:', error);
 console.error('Error details:', {
 identifier: identifier || 'unknown',
 userId: userId || 'unknown',
 error: error instanceof Error ? error.message : 'Unknown error',
 stack: error instanceof Error ? error.stack : undefined
 });
 return NextResponse.json(
 { 
 success: false,
 error: 'Internal server error',
 details: process.env.NODE_ENV === 'development' ? 
 (error instanceof Error ? error.message : 'Unknown error') : undefined
 },
 { status: 500 }
 );
 }
}

function handleVideoIdResponse(resolution: IdentifierResult, userId?: string): NextResponse {
 const videoData = resolution.data as VideoData;
 const { access } = resolution;

 const transformedVideo = {
 id: videoData.id,
 title: videoData.title || 'Untitled',
 description: videoData.description || '',
 videoUrl: access.hasAccess ? videoData.videoUrl : null, // Only provide video URL if user has access
 thumbnailUrl: videoData.thumbnailUrl || '/api/placeholder/400/225',
 duration: videoData.duration || 0,
 creditCost: videoData.creditCost,
 category: videoData.category || 'general',
 tags: videoData.tags || [],
 aspectRatio: videoData.aspectRatio || '16:9',
 viewCount: videoData.viewCount || 0,
 createdAt: videoData.createdAt ? videoData.createdAt.toISOString() : new Date().toISOString(),
 creator: {
 id: videoData.creator.id || '',
 username: videoData.creator.username || 'creator',
 displayName: videoData.creator.displayName || videoData.creator.username || 'Creator',
 avatar: videoData.creator.avatar || null,
 },
 };

 return NextResponse.json({
 success: true,
 video: transformedVideo,
 hasAccess: access.hasAccess,
 accessType: access.accessType,
 requiresPurchase: access.requiresPurchase
 });
}

function handleShareTokenResponse(resolution: IdentifierResult): NextResponse {
 const shareData = resolution.data as ShareTokenData;
 const { access } = resolution;

 const transformedVideo = {
 id: shareData.video.id,
 title: shareData.video.title,
 description: shareData.video.description,
 thumbnailUrl: shareData.video.thumbnailUrl,
 duration: shareData.video.duration,
 creditCost: shareData.video.creditCost,
 category: shareData.video.category,
 tags: shareData.video.tags,
 aspectRatio: shareData.video.aspectRatio || '16:9',
 viewCount: shareData.video.viewCount,
 creator: {
 id: shareData.video.creator.id,
 username: shareData.video.creator.username,
 displayName: shareData.video.creator.displayName,
 avatar: shareData.video.creator.avatar
 },
 shareToken: shareData.shareToken
 };

 return NextResponse.json({
 success: true,
 video: transformedVideo,
 hasAccess: access.hasAccess,
 accessType: access.accessType,
 requiresPurchase: access.requiresPurchase,
 shareToken: access.shareToken
 });
}

function getErrorStatusCode(error?: string): number {
 if (!error) return 500;
 
 const errorLower = error.toLowerCase();
 
 if (errorLower.includes('not found') || errorLower.includes('expired')) {
 return 404;
 }
 
 if (errorLower.includes('invalid') || errorLower.includes('malformed') || errorLower.includes('empty')) {
 return 400;
 }
 
 if (errorLower.includes('unauthorized') || errorLower.includes('access denied')) {
 return 401;
 }
 
 if (errorLower.includes('forbidden') || errorLower.includes('insufficient')) {
 return 403;
 }
 
 return 500;
}