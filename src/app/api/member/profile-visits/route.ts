

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories/users';
import { db } from '@/lib/database/connection';
import { profileVisits, users } from '@/lib/database/schema';
import { eq, desc, and, gte, count } from 'drizzle-orm';
import { ApiErrorHandler } from '@/lib/utils/apiErrorHandler';

export async function POST(request: NextRequest) {
 return ApiErrorHandler.withErrorHandling(async () => {
 const { userId } = await auth();
 
 if (!userId) {
 console.warn('Profile visit tracking: Unauthorized access attempt');
 return NextResponse.json(
 { error: 'Unauthorized', message: 'Please sign in to track profile visits' },
 { status: 401 }
 );
 }

 let user;
 try {
 user = await userRepository.findByClerkId(userId);
 } catch (dbError) {
 console.error('Profile visit tracking: Database error finding user:', dbError);
 return NextResponse.json(
 { 
 error: 'Database error', 
 message: 'Unable to verify user account',
 retryable: true
 },
 { status: 500 }
 );
 }

 if (!user) {
 console.warn(`Profile visit tracking: User not found for clerkId: ${userId}`);
 return NextResponse.json(
 { error: 'User not found', message: 'Your account could not be found' },
 { status: 404 }
 );
 }

 let body;
 try {
 body = await request.json();
 } catch (parseError) {
 console.error('Profile visit tracking: Invalid JSON in request body:', parseError);
 return NextResponse.json(
 { error: 'Invalid request format', message: 'Request body must be valid JSON' },
 { status: 400 }
 );
 }

 const { creatorId, source = 'dashboard' } = body;

 if (!creatorId) {
 return NextResponse.json(
 { error: 'Creator ID is required', message: 'Please provide a valid creator ID' },
 { status: 400 }
 );
 }

 if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(creatorId)) {
 return NextResponse.json(
 { error: 'Invalid creator ID format', message: 'Creator ID must be a valid UUID' },
 { status: 400 }
 );
 }

 const validSources = ['dashboard', 'search', 'recommendation', 'direct', 'trending'];
 if (!validSources.includes(source)) {
 console.warn(`Profile visit tracking: Invalid source provided: ${source}`);
 return NextResponse.json(
 { error: 'Invalid source', message: `Source must be one of: ${validSources.join(', ')}` },
 { status: 400 }
 );
 }

 let creator;
 try {
 creator = await userRepository.findById(creatorId);
 } catch (dbError) {
 console.error('Profile visit tracking: Database error finding creator:', dbError);
 return NextResponse.json(
 { 
 error: 'Database error', 
 message: 'Unable to verify creator account',
 retryable: true
 },
 { status: 500 }
 );
 }

 if (!creator) {
 console.warn(`Profile visit tracking: Creator not found: ${creatorId}`);
 return NextResponse.json(
 { error: 'Creator not found', message: 'The creator profile could not be found' },
 { status: 404 }
 );
 }

 if (!creator.isActive || creator.isSuspended) {
 console.warn(`Profile visit tracking: Creator inactive or suspended: ${creatorId}`);
 return NextResponse.json(
 { error: 'Creator unavailable', message: 'This creator profile is not available' },
 { status: 404 }
 );
 }

 if (user.id === creatorId) {
 console.log(`Profile visit tracking: Self-visit not tracked for user ${user.id}`);
 return NextResponse.json({
 success: true,
 message: 'Self-visit not tracked',
 data: null
 });
 }

 let visitRecord;
 try {
 const insertResult = await db
 .insert(profileVisits)
 .values({
 userId: user.id,
 creatorId,
 source,
 visitedAt: new Date()
 })
 .returning();

 visitRecord = insertResult[0];
 
 if (!visitRecord) {
 throw new Error('No visit record returned from database');
 }

 console.log(`Profile visit tracking: Successfully tracked visit from ${user.id} to ${creatorId} via ${source}`);
 } catch (dbError) {
 console.error('Profile visit tracking: Database insert error:', dbError);

 if (dbError instanceof Error) {
 if (dbError.message.includes('foreign key constraint')) {
 return NextResponse.json(
 { 
 error: 'Invalid reference', 
 message: 'Unable to create visit record due to invalid user or creator reference'
 },
 { status: 400 }
 );
 }
 
 if (dbError.message.includes('connection') || dbError.message.includes('timeout')) {
 return NextResponse.json(
 { 
 error: 'Database connection error',
 message: 'Unable to save visit record. Please try again.',
 retryable: true
 },
 { status: 503 }
 );
 }
 }

 return NextResponse.json(
 { 
 error: 'Database error',
 message: 'Unable to track profile visit. Please try again.',
 retryable: true
 },
 { status: 500 }
 );
 }

 return NextResponse.json({
 success: true,
 data: {
 visitId: visitRecord.id,
 creatorId,
 source,
 visitedAt: visitRecord.visitedAt.toISOString(),
 message: 'Profile visit tracked successfully'
 }
 });
 }, request, {
 endpoint: '/api/member/profile-visits',
 action: 'track-visit'
 });
}

