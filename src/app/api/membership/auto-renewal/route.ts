import { NextRequest, NextResponse } from 'next/server'
import { userRepository } from '@/lib/database/repositories/users'

export async function POST(request: NextRequest) {
 try {
 const body = await request.json()
 const { userId, enabled } = body

 if (!userId || typeof enabled !== 'boolean') {
 return NextResponse.json(
 { error: 'User ID and enabled status are required' },
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
 { error: 'Auto-renewal is only available for premium members' },
 { status: 400 }
 )
 }

 await userRepository.updateMemberProfile(userId, {
 autoRenew: enabled
 })

 return NextResponse.json({
 success: true,
 message: enabled ? 'Auto-renewal enabled' : 'Auto-renewal disabled'
 })
 } catch (error) {
 console.error('Error toggling auto-renewal:', error)
 return NextResponse.json(
 { error: 'Failed to toggle auto-renewal' },
 { status: 500 }
 )
 }
}