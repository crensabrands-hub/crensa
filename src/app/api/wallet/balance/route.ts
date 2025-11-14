import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { creditService } from '@/lib/services/creditService'
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

 const walletBalance = await creditService.getWalletBalance(user.id)

 return NextResponse.json(walletBalance)
 } catch (error) {
 console.error('Error fetching wallet balance:', error)
 return NextResponse.json(
 { error: 'Internal server error' },
 { status: 500 }
 )
 }
}