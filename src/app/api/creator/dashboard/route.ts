

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { creatorAnalyticsService } from '@/lib/services/creatorAnalyticsService';
import { userRepository } from '@/lib/database/repositories/users';

export async function GET(request: NextRequest) {
 try {
 const { userId } = await auth();
 
 if (!userId) {
 return NextResponse.json(
 { error: 'Unauthorized' },
 { status: 401 }
 );
 }

 const user = await userRepository.findByClerkId(userId);
 if (!user) {
 return NextResponse.json(
 { error: 'User not found' },
 { status: 404 }
 );
 }

 if (user.role !== 'creator') {
 return NextResponse.json(
 { error: 'Access denied. Creator role required.' },
 { status: 403 }
 );
 }

 const [stats, recentActivity, topVideos] = await Promise.all([
 creatorAnalyticsService.getDashboardStats(user.id),
 creatorAnalyticsService.getRecentActivity(user.id, 5),
 creatorAnalyticsService.getTopPerformingVideos(user.id, 3)
 ]);

 return NextResponse.json({
 success: true,
 data: {
 stats,
 recentActivity,
 topVideos,
 profile: user.creatorProfile || null
 }
 });
 } catch (error) {
 console.error('Creator dashboard API error:', error);
 return NextResponse.json(
 { 
 error: 'Internal server error',
 details: error instanceof Error ? error.message : 'Unknown error'
 },
 { status: 500 }
 );
 }
}