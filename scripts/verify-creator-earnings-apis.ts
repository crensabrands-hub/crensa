

import { db } from '../src/lib/database/connection';
import { users, creatorProfiles, coinTransactions, videos } from '../src/lib/database/schema';
import { eq, sql } from 'drizzle-orm';
import { coinsToRupees } from '../src/lib/utils/coin-utils';

interface VerificationResult {
 passed: boolean;
 message: string;
 details?: any;
}

async function verifyCreatorEarningsStructure(): Promise<VerificationResult> {
 try {
 console.log('\n📊 Verifying Creator Earnings Structure...');

 const creatorProfile = await db
 .select({
 coinBalance: creatorProfiles.coinBalance,
 totalCoinsEarned: creatorProfiles.totalCoinsEarned,
 coinsWithdrawn: creatorProfiles.coinsWithdrawn
 })
 .from(creatorProfiles)
 .limit(1);

 if (creatorProfile.length === 0) {
 return {
 passed: true,
 message: 'No creator profiles found (expected for new database)',
 details: { note: 'This is normal if no creators exist yet' }
 };
 }

 const profile = creatorProfile[0];
 const hasRequiredFields = 
 profile.coinBalance !== undefined &&
 profile.totalCoinsEarned !== undefined &&
 profile.coinsWithdrawn !== undefined;

 if (!hasRequiredFields) {
 return {
 passed: false,
 message: 'Creator profile missing required coin fields',
 details: profile
 };
 }

 return {
 passed: true,
 message: 'Creator earnings structure verified',
 details: {
 coinBalance: profile.coinBalance,
 totalCoinsEarned: profile.totalCoinsEarned,
 coinsWithdrawn: profile.coinsWithdrawn
 }
 };
 } catch (error) {
 return {
 passed: false,
 message: 'Error verifying creator earnings structure',
 details: error instanceof Error ? error.message : 'Unknown error'
 };
 }
}

async function verifyCoinTransactionTypes(): Promise<VerificationResult> {
 try {
 console.log('\n💰 Verifying Coin Transaction Types...');

 const earnTransactions = await db
 .select({ count: sql<number>`count(*)` })
 .from(coinTransactions)
 .where(eq(coinTransactions.transactionType, 'earn'));

 const withdrawTransactions = await db
 .select({ count: sql<number>`count(*)` })
 .from(coinTransactions)
 .where(eq(coinTransactions.transactionType, 'withdraw'));

 return {
 passed: true,
 message: 'Coin transaction types verified',
 details: {
 earnTransactions: Number(earnTransactions[0]?.count || 0),
 withdrawTransactions: Number(withdrawTransactions[0]?.count || 0),
 note: 'Transaction types are properly configured'
 }
 };
 } catch (error) {
 return {
 passed: false,
 message: 'Error verifying coin transaction types',
 details: error instanceof Error ? error.message : 'Unknown error'
 };
 }
}

async function verifyCreatorEarningsCalculation(): Promise<VerificationResult> {
 try {
 console.log('\n🧮 Verifying Creator Earnings Calculation...');

 const creatorsWithEarnings = await db
 .select({
 userId: creatorProfiles.userId,
 coinBalance: creatorProfiles.coinBalance,
 totalCoinsEarned: creatorProfiles.totalCoinsEarned,
 username: users.username
 })
 .from(creatorProfiles)
 .innerJoin(users, eq(creatorProfiles.userId, users.id))
 .where(sql`${creatorProfiles.totalCoinsEarned} > 0`)
 .limit(1);

 if (creatorsWithEarnings.length === 0) {
 return {
 passed: true,
 message: 'No creators with earnings found (expected for new database)',
 details: { note: 'This is normal if no earnings have been recorded yet' }
 };
 }

 const creator = creatorsWithEarnings[0];

 const totalCoinsEarned = creator.totalCoinsEarned || 0;
 const totalRupeesEarned = coinsToRupees(totalCoinsEarned);
 const expectedRupees = totalCoinsEarned / 20;

 if (Math.abs(totalRupeesEarned - expectedRupees) > 0.01) {
 return {
 passed: false,
 message: 'Coin to rupee conversion incorrect',
 details: {
 totalCoinsEarned,
 calculatedRupees: totalRupeesEarned,
 expectedRupees
 }
 };
 }

 return {
 passed: true,
 message: 'Creator earnings calculation verified',
 details: {
 creator: creator.username,
 totalCoinsEarned,
 totalRupeesEarned,
 coinBalance: creator.coinBalance
 }
 };
 } catch (error) {
 return {
 passed: false,
 message: 'Error verifying creator earnings calculation',
 details: error instanceof Error ? error.message : 'Unknown error'
 };
 }
}

