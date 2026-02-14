

import { db } from '@/lib/database/connection';
import { videos, users, videoShares, creatorProfiles, transactions } from '@/lib/database/schema';
import { eq, and } from 'drizzle-orm';

export interface VideoData {
 id: string;
 title: string;
 description?: string;
 videoUrl: string;
 thumbnailUrl: string;
 duration: number;
 creditCost: number;
 category: string;
 tags: string[];
 aspectRatio: string;
 viewCount: number;
 totalEarnings: number;
 isActive: boolean;
 createdAt: Date;
 updatedAt: Date;
 creator: {
 id: string;
 username: string;
 displayName: string;
 avatar?: string;
 };
}

export interface ShareTokenData {
 id: string;
 videoId: string;
 creatorId: string;
 shareToken: string;
 platform?: string;
 clickCount: number;
 viewCount: number;
 conversionCount: number;
 lastAccessedAt?: Date;
 isActive: boolean;
 createdAt: Date;
 updatedAt: Date;
 video: VideoData;
}

export interface AccessInfo {
 hasAccess: boolean;
 accessType: 'owned' | 'token_preview' | 'requires_purchase' | 'creator_self_access';
 shareToken?: string;
 requiresPurchase: boolean;
}

export interface IdentifierResult {
 success: boolean;
 type: 'video_id' | 'share_token';
 data: VideoData | ShareTokenData;
 access: AccessInfo;
 error?: string;
}

export interface VideoAccessContext {
 userId?: string;
 identifier: string;
 identifierType: 'video_id' | 'share_token';
 accessMethod: 'direct' | 'shared_link';
 requiresPurchase: boolean;
}

export class IdentifierResolutionService {
 
 async resolveIdentifier(identifier: string, userId?: string): Promise<IdentifierResult> {
 try {
 console.log('Resolving identifier:', identifier, 'for user:', userId);

 if (!identifier || typeof identifier !== 'string') {
 console.log('Invalid identifier provided:', identifier);
 return {
 success: false,
 type: 'video_id',
 data: {} as VideoData,
 access: { hasAccess: false, accessType: 'requires_purchase', requiresPurchase: true },
 error: 'Invalid identifier provided'
 };
 }

 const trimmedIdentifier = identifier.trim();
 
 if (trimmedIdentifier.length === 0) {
 console.log('Empty identifier provided');
 return {
 success: false,
 type: 'video_id',
 data: {} as VideoData,
 access: { hasAccess: false, accessType: 'requires_purchase', requiresPurchase: true },
 error: 'Empty identifier provided'
 };
 }

 const isToken = await this.isShareToken(trimmedIdentifier);
 console.log('Is share token:', isToken);
 
 if (isToken) {
 return await this.resolveShareToken(trimmedIdentifier, userId);
 } else {
 return await this.resolveVideoId(trimmedIdentifier, userId);
 }
 } catch (error) {
 console.error('Identifier resolution error:', error);
 console.error('Error details:', {
 identifier,
 userId,
 error: error instanceof Error ? error.message : 'Unknown error',
 stack: error instanceof Error ? error.stack : undefined
 });
 return {
 success: false,
 type: 'video_id',
 data: {} as VideoData,
 access: { hasAccess: false, accessType: 'requires_purchase', requiresPurchase: true },
 error: 'Failed to resolve identifier'
 };
 }
 }

 async isShareToken(identifier: string): Promise<boolean> {
 try {

 if (this.isUuidFormat(identifier)) {

 const videoExists = await this.videoExistsById(identifier);
 if (videoExists) {
 return false; // It's a video ID
 }

 return await this.shareTokenExists(identifier);
 }

 return await this.shareTokenExists(identifier);
 } catch (error) {
 console.error('Error determining identifier type:', error);
 return false;
 }
 }

 async isVideoId(identifier: string): Promise<boolean> {
 try {
 return await this.videoExistsById(identifier);
 } catch (error) {
 console.error('Error checking video ID:', error);
 return false;
 }
 }

