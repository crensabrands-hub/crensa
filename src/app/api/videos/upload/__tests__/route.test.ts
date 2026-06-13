import { NextRequest } from 'next/server'
import { POST } from '../route'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/database'

jest.mock('@clerk/nextjs/server')
jest.mock('@/lib/database')
jest.mock('@/lib/services/bunnyService', () => ({
  uploadVideoToBunny: jest.fn().mockResolvedValue({
    videoId: 'bunny-video-id-123',
    playbackUrl: 'https://vz-test.b-cdn.net/bunny-video-id-123/playlist.m3u8',
    directUrl: 'https://vz-test.b-cdn.net/bunny-video-id-123/play_720p.mp4',
  }),
  uploadThumbnailToBunny: jest.fn().mockResolvedValue({
    thumbnailUrl: 'https://crensa-thumbnails.b-cdn.net/thumbnails/test.jpg',
    storagePath: 'thumbnails/test.jpg',
  }),
  buildThumbnailPath: jest.fn().mockReturnValue('thumbnails/test.jpg'),
  getBunnyVideo: jest.fn().mockResolvedValue({ length: 120 }),
}))

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockDb = db as jest.Mocked<typeof db>

const mockWhere  = jest.fn()
const mockLimit  = jest.fn()
const mockValues = jest.fn()
const mockReturning = jest.fn()
const mockSet    = jest.fn()

mockDb.select = jest.fn(() => ({
  from: jest.fn(() => ({
    where: mockWhere.mockReturnValue({
      limit: mockLimit.mockReturnValue(Promise.resolve([{
        id: 'user-id',
        clerkId: 'clerk-id',
        role: 'creator',
        videoCount: 0,
      }])),
    }),
  })),
})) as any

mockDb.insert = jest.fn(() => ({
  values: mockValues.mockReturnValue({
    returning: mockReturning.mockReturnValue(Promise.resolve([{
      id: 'video-id',
      creatorId: 'user-id',
      title: 'Test Video',
      videoUrl: 'https://vz-test.b-cdn.net/bunny-video-id-123/playlist.m3u8',
      thumbnailUrl: 'https://crensa-thumbnails.b-cdn.net/thumbnails/test.jpg',
      bunnyVideoId: 'bunny-video-id-123',
      duration: 120,
      creditCost: 1,
      coinPrice: 20,
      category: 'Entertainment',
      tags: [],
      viewCount: 0,
      totalEarnings: '0.00',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }])),
  }),
})) as any

mockDb.update = jest.fn(() => ({
  set: mockSet.mockReturnValue({
    where: jest.fn().mockReturnValue(Promise.resolve()),
  }),
})) as any

const createMockRequest = (formData: FormData): NextRequest =>
  ({ formData: () => Promise.resolve(formData) } as NextRequest)

const createMockFile = (name = 'test.mp4', size = 1024, type = 'video/mp4'): File => {
  const file = new File(['content'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('/api/videos/upload', () => {
  beforeEach(() => jest.clearAllMocks())

  it('requires authentication', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any)
    const response = await POST(createMockRequest(new FormData()))
    expect(response.status).toBe(401)
    expect((await response.json()).error).toBe('Unauthorized')
  })

  it('requires creator role', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-id' } as any)
    mockLimit.mockReturnValueOnce(Promise.resolve([{ id: 'user-id', role: 'member' }]))
    const response = await POST(createMockRequest(new FormData()))
    expect(response.status).toBe(403)
  })

  it('rejects missing file', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-id' } as any)
    const response = await POST(createMockRequest(new FormData()))
    expect(response.status).toBe(400)
    expect((await response.json()).error).toBe('Video file and metadata are required')
  })

  it('rejects oversized file', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-id' } as any)
    const fd = new FormData()
    const big = createMockFile('big.mp4', 600 * 1024 * 1024)
    fd.append('video', big)
    fd.append('metadata', JSON.stringify({ title: 'T', category: 'Entertainment', coinPrice: 20 }))
    const response = await POST(createMockRequest(fd))
    expect(response.status).toBe(413)
  })

  it('rejects invalid file format', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-id' } as any)
    const fd = new FormData()
    fd.append('video', createMockFile('test.txt', 1024, 'text/plain'))
    fd.append('metadata', JSON.stringify({ title: 'T', category: 'Entertainment', coinPrice: 20 }))
    const response = await POST(createMockRequest(fd))
    expect(response.status).toBe(400)
  })

  it('rejects invalid JSON metadata', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-id' } as any)
    const fd = new FormData()
    fd.append('video', createMockFile())
    fd.append('metadata', 'not json')
    const response = await POST(createMockRequest(fd))
    expect(response.status).toBe(400)
    expect((await response.json()).error).toBe('Invalid metadata format')
  })

  it('rejects missing required metadata', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-id' } as any)
    const fd = new FormData()
    fd.append('video', createMockFile())
    fd.append('metadata', JSON.stringify({ description: 'no title or category' }))
    const response = await POST(createMockRequest(fd))
    expect(response.status).toBe(400)
  })

  it('successfully uploads video via Bunny Stream', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-id' } as any)
    const fd = new FormData()
    fd.append('video', createMockFile())
    fd.append('metadata', JSON.stringify({
      title: 'Test Video',
      category: 'Entertainment',
      coinPrice: 20,
    }))
    const response = await POST(createMockRequest(fd))
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.video.bunnyVideoId).toBe('bunny-video-id-123')
  })
})
