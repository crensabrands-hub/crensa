import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { jest } from '@jest/globals'
import ReelsInterface from '../ReelsInterface'
import { Video } from '@/types'

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, onDrag, onDragEnd, ...props }: any) => (
 <div 
 {...props}
 onMouseDown={(e: any) => {
 if (onDrag) {
 onDrag(e, { offset: { y: -50 }, velocity: { y: -100 } })
 }
 }}
 onMouseUp={(e: any) => {
 if (onDragEnd) {
 onDragEnd(e, { offset: { y: -150 }, velocity: { y: -600 } })
 }
 }}
 >
 {children}
 </div>
 ),
 button: ({ children, ...props }: any) => <button {...props}>{children}</button>
 },
 AnimatePresence: ({ children }: any) => <div>{children}</div>
}))

jest.mock('react-swipeable', () => ({
 useSwipeable: ({ onSwipedUp, onSwipedDown }: any) => ({
 onTouchStart: (e: any) => {

 },
 onTouchMove: (e: any) => {

 },
 onTouchEnd: (e: any) => {

 if (onSwipedUp) onSwipedUp(e)
 }
 })
}))

jest.mock('../VideoPlayer', () => {
 return function MockVideoPlayer({ video }: any) {
 return <div data-testid="video-player">{video.title}</div>
 }
})

jest.mock('../VideoOverlay', () => {
 return function MockVideoOverlay({ video }: any) {
 return <div data-testid="video-overlay">{video.title}</div>
 }
})

const mockVideos: Video[] = [
 {
 id: '1',
 creatorId: 'creator1',
 title: 'Video 1',
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
 updatedAt: new Date()
 },
 {
 id: '2',
 creatorId: 'creator2',
 title: 'Video 2',
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
 updatedAt: new Date()
 },
 {
 id: '3',
 creatorId: 'creator3',
 title: 'Video 3',
 videoUrl: '/test3.mp4',
 thumbnailUrl: '/thumb3.jpg',
 duration: 45,
 creditCost: 3,
 category: 'Test',
 tags: ['test'],
 viewCount: 150,
 totalEarnings: 450,
 isActive: true,
 createdAt: new Date(),
 updatedAt: new Date()
 }
]