 private async resolveVideoId(videoId: string, userId?: string): Promise<IdentifierResult> {
 try {
 console.log('Resolving video ID:', videoId);

 const videoData = await db
 .select({
 video: videos,
 creator: users,
 creatorProfile: creatorProfiles
 })
 .from(videos)
 .innerJoin(users, eq(videos.creatorId, users.id))
 .leftJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
 .where(and(
 eq(videos.id, videoId),
 eq(videos.isActive, true)
 ))
 .limit(1);

 console.log('Video query result:', videoData.length, 'records found');

 if (videoData.length === 0) {
 console.log('Video not found for ID:', videoId);
 return {
 success: false,
 type: 'video_id',
 data: {} as VideoData,
 access: { hasAccess: false, accessType: 'requires_purchase', requiresPurchase: true },
 error: 'Video not found'
 };
 }

 const record = videoData[0];

 const transformedVideo: VideoData = {
 id: record.video.id,
 title: record.video.title,
 description: record.video.description || undefined,
 videoUrl: record.video.videoUrl,
 thumbnailUrl: record.video.thumbnailUrl,
 duration: record.video.duration,
 creditCost: parseFloat(record.video.creditCost),
 category: record.video.category,
 tags: Array.isArray(record.video.tags) ? record.video.tags : [],
 aspectRatio: record.video.aspectRatio || '16:9',
 viewCount: record.video.viewCount,
 totalEarnings: parseFloat(record.video.totalEarnings),
 isActive: record.video.isActive,
 createdAt: record.video.createdAt,
 updatedAt: record.video.updatedAt,
 creator: {
 id: record.creator.id,
 username: record.creator.username,
 displayName: record.creatorProfile?.displayName || record.creator.username,
 avatar: record.creator.avatar || undefined
 }
 };

 const access = await this.determineVideoAccess(videoId, userId, record.creator.id);

 return {
 success: true,
 type: 'video_id',
 data: transformedVideo,
 access
 };
 } catch (error) {
 console.error('Error resolving video ID:', error);
 return {
 success: false,
 type: 'video_id',
 data: {} as VideoData,
 access: { hasAccess: false, accessType: 'requires_purchase', requiresPurchase: true },
 error: 'Failed to resolve video ID'
 };
 }
 }

 private async resolveShareToken(token: string, userId?: string): Promise<IdentifierResult> {
 try {

 const shareData = await db
 .select({
 share: videoShares,
 video: videos,
 creator: users,
 creatorProfile: creatorProfiles
 })
 .from(videoShares)
 .innerJoin(videos, eq(videoShares.videoId, videos.id))
 .innerJoin(users, eq(videoShares.creatorId, users.id))
 .leftJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
 .where(and(
 eq(videoShares.shareToken, token),
 eq(videoShares.isActive, true),
 eq(videos.isActive, true)
 ))
 .limit(1);

 if (shareData.length === 0) {
 return {
 success: false,
 type: 'share_token',
 data: {} as ShareTokenData,
 access: { hasAccess: false, accessType: 'requires_purchase', requiresPurchase: true },
 error: 'Share token not found or expired'
 };
 }

 const record = shareData[0];

 this.updateShareTokenStats(record.share.id).catch(error => {
 console.error('Failed to update share token stats:', error);
 });

 const transformedVideo: VideoData = {
 id: record.video.id,
 title: record.video.title,
 description: record.video.description || undefined,
 videoUrl: record.video.videoUrl,
 thumbnailUrl: record.video.thumbnailUrl,
 duration: record.video.duration,
 creditCost: parseFloat(record.video.creditCost),
 category: record.video.category,
 tags: Array.isArray(record.video.tags) ? record.video.tags : [],
 aspectRatio: record.video.aspectRatio || '16:9',
 viewCount: record.video.viewCount,
 totalEarnings: parseFloat(record.video.totalEarnings),
 isActive: record.video.isActive,
 createdAt: record.video.createdAt,
 updatedAt: record.video.updatedAt,
 creator: {
 id: record.creator.id,
 username: record.creator.username,
 displayName: record.creatorProfile?.displayName || record.creator.username,
 avatar: record.creator.avatar || undefined
 }
 };

 const transformedShare: ShareTokenData = {
 id: record.share.id,
 videoId: record.share.videoId,
 creatorId: record.share.creatorId,
 shareToken: record.share.shareToken,
 platform: record.share.platform || undefined,
 clickCount: record.share.clickCount,
 viewCount: record.share.viewCount,
 conversionCount: record.share.conversionCount,
 lastAccessedAt: record.share.lastAccessedAt || undefined,
 isActive: record.share.isActive,
 createdAt: record.share.createdAt,
 updatedAt: record.share.updatedAt,
 video: transformedVideo
 };

 const access = await this.determineTokenAccess(record.video.id, userId, record.creator.id, token);

 return {
 success: true,
 type: 'share_token',
 data: transformedShare,
 access
 };
 } catch (error) {
 console.error('Error resolving share token:', error);
 return {
 success: false,
 type: 'share_token',
 data: {} as ShareTokenData,
 access: { hasAccess: false, accessType: 'requires_purchase', requiresPurchase: true },
 error: 'Failed to resolve share token'
 };
 }
 }

