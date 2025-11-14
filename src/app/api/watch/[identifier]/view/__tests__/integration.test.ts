

import { NextRequest } from 'next/server';
import { POST } from '../route';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories/users';
import { identifierResolutionService } from '@/lib/services/identifierResolutionService';
import { walletService } from '@/lib/services/walletService';

jest.mock('@clerk/nextjs/server', () => ({
 auth: jest.fn(),
}));

jest.mock('@/lib/database/repositories/users', () => ({
 userRepository: {
 findByClerkId: jest.fn(),
 },
}));

jest.mock('@/lib/services/identifierResolutionService', () => ({
 identifierResolutionService: {
 resolveIdentifier: jest.fn(),
 },
}));

jest.mock('@/lib/services/walletService', () => ({
 walletService: {
 deductCredits: jest.fn(),
 getBalance: jest.fn(),
 },
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockIdentifierService = identifierResolutionService as jest.Mocked<typeof identifierResolutionService>;
const mockWalletService = walletService as jest.Mocked<typeof walletService>;

describe('Purchase Flow Integration Tests', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 describe('Successful Purchase Flow (Requirement 1.3)', () => {
 it('should complete purchase for valid share token with sufficient credits', async () => {

 mockAuth.mockResolvedValue({ userId: 'clerk-buyer-123' } as any);
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'buyer-123',
 clerkId: 'clerk-buyer-123',
 email: 'buyer@example.com',
 } as any);

 mockIdentifierService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'share_token',
 data: {
 id: 'purchase-share-123',
 videoId: 'purchase-video-123',
 creatorId: 'purchase-creator-123',
 shareToken: 'purchase-token-123',
 platform: 'twitter',
 clickCount: 5,
 viewCount: 2,
 conversionCount: 1,
 lastAccessedAt: new Date('2024-01-01'),
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 video: {
 id: 'purchase-video-123',
 title: 'Purchasable Video',
 description: 'Video available for purchase',
 videoUrl: 'https://example.com/purchasable.mp4',
 thumbnailUrl: 'https://example.com/purchasable-thumb.jpg',
 duration: 180,
 creditCost: 10,
 category: 'premium',
 tags: ['purchasable'],
 viewCount: 50,
 totalEarnings: 100,
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 creator: {
 id: 'purchase-creator-123',
 username: 'purchasecreator',
 displayName: 'Purchase Creator',
 avatar: 'https://example.com/purchase-avatar.jpg',
 },
 },
 },
 access: {
 hasAccess: false,
 accessType: 'token_preview',
 shareToken: 'purchase-token-123',
 requiresPurchase: true,
 },
 });

 mockWalletService.deductCredits.mockResolvedValue({
 success: true,
 newBalance: 90,
 transactionId: 'txn-123',
 });

 const request = new NextRequest('http://localhost:3000/api/watch/purchase-token-123/view', {
 method: 'POST',
 });
 const context = { params: Promise.resolve({ identifier: 'purchase-token-123' }) };

 const response = await POST(request, context);
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(data.message).toBe('Purchase successful');
 expect(data.newBalance).toBe(90);
 expect(data.video).toBeDefined();
 expect(data.video.id).toBe('purchase-video-123');
 expect(data.video.videoUrl).toBe('https://example.com/purchasable.mp4');

 expect(mockWalletService.deductCredits).toHaveBeenCalledWith(
 'buyer-123',
 10,
 'purchase-video-123',
 'Video purchase via share token'
 );
 });

 it('should handle creator purchasing their own shared video', async () => {

 mockAuth.mockResolvedValue({ userId: 'clerk-creator-456' } as any);
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'creator-456',
 clerkId: 'clerk-creator-456',
 email: 'creator@example.com',
 } as any);

 mockIdentifierService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'share_token',
 data: {
 id: 'creator-share-456',
 videoId: 'creator-video-456',
 creatorId: 'creator-456', // Same as authenticated user
 shareToken: 'creator-token-456',
 platform: 'facebook',
 clickCount: 10,
 viewCount: 5,
 conversionCount: 3,
 lastAccessedAt: new Date('2024-01-01'),
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 video: {
 id: 'creator-video-456',
 title: 'Creator Own Video',
 description: 'Creator accessing their own video',
 videoUrl: 'https://example.com/creator-own.mp4',
 thumbnailUrl: 'https://example.com/creator-own-thumb.jpg',
 duration: 200,
 creditCost: 12,
 category: 'creator',
 tags: ['creator', 'own'],
 viewCount: 100,
 totalEarnings: 120,
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 creator: {
 id: 'creator-456',
 username: 'owncreator',
 displayName: 'Own Creator',
 avatar: 'https://example.com/own-avatar.jpg',
 },
 },
 },
 access: {
 hasAccess: true,
 accessType: 'creator_self_access',
 shareToken: 'creator-token-456',
 requiresPurchase: false,
 },
 });

 const request = new NextRequest('http://localhost:3000/api/watch/creator-token-456/view', {
 method: 'POST',
 });
 const context = { params: Promise.resolve({ identifier: 'creator-token-456' }) };

 const response = await POST(request, context);
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(data.message).toBe('Access granted');
 expect(data.video).toBeDefined();
 expect(data.video.videoUrl).toBe('https://example.com/creator-own.mp4');

 expect(mockWalletService.deductCredits).not.toHaveBeenCalled();
 });
 });

 describe('Purchase Flow Error Handling (Requirement 3.3)', () => {
 it('should handle insufficient credits', async () => {

 mockAuth.mockResolvedValue({ userId: 'clerk-poor-user' } as any);
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'poor-user',
 clerkId: 'clerk-poor-user',
 email: 'poor@example.com',
 } as any);

 mockIdentifierService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'share_token',
 data: {
 id: 'expensive-share',
 videoId: 'expensive-video',
 creatorId: 'expensive-creator',
 shareToken: 'expensive-token',
 platform: 'instagram',
 clickCount: 2,
 viewCount: 0,
 conversionCount: 0,
 lastAccessedAt: null,
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 video: {
 id: 'expensive-video',
 title: 'Expensive Video',
 description: 'Very expensive video',
 videoUrl: 'https://example.com/expensive.mp4',
 thumbnailUrl: 'https://example.com/expensive-thumb.jpg',
 duration: 300,
 creditCost: 100,
 category: 'premium',
 tags: ['expensive'],
 viewCount: 10,
 totalEarnings: 200,
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 creator: {
 id: 'expensive-creator',
 username: 'expensivecreator',
 displayName: 'Expensive Creator',
 avatar: 'https://example.com/expensive-avatar.jpg',
 },
 },
 },
 access: {
 hasAccess: false,
 accessType: 'token_preview',
 shareToken: 'expensive-token',
 requiresPurchase: true,
 },
 });

 mockWalletService.deductCredits.mockResolvedValue({
 success: false,
 error: 'Insufficient credits',
 requiredCredits: 100,
 currentBalance: 50,
 });

 const request = new NextRequest('http://localhost:3000/api/watch/expensive-token/view', {
 method: 'POST',
 });
 const context = { params: Promise.resolve({ identifier: 'expensive-token' }) };

 const response = await POST(request, context);
 const data = await response.json();

 expect(response.status).toBe(402);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Insufficient credits');
 expect(data.requiredCredits).toBe(100);
 expect(data.currentBalance).toBe(50);
 });

 it('should handle invalid share token', async () => {

 mockAuth.mockResolvedValue({ userId: 'clerk-user-789' } as any);
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'user-789',
 clerkId: 'clerk-user-789',
 email: 'user789@example.com',
 } as any);

 mockIdentifierService.resolveIdentifier.mockResolvedValue({
 success: false,
 type: 'share_token',
 data: {} as any,
 access: { hasAccess: false, accessType: 'requires_purchase', requiresPurchase: true },
 error: 'Share token not found',
 });

 const request = new NextRequest('http://localhost:3000/api/watch/invalid-token/view', {
 method: 'POST',
 });
 const context = { params: Promise.resolve({ identifier: 'invalid-token' }) };

 const response = await POST(request, context);
 const data = await response.json();

 expect(response.status).toBe(404);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Share token not found');
 });

 it('should handle expired share token', async () => {

 mockAuth.mockResolvedValue({ userId: 'clerk-user-999' } as any);
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'user-999',
 clerkId: 'clerk-user-999',
 email: 'user999@example.com',
 } as any);

 mockIdentifierService.resolveIdentifier.mockResolvedValue({
 success: false,
 type: 'share_token',
 data: {} as any,
 access: { hasAccess: false, accessType: 'requires_purchase', requiresPurchase: true },
 error: 'Share token has expired',
 });

 const request = new NextRequest('http://localhost:3000/api/watch/expired-token/view', {
 method: 'POST',
 });
 const context = { params: Promise.resolve({ identifier: 'expired-token' }) };

 const response = await POST(request, context);
 const data = await response.json();

 expect(response.status).toBe(404);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Share token has expired');
 });

 it('should handle unauthenticated purchase attempt', async () => {

 mockAuth.mockResolvedValue({ userId: null } as any);

 const request = new NextRequest('http://localhost:3000/api/watch/some-token/view', {
 method: 'POST',
 });
 const context = { params: Promise.resolve({ identifier: 'some-token' }) };

 const response = await POST(request, context);
 const data = await response.json();

 expect(response.status).toBe(401);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Authentication required');
 });

 it('should handle wallet service errors', async () => {

 mockAuth.mockResolvedValue({ userId: 'clerk-wallet-error' } as any);
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'wallet-error-user',
 clerkId: 'clerk-wallet-error',
 email: 'walleterror@example.com',
 } as any);

 mockIdentifierService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'share_token',
 data: {
 id: 'wallet-error-share',
 videoId: 'wallet-error-video',
 creatorId: 'wallet-error-creator',
 shareToken: 'wallet-error-token',
 platform: 'test',
 clickCount: 1,
 viewCount: 0,
 conversionCount: 0,
 lastAccessedAt: null,
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 video: {
 id: 'wallet-error-video',
 title: 'Wallet Error Video',
 description: 'Video that causes wallet error',
 videoUrl: 'https://example.com/wallet-error.mp4',
 thumbnailUrl: 'https://example.com/wallet-error-thumb.jpg',
 duration: 120,
 creditCost: 5,
 category: 'test',
 tags: ['wallet-error'],
 viewCount: 1,
 totalEarnings: 0,
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 creator: {
 id: 'wallet-error-creator',
 username: 'walleterrorcreator',
 displayName: 'Wallet Error Creator',
 avatar: null,
 },
 },
 },
 access: {
 hasAccess: false,
 accessType: 'token_preview',
 shareToken: 'wallet-error-token',
 requiresPurchase: true,
 },
 });

 mockWalletService.deductCredits.mockRejectedValue(new Error('Database connection failed'));

 const request = new NextRequest('http://localhost:3000/api/watch/wallet-error-token/view', {
 method: 'POST',
 });
 const context = { params: Promise.resolve({ identifier: 'wallet-error-token' }) };

 const response = await POST(request, context);
 const data = await response.json();

 expect(response.status).toBe(500);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Internal server error');
 });
 });

 describe('Input Validation', () => {
 it('should handle empty identifier', async () => {
 const request = new NextRequest('http://localhost:3000/api/watch//view', {
 method: 'POST',
 });
 const context = { params: Promise.resolve({ identifier: '' }) };

 const response = await POST(request, context);
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Invalid identifier provided');
 });

 it('should handle null identifier', async () => {
 const request = new NextRequest('http://localhost:3000/api/watch/null/view', {
 method: 'POST',
 });
 const context = { params: Promise.resolve({ identifier: null as any }) };

 const response = await POST(request, context);
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Invalid identifier provided');
 });
 });

 describe('Video ID Purchase Attempts', () => {
 it('should handle purchase attempt with video ID instead of share token', async () => {

 mockAuth.mockResolvedValue({ userId: 'clerk-video-id-user' } as any);
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'video-id-user',
 clerkId: 'clerk-video-id-user',
 email: 'videoiduser@example.com',
 } as any);

 mockIdentifierService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'video_id',
 data: {
 id: 'direct-video-123',
 title: 'Direct Video',
 description: 'Video accessed directly by ID',
 videoUrl: 'https://example.com/direct.mp4',
 thumbnailUrl: 'https://example.com/direct-thumb.jpg',
 duration: 150,
 creditCost: 8,
 category: 'direct',
 tags: ['direct'],
 viewCount: 75,
 totalEarnings: 60,
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 creator: {
 id: 'direct-creator',
 username: 'directcreator',
 displayName: 'Direct Creator',
 avatar: 'https://example.com/direct-avatar.jpg',
 },
 },
 access: {
 hasAccess: false,
 accessType: 'requires_purchase',
 requiresPurchase: true,
 },
 });

 const request = new NextRequest('http://localhost:3000/api/watch/direct-video-123/view', {
 method: 'POST',
 });
 const context = { params: Promise.resolve({ identifier: 'direct-video-123' }) };

 const response = await POST(request, context);
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.success).toBe(false);
 expect(data.error).toBe('This endpoint is only for share token purchases');
 });
 });
});