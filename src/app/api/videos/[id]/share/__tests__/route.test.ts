import { NextRequest } from 'next/server'
import { POST, GET } from '../route'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/database'
import { videos, users, videoShares } from '@/lib/database/schema'

jest.mock('@clerk/nextjs/server')
jest.mock('@/lib/database')
jest.mock('nanoid', () => ({
 nanoid: jest.fn(() => 'mock-share-token-123')
}))

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockDb = db as jest.Mocked<typeof db>

describe('/api/videos/[id]/share', () => {
 const mockUser = {
 id: 'user-123',
 clerkId: 'clerk-123',
 email: 'creator@test.com',
 username: 'testcreator',
 role: 'creator' as const,
 avatar: null,
 createdAt: new Date(),
 updatedAt: new Date()
 }

 const mockVideo = {
 id: 'video-123',
 creatorId: 'user-123',
 title: 'Test Video',
 description: 'Test description',
 videoUrl: 'https://example.com/video.mp4',
 thumbnailUrl: 'https://example.com/thumb.jpg',
 duration: 120,
 creditCost: '5.00',
 category: 'entertainment',
 tags: ['test'],
 viewCount: 100,
 totalEarnings: '50.00',
 isActive: true,
 createdAt: new Date(),
 updatedAt: new Date()
 }

 beforeEach(() => {
 jest.clearAllMocks()
 process.env.NEXT_PUBLIC_BASE_URL = 'https://test.com'
 })

 describe('POST - Generate share link', () => {
 it('should generate share link for creator', async () => {

 mockAuth.mockResolvedValue({ userId: 'clerk-123' })

 mockDb.select.mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([mockUser])
 })
 })
 } as any)

 const mockVideoQuery = {
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([mockVideo])
 })
 })
 }
 mockDb.select.mockReturnValueOnce(mockVideoQuery as any)

 const mockShareRecord = {
 id: 'share-123',
 videoId: 'video-123',
 creatorId: 'user-123',
 shareToken: 'mock-share-token-123',
 platform: 'direct',
 clickCount: 0,
 viewCount: 0,
 conversionCount: 0,
 isActive: true,
 createdAt: new Date(),
 updatedAt: new Date()
 }

 mockDb.insert.mockReturnValue({
 values: jest.fn().mockReturnValue({
 returning: jest.fn().mockResolvedValue([mockShareRecord])
 })
 } as any)

 const request = new NextRequest('http://localhost:3000/api/videos/video-123/share', {
 method: 'POST',
 body: JSON.stringify({ platform: 'direct' })
 })

 const response = await POST(request, { params: Promise.resolve({ id: 'video-123' }) })
 const data = await response.json()

 expect(response.status).toBe(200)
 expect(data.success).toBe(true)
 expect(data.shareUrl).toBe('https://test.com/watch/mock-share-token-123')
 expect(data.shareToken).toBe('mock-share-token-123')
 expect(data.analytics).toEqual({
 clickCount: 0,
 viewCount: 0,
 conversionCount: 0
 })
 })

 it('should reject non-creator users', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-123' })

 const mockMember = { ...mockUser, role: 'member' as const }
 mockDb.select.mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([mockMember])
 })
 })
 } as any)

 const request = new NextRequest('http://localhost:3000/api/videos/video-123/share', {
 method: 'POST',
 body: JSON.stringify({ platform: 'direct' })
 })

 const response = await POST(request, { params: Promise.resolve({ id: 'video-123' }) })
 const data = await response.json()

 expect(response.status).toBe(403)
 expect(data.error).toBe('Only creators can generate share links')
 })

 it('should reject unauthenticated requests', async () => {
 mockAuth.mockResolvedValue({ userId: null })

 const request = new NextRequest('http://localhost:3000/api/videos/video-123/share', {
 method: 'POST',
 body: JSON.stringify({ platform: 'direct' })
 })

 const response = await POST(request, { params: Promise.resolve({ id: 'video-123' }) })
 const data = await response.json()

 expect(response.status).toBe(401)
 expect(data.error).toBe('Unauthorized')
 })

 it('should handle video not found', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-123' })

 mockDb.select.mockReturnValueOnce({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([mockUser])
 })
 })
 } as any)

 mockDb.select.mockReturnValueOnce({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([])
 })
 })
 } as any)

 const request = new NextRequest('http://localhost:3000/api/videos/video-123/share', {
 method: 'POST',
 body: JSON.stringify({ platform: 'direct' })
 })

 const response = await POST(request, { params: Promise.resolve({ id: 'video-123' }) })
 const data = await response.json()

 expect(response.status).toBe(404)
 expect(data.error).toBe('Video not found')
 })
 })

 describe('GET - Get share analytics', () => {
 it('should return share analytics for creator', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-123' })

 mockDb.select.mockReturnValueOnce({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([mockUser])
 })
 })
 } as any)

 mockDb.select.mockReturnValueOnce({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([mockVideo])
 })
 })
 } as any)

 const mockShares = [
 {
 id: 'share-1',
 shareToken: 'token-1',
 platform: 'direct',
 clickCount: 10,
 viewCount: 5,
 conversionCount: 3,
 lastAccessedAt: new Date(),
 createdAt: new Date()
 },
 {
 id: 'share-2',
 shareToken: 'token-2',
 platform: 'twitter',
 clickCount: 20,
 viewCount: 8,
 conversionCount: 5,
 lastAccessedAt: new Date(),
 createdAt: new Date()
 }
 ]

 mockDb.select.mockReturnValueOnce({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue(mockShares)
 })
 } as any)

 const request = new NextRequest('http://localhost:3000/api/videos/video-123/share')

 const response = await GET(request, { params: Promise.resolve({ id: 'video-123' }) })
 const data = await response.json()

 expect(response.status).toBe(200)
 expect(data.success).toBe(true)
 expect(data.totalAnalytics).toEqual({
 clickCount: 30,
 viewCount: 13,
 conversionCount: 8
 })
 expect(data.platformAnalytics).toEqual({
 direct: { clickCount: 10, viewCount: 5, conversionCount: 3 },
 twitter: { clickCount: 20, viewCount: 8, conversionCount: 5 }
 })
 expect(data.shares).toHaveLength(2)
 })

 it('should reject non-creator users', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-123' })

 const mockMember = { ...mockUser, role: 'member' as const }
 mockDb.select.mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([mockMember])
 })
 })
 } as any)

 const request = new NextRequest('http://localhost:3000/api/videos/video-123/share')

 const response = await GET(request, { params: Promise.resolve({ id: 'video-123' }) })
 const data = await response.json()

 expect(response.status).toBe(403)
 expect(data.error).toBe('Only creators can view share analytics')
 })
 })
})