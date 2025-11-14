
import { NextRequest } from 'next/server';
import { GET } from '../route';
import { auth } from '@clerk/nextjs/server';
import { transactionRepository } from '@/lib/database/repositories/transactions';
import { videoRepository } from '@/lib/database/repositories/videos';
import { userRepository } from '@/lib/database/repositories/users';

jest.mock('@clerk/nextjs/server');
jest.mock('@/lib/database/repositories/transactions');
jest.mock('@/lib/database/repositories/videos');
jest.mock('@/lib/database/repositories/users');

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockTransactionRepository = transactionRepository as jest.Mocked<typeof transactionRepository>;
const mockVideoRepository = videoRepository as jest.Mocked<typeof videoRepository>;
const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;

describe('/api/creator/analytics', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 it('should return 401 if user is not authenticated', async () => {
 mockAuth.mockResolvedValue({ userId: null });

 const request = new NextRequest('http://localhost:3000/api/creator/analytics');
 const response = await GET(request);

 expect(response.status).toBe(401);
 const data = await response.json();
 expect(data.error).toBe('Unauthorized');
 });

 it('should return 404 if user is not a creator', async () => {
 mockAuth.mockResolvedValue({ userId: 'user123' });
 mockUserRepository.findByClerkId.mockResolvedValue({
 id: 'user123',
 clerkId: 'user123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member',
 avatar: null,
 createdAt: '2024-01-01T00:00:00Z',
 updatedAt: '2024-01-01T00:00:00Z'
 });

 const request = new NextRequest('http://localhost:3000/api/creator/analytics');
 const response = await GET(request);

 expect(response.status).toBe(404);
 const data = await response.json();
 expect(data.error).toBe('Creator not found');
 });

 it('should return analytics data for authenticated creator', async () => {
 const mockUser = {
 id: 'creator123',
 clerkId: 'user123',
 email: 'creator@example.com',
 username: 'creator',
 role: 'creator',
 avatar: null,
 createdAt: '2024-01-01T00:00:00Z',
 updatedAt: '2024-01-01T00:00:00Z'
 };

 const mockVideos = [
 {
 id: 'video1',
 creatorId: 'creator123',
 title: 'Test Video 1',
 description: 'Description 1',
 videoUrl: 'https://example.com/video1.mp4',
 thumbnailUrl: 'https://example.com/thumb1.jpg',
 duration: 120,
 creditCost: '5.00',
 category: 'Entertainment',
 tags: ['tag1', 'tag2'],
 viewCount: 100,
 totalEarnings: '50.00',
 isActive: true,
 createdAt: '2024-01-01T00:00:00Z',
 updatedAt: '2024-01-01T00:00:00Z'
 },
 {
 id: 'video2',
 creatorId: 'creator123',
 title: 'Test Video 2',
 description: 'Description 2',
 videoUrl: 'https://example.com/video2.mp4',
 thumbnailUrl: 'https://example.com/thumb2.jpg',
 duration: 180,
 creditCost: '3.00',
 category: 'Education',
 tags: ['tag3', 'tag4'],
 viewCount: 50,
 totalEarnings: '25.00',
 isActive: true,
 createdAt: '2024-01-02T00:00:00Z',
 updatedAt: '2024-01-02T00:00:00Z'
 }
 ];

 const mockEarningsData = [
 { date: '2024-01-01', earnings: 50 },
 { date: '2024-01-02', earnings: 25 }
 ];

 const mockTransactions = [
 {
 id: 'trans1',
 userId: 'creator123',
 type: 'creator_earning' as const,
 amount: '50.00',
 videoId: 'video1',
 creatorId: 'creator123',
 razorpayPaymentId: null,
 razorpayOrderId: null,
 status: 'completed' as const,
 metadata: null,
 createdAt: '2024-01-01T00:00:00Z',
 updatedAt: '2024-01-01T00:00:00Z',
 video: { id: 'video1', title: 'Test Video 1' }
 }
 ];

 mockAuth.mockResolvedValue({ userId: 'user123' });
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser);
 mockVideoRepository.findByCreator.mockResolvedValue({ videos: mockVideos, total: 2 });
 mockTransactionRepository.getEarningsByDateRange.mockResolvedValue(mockEarningsData);
 mockTransactionRepository.getCreatorEarnings.mockResolvedValue(75);
 mockTransactionRepository.findMany.mockResolvedValue({ transactions: mockTransactions, total: 1 });

 const request = new NextRequest('http://localhost:3000/api/creator/analytics?timeRange=month');
 const response = await GET(request);

 expect(response.status).toBe(200);
 const data = await response.json();

 expect(data.summary).toEqual({
 totalEarnings: 75,
 totalViews: 150,
 totalVideos: 2,
 avgEarningsPerVideo: 37.5,
 avgViewsPerVideo: 75
 });

 expect(data.charts.earnings).toEqual(mockEarningsData);
 expect(data.videoPerformance).toHaveLength(2);
 expect(data.transactions).toHaveLength(1);
 });

 it('should handle custom date range', async () => {
 const mockUser = {
 id: 'creator123',
 clerkId: 'user123',
 email: 'creator@example.com',
 username: 'creator',
 role: 'creator',
 avatar: null,
 createdAt: '2024-01-01T00:00:00Z',
 updatedAt: '2024-01-01T00:00:00Z'
 };

 mockAuth.mockResolvedValue({ userId: 'user123' });
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser);
 mockVideoRepository.findByCreator.mockResolvedValue({ videos: [], total: 0 });
 mockTransactionRepository.getEarningsByDateRange.mockResolvedValue([]);
 mockTransactionRepository.getCreatorEarnings.mockResolvedValue(0);
 mockTransactionRepository.findMany.mockResolvedValue({ transactions: [], total: 0 });

 const request = new NextRequest('http://localhost:3000/api/creator/analytics?startDate=2024-01-01&endDate=2024-01-31');
 const response = await GET(request);

 expect(response.status).toBe(200);
 expect(mockTransactionRepository.getEarningsByDateRange).toHaveBeenCalledWith(
 'creator123',
 new Date('2024-01-01'),
 new Date('2024-01-31')
 );
 });

 it('should handle different time ranges', async () => {
 const mockUser = {
 id: 'creator123',
 clerkId: 'user123',
 email: 'creator@example.com',
 username: 'creator',
 role: 'creator',
 avatar: null,
 createdAt: '2024-01-01T00:00:00Z',
 updatedAt: '2024-01-01T00:00:00Z'
 };

 mockAuth.mockResolvedValue({ userId: 'user123' });
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser);
 mockVideoRepository.findByCreator.mockResolvedValue({ videos: [], total: 0 });
 mockTransactionRepository.getEarningsByDateRange.mockResolvedValue([]);
 mockTransactionRepository.getCreatorEarnings.mockResolvedValue(0);
 mockTransactionRepository.findMany.mockResolvedValue({ transactions: [], total: 0 });

 const weekRequest = new NextRequest('http://localhost:3000/api/creator/analytics?timeRange=week');
 const weekResponse = await GET(weekRequest);
 expect(weekResponse.status).toBe(200);

 const yearRequest = new NextRequest('http://localhost:3000/api/creator/analytics?timeRange=year');
 const yearResponse = await GET(yearRequest);
 expect(yearResponse.status).toBe(200);
 });

 it('should handle database errors gracefully', async () => {
 mockAuth.mockResolvedValue({ userId: 'user123' });
 mockUserRepository.findByClerkId.mockRejectedValue(new Error('Database error'));

 const request = new NextRequest('http://localhost:3000/api/creator/analytics');
 const response = await GET(request);

 expect(response.status).toBe(500);
 const data = await response.json();
 expect(data.error).toBe('Failed to fetch analytics data');
 });
});