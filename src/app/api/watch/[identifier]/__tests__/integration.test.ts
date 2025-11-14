

import { NextRequest } from 'next/server';
import { GET } from '../route';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories/users';
import { identifierResolutionService } from '@/lib/services/identifierResolutionService';

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

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockIdentifierService = identifierResolutionService as jest.Mocked<typeof identifierResolutionService>;

describe('Unified Watch API Integration Tests', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 describe('Video ID Access (Requirement 1.2)', () => {
 it('should return video data for valid video ID with access', async () => {

 mockAuth.mockResolvedValue({ userId: 'clerk-user-123' } as any);
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'user-123',
 clerkId: 'clerk-user-123',
 email: 'test@example.com',
 } as any);

 mockIdentifierService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'video_id',
 data: {
 id: 'video-123',
 title: 'Test Video',
 description: 'Test Description',
 videoUrl: 'https://example.com/video.mp4',
 thumbnailUrl: 'https://example.com/thumb.jpg',
 duration: 120,
 creditCost: 5,
 category: 'entertainment',
 tags: ['test'],
 viewCount: 100,
 totalEarnings: 50,
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 creator: {
 id: 'creator-123',
 username: 'testcreator',
 displayName: 'Test Creator',
 avatar: 'https://example.com/avatar.jpg',
 },
 },
 access: {
 hasAccess: true,
 accessType: 'owned',
 requiresPurchase: false,
 },
 });

 const request = new NextRequest('http://localhost:3000/api/watch/video-123');
 const context = { params: Promise.resolve({ identifier: 'video-123' }) };

 const response = await GET(request, context);
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(data.video.id).toBe('video-123');
 expect(data.video.title).toBe('Test Video');
 expect(data.hasAccess).toBe(true);
 expect(data.accessType).toBe('owned');
 expect(data.requiresPurchase).toBe(false);
 expect(data.video.videoUrl).toBe('https://example.com/video.mp4'); // Should include video URL for owned content
 });

 it('should return video data without video URL for unowned content', async () => {

 mockAuth.mockResolvedValue({ userId: 'clerk-user-456' } as any);
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'user-456',
 clerkId: 'clerk-user-456',
 email: 'test2@example.com',
 } as any);

 mockIdentifierService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'video_id',
 data: {
 id: 'video-456',
 title: 'Premium Video',
 description: 'Premium Content',
 videoUrl: 'https://example.com/premium.mp4',
 thumbnailUrl: 'https://example.com/premium-thumb.jpg',
 duration: 180,
 creditCost: 10,
 category: 'premium',
 tags: ['premium'],
 viewCount: 50,
 totalEarnings: 100,
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 creator: {
 id: 'creator-456',
 username: 'premiumcreator',
 displayName: 'Premium Creator',
 avatar: 'https://example.com/premium-avatar.jpg',
 },
 },
 access: {
 hasAccess: false,
 accessType: 'requires_purchase',
 requiresPurchase: true,
 },
 });

 const request = new NextRequest('http://localhost:3000/api/watch/video-456');
 const context = { params: Promise.resolve({ identifier: 'video-456' }) };

 const response = await GET(request, context);
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(data.video.id).toBe('video-456');
 expect(data.hasAccess).toBe(false);
 expect(data.requiresPurchase).toBe(true);
 expect(data.video.videoUrl).toBeNull(); // Should not include video URL for unowned content
 });
 });

 describe('Share Token Access (Requirement 1.3)', () => {
 it('should return share token data with preview information', async () => {

 mockAuth.mockResolvedValue({ userId: null } as any);

 mockIdentifierService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'share_token',
 data: {
 id: 'share-123',
 videoId: 'video-789',
 creatorId: 'creator-789',
 shareToken: 'share-token-123',
 platform: 'twitter',
 clickCount: 10,
 viewCount: 5,
 conversionCount: 2,
 lastAccessedAt: new Date('2024-01-01'),
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 video: {
 id: 'video-789',
 title: 'Shared Video',
 description: 'Shared via token',
 videoUrl: 'https://example.com/shared.mp4',
 thumbnailUrl: 'https://example.com/shared-thumb.jpg',
 duration: 240,
 creditCost: 15,
 category: 'education',
 tags: ['shared'],
 viewCount: 75,
 totalEarnings: 150,
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 creator: {
 id: 'creator-789',
 username: 'sharecreator',
 displayName: 'Share Creator',
 avatar: 'https://example.com/share-avatar.jpg',
 },
 },
 },
 access: {
 hasAccess: false,
 accessType: 'token_preview',
 shareToken: 'share-token-123',
 requiresPurchase: true,
 },
 });

 const request = new NextRequest('http://localhost:3000/api/watch/share-token-123');
 const context = { params: Promise.resolve({ identifier: 'share-token-123' }) };

 const response = await GET(request, context);
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(data.video.id).toBe('video-789');
 expect(data.video.title).toBe('Shared Video');
 expect(data.hasAccess).toBe(false);
 expect(data.accessType).toBe('token_preview');
 expect(data.requiresPurchase).toBe(true);
 expect(data.shareToken).toBe('share-token-123');
 });

 it('should handle authenticated user accessing share token', async () => {

 mockAuth.mockResolvedValue({ userId: 'clerk-user-789' } as any);
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'user-789',
 clerkId: 'clerk-user-789',
 email: 'test3@example.com',
 } as any);

 mockIdentifierService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'share_token',
 data: {
 id: 'share-456',
 videoId: 'video-999',
 creatorId: 'creator-999',
 shareToken: 'auth-share-token',
 platform: 'facebook',
 clickCount: 20,
 viewCount: 15,
 conversionCount: 8,
 lastAccessedAt: new Date('2024-01-01'),
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 video: {
 id: 'video-999',
 title: 'Auth Shared Video',
 description: 'Shared to authenticated user',
 videoUrl: 'https://example.com/auth-shared.mp4',
 thumbnailUrl: 'https://example.com/auth-shared-thumb.jpg',
 duration: 300,
 creditCost: 20,
 category: 'premium',
 tags: ['auth', 'shared'],
 viewCount: 100,
 totalEarnings: 200,
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 creator: {
 id: 'creator-999',
 username: 'authcreator',
 displayName: 'Auth Creator',
 avatar: 'https://example.com/auth-avatar.jpg',
 },
 },
 },
 access: {
 hasAccess: false,
 accessType: 'token_preview',
 shareToken: 'auth-share-token',
 requiresPurchase: true,
 },
 });

 const request = new NextRequest('http://localhost:3000/api/watch/auth-share-token');
 const context = { params: Promise.resolve({ identifier: 'auth-share-token' }) };

 const response = await GET(request, context);
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(data.video.title).toBe('Auth Shared Video');
 expect(data.shareToken).toBe('auth-share-token');
 expect(mockIdentifierService.resolveIdentifier).toHaveBeenCalledWith(
 'auth-share-token',
 'user-789'
 );
 });
 });

 describe('Creator Self-Access (Requirement 1.3)', () => {
 it('should allow creator to access their own video without purchase', async () => {

 mockAuth.mockResolvedValue({ userId: 'clerk-creator-123' } as any);
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'creator-123',
 clerkId: 'clerk-creator-123',
 email: 'creator@example.com',
 } as any);

 mockIdentifierService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'video_id',
 data: {
 id: 'creator-video-123',
 title: 'My Creator Video',
 description: 'Video I created',
 videoUrl: 'https://example.com/creator-video.mp4',
 thumbnailUrl: 'https://example.com/creator-thumb.jpg',
 duration: 150,
 creditCost: 8,
 category: 'tutorial',
 tags: ['tutorial', 'creator'],
 viewCount: 200,
 totalEarnings: 160,
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 creator: {
 id: 'creator-123',
 username: 'testcreator',
 displayName: 'Test Creator',
 avatar: 'https://example.com/creator-avatar.jpg',
 },
 },
 access: {
 hasAccess: true,
 accessType: 'creator_self_access',
 requiresPurchase: false,
 },
 });

 const request = new NextRequest('http://localhost:3000/api/watch/creator-video-123');
 const context = { params: Promise.resolve({ identifier: 'creator-video-123' }) };

 const response = await GET(request, context);
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(data.hasAccess).toBe(true);
 expect(data.accessType).toBe('creator_self_access');
 expect(data.requiresPurchase).toBe(false);
 expect(data.video.videoUrl).toBe('https://example.com/creator-video.mp4'); // Creator should get video URL
 });
 });

 describe('Backward Compatibility (Requirements 3.1, 3.2)', () => {
 it('should maintain compatibility with legacy video ID API responses', async () => {

 mockAuth.mockResolvedValue({ userId: 'clerk-legacy-user' } as any);
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'legacy-user',
 clerkId: 'clerk-legacy-user',
 email: 'legacy@example.com',
 } as any);

 mockIdentifierService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'video_id',
 data: {
 id: 'legacy-video-id',
 title: 'Legacy Video',
 description: 'Old format video',
 videoUrl: 'https://example.com/legacy.mp4',
 thumbnailUrl: 'https://example.com/legacy-thumb.jpg',
 duration: 90,
 creditCost: 3,
 category: 'legacy',
 tags: ['legacy'],
 viewCount: 500,
 totalEarnings: 150,
 isActive: true,
 createdAt: new Date('2023-01-01'),
 updatedAt: new Date('2023-01-01'),
 creator: {
 id: 'legacy-creator',
 username: 'legacycreator',
 displayName: 'Legacy Creator',
 avatar: 'https://example.com/legacy-avatar.jpg',
 },
 },
 access: {
 hasAccess: true,
 accessType: 'owned',
 requiresPurchase: false,
 },
 });

 const request = new NextRequest('http://localhost:3000/api/watch/legacy-video-id');
 const context = { params: Promise.resolve({ identifier: 'legacy-video-id' }) };

 const response = await GET(request, context);
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data).toHaveProperty('success', true);
 expect(data).toHaveProperty('video');
 expect(data).toHaveProperty('hasAccess');
 expect(data).toHaveProperty('accessType');
 expect(data).toHaveProperty('requiresPurchase');
 
 expect(data.video).toHaveProperty('id');
 expect(data.video).toHaveProperty('title');
 expect(data.video).toHaveProperty('description');
 expect(data.video).toHaveProperty('videoUrl');
 expect(data.video).toHaveProperty('thumbnailUrl');
 expect(data.video).toHaveProperty('duration');
 expect(data.video).toHaveProperty('creditCost');
 expect(data.video).toHaveProperty('category');
 expect(data.video).toHaveProperty('tags');
 expect(data.video).toHaveProperty('viewCount');
 expect(data.video).toHaveProperty('createdAt');
 expect(data.video).toHaveProperty('creator');
 });

 it('should maintain compatibility with legacy share token API responses', async () => {

 mockAuth.mockResolvedValue({ userId: null } as any);

 mockIdentifierService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'share_token',
 data: {
 id: 'legacy-share-123',
 videoId: 'legacy-shared-video',
 creatorId: 'legacy-share-creator',
 shareToken: 'legacy-token-456',
 platform: 'legacy',
 clickCount: 50,
 viewCount: 30,
 conversionCount: 15,
 lastAccessedAt: new Date('2023-06-01'),
 isActive: true,
 createdAt: new Date('2023-01-01'),
 updatedAt: new Date('2023-06-01'),
 video: {
 id: 'legacy-shared-video',
 title: 'Legacy Shared Video',
 description: 'Old share token format',
 videoUrl: 'https://example.com/legacy-shared.mp4',
 thumbnailUrl: 'https://example.com/legacy-shared-thumb.jpg',
 duration: 200,
 creditCost: 7,
 category: 'legacy-share',
 tags: ['legacy', 'shared'],
 viewCount: 300,
 totalEarnings: 210,
 isActive: true,
 createdAt: new Date('2023-01-01'),
 updatedAt: new Date('2023-01-01'),
 creator: {
 id: 'legacy-share-creator',
 username: 'legacysharecreator',
 displayName: 'Legacy Share Creator',
 avatar: 'https://example.com/legacy-share-avatar.jpg',
 },
 },
 },
 access: {
 hasAccess: false,
 accessType: 'token_preview',
 shareToken: 'legacy-token-456',
 requiresPurchase: true,
 },
 });

 const request = new NextRequest('http://localhost:3000/api/watch/legacy-token-456');
 const context = { params: Promise.resolve({ identifier: 'legacy-token-456' }) };

 const response = await GET(request, context);
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data).toHaveProperty('success', true);
 expect(data).toHaveProperty('video');
 expect(data).toHaveProperty('hasAccess');
 expect(data).toHaveProperty('accessType');
 expect(data).toHaveProperty('requiresPurchase');
 expect(data).toHaveProperty('shareToken');
 
 expect(data.video).toHaveProperty('shareToken', 'legacy-token-456');
 });
 });

 describe('Error Handling (Requirement 3.3)', () => {
 it('should handle invalid identifier with 400 status', async () => {
 const request = new NextRequest('http://localhost:3000/api/watch/');
 const context = { params: Promise.resolve({ identifier: '' }) };

 const response = await GET(request, context);
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Invalid identifier provided');
 });

 it('should handle identifier resolution failure', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-user-123' } as any);
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'user-123',
 clerkId: 'clerk-user-123',
 email: 'test@example.com',
 } as any);

 mockIdentifierService.resolveIdentifier.mockResolvedValue({
 success: false,
 type: 'video_id',
 data: {} as any,
 access: { hasAccess: false, accessType: 'requires_purchase', requiresPurchase: true },
 error: 'Video not found',
 });

 const request = new NextRequest('http://localhost:3000/api/watch/nonexistent-video');
 const context = { params: Promise.resolve({ identifier: 'nonexistent-video' }) };

 const response = await GET(request, context);
 const data = await response.json();

 expect(response.status).toBe(404);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Video not found');
 });

 it('should handle service errors gracefully', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-user-123' } as any);
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'user-123',
 clerkId: 'clerk-user-123',
 email: 'test@example.com',
 } as any);

 mockIdentifierService.resolveIdentifier.mockRejectedValue(new Error('Database connection failed'));

 const request = new NextRequest('http://localhost:3000/api/watch/error-test');
 const context = { params: Promise.resolve({ identifier: 'error-test' }) };

 const response = await GET(request, context);
 const data = await response.json();

 expect(response.status).toBe(500);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Internal server error');
 });

 it('should handle authentication errors gracefully', async () => {

 mockAuth.mockRejectedValue(new Error('Auth service unavailable'));

 mockIdentifierService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'share_token',
 data: {
 id: 'share-no-auth',
 videoId: 'video-no-auth',
 creatorId: 'creator-no-auth',
 shareToken: 'no-auth-token',
 platform: 'test',
 clickCount: 1,
 viewCount: 0,
 conversionCount: 0,
 lastAccessedAt: null,
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 video: {
 id: 'video-no-auth',
 title: 'No Auth Video',
 description: 'Video accessible without auth',
 videoUrl: 'https://example.com/no-auth.mp4',
 thumbnailUrl: 'https://example.com/no-auth-thumb.jpg',
 duration: 60,
 creditCost: 1,
 category: 'test',
 tags: ['test'],
 viewCount: 10,
 totalEarnings: 1,
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 creator: {
 id: 'creator-no-auth',
 username: 'noauthcreator',
 displayName: 'No Auth Creator',
 avatar: null,
 },
 },
 },
 access: {
 hasAccess: false,
 accessType: 'token_preview',
 shareToken: 'no-auth-token',
 requiresPurchase: true,
 },
 });

 const request = new NextRequest('http://localhost:3000/api/watch/no-auth-token');
 const context = { params: Promise.resolve({ identifier: 'no-auth-token' }) };

 const response = await GET(request, context);
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(data.video.title).toBe('No Auth Video');
 expect(mockIdentifierService.resolveIdentifier).toHaveBeenCalledWith('no-auth-token', undefined);
 });
 });

 describe('Input Validation', () => {
 it('should handle null identifier', async () => {
 const request = new NextRequest('http://localhost:3000/api/watch/null');
 const context = { params: Promise.resolve({ identifier: null as any }) };

 const response = await GET(request, context);
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Invalid identifier provided');
 });

 it('should handle whitespace-only identifier', async () => {
 const request = new NextRequest('http://localhost:3000/api/watch/ ');
 const context = { params: Promise.resolve({ identifier: ' ' }) };

 const response = await GET(request, context);
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Invalid identifier provided');
 });

 it('should trim identifier before processing', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-user-123' } as any);
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'user-123',
 clerkId: 'clerk-user-123',
 email: 'test@example.com',
 } as any);

 mockIdentifierService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'video_id',
 data: {
 id: 'trimmed-video',
 title: 'Trimmed Video',
 description: 'Video with trimmed identifier',
 videoUrl: 'https://example.com/trimmed.mp4',
 thumbnailUrl: 'https://example.com/trimmed-thumb.jpg',
 duration: 100,
 creditCost: 4,
 category: 'test',
 tags: ['trimmed'],
 viewCount: 25,
 totalEarnings: 16,
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 creator: {
 id: 'trimmed-creator',
 username: 'trimmedcreator',
 displayName: 'Trimmed Creator',
 avatar: null,
 },
 },
 access: {
 hasAccess: true,
 accessType: 'owned',
 requiresPurchase: false,
 },
 });

 const request = new NextRequest('http://localhost:3000/api/watch/ trimmed-video ');
 const context = { params: Promise.resolve({ identifier: ' trimmed-video ' }) };

 const response = await GET(request, context);
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(mockIdentifierService.resolveIdentifier).toHaveBeenCalledWith('trimmed-video', 'user-123');
 });
 });
});