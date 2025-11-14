import { renderHook, waitFor, act } from '@testing-library/react'
import { jest } from '@jest/globals'
import { useVideoManagement } from '../useVideoManagement'
import { Video } from '@/types'

global.fetch = jest.fn()

const mockVideos: Video[] = [
 {
 id: '1',
 creatorId: 'creator1',
 title: 'Test Video 1',
 description: 'Test description',
 videoUrl: 'https://example.com/video1.mp4',
 thumbnailUrl: 'https://example.com/thumb1.jpg',
 duration: 120,
 creditCost: 5,
 category: 'Entertainment',
 tags: ['test', 'video'],
 viewCount: 100,
 totalEarnings: 500,
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01')
 },
 {
 id: '2',
 creatorId: 'creator1',
 title: 'Test Video 2',
 description: 'Another test description',
 videoUrl: 'https://example.com/video2.mp4',
 thumbnailUrl: 'https://example.com/thumb2.jpg',
 duration: 180,
 creditCost: 3,
 category: 'Education',
 tags: ['educational'],
 viewCount: 50,
 totalEarnings: 150,
 isActive: false,
 createdAt: new Date('2024-01-02'),
 updatedAt: new Date('2024-01-02')
 }
]

const mockApiResponse = {
 videos: mockVideos,
 pagination: {
 total: 2,
 limit: 50,
 offset: 0,
 hasMore: false
 }
}

describe('useVideoManagement', () => {
 beforeEach(() => {
 jest.clearAllMocks()
 ;(global.fetch as jest.Mock).mockClear()
 })

 it('fetches videos on mount', async () => {
 ;(global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => mockApiResponse
 })

 const { result } = renderHook(() => useVideoManagement())

 expect(result.current.isLoading).toBe(true)

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 expect(result.current.videos).toEqual(mockVideos)
 expect(result.current.pagination).toEqual(mockApiResponse.pagination)
 expect(result.current.error).toBeNull()
 })

 it('handles fetch errors', async () => {
 ;(global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 json: async () => ({ error: 'Failed to fetch videos' })
 })

 const { result } = renderHook(() => useVideoManagement())

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 expect(result.current.error).toBe('Failed to fetch videos')
 expect(result.current.videos).toEqual([])
 })

 it('uses correct query parameters', async () => {
 ;(global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => mockApiResponse
 })

 renderHook(() => useVideoManagement({
 sortBy: 'views',
 filterBy: 'active',
 limit: 25
 }))

 await waitFor(() => {
 expect(global.fetch).toHaveBeenCalledWith(
 '/api/videos?sortBy=views&filterBy=active&limit=25&offset=0'
 )
 })
 })

 it('updates video successfully', async () => {
 ;(global.fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: async () => mockApiResponse
 })
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 video: { ...mockVideos[0], title: 'Updated Title' }
 })
 })

 const { result } = renderHook(() => useVideoManagement())

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 const updatedVideo = { ...mockVideos[0], title: 'Updated Title' }

 await act(async () => {
 await result.current.updateVideo(updatedVideo)
 })

 expect(global.fetch).toHaveBeenCalledWith('/api/videos/1', {
 method: 'PATCH',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 title: 'Updated Title',
 description: 'Test description',
 category: 'Entertainment',
 tags: ['test', 'video'],
 creditCost: 5,
 isActive: true
 })
 })

 expect(result.current.videos[0].title).toBe('Updated Title')
 })

 it('handles update video errors', async () => {
 ;(global.fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: async () => mockApiResponse
 })
 .mockResolvedValueOnce({
 ok: false,
 json: async () => ({ error: 'Update failed' })
 })

 const { result } = renderHook(() => useVideoManagement())

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 await expect(
 result.current.updateVideo(mockVideos[0])
 ).rejects.toThrow('Update failed')
 })

 it('deletes video successfully', async () => {
 ;(global.fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: async () => mockApiResponse
 })
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({ success: true })
 })

 const { result } = renderHook(() => useVideoManagement())

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 expect(result.current.videos).toHaveLength(2)

 await act(async () => {
 await result.current.deleteVideo('1')
 })

 expect(global.fetch).toHaveBeenCalledWith('/api/videos/1', {
 method: 'DELETE'
 })

 expect(result.current.videos).toHaveLength(1)
 expect(result.current.videos[0].id).toBe('2')
 expect(result.current.pagination.total).toBe(1)
 })

 it('handles delete video errors', async () => {
 ;(global.fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: async () => mockApiResponse
 })
 .mockResolvedValueOnce({
 ok: false,
 json: async () => ({ error: 'Delete failed' })
 })

 const { result } = renderHook(() => useVideoManagement())

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 await expect(
 result.current.deleteVideo('1')
 ).rejects.toThrow('Delete failed')
 })

 it('toggles video status successfully', async () => {
 ;(global.fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: async () => mockApiResponse
 })
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 video: { ...mockVideos[0], isActive: false }
 })
 })

 const { result } = renderHook(() => useVideoManagement())

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 expect(result.current.videos[0].isActive).toBe(true)

 await act(async () => {
 await result.current.toggleVideoStatus('1', false)
 })

 expect(global.fetch).toHaveBeenCalledWith('/api/videos/1', {
 method: 'PATCH',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({ isActive: false })
 })

 expect(result.current.videos[0].isActive).toBe(false)
 })

 it('handles toggle status errors', async () => {
 ;(global.fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: async () => mockApiResponse
 })
 .mockResolvedValueOnce({
 ok: false,
 json: async () => ({ error: 'Status update failed' })
 })

 const { result } = renderHook(() => useVideoManagement())

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 await expect(
 result.current.toggleVideoStatus('1', false)
 ).rejects.toThrow('Status update failed')
 })

 it('refetches videos when called', async () => {
 ;(global.fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: async () => mockApiResponse
 })
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 ...mockApiResponse,
 videos: [...mockVideos, {
 id: '3',
 title: 'New Video',

 }]
 })
 })

 const { result } = renderHook(() => useVideoManagement())

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 expect(result.current.videos).toHaveLength(2)

 await act(async () => {
 await result.current.refetch()
 })

 expect(global.fetch).toHaveBeenCalledTimes(2)
 })

 it('handles network errors', async () => {
 ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

 const { result } = renderHook(() => useVideoManagement())

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 expect(result.current.error).toBe('Network error')
 expect(result.current.videos).toEqual([])
 })

 it('refetches when options change', async () => {
 ;(global.fetch as jest.Mock)
 .mockResolvedValue({
 ok: true,
 json: async () => mockApiResponse
 })

 const { rerender } = renderHook(
 ({ sortBy }) => useVideoManagement({ sortBy }),
 { initialProps: { sortBy: 'newest' as const } }
 )

 await waitFor(() => {
 expect(global.fetch).toHaveBeenCalledWith(
 '/api/videos?sortBy=newest&filterBy=all&limit=50&offset=0'
 )
 })

 rerender({ sortBy: 'views' as const })

 await waitFor(() => {
 expect(global.fetch).toHaveBeenCalledWith(
 '/api/videos?sortBy=views&filterBy=all&limit=50&offset=0'
 )
 })

 expect(global.fetch).toHaveBeenCalledTimes(2)
 })
})