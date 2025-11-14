import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import ReelsInterface from '../ReelsInterface'
import { Video } from '@/types'

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 button: ({ children, ...props }: any) => <button {...props}>{children}</button>
 },
 AnimatePresence: ({ children }: any) => <div>{children}</div>
}))

jest.mock('react-swipeable', () => ({
 useSwipeable: () => ({
 onTouchStart: jest.fn(),
 onTouchMove: jest.fn(),
 onTouchEnd: jest.fn()
 })
}))

jest.mock('../VideoPlayer', () => {
 return function MockVideoPlayer({ video, onPlayPause, onVideoEnd }: any) {
 return (
 <div data-testid="video-player">
 <div>{video.title}</div>
 <button onClick={onPlayPause}>Play/Pause</button>
 <button onClick={onVideoEnd}>End Video</button>
 </div>
 )
 }
})

jest.mock('../VideoOverlay', () => {
 return function MockVideoOverlay({ video, onWatch, onShare, hasWatched }: any) {
 return (
 <div data-testid="video-overlay">
 <div>{video.title}</div>
 {!hasWatched && <button onClick={onWatch}>Watch</button>}
 <button onClick={onShare}>Share</button>
 </div>
 )
 }
})

const mockVideos: Video[] = [
 {
 id: '1',
 creatorId: 'creator1',
 title: 'Test Video 1',
 description: 'Test description 1',
 videoUrl: '/test1.mp4',
 thumbnailUrl: '/thumb1.jpg',
 duration: 60,
 creditCost: 5,
 category: 'Test',
 tags: ['test'],
 viewCount: 100,
 totalEarnings: 500,
 isActive: true,
 createdAt: new Date(),
 updatedAt: new Date(),
 creator: {
 id: 'creator1',
 username: 'testuser1',
 displayName: 'Test User 1',
 avatar: '/avatar1.jpg'
 }
 },
 {
 id: '2',
 creatorId: 'creator2',
 title: 'Test Video 2',
 description: 'Test description 2',
 videoUrl: '/test2.mp4',
 thumbnailUrl: '/thumb2.jpg',
 duration: 90,
 creditCost: 8,
 category: 'Test',
 tags: ['test'],
 viewCount: 200,
 totalEarnings: 1600,
 isActive: true,
 createdAt: new Date(),
 updatedAt: new Date(),
 creator: {
 id: 'creator2',
 username: 'testuser2',
 displayName: 'Test User 2',
 avatar: '/avatar2.jpg'
 }
 }
]

describe('ReelsInterface', () => {
 const mockOnVideoChange = jest.fn()
 const mockOnVideoWatch = jest.fn()

 beforeEach(() => {
 jest.clearAllMocks()
 })

 it('renders correctly with videos', () => {
 render(
 <ReelsInterface
 videos={mockVideos}
 currentIndex={0}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 />
 )

 expect(screen.getAllByText('Test Video 1')).toHaveLength(2) // In both player and overlay
 expect(screen.getByText('Watch')).toBeInTheDocument()
 })

 it('shows loading state when no videos', () => {
 render(
 <ReelsInterface
 videos={[]}
 currentIndex={0}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 />
 )

 expect(screen.getByText('Loading videos...')).toBeInTheDocument()
 })

 it('renders navigation indicators', () => {
 render(
 <ReelsInterface
 videos={mockVideos}
 currentIndex={0}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 />
 )

 const indicators = screen.getAllByRole('button', { name: /Go to video/i })
 expect(indicators).toHaveLength(2)
 })

 it('calls onVideoChange when navigation indicator is clicked', () => {
 render(
 <ReelsInterface
 videos={mockVideos}
 currentIndex={0}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 />
 )

 const secondIndicator = screen.getByRole('button', { name: 'Go to video 2' })
 fireEvent.click(secondIndicator)

 expect(mockOnVideoChange).toHaveBeenCalledWith(1)
 })

 it('updates current video when currentIndex changes', () => {
 const { rerender } = render(
 <ReelsInterface
 videos={mockVideos}
 currentIndex={0}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 />
 )

 expect(screen.getAllByText('Test Video 1')).toHaveLength(2)

 rerender(
 <ReelsInterface
 videos={mockVideos}
 currentIndex={1}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 />
 )

 expect(screen.getAllByText('Test Video 2')).toHaveLength(2)
 })

 it('calls onVideoWatch when watch button is clicked', async () => {
 mockOnVideoWatch.mockResolvedValue(undefined)

 render(
 <ReelsInterface
 videos={mockVideos}
 currentIndex={0}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 />
 )

 const watchButton = screen.getByText('Watch')
 fireEvent.click(watchButton)

 await waitFor(() => {
 expect(mockOnVideoWatch).toHaveBeenCalledWith('1')
 })
 })

 it('handles video end by navigating to next video', () => {
 render(
 <ReelsInterface
 videos={mockVideos}
 currentIndex={0}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 />
 )

 const endButton = screen.getByText('End Video')
 fireEvent.click(endButton)

 expect(mockOnVideoChange).toHaveBeenCalledWith(1)
 })

 it('does not navigate beyond last video', () => {
 render(
 <ReelsInterface
 videos={mockVideos}
 currentIndex={1}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 />
 )

 const endButton = screen.getByText('End Video')
 fireEvent.click(endButton)

 expect(mockOnVideoChange).not.toHaveBeenCalled()
 })

 it('shows swipe hint on first video', () => {
 render(
 <ReelsInterface
 videos={mockVideos}
 currentIndex={0}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 />
 )

 expect(screen.getByText('Swipe up for next video')).toBeInTheDocument()
 })

 it('does not show swipe hint on non-first videos', () => {
 render(
 <ReelsInterface
 videos={mockVideos}
 currentIndex={1}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 />
 )

 expect(screen.queryByText('Swipe up for next video')).not.toBeInTheDocument()
 })

 it('handles touch events for navigation', () => {
 const { container } = render(
 <ReelsInterface
 videos={mockVideos}
 currentIndex={1}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 />
 )

 const reelsContainer = container.firstChild as HTMLElement

 fireEvent.touchStart(reelsContainer, {
 touches: [{ clientY: 100 }]
 })

 fireEvent.touchMove(reelsContainer, {
 touches: [{ clientY: 80 }]
 })

 fireEvent.touchEnd(reelsContainer)

 expect(mockOnVideoChange).not.toHaveBeenCalled()
 })

 it('applies custom className', () => {
 const { container } = render(
 <ReelsInterface
 videos={mockVideos}
 currentIndex={0}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 className="custom-class"
 />
 )

 expect(container.firstChild).toHaveClass('custom-class')
 })

 it('handles error in onVideoWatch gracefully', async () => {
 const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
 mockOnVideoWatch.mockRejectedValue(new Error('Watch failed'))

 render(
 <ReelsInterface
 videos={mockVideos}
 currentIndex={0}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 />
 )

 const watchButton = screen.getByText('Watch')
 fireEvent.click(watchButton)

 await waitFor(() => {
 expect(consoleError).toHaveBeenCalledWith('Error watching video:', expect.any(Error))
 })

 consoleError.mockRestore()
 })
})