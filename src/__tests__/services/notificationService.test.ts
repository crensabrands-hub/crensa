import { notificationService } from '@/lib/services/notificationService';
import { notificationsRepository, userRepository } from '@/lib/database/repositories';

jest.mock('@/lib/database/repositories', () => ({
 notificationsRepository: {
 create: jest.fn(),
 },
 userRepository: {
 findById: jest.fn(),
 },
}));

const mockNotificationsRepository = notificationsRepository as jest.Mocked<typeof notificationsRepository>;
const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;

describe('NotificationService', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 describe('createEarningNotification', () => {
 it('should create earning notification', async () => {
 const creatorId = 'creator-1';
 const data = {
 amount: 50,
 videoTitle: 'Test Video',
 videoId: 'video-1',
 transactionId: 'txn-1',
 };

 mockNotificationsRepository.create.mockResolvedValue({
 id: 'notif-1',
 userId: creatorId,
 type: 'earning',
 title: 'New Earning! 💰',
 message: `You earned ₹${data.amount} from "${data.videoTitle}"`,
 isRead: false,
 metadata: {
 videoId: data.videoId,
 transactionId: data.transactionId,
 amount: data.amount,
 actionUrl: `/creator/analytics?video=${data.videoId}`,
 },
 createdAt: '2024-01-01T00:00:00Z',
 updatedAt: '2024-01-01T00:00:00Z',
 });

 await notificationService.createEarningNotification(creatorId, data);

 expect(mockNotificationsRepository.create).toHaveBeenCalledWith({
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
 });
 });

 it('should handle errors gracefully', async () => {
 const creatorId = 'creator-1';
 const data = {
 amount: 50,
 videoTitle: 'Test Video',
 videoId: 'video-1',
 transactionId: 'txn-1',
 };

 mockNotificationsRepository.create.mockRejectedValue(new Error('Database error'));

 await expect(
 notificationService.createEarningNotification(creatorId, data)
 ).resolves.toBeUndefined();
 });
 });

 describe('createFollowerNotification', () => {
 it('should create follower notification', async () => {
 const creatorId = 'creator-1';
 const data = {
 followerUsername: 'follower1',
 followerDisplayName: 'Follower One',
 followerId: 'user-2',
 };

 await notificationService.createFollowerNotification(creatorId, data);

 expect(mockNotificationsRepository.create).toHaveBeenCalledWith({
 userId: creatorId,
 type: 'follower',
 title: 'New Follower! 👤',
 message: `${data.followerDisplayName} (@${data.followerUsername}) started following you`,
 metadata: {
 followerId: data.followerId,
 followerUsername: data.followerUsername,
 actionUrl: `/creator/analytics?tab=followers`,
 },
 });
 });
 });

 describe('createPaymentNotification', () => {
 it('should create successful payment notification', async () => {
 const userId = 'user-1';
 const data = {
 amount: 100,
 type: 'credit_purchase' as const,
 transactionId: 'txn-1',
 status: 'completed' as const,
 };

 await notificationService.createPaymentNotification(userId, data);

 expect(mockNotificationsRepository.create).toHaveBeenCalledWith({
 userId,
 type: 'payment',
 title: 'Payment Successful! ✅',
 message: `Successfully added ₹${data.amount} credits to your wallet!`,
 metadata: {
 transactionId: data.transactionId,
 amount: data.amount,
 type: data.type,
 status: data.status,
 actionUrl: '/wallet',
 },
 });
 });

 it('should create failed payment notification', async () => {
 const userId = 'user-1';
 const data = {
 amount: 100,
 type: 'credit_purchase' as const,
 transactionId: 'txn-1',
 status: 'failed' as const,
 };

 await notificationService.createPaymentNotification(userId, data);

 expect(mockNotificationsRepository.create).toHaveBeenCalledWith({
 userId,
 type: 'payment',
 title: 'Payment Failed ❌',
 message: `Payment of ₹${data.amount} failed. Please try again.`,
 metadata: {
 transactionId: data.transactionId,
 amount: data.amount,
 type: data.type,
 status: data.status,
 actionUrl: '/wallet?retry=true',
 },
 });
 });
 });

 describe('createCommentNotification', () => {
 it('should create comment notification', async () => {
 const creatorId = 'creator-1';
 const data = {
 videoTitle: 'Test Video',
 videoId: 'video-1',
 commenterUsername: 'commenter1',
 commenterId: 'user-2',
 commentId: 'comment-1',
 commentPreview: 'Great video!',
 };

 await notificationService.createCommentNotification(creatorId, data);

 expect(mockNotificationsRepository.create).toHaveBeenCalledWith({
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
 });
 });
 });

 describe('createBulkNotifications', () => {
 it('should create bulk notifications', async () => {
 const userIds = ['user-1', 'user-2', 'user-3'];
 const template = {
 type: 'system',
 title: 'System Update',
 message: 'New features available!',
 metadata: { version: '1.2.0' },
 };

 await notificationService.createBulkNotifications(userIds, template);

 expect(mockNotificationsRepository.create).toHaveBeenCalledTimes(3);
 
 userIds.forEach((userId, index) => {
 expect(mockNotificationsRepository.create).toHaveBeenNthCalledWith(index + 1, {
 userId,
 type: template.type,
 title: template.title,
 message: template.message,
 metadata: template.metadata,
 });
 });
 });
 });

 describe('sendWelcomeNotification', () => {
 it('should send welcome notification for creator', async () => {
 const userId = 'user-1';
 const userRole = 'creator';

 await notificationService.sendWelcomeNotification(userId, userRole);

 expect(mockNotificationsRepository.create).toHaveBeenCalledWith({
 userId,
 type: 'system',
 title: 'Welcome to Crensa! 🎉',
 message: 'Start uploading your videos and earn from your content!',
 metadata: {
 actionUrl: '/creator/upload',
 isWelcome: true,
 },
 });
 });

 it('should send welcome notification for member', async () => {
 const userId = 'user-1';
 const userRole = 'member';

 await notificationService.sendWelcomeNotification(userId, userRole);

 expect(mockNotificationsRepository.create).toHaveBeenCalledWith({
 userId,
 type: 'system',
 title: 'Welcome to Crensa! 🎉',
 message: 'Discover amazing content and support your favorite creators!',
 metadata: {
 actionUrl: '/dashboard',
 isWelcome: true,
 },
 });
 });
 });

 describe('shouldSendNotification', () => {
 it('should return true when user has notification enabled', async () => {
 const userId = 'user-1';
 const notificationType = 'earning';

 mockUserRepository.findById.mockResolvedValue({
 id: userId,
 preferences: {
 notifications: {
 earnings: true,
 email: true,
 push: true,
 },
 },
 } as any);

 const result = await notificationService.shouldSendNotification(userId, notificationType);

 expect(result).toBe(true);
 });

 it('should return false when user has notification disabled', async () => {
 const userId = 'user-1';
 const notificationType = 'earning';

 mockUserRepository.findById.mockResolvedValue({
 id: userId,
 preferences: {
 notifications: {
 earnings: false,
 email: true,
 push: true,
 },
 },
 } as any);

 const result = await notificationService.shouldSendNotification(userId, notificationType);

 expect(result).toBe(false);
 });

 it('should return true when no preferences are set', async () => {
 const userId = 'user-1';
 const notificationType = 'earning';

 mockUserRepository.findById.mockResolvedValue({
 id: userId,
 preferences: null,
 } as any);

 const result = await notificationService.shouldSendNotification(userId, notificationType);

 expect(result).toBe(true);
 });

 it('should return true when user is not found', async () => {
 const userId = 'user-1';
 const notificationType = 'earning';

 mockUserRepository.findById.mockResolvedValue(null);

 const result = await notificationService.shouldSendNotification(userId, notificationType);

 expect(result).toBe(true);
 });

 it('should handle database errors gracefully', async () => {
 const userId = 'user-1';
 const notificationType = 'earning';

 mockUserRepository.findById.mockRejectedValue(new Error('Database error'));

 const result = await notificationService.shouldSendNotification(userId, notificationType);

 expect(result).toBe(true);
 });
 });
});