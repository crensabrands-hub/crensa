import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { coinTransactionService } from '@/lib/services/coinTransactionService'
import { userRepository } from '@/lib/database/repositories/users'

export async function GET(request: NextRequest) {
 try {
 const { userId: clerkUserId } = await auth()
 
 if (!clerkUserId) {
 return NextResponse.json(
 { error: 'Unauthorized' },
 { status: 401 }
 )
 }

 const user = await userRepository.findByClerkId(clerkUserId)
 
 if (!user) {
 return NextResponse.json(
 { error: 'User not found' },
 { status: 404 }
 )
 }

 const balanceInfo = await coinTransactionService.getCoinBalanceInfo(user.id)

 return NextResponse.json({
 balance: balanceInfo.balance,
 totalPurchased: balanceInfo.totalPurchased,
 totalSpent: balanceInfo.totalSpent,
 lastUpdated: balanceInfo.lastUpdated
 })
 } catch (error) {
 console.error('Error fetching coin balance:', error)
 return NextResponse.json(
 { error: 'Internal server error' },
 { status: 500 }
 )
 }
}
