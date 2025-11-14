

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { userRepository } from '@/lib/database/repositories'
import { testDatabaseConnection, closeDatabaseConnection } from '@/lib/database/connection'

describe('UserRepository Integration Tests', () => {
 beforeAll(async () => {

 const isConnected = await testDatabaseConnection()
 if (!isConnected) {
 throw new Error('Database connection failed')
 }
 })

 afterAll(async () => {
 await closeDatabaseConnection()
 })

 describe('User CRUD Operations', () => {
 let testUserId: string

 it('should create a new user', async () => {
 const userData = {
 clerkId: 'test_clerk_id_1',
 email: 'test@example.com',
 username: 'testuser',
 role: 'creator' as const,
 avatar: 'https://example.com/avatar.jpg'
 }

 const user = await userRepository.create(userData)

 expect(user).toBeDefined()
 expect(user.email).toBe(userData.email)
 expect(user.username).toBe(userData.username)
 expect(user.role).toBe(userData.role)
 expect(user.clerkId).toBe(userData.clerkId)

 testUserId = user.id
 })

 it('should find user by ID', async () => {
 const user = await userRepository.findById(testUserId)

 expect(user).toBeDefined()
 expect(user?.id).toBe(testUserId)
 expect(user?.email).toBe('test@example.com')
 })

 it('should find user by Clerk ID', async () => {
 const user = await userRepository.findByClerkId('test_clerk_id_1')

 expect(user).toBeDefined()
 expect(user?.clerkId).toBe('test_clerk_id_1')
 expect(user?.email).toBe('test@example.com')
 })

 it('should find user by email', async () => {
 const user = await userRepository.findByEmail('test@example.com')

 expect(user).toBeDefined()
 expect(user?.email).toBe('test@example.com')
 })

 it('should find user by username', async () => {
 const user = await userRepository.findByUsername('testuser')

 expect(user).toBeDefined()
 expect(user?.username).toBe('testuser')
 })

 it('should update user', async () => {
 const updatedUser = await userRepository.update(testUserId, {
 username: 'updateduser',
 avatar: 'https://example.com/new-avatar.jpg'
 })

 expect(updatedUser).toBeDefined()
 expect(updatedUser?.username).toBe('updateduser')
 expect(updatedUser?.avatar).toBe('https://example.com/new-avatar.jpg')
 })

 it('should check username availability', async () => {
 const isAvailable = await userRepository.isUsernameAvailable('newusername')
 expect(isAvailable).toBe(true)

 const isNotAvailable = await userRepository.isUsernameAvailable('updateduser')
 expect(isNotAvailable).toBe(false)
 })

 it('should check email availability', async () => {
 const isAvailable = await userRepository.isEmailAvailable('new@example.com')
 expect(isAvailable).toBe(true)

 const isNotAvailable = await userRepository.isEmailAvailable('test@example.com')
 expect(isNotAvailable).toBe(false)
 })

 it('should delete user', async () => {
 const deleted = await userRepository.delete(testUserId)
 expect(deleted).toBe(true)

 const user = await userRepository.findById(testUserId)
 expect(user).toBeNull()
 })
 })

 describe('Profile Operations', () => {
 let testUserId: string

 beforeEach(async () => {
 const userData = {
 clerkId: 'test_clerk_profile',
 email: 'profile@example.com',
 username: 'profileuser',
 role: 'creator' as const
 }

 const user = await userRepository.create(userData)
 testUserId = user.id
 })

 it('should create creator profile', async () => {
 const profileData = {
 userId: testUserId,
 displayName: 'Test Creator',
 bio: 'This is a test creator profile',
 socialLinks: [
 { platform: 'twitter', url: 'https://twitter.com/testcreator' }
 ]
 }

 const profile = await userRepository.createCreatorProfile(profileData)

 expect(profile).toBeDefined()
 expect(profile.displayName).toBe(profileData.displayName)
 expect(profile.bio).toBe(profileData.bio)
 expect(profile.socialLinks).toEqual(profileData.socialLinks)
 })

 it('should create member profile', async () => {
 const profileData = {
 userId: testUserId
 }

 const profile = await userRepository.createMemberProfile(profileData)

 expect(profile).toBeDefined()
 expect(profile.userId).toBe(testUserId)
 expect(profile.walletBalance).toBe('0.00')
 expect(profile.membershipStatus).toBe('free')
 })

 it('should update creator profile', async () => {

 await userRepository.createCreatorProfile({
 userId: testUserId,
 displayName: 'Original Name'
 })

 const updatedProfile = await userRepository.updateCreatorProfile(testUserId, {
 displayName: 'Updated Name',
 bio: 'Updated bio'
 })

 expect(updatedProfile).toBeDefined()
 expect(updatedProfile?.displayName).toBe('Updated Name')
 expect(updatedProfile?.bio).toBe('Updated bio')
 })

 it('should find user with profile', async () => {

 await userRepository.createCreatorProfile({
 userId: testUserId,
 displayName: 'Test Creator with Profile'
 })

 const userWithProfile = await userRepository.findById(testUserId)

 expect(userWithProfile).toBeDefined()
 expect(userWithProfile?.creatorProfile).toBeDefined()
 expect(userWithProfile?.creatorProfile?.displayName).toBe('Test Creator with Profile')
 })
 })
})