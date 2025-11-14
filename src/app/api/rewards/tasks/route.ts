import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const getRewardTasks = () => [
 {
 id: 'daily-login',
 title: 'Daily Login',
 description: 'Log in to your account',
 reward: 5,
 type: 'daily',
 completed: true,
 progress: {
 current: 1,
 target: 1
 }
 },
 {
 id: 'watch-videos',
 title: 'Watch 3 Videos',
 description: 'Watch at least 3 videos today',
 reward: 10,
 type: 'daily',
 completed: false,
 progress: {
 current: 1,
 target: 3
 }
 },
 {
 id: 'share-video',
 title: 'Share a Video',
 description: 'Share any video with friends',
 reward: 8,
 type: 'daily',
 completed: false,
 progress: {
 current: 0,
 target: 1
 }
 },
 {
 id: 'follow-creator',
 title: 'Follow a Creator',
 description: 'Follow any creator you like',
 reward: 15,
 type: 'weekly',
 completed: false,
 progress: {
 current: 0,
 target: 1
 }
 }
];

export async function GET(request: NextRequest) {
 try {
 const { userId } = await auth();
 
 if (!userId) {
 return NextResponse.json(
 { success: false, error: 'Unauthorized' },
 { status: 401 }
 );
 }

 const tasks = getRewardTasks();

 return NextResponse.json({
 success: true,
 data: {
 tasks,
 lastUpdated: new Date().toISOString(),
 }
 });

 } catch (error) {
 console.error('Error fetching reward tasks:', error);
 return NextResponse.json(
 { success: false, error: 'Internal server error' },
 { status: 500 }
 );
 }
}