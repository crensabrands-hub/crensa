import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/database';
import { users, memberStats, transactions } from '@/lib/database/schema';
import { eq, and, count, sum, sql } from 'drizzle-orm';

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

 const memberId = userProfile[0].id;

 const memberStatsResult = await db
 .select()
 .from(memberStats)
 .where(eq(memberStats.userId, memberId))
 .limit(1);

 const stats = memberStatsResult[0];
 const videosWatched = stats?.totalVideosWatched || 0;

 const creditsSpent = stats?.totalCreditsSpent ? Number(stats.totalCreditsSpent) : 0;

 const walletBalanceResult = await db
 .select({ 
 balance: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'credit' THEN ${transactions.amount} WHEN ${transactions.type} = 'debit' THEN -${transactions.amount} ELSE 0 END), 0)`
 })
 .from(transactions)
 .where(eq(transactions.userId, memberId));

 const walletBalance = Number(walletBalanceResult[0]?.balance || 0);

 return NextResponse.json({
 success: true,
 data: {
 videosWatched,
 creditsSpent,
 walletBalance,
 memberSince: userProfile[0].createdAt,
 lastUpdated: new Date().toISOString(),
 }
 });

 } catch (error) {
 console.error('Error fetching member stats:', error);
 return NextResponse.json(
 { success: false, error: 'Internal server error' },
 { status: 500 }
 );
 }
}