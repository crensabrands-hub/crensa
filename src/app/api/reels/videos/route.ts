import { NextRequest, NextResponse } from 'next/server'
import { videoRepository } from '@/lib/database/repositories/videos'

export async function GET(request: NextRequest) {
 try {
 const { searchParams } = new URL(request.url)
 const limit = parseInt(searchParams.get('limit') || '20')
 const offset = parseInt(searchParams.get('offset') || '0')
 const category = searchParams.get('category')

 const filters: any = {
 isActive: true
 }

 if (category && category !== 'all') {
 filters.category = category
 }

 const videos = await videoRepository.findMany({
 ...filters,
 orderBy: 'createdAt',
 order: 'desc',
 limit,
 offset,
 includeCreator: true
 })

 return NextResponse.json(videos)
 } catch (error) {
 console.error('Error fetching reels videos:', error)
 return NextResponse.json(
 { error: 'Failed to fetch videos' },
 { status: 500 }
 )
 }
}