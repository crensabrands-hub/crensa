import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { creditService } from '@/lib/services/creditService'
import { userRepository } from '@/lib/database/repositories/users'

export async function GET(request: NextRequest) {
 try {
 const { userId } = await auth()
 
 if (!userId) {
 return NextResponse.json(
 { error: 'Unauthorized' },
 { status: 401 }
 )
 }

 const user = await userRepository.findByClerkId(userId)
 if (!user) {
 return NextResponse.json(
 { error: 'User not found' },
 { status: 404 }
 )
 }

 const url = new URL(request.url)
 const page = parseInt(url.searchParams.get('page') || '1')
 const limit = parseInt(url.searchParams.get('limit') || '20')

 const { history, total } = await creditService.getViewingHistory(
 user.id,
 page,
 limit
 )

 return NextResponse.json({
 history,
 total,
 page,
 limit,
 totalPages: Math.ceil(total / limit)
 })
 } catch (error) {
 console.error('Error fetching viewing history:', error)
 return NextResponse.json(
 { error: 'Internal server error' },
 { status: 500 }
 )
 }
}