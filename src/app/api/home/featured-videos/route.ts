import { NextRequest, NextResponse } from 'next/server'
import { videoRepository } from '@/lib/database/repositories/videos'

export async function GET(request: NextRequest) {
 try {
 const { searchParams } = new URL(request.url)
 const limit = parseInt(searchParams.get('limit') || '6')

 const result = await videoRepository.findMany(
 { isActive: true },
 { 
 sortBy: 'viewCount',
 sortOrder: 'desc',
 limit
 }
 )

 return NextResponse.json(result.videos)
 } catch (error) {
 console.error('Error fetching featured videos:', error)
 return NextResponse.json(
 { error: 'Failed to fetch featured videos' },
 { status: 500 }
 )
 }
}