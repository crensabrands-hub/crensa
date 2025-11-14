import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import VideoShareModal from '../VideoShareModal'
import { Video } from '@/types'

global.fetch = jest.fn()

Object.assign(navigator, {
 clipboard: {
 writeText: jest.fn().mockResolvedValue(undefined)
 }
})

global.open = jest.fn()

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 button: ({ children, ...props }: any) => <button {...props}>{children}</button>
 },
 AnimatePresence: ({ children }: any) => <>{children}</>
}))

const mockVideo: Video = {
 id: 'video-123',
 creatorId: 'creator-123',
 title: 'Test Video',
 description: 'Test description',
 videoUrl: 'https://example.com/video.mp4',
 thumbnailUrl: 'https://example.com/thumb.jpg',
 duration: 120,
 creditCost: 5,
 category: 'entertainment',
 tags: ['test', 'video'],
 viewCount: 100,
 totalEarnings: 50,
 isActive: true,
 createdAt: new Date(),
 updatedAt: new Date()
}

const mockShareResponse = {
 success: true,
 shareUrl: 'https://test.com/watch/share-token-123',
 shareToken: 'share-token-123',
 analytics: {
 clickCount: 0,
 viewCount: 0,
 conversionCount: 0
 },
 video: mockVideo
}

const mockAnalyticsResponse = {
 success: true,
 video: mockVideo,
 totalAnalytics: {
 clickCount: 25,
 viewCount: 15,
 conversionCount: 10
 },
 platformAnalytics: {
 direct: { clickCount: 10, viewCount: 8, conversionCount: 5 },
 twitter: { clickCount: 15, viewCount: 7, conversionCount: 5 }
 },
 shares: [
 {
 id: 'share-1',
 shareToken: 'token-1',
 platform: 'direct',
 clickCount: 10,
 viewCount: 8,
 conversionCount: 5,
 createdAt: new Date()
 }
 ]
}

describe('VideoShareModal', () => {
 const mockOnClose = jest.fn()

 beforeEach(() => {
 jest.clearAllMocks()
 ;(fetch as jest.Mock).mockClear()
 })

 it('should render modal when open', async () => {
 ;(fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve(mockShareResponse)
 })
 .mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve(mockAnalyticsResponse)
 })

 await act(async () => {
 render(
 <VideoShareModal
 video={mockVideo}
 isOpen={true}
 onClose={mockOnClose}
 />
 )
 })

 expect(screen.getByText('Share Video')).toBeInTheDocument()
 expect(screen.getByText('Test Video')).toBeInTheDocument()
 expect(screen.getByText('100 views • 5 credits')).toBeInTheDocument()

 await waitFor(() => {
 expect(fetch).toHaveBeenCalledWith('/api/videos/video-123/share', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ platform: 'direct' })
 })
 })
 })

 it('should not render when closed', () => {
 render(
 <VideoShareModal
 video={mockVideo}
 isOpen={false}
 onClose={mockOnClose}
 />
 )

 expect(screen.queryByText('Share Video')).not.toBeInTheDocument()
 })

 it('should generate share link on open', async () => {
 ;(fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve(mockShareResponse)
 })
 .mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve(mockAnalyticsResponse)
 })

 await act(async () => {
 render(
 <VideoShareModal
 video={mockVideo}
 isOpen={true}
 onClose={mockOnClose}
 />
 )
 })

 await waitFor(() => {
 expect(fetch).toHaveBeenCalledWith('/api/videos/video-123/share', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ platform: 'direct' })
 })
 expect(fetch).toHaveBeenCalledWith('/api/videos/video-123/share')
 })
 })

 it('should handle share link generation error', async () => {
 ;(fetch as jest.Mock)
 .mockRejectedValueOnce(new Error('Network error'))
 .mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve(mockAnalyticsResponse)
 })

 const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

 await act(async () => {
 render(
 <VideoShareModal
 video={mockVideo}
 isOpen={true}
 onClose={mockOnClose}
 />
 )
 })

 await waitFor(() => {
 expect(consoleSpy).toHaveBeenCalledWith('Error generating share link:', expect.any(Error))
 })

 consoleSpy.mockRestore()
 })

 it('should close modal when close button is clicked', async () => {
 ;(fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve(mockShareResponse)
 })
 .mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve(mockAnalyticsResponse)
 })

 await act(async () => {
 render(
 <VideoShareModal
 video={mockVideo}
 isOpen={true}
 onClose={mockOnClose}
 />
 )
 })

 const closeButton = screen.getByRole('button', { name: /close/i })
 fireEvent.click(closeButton)

 expect(mockOnClose).toHaveBeenCalled()
 })
})