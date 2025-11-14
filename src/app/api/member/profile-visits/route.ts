

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories/users';
import { db } from '@/lib/database/connection';
import { profileVisits, users } from '@/lib/database/schema';
import { eq, desc, and } from 'drizzle-orm';
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
 .where(and(
 eq(profileVisits.userId, user.id),
 eq(users.isActive, true),
 eq(users.isSuspended, false)
 ))
 .orderBy(desc(profileVisits.visitedAt))
 .limit(limit)
 .offset(offset);

 console.log(`Profile visits GET: Found ${recentVisits.length} recent visits for user ${user.id}`);

 const totalCountResult = await db
 .select()
 .from(profileVisits)
 .innerJoin(users, eq(profileVisits.creatorId, users.id))
 .where(and(
 eq(profileVisits.userId, user.id),
 eq(users.isActive, true),
 eq(users.isSuspended, false)
 ));

 const totalCount = totalCountResult.length;

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
 } catch (queryError) {
 console.error('Profile visits GET: Query error:', queryError);

 if (queryError instanceof Error && queryError.message.includes('does not exist')) {
 console.log('Profile visits table does not exist yet, returning empty data');
 return NextResponse.json({
 success: true,
 data: {
 visits: [],
 total: 0,
 limit,
 offset,
 hasMore: false
 }
 });
 }

 throw queryError;
 }
 }
 } catch (dbError) {
 throw dbError; // Let ApiErrorHandler handle database errors
 }
 }, request, {
 endpoint: '/api/member/profile-visits',
 action: 'get-visits'
 });
}

export async function PATCH(request: NextRequest) {
 return ApiErrorHandler.withErrorHandling(async () => {
 const { userId } = await auth();
 
 if (!userId) {
 console.warn('Profile visit duration update: Unauthorized access attempt');
 return NextResponse.json(
 { error: 'Unauthorized', message: 'Please sign in to update visit duration' },
 { status: 401 }
 );
 }

 let user;
 try {
 user = await userRepository.findByClerkId(userId);
 } catch (dbError) {
 console.error('Profile visit duration update: Database error finding user:', dbError);
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
 console.warn(`Profile visit duration update: User not found for clerkId: ${userId}`);
 return NextResponse.json(
 { error: 'User not found', message: 'Your account could not be found' },
 { status: 404 }
 );
 }

 let body;
 try {
 body = await request.json();
 } catch (parseError) {
 console.error('Profile visit duration update: Invalid JSON in request body:', parseError);
 return NextResponse.json(
 { error: 'Invalid request format', message: 'Request body must be valid JSON' },
 { status: 400 }
 );
 }

 const { visitId, duration } = body;

 if (!visitId) {
 return NextResponse.json(
 { error: 'Visit ID is required', message: 'Please provide a valid visit ID' },
 { status: 400 }
 );
 }

 if (typeof duration !== 'number' || duration < 0) {
 return NextResponse.json(
 { error: 'Invalid duration', message: 'Duration must be a non-negative number' },
 { status: 400 }
 );
 }

 if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(visitId)) {
 return NextResponse.json(
 { error: 'Invalid visit ID format', message: 'Visit ID must be a valid UUID' },
 { status: 400 }
 );
 }

 if (duration > 86400) {
 console.warn(`Profile visit duration update: Suspicious duration ${duration} seconds for visit ${visitId}`);
 return NextResponse.json(
 { error: 'Invalid duration', message: 'Duration cannot exceed 24 hours' },
 { status: 400 }
 );
 }

 let updatedVisit;
 try {
 const updateResult = await db
 .update(profileVisits)
 .set({ duration })
 .where(and(
 eq(profileVisits.id, visitId),
 eq(profileVisits.userId, user.id)
 ))
 .returning();

 updatedVisit = updateResult[0];

 if (!updatedVisit) {
 console.warn(`Profile visit duration update: Visit not found or unauthorized - visitId: ${visitId}, userId: ${user.id}`);
 return NextResponse.json(
 { error: 'Visit not found or unauthorized', message: 'The visit record could not be found or you do not have permission to update it' },
 { status: 404 }
 );
 }

 console.log(`Profile visit duration update: Successfully updated visit ${visitId} with duration ${duration}s`);
 } catch (dbError) {
 console.error('Profile visit duration update: Database update error:', dbError);

 if (dbError instanceof Error && (
 dbError.message.includes('connection') || 
 dbError.message.includes('timeout')
 )) {
 return NextResponse.json(
 { 
 error: 'Database connection error',
 message: 'Unable to update visit duration. Please try again.',
 retryable: true
 },
 { status: 503 }
 );
 }

 return NextResponse.json(
 { 
 error: 'Database error',
 message: 'Unable to update visit duration. Please try again.',
 retryable: true
 },
 { status: 500 }
 );
 }

 return NextResponse.json({
 success: true,
 data: {
 visitId: updatedVisit.id,
 duration: updatedVisit.duration,
 message: 'Visit duration updated successfully'
 }
 });
 }, request, {
 endpoint: '/api/member/profile-visits',
 action: 'update-duration'
 });
}