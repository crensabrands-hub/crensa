

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { videoRepository, userRepository } from '@/lib/database/repositories'
import { testDatabaseConnection, closeDatabaseConnection } from '@/lib/database/connection'

describe('VideoRepository Integration Tests', () => {
 let testCreatorId: string

 beforeAll(async () => {

 const isConnected = await testDatabaseConnection()
 if (!isConnected) {
 throw new Error('Database connection failed')
 }

 const creator = await userRepository.create({
 clerkId: 'test_video_creator',
 email: 'videocreator@example.com',
 username: 'videocreator',
 role: 'creator'
 })
 testCreatorId = creator.id
 })

 afterAll(async () => {
 await closeDatabaseConnection()
 })

 describe('Video CRUD Operations', () => {
 let testVideoId: string

 it('should create a new video', async () => {
 const videoData = {
 creatorId: testCreatorId,
 title: 'Test Video',
 description: 'This is a test video',
 videoUrl: 'https://example.com/video.mp4',
 thumbnailUrl: 'https://example.com/thumbnail.jpg',
 duration: 120,
 creditCost: '2.50',
 category: 'Education',
 tags: ['test', 'video', 'education']
 }

 const video = await videoRepository.create(videoData)

 expect(video).toBeDefined()
 expect(video.title).toBe(videoData.title)
 expect(video.creatorId).toBe(testCreatorId)
 expect(video.creditCost).toBe(videoData.creditCost)
 expect(video.isActive).toBe(true)

 testVideoId = video.id
 })

 it('should find video by ID with creator info', async () => {
 const video = await videoRepository.findById(testVideoId)

 expect(video).toBeDefined()
 expect(video?.id).toBe(testVideoId)
 expect(video?.title).toBe('Test Video')
 expect(video?.creator).toBeDefined()
 expect(video?.creator.username).toBe('videocreator')
 })

 it('should find videos with filters', async () => {
 const result = await videoRepository.findMany({
 creatorId: testCreatorId,
 category: 'Education',
 isActive: true
 })

 expect(result.videos).toBeDefined()
 expect(result.videos.length).toBeGreaterThan(0)
 expect(result.total).toBeGreaterThan(0)
 expect(result.videos[0].creator).toBeDefined()
 })

 it('should find videos by creator', async () => {
 const result = await videoRepository.findByCreator(testCreatorId)

 expect(result.videos).toBeDefined()
 expect(result.videos.length).toBeGreaterThan(0)
 expect(result.total).toBeGreaterThan(0)
 expect(result.videos[0].creatorId).toBe(testCreatorId)
 })

 it('should update video', async () => {
 const updatedVideo = await videoRepository.update(testVideoId, {
 title: 'Updated Test Video',
 description: 'Updated description',
 creditCost: '3.00'
 })

 expect(updatedVideo).toBeDefined()
 expect(updatedVideo?.title).toBe('Updated Test Video')
 expect(updatedVideo?.description).toBe('Updated description')
 expect(updatedVideo?.creditCost).toBe('3.00')
 })

 it('should increment view count', async () => {
 const originalVideo = await videoRepository.findById(testVideoId)
 const originalViewCount = originalVideo?.viewCount || 0

 const updatedVideo = await videoRepository.incrementViewCount(testVideoId)

 expect(updatedVideo).toBeDefined()
 expect(updatedVideo?.viewCount).toBe(originalViewCount + 1)
 })

 it('should update earnings', async () => {
 const originalVideo = await videoRepository.findById(testVideoId)
 const originalEarnings = parseFloat(originalVideo?.totalEarnings || '0')

 const updatedVideo = await videoRepository.updateEarnings(testVideoId, 5.00)

 expect(updatedVideo).toBeDefined()
 expect(parseFloat(updatedVideo?.totalEarnings || '0')).toBe(originalEarnings + 5.00)
 })

 it('should search videos', async () => {
 const result = await videoRepository.findMany({
 search: 'Updated Test'
 })

 expect(result.videos).toBeDefined()
 expect(result.videos.length).toBeGreaterThan(0)
 expect(result.videos[0].title).toContain('Updated Test')
 })

 it('should get categories', async () => {
 const categories = await videoRepository.getCategories()

 expect(categories).toBeDefined()
 expect(categories).toContain('Education')
 })

 it('should delete video', async () => {
 const deleted = await videoRepository.delete(testVideoId)
 expect(deleted).toBe(true)

 const video = await videoRepository.findById(testVideoId)
 expect(video).toBeNull()
 })
 })

 describe('Video Discovery', () => {
 beforeEach(async () => {

 const videoData = [
 {
 creatorId: testCreatorId,
 title: 'Trending Video 1',
 videoUrl: 'https://example.com/trending1.mp4',
 thumbnailUrl: 'https://example.com/thumb1.jpg',
 duration: 180,
 creditCost: '2.00',
 category: 'Entertainment',
 viewCount: 1000,
 totalEarnings: '200.00'
 },
 {
 creatorId: testCreatorId,
 title: 'Featured Video 1',
 videoUrl: 'https://example.com/featured1.mp4',
 thumbnailUrl: 'https://example.com/thumb2.jpg',
 duration: 240,
 creditCost: '3.00',
 category: 'Education',
 viewCount: 500,
 totalEarnings: '150.00'
 }
 ]

 for (const video of videoData) {
 await videoRepository.create(video)
 }
 })

 it('should get trending videos', async () => {
 const trendingVideos = await videoRepository.getTrending(5)

 expect(trendingVideos).toBeDefined()
 expect(trendingVideos.length).toBeGreaterThan(0)
 expect(trendingVideos[0].creator).toBeDefined()
 })

 it('should get featured videos', async () => {
 const featuredVideos = await videoRepository.getFeatured(5)

 expect(featuredVideos).toBeDefined()
 expect(featuredVideos.length).toBeGreaterThan(0)
 expect(featuredVideos[0].creator).toBeDefined()
 })
 })
})