describe('ReelsInterface - Gesture Handling', () => {
 const mockOnVideoChange = jest.fn()
 const mockOnVideoWatch = jest.fn()

 beforeEach(() => {
 jest.clearAllMocks()
 })

 it('handles swipe up gesture to go to next video', () => {
 const { container } = render(
 <ReelsInterface
 videos={mockVideos}
 currentIndex={0}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 />
 )

 const reelsContainer = container.firstChild as HTMLElement

 fireEvent.touchStart(reelsContainer, {
 touches: [{ clientY: 200 }]
 })

 fireEvent.touchMove(reelsContainer, {
 touches: [{ clientY: 100 }]
 })

 fireEvent.touchEnd(reelsContainer)

 expect(mockOnVideoChange).toHaveBeenCalledWith(1)
 })

 it('handles swipe down gesture to go to previous video', () => {
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
 touches: [{ clientY: 200 }]
 })

 fireEvent.touchEnd(reelsContainer)

 expect(mockOnVideoChange).toHaveBeenCalledWith(0)
 })

 it('applies resistance at first video when swiping down', () => {
 const { container } = render(
 <ReelsInterface
 videos={mockVideos}
 currentIndex={0}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 />
 )

 const reelsContainer = container.firstChild as HTMLElement

 fireEvent.touchStart(reelsContainer, {
 touches: [{ clientY: 100 }]
 })

 fireEvent.touchMove(reelsContainer, {
 touches: [{ clientY: 150 }]
 })

 fireEvent.touchEnd(reelsContainer)

 expect(mockOnVideoChange).not.toHaveBeenCalled()
 })

 it('applies resistance at last video when swiping up', () => {
 const { container } = render(
 <ReelsInterface
 videos={mockVideos}
 currentIndex={2}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 />
 )

 const reelsContainer = container.firstChild as HTMLElement

 fireEvent.touchStart(reelsContainer, {
 touches: [{ clientY: 200 }]
 })

 fireEvent.touchMove(reelsContainer, {
 touches: [{ clientY: 150 }]
 })

 fireEvent.touchEnd(reelsContainer)

 expect(mockOnVideoChange).not.toHaveBeenCalled()
 })

 it('handles drag gesture with framer motion', () => {
 const { container } = render(
 <ReelsInterface
 videos={mockVideos}
 currentIndex={0}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 />
 )

 const dragElement = container.querySelector('[onMouseDown]') as HTMLElement

 fireEvent.mouseDown(dragElement)
 fireEvent.mouseUp(dragElement)

 expect(mockOnVideoChange).toHaveBeenCalledWith(1)
 })

 it('requires minimum threshold for navigation', () => {
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
 touches: [{ clientY: 120 }] // Only 20px movement
 })

 fireEvent.touchEnd(reelsContainer)

 expect(mockOnVideoChange).not.toHaveBeenCalled()
 })

 it('handles velocity-based navigation', () => {

 const { container } = render(
 <ReelsInterface
 videos={mockVideos}
 currentIndex={0}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 />
 )

 const dragElement = container.querySelector('[onMouseDown]') as HTMLElement

 fireEvent.mouseDown(dragElement)
 fireEvent.mouseUp(dragElement)

 expect(mockOnVideoChange).toHaveBeenCalledWith(1)
 })

 it('prevents navigation beyond boundaries', () => {

 const { rerender, container } = render(
 <ReelsInterface
 videos={mockVideos}
 currentIndex={0}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 />
 )

 let reelsContainer = container.firstChild as HTMLElement

 fireEvent.touchStart(reelsContainer, {
 touches: [{ clientY: 100 }]
 })

 fireEvent.touchMove(reelsContainer, {
 touches: [{ clientY: 250 }] // Large downward swipe
 })

 fireEvent.touchEnd(reelsContainer)

 expect(mockOnVideoChange).not.toHaveBeenCalled()

 rerender(
 <ReelsInterface
 videos={mockVideos}
 currentIndex={2}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 />
 )

 reelsContainer = container.firstChild as HTMLElement

 fireEvent.touchStart(reelsContainer, {
 touches: [{ clientY: 250 }]
 })

 fireEvent.touchMove(reelsContainer, {
 touches: [{ clientY: 100 }] // Large upward swipe
 })

 fireEvent.touchEnd(reelsContainer)

 expect(mockOnVideoChange).not.toHaveBeenCalled()
 })

 it('handles multiple touch points gracefully', () => {
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
 touches: [
 { clientY: 100 },
 { clientY: 150 }
 ]
 })

 fireEvent.touchMove(reelsContainer, {
 touches: [
 { clientY: 50 }, // First touch moves up
 { clientY: 200 } // Second touch moves down
 ]
 })

 fireEvent.touchEnd(reelsContainer)

 expect(mockOnVideoChange).toHaveBeenCalledWith(2)
 })

 it('resets drag state after navigation', () => {
 const { container } = render(
 <ReelsInterface
 videos={mockVideos}
 currentIndex={0}
 onVideoChange={mockOnVideoChange}
 onVideoWatch={mockOnVideoWatch}
 />
 )

 const reelsContainer = container.firstChild as HTMLElement

 fireEvent.touchStart(reelsContainer, {
 touches: [{ clientY: 200 }]
 })

 fireEvent.touchMove(reelsContainer, {
 touches: [{ clientY: 50 }]
 })

 fireEvent.touchEnd(reelsContainer)

 expect(mockOnVideoChange).toHaveBeenCalledWith(1)

 mockOnVideoChange.mockClear()

 fireEvent.touchStart(reelsContainer, {
 touches: [{ clientY: 200 }]
 })

 fireEvent.touchMove(reelsContainer, {
 touches: [{ clientY: 50 }]
 })

 fireEvent.touchEnd(reelsContainer)

 expect(mockOnVideoChange).toHaveBeenCalledWith(1)
 })
})