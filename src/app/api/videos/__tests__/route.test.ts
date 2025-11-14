import { NextRequest } from 'next/server'
import { GET } from '../route'
import { jest } from '@jest/globals'

jest.mock('@clerk/nextjs/server', () => ({
 auth: jest.fn()
}))

jest.mock('@/lib/database', () => ({
 db: {
 select: jest.fn(),
 from: jest.fn(),
 where: jest.fn(),
 orderBy: jest.fn(),
 limit: jest.fn(),
 offset: jest.fn()
 }
}))

jest.mock('@/lib/database/schema', () => ({
 videos: {
 creatorId: 'creatorId',
 isActive: 'isActive',
 createdAt: 'createdAt',
 viewCount: 'viewCount',
 totalEarnings: 'totalEarnings',
 title: 'title'
 },
 users: {
 clerkId: 'clerkId',
 id: 'id'
 }
}))

const mockAuth = require('@clerk/nextjs/server').auth as jest.Mock
const mockDb = require('@/lib/database').db

describe('/api/videos GET', () => {
 beforeEach(() => {
 jest.clearAllMocks()
 })

 it('returns videos for authenticated creator', async () => {

 mockAuth.mockResolvedValue({ userId: 'clerk123' })

 const mockUser = { id: 'user1', role: 'creator' }
 const mockVideos = [
 { id: '1', title: 'Video 1', createdAt: '2024-01-01' },
 { id: '2', title: 'Video 2', createdAt: '2024-01-02' }
 ]
 
 mockDb.select.mockReturnValue({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([mockUser])
 })
 })
 })

 mockDb.select.mockReturnValueOnce({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue([mockUser])
 })
 })
 }).mockReturnValueOnce({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockReturnValue({
 orderBy: jest.fn().mockReturnValue({
 limit: jest.fn().mockReturnValue({
 offset: jest.fn().mockResolvedValue(mockVideos)
 })
 })
 })
 })
 }).mockReturnValueOnce({
 from: jest.fn().mockReturnValue({
 where: jest.fn().mockResolvedValue(mockVideos)
 })
 })

 const request = new NextRequest('http://localhost/api/videos')
 const response = await GET(request)
 
 expect(response.status).toBe(200)
 const data = await response.json()
 expect(data.videos).toHaveLength(2)
 })
})