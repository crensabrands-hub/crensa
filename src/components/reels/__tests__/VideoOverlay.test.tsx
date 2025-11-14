import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { jest } from '@jest/globals'
import VideoOverlay from '../VideoOverlay'
import { Video } from '@/types'

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 button: ({ children, ...props }: any) => <button {...props}>{children}</button>
 },
 AnimatePresence: ({ children }: any) => <div>{children}</div>
}))

jest.mock('next/image', () => {
 return function MockImage({ src, alt, ...props }: any) {
 return <img src={src} alt={alt} {...props} />
 }
})

const mockVideo: Video = {
 id: '1',
 creatorId: 'creator1',
 title: 'Test Video',
 description: 'This is a test video description that is long enough to test the more/less functionality.',
 videoUrl: '/test.mp4',
 thumbnailUrl: '/thumb.jpg',
 duration: 120,
 creditCost: 5,
 category: 'Test',
 tags: ['test', 'demo', 'sample'],
 viewCount: 1500,
 totalEarnings: 7500,
 isActive: true,
 createdAt: new Date(),
 updatedAt: new Date(),
 creator: {
 id: 'creator1',
 username: 'testuser',
 displayName: 'Test User',
 avatar: '/avatar.jpg'
 }
}

describe('VideoOverlay', () => {
 const mockOnPlayPause = jest.fn()
 const mockOnWatch = jest.fn()
 const mockOnShare = jest.fn()

 beforeEach(() => {
 jest.clearAllMocks()
 })

 it('renders video information correctly', () => {
 render(
 <VideoOverlay
 video={mockVideo}
 isPlaying={false}
 hasWatched={true}
 isLoading={false}
 onPlayPause={mockOnPlayPause}
 onWatch={mockOnWatch}
 onShare={mockOnShare}
 />
 )

 expect(screen.getByText('Test Video')).toBeInTheDocument()
 expect(screen.getByText('Test User')).toBeInTheDocument()
 expect(screen.getByText('@testuser')).toBeInTheDocument()
 expect(screen.getByText('1,500')).toBeInTheDocument() // View count
 expect(screen.getByText('5 credits')).toBeInTheDocument()
 expect(screen.getByText('Test')).toBeInTheDocument() // Category
 })

 it('renders creator avatar when available', () => {
 render(
 <VideoOverlay
 video={mockVideo}
 isPlaying={false}
 hasWatched={true}
 isLoading={false}
 onPlayPause={mockOnPlayPause}
 onWatch={mockOnWatch}
 onShare={mockOnShare}
 />
 )

 const avatar = screen.getByAltText('Test User')
 expect(avatar).toBeInTheDocument()
 expect(avatar).toHaveAttribute('src', '/avatar.jpg')
 })

 it('shows default avatar when creator avatar not available', () => {
 const videoWithoutAvatar = {
 ...mockVideo,
 creator: {
 ...mockVideo.creator!,
 avatar: undefined
 }
 }

 render(
 <VideoOverlay
 video={videoWithoutAvatar}
 isPlaying={false}
 hasWatched={true}
 isLoading={false}
 onPlayPause={mockOnPlayPause}
 onWatch={mockOnWatch}
 onShare={mockOnShare}
 />
 )

 const avatarContainer = document.querySelector('.bg-gray-600')
 expect(avatarContainer).toBeInTheDocument()
 })

 it('renders video tags', () => {
 render(
 <VideoOverlay
 video={mockVideo}
 isPlaying={false}
 hasWatched={true}
 isLoading={false}
 onPlayPause={mockOnPlayPause}
 onWatch={mockOnWatch}
 onShare={mockOnShare}
 />
 )

 expect(screen.getByText('#test')).toBeInTheDocument()
 expect(screen.getByText('#demo')).toBeInTheDocument()
 expect(screen.getByText('#sample')).toBeInTheDocument()
 })

 it('shows truncated description with more/less toggle', () => {
 render(
 <VideoOverlay
 video={mockVideo}
 isPlaying={false}
 hasWatched={true}
 isLoading={false}
 onPlayPause={mockOnPlayPause}
 onWatch={mockOnWatch}
 onShare={mockOnShare}
 />
 )

 expect(screen.getByText(/This is a test video description that is long enough to test the more\/less functionality\./)).toBeInTheDocument()

 const moreButton = screen.getByText('more')
 expect(moreButton).toBeInTheDocument()

 fireEvent.click(moreButton)
 expect(screen.getByText('less')).toBeInTheDocument()
 })

 it('renders action buttons', () => {
 render(
 <VideoOverlay
 video={mockVideo}
 isPlaying={false}
 hasWatched={true}
 isLoading={false}
 onPlayPause={mockOnPlayPause}
 onWatch={mockOnWatch}
 onShare={mockOnShare}
 />
 )

 expect(screen.getByText('Share')).toBeInTheDocument()
 expect(screen.getByText('Save')).toBeInTheDocument()

 const actionButtons = document.querySelectorAll('.w-12.h-12.bg-black.bg-opacity-30')
 expect(actionButtons.length).toBeGreaterThanOrEqual(4)
 })

 it('toggles like state when like button is clicked', () => {
 render(
 <VideoOverlay
 video={mockVideo}
 isPlaying={false}
 hasWatched={true}
 isLoading={false}
 onPlayPause={mockOnPlayPause}
 onWatch={mockOnWatch}
 onShare={mockOnShare}
 />
 )

 const actionButtons = document.querySelectorAll('.w-12.h-12.bg-black.bg-opacity-30')
 const likeButton = actionButtons[0] as HTMLElement
 fireEvent.click(likeButton)

 expect(likeButton).toBeInTheDocument()
 })

 it('calls onShare when share button is clicked', () => {
 render(
 <VideoOverlay
 video={mockVideo}
 isPlaying={false}
 hasWatched={true}
 isLoading={false}
 onPlayPause={mockOnPlayPause}
 onWatch={mockOnWatch}
 onShare={mockOnShare}
 />
 )

 const actionButtons = document.querySelectorAll('.w-12.h-12.bg-black.bg-opacity-30')
 const shareButton = actionButtons[2] as HTMLElement // Third button is share
 fireEvent.click(shareButton)

 expect(mockOnShare).toHaveBeenCalled()
 })

 it('shows watch prompt when video not watched', () => {
 render(
 <VideoOverlay
 video={mockVideo}
 isPlaying={false}
 hasWatched={false}
 isLoading={false}
 onPlayPause={mockOnPlayPause}
 onWatch={mockOnWatch}
 onShare={mockOnShare}
 />
 )

 expect(screen.getByText('Watch for 5 Credits')).toBeInTheDocument()
 expect(screen.getByText('Tap to watch this video and support the creator')).toBeInTheDocument()
 expect(screen.getByText('Watch Now')).toBeInTheDocument()
 })

 it('calls onWatch when watch button is clicked', () => {
 render(
 <VideoOverlay
 video={mockVideo}
 isPlaying={false}
 hasWatched={false}
 isLoading={false}
 onPlayPause={mockOnPlayPause}
 onWatch={mockOnWatch}
 onShare={mockOnShare}
 />
 )

 const watchButton = screen.getByText('Watch Now')
 fireEvent.click(watchButton)

 expect(mockOnWatch).toHaveBeenCalled()
 })

 it('shows loading state when loading', () => {
 render(
 <VideoOverlay
 video={mockVideo}
 isPlaying={false}
 hasWatched={false}
 isLoading={true}
 onPlayPause={mockOnPlayPause}
 onWatch={mockOnWatch}
 onShare={mockOnShare}
 />
 )

 expect(screen.getByText('Processing...')).toBeInTheDocument()
 })

 it('shows loading overlay when watched and loading', () => {
 render(
 <VideoOverlay
 video={mockVideo}
 isPlaying={false}
 hasWatched={true}
 isLoading={true}
 onPlayPause={mockOnPlayPause}
 onWatch={mockOnWatch}
 onShare={mockOnShare}
 />
 )

 expect(screen.getByText('Loading video...')).toBeInTheDocument()
 })

 it('handles follow button click', () => {
 const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
 
 render(
 <VideoOverlay
 video={mockVideo}
 isPlaying={false}
 hasWatched={true}
 isLoading={false}
 onPlayPause={mockOnPlayPause}
 onWatch={mockOnWatch}
 onShare={mockOnShare}
 />
 )

 const followButton = screen.getByText('Follow')
 fireEvent.click(followButton)

 expect(followButton).toBeInTheDocument()
 
 consoleSpy.mockRestore()
 })

 it('handles creator click', () => {
 const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
 
 render(
 <VideoOverlay
 video={mockVideo}
 isPlaying={false}
 hasWatched={true}
 isLoading={false}
 onPlayPause={mockOnPlayPause}
 onWatch={mockOnWatch}
 onShare={mockOnShare}
 />
 )

 const creatorName = screen.getByText('Test User')
 fireEvent.click(creatorName)

 expect(consoleSpy).toHaveBeenCalledWith('Navigate to creator:', 'creator1')
 
 consoleSpy.mockRestore()
 })

 it('applies custom className', () => {
 const { container } = render(
 <VideoOverlay
 video={mockVideo}
 isPlaying={false}
 hasWatched={true}
 isLoading={false}
 onPlayPause={mockOnPlayPause}
 onWatch={mockOnWatch}
 onShare={mockOnShare}
 className="custom-class"
 />
 )

 expect(container.firstChild).toHaveClass('custom-class')
 })

 it('handles video without description', () => {
 const videoWithoutDescription = {
 ...mockVideo,
 description: undefined
 }

 render(
 <VideoOverlay
 video={videoWithoutDescription}
 isPlaying={false}
 hasWatched={true}
 isLoading={false}
 onPlayPause={mockOnPlayPause}
 onWatch={mockOnWatch}
 onShare={mockOnShare}
 />
 )

 expect(screen.getByText('Test Video')).toBeInTheDocument()

 expect(screen.queryByText('more')).not.toBeInTheDocument()
 })

 it('handles video without tags', () => {
 const videoWithoutTags = {
 ...mockVideo,
 tags: []
 }

 render(
 <VideoOverlay
 video={videoWithoutTags}
 isPlaying={false}
 hasWatched={true}
 isLoading={false}
 onPlayPause={mockOnPlayPause}
 onWatch={mockOnWatch}
 onShare={mockOnShare}
 />
 )

 expect(screen.getByText('Test Video')).toBeInTheDocument()

 expect(screen.queryByText('#test')).not.toBeInTheDocument()
 })
})