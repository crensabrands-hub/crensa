

import { creditService } from '@/lib/services/creditService'
import { transactionRepository } from '@/lib/database/repositories/transactions'
import { userRepository } from '@/lib/database/repositories/users'
import { videoRepository } from '@/lib/database/repositories/videos'

jest.mock('@/lib/database/repositories/transactions')
jest.mock('@/lib/database/repositories/users')
jest.mock('@/lib/database/repositories/videos')

const mockTransactionRepository = transactionRepository as jest.Mocked<typeof transactionRepository>
const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>
const mockVideoRepository = videoRepository as jest.Mocked<typeof videoRepository>

describe('CreditService', () => {
 const mockUserId = 'user-123'
 const mockVideoId = 'video-456'
 const mockCreatorId = 'creator-789'

 const mockVideo = {
 id: mockVideoId,
 creatorId: mockCreatorId,
 title: 'Test Video',
 description: 'Test Description',
 videoUrl: 'https://example.com/video.mp4',
 thumbnailUrl: 'https://example.com/thumb.jpg',
 duration: 120,
 creditCost: '5.00',
 category: 'Test',
 tags: ['test'],
 viewCount: 100,
 totalEarnings: '50.00',
 isActive: true,
 createdAt: new Date(),
 updatedAt: new Date(),
 creator: {
 id: mockCreatorId,
 username: 'testcreator',
 avatar: null
 }
 }

 const mockUser = {
 id: mockUserId,
 clerkId: 'clerk-123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member' as const,
 avatar: null,
 createdAt: new Date(),
 updatedAt: new Date(),
 memberProfile: {
 id: 'profile-123',
 userId: mockUserId,
 walletBalance: '20.00',
 membershipStatus: 'free' as const,
 membershipExpiry: null,
 watchHistory: [],
 favoriteCreators: [],
 createdAt: new Date(),
 updatedAt: new Date()
 }
 }

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

 const result = await creditService.getWalletBalance(mockUserId)

 expect(result).toEqual({
 balance: 25.50,
 lastUpdated: expect.any(Date),
 pendingTransactions: 2
 })
 })
 })

 describe('checkSufficientCredits', () => {
 it('should return sufficient when user has enough credits', async () => {
 mockTransactionRepository.getUserWalletBalance.mockResolvedValue(10.00)

 const result = await creditService.checkSufficientCredits(mockUserId, 5.00)

 expect(result).toEqual({
 sufficient: true,
 balance: 10.00
 })
 })

 it('should return insufficient when user lacks credits', async () => {
 mockTransactionRepository.getUserWalletBalance.mockResolvedValue(3.00)

 const result = await creditService.checkSufficientCredits(mockUserId, 5.00)

 expect(result).toEqual({
 sufficient: false,
 balance: 3.00,
 error: {
 required: 5.00,
 available: 3.00,
 shortfall: 2.00
 }
 })
 })
 })

 describe('deductCreditsForVideo', () => {
 it('should successfully deduct credits and create transactions', async () => {
 const mockTransaction = {
 id: 'transaction-123',
 userId: mockUserId,
 type: 'video_view' as const,
 amount: '5.00',
 videoId: mockVideoId,
 creatorId: mockCreatorId,
 status: 'completed' as const,
 createdAt: new Date(),
 updatedAt: new Date()
 }

 mockVideoRepository.findById.mockResolvedValue(mockVideo)
 mockTransactionRepository.getUserWalletBalance
 .mockResolvedValueOnce(10.00) // Initial check
 .mockResolvedValueOnce(5.00) // After deduction
 mockTransactionRepository.createVideoView.mockResolvedValue(mockTransaction)
 mockTransactionRepository.createCreatorEarning.mockResolvedValue({
 ...mockTransaction,
 id: 'earning-123',
 type: 'creator_earning'
 })
 mockVideoRepository.incrementViewCount.mockResolvedValue(mockVideo)
 mockVideoRepository.updateEarnings.mockResolvedValue(mockVideo)
 mockUserRepository.findById.mockResolvedValue({
 ...mockUser,
 creatorProfile: {
 id: 'creator-profile-123',
 userId: mockCreatorId,
 displayName: 'Test Creator',
 bio: null,
 totalEarnings: '45.00',
 totalViews: 99,
 videoCount: 5,
 socialLinks: null,
 createdAt: new Date(),
 updatedAt: new Date()
 }
 })
 mockUserRepository.updateCreatorProfile.mockResolvedValue({
 id: 'creator-profile-123',
 userId: mockCreatorId,
 displayName: 'Test Creator',
 bio: null,
 totalEarnings: '50.00',
 totalViews: 100,
 videoCount: 5,
 socialLinks: null,
 createdAt: new Date(),
 updatedAt: new Date()
 })

 const result = await creditService.deductCreditsForVideo(mockUserId, mockVideoId)

 expect(result).toEqual({
 success: true,
 newBalance: 5.00,
 transactionId: 'transaction-123'
 })

 expect(mockTransactionRepository.createVideoView).toHaveBeenCalledWith(
 mockUserId,
 mockVideoId,
 mockCreatorId,
 5.00
 )
 expect(mockTransactionRepository.createCreatorEarning).toHaveBeenCalledWith(
 mockCreatorId,
 mockVideoId,
 5.00,
 { viewTransactionId: 'transaction-123' }
 )
 expect(mockVideoRepository.incrementViewCount).toHaveBeenCalledWith(mockVideoId)
 expect(mockVideoRepository.updateEarnings).toHaveBeenCalledWith(mockVideoId, 5.00)
 })

 it('should fail when video not found', async () => {
 mockVideoRepository.findById.mockResolvedValue(null)

 const result = await creditService.deductCreditsForVideo(mockUserId, mockVideoId)

 expect(result).toEqual({
 success: false,
 newBalance: 0,
 error: 'Video not found'
 })
 })

 it('should fail when video is inactive', async () => {
 mockVideoRepository.findById.mockResolvedValue({
 ...mockVideo,
 isActive: false
 })

 const result = await creditService.deductCreditsForVideo(mockUserId, mockVideoId)

 expect(result).toEqual({
 success: false,
 newBalance: 0,
 error: 'Video is not available'
 })
 })

 it('should fail when insufficient credits', async () => {
 mockVideoRepository.findById.mockResolvedValue(mockVideo)
 mockTransactionRepository.getUserWalletBalance.mockResolvedValue(3.00)

 const result = await creditService.deductCreditsForVideo(mockUserId, mockVideoId)

 expect(result).toEqual({
 success: false,
 newBalance: 3.00,
 error: 'Insufficient credits. Required: 5, Available: 3'
 })
 })
 })

 describe('hasUserWatchedVideo', () => {
 it('should return true when user has watched video', async () => {
 mockTransactionRepository.findMany.mockResolvedValue({
 transactions: [{ id: 'transaction-123' } as any],
 total: 1
 })

 const result = await creditService.hasUserWatchedVideo(mockUserId, mockVideoId)

 expect(result).toBe(true)
 expect(mockTransactionRepository.findMany).toHaveBeenCalledWith(
 {
 userId: mockUserId,
 videoId: mockVideoId,
 type: 'video_view',
 status: 'completed'
 },
 { limit: 1 }
 )
 })

 it('should return false when user has not watched video', async () => {
 mockTransactionRepository.findMany.mockResolvedValue({
 transactions: [],
 total: 0
 })

 const result = await creditService.hasUserWatchedVideo(mockUserId, mockVideoId)

 expect(result).toBe(false)
 })
 })

 describe('getViewingHistory', () => {
 it('should return viewing history with video details', async () => {
 const mockTransactions = [
 {
 id: 'transaction-123',
 videoId: mockVideoId,
 amount: '5.00',
 createdAt: new Date('2024-01-15'),
 video: {
 id: mockVideoId,
 title: 'Test Video'
 }
 }
 ]

 mockTransactionRepository.findMany.mockResolvedValue({
 transactions: mockTransactions as any,
 total: 1
 })
 mockVideoRepository.findById.mockResolvedValue(mockVideo)

 const result = await creditService.getViewingHistory(mockUserId, 1, 20)

 expect(result.total).toBe(1)
 expect(result.history).toHaveLength(1)
 expect(result.history[0]).toEqual({
 id: 'transaction-123',
 videoId: mockVideoId,
 video: {
 id: mockVideoId,
 title: 'Test Video',
 thumbnailUrl: 'https://example.com/thumb.jpg',
 duration: 120,
 creator: {
 username: 'testcreator',
 displayName: 'testcreator'
 }
 },
 creditsCost: 5.00,
 watchedAt: new Date('2024-01-15'),
 transactionId: 'transaction-123'
 })
 })
 })

 describe('updateMemberWatchHistory', () => {
 it('should add video to watch history', async () => {
 mockUserRepository.findById.mockResolvedValue(mockUser)
 mockUserRepository.updateMemberProfile.mockResolvedValue({
 ...mockUser.memberProfile!,
 watchHistory: [mockVideoId]
 })

 await creditService.updateMemberWatchHistory(mockUserId, mockVideoId)

 expect(mockUserRepository.updateMemberProfile).toHaveBeenCalledWith(
 mockUserId,
 { watchHistory: [mockVideoId] }
 )
 })

 it('should not add duplicate videos to watch history', async () => {
 mockUserRepository.findById.mockResolvedValue({
 ...mockUser,
 memberProfile: {
 ...mockUser.memberProfile!,
 watchHistory: [mockVideoId]
 }
 })

 await creditService.updateMemberWatchHistory(mockUserId, mockVideoId)

 expect(mockUserRepository.updateMemberProfile).not.toHaveBeenCalled()
 })

 it('should limit watch history to 100 videos', async () => {
 const longHistory = Array.from({ length: 100 }, (_, i) => `video-${i}`)
 
 mockUserRepository.findById.mockResolvedValue({
 ...mockUser,
 memberProfile: {
 ...mockUser.memberProfile!,
 watchHistory: longHistory
 }
 })

 await creditService.updateMemberWatchHistory(mockUserId, mockVideoId)

 expect(mockUserRepository.updateMemberProfile).toHaveBeenCalledWith(
 mockUserId,
 { watchHistory: [mockVideoId, ...longHistory.slice(0, 99)] }
 )
 })
 })

 describe('getRealTimeBalance', () => {
 it('should return current wallet balance', async () => {
 mockTransactionRepository.getUserWalletBalance.mockResolvedValue(15.75)

 const result = await creditService.getRealTimeBalance(mockUserId)

 expect(result).toBe(15.75)
 })
 })
})