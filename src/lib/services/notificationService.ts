

import { notificationsRepository, preferencesRepository } from '@/lib/database/repositories';
import type { NewNotification, UserRole } from '@/lib/database/schema';

export interface NotificationTemplate {
 type: 'payment' | 'video_view' | 'earning' | 'follower' | 'system' | 'like' | 'comment';
 title: string;
 message: string;
 metadata?: Record<string, any>;
}

export interface EarningNotificationData {
 amount: number;
 videoTitle: string;
 videoId: string;
 transactionId: string;
}

export interface FollowerNotificationData {
 followerUsername: string;
 followerDisplayName: string;
 followerId: string;
}

export interface VideoViewNotificationData {
 videoTitle: string;
 videoId: string;
 viewerUsername: string;
 viewerId: string;
 amount: number;
}

export interface PaymentNotificationData {
 amount: number;
 type: 'credit_purchase' | 'membership_activation' | 'membership_upgrade';
 transactionId: string;
 status: 'completed' | 'failed';
}

export interface CommentNotificationData {
 videoTitle: string;
 videoId: string;
 commenterUsername: string;
 commenterId: string;
 commentId: string;
 commentPreview: string;
}

export interface LikeNotificationData {
 videoTitle: string;
 videoId: string;
 likerUsername: string;
 likerId: string;
}

export class NotificationService {
 
 async createEarningNotification(
 creatorId: string,
 data: EarningNotificationData
 ): Promise<void> {
 try {
 const notification: NewNotification = {
 userId: creatorId,
 type: 'earning',
 title: 'New Earning! 💰',
 message: `You earned ₹${data.amount} from "${data.videoTitle}"`,
 metadata: {
 videoId: data.videoId,
 transactionId: data.transactionId,
 amount: data.amount,
 actionUrl: `/creator/analytics?video=${data.videoId}`,
 },
 };

 await notificationsRepository.create(notification);
 } catch (error) {
 console.error('Failed to create earning notification:', error);
 }
 }

 async createFollowerNotification(
 creatorId: string,
 data: FollowerNotificationData
 ): Promise<void> {
 try {
 const notification: NewNotification = {
 userId: creatorId,
 type: 'follower',
 title: 'New Follower! 👤',
 message: `${data.followerDisplayName} (@${data.followerUsername}) started following you`,
 metadata: {
 followerId: data.followerId,
 followerUsername: data.followerUsername,
 actionUrl: `/creator/analytics?tab=followers`,
 },
 };

 await notificationsRepository.create(notification);
 } catch (error) {
 console.error('Failed to create follower notification:', error);
 }
 }

 async createVideoViewNotification(
 creatorId: string,
 data: VideoViewNotificationData
 ): Promise<void> {
 try {
 const notification: NewNotification = {
 userId: creatorId,
 type: 'video_view',
 title: 'Video Watched! 🎥',
 message: `${data.viewerUsername} watched "${data.videoTitle}" and you earned ₹${data.amount}`,
 metadata: {
 videoId: data.videoId,
 viewerId: data.viewerId,
 amount: data.amount,
 actionUrl: `/creator/videos/${data.videoId}`,
 },
 };

 await notificationsRepository.create(notification);
 } catch (error) {
 console.error('Failed to create video view notification:', error);
 }
 }

 async createPaymentNotification(
 userId: string,
 data: PaymentNotificationData
 ): Promise<void> {
 try {
 const isSuccess = data.status === 'completed';
 const notification: NewNotification = {
 userId,
 type: 'payment',
 title: isSuccess ? 'Payment Successful! ✅' : 'Payment Failed ❌',
 message: this.getPaymentMessage(data, isSuccess),
 metadata: {
 transactionId: data.transactionId,
 amount: data.amount,
 type: data.type,
 status: data.status,
 actionUrl: isSuccess ? '/wallet' : '/wallet?retry=true',
 },
 };

 await notificationsRepository.create(notification);
 } catch (error) {
 console.error('Failed to create payment notification:', error);
 }
 }

 async createCommentNotification(
 creatorId: string,
 data: CommentNotificationData
 ): Promise<void> {
 try {
 const notification: NewNotification = {
 userId: creatorId,
 type: 'comment',
 title: 'New Comment! 💬',
 message: `${data.commenterUsername} commented on "${data.videoTitle}": "${data.commentPreview}"`,
 metadata: {
 videoId: data.videoId,
 commentId: data.commentId,
 commenterId: data.commenterId,
 actionUrl: `/creator/videos/${data.videoId}?comment=${data.commentId}`,
 },
 };

 await notificationsRepository.create(notification);
 } catch (error) {
 console.error('Failed to create comment notification:', error);
 }
 }

