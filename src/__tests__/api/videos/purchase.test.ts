

import { POST } from '@/app/api/videos/[id]/purchase/route';
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories/users';
import { db } from '@/lib/database/connection';
import { coinTransactionService } from '@/lib/services/coinTransactionService';
import { seriesAccessService } from '@/lib/services/seriesAccessService';

jest.mock('@clerk/nextjs/server');
jest.mock('@/lib/database/repositories/users');
jest.mock('@/lib/database/connection');
jest.mock('@/lib/services/coinTransactionService');
jest.mock('@/lib/services/seriesAccessService');

describe('Video Purchase API - Coin System', () => {
 const mockUserId = 'clerk_user_123';
 const mockUser = {
 id: 'user-uuid-123',
 clerkId: mockUserId,
 email: 'test@example.com',
 username: 'testuser',
 role: 'member' as const,
 coinBalance: 500,
 };

 const mockVideo = {
 id: 'video-uuid-123',
 title: 'Test Video',
 coinPrice: 100,
 creatorId: 'creator-uuid-123',
 };

 beforeEach(() => {
 jest.clearAllMocks();
 });

 it('should successfully purchase video with sufficient coins', async () => {

 (auth as jest.Mock).mockResolvedValue({ userId: mockUserId } as any);

 (userRepository.findByClerkId as jest.Mock).mockResolvedValue(mockUser as any);

 const mockDb = {
 select: jest.fn().mockReturnThis(),
 from: jest.fn().mockReturnThis(),
 where: jest.fn().mockReturnThis(),
 limit: jest.fn().mockResolvedValue([mockVideo]),
 transaction: jest.fn(async (callback) => {
 return await callback({
 insert: jest.fn().mockReturnThis(),
 values: jest.fn().mockReturnThis(),
 update: jest.fn().mockReturnThis(),
 set: jest.fn().mockReturnThis(),
 });
 }),
 };
 (db as any).select = mockDb.select;
 (db as any).transaction = mockDb.transaction;

 (seriesAccessService.checkVideoAccess as jest.Mock).mockResolvedValue({
 hasAccess: false,
 });

 (coinTransactionService.checkSufficientCoins as jest.Mock).mockResolvedValue({
 sufficient: true,
 balance: 500,
 });

 (coinTransactionService.createCoinTransaction as jest.Mock).mockResolvedValue({
 success: true,
 newBalance: 400,
 transaction: {
 id: 'transaction-uuid',
 userId: mockUser.id,
 transactionType: 'spend',
 coinAmount: 100,
 status: 'completed',
 } as any,
 });

 (coinTransactionService.recordCreatorEarning as jest.Mock).mockResolvedValue({
 success: true,
 } as any);

 const request = new NextRequest('http://localhost/api/videos/video-uuid-123/purchase', {
 method: 'POST',
 });

 const params = Promise.resolve({ id: 'video-uuid-123' });

 const response = await POST(request, { params });
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(data.coinsSpent).toBe(100);
 expect(data.remainingBalance).toBe(400);
 expect(data.hasAccess).toBe(true);
 expect(data.accessType).toBe('video_purchase');
 expect(coinTransactionService.createCoinTransaction).toHaveBeenCalledWith(
 expect.objectContaining({
 userId: mockUser.id,
 transactionType: 'spend',
 coinAmount: 100,
 relatedContentType: 'video',
 relatedContentId: 'video-uuid-123',
 })
 );
 });

 it('should reject purchase with insufficient coins', async () => {

 (auth as jest.Mock).mockResolvedValue({ userId: mockUserId } as any);

 (userRepository.findByClerkId as jest.Mock).mockResolvedValue(mockUser as any);

 const mockDb = {
 select: jest.fn().mockReturnThis(),
 from: jest.fn().mockReturnThis(),
 where: jest.fn().mockReturnThis(),
 limit: jest.fn().mockResolvedValue([{ ...mockVideo, coinPrice: 600 }]),
 };
 (db as any).select = mockDb.select;

 (seriesAccessService.checkVideoAccess as jest.Mock).mockResolvedValue({
 hasAccess: false,
 });

 (coinTransactionService.checkSufficientCoins as jest.Mock).mockResolvedValue({
 sufficient: false,
 balance: 500,
 error: {
 required: 600,
 available: 500,
 shortfall: 100,
 message: 'Insufficient coins. You need 100 more coins.',
 },
 });

 const request = new NextRequest('http://localhost/api/videos/video-uuid-123/purchase', {
 method: 'POST',
 });

 const params = Promise.resolve({ id: 'video-uuid-123' });

 const response = await POST(request, { params });
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Insufficient coins');
 expect(data.coinsRequired).toBe(600);
 expect(data.coinsAvailable).toBe(500);
 expect(data.coinsShortfall).toBe(100);
 });

 it('should return success if user already has access via video purchase', async () => {

 (auth as jest.Mock).mockResolvedValue({ userId: mockUserId } as any);

 (userRepository.findByClerkId as jest.Mock).mockResolvedValue(mockUser as any);

 const mockDb = {
 select: jest.fn().mockReturnThis(),
 from: jest.fn().mockReturnThis(),
 where: jest.fn().mockReturnThis(),
 limit: jest.fn().mockResolvedValue([mockVideo]),
 };
 (db as any).select = mockDb.select;

 (seriesAccessService.checkVideoAccess as jest.Mock).mockResolvedValue({
 hasAccess: true,
 accessType: 'video_purchase',
 purchaseDate: new Date('2024-01-01'),
 });

 const request = new NextRequest('http://localhost/api/videos/video-uuid-123/purchase', {
 method: 'POST',
 });

 const params = Promise.resolve({ id: 'video-uuid-123' });

 const response = await POST(request, { params });
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(data.message).toBe('You already purchased this video');
 expect(data.hasAccess).toBe(true);
 expect(data.accessType).toBe('video_purchase');
 expect(data.coinsSpent).toBe(0);
 });

 it('should return success if user has access via series purchase', async () => {

 (auth as jest.Mock).mockResolvedValue({ userId: mockUserId } as any);

 (userRepository.findByClerkId as jest.Mock).mockResolvedValue(mockUser as any);

 const mockDb = {
 select: jest.fn().mockReturnThis(),
 from: jest.fn().mockReturnThis(),
 where: jest.fn().mockReturnThis(),
 limit: jest.fn().mockResolvedValue([{ ...mockVideo, seriesId: 'series-uuid-123' }]),
 };
 (db as any).select = mockDb.select;

 (seriesAccessService.checkVideoAccess as jest.Mock).mockResolvedValue({
 hasAccess: true,
 accessType: 'series_purchase',
 purchaseDate: new Date('2024-01-01'),
 });

 const request = new NextRequest('http://localhost/api/videos/video-uuid-123/purchase', {
 method: 'POST',
 });

 const params = Promise.resolve({ id: 'video-uuid-123' });

 const response = await POST(request, { params });
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(data.message).toBe('You have access to this video through your series purchase');
 expect(data.hasAccess).toBe(true);
 expect(data.accessType).toBe('series_purchase');
 expect(data.coinsSpent).toBe(0);
 });

 it('should return success if user is the creator', async () => {

 (auth as jest.Mock).mockResolvedValue({ userId: mockUserId } as any);

 (userRepository.findByClerkId as jest.Mock).mockResolvedValue(mockUser as any);

 const mockDb = {
 select: jest.fn().mockReturnThis(),
 from: jest.fn().mockReturnThis(),
 where: jest.fn().mockReturnThis(),
 limit: jest.fn().mockResolvedValue([mockVideo]),
 };
 (db as any).select = mockDb.select;

 (seriesAccessService.checkVideoAccess as jest.Mock).mockResolvedValue({
 hasAccess: true,
 accessType: 'creator_access',
 });

 const request = new NextRequest('http://localhost/api/videos/video-uuid-123/purchase', {
 method: 'POST',
 });

 const params = Promise.resolve({ id: 'video-uuid-123' });

 const response = await POST(request, { params });
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(data.message).toBe('You have access to this video as the creator');
 expect(data.hasAccess).toBe(true);
 expect(data.accessType).toBe('creator_access');
 expect(data.coinsSpent).toBe(0);
 });

 it('should return 404 if video not found', async () => {

 (auth as jest.Mock).mockResolvedValue({ userId: mockUserId } as any);

 (userRepository.findByClerkId as jest.Mock).mockResolvedValue(mockUser as any);

 const mockDb = {
 select: jest.fn().mockReturnThis(),
 from: jest.fn().mockReturnThis(),
 where: jest.fn().mockReturnThis(),
 limit: jest.fn().mockResolvedValue([]), // No video found
 };
 (db as any).select = mockDb.select;

 const request = new NextRequest('http://localhost/api/videos/video-uuid-123/purchase', {
 method: 'POST',
 });

 const params = Promise.resolve({ id: 'video-uuid-123' });

 const response = await POST(request, { params });
 const data = await response.json();

 expect(response.status).toBe(404);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Video not found');
 });

 it('should return 401 if user not authenticated', async () => {

 (auth as jest.Mock).mockResolvedValue({ userId: null } as any);

 const request = new NextRequest('http://localhost/api/videos/video-uuid-123/purchase', {
 method: 'POST',
 });

 const params = Promise.resolve({ id: 'video-uuid-123' });

 const response = await POST(request, { params });
 const data = await response.json();

 expect(response.status).toBe(401);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Authentication required');
 });
});
