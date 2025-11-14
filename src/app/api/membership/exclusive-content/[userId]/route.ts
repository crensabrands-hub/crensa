import { NextRequest, NextResponse } from 'next/server'
import { userRepository } from '@/lib/database/repositories/users'
import { exclusiveContentService } from '@/lib/services/exclusiveContentService'

export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ userId: string }> }
) {
 try {
 const { userId } = await params
 const { searchParams } = new URL(request.url)
 const category = searchParams.get('category')

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

 const exclusiveContent = await exclusiveContentService.getExclusiveContent(category || undefined)

 return NextResponse.json(exclusiveContent)
 } catch (error) {
 console.error('Error fetching exclusive content:', error)
 return NextResponse.json(
 { error: 'Failed to fetch exclusive content' },
 { status: 500 }
 )
 }
}