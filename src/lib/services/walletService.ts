

import { transactionRepository } from '../database/repositories/transactions'
import { userRepository } from '../database/repositories/users'
import type { WalletBalance } from '@/types'

export class WalletService {
 private static instance: WalletService
 private balanceUpdateCallbacks: Map<string, ((balance: WalletBalance) => void)[]> = new Map()

 public static getInstance(): WalletService {
 if (!WalletService.instance) {
 WalletService.instance = new WalletService()
 }
 return WalletService.instance
 }

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

 subscribeToBalanceUpdates(userId: string, callback: (balance: WalletBalance) => void): () => void {
 const callbacks = this.balanceUpdateCallbacks.get(userId) || []
 callbacks.push(callback)
 this.balanceUpdateCallbacks.set(userId, callbacks)

 return () => {
 const currentCallbacks = this.balanceUpdateCallbacks.get(userId) || []
 const index = currentCallbacks.indexOf(callback)
 if (index > -1) {
 currentCallbacks.splice(index, 1)
 if (currentCallbacks.length === 0) {
 this.balanceUpdateCallbacks.delete(userId)
 } else {
 this.balanceUpdateCallbacks.set(userId, currentCallbacks)
 }
 }
 }
 }

 async notifyBalanceUpdate(userId: string): Promise<void> {
 const callbacks = this.balanceUpdateCallbacks.get(userId)
 if (!callbacks || callbacks.length === 0) return

 try {
 const balance = await this.getWalletBalance(userId)
 callbacks.forEach(callback => {
 try {
 callback(balance)
 } catch (error) {
 console.error('Error in balance update callback:', error)
 }
 })
 } catch (error) {
 console.error('Error getting balance for notification:', error)
 }
 }

 async addCredits(
 userId: string, 
 amount: number, 
 source: 'purchase' | 'reward' | 'bonus',
 metadata?: any
 ): Promise<{ success: boolean; newBalance: number; transactionId?: string }> {
 try {

 const user = await userRepository.findById(userId)
 if (!user) {
 return { success: false, newBalance: 0 }
 }

 const transaction = await transactionRepository.create({
 userId,
 type: 'credit_purchase',
 amount: amount.toString(),
 status: 'completed',
 metadata: {
 source,
 addedAt: new Date().toISOString(),
 ...metadata
 }
 })

 const newBalance = await transactionRepository.getUserWalletBalance(userId)

 await this.notifyBalanceUpdate(userId)

 return {
 success: true,
 newBalance,
 transactionId: transaction.id
 }
 } catch (error) {
 console.error('Error adding credits:', error)
 return { success: false, newBalance: 0 }
 }
 }

 async deductCredits(
 userId: string,
 amount: number,
 videoId: string,
 creatorId: string
 ): Promise<{ success: boolean; newBalance: number; transactionId?: string }> {
 try {

 const currentBalance = await transactionRepository.getUserWalletBalance(userId)
 if (currentBalance < amount) {
 return { success: false, newBalance: currentBalance }
 }

 const transaction = await transactionRepository.createVideoView(
 userId,
 videoId,
 creatorId,
 amount
 )

 const newBalance = await transactionRepository.getUserWalletBalance(userId)

 await this.notifyBalanceUpdate(userId)

 return {
 success: true,
 newBalance,
 transactionId: transaction.id
 }
 } catch (error) {
 console.error('Error deducting credits:', error)
 return { success: false, newBalance: 0 }
 }
 }

 async getTransactionHistory(
 userId: string,
 page: number = 1,
 limit: number = 20,
 filters?: {
 type?: 'credit_purchase' | 'video_view'
 status?: 'pending' | 'completed' | 'failed'
 startDate?: Date
 endDate?: Date
 }
 ) {
 return await transactionRepository.findMany(
 {
 userId,
 ...filters
 },
 {
 page,
 limit,
 sortBy: 'createdAt',
 sortOrder: 'desc'
 }
 )
 }

 async getWalletStats(userId: string): Promise<{
 totalSpent: number
 totalPurchased: number
 transactionCount: number
 averageTransaction: number
 }> {
 const { transactions } = await transactionRepository.findMany(
 { userId },
 { limit: 1000 }
 )

 const purchases = transactions.filter(t => t.type === 'credit_purchase' && t.status === 'completed')
 const views = transactions.filter(t => t.type === 'video_view' && t.status === 'completed')

 const totalPurchased = purchases.reduce((sum, t) => sum + parseFloat(t.amount), 0)
 const totalSpent = views.reduce((sum, t) => sum + parseFloat(t.amount), 0)
 const transactionCount = transactions.length
 const averageTransaction = transactionCount > 0 ? (totalPurchased + totalSpent) / transactionCount : 0

 return {
 totalSpent,
 totalPurchased,
 transactionCount,
 averageTransaction
 }
 }

 async claimReward(
 userId: string,
 taskId: string,
 rewardAmount: number
 ): Promise<{ success: boolean; newBalance: number; transactionId?: string }> {
 return await this.addCredits(userId, rewardAmount, 'reward', {
 taskId,
 rewardType: 'app_bonus'
 })
 }

 async getPendingTransactions(userId: string) {
 return await transactionRepository.findMany(
 { userId, status: 'pending' },
 { limit: 100, sortBy: 'createdAt', sortOrder: 'desc' }
 )
 }

 async cancelPendingTransaction(userId: string, transactionId: string): Promise<boolean> {
 try {
 const transaction = await transactionRepository.findById(transactionId)
 if (!transaction || transaction.userId !== userId || transaction.status !== 'pending') {
 return false
 }

 await transactionRepository.updateStatus(transactionId, 'failed')
 await this.notifyBalanceUpdate(userId)
 
 return true
 } catch (error) {
 console.error('Error canceling transaction:', error)
 return false
 }
 }
}

export const walletService = WalletService.getInstance()