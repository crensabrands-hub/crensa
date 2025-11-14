

import { POST } from '@/app/api/videos/[id]/watch/route'
import { auth } from '@clerk/nextjs/server'
import { creditService } from '@/lib/services/creditService'
import { userRepository } from '@/lib/database/repositories/users'
import { NextRequest } from 'next/server'

jest.mock('@clerk/nextjs/server')
jest.mock('@/lib/services/creditService')
jest.mock('@/lib/database/repositories/users')

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockCreditService = creditService as jest.Mocked<typeof creditService>
const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>

const mockUser = {
 id: 'user-123',
 clerkId: 'clerk-123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member' as const,
 avatar: null,
 createdAt: new Date(),
 updatedAt: new Date()
}

describe('/api/videos/[id]/watch', () => {
 beforeEach(() => {
 jest.clearAllMocks()
 })

 it('successfully processes video watch for member', async () => {
 const videoId = 'video-456'
 const mockResult = {
 success: true,
 newBalance: 15.5,
 transactionId: 'transaction-789'
 }
 const mockViewingSession = {
 videoId,
 userId: mockUser.id,
 creditsCost: 5,
 startedAt: new Date(),
 transactionId: 'transaction-789'
 }

 mockAuth.mockResolvedValue({ userId: 'clerk-123' })
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser)
 mockCreditService.hasUserWatchedVideo.mockResolvedValue(false)
 mockCreditService.deductCreditsForVideo.mockResolvedValue(mockResult)
 mockCreditService.updateMemberWatchHistory.mockResolvedValue()
 mockCreditService.createViewingSession.mockResolvedValue(mockViewingSession)

 const request = new NextRequest('http://localhost:3000/api/videos/video-456/watch', {
 method: 'POST'
 })
 const response = await POST(request, { params: { id: videoId } })

 expect(response.status).toBe(200)
 
 const data = await response.json()
 expect(data).toEqual({
 success: true,
 newBalance: 15.5,
 transactionId: 'transaction-789',
 viewingSession: mockViewingSession,
 message: 'Credits deducted successfully'
 })

 expect(mockCreditService.deductCreditsForVideo).toHaveBeenCalledWith(mockUser.id, videoId)
 expect(mockCreditService.updateMemberWatchHistory).toHaveBeenCalledWith(mockUser.id, videoId)
 expect(mockCreditService.createViewingSession).toHaveBeenCalledWith(
 mockUser.id,
 videoId,
 'transaction-789'
 )
 })

 it('returns success for already watched video', async () => {
 const videoId = 'video-456'

 mockAuth.mockResolvedValue({ userId: 'clerk-123' })
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser)
 mockCreditService.hasUserWatchedVideo.mockResolvedValue(true)

 const request = new NextRequest('http://localhost:3000/api/videos/video-456/watch', {
 method: 'POST'
 })
 const response = await POST(request, { params: { id: videoId } })

 expect(response.status).toBe(200)
 
 const data = await response.json()
 expect(data).toEqual({
 success: true,
 message: 'Video already watched',
 alreadyWatched: true
 })

 expect(mockCreditService.deductCreditsForVideo).not.toHaveBeenCalled()
 })

 it('returns 401 for unauthenticated user', async () => {
 mockAuth.mockResolvedValue({ userId: null })

 const request = new NextRequest('http://localhost:3000/api/videos/video-456/watch', {
 method: 'POST'
 })
 const response = await POST(request, { params: { id: 'video-456' } })

 expect(response.status).toBe(401)
 
 const data = await response.json()
 expect(data).toEqual({ error: 'Unauthorized' })
 })

 it('returns 404 for user not found', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-123' })
 mockUserRepository.findByClerkId.mockResolvedValue(null)

 const request = new NextRequest('http://localhost:3000/api/videos/video-456/watch', {
 method: 'POST'
 })
 const response = await POST(request, { params: { id: 'video-456' } })

 expect(response.status).toBe(404)
 
 const data = await response.json()
 expect(data).toEqual({ error: 'User not found' })
 })

 it('returns 403 for creator users', async () => {
 const creatorUser = { ...mockUser, role: 'creator' as const }

 mockAuth.mockResolvedValue({ userId: 'clerk-123' })
 mockUserRepository.findByClerkId.mockResolvedValue(creatorUser)

 const request = new NextRequest('http://localhost:3000/api/videos/video-456/watch', {
 method: 'POST'
 })
 const response = await POST(request, { params: { id: 'video-456' } })

 expect(response.status).toBe(403)
 
 const data = await response.json()
 expect(data).toEqual({ error: 'Only members can watch videos' })
 })

 it('returns 400 for insufficient credits', async () => {
 const videoId = 'video-456'
 const mockResult = {
 success: false,
 newBalance: 2.5,
 error: 'Insufficient credits. Required: 5, Available: 2.5'
 }

 mockAuth.mockResolvedValue({ userId: 'clerk-123' })
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser)
 mockCreditService.hasUserWatchedVideo.mockResolvedValue(false)
 mockCreditService.deductCreditsForVideo.mockResolvedValue(mockResult)

 const request = new NextRequest('http://localhost:3000/api/videos/video-456/watch', {
 method: 'POST'
 })
 const response = await POST(request, { params: { id: videoId } })

 expect(response.status).toBe(400)
 
 const data = await response.json()
 expect(data).toEqual({
 error: 'Insufficient credits. Required: 5, Available: 2.5',
 balance: 2.5,
 success: false
 })
 })

 it('returns 500 for service errors', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk-123' })
 mockUserRepository.findByClerkId.mockRejectedValue(new Error('Database error'))

 const request = new NextRequest('http://localhost:3000/api/videos/video-456/watch', {
 method: 'POST'
 })
 const response = await POST(request, { params: { id: 'video-456' } })

 expect(response.status).toBe(500)
 
 const data = await response.json()
 expect(data).toEqual({ error: 'Internal server error' })
 })
})