 private async determineVideoAccess(videoId: string, userId?: string, creatorId?: string): Promise<AccessInfo> {
 try {
 // Get video details to check if it's free
 const videoDetails = await db
 .select({ 
 creditCost: videos.creditCost,
 coinPrice: videos.coinPrice
 })
 .from(videos)
 .where(eq(videos.id, videoId))
 .limit(1);

 const video = videoDetails[0];
 const coinPrice = video?.coinPrice ?? parseFloat(video?.creditCost || '0');

 // If no user, check if video is free
 if (!userId) {
 // Free videos (coin_price === 0) can be accessed by guests
 if (coinPrice === 0) {
 return {
 hasAccess: true,
 accessType: 'requires_purchase', // Keep this for compatibility
 requiresPurchase: false // But don't require purchase for free videos
 };
 }
 
 // Paid videos require authentication
 return {
 hasAccess: false,
 accessType: 'requires_purchase',
 requiresPurchase: true
 };
 }

 if (creatorId && userId === creatorId) {
 return {
 hasAccess: true,
 accessType: 'creator_self_access',
 requiresPurchase: false
 };
 }

 const videoWithSeries = await db
 .select({ 
 seriesId: videos.seriesId 
 })
 .from(videos)
 .where(eq(videos.id, videoId))
 .limit(1);

 const seriesId = videoWithSeries[0]?.seriesId;

 if (seriesId) {

 const { seriesPurchasesRepository } = await import('@/lib/database/repositories/seriesPurchases');
 const hasSeriesAccess = await seriesPurchasesRepository.hasAccess(userId, seriesId);
 
 if (hasSeriesAccess) {
 return {
 hasAccess: true,
 accessType: 'owned',
 requiresPurchase: false
 };
 }
 } else {

 const purchaseRecord = await db
 .select({ id: transactions.id })
 .from(transactions)
 .where(and(
 eq(transactions.userId, userId),
 eq(transactions.videoId, videoId),
 eq(transactions.type, 'video_view'),
 eq(transactions.status, 'completed')
 ))
 .limit(1);

 if (purchaseRecord.length > 0) {
 return {
 hasAccess: true,
 accessType: 'owned',
 requiresPurchase: false
 };
 }
 }

 // For authenticated users, check if video is free
 if (coinPrice === 0) {
 return {
 hasAccess: true,
 accessType: 'requires_purchase',
 requiresPurchase: false
 };
 }

 return {
 hasAccess: false,
 accessType: 'requires_purchase',
 requiresPurchase: true
 };
 } catch (error) {
 console.error('Error determining video access:', error);
 return {
 hasAccess: false,
 accessType: 'requires_purchase',
 requiresPurchase: true
 };
 }
 }

