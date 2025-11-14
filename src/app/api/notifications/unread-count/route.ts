import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/database';
import { notifications, users } from '@/lib/database/schema';
import { eq, and, count } from 'drizzle-orm';

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

 if (!userProfile.length) {
 return NextResponse.json(
 { success: false, error: 'User not found' },
 { status: 404 }
 );
 }

 const dbUserId = userProfile[0].id;

 const unreadCountResult = await db
 .select({ count: count() })
 .from(notifications)
 .where(and(
 eq(notifications.userId, dbUserId),
 eq(notifications.isRead, false)
 ));

 const unreadCount = unreadCountResult[0]?.count || 0;

 return NextResponse.json({
 success: true,
 data: {
 unreadCount,
 lastUpdated: new Date().toISOString(),
 }
 });

 } catch (error) {
 console.error('Error fetching unread notification count:', error);
 return NextResponse.json(
 { success: false, error: 'Internal server error' },
 { status: 500 }
 );
 }
}