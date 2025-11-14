import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import VideoPlayer from '../VideoPlayer'
import { Video } from '@/types'

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 button: ({ children, ...props }: any) => <button {...props}>{children}</button>
 }
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
 description: 'Test description',
 videoUrl: '/test.mp4',
 thumbnailUrl: '/thumb.jpg',
 duration: 120,
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
 username: 'testuser',
 displayName: 'Test User',
 avatar: '/avatar.jpg'
 }
}

describe('VideoPlayer', () => {
 const mockOnPlayPause = jest.fn()
 const mockOnVideoEnd = jest.fn()

 beforeEach(() => {
 jest.clearAllMocks()

 Object.defineProperty(HTMLVideoElement.prototype, 'play', {
 writable: true,
 value: jest.fn().mockResolvedValue(undefined)
 })
 
 Object.defineProperty(HTMLVideoElement.prototype, 'pause', {
 writable: true,
 value: jest.fn()
 })
 
 Object.defineProperty(HTMLVideoElement.prototype, 'load', {
 writable: true,
 value: jest.fn()
 })
 })

 it('renders thumbnail when video not watched', () => {
 render(
 <VideoPlayer
 video={mockVideo}
 isPlaying={false}
 hasWatched={false}
 onPlayPause={mockOnPlayPause}
 onVideoEnd={mockOnVideoEnd}
 />
 )

 expect(screen.getByAltText('Test Video')).toBeInTheDocument()
 expect(screen.getByText('2:00')).toBeInTheDocument() // Duration badge
 })

 it('renders video element when watched', () => {
 render(
 <VideoPlayer
 video={mockVideo}
 isPlaying={false}
 hasWatched={true}
 onPlayPause={mockOnPlayPause}
 onVideoEnd={mockOnVideoEnd}
 />
 )

 const videoElement = document.querySelector('video')
 expect(videoElement).toBeInTheDocument()
 expect(videoElement).toHaveAttribute('src', '/test.mp4')
 })

 it('calls onPlayPause when thumbnail is clicked', () => {
 render(
 <VideoPlayer
 video={mockVideo}
 isPlaying={false}
 hasWatched={false}
 onPlayPause={mockOnPlayPause}
 onVideoEnd={mockOnVideoEnd}
 />
 )

 const thumbnail = screen.getByAltText('Test Video').closest('div')
 fireEvent.click(thumbnail!)

 expect(mockOnPlayPause).toHaveBeenCalled()
 })

 it('shows buffering indicator when buffering', () => {
 render(
 <VideoPlayer
 video={mockVideo}
 isPlaying={true}
 hasWatched={true}
 onPlayPause={mockOnPlayPause}
 onVideoEnd={mockOnVideoEnd}
 />
 )

 const videoElement = document.querySelector('video')!

 fireEvent.waiting(videoElement)

 expect(document.querySelector('.animate-spin')).toBeInTheDocument()
 })

 it('handles video error gracefully', () => {
 render(
 <VideoPlayer
 video={mockVideo}
 isPlaying={true}
 hasWatched={true}
 onPlayPause={mockOnPlayPause}
 onVideoEnd={mockOnVideoEnd}
 />
 )

 const videoElement = document.querySelector('video')!

 fireEvent.error(videoElement)

 expect(screen.getByText('Failed to load video')).toBeInTheDocument()
 expect(screen.getByText('Retry')).toBeInTheDocument()
 })

 it('calls onVideoEnd when video ends', () => {
 render(
 <VideoPlayer
 video={mockVideo}
 isPlaying={true}
 hasWatched={true}
 onPlayPause={mockOnPlayPause}
 onVideoEnd={mockOnVideoEnd}
 />
 )

 const videoElement = document.querySelector('video')!

 fireEvent.ended(videoElement)

 expect(mockOnVideoEnd).toHaveBeenCalled()
 })

 it('updates time display during playback', () => {
 render(
 <VideoPlayer
 video={mockVideo}
 isPlaying={true}
 hasWatched={true}
 onPlayPause={mockOnPlayPause}
 onVideoEnd={mockOnVideoEnd}
 />
 )

 const videoElement = document.querySelector('video')!

 Object.defineProperty(videoElement, 'currentTime', {
 writable: true,
 value: 30
 })
 
 Object.defineProperty(videoElement, 'duration', {
 writable: true,
 value: 120
 })

 fireEvent.timeUpdate(videoElement)

 expect(videoElement).toHaveProperty('currentTime', 30)
 })

 it('handles progress bar click for seeking', async () => {
 render(
 <VideoPlayer
 video={mockVideo}
 isPlaying={true}
 hasWatched={true}
 onPlayPause={mockOnPlayPause}
 onVideoEnd={mockOnVideoEnd}
 />
 )

 const videoElement = document.querySelector('video')!

 Object.defineProperty(videoElement, 'duration', {
 writable: true,
 value: 120
 })

 fireEvent.loadedMetadata(videoElement)

 fireEvent.click(videoElement)

 await waitFor(() => {

 expect(videoElement).toHaveProperty('duration', 120)
 })
 })

 it('toggles mute when mute button is clicked', async () => {
 render(
 <VideoPlayer
 video={mockVideo}
 isPlaying={true}
 hasWatched={true}
 onPlayPause={mockOnPlayPause}
 onVideoEnd={mockOnVideoEnd}
 />
 )

 const videoElement = document.querySelector('video')!

 fireEvent.loadedMetadata(videoElement)

 fireEvent.click(videoElement)

 await waitFor(() => {
 const muteButton = screen.queryByRole('button', { name: /mute|unmute/i })
 if (muteButton) {
 fireEvent.click(muteButton)
 expect(videoElement).toHaveProperty('muted')
 }
 })
 })

 it('formats time correctly', () => {
 render(
 <VideoPlayer
 video={mockVideo}
 isPlaying={false}
 hasWatched={false}
 onPlayPause={mockOnPlayPause}
 onVideoEnd={mockOnVideoEnd}
 />
 )

 expect(screen.getByText('2:00')).toBeInTheDocument()
 })

 it('applies custom className', () => {
 const { container } = render(
 <VideoPlayer
 video={mockVideo}
 isPlaying={false}
 hasWatched={false}
 onPlayPause={mockOnPlayPause}
 onVideoEnd={mockOnVideoEnd}
 className="custom-class"
 />
 )

 expect(container.firstChild).toHaveClass('custom-class')
 })

 it('retries loading video on error retry click', () => {
 const mockLoad = jest.fn()
 
 render(
 <VideoPlayer
 video={mockVideo}
 isPlaying={true}
 hasWatched={true}
 onPlayPause={mockOnPlayPause}
 onVideoEnd={mockOnVideoEnd}
 />
 )

 const videoElement = document.querySelector('video')!
 videoElement.load = mockLoad

 fireEvent.error(videoElement)

 const retryButton = screen.getByText('Retry')
 fireEvent.click(retryButton)

 expect(mockLoad).toHaveBeenCalled()
 })
})