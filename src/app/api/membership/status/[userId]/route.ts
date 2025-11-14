import { NextRequest, NextResponse } from 'next/server'
import { userRepository } from '@/lib/database/repositories/users'
import type { MembershipStatus } from '@/types'

export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ userId: string }> }
) {
 try {
 const { userId } = await params

 if (!userId) {
 return NextResponse.json(
 { error: 'User ID is required' },
 { status: 400 }
 )
 }

 const user = await userRepository.findById(userId)
 
 if (!user) {
 return NextResponse.json(
 { error: 'User not found' },
 { status: 404 }
 )
 }

 if (!user.memberProfile) {
 return NextResponse.json(
 { error: 'User is not a member' },
 { status: 400 }
 )
 }

 const memberProfile = user.memberProfile

 let daysRemaining: number | undefined
 if (memberProfile.membershipStatus === 'premium' && memberProfile.membershipExpiry) {
 const expiryDate = new Date(memberProfile.membershipExpiry)
 const now = new Date()
 daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
 }

 const membershipStatus: MembershipStatus = {
 status: memberProfile.membershipStatus,
 expiry: memberProfile.membershipExpiry ? new Date(memberProfile.membershipExpiry) : undefined,
 daysRemaining,
 autoRenew: memberProfile.autoRenew,
 }

 return NextResponse.json(membershipStatus)
 } catch (error) {
 console.error('Error fetching membership status:', error)
 return NextResponse.json(
 { error: 'Failed to fetch membership status' },
 { status: 500 }
 )
 }
}