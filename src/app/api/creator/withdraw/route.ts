

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories/users';
import { db } from '@/lib/database/connection';
import { coinTransactions, creatorProfiles, type NewCoinTransaction } from '@/lib/database/schema';
import { eq, sql } from 'drizzle-orm';
import { coinsToRupees, validateCoinBalance } from '@/lib/utils/coin-utils';

interface WithdrawalRequest {
 coinAmount: number;
 withdrawalMethod?: 'bank_transfer' | 'upi' | 'paypal';
 accountDetails?: {
 accountNumber?: string;
 ifscCode?: string;
 upiId?: string;
 paypalEmail?: string;
 };
}

interface WithdrawalResponse {
 success: boolean;
 withdrawalId?: string;
 coins: number;
 rupees: number;
 status: 'pending' | 'completed' | 'failed';
 message: string;
 estimatedProcessingTime?: string;
}

export async function POST(request: NextRequest) {
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

 const body: WithdrawalRequest = await request.json();
 const { coinAmount, withdrawalMethod = 'bank_transfer', accountDetails } = body;

 if (!coinAmount || coinAmount <= 0) {
 return NextResponse.json(
 { error: 'Invalid coin amount. Must be greater than zero.' },
 { status: 400 }
 );
 }

 if (!validateCoinBalance(coinAmount)) {
 return NextResponse.json(
 { error: 'Invalid coin amount.' },
 { status: 400 }
 );
 }

 const creatorProfileResult = await db
 .select({
 coinBalance: creatorProfiles.coinBalance
 })
 .from(creatorProfiles)
 .where(eq(creatorProfiles.userId, user.id))
 .limit(1);

 if (creatorProfileResult.length === 0) {
 return NextResponse.json(
 { error: 'Creator profile not found' },
 { status: 404 }
 );
 }

 const availableCoins = creatorProfileResult[0].coinBalance || 0;

 if (availableCoins < coinAmount) {
 return NextResponse.json(
 { 
 error: 'Insufficient coin balance',
 details: {
 requested: coinAmount,
 available: availableCoins,
 shortfall: coinAmount - availableCoins
 }
 },
 { status: 400 }
 );
 }

 const rupeeAmount = coinsToRupees(coinAmount);

 const MIN_WITHDRAWAL_RUPEES = 100;
 if (rupeeAmount < MIN_WITHDRAWAL_RUPEES) {
 return NextResponse.json(
 { 
 error: `Minimum withdrawal amount is ₹${MIN_WITHDRAWAL_RUPEES} (${MIN_WITHDRAWAL_RUPEES * 20} coins)`,
 details: {
 requested: rupeeAmount,
 minimum: MIN_WITHDRAWAL_RUPEES
 }
 },
 { status: 400 }
 );
 }

 const result = await db.transaction(async (tx) => {

 const transactionData: NewCoinTransaction = {
 userId: user.id,
 transactionType: 'withdraw',
 coinAmount,
 rupeeAmount: rupeeAmount.toString(),
 status: 'pending', // Withdrawals start as pending for manual processing
 description: `Withdrawal of ${coinAmount} coins (₹${rupeeAmount.toFixed(2)}) via ${withdrawalMethod}`,
 createdAt: new Date(),
 updatedAt: new Date()
 };

 const [transaction] = await tx
 .insert(coinTransactions)
 .values(transactionData)
 .returning();

 await tx
 .update(creatorProfiles)
 .set({
 coinBalance: sql`${creatorProfiles.coinBalance} - ${coinAmount}`,
 coinsWithdrawn: sql`${creatorProfiles.coinsWithdrawn} + ${coinAmount}`,
 updatedAt: new Date()
 })
 .where(eq(creatorProfiles.userId, user.id));

 return transaction;
 });

 console.log('[Withdrawal] Created:', {
 withdrawalId: result.id,
 creatorId: user.id,
 coins: coinAmount,
 rupees: rupeeAmount,
 method: withdrawalMethod
 });

 const response: WithdrawalResponse = {
 success: true,
 withdrawalId: result.id,
 coins: coinAmount,
 rupees: rupeeAmount,
 status: 'pending',
 message: 'Withdrawal request submitted successfully. It will be processed within 3-5 business days.',
 estimatedProcessingTime: '3-5 business days'
 };

 return NextResponse.json(response);

 } catch (error) {
 console.error('Creator withdrawal API error:', error);
 return NextResponse.json(
 { 
 error: 'Internal server error',
 details: error instanceof Error ? error.message : 'Unknown error'
 },
 { status: 500 }
 );
 }
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

 const withdrawals = await db
 .select()
 .from(coinTransactions)
 .where(
 sql`${coinTransactions.userId} = ${user.id} AND ${coinTransactions.transactionType} = 'withdraw'`
 )
 .orderBy(sql`${coinTransactions.createdAt} DESC`)
 .limit(50);

 const withdrawalHistory = withdrawals.map(w => ({
 id: w.id,
 coins: w.coinAmount,
 rupees: parseFloat(w.rupeeAmount || '0'),
 status: w.status,
 description: w.description,
 createdAt: w.createdAt.toISOString(),
 updatedAt: w.updatedAt.toISOString()
 }));

 return NextResponse.json({
 success: true,
 withdrawals: withdrawalHistory,
 total: withdrawals.length
 });

 } catch (error) {
 console.error('Withdrawal history API error:', error);
 return NextResponse.json(
 { 
 error: 'Internal server error',
 details: error instanceof Error ? error.message : 'Unknown error'
 },
 { status: 500 }
 );
 }
}
