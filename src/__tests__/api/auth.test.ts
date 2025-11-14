

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { GET as getProfile, PATCH as updateProfile } from '@/app/api/auth/profile/route'
import { POST as setupProfile } from '@/app/api/auth/setup-profile/route'

jest.mock('@clerk/nextjs/server', () => ({
 auth: jest.fn(),
 currentUser: jest.fn()
}))

jest.mock('@/lib/database/repositories', () => ({
 userRepository: {
 findByClerkId: jest.fn(),
 create: jest.fn(),
 update: jest.fn(),
 createCreatorProfile: jest.fn(),
 createMemberProfile: jest.fn(),
 updateCreatorProfile: jest.fn(),
 updateMemberProfile: jest.fn(),
 isUsernameAvailable: jest.fn()
 }
}))

import { auth, currentUser } from '@clerk/nextjs/server'
import { userRepository } from '@/lib/database/repositories'

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockCurrentUser = currentUser as jest.MockedFunction<typeof currentUser>
const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>

describe('Authentication API Routes', () => {
 beforeEach(() => {
 jest.clearAllMocks()
 })

 describe('GET /api/auth/profile', () => {
 it('should return user profile when authenticated', async () => {
 const mockUser = {
 id: 'user_123',
 clerkId: 'clerk_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'creator' as const,
 avatar: null,
 createdAt: new Date(),
 updatedAt: new Date(),
 creatorProfile: {
 id: 'profile_123',
 userId: 'user_123',
 displayName: 'Test Creator',
 bio: 'Test bio',
 totalEarnings: '100.00',
 totalViews: 1000,
 videoCount: 5,
 socialLinks: [],
 createdAt: new Date(),
 updatedAt: new Date()
 }
 }

 mockAuth.mockResolvedValue({ userId: 'clerk_123' })
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser)

 const response = await getProfile()
 const data = await response.json()

 expect(response.status).toBe(200)
 expect(data.user).toEqual(mockUser)
 expect(mockUserRepository.findByClerkId).toHaveBeenCalledWith('clerk_123')
 })

 it('should return 401 when not authenticated', async () => {
 mockAuth.mockResolvedValue({ userId: null })

 const response = await getProfile()
 const data = await response.json()

 expect(response.status).toBe(401)
 expect(data.error).toBe('Unauthorized')
 })

 it('should return 404 when user not found', async () => {
 mockAuth.mockResolvedValue({ userId: 'clerk_123' })
 mockUserRepository.findByClerkId.mockResolvedValue(null)

 const response = await getProfile()
 const data = await response.json()

 expect(response.status).toBe(404)
 expect(data.error).toBe('User not found')
 })
 })

 describe('PATCH /api/auth/profile', () => {
 it('should update user profile successfully', async () => {
 const mockUser = {
 id: 'user_123',
 clerkId: 'clerk_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'creator' as const,
 avatar: null,
 createdAt: new Date(),
 updatedAt: new Date()
 }

 const updatedUser = {
 ...mockUser,
 username: 'newusername',
 creatorProfile: {
 id: 'profile_123',
 userId: 'user_123',
 displayName: 'Updated Creator',
 bio: 'Updated bio',
 totalEarnings: '100.00',
 totalViews: 1000,
 videoCount: 5,
 socialLinks: [],
 createdAt: new Date(),
 updatedAt: new Date()
 }
 }

 mockAuth.mockResolvedValue({ userId: 'clerk_123' })
 mockUserRepository.findByClerkId.mockResolvedValueOnce(mockUser)
 mockUserRepository.isUsernameAvailable.mockResolvedValue(true)
 mockUserRepository.update.mockResolvedValue({ ...mockUser, username: 'newusername' })
 mockUserRepository.updateCreatorProfile.mockResolvedValue(updatedUser.creatorProfile)
 mockUserRepository.findByClerkId.mockResolvedValueOnce(updatedUser)

 const request = new NextRequest('http://localhost:3000/api/auth/profile', {
 method: 'PATCH',
 body: JSON.stringify({
 username: 'newusername',
 displayName: 'Updated Creator',
 bio: 'Updated bio'
 })
 })

 const response = await updateProfile(request)
 const data = await response.json()

 expect(response.status).toBe(200)
 expect(data.message).toBe('Profile updated successfully')
 expect(data.user.username).toBe('newusername')
 })

 it('should return 400 when username is taken', async () => {
 const mockUser = {
 id: 'user_123',
 clerkId: 'clerk_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'creator' as const,
 avatar: null,
 createdAt: new Date(),
 updatedAt: new Date()
 }

 mockAuth.mockResolvedValue({ userId: 'clerk_123' })
 mockUserRepository.findByClerkId.mockResolvedValue(mockUser)
 mockUserRepository.isUsernameAvailable.mockResolvedValue(false)

 const request = new NextRequest('http://localhost:3000/api/auth/profile', {
 method: 'PATCH',
 body: JSON.stringify({
 username: 'takenusername'
 })
 })

 const response = await updateProfile(request)
 const data = await response.json()

 expect(response.status).toBe(400)
 expect(data.error).toBe('Username already taken')
 })
 })

 describe('POST /api/auth/setup-profile', () => {
 it('should create new user profile successfully', async () => {
 const mockClerkUser = {
 id: 'clerk_123',
 emailAddresses: [{ emailAddress: 'test@example.com' }],
 imageUrl: 'https://example.com/avatar.jpg'
 }

 const mockNewUser = {
 id: 'user_123',
 clerkId: 'clerk_123',
 email: 'test@example.com',
 username: 'newuser',
 role: 'creator' as const,
 avatar: 'https://example.com/avatar.jpg',
 createdAt: new Date(),
 updatedAt: new Date()
 }

 const mockUserWithProfile = {
 ...mockNewUser,
 creatorProfile: {
 id: 'profile_123',
 userId: 'user_123',
 displayName: 'New Creator',
 bio: '',
 totalEarnings: '0.00',
 totalViews: 0,
 videoCount: 0,
 socialLinks: [],
 createdAt: new Date(),
 updatedAt: new Date()
 }
 }

 mockAuth.mockResolvedValue({ userId: 'clerk_123' })
 mockCurrentUser.mockResolvedValue(mockClerkUser as any)
 mockUserRepository.findByClerkId.mockResolvedValueOnce(null)
 mockUserRepository.isUsernameAvailable.mockResolvedValue(true)
 mockUserRepository.create.mockResolvedValue(mockNewUser)
 mockUserRepository.createCreatorProfile.mockResolvedValue(mockUserWithProfile.creatorProfile)
 mockUserRepository.findByClerkId.mockResolvedValueOnce(mockUserWithProfile)

 const request = new NextRequest('http://localhost:3000/api/auth/setup-profile', {
 method: 'POST',
 body: JSON.stringify({
 role: 'creator',
 username: 'newuser',
 displayName: 'New Creator'
 })
 })

 const response = await setupProfile(request)
 const data = await response.json()

 expect(response.status).toBe(201)
 expect(data.username).toBe('newuser')
 expect(data.role).toBe('creator')
 expect(data.creatorProfile).toBeDefined()
 })

 it('should return 409 when profile already exists', async () => {
 const mockExistingUser = {
 id: 'user_123',
 clerkId: 'clerk_123',
 email: 'test@example.com',
 username: 'existinguser',
 role: 'creator' as const,
 avatar: null,
 createdAt: new Date(),
 updatedAt: new Date()
 }

 mockAuth.mockResolvedValue({ userId: 'clerk_123' })
 mockCurrentUser.mockResolvedValue({ id: 'clerk_123' } as any)
 mockUserRepository.findByClerkId.mockResolvedValue(mockExistingUser)

 const request = new NextRequest('http://localhost:3000/api/auth/setup-profile', {
 method: 'POST',
 body: JSON.stringify({
 role: 'creator',
 username: 'newuser'
 })
 })

 const response = await setupProfile(request)
 const data = await response.json()

 expect(response.status).toBe(409)
 expect(data.error).toBe('Profile already exists')
 })

 it('should return 400 when username is taken', async () => {
 const mockClerkUser = {
 id: 'clerk_123',
 emailAddresses: [{ emailAddress: 'test@example.com' }]
 }

 mockAuth.mockResolvedValue({ userId: 'clerk_123' })
 mockCurrentUser.mockResolvedValue(mockClerkUser as any)
 mockUserRepository.findByClerkId.mockResolvedValue(null)
 mockUserRepository.isUsernameAvailable.mockResolvedValue(false)

 const request = new NextRequest('http://localhost:3000/api/auth/setup-profile', {
 method: 'POST',
 body: JSON.stringify({
 role: 'creator',
 username: 'takenusername'
 })
 })

 const response = await setupProfile(request)
 const data = await response.json()

 expect(response.status).toBe(400)
 expect(data.error).toBe('Username already taken')
 })
 })
})