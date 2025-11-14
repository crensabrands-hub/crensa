

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories/users';
import { preferencesRepository } from '@/lib/database/repositories/preferences';

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

 if (user.role !== 'member') {
 return NextResponse.json(
 { error: 'Access denied. Member role required.' },
 { status: 403 }
 );
 }

 const preferences = await preferencesRepository.findByUserId(user.id);

 return NextResponse.json({
 success: true,
 data: preferences || {
 notifications: {
 email: true,
 push: true,
 earnings: true,
 newFollowers: true,
 videoComments: true,
 },
 privacy: {
 profileVisibility: "public",
 showEarnings: true,
 showViewCount: true,
 },
 playback: {
 autoplay: true,
 quality: "auto",
 volume: 80,
 }
 }
 });
 } catch (error) {
 console.error('Member preferences GET API error:', error);
 return NextResponse.json(
 { 
 error: 'Internal server error',
 details: error instanceof Error ? error.message : 'Unknown error'
 },
 { status: 500 }
 );
 }
}

export async function PUT(request: NextRequest) {
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

 if (user.role !== 'member') {
 return NextResponse.json(
 { error: 'Access denied. Member role required.' },
 { status: 403 }
 );
 }

 const body = await request.json();
 const { notifications, privacy, playback } = body;

 if (!notifications && !privacy && !playback) {
 return NextResponse.json(
 { error: 'At least one preference category must be provided' },
 { status: 400 }
 );
 }

 const updateData: any = {};
 
 if (notifications) {
 updateData.notifications = {
 email: notifications.email ?? true,
 push: notifications.push ?? true,
 earnings: notifications.earnings ?? true,
 newFollowers: notifications.newFollowers ?? true,
 videoComments: notifications.videoComments ?? true,
 };
 }

 if (privacy) {
 updateData.privacy = {
 profileVisibility: privacy.profileVisibility ?? "public",
 showEarnings: privacy.showEarnings ?? true,
 showViewCount: privacy.showViewCount ?? true,
 };
 }

 if (playback) {
 updateData.playback = {
 autoplay: playback.autoplay ?? true,
 quality: playback.quality ?? "auto",
 volume: Math.max(0, Math.min(100, playback.volume ?? 80)),
 };
 }

 const updatedPreferences = await preferencesRepository.upsert(user.id, updateData);

 return NextResponse.json({
 success: true,
 data: updatedPreferences,
 message: 'Preferences updated successfully'
 });
 } catch (error) {
 console.error('Member preferences PUT API error:', error);
 return NextResponse.json(
 { 
 error: 'Internal server error',
 details: error instanceof Error ? error.message : 'Unknown error'
 },
 { status: 500 }
 );
 }
}