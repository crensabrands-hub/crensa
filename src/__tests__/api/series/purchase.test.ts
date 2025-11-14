

import { POST } from '@/app/api/series/[id]/purchase/route';
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories/users';
import { seriesPurchasesRepository } from '@/lib/database/repositories/seriesPurchases';
import { db } from '@/lib/database';
import { coinTransactionService } from '@/lib/services/coinTransactionService';

jest.mock('@clerk/nextjs/server');
jest.mock('@/lib/database/repositories/users');
jest.mock('@/lib/database/repositories/seriesPurchases');
jest.mock('@/lib/database');
jest.mock('@/lib/services/coinTransactionService');

describe('Series Purchase API - Coin System', () => {
 const mockUserId = 'clerk_user_123';
 const mockUser = {
 id: 'user-uuid-123',
 clerkId: mockUserId,
 email: 'test@example.com',
 username: 'testuser',
 role: 'member' as const,
 coinBalance: 1000,
 };

 const mockSeries = {
 id: 'series-uuid-123',
 title: 'Test Series',
 coinPrice: 500,
 creatorId: 'creator-uuid-123',
 isActive: true,
 };

 beforeEach(() => {
 jest.clearAllMocks();
 });

 it('should successfully purchase series with sufficient coins', async () => {

 (auth as jest.Mock).mockResolvedValue({ userId: mockUserId } as any);

 (userRepository.findByClerkId as jest.Mock).mockResolvedValue(mockUser as any);

 const mockDb = {
 select: jest.fn().mockReturnThis(),
 from: jest.fn().mockReturnThis(),
 where: jest.fn().mockReturnThis(),
 limit: jest.fn().mockResolvedValue([mockSeries]),
 transaction: jest.fn(async (callback) => {
 return await callback({
 update: jest.fn().mockReturnThis(),
 set: jest.fn().mockReturnThis(),
 });
 }),
 };
 (db as any).select = mockDb.select;
 (db as any).transaction = mockDb.transaction;

 (seriesPurchasesRepository.findByUserAndSeries as jest.Mock).mockResolvedValue(null);
 (seriesPurchasesRepository.create as jest.Mock).mockResolvedValue({
 id: 'purchase-uuid',
 seriesId: mockSeries.id,
 userId: mockUser.id,
 status: 'completed',
 } as any);

 (coinTransactionService.checkSufficientCoins as jest.Mock).mockResolvedValue({
 sufficient: true,
 balance: 1000,
 });

 (coinTransactionService.createCoinTransaction as jest.Mock).mockResolvedValue({
 success: true,
 newBalance: 500,
 transaction: {
 id: 'transaction-uuid',
 userId: mockUser.id,
 transactionType: 'spend',
 coinAmount: 500,
 status: 'completed',
 } as any,
 });

 (coinTransactionService.recordCreatorEarning as jest.Mock).mockResolvedValue({
 success: true,
 } as any);

 const request = new NextRequest('http://localhost/api/series/series-uuid-123/purchase', {
 method: 'POST',
 body: JSON.stringify({}),
 });

 const params = Promise.resolve({ id: 'series-uuid-123' });

 const response = await POST(request, { params });
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(data.coinsSpent).toBe(500);
 expect(data.remainingBalance).toBe(500);
 expect(data.hasAccess).toBe(true);
 expect(coinTransactionService.createCoinTransaction).toHaveBeenCalledWith(
 expect.objectContaining({
 userId: mockUser.id,
 transactionType: 'spend',
 coinAmount: 500,
 relatedContentType: 'series',
 relatedContentId: 'series-uuid-123',
 })
 );
 });

 it('should reject purchase with insufficient coins', async () => {

 jest.mocked(auth).mockResolvedValue({ userId: mockUserId } as any);

 jest.mocked(userRepository.findByClerkId).mockResolvedValue(mockUser as any);

 const mockDb = {
 select: jest.fn().mockReturnThis(),
 from: jest.fn().mockReturnThis(),
 where: jest.fn().mockReturnThis(),
 limit: jest.fn().mockResolvedValue([{ ...mockSeries, coinPrice: 1500 }]),
 };
 jest.mocked(db).select = mockDb.select as any;

 jest.mocked(seriesPurchasesRepository.findByUserAndSeries).mockResolvedValue(null);

 jest.mocked(coinTransactionService.checkSufficientCoins).mockResolvedValue({
 sufficient: false,
 balance: 1000,
 error: {
 required: 1500,
 available: 1000,
 shortfall: 500,
 message: 'Insufficient coins. You need 500 more coins.',
 },
 });

 const request = new NextRequest('http://localhost/api/series/series-uuid-123/purchase', {
 method: 'POST',
 body: JSON.stringify({}),
 });

 const params = Promise.resolve({ id: 'series-uuid-123' });

 const response = await POST(request, { params });
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Insufficient coins');
 expect(data.coinsRequired).toBe(1500);
 expect(data.coinsAvailable).toBe(1000);
 expect(data.coinsShortfall).toBe(500);
 });

 it('should return success if user already owns series', async () => {

 jest.mocked(auth).mockResolvedValue({ userId: mockUserId } as any);

 jest.mocked(userRepository.findByClerkId).mockResolvedValue(mockUser as any);

 const mockDb = {
 select: jest.fn().mockReturnThis(),
 from: jest.fn().mockReturnThis(),
 where: jest.fn().mockReturnThis(),
 limit: jest.fn().mockResolvedValue([mockSeries]),
 };
 jest.mocked(db).select = mockDb.select as any;

 jest.mocked(seriesPurchasesRepository.findByUserAndSeries).mockResolvedValue({
 id: 'existing-purchase',
 seriesId: mockSeries.id,
 userId: mockUser.id,
 status: 'completed',
 } as any);

 const request = new NextRequest('http://localhost/api/series/series-uuid-123/purchase', {
 method: 'POST',
 body: JSON.stringify({}),
 });

 const params = Promise.resolve({ id: 'series-uuid-123' });

 const response = await POST(request, { params });
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(data.message).toContain('already own');
 expect(data.hasAccess).toBe(true);
 });

 it('should grant free access to creator', async () => {

 jest.mocked(auth).mockResolvedValue({ userId: mockUserId } as any);

 const creatorUser = { ...mockUser, id: 'creator-uuid-123' };
 jest.mocked(userRepository.findByClerkId).mockResolvedValue(creatorUser as any);

 const mockDb = {
 select: jest.fn().mockReturnThis(),
 from: jest.fn().mockReturnThis(),
 where: jest.fn().mockReturnThis(),
 limit: jest.fn().mockResolvedValue([mockSeries]),
 };
 jest.mocked(db).select = mockDb.select as any;

 jest.mocked(seriesPurchasesRepository.findByUserAndSeries).mockResolvedValue(null);
 jest.mocked(seriesPurchasesRepository.create).mockResolvedValue({
 id: 'creator-access',
 seriesId: mockSeries.id,
 userId: creatorUser.id,
 status: 'completed',
 } as any);

 const request = new NextRequest('http://localhost/api/series/series-uuid-123/purchase', {
 method: 'POST',
 body: JSON.stringify({}),
 });

 const params = Promise.resolve({ id: 'series-uuid-123' });

 const response = await POST(request, { params });
 const data = await response.json();

 expect(response.status).toBe(200);
 expect(data.success).toBe(true);
 expect(data.message).toContain('Creator access granted');
 expect(data.hasAccess).toBe(true);
 expect(seriesPurchasesRepository.create).toHaveBeenCalledWith(
 expect.objectContaining({
 purchasePrice: '0.00',
 status: 'completed',
 })
 );
 });

 it('should return 404 if series not found', async () => {

 jest.mocked(auth).mockResolvedValue({ userId: mockUserId } as any);

 jest.mocked(userRepository.findByClerkId).mockResolvedValue(mockUser as any);

 const mockDb = {
 select: jest.fn().mockReturnThis(),
 from: jest.fn().mockReturnThis(),
 where: jest.fn().mockReturnThis(),
 limit: jest.fn().mockResolvedValue([]), // No series found
 };
 jest.mocked(db).select = mockDb.select as any;

 const request = new NextRequest('http://localhost/api/series/series-uuid-123/purchase', {
 method: 'POST',
 body: JSON.stringify({}),
 });

 const params = Promise.resolve({ id: 'series-uuid-123' });

 const response = await POST(request, { params });
 const data = await response.json();

 expect(response.status).toBe(404);
 expect(data.success).toBe(false);
 expect(data.error).toBe('Series not found');
 });

 it('should return 400 if series is not active', async () => {

 jest.mocked(auth).mockResolvedValue({ userId: mockUserId } as any);

 jest.mocked(userRepository.findByClerkId).mockResolvedValue(mockUser as any);

 const mockDb = {
 select: jest.fn().mockReturnThis(),
 from: jest.fn().mockReturnThis(),
 where: jest.fn().mockReturnThis(),
 limit: jest.fn().mockResolvedValue([{ ...mockSeries, isActive: false }]),
 };
 jest.mocked(db).select = mockDb.select as any;

 const request = new NextRequest('http://localhost/api/series/series-uuid-123/purchase', {
 method: 'POST',
 body: JSON.stringify({}),
 });

 const params = Promise.resolve({ id: 'series-uuid-123' });

 const response = await POST(request, { params });
 const data = await response.json();

 expect(response.status).toBe(400);
 expect(data.success).toBe(false);
 expect(data.error).toContain('not available for purchase');
 });
});