 private async determineTokenAccess(videoId: string, userId?: string, creatorId?: string, shareToken?: string): Promise<AccessInfo> {
 try {
 // Get video details to check if it's free
 const videoDetails = await db
 .select({ 
 creditCost: videos.creditCost,
 coinPrice: videos.coinPrice
 })
 .from(videos)
 .where(eq(videos.id, videoId))
 .limit(1);

 const video = videoDetails[0];
 const coinPrice = video?.coinPrice ?? parseFloat(video?.creditCost || '0');

 if (userId && creatorId && userId === creatorId) {
 return {
 hasAccess: true,
 accessType: 'creator_self_access',
 shareToken,
 requiresPurchase: false
 };
 }

 if (userId) {

 const videoWithSeries = await db
 .select({ 
 seriesId: videos.seriesId 
 })
 .from(videos)
 .where(eq(videos.id, videoId))
 .limit(1);

 const seriesId = videoWithSeries[0]?.seriesId;

 if (seriesId) {

 const { seriesPurchasesRepository } = await import('@/lib/database/repositories/seriesPurchases');
 const hasSeriesAccess = await seriesPurchasesRepository.hasAccess(userId, seriesId);
 
 if (hasSeriesAccess) {
 return {
 hasAccess: true,
 accessType: 'owned',
 shareToken,
 requiresPurchase: false
 };
 }
 } else {

 const purchaseRecord = await db
 .select({ id: transactions.id })
 .from(transactions)
 .where(and(
 eq(transactions.userId, userId),
 eq(transactions.videoId, videoId),
 eq(transactions.type, 'video_view'),
 eq(transactions.status, 'completed')
 ))
 .limit(1);

 if (purchaseRecord.length > 0) {
 return {
 hasAccess: true,
 accessType: 'owned',
 shareToken,
 requiresPurchase: false
 };
 }
 }
 }

 // Check if video is free - both guests and authenticated users can access
 if (coinPrice === 0) {
 return {
 hasAccess: true,
 accessType: 'token_preview',
 shareToken,
 requiresPurchase: false
 };
 }

 return {
 hasAccess: false,
 accessType: 'token_preview',
 shareToken,
 requiresPurchase: true
 };
 } catch (error) {
 console.error('Error determining token access:', error);
 return {
 hasAccess: false,
 accessType: 'requires_purchase',
 shareToken,
 requiresPurchase: true
 };
 }
 }

 private isUuidFormat(identifier: string): boolean {
 const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
 return uuidRegex.test(identifier);
 }

 private async videoExistsById(videoId: string): Promise<boolean> {
 try {
 const result = await db
 .select({ id: videos.id })
 .from(videos)
 .where(and(eq(videos.id, videoId), eq(videos.isActive, true)))
 .limit(1);
 
 return result.length > 0;
 } catch (error) {
 console.error('Error checking video existence:', error);
 return false;
 }
 }

 private async shareTokenExists(token: string): Promise<boolean> {
 try {
 const result = await db
 .select({ id: videoShares.id })
 .from(videoShares)
 .where(and(eq(videoShares.shareToken, token), eq(videoShares.isActive, true)))
 .limit(1);
 
 return result.length > 0;
 } catch (error) {
 console.error('Error checking share token existence:', error);
 return false;
 }
 }

 private async updateShareTokenStats(shareId: string): Promise<void> {
 try {

 const currentRecord = await db
 .select({ clickCount: videoShares.clickCount })
 .from(videoShares)
 .where(eq(videoShares.id, shareId))
 .limit(1);

 const currentCount = currentRecord[0]?.clickCount || 0;

 await db
 .update(videoShares)
 .set({
 clickCount: currentCount + 1,
 lastAccessedAt: new Date(),
 updatedAt: new Date()
 })
 .where(eq(videoShares.id, shareId));
 } catch (error) {
 console.error('Error updating share token stats:', error);

 }
 }
}

export const identifierResolutionService = new IdentifierResolutionService();

export const resolveIdentifier = (identifier: string, userId?: string) => 
 identifierResolutionService.resolveIdentifier(identifier, userId);

export const isShareToken = (identifier: string) => 
 identifierResolutionService.isShareToken(identifier);

export const isVideoId = (identifier: string) => 
 identifierResolutionService.isVideoId(identifier);