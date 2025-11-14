

import { transactionRepository } from '../database/repositories/transactions'
import { userRepository } from '../database/repositories/users'
import { videoRepository } from '../database/repositories/videos'
import type { 
 CreditDeductionResult, 
 ViewingSession, 
 WalletBalance, 
 InsufficientCreditsError,
 ViewingHistoryEntry 
} from '@/types'

export class CreditService {
 
 async getWalletBalance(userId: string): Promise<WalletBalance> {
 const balance = await transactionRepository.getUserWalletBalance(userId)

 const { total: pendingTransactions } = await transactionRepository.findMany(
 { userId, status: 'pending' },
 { limit: 1 }
 )

 return {
 balance,
 lastUpdated: new Date(),
 pendingTransactions
 }
 }

 async checkSufficientCredits(userId: string, creditsCost: number): Promise<{
 sufficient: boolean
 balance: number
 error?: InsufficientCreditsError
 }> {
 const balance = await transactionRepository.getUserWalletBalance(userId)
 
 if (balance >= creditsCost) {
 return { sufficient: true, balance }
 }

 return {
 sufficient: false,
 balance,
 error: {
 required: creditsCost,
 available: balance,
 shortfall: creditsCost - balance
 }
 }
 }

 async deductCreditsForVideo(
 userId: string, 
 videoId: string
 ): Promise<CreditDeductionResult> {
 try {

 const video = await videoRepository.findById(videoId)
 if (!video) {
 return {
 success: false,
 newBalance: 0,
 error: 'Video not found'
 }
 }

 if (!video.isActive) {
 return {
 success: false,
 newBalance: 0,
 error: 'Video is not available'
 }
 }

 const creditsCost = parseFloat(video.creditCost.toString())

 const creditCheck = await this.checkSufficientCredits(userId, creditsCost)
 if (!creditCheck.sufficient) {
 return {
 success: false,
 newBalance: creditCheck.balance,
 error: `Insufficient credits. Required: ${creditsCost}, Available: ${creditCheck.balance}`
 }
 }

 const viewTransaction = await transactionRepository.createVideoView(
 userId,
 videoId,
 video.creatorId,
 creditsCost
 )

 await transactionRepository.createCreatorEarning(
 video.creatorId,
 videoId,
 creditsCost,
 { viewTransactionId: viewTransaction.id }
 )

 await videoRepository.incrementViewCount(videoId)
 await videoRepository.updateEarnings(videoId, creditsCost)

 const creatorProfile = await userRepository.findById(video.creatorId)
 if (creatorProfile?.creatorProfile) {
 await userRepository.updateCreatorProfile(video.creatorId, {
 totalEarnings: (parseFloat(creatorProfile.creatorProfile.totalEarnings.toString()) + creditsCost).toString(),
 totalViews: creatorProfile.creatorProfile.totalViews + 1
 })
 }

 const newBalance = await transactionRepository.getUserWalletBalance(userId)

 return {
 success: true,
 newBalance,
 transactionId: viewTransaction.id
 }
 } catch (error) {
 console.error('Error deducting credits:', error)
 return {
 success: false,
 newBalance: 0,
 error: 'Failed to process payment'
 }
 }
 }

 async createViewingSession(
 userId: string,
 videoId: string,
 transactionId: string
 ): Promise<ViewingSession> {
 const video = await videoRepository.findById(videoId)
 const creditsCost = video ? parseFloat(video.creditCost.toString()) : 0

 return {
 videoId,
 userId,
 creditsCost,
 startedAt: new Date(),
 transactionId
 }
 }

 async completeViewingSession(
 session: ViewingSession
 ): Promise<ViewingSession> {
 return {
 ...session,
 completedAt: new Date()
 }
 }

 async getViewingHistory(
 userId: string,
 page: number = 1,
 limit: number = 20
 ): Promise<{ history: ViewingHistoryEntry[]; total: number }> {
 const { transactions, total } = await transactionRepository.findMany(
 { 
 userId, 
 type: 'video_view',
 status: 'completed'
 },
 { 
 page, 
 limit, 
 sortBy: 'createdAt', 
 sortOrder: 'desc' 
 }
 )

 const history: ViewingHistoryEntry[] = []

 for (const transaction of transactions) {
 if (transaction.videoId && transaction.video) {
 const video = await videoRepository.findById(transaction.videoId)
 
 if (video) {
 history.push({
 id: transaction.id,
 videoId: transaction.videoId,
 video: {
 id: video.id,
 title: video.title,
 thumbnailUrl: video.thumbnailUrl,
 duration: video.duration,
 creator: {
 username: video.creator.username,
 displayName: video.creator.username // Using username as displayName fallback
 }
 },
 creditsCost: parseFloat(transaction.amount),
 watchedAt: transaction.createdAt,
 transactionId: transaction.id
 })
 }
 }
 }

 return { history, total }
 }

 async hasUserWatchedVideo(userId: string, videoId: string): Promise<boolean> {
 const { transactions } = await transactionRepository.findMany(
 {
 userId,
 videoId,
 type: 'video_view',
 status: 'completed'
 },
 { limit: 1 }
 )

 return transactions.length > 0
 }

 async updateMemberWatchHistory(userId: string, videoId: string): Promise<void> {
 const user = await userRepository.findById(userId)
 if (!user?.memberProfile) return

 const currentHistory = user.memberProfile.watchHistory || []

 if (!currentHistory.includes(videoId)) {
 const updatedHistory = [videoId, ...currentHistory].slice(0, 100) // Keep last 100 videos
 
 await userRepository.updateMemberProfile(userId, {
 watchHistory: updatedHistory
 })
 }
 }

 async getRealTimeBalance(userId: string): Promise<number> {
 return await transactionRepository.getUserWalletBalance(userId)
 }
}

export const creditService = new CreditService()