

import { db } from '@/lib/database'
import { videos, series, seriesVideos, users, creatorProfiles } from '@/lib/database/schema'
import { eq, and, sql } from 'drizzle-orm'

interface ValidationResult {
 test: string
 passed: boolean
 message: string
}

const results: ValidationResult[] = []

async function verifyPricingValidation() {
 console.log('\n=== Testing Pricing Validation Logic ===\n')

 const seriesVideosWithPrice = await db
 .select({
 id: videos.id,
 title: videos.title,
 coinPrice: videos.coinPrice,
 seriesId: videos.seriesId
 })
 .from(videos)
 .where(and(
 sql`${videos.seriesId} IS NOT NULL`,
 sql`${videos.coinPrice} != 0`
 ))

 if (seriesVideosWithPrice.length === 0) {
 results.push({
 test: 'Series videos pricing validation',
 passed: true,
 message: 'All series videos have coin price of 0'
 })
 console.log('✓ All series videos have coin price of 0')
 } else {
 results.push({
 test: 'Series videos pricing validation',
 passed: false,
 message: `Found ${seriesVideosWithPrice.length} series videos with non-zero prices`
 })
 console.log(`✗ Found ${seriesVideosWithPrice.length} series videos with non-zero prices:`)
 seriesVideosWithPrice.forEach(v => {
 console.log(` - ${v.title} (ID: ${v.id}): ${v.coinPrice} coins`)
 })
 }

 const standaloneVideosWithoutPrice = await db
 .select({
 id: videos.id,
 title: videos.title,
 coinPrice: videos.coinPrice,
 seriesId: videos.seriesId
 })
 .from(videos)
 .where(and(
 sql`${videos.seriesId} IS NULL`,
 sql`${videos.coinPrice} < 1`
 ))

 if (standaloneVideosWithoutPrice.length === 0) {
 results.push({
 test: 'Standalone videos pricing validation',
 passed: true,
 message: 'All standalone videos have coin price >= 1'
 })
 console.log('✓ All standalone videos have coin price >= 1')
 } else {
 results.push({
 test: 'Standalone videos pricing validation',
 passed: false,
 message: `Found ${standaloneVideosWithoutPrice.length} standalone videos with price < 1`
 })
 console.log(`✗ Found ${standaloneVideosWithoutPrice.length} standalone videos with price < 1:`)
 standaloneVideosWithoutPrice.forEach(v => {
 console.log(` - ${v.title} (ID: ${v.id}): ${v.coinPrice} coins`)
 })
 }
}

async function verifySeriesCountSync() {
 console.log('\n=== Testing Series Count Synchronization ===\n')

 const seriesList = await db
 .select({
 id: series.id,
 title: series.title,
 videoCount: series.videoCount,
 totalDuration: series.totalDuration
 })
 .from(series)

 let allCountsCorrect = true
 let allDurationsCorrect = true

 for (const s of seriesList) {

 const [actualCount] = await db
 .select({ count: sql<number>`COUNT(*)::int` })
 .from(seriesVideos)
 .where(eq(seriesVideos.seriesId, s.id))

 const [actualDuration] = await db
 .select({ total: sql<number>`COALESCE(SUM(${videos.duration}), 0)::int` })
 .from(videos)
 .where(eq(videos.seriesId, s.id))

 const count = actualCount?.count ?? 0
 const duration = actualDuration?.total ?? 0

 if (s.videoCount !== count) {
 allCountsCorrect = false
 console.log(`✗ Series "${s.title}" (ID: ${s.id}):`)
 console.log(` Expected count: ${count}, Stored count: ${s.videoCount}`)
 }

 if (s.totalDuration !== duration) {
 allDurationsCorrect = false
 console.log(`✗ Series "${s.title}" (ID: ${s.id}):`)
 console.log(` Expected duration: ${duration}s, Stored duration: ${s.totalDuration}s`)
 }
 }

 if (allCountsCorrect) {
 results.push({
 test: 'Series video count synchronization',
 passed: true,
 message: 'All series have correct video counts'
 })
 console.log('✓ All series have correct video counts')
 } else {
 results.push({
 test: 'Series video count synchronization',
 passed: false,
 message: 'Some series have incorrect video counts'
 })
 }

 if (allDurationsCorrect) {
 results.push({
 test: 'Series duration synchronization',
 passed: true,
 message: 'All series have correct total durations'
 })
 console.log('✓ All series have correct total durations')
 } else {
 results.push({
 test: 'Series duration synchronization',
 passed: false,
 message: 'Some series have incorrect total durations'
 })
 }
}