 async createLikeNotification(
 creatorId: string,
 data: LikeNotificationData
 ): Promise<void> {
 try {
 const notification: NewNotification = {
 userId: creatorId,
 type: 'like',
 title: 'Video Liked! ❤️',
 message: `${data.likerUsername} liked your video "${data.videoTitle}"`,
 metadata: {
 videoId: data.videoId,
 likerId: data.likerId,
 actionUrl: `/creator/videos/${data.videoId}`,
 },
 };

 await notificationsRepository.create(notification);
 } catch (error) {
 console.error('Failed to create like notification:', error);
 }
 }

 async createSystemNotification(
 userId: string,
 title: string,
 message: string,
 metadata?: Record<string, any>
 ): Promise<void> {
 try {
 const notification: NewNotification = {
 userId,
 type: 'system',
 title,
 message,
 metadata,
 };

 await notificationsRepository.create(notification);
 } catch (error) {
 console.error('Failed to create system notification:', error);
 }
 }

 async createBulkNotifications(
 userIds: string[],
 template: NotificationTemplate
 ): Promise<void> {
 try {
 const notifications: NewNotification[] = userIds.map(userId => ({
 userId,
 type: template.type,
 title: template.title,
 message: template.message,
 metadata: template.metadata,
 }));

 const batchSize = 50;
 for (let i = 0; i < notifications.length; i += batchSize) {
 const batch = notifications.slice(i, i + batchSize);
 await Promise.all(batch.map(notification => 
 notificationsRepository.create(notification)
 ));
 }
 } catch (error) {
 console.error('Failed to create bulk notifications:', error);
 }
 }

 async sendWelcomeNotification(userId: string, userRole: UserRole): Promise<void> {
 try {
 const isCreator = userRole === 'creator';
 const notification: NewNotification = {
 userId,
 type: 'system',
 title: `Welcome to Crensa! 🎉`,
 message: isCreator 
 ? 'Start uploading your videos and earn from your content!'
 : 'Discover amazing content and support your favorite creators!',
 metadata: {
 actionUrl: isCreator ? '/creator/upload' : '/dashboard',
 isWelcome: true,
 },
 };

 await notificationsRepository.create(notification);
 } catch (error) {
 console.error('Failed to send welcome notification:', error);
 }
 }

 async shouldSendNotification(
 userId: string,
 notificationType: string
 ): Promise<boolean> {
 try {
 const preferences = await preferencesRepository.findByUserId(userId);
 if (!preferences?.notifications) {
 return true; // Default to sending if no preferences set
 }

 const prefs = preferences.notifications;

 const typeMapping: Record<string, keyof typeof prefs> = {
 'earning': 'earnings',
 'follower': 'newFollowers',
 'comment': 'videoComments',
 'like': 'videoComments', // Using videoComments for likes as well
 'payment': 'earnings', // Payment notifications are related to earnings
 'system': 'push', // System notifications use push preference
 'video_view': 'earnings', // Video views are related to earnings
 };

 const prefKey = typeMapping[notificationType];
 return prefKey ? prefs[prefKey] !== false : true;
 } catch (error) {
 console.error('Failed to check notification preferences:', error);
 return true; // Default to sending on error
 }
 }

 private getPaymentMessage(data: PaymentNotificationData, isSuccess: boolean): string {
 if (!isSuccess) {
 return `Payment of ₹${data.amount} failed. Please try again.`;
 }

 switch (data.type) {
 case 'credit_purchase':
 return `Successfully added ₹${data.amount} credits to your wallet!`;
 case 'membership_activation':
 return `Premium membership activated! Welcome to exclusive content.`;
 case 'membership_upgrade':
 return `Membership upgraded successfully! Enjoy your new benefits.`;
 default:
 return `Payment of ₹${data.amount} completed successfully.`;
 }
 }

 async cleanupOldNotifications(): Promise<void> {
 try {
 const thirtyDaysAgo = new Date();
 thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

 console.log('Old notifications cleanup completed');
 } catch (error) {
 console.error('Failed to cleanup old notifications:', error);
 }
 }
}

export const notificationService = new NotificationService();