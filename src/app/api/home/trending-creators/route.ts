import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/database/connection'
import { users, creatorProfiles, creatorFollows } from '@/lib/database/schema'
import { desc, eq, and, sql } from 'drizzle-orm'
import { userRepository } from '@/lib/database/repositories/users'

export async function GET(request: NextRequest) {
 try {
 const { searchParams } = new URL(request.url)
 const limit = parseInt(searchParams.get('limit') || '6')

 const { userId: clerkUserId } = await auth()
 let currentUser = null
 
 if (clerkUserId) {
 try {
 currentUser = await userRepository.findByClerkId(clerkUserId)
 } catch (error) {
 console.warn('Could not fetch user for follow status:', error)

 }
 }

 if (currentUser) {

 const trendingCreators = await db
 .select({
 id: users.id,
 username: users.username,
 avatar: users.avatar,
 displayName: creatorProfiles.displayName,
 videoCount: creatorProfiles.videoCount,
 totalViews: creatorProfiles.totalViews,
 totalEarnings: creatorProfiles.totalEarnings,
 isFollowing: sql<boolean>`CASE WHEN ${creatorFollows.id} IS NOT NULL THEN true ELSE false END`,
 })
 .from(users)
 .innerJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
 .leftJoin(
 creatorFollows,
 and(
 eq(creatorFollows.creatorId, users.id),
 eq(creatorFollows.followerId, currentUser.id)
 )
 )
 .where(eq(users.role, 'creator'))
 .orderBy(desc(creatorProfiles.totalViews))
 .limit(limit)

 const formattedCreators = trendingCreators.map(creator => ({
 id: creator.id,
 username: creator.username,
 displayName: creator.displayName,
 avatar: creator.avatar,
 videoCount: creator.videoCount,
 totalViews: creator.totalViews,
 category: 'General', // Default category - can be enhanced with creator categories later
 isFollowing: creator.isFollowing
 }))

 return NextResponse.json(formattedCreators)
 } else {

 const trendingCreators = await db
 .select({
 id: users.id,
 username: users.username,
 avatar: users.avatar,
 displayName: creatorProfiles.displayName,
 videoCount: creatorProfiles.videoCount,
 totalViews: creatorProfiles.totalViews,
 totalEarnings: creatorProfiles.totalEarnings,
 })
 .from(users)
 .innerJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
 .where(eq(users.role, 'creator'))
 .orderBy(desc(creatorProfiles.totalViews))
 .limit(limit)

 const formattedCreators = trendingCreators.map(creator => ({
 id: creator.id,
 username: creator.username,
 displayName: creator.displayName,
 avatar: creator.avatar,
 videoCount: creator.videoCount,
 totalViews: creator.totalViews,
 category: 'General', // Default category - can be enhanced with creator categories later
 isFollowing: false // Default to false for unauthenticated users
 }))

 return NextResponse.json(formattedCreators)
 }
 } catch (error) {
 console.error('Error fetching trending creators:', error)
 return NextResponse.json(
 { error: 'Failed to fetch trending creators' },
 { status: 500 }
 )
 }
}