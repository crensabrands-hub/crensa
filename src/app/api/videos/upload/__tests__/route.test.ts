import { NextRequest } from 'next/server'
import { POST } from '../route'
import { auth } from '@clerk/nextjs/server'
import { v2 as cloudinary } from 'cloudinary'
import { db } from '@/lib/database'

jest.mock('@clerk/nextjs/server')
jest.mock('cloudinary')
jest.mock('@/lib/database')

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockCloudinary = cloudinary as jest.Mocked<typeof cloudinary>
const mockDb = db as jest.Mocked<typeof db>

const mockSelect = jest.fn()
const mockInsert = jest.fn()
const mockUpdate = jest.fn()
const mockWhere = jest.fn()
const mockLimit = jest.fn()
const mockValues = jest.fn()
const mockReturning = jest.fn()
const mockSet = jest.fn()
const mockRaw = jest.fn()

mockDb.select = jest.fn(() => ({
 from: jest.fn(() => ({
 where: mockWhere.mockReturnValue({
 limit: mockLimit.mockReturnValue(Promise.resolve([{
 id: 'user-id',
 clerkId: 'clerk-id',
 role: 'creator'
 }]))
 })
 }))
}))

mockDb.insert = jest.fn(() => ({
 values: mockValues.mockReturnValue({
 returning: mockReturning.mockReturnValue(Promise.resolve([{
 id: 'video-id',
 creatorId: 'user-id',
 title: 'Test Video',
 videoUrl: 'https://test.com/video.mp4',
 thumbnailUrl: 'https://test.com/thumb.jpg',
 duration: 120,
 creditCost: 5,
 category: 'Entertainment',
 tags: ['test'],
 viewCount: 0,
 totalEarnings: 0,
 isActive: true,
 createdAt: '2024-01-01T00:00:00.000Z',
 updatedAt: '2024-01-01T00:00:00.000Z'
 }]))
 })
}))

mockDb.update = jest.fn(() => ({
 set: mockSet.mockReturnValue({
 where: jest.fn().mockReturnValue(Promise.resolve())
 })
}))

mockDb.raw = mockRaw

const createMockRequest = (formData: FormData): NextRequest => {
 return {
 formData: () => Promise.resolve(formData),
 } as NextRequest
}

const createMockFile = (name = 'test.mp4', size = 1024, type = 'video/mp4'): File => {
 const file = new File(['content'], name, { type })
 Object.defineProperty(file, 'size', { value: size })
 Object.defineProperty(file, 'arrayBuffer', {
 value: () => Promise.resolve(new ArrayBuffer(size))
 })
 return file
}

