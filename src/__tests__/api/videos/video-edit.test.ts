

import { NextRequest } from 'next/server'
import { PATCH } from '@/app/api/videos/[id]/route'
import { auth } from '@clerk/nextjs/server'
import { userRepository } from '@/lib/database/repositories/users'
import { db } from '@/lib/database/connection'

jest.mock('@clerk/nextjs/server')
jest.mock('@/lib/database/repositories/users')
jest.mock('@/lib/database/connection')

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>
const mockDb = db as jest.Mocked<typeof db>

describe('/api/videos/[id] PATCH', () => {
 const mockUser = {
 id: 'user-123',
 clerkId: 'clerk-123',
 email: 'creator@test.com',
 username: 'testcreator',
 role: 'creator' as const,
 isActive: true,
 isSuspended: false,
 createdAt: new Date(),
 updatedAt: new Date()
 }

 const mockVideo = {
 id: 'video-123',
 creatorId: 'user-123',
 title: 'Test Video',
 description: 'Test Description',
 category: 'Entertainment',
 tags: ['test', 'video'],
 creditCost: '5.00',
 isActive: true
 }

 beforeEach(() => {
 jest.clearAllMocks()
 })

 it('should successfully update video with valid data', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-123' })
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser)

 mockDb.select.mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([mockVideo])
 })
 })
 } as any)

 mockDb.update.mockReturnValue({
 set: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 returning: jest.fn().mockResolvedValue([{
 ...mockVideo,
 title: 'Updated Title',
 updatedAt: new Date()
 }])
 })
 })
 } as any)

 mockDb.select.mockReturnValueOnce({
 from: jest.fn().mockReturnValue({
 leftJoin: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([{
 username: 'testcreator',
 displayName: 'Test Creator',
 avatar: null
 }])
 })
 })
 })
 } as any)

 const request = new NextRequest('http://localhost:3000/api/videos/video-123', {
 method: 'PATCH',
 body: JSON.stringify({
 title: 'Updated Title',
 description: 'Updated Description',
 category: 'Education',
 tags: ['updated', 'test'],
 creditCost: 3
 })
 })

 const response = await PATCH(request, { params: Promise.resolve({ id: 'video-123' }) })
 const data = await response.json()

 expect(response.status).toBe(200)
 expect(data.success).toBe(true)
 expect(data.message).toBe('Video updated successfully')
 expect(data.video.title).toBe('Updated Title')
 })

 it('should return 401 for unauthenticated requests', async () => {
 mockAuth.mockResolvedValue({ userId: null })

 const request = new NextRequest('http://localhost:3000/api/videos/video-123', {
 method: 'PATCH',
 body: JSON.stringify({ title: 'Updated Title' })
 })

 const response = await PATCH(request, { params: Promise.resolve({ id: 'video-123' }) })
 const data = await response.json()

 expect(response.status).toBe(401)
 expect(data.success).toBe(false)
 expect(data.error).toBe('Authentication required')
 })

 it('should return 403 for non-creator users', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-123' })
 mockUserRepository.findByClerkId.mockResolvedValue({
 ...mockUser,
 role: 'member'
 })

 const request = new NextRequest('http://localhost:3000/api/videos/video-123', {
 method: 'PATCH',
 body: JSON.stringify({ title: 'Updated Title' })
 })

 const response = await PATCH(request, { params: Promise.resolve({ id: 'video-123' }) })
 const data = await response.json()

 expect(response.status).toBe(403)
 expect(data.success).toBe(false)
 expect(data.error).toBe('Only creators can update videos')
 })

 it('should return 400 for invalid JSON', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-123' })
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser)

 const request = new NextRequest('http://localhost:3000/api/videos/video-123', {
 method: 'PATCH',
 body: 'invalid json'
 })

 const response = await PATCH(request, { params: Promise.resolve({ id: 'video-123' }) })
 const data = await response.json()

 expect(response.status).toBe(400)
 expect(data.success).toBe(false)
 expect(data.error).toBe('Invalid JSON format in request body')
 })

 it('should return 400 for empty request body', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-123' })
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser)

 const request = new NextRequest('http://localhost:3000/api/videos/video-123', {
 method: 'PATCH',
 body: ''
 })

 const response = await PATCH(request, { params: Promise.resolve({ id: 'video-123' }) })
 const data = await response.json()

 expect(response.status).toBe(400)
 expect(data.success).toBe(false)
 expect(data.error).toBe('Request body is required')
 })

 it('should validate title length', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-123' })
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser)

 const request = new NextRequest('http://localhost:3000/api/videos/video-123', {
 method: 'PATCH',
 body: JSON.stringify({
 title: 'a'.repeat(256) // Too long
 })
 })

 const response = await PATCH(request, { params: Promise.resolve({ id: 'video-123' }) })
 const data = await response.json()

 expect(response.status).toBe(400)
 expect(data.success).toBe(false)
 expect(data.error).toBe('Validation failed')
 expect(data.details).toContain('Title cannot exceed 255 characters')
 })

 it('should validate category', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-123' })
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser)

 const request = new NextRequest('http://localhost:3000/api/videos/video-123', {
 method: 'PATCH',
 body: JSON.stringify({
 category: 'InvalidCategory'
 })
 })

 const response = await PATCH(request, { params: Promise.resolve({ id: 'video-123' }) })
 const data = await response.json()

 expect(response.status).toBe(400)
 expect(data.success).toBe(false)
 expect(data.error).toBe('Validation failed')
 expect(data.details[0]).toContain('Category must be one of:')
 })

 it('should validate credit cost range', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-123' })
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser)

 const request = new NextRequest('http://localhost:3000/api/videos/video-123', {
 method: 'PATCH',
 body: JSON.stringify({
 creditCost: 101 // Too high
 })
 })

 const response = await PATCH(request, { params: Promise.resolve({ id: 'video-123' }) })
 const data = await response.json()

 expect(response.status).toBe(400)
 expect(data.success).toBe(false)
 expect(data.error).toBe('Validation failed')
 expect(data.details).toContain('Credit cost must be between 1 and 100')
 })

 it('should validate tags array', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-123' })
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser)

 const request = new NextRequest('http://localhost:3000/api/videos/video-123', {
 method: 'PATCH',
 body: JSON.stringify({
 tags: Array(11).fill('tag') // Too many tags
 })
 })

 const response = await PATCH(request, { params: Promise.resolve({ id: 'video-123' }) })
 const data = await response.json()

 expect(response.status).toBe(400)
 expect(data.success).toBe(false)
 expect(data.error).toBe('Validation failed')
 expect(data.details).toContain('Cannot have more than 10 tags')
 })

 it('should return 404 for non-existent video', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-123' })
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser)

 mockDb.select.mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([])
 })
 })
 } as any)

 const request = new NextRequest('http://localhost:3000/api/videos/video-123', {
 method: 'PATCH',
 body: JSON.stringify({ title: 'Updated Title' })
 })

 const response = await PATCH(request, { params: Promise.resolve({ id: 'video-123' }) })
 const data = await response.json()

 expect(response.status).toBe(404)
 expect(data.success).toBe(false)
 expect(data.error).toBe('Video not found')
 })

 it('should return 403 when trying to update another creator\'s video', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-123' })
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser)

 mockDb.select.mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([{
 ...mockVideo,
 creatorId: 'different-user-id'
 }])
 })
 })
 } as any)

 const request = new NextRequest('http://localhost:3000/api/videos/video-123', {
 method: 'PATCH',
 body: JSON.stringify({ title: 'Updated Title' })
 })

 const response = await PATCH(request, { params: Promise.resolve({ id: 'video-123' }) })
 const data = await response.json()

 expect(response.status).toBe(403)
 expect(data.success).toBe(false)
 expect(data.error).toBe('You can only update your own videos')
 })

 it('should return 400 for inactive video', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-123' })
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser)

 mockDb.select.mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([{
 ...mockVideo,
 isActive: false
 }])
 })
 })
 } as any)

 const request = new NextRequest('http://localhost:3000/api/videos/video-123', {
 method: 'PATCH',
 body: JSON.stringify({ title: 'Updated Title' })
 })

 const response = await PATCH(request, { params: Promise.resolve({ id: 'video-123' }) })
 const data = await response.json()

 expect(response.status).toBe(400)
 expect(data.success).toBe(false)
 expect(data.error).toBe('Cannot update inactive video')
 })
})