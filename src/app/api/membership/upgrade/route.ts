import { NextRequest, NextResponse } from 'next/server'
import { userRepository } from '@/lib/database/repositories/users'
import { transactionRepository } from '@/lib/database/repositories/transactions'
import type { MembershipUpgradeRequest, MembershipActivationResponse } from '@/lib/services/membershipService'

export async function POST(request: NextRequest) {
 try {
 const body: MembershipUpgradeRequest = await request.json()
 const { userId, currentPlanId, newPlanId, paymentId } = body

 if (!userId || !currentPlanId || !newPlanId || !paymentId) {
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

 const planPrices: Record<string, number> = {
 'monthly': 299,
 'quarterly': 799,
 'yearly': 2999
 }

 const newDuration = planDurations[newPlanId]
 const newPrice = planPrices[newPlanId]

 if (!newDuration || !newPrice) {
 return NextResponse.json(
 { error: 'Invalid plan ID' },
 { status: 400 }
 )
 }

 const now = new Date()
 const currentExpiry = user.memberProfile.membershipExpiry ? new Date(user.memberProfile.membershipExpiry) : now

 const baseDate = currentExpiry > now ? currentExpiry : now
 const newExpiryDate = new Date(baseDate.getTime() + newDuration * 24 * 60 * 60 * 1000)

 await userRepository.updateMemberProfile(userId, {
 membershipStatus: 'premium',
 membershipExpiry: newExpiryDate,
 })

 await transactionRepository.create({
 userId,
 type: 'membership_upgrade',
 amount: newPrice.toString(),
 razorpayPaymentId: paymentId,
 status: 'completed',
 metadata: {
 currentPlanId,
 newPlanId,
 planName: newPlanId.charAt(0).toUpperCase() + newPlanId.slice(1) + ' Premium',
 duration: newDuration,
 expiryDate: newExpiryDate.toISOString()
 }
 })

 const daysRemaining = Math.ceil((newExpiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

 const response: MembershipActivationResponse = {
 success: true,
 membershipStatus: {
 status: 'premium',
 expiry: newExpiryDate,
 daysRemaining,
 autoRenew: false
 },
 message: 'Membership upgraded successfully'
 }

 return NextResponse.json(response)
 } catch (error) {
 console.error('Error upgrading membership:', error)
 return NextResponse.json(
 { error: 'Failed to upgrade membership' },
 { status: 500 }
 )
 }
}