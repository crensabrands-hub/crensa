import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/database'
import { videos, users, videoShares } from '@/lib/database/schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function POST(
 request: NextRequest,
 context: { params: Promise<{ id: string }> }
) {
 try {
 const { userId: clerkId } = await auth()
 if (!clerkId) {
 return NextResponse.json(
 { error: 'Unauthorized' },
 { status: 401 }
 )
 }

 const [user] = await db
 .select()
 .from(users)
 .where(eq(users.clerkId, clerkId))
 .limit(1)

 if (!user || user.role !== 'creator') {
 return NextResponse.json(
 { error: 'Only creators can generate share links' },
 { status: 403 }
 )
 }

 const params = await context.params
 const [video] = await db
 .select()
 .from(videos)
 .where(and(
 eq(videos.id, params.id),
 eq(videos.creatorId, user.id)
 ))
 .limit(1)

 if (!video) {
 return NextResponse.json(
 { error: 'Video not found' },
 { status: 404 }
 )
 }

 const body = await request.json()
 const { platform = 'direct' } = body

 const shareToken = nanoid(16)

 const [shareRecord] = await db
 .insert(videoShares)
 .values({
 videoId: video.id,
 creatorId: user.id,
 shareToken,
 platform,
 clickCount: 0,
 viewCount: 0,
 conversionCount: 0,
 isActive: true,
 createdAt: new Date(),
 updatedAt: new Date()
 })
 .returning()

 const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
 const shareUrl = `${baseUrl}/watch/${shareToken}`

 return NextResponse.json({
 success: true,
 shareUrl,
 shareToken,
 analytics: {
 clickCount: 0,
 viewCount: 0,
 conversionCount: 0
 },
 video: {
 id: video.id,
 title: video.title,
 thumbnailUrl: video.thumbnailUrl,
 creditCost: video.creditCost,
 viewCount: video.viewCount
 }
 })

 } catch (error) {
 console.error('Generate share link error:', error)
 return NextResponse.json(
 { error: 'Failed to generate share link' },
 { status: 500 }
 )
 }
}

export async function GET(
 request: NextRequest,
 context: { params: Promise<{ id: string }> }
) {
 try {
 const { userId: clerkId } = await auth()
 if (!clerkId) {
 return NextResponse.json(
 { error: 'Unauthorized' },
 { status: 401 }
 )
 }

 const [user] = await db
 .select()
 .from(users)
 .where(eq(users.clerkId, clerkId))
 .limit(1)

 if (!user || user.role !== 'creator') {
 return NextResponse.json(
 { error: 'Only creators can view share analytics' },
 { status: 403 }
 )
 }

 const params = await context.params
 const [video] = await db
 .select()
 .from(videos)
 .where(and(
 eq(videos.id, params.id),
 eq(videos.creatorId, user.id)
 ))
 .limit(1)

 if (!video) {
 return NextResponse.json(
 { error: 'Video not found' },
 { status: 404 }
 )
 }

 const shares = await db
 .select()
 .from(videoShares)
 .where(and(
 eq(videoShares.videoId, video.id),
 eq(videoShares.creatorId, user.id)
 ))

 const totalAnalytics = shares.reduce((acc, share) => ({
 clickCount: acc.clickCount + share.clickCount,
 viewCount: acc.viewCount + share.viewCount,
 conversionCount: acc.conversionCount + share.conversionCount
 }), { clickCount: 0, viewCount: 0, conversionCount: 0 })

 const platformAnalytics = shares.reduce((acc, share) => {
 const platform = share.platform || 'direct'
 if (!acc[platform]) {
 acc[platform] = { clickCount: 0, viewCount: 0, conversionCount: 0 }
 }
 acc[platform].clickCount += share.clickCount
 acc[platform].viewCount += share.viewCount
 acc[platform].conversionCount += share.conversionCount
 return acc
 }, {} as Record<string, { clickCount: number; viewCount: number; conversionCount: number }>)

 return NextResponse.json({
 success: true,
 video: {
 id: video.id,
 title: video.title,
 thumbnailUrl: video.thumbnailUrl,
 creditCost: video.creditCost,
 viewCount: video.viewCount
 },
 totalAnalytics,
 platformAnalytics,
 shares: shares.map(share => ({
 id: share.id,
 shareToken: share.shareToken,
 platform: share.platform,
 clickCount: share.clickCount,
 viewCount: share.viewCount,
 conversionCount: share.conversionCount,
 lastAccessedAt: share.lastAccessedAt,
 createdAt: share.createdAt
 }))
 })

 } catch (error) {
 console.error('Get share analytics error:', error)
 return NextResponse.json(
 { error: 'Failed to get share analytics' },
 { status: 500 }
 )
 }
}