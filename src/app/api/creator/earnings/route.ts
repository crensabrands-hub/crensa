

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories/users';
import { db } from '@/lib/database/connection';
import { coinTransactions, creatorProfiles, videos } from '@/lib/database/schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import { coinsToRupees } from '@/lib/utils/coin-utils';

interface EarningsData {

 totalCoinsEarned: number;
 totalCoinsEarnedRupees: number;
 monthlyCoinsEarned: number;
 monthlyCoinsEarnedRupees: number;
 availableCoins: number;
 availableCoinsRupees: number;
 coinsWithdrawn: number;
 coinsWithdrawnRupees: number;

 lastPayout: {
 coins: number;
 rupees: number;
 date: string;
 } | null;

 earningsHistory: Array<{
 id: string;
 coins: number;
 rupees: number;
 date: string;
 type: 'earn';
 description: string | null;
 contentType?: 'video' | 'series';
 contentId?: string;
 videoTitle?: string;
 seriesTitle?: string;
 }>;
}

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

 const earningsData = await getCreatorEarnings(user.id);

 return NextResponse.json({
 success: true,
 data: earningsData
 });
 } catch (error) {
 console.error('Creator earnings API error:', error);
 return NextResponse.json(
 { 
 error: 'Internal server error',
 details: error instanceof Error ? error.message : 'Unknown error'
 },
 { status: 500 }
 );
 }
}

async function getCreatorEarnings(creatorId: string): Promise<EarningsData> {
 try {

 const creatorProfileResult = await db
 .select({
 coinBalance: creatorProfiles.coinBalance,
 totalCoinsEarned: creatorProfiles.totalCoinsEarned,
 coinsWithdrawn: creatorProfiles.coinsWithdrawn
 })
 .from(creatorProfiles)
 .where(eq(creatorProfiles.userId, creatorId))
 .limit(1);

 if (creatorProfileResult.length === 0) {
 throw new Error('Creator profile not found');
 }

 const profile = creatorProfileResult[0];
 const totalCoinsEarned = profile.totalCoinsEarned || 0;
 const availableCoins = profile.coinBalance || 0;
 const coinsWithdrawn = profile.coinsWithdrawn || 0;

 const totalCoinsEarnedRupees = coinsToRupees(totalCoinsEarned);
 const availableCoinsRupees = coinsToRupees(availableCoins);
 const coinsWithdrawnRupees = coinsToRupees(coinsWithdrawn);

 const now = new Date();
 const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
 
 const monthlyEarningsResult = await db
 .select({
 totalCoins: sql<number>`COALESCE(SUM(${coinTransactions.coinAmount}), 0)`
 })
 .from(coinTransactions)
 .where(
 and(
 eq(coinTransactions.userId, creatorId),
 eq(coinTransactions.transactionType, 'earn'),
 eq(coinTransactions.status, 'completed'),
 gte(coinTransactions.createdAt, startOfMonth),
 lte(coinTransactions.createdAt, now)
 )
 );

 const monthlyCoinsEarned = Number(monthlyEarningsResult[0]?.totalCoins || 0);
 const monthlyCoinsEarnedRupees = coinsToRupees(monthlyCoinsEarned);

 const recentTransactions = await db
 .select({
 transaction: coinTransactions,
 video: {
 id: videos.id,
 title: videos.title
 }
 })
 .from(coinTransactions)
 .leftJoin(
 videos,
 and(
 eq(coinTransactions.relatedContentType, 'video'),
 sql`${coinTransactions.relatedContentId} = ${videos.id}`
 )
 )
 .where(
 and(
 eq(coinTransactions.userId, creatorId),
 eq(coinTransactions.transactionType, 'earn'),
 eq(coinTransactions.status, 'completed')
 )
 )
 .orderBy(desc(coinTransactions.createdAt))
 .limit(20);

 const earningsHistory = recentTransactions.map(row => ({
 id: row.transaction.id,
 coins: row.transaction.coinAmount,
 rupees: coinsToRupees(row.transaction.coinAmount),
 date: row.transaction.createdAt.toISOString(),
 type: 'earn' as const,
 description: row.transaction.description,
 contentType: row.transaction.relatedContentType || undefined,
 contentId: row.transaction.relatedContentId || undefined,
 videoTitle: row.video?.title || undefined
 }));

 const lastWithdrawalResult = await db
 .select()
 .from(coinTransactions)
 .where(
 and(
 eq(coinTransactions.userId, creatorId),
 eq(coinTransactions.transactionType, 'withdraw'),
 eq(coinTransactions.status, 'completed')
 )
 )
 .orderBy(desc(coinTransactions.createdAt))
 .limit(1);

 const lastPayout = lastWithdrawalResult.length > 0
 ? {
 coins: lastWithdrawalResult[0].coinAmount,
 rupees: parseFloat(lastWithdrawalResult[0].rupeeAmount || '0'),
 date: lastWithdrawalResult[0].createdAt.toISOString()
 }
 : null;

 return {
 totalCoinsEarned,
 totalCoinsEarnedRupees,
 monthlyCoinsEarned,
 monthlyCoinsEarnedRupees,
 availableCoins,
 availableCoinsRupees,
 coinsWithdrawn,
 coinsWithdrawnRupees,
 lastPayout,
 earningsHistory
 };
 } catch (error) {
 console.error('Error fetching creator earnings:', error);
 throw error;
 }
}