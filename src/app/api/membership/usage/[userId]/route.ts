import { NextRequest, NextResponse } from 'next/server'
import { userRepository } from '@/lib/database/repositories/users'
import { transactionRepository } from '@/lib/database/repositories/transactions'
import { exclusiveContentService } from '@/lib/services/exclusiveContentService'

export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ userId: string }> }
) {
 try {
 const { userId } = await params
 const { searchParams } = new URL(request.url)
 const period = searchParams.get('period') || 'month'

 if (!userId) {
 return NextResponse.json(
 { error: 'User ID is required' },
 { status: 400 }
 )
 }

 const user = await userRepository.findById(userId)
 if (!user || !user.memberProfile) {
 return NextResponse.json(
 { error: 'User not found or not a member' },
 { status: 404 }
 )
 }

 const now = new Date()
 let startDate: Date

 switch (period) {
 case 'year':
 startDate = new Date(now.getFullYear(), 0, 1) // Start of current year
 break
 case 'month':
 default:
 startDate = new Date(now.getFullYear(), now.getMonth(), 1) // Start of current month
 break
 }

 const viewingTransactions = await transactionRepository.findByUserAndDateRange(
 userId,
 startDate,
 now,
 'video_view'
 )

 const videosWatched = viewingTransactions.length
 const creditsUsed = viewingTransactions.reduce((total, transaction) => {
 return total + parseFloat(transaction.amount)
 }, 0)

 let watchTime = 0
 let exclusiveContentAccessed = 0

 for (const transaction of viewingTransactions) {

 const metadata = transaction.metadata as any
 if (metadata?.watchTime) {
 watchTime += metadata.watchTime
 } else {

 watchTime += 5 // 5 minutes average
 }

 if (metadata?.isExclusive || (transaction.videoId && exclusiveContentService.isExclusiveContent(transaction.videoId))) {
 exclusiveContentAccessed++
 }
 }

 const usageStats = {
 videosWatched,
 watchTime,
 creditsUsed,
 exclusiveContentAccessed
 }

 return NextResponse.json(usageStats)
 } catch (error) {
 console.error('Error fetching usage statistics:', error)
 return NextResponse.json(
 { error: 'Failed to fetch usage statistics' },
 { status: 500 }
 )
 }
}