import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { creditService } from '@/lib/services/creditService'
import { userRepository } from '@/lib/database/repositories/users'

export async function POST(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
 const { userId } = await auth()
 
 if (!userId) {
 return NextResponse.json(
 { error: 'Unauthorized' },
 { status: 401 }
 )
 }

 const { id: videoId } = await params

 const user = await userRepository.findByClerkId(userId)
 if (!user) {
 return NextResponse.json(
 { error: 'User not found' },
 { status: 404 }
 )
 }

 if (user.role !== 'member') {
 return NextResponse.json(
 { error: 'Only members can watch videos' },
 { status: 403 }
 )
 }

 const hasWatched = await creditService.hasUserWatchedVideo(user.id, videoId)
 if (hasWatched) {
 return NextResponse.json({
 success: true,
 message: 'Video already watched',
 alreadyWatched: true
 })
 }

 const result = await creditService.deductCreditsForVideo(user.id, videoId)

 if (!result.success) {
 return NextResponse.json(
 { 
 error: result.error,
 balance: result.newBalance,
 success: false
 },
 { status: 400 }
 )
 }

 await creditService.updateMemberWatchHistory(user.id, videoId)

 const viewingSession = await creditService.createViewingSession(
 user.id,
 videoId,
 result.transactionId!
 )

 return NextResponse.json({
 success: true,
 newBalance: result.newBalance,
 transactionId: result.transactionId,
 viewingSession,
 message: 'Credits deducted successfully'
 })
 } catch (error) {
 console.error('Error processing video watch:', error)
 return NextResponse.json(
 { error: 'Internal server error' },
 { status: 500 }
 )
 }
}