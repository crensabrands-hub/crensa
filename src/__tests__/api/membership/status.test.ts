

import { GET } from '@/app/api/membership/status/[userId]/route'
import { NextRequest } from 'next/server'
import { userRepository } from '@/lib/database/repositories/users'
import type { User, MemberProfile } from '@/lib/database/schema'

jest.mock('@/lib/database/repositories/users')
const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>

describe('/api/membership/status/[userId]', () => {
 const mockUser: User & { memberProfile: MemberProfile } = {
 id: 'user-123',
 clerkId: 'clerk-123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member',
 avatar: null,
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString(),
 memberProfile: {
 id: 'profile-123',
 userId: 'user-123',
 walletBalance: '50.00',
 membershipStatus: 'premium' as const,
 membershipExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
 watchHistory: [],
 favoriteCreators: [],
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString(),
 }
 }

 beforeEach(() => {
 jest.clearAllMocks()
 })

 it('should return membership status for premium user', async () => {
 mockUserRepository.findById.mockResolvedValue(mockUser)

 const request = new NextRequest('http://localhost:3000/api/membership/status/user-123')
 const response = await GET(request, { params: { userId: 'user-123' } })
 
 expect(response.status).toBe(200)
 
 const data = await response.json()
 expect(data.status).toBe('premium')
 expect(data.expiry).toBeDefined()
 expect(data.daysRemaining).toBeGreaterThan(0)
 expect(data.autoRenew).toBe(false)
 })

 it('should return membership status for free user', async () => {
 const freeUser = {
 ...mockUser,
 memberProfile: {
 ...mockUser.memberProfile,
 membershipStatus: 'free' as const,
 membershipExpiry: null
 }
 }

 mockUserRepository.findById.mockResolvedValue(freeUser)

 const request = new NextRequest('http://localhost:3000/api/membership/status/user-123')
 const response = await GET(request, { params: { userId: 'user-123' } })
 
 expect(response.status).toBe(200)
 
 const data = await response.json()
 expect(data.status).toBe('free')
 expect(data.expiry).toBeUndefined()
 expect(data.daysRemaining).toBeUndefined()
 })

 it('should calculate days remaining correctly', async () => {
 const futureDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
 const userWithExpiry = {
 ...mockUser,
 memberProfile: {
 ...mockUser.memberProfile,
 membershipExpiry: futureDate.toISOString()
 }
 }

 mockUserRepository.findById.mockResolvedValue(userWithExpiry)

 const request = new NextRequest('http://localhost:3000/api/membership/status/user-123')
 const response = await GET(request, { params: { userId: 'user-123' } })
 
 const data = await response.json()
 expect(data.daysRemaining).toBe(15)
 })

 it('should handle expired membership', async () => {
 const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
 const expiredUser = {
 ...mockUser,
 memberProfile: {
 ...mockUser.memberProfile,
 membershipExpiry: pastDate.toISOString()
 }
 }

 mockUserRepository.findById.mockResolvedValue(expiredUser)

 const request = new NextRequest('http://localhost:3000/api/membership/status/user-123')
 const response = await GET(request, { params: { userId: 'user-123' } })
 
 const data = await response.json()
 expect(data.daysRemaining).toBe(0)
 })

 it('should return 400 for missing user ID', async () => {
 const request = new NextRequest('http://localhost:3000/api/membership/status/')
 const response = await GET(request, { params: { userId: '' } })
 
 expect(response.status).toBe(400)
 
 const data = await response.json()
 expect(data.error).toBe('User ID is required')
 })

 it('should return 404 for non-existent user', async () => {
 mockUserRepository.findById.mockResolvedValue(null)

 const request = new NextRequest('http://localhost:3000/api/membership/status/invalid-user')
 const response = await GET(request, { params: { userId: 'invalid-user' } })
 
 expect(response.status).toBe(404)
 
 const data = await response.json()
 expect(data.error).toBe('User not found')
 })

 it('should return 400 for non-member user', async () => {
 const nonMemberUser = {
 ...mockUser,
 role: 'creator' as const,
 memberProfile: undefined
 }

 mockUserRepository.findById.mockResolvedValue(nonMemberUser)

 const request = new NextRequest('http://localhost:3000/api/membership/status/user-123')
 const response = await GET(request, { params: { userId: 'user-123' } })
 
 expect(response.status).toBe(400)
 
 const data = await response.json()
 expect(data.error).toBe('User is not a member')
 })

 it('should handle database errors', async () => {
 mockUserRepository.findById.mockRejectedValue(new Error('Database error'))

 const request = new NextRequest('http://localhost:3000/api/membership/status/user-123')
 const response = await GET(request, { params: { userId: 'user-123' } })
 
 expect(response.status).toBe(500)
 
 const data = await response.json()
 expect(data.error).toBe('Failed to fetch membership status')
 })
})