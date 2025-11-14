

import { identifierResolutionService } from '@/lib/services/identifierResolutionService';
import { userRepository } from '@/lib/database/repositories/users';

jest.mock('@/lib/services/identifierResolutionService');
jest.mock('@/lib/database/repositories/users');
jest.mock('@clerk/nextjs/server', () => ({
 auth: jest.fn()
}));

const mockIdentifierResolutionService = identifierResolutionService as jest.Mocked<typeof identifierResolutionService>;
const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;

let GET: any;

beforeAll(async () => {
 const { GET: getHandler } = await import('../route');
 GET = getHandler;
});

describe('/api/watch/[identifier]', () => {
 const mockVideoData = {
 id: 'video-123',
 title: 'Test Video',
 description: 'Test Description',
 videoUrl: 'https://example.com/video.mp4',
 thumbnailUrl: 'https://example.com/thumb.jpg',
 duration: 120,
 creditCost: 5.0,
 category: 'entertainment',
 tags: ['test', 'video'],
 viewCount: 100,
 totalEarnings: 50.0,
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 creator: {
 id: 'creator-123',
 username: 'testcreator',
 displayName: 'Test Creator',
 avatar: 'https://example.com/avatar.jpg'
 }
 };

 const mockShareData = {
 id: 'share-123',
 videoId: 'video-123',
 creatorId: 'creator-123',
 shareToken: 'share-token-123',
 platform: 'twitter',
 clickCount: 10,
 viewCount: 5,
 conversionCount: 2,
 lastAccessedAt: new Date('2024-01-01'),
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 video: mockVideoData
 };

 const mockUser = {
 id: 'user-123',
 clerkId: 'clerk-123',
 username: 'testuser',
 email: 'test@example.com'
 };

 beforeEach(() => {
 jest.clearAllMocks();
 });

 describe('Input Validation', () => {
 it('should return 400 for empty identifier', async () => {
 const request = {} as any; // Mock request object
 const params = Promise.resolve({ identifier: '' });

 const response = await GET(request, { params });
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Invalid identifier provided');
 });

 it('should return 400 for whitespace-only identifier', async () => {
 const request = {} as any; // Mock request object
 const params = Promise.resolve({ identifier: ' ' });

 const response = await GET(request, { params });
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Invalid identifier provided');
 });
 });

 describe('Video ID Access', () => {
 it('should handle video ID with authenticated user who has access', async () => {

 const { auth } = require('@clerk/nextjs/server');
 auth.mockResolvedValue({ userId: 'clerk-123' });
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser);
 mockIdentifierResolutionService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'video_id',
 data: mockVideoData,
 access: {
 hasAccess: true,
 accessType: 'owned',
 requiresPurchase: false
 }
 });

 const request = {} as any;
 const params = Promise.resolve({ identifier: 'video-123' });

 const response = await GET(request, { params });
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(data.video.id).toBe('video-123');
 expect(data.video.videoUrl).toBe('https://example.com/video.mp4'); // Should include video URL
 expect(data.hasAccess).toBe(true);
 expect(data.accessType).toBe('owned');
 expect(data.requiresPurchase).toBe(false);
 });

 it('should handle video ID with authenticated user who needs to purchase', async () => {

 const { auth } = require('@clerk/nextjs/server');
 auth.mockResolvedValue({ userId: 'clerk-123' });
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser);
 mockIdentifierResolutionService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'video_id',
 data: mockVideoData,
 access: {
 hasAccess: false,
 accessType: 'requires_purchase',
 requiresPurchase: true
 }
 });

 const request = new NextRequest('http://localhost/api/watch/video-123');
 const params = Promise.resolve({ identifier: 'video-123' });

 const response = await GET(request, { params });
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(data.video.id).toBe('video-123');
 expect(data.video.videoUrl).toBeNull(); // Should not include video URL
 expect(data.hasAccess).toBe(false);
 expect(data.accessType).toBe('requires_purchase');
 expect(data.requiresPurchase).toBe(true);
 });

 it('should handle video ID without authentication', async () => {

 const { auth } = require('@clerk/nextjs/server');
 auth.mockResolvedValue({ userId: null });
 mockIdentifierResolutionService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'video_id',
 data: mockVideoData,
 access: {
 hasAccess: false,
 accessType: 'requires_purchase',
 requiresPurchase: true
 }
 });

 const request = new NextRequest('http://localhost/api/watch/video-123');
 const params = Promise.resolve({ identifier: 'video-123' });

 const response = await GET(request, { params });
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(data.video.videoUrl).toBeNull(); // Should not include video URL
 expect(data.hasAccess).toBe(false);
 expect(data.requiresPurchase).toBe(true);
 });
 });

 describe('Share Token Access', () => {
 it('should handle share token access', async () => {

 const { auth } = require('@clerk/nextjs/server');
 auth.mockResolvedValue({ userId: null });
 mockIdentifierResolutionService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'share_token',
 data: mockShareData,
 access: {
 hasAccess: false,
 accessType: 'token_preview',
 shareToken: 'share-token-123',
 requiresPurchase: true
 }
 });

 const request = new NextRequest('http://localhost/api/watch/share-token-123');
 const params = Promise.resolve({ identifier: 'share-token-123' });

 const response = await GET(request, { params });
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(data.video.id).toBe('video-123');
 expect(data.video.shareToken).toBe('share-token-123');
 expect(data.hasAccess).toBe(false);
 expect(data.accessType).toBe('token_preview');
 expect(data.requiresPurchase).toBe(true);
 expect(data.shareToken).toBe('share-token-123');
 });

 it('should handle share token with authenticated user who owns the video', async () => {

 const { auth } = require('@clerk/nextjs/server');
 auth.mockResolvedValue({ userId: 'clerk-123' });
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser);
 mockIdentifierResolutionService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'share_token',
 data: mockShareData,
 access: {
 hasAccess: true,
 accessType: 'owned',
 shareToken: 'share-token-123',
 requiresPurchase: false
 }
 });

 const request = new NextRequest('http://localhost/api/watch/share-token-123');
 const params = Promise.resolve({ identifier: 'share-token-123' });

 const response = await GET(request, { params });
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(data.hasAccess).toBe(true);
 expect(data.accessType).toBe('owned');
 expect(data.requiresPurchase).toBe(false);
 });
 });

 describe('Error Handling', () => {
 it('should handle video not found error', async () => {
 const { auth } = require('@clerk/nextjs/server');
 auth.mockResolvedValue({ userId: null });
 mockIdentifierResolutionService.resolveIdentifier.mockResolvedValue({
 success: false,
 type: 'video_id',
 data: {} as any,
 access: { hasAccess: false, accessType: 'requires_purchase', requiresPurchase: true },
 error: 'Video not found'
 });

 const request = new NextRequest('http://localhost/api/watch/nonexistent');
 const params = Promise.resolve({ identifier: 'nonexistent' });

 const response = await GET(request, { params });
 const data = await response.json();

 expect(response.status).toBe(404);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Video not found');
 });

 it('should handle expired share token error', async () => {
 const { auth } = require('@clerk/nextjs/server');
 auth.mockResolvedValue({ userId: null });
 mockIdentifierResolutionService.resolveIdentifier.mockResolvedValue({
 success: false,
 type: 'share_token',
 data: {} as any,
 access: { hasAccess: false, accessType: 'requires_purchase', requiresPurchase: true },
 error: 'Share token not found or expired'
 });

 const request = new NextRequest('http://localhost/api/watch/expired-token');
 const params = Promise.resolve({ identifier: 'expired-token' });

 const response = await GET(request, { params });
 const data = await response.json();

 expect(response.status).toBe(404);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Share token not found or expired');
 });

 it('should handle service errors gracefully', async () => {
 const { auth } = require('@clerk/nextjs/server');
 auth.mockResolvedValue({ userId: null });
 mockIdentifierResolutionService.resolveIdentifier.mockRejectedValue(
 new Error('Database connection failed')
 );

 const request = new NextRequest('http://localhost/api/watch/video-123');
 const params = Promise.resolve({ identifier: 'video-123' });

 const response = await GET(request, { params });
 const data = await response.json();

 expect(response.status).toBe(500);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Internal server error');
 });

 it('should handle authentication errors gracefully', async () => {
 const { auth } = require('@clerk/nextjs/server');
 auth.mockRejectedValue(new Error('Auth service unavailable'));
 mockIdentifierResolutionService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'share_token',
 data: mockShareData,
 access: {
 hasAccess: false,
 accessType: 'token_preview',
 shareToken: 'share-token-123',
 requiresPurchase: true
 }
 });

 const request = new NextRequest('http://localhost/api/watch/share-token-123');
 const params = Promise.resolve({ identifier: 'share-token-123' });

 const response = await GET(request, { params });
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 });
 });

 describe('Response Format Compatibility', () => {
 it('should maintain video ID response format compatibility', async () => {
 const { auth } = require('@clerk/nextjs/server');
 auth.mockResolvedValue({ userId: 'clerk-123' });
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser);
 mockIdentifierResolutionService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'video_id',
 data: mockVideoData,
 access: {
 hasAccess: true,
 accessType: 'owned',
 requiresPurchase: false
 }
 });

 const request = new NextRequest('http://localhost/api/watch/video-123');
 const params = Promise.resolve({ identifier: 'video-123' });

 const response = await GET(request, { params });
 const data = await response.json();

 expect(data).toHaveProperty('success', true);
 expect(data).toHaveProperty('video');
 expect(data).toHaveProperty('hasAccess');
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
 expect(data.video.creator).toHaveProperty('id');
 expect(data.video.creator).toHaveProperty('username');
 expect(data.video.creator).toHaveProperty('displayName');
 expect(data.video.creator).toHaveProperty('avatar');
 });

 it('should maintain share token response format compatibility', async () => {
 const { auth } = require('@clerk/nextjs/server');
 auth.mockResolvedValue({ userId: null });
 mockIdentifierResolutionService.resolveIdentifier.mockResolvedValue({
 success: true,
 type: 'share_token',
 data: mockShareData,
 access: {
 hasAccess: false,
 accessType: 'token_preview',
 shareToken: 'share-token-123',
 requiresPurchase: true
 }
 });

 const request = new NextRequest('http://localhost/api/watch/share-token-123');
 const params = Promise.resolve({ identifier: 'share-token-123' });

 const response = await GET(request, { params });
 const data = await response.json();

 expect(data).toHaveProperty('success', true);
 expect(data).toHaveProperty('video');
 expect(data).toHaveProperty('shareToken');
 expect(data.video).toHaveProperty('shareToken');
 expect(data.video).toHaveProperty('id');
 expect(data.video).toHaveProperty('title');
 expect(data.video).toHaveProperty('creator');
 });
 });

 describe('Error Status Code Mapping', () => {
 const testCases = [
 { error: 'Video not found', expectedStatus: 404 },
 { error: 'Share token expired', expectedStatus: 404 },
 { error: 'Invalid identifier format', expectedStatus: 400 },
 { error: 'Malformed token', expectedStatus: 400 },
 { error: 'Empty identifier provided', expectedStatus: 400 },
 { error: 'Unauthorized access', expectedStatus: 401 },
 { error: 'Access denied', expectedStatus: 401 },
 { error: 'Forbidden resource', expectedStatus: 403 },
 { error: 'Insufficient permissions', expectedStatus: 403 },
 { error: 'Database error', expectedStatus: 500 },
 { error: undefined, expectedStatus: 500 }
 ];

 testCases.forEach(({ error, expectedStatus }) => {
 it(`should return ${expectedStatus} for error: ${error || 'undefined'}`, async () => {
 const { auth } = require('@clerk/nextjs/server');
 auth.mockResolvedValue({ userId: null });
 mockIdentifierResolutionService.resolveIdentifier.mockResolvedValue({
 success: false,
 type: 'video_id',
 data: {} as any,
 access: { hasAccess: false, accessType: 'requires_purchase', requiresPurchase: true },
 error
 });

 const request = new NextRequest('http://localhost/api/watch/test');
 const params = Promise.resolve({ identifier: 'test' });

 const response = await GET(request, { params });
 expect(response.status).toBe(expectedStatus);
 });
 });
 });
});