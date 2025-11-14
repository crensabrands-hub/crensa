import { NextRequest, NextResponse } from 'next/server'
import { userRepository } from '@/lib/database/repositories/users'
import { transactionRepository } from '@/lib/database/repositories/transactions'
import type { MembershipCancellationRequest } from '@/lib/services/membershipService'

export async function POST(request: NextRequest) {
 try {
 const body: MembershipCancellationRequest = await request.json()
 const { userId, reason, feedback } = body

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

 if (user.memberProfile.membershipStatus !== 'premium') {
 return NextResponse.json(
 { error: 'User does not have an active premium membership' },
 { status: 400 }
 )
 }

 await userRepository.updateMemberProfile(userId, {
 autoRenew: false,
 })

 const now = new Date()
 const membershipExpiry = user.memberProfile.membershipExpiry
 
 if (!membershipExpiry || membershipExpiry <= now) {
 await userRepository.updateMemberProfile(userId, {
 membershipStatus: 'free',
 membershipExpiry: null,
 })
 }

 await transactionRepository.create({
 userId,
 type: 'membership_cancellation',
 amount: '0.00',
 status: 'completed',
 metadata: {
 reason: reason || 'User requested cancellation',
 feedback: feedback || null,
 cancelledAt: new Date().toISOString()
 }
 })

 return NextResponse.json({
 success: true,
 message: 'Membership cancelled successfully'
 })
 } catch (error) {
 console.error('Error cancelling membership:', error)
 return NextResponse.json(
 { error: 'Failed to cancel membership' },
 { status: 500 }
 )
 }
}