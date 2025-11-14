import { NextRequest, NextResponse } from 'next/server'
import { userRepository } from '@/lib/database/repositories/users'
import { db } from '@/lib/database/connection'
import { transactions } from '@/lib/database/schema'
import { eq, and, or, desc } from 'drizzle-orm'

export async function GET(
 _request: NextRequest,
 { params }: { params: Promise<{ userId: string; planId: string }> }
) {
 try {
 const { userId, planId } = await params

 if (!userId || !planId) {
 return NextResponse.json(
 { error: 'User ID and plan ID are required' },
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
 { error: 'Proration calculation is only available for premium members' },
 { status: 400 }
 )
 }

 const planPrices: Record<string, number> = {
 'monthly': 299,
 'quarterly': 799,
 'yearly': 2999
 }

 const planDurations: Record<string, number> = {
 'monthly': 30,
 'quarterly': 90,
 'yearly': 365
 }

 const newPlanPrice = planPrices[planId]
 const newPlanDuration = planDurations[planId]

 if (!newPlanPrice || !newPlanDuration) {
 return NextResponse.json(
 { error: 'Invalid plan ID' },
 { status: 400 }
 )
 }

 const now = new Date()
 const currentExpiry = user.memberProfile.membershipExpiry ? new Date(user.memberProfile.membershipExpiry) : now
 const remainingDays = Math.max(0, Math.ceil((currentExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

 const membershipTransactions = await db
 .select()
 .from(transactions)
 .where(and(
 eq(transactions.userId, userId),
 or(
 eq(transactions.type, 'membership_activation'),
 eq(transactions.type, 'membership_upgrade'),
 eq(transactions.type, 'membership_renewal')
 )
 ))
 .orderBy(desc(transactions.createdAt))
 .limit(1)

 let currentPlanId = 'monthly' // Default fallback
 let currentPlanPrice = planPrices.monthly
 let currentPlanDuration = planDurations.monthly

 if (membershipTransactions.length > 0) {
 const metadata = membershipTransactions[0].metadata as any
 if (metadata?.planId) {
 currentPlanId = metadata.planId
 currentPlanPrice = planPrices[currentPlanId] || planPrices.monthly
 currentPlanDuration = planDurations[currentPlanId] || planDurations.monthly
 }
 }

 const dailyRateCurrentPlan = currentPlanPrice / currentPlanDuration
 const dailyRateNewPlan = newPlanPrice / newPlanDuration

 const creditAmount = Math.round(dailyRateCurrentPlan * remainingDays * 100) / 100

 const chargeAmount = Math.max(0, Math.round((newPlanPrice - creditAmount) * 100) / 100)

 const proratedAmount = Math.round((dailyRateNewPlan - dailyRateCurrentPlan) * remainingDays * 100) / 100

 const nextBillingDate = new Date(now.getTime() + newPlanDuration * 24 * 60 * 60 * 1000)

 const prorationDetails = {
 proratedAmount: Math.round(proratedAmount * 100) / 100, // Round to 2 decimal places
 creditAmount,
 chargeAmount,
 nextBillingDate
 }

 return NextResponse.json(prorationDetails)
 } catch (error) {
 console.error('Error calculating proration:', error)
 return NextResponse.json(
 { error: 'Failed to calculate proration' },
 { status: 500 }
 )
 }
}