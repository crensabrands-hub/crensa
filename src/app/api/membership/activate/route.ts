import { NextRequest, NextResponse } from 'next/server'
import { userRepository } from '@/lib/database/repositories/users'
import { transactionRepository } from '@/lib/database/repositories/transactions'
import type { MembershipActivationRequest, MembershipActivationResponse } from '@/lib/services/membershipService'

export async function POST(request: NextRequest) {
 try {
 const body: MembershipActivationRequest = await request.json()
 const { userId, planId, paymentId, orderId } = body

 if (!userId || !planId || !paymentId || !orderId) {
 return NextResponse.json(
 { error: 'Missing required fields' },
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

 const planDurations: Record<string, number> = {
 'monthly': 30,
 'quarterly': 90,
 'yearly': 365
 }

 const duration = planDurations[planId]
 if (!duration) {
 return NextResponse.json(
 { error: 'Invalid plan ID' },
 { status: 400 }
 )
 }

 const now = new Date()
 const expiryDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000)

 await userRepository.updateMemberProfile(userId, {
 membershipStatus: 'premium',
 membershipExpiry: expiryDate,
 })

 const planPrices: Record<string, number> = {
 'monthly': 299,
 'quarterly': 799,
 'yearly': 2999
 }

 await transactionRepository.create({
 userId,
 type: 'membership_activation',
 amount: planPrices[planId].toString(),
 razorpayPaymentId: paymentId,
 razorpayOrderId: orderId,
 status: 'completed',
 metadata: {
 planId,
 planName: planId.charAt(0).toUpperCase() + planId.slice(1) + ' Premium',
 duration,
 expiryDate: expiryDate.toISOString()
 }
 })

 const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

 const response: MembershipActivationResponse = {
 success: true,
 membershipStatus: {
 status: 'premium',
 expiry: expiryDate,
 daysRemaining,
 autoRenew: false
 },
 message: 'Membership activated successfully'
 }

 return NextResponse.json(response)
 } catch (error) {
 console.error('Error activating membership:', error)
 return NextResponse.json(
 { error: 'Failed to activate membership' },
 { status: 500 }
 )
 }
}