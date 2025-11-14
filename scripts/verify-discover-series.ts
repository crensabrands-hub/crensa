

import { db } from '../src/lib/database';
import { series, users, creatorProfiles } from '../src/lib/database/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

interface VerificationResult {
 passed: boolean;
 message: string;
 details?: any;
}

async function verifyPopularSeriesQuery(): Promise<VerificationResult> {
 try {
 console.log('\n📊 Verifying popular series query...');

 const popularSeries = await db
 .select({
 id: series.id,
 title: series.title,
 thumbnailUrl: series.thumbnailUrl,
 coinPrice: series.coinPrice,
 videoCount: series.videoCount,
 viewCount: series.viewCount,
 isActive: series.isActive,
 moderationStatus: series.moderationStatus,
 creatorUsername: users.username,
 creatorDisplayName: creatorProfiles.displayName,
 })
 .from(series)
 .leftJoin(users, eq(series.creatorId, users.id))
 .leftJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
 .where(
 and(
 eq(series.isActive, true),
 eq(series.moderationStatus, 'approved'),
 sql`${series.videoCount} > 0`
 )
 )
 .orderBy(desc(series.viewCount))
 .limit(6);

 if (popularSeries.length === 0) {
 return {
 passed: false,
 message: 'No popular series found. This is expected if no series exist yet.',
 details: { count: 0 }
 };
 }

 console.log(` ✓ Found ${popularSeries.length} popular series`);
 console.log(` ✓ Top series: "${popularSeries[0].title}" with ${popularSeries[0].viewCount} views`);

 const allHaveRequiredFields = popularSeries.every(s => 
 s.id && s.title && s.coinPrice !== null && s.videoCount > 0
 );

 if (!allHaveRequiredFields) {
 return {
 passed: false,
 message: 'Some series are missing required fields',
 details: popularSeries
 };
 }

 return {
 passed: true,
 message: `Successfully queried ${popularSeries.length} popular series`,
 details: {
 count: popularSeries.length,
 topSeries: popularSeries.slice(0, 3).map(s => ({
 title: s.title,
 videoCount: s.videoCount,
 viewCount: s.viewCount,
 coinPrice: s.coinPrice
 }))
 }
 };
 } catch (error) {
 return {
 passed: false,
 message: 'Failed to query popular series',
 details: error instanceof Error ? error.message : 'Unknown error'
 };
 }
}

async function verifySeriesWithVideos(): Promise<VerificationResult> {
 try {
 console.log('\n📹 Verifying series have videos...');

 const seriesWithVideos = await db
 .select({
 id: series.id,
 title: series.title,
 videoCount: series.videoCount,
 })
 .from(series)
 .where(
 and(
 eq(series.isActive, true),
 sql`${series.videoCount} > 0`
 )
 )
 .limit(10);

 if (seriesWithVideos.length === 0) {
 return {
 passed: false,
 message: 'No series with videos found',
 details: { count: 0 }
 };
 }

 console.log(` ✓ Found ${seriesWithVideos.length} series with videos`);
 seriesWithVideos.forEach(s => {
 console.log(` - "${s.title}": ${s.videoCount} videos`);
 });

 return {
 passed: true,
 message: `Found ${seriesWithVideos.length} series with videos`,
 details: { count: seriesWithVideos.length }
 };
 } catch (error) {
 return {
 passed: false,
 message: 'Failed to verify series with videos',
 details: error instanceof Error ? error.message : 'Unknown error'
 };
 }
}

async function verifySeriesPricing(): Promise<VerificationResult> {
 try {
 console.log('\n💰 Verifying series pricing...');

 const seriesWithPricing = await db
 .select({
 id: series.id,
 title: series.title,
 coinPrice: series.coinPrice,
 })
 .from(series)
 .where(eq(series.isActive, true))
 .limit(10);

 if (seriesWithPricing.length === 0) {
 return {
 passed: false,
 message: 'No series found for pricing verification',
 details: { count: 0 }
 };
 }

 const invalidPricing = seriesWithPricing.filter(s => 
 s.coinPrice === null || s.coinPrice < 1 || s.coinPrice > 1000000
 );

 if (invalidPricing.length > 0) {
 return {
 passed: false,
 message: 'Some series have invalid pricing',
 details: invalidPricing
 };
 }

 console.log(` ✓ All ${seriesWithPricing.length} series have valid pricing`);
 console.log(` ✓ Price range: ${Math.min(...seriesWithPricing.map(s => s.coinPrice))} - ${Math.max(...seriesWithPricing.map(s => s.coinPrice))} coins`);

 return {
 passed: true,
 message: `All series have valid pricing`,
 details: {
 count: seriesWithPricing.length,
 minPrice: Math.min(...seriesWithPricing.map(s => s.coinPrice)),
 maxPrice: Math.max(...seriesWithPricing.map(s => s.coinPrice))
 }
 };
 } catch (error) {
 return {
 passed: false,
 message: 'Failed to verify series pricing',
 details: error instanceof Error ? error.message : 'Unknown error'
 };
 }
}

async function verifyComponentFiles(): Promise<VerificationResult> {
 try {
 console.log('\n📁 Verifying component files...');

 const fs = require('fs');
 const path = require('path');

 const requiredFiles = [
 'src/components/discover/SeriesCard.tsx',
 'src/components/discover/PopularSeries.tsx',
 'src/app/api/discover/series/route.ts',
 ];

 const missingFiles = requiredFiles.filter(file => {
 const fullPath = path.join(process.cwd(), file);
 return !fs.existsSync(fullPath);
 });

 if (missingFiles.length > 0) {
 return {
 passed: false,
 message: 'Some required files are missing',
 details: { missingFiles }
 };
 }

 console.log(' ✓ All required component files exist');
 requiredFiles.forEach(file => {
 console.log(` - ${file}`);
 });

 return {
 passed: true,
 message: 'All required component files exist',
 details: { files: requiredFiles }
 };
 } catch (error) {
 return {
 passed: false,
 message: 'Failed to verify component files',
 details: error instanceof Error ? error.message : 'Unknown error'
 };
 }
}

async function main() {
 console.log('🔍 Starting Discover Page Series Integration Verification\n');
 console.log('=' .repeat(60));

 const results: VerificationResult[] = [];

 results.push(await verifyComponentFiles());
 results.push(await verifyPopularSeriesQuery());
 results.push(await verifySeriesWithVideos());
 results.push(await verifySeriesPricing());

 console.log('\n' + '='.repeat(60));
 console.log('\n📋 VERIFICATION SUMMARY\n');

 const passed = results.filter(r => r.passed).length;
 const failed = results.filter(r => !r.passed).length;

 results.forEach((result, index) => {
 const icon = result.passed ? '✅' : '❌';
 console.log(`${icon} Check ${index + 1}: ${result.message}`);
 if (result.details && !result.passed) {
 console.log(` Details: ${JSON.stringify(result.details, null, 2)}`);
 }
 });

 console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${results.length} checks`);

 if (failed === 0) {
 console.log('\n✨ All verifications passed! Discover page series integration is working correctly.');
 } else {
 console.log('\n⚠️ Some verifications failed. Please review the details above.');
 }

 console.log('\n' + '='.repeat(60));

 process.exit(failed > 0 ? 1 : 0);
}

main().catch(error => {
 console.error('❌ Verification script failed:', error);
 process.exit(1);
});