describe('/api/videos/upload', () => {
 beforeEach(() => {
 jest.clearAllMocks()

 mockCloudinary.config = jest.fn()

 mockCloudinary.uploader = {
 upload_stream: jest.fn((options, callback) => {
 const mockResult = {
 public_id: 'test-public-id',
 secure_url: 'https://cloudinary.com/video.mp4',
 duration: 120,
 format: 'mp4'
 }
 
 const stream = {
 end: jest.fn(() => {
 if (callback) callback(null, mockResult)
 })
 }
 
 return stream
 })
 } as any

 mockCloudinary.url = jest.fn(() => 'https://cloudinary.com/thumb.jpg')
 })

 it('requires authentication', async () => {
 mockAuth.mockResolvedValue({ userId: null })
 
 const formData = new FormData()
 const request = createMockRequest(formData)
 
 const response = await POST(request)
 const data = await response.json()
 
 expect(response.status).toBe(401)
 expect(data.error).toBe('Unauthorized')
 })

 it('requires creator role', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-id' })

 mockLimit.mockReturnValueOnce(Promise.resolve([{
 id: 'user-id',
 clerkId: 'clerk-id',
 role: 'member'
 }]))
 
 const formData = new FormData()
 const request = createMockRequest(formData)
 
 const response = await POST(request)
 const data = await response.json()
 
 expect(response.status).toBe(403)
 expect(data.error).toBe('Only creators can upload videos')
 })

 it('validates required fields', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-id' })
 
 const formData = new FormData()

 const request = createMockRequest(formData)
 
 const response = await POST(request)
 const data = await response.json()
 
 expect(response.status).toBe(400)
 expect(data.error).toBe('Video file and metadata are required')
 })

 it('validates file size', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-id' })
 
 const formData = new FormData()
 const largeFile = createMockFile('large.mp4', 200 * 1024 * 1024) // 200MB
 formData.append('video', largeFile)
 formData.append('metadata', JSON.stringify({
 title: 'Test',
 category: 'Entertainment',
 creditCost: 1
 }))
 
 const request = createMockRequest(formData)
 
 const response = await POST(request)
 const data = await response.json()
 
 expect(response.status).toBe(400)
 expect(data.error).toContain('File size too large')
 })

 it('validates file format', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-id' })
 
 const formData = new FormData()
 const invalidFile = createMockFile('test.txt', 1024, 'text/plain')
 formData.append('video', invalidFile)
 formData.append('metadata', JSON.stringify({
 title: 'Test',
 category: 'Entertainment',
 creditCost: 1
 }))
 
 const request = createMockRequest(formData)
 
 const response = await POST(request)
 const data = await response.json()
 
 expect(response.status).toBe(400)
 expect(data.error).toContain('Invalid file format')
 })

 it('validates metadata format', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-id' })
 
 const formData = new FormData()
 const validFile = createMockFile()
 formData.append('video', validFile)
 formData.append('metadata', 'invalid json')
 
 const request = createMockRequest(formData)
 
 const response = await POST(request)
 const data = await response.json()
 
 expect(response.status).toBe(400)
 expect(data.error).toBe('Invalid metadata format')
 })

 it('validates required metadata fields', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-id' })
 
 const formData = new FormData()
 const validFile = createMockFile()
 formData.append('video', validFile)
 formData.append('metadata', JSON.stringify({

 description: 'Test description'
 }))
 
 const request = createMockRequest(formData)
 
 const response = await POST(request)
 const data = await response.json()
 
 expect(response.status).toBe(400)
 expect(data.error).toBe('Title, category, and credit cost are required')
 })

 it('validates credit cost range', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-id' })
 
 const formData = new FormData()
 const validFile = createMockFile()
 formData.append('video', validFile)
 formData.append('metadata', JSON.stringify({
 title: 'Test',
 category: 'Entertainment',
 creditCost: 150 // Too high
 }))
 
 const request = createMockRequest(formData)
 
 const response = await POST(request)
 const data = await response.json()
 
 expect(response.status).toBe(400)
 expect(data.error).toBe('Credit cost must be between 1 and 100')
 })

 it('successfully uploads video', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-id' })
 
 const formData = new FormData()
 const validFile = createMockFile()
 formData.append('video', validFile)
 formData.append('metadata', JSON.stringify({
 title: 'Test Video',
 description: 'Test description',
 category: 'Entertainment',
 creditCost: 5,
 tags: ['test', 'video']
 }))
 
 const request = createMockRequest(formData)
 
 const response = await POST(request)
 const data = await response.json()
 
 expect(response.status).toBe(200)
 expect(data.success).toBe(true)
 expect(data.video).toMatchObject({
 id: 'video-id',
 title: 'Test Video',
 creditCost: 5,
 category: 'Entertainment'
 })

 expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalledWith(
 expect.objectContaining({
 resource_type: 'video',
 folder: 'crensa/videos',
 format: 'mp4'
 }),
 expect.any(Function)
 )

 expect(mockDb.insert).toHaveBeenCalled()
 expect(mockDb.update).toHaveBeenCalled()
 })

 it('handles Cloudinary upload errors', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-id' })

 mockCloudinary.uploader.upload_stream = jest.fn((options, callback) => {
 const stream = {
 end: jest.fn(() => {
 if (callback) callback(new Error('Cloudinary error'), null)
 })
 }
 return stream
 }) as any
 
 const formData = new FormData()
 const validFile = createMockFile()
 formData.append('video', validFile)
 formData.append('metadata', JSON.stringify({
 title: 'Test',
 category: 'Entertainment',
 creditCost: 1
 }))
 
 const request = createMockRequest(formData)
 
 const response = await POST(request)
 const data = await response.json()
 
 expect(response.status).toBe(500)
 expect(data.error).toBe('Failed to upload video. Please try again.')
 })

 it('handles database errors', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-id' })

 mockReturning.mockRejectedValueOnce(new Error('Database error'))
 
 const formData = new FormData()
 const validFile = createMockFile()
 formData.append('video', validFile)
 formData.append('metadata', JSON.stringify({
 title: 'Test',
 category: 'Entertainment',
 creditCost: 1
 }))
 
 const request = createMockRequest(formData)
 
 const response = await POST(request)
 const data = await response.json()
 
 expect(response.status).toBe(500)
 expect(data.error).toBe('Failed to upload video. Please try again.')
 })

 it('handles user not found', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-id' })

 mockLimit.mockReturnValueOnce(Promise.resolve([]))
 
 const formData = new FormData()
 const validFile = createMockFile()
 formData.append('video', validFile)
 formData.append('metadata', JSON.stringify({
 title: 'Test',
 category: 'Entertainment',
 creditCost: 1
 }))
 
 const request = createMockRequest(formData)
 
 const response = await POST(request)
 const data = await response.json()
 
 expect(response.status).toBe(403)
 expect(data.error).toBe('Only creators can upload videos')
 })

 it('trims metadata strings', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-id' })
 
 const formData = new FormData()
 const validFile = createMockFile()
 formData.append('video', validFile)
 formData.append('metadata', JSON.stringify({
 title: ' Test Video ',
 description: ' Test description ',
 category: 'Entertainment',
 creditCost: 1
 }))
 
 const request = createMockRequest(formData)
 
 const response = await POST(request)
 
 expect(response.status).toBe(200)

 expect(mockValues).toHaveBeenCalledWith(
 expect.objectContaining({
 title: 'Test Video',
 description: 'Test description'
 })
 )
 })
})