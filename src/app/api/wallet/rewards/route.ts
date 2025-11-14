import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { transactionRepository } from '@/lib/database/repositories/transactions'
import { userRepository } from '@/lib/database/repositories/users'

interface RewardTask {
 id: string
 title: string
 description: string
 reward: number
 type: 'daily' | 'weekly' | 'achievement' | 'referral'
 completed: boolean
 progress?: {
 current: number
 target: number
 }
 expiresAt?: Date
 completedAt?: Date
}

export async function GET(request: NextRequest) {
 try {
 const { userId } = await auth()
 
 if (!userId) {
 return NextResponse.json(
 { error: 'Unauthorized' },
 { status: 401 }
 )
 }

 const user = await userRepository.findByClerkId(userId)
 if (!user) {
 return NextResponse.json(
 { error: 'User not found' },
 { status: 404 }
 )
 }

 const { transactions } = await transactionRepository.findMany(
 { userId: user.id },
 { limit: 1000, sortBy: 'createdAt', sortOrder: 'desc' }
 )

 const today = new Date()
 const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

 const hasLoginToday = true // User is currently logged in

 const videoViewsToday = transactions.filter(t => 
 t.type === 'video_view' && 
 t.status === 'completed' &&
 new Date(t.createdAt) >= todayStart
 ).length

 const hasSharedVideo = false // This would need to be tracked separately

 const hasCreditPurchase = transactions.some(t => 
 t.type === 'credit_purchase' && 
 t.status === 'completed'
 )

 const loginStreak = 3 // This would be calculated from login history

 const tasks: RewardTask[] = [
 {
 id: 'daily-login',
 title: 'Daily Login',
 description: 'Log in to the app every day',
 reward: 5,
 type: 'daily',
 completed: hasLoginToday,
 completedAt: hasLoginToday ? today : undefined
 },
 {
 id: 'watch-videos',
 title: 'Watch 3 Videos',
 description: 'Watch at least 3 videos today',
 reward: 10,
 type: 'daily',
 completed: videoViewsToday >= 3,
 progress: {
 current: videoViewsToday,
 target: 3
 }
 },
 {
 id: 'share-video',
 title: 'Share a Video',
 description: 'Share any video with friends',
 reward: 8,
 type: 'daily',
 completed: hasSharedVideo
 },
 {
 id: 'weekly-streak',
 title: '7-Day Login Streak',
 description: 'Log in for 7 consecutive days',
 reward: 50,
 type: 'weekly',
 completed: loginStreak >= 7,
 progress: {
 current: loginStreak,
 target: 7
 }
 },
 {
 id: 'first-purchase',
 title: 'First Purchase',
 description: 'Make your first credit purchase',
 reward: 25,
 type: 'achievement',
 completed: hasCreditPurchase
 },
 {
 id: 'refer-friend',
 title: 'Refer a Friend',
 description: 'Invite a friend to join Crensa',
 reward: 100,
 type: 'referral',
 completed: false // This would need referral tracking
 }
 ]

 const completedTasks = tasks.filter(t => t.completed)
 const totalEarned = completedTasks.reduce((sum, task) => sum + task.reward, 0)
 const availableToday = tasks
 .filter(t => t.type === 'daily' && !t.completed)
 .reduce((sum, task) => sum + task.reward, 0)

 const stats = {
 totalEarned,
 availableToday,
 streakDays: loginStreak,
 completedTasks: completedTasks.length
 }

 return NextResponse.json({
 tasks,
 stats
 })
 } catch (error) {
 console.error('Error fetching rewards:', error)
 return NextResponse.json(
 { error: 'Internal server error' },
 { status: 500 }
 )
 }
}

export async function POST(request: NextRequest) {
 try {
 const { userId } = await auth()
 
 if (!userId) {
 return NextResponse.json(
 { error: 'Unauthorized' },
 { status: 401 }
 )
 }

 const body = await request.json()
 const { taskId } = body

 if (!taskId) {
 return NextResponse.json(
 { error: 'Missing taskId' },
 { status: 400 }
 )
 }

 const user = await userRepository.findByClerkId(userId)
 if (!user) {
 return NextResponse.json(
 { error: 'User not found' },
 { status: 404 }
 )
 }

 const rewardAmounts: Record<string, number> = {
 'daily-login': 5,
 'watch-videos': 10,
 'share-video': 8,
 'weekly-streak': 50,
 'first-purchase': 25,
 'refer-friend': 100
 }

 const rewardAmount = rewardAmounts[taskId]
 if (!rewardAmount) {
 return NextResponse.json(
 { error: 'Invalid task ID' },
 { status: 400 }
 )
 }

 const today = new Date()
 const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
 
 const existingReward = await transactionRepository.findMany(
 {
 userId: user.id,
 type: 'credit_purchase',
 metadata: { rewardTaskId: taskId }
 },
 { limit: 1 }
 )

 if (taskId.startsWith('daily-') && existingReward.transactions.length > 0) {
 const lastClaim = existingReward.transactions[0]
 if (new Date(lastClaim.createdAt) >= todayStart) {
 return NextResponse.json(
 { error: 'Task already completed today' },
 { status: 400 }
 )
 }
 }

 if (!taskId.startsWith('daily-') && existingReward.transactions.length > 0) {
 return NextResponse.json(
 { error: 'Task already completed' },
 { status: 400 }
 )
 }

 const transaction = await transactionRepository.create({
 userId: user.id,
 type: 'credit_purchase',
 amount: rewardAmount.toString(),
 status: 'completed',
 metadata: {
 rewardTaskId: taskId,
 rewardType: 'app_bonus',
 claimedAt: new Date().toISOString()
 }
 })

 return NextResponse.json({
 success: true,
 transaction,
 reward: rewardAmount
 })
 } catch (error) {
 console.error('Error claiming reward:', error)
 return NextResponse.json(
 { error: 'Internal server error' },
 { status: 500 }
 )
 }
}