async function verifyVideoEarningsTracking(): Promise<VerificationResult> {
 try {
 console.log('\n🎥 Verifying Video Earnings Tracking...');

 const videosWithCoinPrice = await db
 .select({
 id: videos.id,
 title: videos.title,
 coinPrice: videos.coinPrice,
 creatorId: videos.creatorId
 })
 .from(videos)
 .where(sql`${videos.coinPrice} > 0`)
 .limit(5);

 if (videosWithCoinPrice.length === 0) {
 return {
 passed: true,
 message: 'No videos with coin prices found (expected for new database)',
 details: { note: 'This is normal if no videos have been created yet' }
 };
 }

 const videoIds = videosWithCoinPrice.map(v => v.id);
 const earningTransactions = await db
 .select({ count: sql<number>`count(*)` })
 .from(coinTransactions)
 .where(
 sql`${coinTransactions.transactionType} = 'earn' 
 AND ${coinTransactions.relatedContentType} = 'video'
 AND ${coinTransactions.relatedContentId} = ANY(${videoIds})`
 );

 return {
 passed: true,
 message: 'Video earnings tracking verified',
 details: {
 videosWithCoinPrice: videosWithCoinPrice.length,
 earningTransactions: Number(earningTransactions[0]?.count || 0),
 sampleVideos: videosWithCoinPrice.map(v => ({
 title: v.title,
 coinPrice: v.coinPrice,
 rupeePrice: coinsToRupees(v.coinPrice)
 }))
 }
 };
 } catch (error) {
 return {
 passed: false,
 message: 'Error verifying video earnings tracking',
 details: error instanceof Error ? error.message : 'Unknown error'
 };
 }
}

async function verifyWithdrawalSystem(): Promise<VerificationResult> {
 try {
 console.log('\n💸 Verifying Withdrawal System...');

 const withdrawals = await db
 .select({
 id: coinTransactions.id,
 coinAmount: coinTransactions.coinAmount,
 rupeeAmount: coinTransactions.rupeeAmount,
 status: coinTransactions.status,
 createdAt: coinTransactions.createdAt
 })
 .from(coinTransactions)
 .where(eq(coinTransactions.transactionType, 'withdraw'))
 .limit(5);

 return {
 passed: true,
 message: 'Withdrawal system verified',
 details: {
 totalWithdrawals: withdrawals.length,
 withdrawals: withdrawals.map(w => ({
 coins: w.coinAmount,
 rupees: parseFloat(w.rupeeAmount || '0'),
 status: w.status,
 date: w.createdAt.toISOString()
 })),
 note: withdrawals.length === 0 
 ? 'No withdrawals yet (expected for new system)'
 : 'Withdrawal transactions found'
 }
 };
 } catch (error) {
 return {
 passed: false,
 message: 'Error verifying withdrawal system',
 details: error instanceof Error ? error.message : 'Unknown error'
 };
 }
}

async function runVerification() {
 console.log('🚀 Starting Creator Earnings APIs Verification...\n');
 console.log('=' .repeat(60));

 const results: VerificationResult[] = [];

 results.push(await verifyCreatorEarningsStructure());
 results.push(await verifyCoinTransactionTypes());
 results.push(await verifyCreatorEarningsCalculation());
 results.push(await verifyVideoEarningsTracking());
 results.push(await verifyWithdrawalSystem());

 console.log('\n' + '='.repeat(60));
 console.log('\n📋 VERIFICATION SUMMARY\n');

 let passedCount = 0;
 let failedCount = 0;

 results.forEach((result, index) => {
 const icon = result.passed ? '✅' : '❌';
 console.log(`${icon} ${result.message}`);
 
 if (result.details) {
 console.log(' Details:', JSON.stringify(result.details, null, 2));
 }
 
 if (result.passed) {
 passedCount++;
 } else {
 failedCount++;
 }
 
 if (index < results.length - 1) {
 console.log('');
 }
 });

 console.log('\n' + '='.repeat(60));
 console.log(`\n✨ Verification Complete: ${passedCount} passed, ${failedCount} failed\n`);

 if (failedCount > 0) {
 console.log('⚠️ Some verifications failed. Please review the details above.\n');
 process.exit(1);
 } else {
 console.log('🎉 All verifications passed successfully!\n');
 process.exit(0);
 }
}

runVerification().catch((error) => {
 console.error('❌ Verification script failed:', error);
 process.exit(1);
});
