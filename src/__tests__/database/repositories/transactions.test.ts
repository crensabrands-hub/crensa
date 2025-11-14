

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { transactionRepository, userRepository, videoRepository } from '@/lib/database/repositories'
import { testDatabaseConnection, closeDatabaseConnection } from '@/lib/database/connection'

describe('TransactionRepository Integration Tests', () => {
 let testUserId: string
 let testCreatorId: string
 let testVideoId: string

 beforeAll(async () => {

 const isConnected = await testDatabaseConnection()
 if (!isConnected) {
 throw new Error('Database connection failed')
 }

 const user = await userRepository.create({
 clerkId: 'test_transaction_user',
 email: 'transactionuser@example.com',
 username: 'transactionuser',
 role: 'member'
 })
 testUserId = user.id

 const creator = await userRepository.create({
 clerkId: 'test_transaction_creator',
 email: 'transactioncreator@example.com',
 username: 'transactioncreator',
 role: 'creator'
 })
 testCreatorId = creator.id

 const video = await videoRepository.create({
 creatorId: testCreatorId,
 title: 'Transaction Test Video',
 videoUrl: 'https://example.com/test.mp4',
 thumbnailUrl: 'https://example.com/test-thumb.jpg',
 duration: 120,
 creditCost: '2.50',
 category: 'Test'
 })
 testVideoId = video.id
 })

 afterAll(async () => {
 await closeDatabaseConnection()
 })

 describe('Transaction CRUD Operations', () => {
 let testTransactionId: string

 it('should create a new transaction', async () => {
 const transactionData = {
 userId: testUserId,
 type: 'credit_purchase' as const,
 amount: '25.00',
 razorpayPaymentId: 'pay_test_123',
 razorpayOrderId: 'order_test_123',
 status: 'completed' as const
 }

 const transaction = await transactionRepository.create(transactionData)

 expect(transaction).toBeDefined()
 expect(transaction.userId).toBe(testUserId)
 expect(transaction.type).toBe('credit_purchase')
 expect(transaction.amount).toBe('25.00')
 expect(transaction.status).toBe('completed')

 testTransactionId = transaction.id
 })

 it('should find transaction by ID', async () => {
 const transaction = await transactionRepository.findById(testTransactionId)

 expect(transaction).toBeDefined()
 expect(transaction?.id).toBe(testTransactionId)
 expect(transaction?.user).toBeDefined()
 expect(transaction?.user?.username).toBe('transactionuser')
 })

 it('should find transaction by Razorpay payment ID', async () => {
 const transaction = await transactionRepository.findByRazorpayPaymentId('pay_test_123')

 expect(transaction).toBeDefined()
 expect(transaction?.razorpayPaymentId).toBe('pay_test_123')
 })

 it('should find transactions with filters', async () => {
 const result = await transactionRepository.findMany({
 userId: testUserId,
 type: 'credit_purchase',
 status: 'completed'
 })

 expect(result.transactions).toBeDefined()
 expect(result.transactions.length).toBeGreaterThan(0)
 expect(result.total).toBeGreaterThan(0)
 expect(result.transactions[0].user).toBeDefined()
 })

 it('should update transaction', async () => {
 const updatedTransaction = await transactionRepository.update(testTransactionId, {
 metadata: { source: 'test' }
 })

 expect(updatedTransaction).toBeDefined()
 expect(updatedTransaction?.metadata).toEqual({ source: 'test' })
 })

 it('should update transaction status', async () => {
 const updatedTransaction = await transactionRepository.updateStatus(testTransactionId, 'failed')

 expect(updatedTransaction).toBeDefined()
 expect(updatedTransaction?.status).toBe('failed')
 })
 })

 describe('Wallet and Earnings Operations', () => {
 beforeEach(async () => {

 await transactionRepository.create({
 userId: testUserId,
 type: 'credit_purchase',
 amount: '50.00',
 status: 'completed'
 })

 await transactionRepository.create({
 userId: testUserId,
 type: 'video_view',
 amount: '2.50',
 videoId: testVideoId,
 creatorId: testCreatorId,
 status: 'completed'
 })

 await transactionRepository.create({
 userId: testCreatorId,
 type: 'creator_earning',
 amount: '2.50',
 videoId: testVideoId,
 creatorId: testCreatorId,
 status: 'completed'
 })
 })

 it('should calculate user wallet balance', async () => {
 const balance = await transactionRepository.getUserWalletBalance(testUserId)

 expect(balance).toBeGreaterThan(0)

 expect(balance).toBe(47.50)
 })

 it('should calculate creator earnings', async () => {
 const earnings = await transactionRepository.getCreatorEarnings(testCreatorId)

 expect(earnings).toBeGreaterThan(0)
 expect(earnings).toBe(2.50)
 })

 it('should get earnings by date range', async () => {
 const startDate = new Date()
 startDate.setDate(startDate.getDate() - 1)
 const endDate = new Date()
 endDate.setDate(endDate.getDate() + 1)

 const earnings = await transactionRepository.getEarningsByDateRange(
 testCreatorId,
 startDate,
 endDate
 )

 expect(earnings).toBeDefined()
 expect(earnings.length).toBeGreaterThan(0)
 })
 })

 describe('Transaction Creation Helpers', () => {
 it('should create credit purchase transaction', async () => {
 const transaction = await transactionRepository.createCreditPurchase(
 testUserId,
 30.00,
 'pay_helper_test',
 'order_helper_test'
 )

 expect(transaction).toBeDefined()
 expect(transaction.type).toBe('credit_purchase')
 expect(transaction.amount).toBe('30')
 expect(transaction.status).toBe('completed')
 })

 it('should create video view transaction', async () => {
 const transaction = await transactionRepository.createVideoView(
 testUserId,
 testVideoId,
 testCreatorId,
 3.00
 )

 expect(transaction).toBeDefined()
 expect(transaction.type).toBe('video_view')
 expect(transaction.amount).toBe('3')
 expect(transaction.videoId).toBe(testVideoId)
 expect(transaction.creatorId).toBe(testCreatorId)
 })

 it('should create creator earning transaction', async () => {
 const transaction = await transactionRepository.createCreatorEarning(
 testCreatorId,
 testVideoId,
 3.00,
 { source: 'video_view' }
 )

 expect(transaction).toBeDefined()
 expect(transaction.type).toBe('creator_earning')
 expect(transaction.amount).toBe('3')
 expect(transaction.metadata).toEqual({ source: 'video_view' })
 })
 })
})