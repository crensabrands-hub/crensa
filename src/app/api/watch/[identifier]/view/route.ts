

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories/users';
import { identifierResolutionService } from '@/lib/services/identifierResolutionService';
import { walletService } from '@/lib/services/walletService';
import { db } from '@/lib/database/connection';
import { transactions, videoShares } from '@/lib/database/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
 request: NextRequest,
 context: { params: Promise<{ identifier: string }> }
) {
 try {
 const params = await context.params;
 const { identifier } = params;

 if (!identifier || typeof identifier !== 'string' || identifier.trim().length === 0) {
 return NextResponse.json(
 { 
 success: false,
 error: 'Invalid identifier provided' 
 },
 { status: 400 }
 );
 }

 const authResult = await auth();
 if (!authResult.userId) {
 return NextResponse.json(
 { 
 success: false,
 error: 'Authentication required' 
 },
 { status: 401 }
 );
 }

 const user = await userRepository.findByClerkId(authResult.userId);
 if (!user) {
 return NextResponse.json(
 { 
 success: false,
 error: 'User not found' 
 },
 { status: 404 }
 );
 }

 const resolution = await identifierResolutionService.resolveIdentifier(identifier, user.id);
 
 if (!resolution.success) {
 return NextResponse.json(
 { 
 success: false,
 error: resolution.error || 'Failed to resolve identifier' 
 },
 { status: 404 }
 );
 }

 if (resolution.type !== 'share_token') {
 return NextResponse.json(
 { 
 success: false,
 error: 'This endpoint is only for share token access' 
 },
 { status: 400 }
 );
 }

 const shareData = resolution.data as any;
 const video = shareData.video;

 if (resolution.access.hasAccess) {
 return NextResponse.json({
 success: true,
 message: 'Access already granted',
 video: {
 id: video.id,
 title: video.title,
 hasAccess: true
 }
 });
 }

 if (user.id === video.creator.id) {
 return NextResponse.json({
 success: true,
 message: 'Creator access granted',
 video: {
 id: video.id,
 title: video.title,
 hasAccess: true
 }
 });
 }

 const walletBalance = await walletService.getWalletBalance(user.id);
 if (walletBalance.balance < video.creditCost) {
 return NextResponse.json(
 { 
 success: false,
 error: 'Insufficient credits',
 required: video.creditCost,
 available: walletBalance.balance
 },
 { status: 402 }
 );
 }

 try {

 const deductionResult = await walletService.deductCredits(
 user.id, 
 video.creditCost, 
 video.id, 
 video.creator.id
 );

 await db
 .update(videoShares)
 .set({
 conversionCount: shareData.conversionCount + 1,
 updatedAt: new Date()
 })
 .where(eq(videoShares.id, shareData.id));

 console.log(`Revenue earned: Creator ${video.creator.id} earned ${video.creditCost} credits from video ${video.id}`);

 return NextResponse.json({
 success: true,
 message: 'Video access granted',
 video: {
 id: video.id,
 title: video.title,
 hasAccess: true
 },
 transaction: {
 amount: video.creditCost,
 remainingBalance: deductionResult.newBalance,
 transactionId: deductionResult.transactionId
 }
 });

 } catch (transactionError) {
 console.error('Transaction error:', transactionError);
 return NextResponse.json(
 { 
 success: false,
 error: 'Failed to process payment' 
 },
 { status: 500 }
 );
 }

 } catch (error) {
 console.error('Share token view API error:', error);
 return NextResponse.json(
 { 
 success: false,
 error: 'Internal server error',
 details: process.env.NODE_ENV === 'development' ? 
 (error instanceof Error ? error.message : 'Unknown error') : undefined
 },
 { status: 500 }
 );
 }
}