import { NextRequest, NextResponse } from 'next/server'
import { userRepository } from '@/lib/database/repositories/users'
import { videoRepository } from '@/lib/database/repositories/videos'
import { exclusiveContentService } from '@/lib/services/exclusiveContentService'

export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ userId: string; contentId: string }> }
) {
 try {
 const { userId, contentId } = await params

 if (!userId || !contentId) {
 return NextResponse.json(
 { error: 'User ID and Content ID are required' },
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
 { hasAccess: false, reason: 'User is not a member' }
 )
 }

 const memberProfile = user.memberProfile

 const video = await videoRepository.findById(contentId)
 let requiresPremium = false

 if (video) {

 requiresPremium = parseFloat(video.creditCost) >= 10
 } else {

 if (exclusiveContentService.isExclusiveContent(contentId)) {
 requiresPremium = true
 } else {
 return NextResponse.json(
 { hasAccess: false, reason: 'Content not found' },
 { status: 404 }
 )
 }
 }

 if (!requiresPremium) {
 return NextResponse.json({
 hasAccess: true
 })
 }

 if (memberProfile.membershipStatus !== 'premium') {
 return NextResponse.json({
 hasAccess: false,
 reason: 'Premium membership required'
 })
 }

 if (memberProfile.membershipExpiry) {
 const expiryDate = new Date(memberProfile.membershipExpiry)
 const now = new Date()
 
 if (now > expiryDate) {
 return NextResponse.json({
 hasAccess: false,
 reason: 'Membership has expired'
 })
 }
 }

 return NextResponse.json({
 hasAccess: true
 })
 } catch (error) {
 console.error('Error checking content access:', error)
 return NextResponse.json(
 { error: 'Failed to check content access' },
 { status: 500 }
 )
 }
}