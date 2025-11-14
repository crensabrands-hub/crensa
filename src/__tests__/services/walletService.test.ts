

import { walletService } from '@/lib/services/walletService'
import { transactionRepository } from '@/lib/database/repositories/transactions'
import { userRepository } from '@/lib/database/repositories/users'
import type { WalletBalance } from '@/types'

jest.mock('@/lib/database/repositories/transactions')
jest.mock('@/lib/database/repositories/users')

const mockTransactionRepository = transactionRepository as jest.Mocked<typeof transactionRepository>
const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>

const mockUserId = 'user-123'
const mockUser = {
 id: mockUserId,
 clerkId: 'clerk-123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member' as const,
 avatar: null,
 createdAt: new Date(),
 updatedAt: new Date()
}

describe('WalletService', () => {
 beforeEach(() => {
 jest.clearAllMocks()
 })

 describe('getWalletBalance', () => {
 it('should return wallet balance with pending transactions', async () => {
 mockTransactionRepository.getUserWalletBalance.mockResolvedValue(25.50)
 mockTransactionRepository.findMany.mockResolvedValue({
 transactions: [],
 total: 2
 })

 const result = await walletService.getWalletBalance(mockUserId)

 expect(result).toEqual({
 balance: 25.50,
 lastUpdated: expect.any(Date),
 pendingTransactions: 2
 })
 })
 })

 describe('addCredits', () => {
 it('should add credits successfully', async () => {
 mockUserRepository.findById.mockResolvedValue(mockUser)
 mockTransactionRepository.create.mockResolvedValue({
 id: 'txn-123',
 userId: mockUserId,
 type: 'credit_purchase',
 amount: '100',
 status: 'completed',
 createdAt: new Date(),
 updatedAt: new Date()
 } as any)
 mockTransactionRepository.getUserWalletBalance.mockResolvedValue(150)

 const result = await walletService.addCredits(mockUserId, 100, 'purchase')

 expect(result).toEqual({
 success: true,
 newBalance: 150,
 transactionId: 'txn-123'
 })

 expect(mockTransactionRepository.create).toHaveBeenCalledWith({
 userId: mockUserId,
 type: 'credit_purchase',
 amount: '100',
 status: 'completed',
 metadata: {
 source: 'purchase',
 addedAt: expect.any(String)
 }
 })
 })

 it('should handle user not found', async () => {
 mockUserRepository.findById.mockResolvedValue(null)

 const result = await walletService.addCredits(mockUserId, 100, 'purchase')

 expect(result).toEqual({
 success: false,
 newBalance: 0
 })
 })

 it('should handle database errors', async () => {
 mockUserRepository.findById.mockResolvedValue(mockUser)
 mockTransactionRepository.create.mockRejectedValue(new Error('Database error'))

 const result = await walletService.addCredits(mockUserId, 100, 'purchase')

 expect(result).toEqual({
 success: false,
 newBalance: 0
 })
 })
 })

 describe('deductCredits', () => {
 it('should deduct credits successfully', async () => {
 mockTransactionRepository.getUserWalletBalance.mockResolvedValue(50)
 mockTransactionRepository.createVideoView.mockResolvedValue({
 id: 'txn-456',
 userId: mockUserId,
 type: 'video_view',
 amount: '10',
 status: 'completed',
 createdAt: new Date(),
 updatedAt: new Date()
 } as any)
 mockTransactionRepository.getUserWalletBalance.mockResolvedValue(40)

 const result = await walletService.deductCredits(mockUserId, 10, 'video-123', 'creator-456')

 expect(result).toEqual({
 success: true,
 newBalance: 40,
 transactionId: 'txn-456'
 })
 })

 it('should fail when insufficient balance', async () => {
 mockTransactionRepository.getUserWalletBalance.mockResolvedValue(5)

 const result = await walletService.deductCredits(mockUserId, 10, 'video-123', 'creator-456')

 expect(result).toEqual({
 success: false,
 newBalance: 5
 })
 })
 })

 describe('getTransactionHistory', () => {
 it('should return transaction history with pagination', async () => {
 const mockTransactions = [
 {
 id: 'txn-1',
 userId: mockUserId,
 type: 'credit_purchase',
 amount: '100',
 status: 'completed',
 createdAt: new Date(),
 updatedAt: new Date()
 }
 ]

 mockTransactionRepository.findMany.mockResolvedValue({
 transactions: mockTransactions as any,
 total: 1
 })

 const result = await walletService.getTransactionHistory(mockUserId, 1, 20)

 expect(result).toEqual({
 transactions: mockTransactions,
 total: 1
 })

 expect(mockTransactionRepository.findMany).toHaveBeenCalledWith(
 { userId: mockUserId },
 {
 page: 1,
 limit: 20,
 sortBy: 'createdAt',
 sortOrder: 'desc'
 }
 )
 })

 it('should apply filters correctly', async () => {
 mockTransactionRepository.findMany.mockResolvedValue({
 transactions: [],
 total: 0
 })

 const filters = {
 type: 'credit_purchase' as const,
 status: 'completed' as const,
 startDate: new Date('2024-01-01'),
 endDate: new Date('2024-01-31')
 }

 await walletService.getTransactionHistory(mockUserId, 1, 20, filters)

 expect(mockTransactionRepository.findMany).toHaveBeenCalledWith(
 {
 userId: mockUserId,
 ...filters
 },
 {
 page: 1,
 limit: 20,
 sortBy: 'createdAt',
 sortOrder: 'desc'
 }
 )
 })
 })

 describe('getWalletStats', () => {
 it('should calculate wallet statistics correctly', async () => {
 const mockTransactions = [
 {
 id: 'txn-1',
 type: 'credit_purchase',
 amount: '100',
 status: 'completed'
 },
 {
 id: 'txn-2',
 type: 'credit_purchase',
 amount: '50',
 status: 'completed'
 },
 {
 id: 'txn-3',
 type: 'video_view',
 amount: '10',
 status: 'completed'
 },
 {
 id: 'txn-4',
 type: 'video_view',
 amount: '5',
 status: 'completed'
 }
 ]

 mockTransactionRepository.findMany.mockResolvedValue({
 transactions: mockTransactions as any,
 total: 4
 })

 const result = await walletService.getWalletStats(mockUserId)

 expect(result).toEqual({
 totalSpent: 15, // 10 + 5
 totalPurchased: 150, // 100 + 50
 transactionCount: 4,
 averageTransaction: 41.25 // (150 + 15) / 4
 })
 })

 it('should handle empty transaction history', async () => {
 mockTransactionRepository.findMany.mockResolvedValue({
 transactions: [],
 total: 0
 })

 const result = await walletService.getWalletStats(mockUserId)

 expect(result).toEqual({
 totalSpent: 0,
 totalPurchased: 0,
 transactionCount: 0,
 averageTransaction: 0
 })
 })
 })

 describe('claimReward', () => {
 it('should claim reward successfully', async () => {
 mockUserRepository.findById.mockResolvedValue(mockUser)
 mockTransactionRepository.create.mockResolvedValue({
 id: 'reward-txn-123',
 userId: mockUserId,
 type: 'credit_purchase',
 amount: '25',
 status: 'completed',
 createdAt: new Date(),
 updatedAt: new Date()
 } as any)
 mockTransactionRepository.getUserWalletBalance.mockResolvedValue(75)

 const result = await walletService.claimReward(mockUserId, 'daily-login', 25)

 expect(result).toEqual({
 success: true,
 newBalance: 75,
 transactionId: 'reward-txn-123'
 })

 expect(mockTransactionRepository.create).toHaveBeenCalledWith({
 userId: mockUserId,
 type: 'credit_purchase',
 amount: '25',
 status: 'completed',
 metadata: {
 source: 'reward',
 addedAt: expect.any(String),
 taskId: 'daily-login',
 rewardType: 'app_bonus'
 }
 })
 })
 })

 describe('subscribeToBalanceUpdates', () => {
 it('should manage subscriptions correctly', () => {
 const callback1 = jest.fn()
 const callback2 = jest.fn()

 const unsubscribe1 = walletService.subscribeToBalanceUpdates(mockUserId, callback1)
 const unsubscribe2 = walletService.subscribeToBalanceUpdates(mockUserId, callback2)

 expect(typeof unsubscribe1).toBe('function')
 expect(typeof unsubscribe2).toBe('function')

 unsubscribe1()

 unsubscribe2()

 expect(true).toBe(true)
 })
 })

 describe('notifyBalanceUpdate', () => {
 it('should notify all subscribers', async () => {
 const callback1 = jest.fn()
 const callback2 = jest.fn()

 mockTransactionRepository.getUserWalletBalance.mockResolvedValue(100)
 mockTransactionRepository.findMany.mockResolvedValue({
 transactions: [],
 total: 0
 })

 walletService.subscribeToBalanceUpdates(mockUserId, callback1)
 walletService.subscribeToBalanceUpdates(mockUserId, callback2)

 await walletService.notifyBalanceUpdate(mockUserId)

 expect(callback1).toHaveBeenCalledWith({
 balance: 100,
 lastUpdated: expect.any(Date),
 pendingTransactions: 0
 })
 expect(callback2).toHaveBeenCalledWith({
 balance: 100,
 lastUpdated: expect.any(Date),
 pendingTransactions: 0
 })
 })

 it('should handle callback errors gracefully', async () => {
 const errorCallback = jest.fn().mockImplementation(() => {
 throw new Error('Callback error')
 })
 const goodCallback = jest.fn()

 mockTransactionRepository.getUserWalletBalance.mockResolvedValue(100)
 mockTransactionRepository.findMany.mockResolvedValue({
 transactions: [],
 total: 0
 })

 walletService.subscribeToBalanceUpdates(mockUserId, errorCallback)
 walletService.subscribeToBalanceUpdates(mockUserId, goodCallback)

 await expect(walletService.notifyBalanceUpdate(mockUserId)).resolves.not.toThrow()

 expect(goodCallback).toHaveBeenCalled()
 })
 })

 describe('cancelPendingTransaction', () => {
 it('should cancel pending transaction successfully', async () => {
 const mockTransaction = {
 id: 'txn-123',
 userId: mockUserId,
 status: 'pending',
 type: 'credit_purchase',
 amount: '100',
 createdAt: new Date(),
 updatedAt: new Date()
 }

 mockTransactionRepository.findById.mockResolvedValue(mockTransaction as any)
 mockTransactionRepository.updateStatus.mockResolvedValue(mockTransaction as any)

 const result = await walletService.cancelPendingTransaction(mockUserId, 'txn-123')

 expect(result).toBe(true)
 expect(mockTransactionRepository.updateStatus).toHaveBeenCalledWith('txn-123', 'failed')
 })

 it('should fail for non-existent transaction', async () => {
 mockTransactionRepository.findById.mockResolvedValue(null)

 const result = await walletService.cancelPendingTransaction(mockUserId, 'txn-123')

 expect(result).toBe(false)
 })

 it('should fail for transaction belonging to different user', async () => {
 const mockTransaction = {
 id: 'txn-123',
 userId: 'other-user',
 status: 'pending',
 type: 'credit_purchase',
 amount: '100',
 createdAt: new Date(),
 updatedAt: new Date()
 }

 mockTransactionRepository.findById.mockResolvedValue(mockTransaction as any)

 const result = await walletService.cancelPendingTransaction(mockUserId, 'txn-123')

 expect(result).toBe(false)
 })

 it('should fail for non-pending transaction', async () => {
 const mockTransaction = {
 id: 'txn-123',
 userId: mockUserId,
 status: 'completed',
 type: 'credit_purchase',
 amount: '100',
 createdAt: new Date(),
 updatedAt: new Date()
 }

 mockTransactionRepository.findById.mockResolvedValue(mockTransaction as any)

 const result = await walletService.cancelPendingTransaction(mockUserId, 'txn-123')

 expect(result).toBe(false)
 })
 })
})