

import { coinTransactionService } from '@/lib/services/coinTransactionService';
import { db } from '@/lib/database/connection';

jest.mock('@/lib/database/connection', () => ({
 db: {
 select: jest.fn(),
 insert: jest.fn(),
 update: jest.fn(),
 transaction: jest.fn(),
 }
}));

const mockDb = db as jest.Mocked<typeof db>;

describe('CoinTransactionService', () => {
 const mockUserId = 'user-123';
 const mockCreatorId = 'creator-456';
 const mockTransactionId = 'transaction-789';

 beforeEach(() => {
 jest.clearAllMocks();
 });

 describe('getUserCoinBalance', () => {
 it('should return user coin balance', async () => {
 const mockBalance = 1000;
 
 (mockDb.select as any).mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([{ coinBalance: mockBalance }])
 })
 })
 });

 const balance = await coinTransactionService.getUserCoinBalance(mockUserId);
 
 expect(balance).toBe(mockBalance);
 });

 it('should return 0 if user not found', async () => {
 (mockDb.select as any).mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([])
 })
 })
 });

 const balance = await coinTransactionService.getUserCoinBalance(mockUserId);
 
 expect(balance).toBe(0);
 });

 it('should handle errors gracefully', async () => {
 (mockDb.select as any).mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockRejectedValue(new Error('Database error'))
 })
 })
 });

 const balance = await coinTransactionService.getUserCoinBalance(mockUserId);
 
 expect(balance).toBe(0);
 });
 });

 describe('getCoinBalanceInfo', () => {
 it('should return detailed balance information', async () => {
 const mockData = {
 coinBalance: 1000,
 totalCoinsPurchased: 2000,
 totalCoinsSpent: 1000,
 updatedAt: new Date()
 };

 (mockDb.select as any).mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([mockData])
 })
 })
 });

 const info = await coinTransactionService.getCoinBalanceInfo(mockUserId);
 
 expect(info.balance).toBe(mockData.coinBalance);
 expect(info.totalPurchased).toBe(mockData.totalCoinsPurchased);
 expect(info.totalSpent).toBe(mockData.totalCoinsSpent);
 expect(info.lastUpdated).toBe(mockData.updatedAt);
 });

 it('should throw error if user not found', async () => {
 (mockDb.select as any).mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([])
 })
 })
 });

 await expect(
 coinTransactionService.getCoinBalanceInfo(mockUserId)
 ).rejects.toThrow('User not found');
 });
 });

 describe('createCoinTransaction', () => {
 it('should create a purchase transaction successfully', async () => {
 const mockTransaction = {
 id: mockTransactionId,
 userId: mockUserId,
 transactionType: 'purchase' as const,
 coinAmount: 100,
 status: 'completed' as const,
 description: 'Coin purchase',
 createdAt: new Date(),
 updatedAt: new Date()
 };

 const mockNewBalance = 1100;

 (mockDb.transaction as any).mockImplementation(async (callback: any) => {
 return callback({
 insert: jest.fn().mockReturnValue({
 values: jest.fn().mockReturnValue({
 returning: jest.fn().mockResolvedValue([mockTransaction])
 })
 }),
 update: jest.fn().mockReturnValue({
 set: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue([])
 })
 }),
 select: jest.fn().mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([{ coinBalance: 1000 }])
 })
 })
 })
 });
 });

 jest.spyOn(coinTransactionService, 'getUserCoinBalance').mockResolvedValue(1000);

 jest.spyOn(coinTransactionService, 'updateUserCoinBalance').mockResolvedValue(mockNewBalance);

 const result = await coinTransactionService.createCoinTransaction({
 userId: mockUserId,
 transactionType: 'purchase',
 coinAmount: 100,
 rupeeAmount: 5,
 description: 'Coin purchase'
 });

 expect(result.success).toBe(true);
 expect(result.transaction).toBeDefined();
 expect(result.newBalance).toBe(mockNewBalance);
 });

 it('should fail if coin amount is zero or negative', async () => {
 const result = await coinTransactionService.createCoinTransaction({
 userId: mockUserId,
 transactionType: 'purchase',
 coinAmount: 0,
 description: 'Invalid purchase'
 });

 expect(result.success).toBe(false);
 expect(result.error).toBe('Coin amount must be greater than zero');
 });

 it('should fail spend transaction if insufficient balance', async () => {
 jest.spyOn(coinTransactionService, 'getUserCoinBalance').mockResolvedValue(50);

 const result = await coinTransactionService.createCoinTransaction({
 userId: mockUserId,
 transactionType: 'spend',
 coinAmount: 100,
 description: 'Content purchase'
 });

 expect(result.success).toBe(false);
 expect(result.error).toContain('Insufficient coins');
 });

 it('should create a spend transaction successfully', async () => {
 const mockTransaction = {
 id: mockTransactionId,
 userId: mockUserId,
 transactionType: 'spend' as const,
 coinAmount: 50,
 status: 'completed' as const,
 description: 'Video purchase',
 createdAt: new Date(),
 updatedAt: new Date()
 };

 const mockNewBalance = 950;

 (mockDb.transaction as any).mockImplementation(async (callback: any) => {
 return callback({
 insert: jest.fn().mockReturnValue({
 values: jest.fn().mockReturnValue({
 returning: jest.fn().mockResolvedValue([mockTransaction])
 })
 }),
 update: jest.fn().mockReturnValue({
 set: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue([])
 })
 }),
 select: jest.fn().mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([{ coinBalance: 1000 }])
 })
 })
 })
 });
 });

 jest.spyOn(coinTransactionService, 'getUserCoinBalance').mockResolvedValue(1000);
 jest.spyOn(coinTransactionService, 'updateUserCoinBalance').mockResolvedValue(mockNewBalance);

 const result = await coinTransactionService.createCoinTransaction({
 userId: mockUserId,
 transactionType: 'spend',
 coinAmount: 50,
 relatedContentType: 'video',
 relatedContentId: 'video-123',
 description: 'Video purchase'
 });

 expect(result.success).toBe(true);
 expect(result.newBalance).toBe(mockNewBalance);
 });
 });

 describe('checkSufficientCoins', () => {
 it('should return sufficient true when user has enough coins', async () => {
 jest.spyOn(coinTransactionService, 'getUserCoinBalance').mockResolvedValue(1000);

 const result = await coinTransactionService.checkSufficientCoins(mockUserId, 500);

 expect(result.sufficient).toBe(true);
 expect(result.balance).toBe(1000);
 expect(result.error).toBeUndefined();
 });

 it('should return sufficient false when user has insufficient coins', async () => {
 jest.spyOn(coinTransactionService, 'getUserCoinBalance').mockResolvedValue(100);

 const result = await coinTransactionService.checkSufficientCoins(mockUserId, 500);

 expect(result.sufficient).toBe(false);
 expect(result.balance).toBe(100);
 expect(result.error).toBeDefined();
 expect(result.error?.required).toBe(500);
 expect(result.error?.available).toBe(100);
 expect(result.error?.shortfall).toBe(400);
 });
 });

 describe('getUserTransactionHistory', () => {
 it('should return transaction history with pagination', async () => {
 const mockTransactions = [
 {
 id: 'tx-1',
 userId: mockUserId,
 transactionType: 'purchase' as const,
 coinAmount: 100,
 status: 'completed' as const,
 description: 'Purchase 1',
 createdAt: new Date(),
 updatedAt: new Date()
 },
 {
 id: 'tx-2',
 userId: mockUserId,
 transactionType: 'spend' as const,
 coinAmount: 50,
 status: 'completed' as const,
 description: 'Spend 1',
 createdAt: new Date(),
 updatedAt: new Date()
 }
 ];

 (mockDb.select as any).mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 orderBy: jest.fn().mockReturnValue({
 limit: jest.fn().mockReturnValue({
 offset: jest.fn().mockResolvedValue(mockTransactions)
 })
 })
 })
 })
 });

 (mockDb.select as any).mockReturnValueOnce({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 orderBy: jest.fn().mockReturnValue({
 limit: jest.fn().mockReturnValue({
 offset: jest.fn().mockResolvedValue(mockTransactions)
 })
 })
 })
 })
 }).mockReturnValueOnce({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue([{ count: 2 }])
 })
 });

 const result = await coinTransactionService.getUserTransactionHistory(mockUserId, {
 limit: 10,
 offset: 0
 });

 expect(result.transactions).toHaveLength(2);
 expect(result.total).toBe(2);
 });

 it('should filter by transaction type', async () => {
 (mockDb.select as any).mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 orderBy: jest.fn().mockReturnValue({
 limit: jest.fn().mockReturnValue({
 offset: jest.fn().mockResolvedValue([])
 })
 })
 })
 })
 });

 (mockDb.select as any).mockReturnValueOnce({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 orderBy: jest.fn().mockReturnValue({
 limit: jest.fn().mockReturnValue({
 offset: jest.fn().mockResolvedValue([])
 })
 })
 })
 })
 }).mockReturnValueOnce({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue([{ count: 0 }])
 })
 });

 const result = await coinTransactionService.getUserTransactionHistory(mockUserId, {
 transactionType: 'purchase'
 });

 expect(result.transactions).toHaveLength(0);
 });
 });

 describe('recordCreatorEarning', () => {
 it('should record creator earning successfully', async () => {
 const mockTransaction = {
 id: mockTransactionId,
 userId: mockCreatorId,
 transactionType: 'earn' as const,
 coinAmount: 50,
 status: 'completed' as const,
 description: 'Video sale earning',
 createdAt: new Date(),
 updatedAt: new Date()
 };

 const mockNewBalance = 550;

 (mockDb.transaction as any).mockImplementation(async (callback: any) => {
 return callback({
 insert: jest.fn().mockReturnValue({
 values: jest.fn().mockReturnValue({
 returning: jest.fn().mockResolvedValue([mockTransaction])
 })
 }),
 update: jest.fn().mockReturnValue({
 set: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue([])
 })
 }),
 select: jest.fn().mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([{ coinBalance: mockNewBalance }])
 })
 })
 })
 });
 });

 const result = await coinTransactionService.recordCreatorEarning(
 mockCreatorId,
 50,
 'video',
 'video-123',
 'Video sale earning'
 );

 expect(result.success).toBe(true);
 expect(result.transaction).toBeDefined();
 expect(result.newBalance).toBe(mockNewBalance);
 });
 });

 describe('getCreatorCoinBalance', () => {
 it('should return creator coin balance', async () => {
 const mockBalance = 500;

 (mockDb.select as any).mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([{ coinBalance: mockBalance }])
 })
 })
 });

 const balance = await coinTransactionService.getCreatorCoinBalance(mockCreatorId);

 expect(balance).toBe(mockBalance);
 });

 it('should return 0 if creator not found', async () => {
 (mockDb.select as any).mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([])
 })
 })
 });

 const balance = await coinTransactionService.getCreatorCoinBalance(mockCreatorId);

 expect(balance).toBe(0);
 });
 });

 describe('getTransactionById', () => {
 it('should return transaction by ID', async () => {
 const mockTransaction = {
 id: mockTransactionId,
 userId: mockUserId,
 transactionType: 'purchase' as const,
 coinAmount: 100,
 status: 'completed' as const,
 description: 'Test transaction',
 createdAt: new Date(),
 updatedAt: new Date()
 };

 (mockDb.select as any).mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([mockTransaction])
 })
 })
 });

 const transaction = await coinTransactionService.getTransactionById(mockTransactionId);

 expect(transaction).toBeDefined();
 expect(transaction?.id).toBe(mockTransactionId);
 });

 it('should return null if transaction not found', async () => {
 (mockDb.select as any).mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([])
 })
 })
 });

 const transaction = await coinTransactionService.getTransactionById('non-existent');

 expect(transaction).toBeNull();
 });
 });

 describe('updateTransactionStatus', () => {
 it('should update transaction status successfully', async () => {
 (mockDb.update as any).mockReturnValue({
 set: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue([])
 })
 });

 const result = await coinTransactionService.updateTransactionStatus(
 mockTransactionId,
 'completed'
 );

 expect(result).toBe(true);
 });

 it('should return false on error', async () => {
 (mockDb.update as any).mockReturnValue({
 set: jest.fn().mockReturnValue({
 where: jest.fn().mockRejectedValue(new Error('Database error'))
 })
 });

 const result = await coinTransactionService.updateTransactionStatus(
 mockTransactionId,
 'failed'
 );

 expect(result).toBe(false);
 });
 });
});
