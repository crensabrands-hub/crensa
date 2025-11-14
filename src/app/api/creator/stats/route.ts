import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/database';
import { videos, users } from '@/lib/database/schema';
import { eq, and, count, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
 try {
 const { userId } = await auth();
 
 if (!userId) {
 return NextResponse.json(
 { success: false, error: 'Unauthorized' },
 { status: 401 }
 );
 }

 const userProfile = await db
 .select()
 .from(users)
 .where(eq(users.clerkId, userId))
 .limit(1);

 if (!userProfile.length || userProfile[0].role !== 'creator') {
 return NextResponse.json(
 { success: false, error: 'Access denied. Creator role required.' },
 { status: 403 }
 );
 }

 const creatorId = userProfile[0].id;

 const videoCountResult = await db
 .select({ count: count() })
 .from(videos)
 .where(eq(videos.creatorId, creatorId));

 const totalVideos = videoCountResult[0]?.count || 0;

 const draftCountResult = await db
 .select({ count: count() })
 .from(videos)
 .where(and(
 eq(videos.creatorId, creatorId),
 eq(videos.isActive, false)
 ));

 const draftCount = draftCountResult[0]?.count || 0;

 const publishedCount = totalVideos - draftCount;

 const statsQuery = await db
 .select({
 totalViews: sql<number>`COALESCE(SUM(${videos.viewCount}), 0)`,
 totalEarnings: sql<number>`COALESCE(SUM(${videos.totalEarnings}), 0)`,
 })
 .from(videos)
 .where(and(
 eq(videos.creatorId, creatorId),
 eq(videos.isActive, true)
 ));

 const stats = statsQuery[0] || { totalViews: 0, totalEarnings: 0 };

 return NextResponse.json({
 success: true,
 data: {
 totalVideos,
 publishedVideos: publishedCount,
 draftVideos: draftCount,
 totalViews: Number(stats.totalViews),
 totalEarnings: Number(stats.totalEarnings),
 lastUpdated: new Date().toISOString(),
 }
 });

 } catch (error) {
 console.error('Error fetching creator stats:', error);
 return NextResponse.json(
 { success: false, error: 'Internal server error' },
 { status: 500 }
 );
 }
}