async function verifySeriesVideosJunction() {
 console.log('\n=== Testing Series Videos Junction Table ===\n')

 const videosInSeries = await db
 .select({
 id: videos.id,
 title: videos.title,
 seriesId: videos.seriesId
 })
 .from(videos)
 .where(sql`${videos.seriesId} IS NOT NULL`)

 let allHaveJunctionRecords = true

 for (const video of videosInSeries) {
 const [junctionRecord] = await db
 .select()
 .from(seriesVideos)
 .where(and(
 eq(seriesVideos.videoId, video.id),
 eq(seriesVideos.seriesId, video.seriesId!)
 ))
 .limit(1)

 if (!junctionRecord) {
 allHaveJunctionRecords = false
 console.log(`✗ Video "${video.title}" (ID: ${video.id}) is in series ${video.seriesId} but has no junction record`)
 }
 }

 if (allHaveJunctionRecords) {
 results.push({
 test: 'Series videos junction records',
 passed: true,
 message: 'All series videos have junction records'
 })
 console.log('✓ All series videos have junction records')
 } else {
 results.push({
 test: 'Series videos junction records',
 passed: false,
 message: 'Some series videos are missing junction records'
 })
 }

 const duplicateOrders = await db.execute(sql`
 SELECT series_id, order_index, COUNT(*) as count
 FROM series_videos
 GROUP BY series_id, order_index
 HAVING COUNT(*) > 1
 `)

 if (duplicateOrders.rows.length === 0) {
 results.push({
 test: 'Series video order uniqueness',
 passed: true,
 message: 'All series videos have unique order indices'
 })
 console.log('✓ All series videos have unique order indices')
 } else {
 results.push({
 test: 'Series video order uniqueness',
 passed: false,
 message: `Found ${duplicateOrders.rows.length} series with duplicate order indices`
 })
 console.log(`✗ Found ${duplicateOrders.rows.length} series with duplicate order indices`)
 }
}

async function verifyOwnershipIntegrity() {
 console.log('\n=== Testing Ownership Integrity ===\n')

 const ownershipMismatches = await db.execute(sql`
 SELECT 
 v.id as video_id,
 v.title as video_title,
 v.creator_id as video_creator_id,
 s.id as series_id,
 s.title as series_title,
 s.creator_id as series_creator_id
 FROM videos v
 JOIN series s ON v.series_id = s.id
 WHERE v.creator_id != s.creator_id
 `)

 if (ownershipMismatches.rows.length === 0) {
 results.push({
 test: 'Series ownership integrity',
 passed: true,
 message: 'All videos in series belong to the series creator'
 })
 console.log('✓ All videos in series belong to the series creator')
 } else {
 results.push({
 test: 'Series ownership integrity',
 passed: false,
 message: `Found ${ownershipMismatches.rows.length} videos with ownership mismatches`
 })
 console.log(`✗ Found ${ownershipMismatches.rows.length} videos with ownership mismatches:`)
 ownershipMismatches.rows.forEach((row: any) => {
 console.log(` - Video "${row.video_title}" (creator: ${row.video_creator_id}) in series "${row.series_title}" (creator: ${row.series_creator_id})`)
 })
 }
}

async function main() {
 console.log('╔════════════════════════════════════════════════════════════╗')
 console.log('║ Video Save API Enhancement Verification ║')
 console.log('╚════════════════════════════════════════════════════════════╝')

 try {
 await verifyPricingValidation()
 await verifySeriesCountSync()
 await verifySeriesVideosJunction()
 await verifyOwnershipIntegrity()

 console.log('\n' + '='.repeat(60))
 console.log('VERIFICATION SUMMARY')
 console.log('='.repeat(60))

 const passed = results.filter(r => r.passed).length
 const failed = results.filter(r => !r.passed).length

 results.forEach(result => {
 const icon = result.passed ? '✓' : '✗'
 console.log(`${icon} ${result.test}: ${result.message}`)
 })

 console.log('\n' + '='.repeat(60))
 console.log(`Total: ${results.length} tests`)
 console.log(`Passed: ${passed}`)
 console.log(`Failed: ${failed}`)
 console.log('='.repeat(60))

 if (failed === 0) {
 console.log('\n✓ All verifications passed! The Video Save API enhancements are working correctly.')
 } else {
 console.log('\n✗ Some verifications failed. Please review the issues above.')
 }

 } catch (error) {
 console.error('\n✗ Verification failed with error:', error)
 process.exit(1)
 }
}

main()
 .then(() => process.exit(0))
 .catch((error) => {
 console.error('Fatal error:', error)
 process.exit(1)
 })