export async function GET(request: NextRequest) {
 return ApiErrorHandler.withErrorHandling(async () => {
 const { userId } = await auth();
 
 if (!userId) {
 console.warn('Profile visits GET: Unauthorized access attempt');
 return NextResponse.json(
 { error: 'Unauthorized', message: 'Please sign in to view your visit history' },
 { status: 401 }
 );
 }

 let user;
 try {
 user = await userRepository.findByClerkId(userId);
 } catch (dbError) {
 console.error('Profile visits GET: Database error finding user:', dbError);
 return NextResponse.json(
 { 
 error: 'Database error', 
 message: 'Unable to verify user account. Please try again.',
 retryable: true
 },
 { status: 500 }
 );
 }

 if (!user) {
 console.warn(`Profile visits GET: User not found for clerkId: ${userId}`);
 return NextResponse.json(
 { error: 'User not found', message: 'Your account could not be found. Please contact support.' },
 { status: 404 }
 );
 }

 const { searchParams } = new URL(request.url);
 const limitParam = searchParams.get('limit');
 const offsetParam = searchParams.get('offset');
 const creatorId = searchParams.get('creatorId');

 const limit = Math.min(Math.max(parseInt(limitParam || '20'), 1), 100); // Limit between 1-100
 const offset = Math.max(parseInt(offsetParam || '0'), 0); // Offset >= 0

 console.log(`Profile visits GET: Fetching visits for user ${user.id}, limit: ${limit}, offset: ${offset}, creatorId: ${creatorId || 'all'}`);

 try {
 if (creatorId) {

 if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(creatorId)) {
 return NextResponse.json(
 { error: 'Invalid creator ID format' },
 { status: 400 }
 );
 }

 const visits = await db
 .select({
 id: profileVisits.id,
 visitedAt: profileVisits.visitedAt,
 source: profileVisits.source,
 duration: profileVisits.duration
 })
 .from(profileVisits)
 .where(and(
 eq(profileVisits.userId, user.id),
 eq(profileVisits.creatorId, creatorId)
 ))
 .orderBy(desc(profileVisits.visitedAt))
 .limit(limit)
 .offset(offset);

 console.log(`Profile visits GET: Found ${visits.length} visits for creator ${creatorId}`);

 return NextResponse.json({
 success: true,
 data: {
 creatorId,
 visits: visits.map(visit => ({
 ...visit,
 visitedAt: visit.visitedAt.toISOString()
 })),
 total: visits.length,
 limit,
 offset
 }
 });
 } else {
 try {

         // Only return visits from the last 30 days
         const thirtyDaysAgo = new Date();
         thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

         const whereCondition = and(
           eq(profileVisits.userId, user.id),
           eq(users.isActive, true),
           eq(users.isSuspended, false),
           gte(profileVisits.visitedAt, thirtyDaysAgo)
         );

         const recentVisits = await db
           .select({
             id: profileVisits.id,
             visitedAt: profileVisits.visitedAt,
             source: profileVisits.source,
             duration: profileVisits.duration,
             creator: {
               id: users.id,
               username: users.username,
               avatar: users.avatar
             }
           })
           .from(profileVisits)
           .innerJoin(users, eq(profileVisits.creatorId, users.id))
           .where(whereCondition)
           .orderBy(desc(profileVisits.visitedAt))
           .limit(limit)
           .offset(offset);

         console.log(`Profile visits GET: Found ${recentVisits.length} recent visits for user ${user.id}`);

         const [{ totalCount }] = await db
           .select({ totalCount: count() })
           .from(profileVisits)
           .innerJoin(users, eq(profileVisits.creatorId, users.id))
           .where(whereCondition);

         return NextResponse.json({
           success: true,
           data: {
             visits: recentVisits.map(visit => ({
               ...visit,
               visitedAt: visit.visitedAt.toISOString()
             })),
             total: totalCount,
             limit,
             offset,
             hasMore: offset + recentVisits.length < totalCount
           }
         });


    } catch (error) {
      console.error('Profile visits GET: Error fetching recent visits:', error);
      return NextResponse.json(
        { error: 'Failed to fetch visit history', message: 'An error occurred while retrieving your visit history.' },
        { status: 500 }
      );
    }
  }
  } catch (error) {
    console.error('Profile visits GET: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}, request);
}
