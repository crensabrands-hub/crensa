import { db } from '@/lib/database/connection';
import { contentFilters, videos, reports } from '@/lib/database/schema';
import { eq, and } from 'drizzle-orm';

export interface ContentModerationResult {
 isAllowed: boolean;
 severity: 'low' | 'medium' | 'high' | 'critical';
 matchedFilters: string[];
 action: 'flag' | 'auto_reject' | 'shadow_ban' | 'require_review';
 reason?: string;
}

export class ContentModerationService {

 private static readonly INAPPROPRIATE_KEYWORDS = [
 'spam', 'scam', 'fake', 'hate', 'violence', 'harassment',
 'inappropriate', 'offensive', 'abuse', 'illegal'
 ];

 static async moderateContent(
 content: string,
 type: 'title' | 'description' | 'comment' = 'description'
 ): Promise<ContentModerationResult> {
 try {

 const activeFilters = await db
 .select()
 .from(contentFilters)
 .where(eq(contentFilters.isActive, true));

 const matchedFilters: string[] = [];
 let highestSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';
 let recommendedAction: 'flag' | 'auto_reject' | 'shadow_ban' | 'require_review' = 'flag';

 for (const filter of activeFilters) {
 let isMatch = false;

 switch (filter.type) {
 case 'keyword':
 isMatch = content.toLowerCase().includes(filter.pattern.toLowerCase());
 break;
 case 'pattern':
 isMatch = content.toLowerCase().includes(filter.pattern.toLowerCase());
 break;
 case 'regex':
 try {
 const regex = new RegExp(filter.pattern, 'i');
 isMatch = regex.test(content);
 } catch (e) {
 console.error('Invalid regex pattern:', filter.pattern);
 }
 break;
 case 'ai_model':

 isMatch = this.basicAIModeration(content);
 break;
 }

 if (isMatch) {
 matchedFilters.push(filter.pattern);

 if (this.getSeverityLevel(filter.severity) > this.getSeverityLevel(highestSeverity)) {
 highestSeverity = filter.severity;
 recommendedAction = filter.action;
 }
 }
 }

 const hasInappropriateContent = this.INAPPROPRIATE_KEYWORDS.some(keyword =>
 content.toLowerCase().includes(keyword)
 );

 if (hasInappropriateContent) {
 matchedFilters.push('built-in-filter');
 if (highestSeverity === 'low') {
 highestSeverity = 'medium';
 recommendedAction = 'require_review';
 }
 }

 const isAllowed = matchedFilters.length === 0 || 
 (highestSeverity === 'low' && recommendedAction === 'flag');

 return {
 isAllowed,
 severity: highestSeverity,
 matchedFilters,
 action: recommendedAction,
 reason: matchedFilters.length > 0 
 ? `Content flagged by filters: ${matchedFilters.join(', ')}`
 : undefined
 };
 } catch (error) {
 console.error('Error in content moderation:', error);

 return {
 isAllowed: false,
 severity: 'medium',
 matchedFilters: ['moderation-error'],
 action: 'require_review',
 reason: 'Content moderation system error'
 };
 }
 }

 static async moderateVideo(videoId: string): Promise<ContentModerationResult> {
 try {
 const video = await db
 .select()
 .from(videos)
 .where(eq(videos.id, videoId))
 .limit(1);

 if (!video.length) {
 throw new Error('Video not found');
 }

 const videoData = video[0];
 const combinedContent = `${videoData.title} ${videoData.description || ''}`;

 const result = await this.moderateContent(combinedContent, 'description');

 if (!result.isAllowed) {
 let moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged' = 'flagged';
 
 if (result.action === 'auto_reject') {
 moderationStatus = 'rejected';
 } else if (result.action === 'require_review') {
 moderationStatus = 'pending';
 }

 await db
 .update(videos)
 .set({
 moderationStatus,
 moderationReason: result.reason,
 moderatedAt: new Date(),
 })
 .where(eq(videos.id, videoId));
 }

 return result;
 } catch (error) {
 console.error('Error moderating video:', error);
 throw error;
 }
 }

 static async createAutoReport(
 videoId: string,
 moderationResult: ContentModerationResult,
 systemUserId: string
 ): Promise<void> {
 try {
 await db.insert(reports).values({
 reporterId: systemUserId, // System user ID for automated reports
 reportedVideoId: videoId,
 type: 'inappropriate_content',
 reason: 'Automated content filter',
 description: moderationResult.reason || 'Content flagged by automated moderation',
 status: 'pending',
 });
 } catch (error) {
 console.error('Error creating auto report:', error);
 }
 }

 private static getSeverityLevel(severity: string): number {
 const levels = { low: 1, medium: 2, high: 3, critical: 4 };
 return levels[severity as keyof typeof levels] || 1;
 }

 private static basicAIModeration(content: string): boolean {

 const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
 const specialCharRatio = (content.match(/[!@#$%^&*()]/g) || []).length / content.length;
 
 return capsRatio > 0.5 || specialCharRatio > 0.3;
 }

 static async batchModerateVideos(videoIds: string[]): Promise<Map<string, ContentModerationResult>> {
 const results = new Map<string, ContentModerationResult>();
 
 for (const videoId of videoIds) {
 try {
 const result = await this.moderateVideo(videoId);
 results.set(videoId, result);
 } catch (error) {
 console.error(`Error moderating video ${videoId}:`, error);
 results.set(videoId, {
 isAllowed: false,
 severity: 'medium',
 matchedFilters: ['moderation-error'],
 action: 'require_review',
 reason: 'Moderation failed'
 });
 }
 }
 
 return results;
 }

 static async getModerationStats(): Promise<{
 totalFiltered: number;
 autoRejected: number;
 flagged: number;
 pendingReview: number;
 }> {
 try {
 const [totalFiltered, autoRejected, flagged, pendingReview] = await Promise.all([
 db.select({ count: videos.id }).from(videos).where(eq(videos.moderationStatus, 'rejected')),
 db.select({ count: videos.id }).from(videos).where(eq(videos.moderationStatus, 'rejected')),
 db.select({ count: videos.id }).from(videos).where(eq(videos.moderationStatus, 'flagged')),
 db.select({ count: videos.id }).from(videos).where(eq(videos.moderationStatus, 'pending')),
 ]);

 return {
 totalFiltered: totalFiltered.length,
 autoRejected: autoRejected.length,
 flagged: flagged.length,
 pendingReview: pendingReview.length,
 };
 } catch (error) {
 console.error('Error getting moderation stats:', error);
 return {
 totalFiltered: 0,
 autoRejected: 0,
 flagged: 0,
 pendingReview: 0,
 };
 }
 }
}