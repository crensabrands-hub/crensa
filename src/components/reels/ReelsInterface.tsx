'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { Video } from '@/types'
import { useSwipeable } from 'react-swipeable'
import VideoPlayer from './VideoPlayer'
import VideoOverlay from './VideoOverlay'

interface ReelsInterfaceProps {
 videos: Video[]
 currentIndex: number
 onVideoChange: (index: number) => void
 onVideoWatch: (videoId: string) => Promise<void>
 onInsufficientCredits?: (videoId: string) => void
 className?: string
}

interface ReelsState {
 currentVideo: Video | null
 isPlaying: boolean
 hasWatched: boolean
 isLoading: boolean
}

export default function ReelsInterface({
 videos,
 currentIndex,
 onVideoChange,
 onVideoWatch,
 onInsufficientCredits,
 className = ''
}: ReelsInterfaceProps) {
 const [state, setState] = useState<ReelsState>({
 currentVideo: videos[currentIndex] || null,
 isPlaying: false,
 hasWatched: false,
 isLoading: false
 })
 
 const [dragY, setDragY] = useState(0)
 const [isDragging, setIsDragging] = useState(false)
 const containerRef = useRef<HTMLDivElement>(null)
 const touchStartY = useRef<number>(0)
 const lastTouchY = useRef<number>(0)

 useEffect(() => {
 if (videos[currentIndex]) {
 setState(prev => ({
 ...prev,
 currentVideo: videos[currentIndex],
 hasWatched: false,
 isPlaying: false
 }))
 }
 }, [currentIndex, videos])

 const navigateToVideo = useCallback((direction: 'next' | 'prev') => {
 const newIndex = direction === 'next' 
 ? Math.min(currentIndex + 1, videos.length - 1)
 : Math.max(currentIndex - 1, 0)
 
 if (newIndex !== currentIndex) {
 onVideoChange(newIndex)
 }
 }, [currentIndex, videos.length, onVideoChange])

 const swipeHandlers = useSwipeable({
 onSwipedUp: () => navigateToVideo('next'),
 onSwipedDown: () => navigateToVideo('prev'),
 preventScrollOnSwipe: true,
 trackMouse: false,
 trackTouch: true,
 delta: 50
 })

 const handleTouchStart = (e: React.TouchEvent) => {
 touchStartY.current = e.touches[0].clientY
 lastTouchY.current = e.touches[0].clientY
 setIsDragging(true)
 }

 const handleTouchMove = (e: React.TouchEvent) => {
 if (!isDragging) return
 
 const currentY = e.touches[0].clientY
 const deltaY = currentY - lastTouchY.current
 const totalDelta = currentY - touchStartY.current

 let newDragY = totalDelta
 if (currentIndex === 0 && totalDelta > 0) {
 newDragY = totalDelta * 0.3 // Resistance when at first video
 } else if (currentIndex === videos.length - 1 && totalDelta < 0) {
 newDragY = totalDelta * 0.3 // Resistance when at last video
 }
 
 setDragY(newDragY)
 lastTouchY.current = currentY
 }

 const handleTouchEnd = () => {
 if (!isDragging) return
 
 const threshold = 100
 
 if (Math.abs(dragY) > threshold) {
 if (dragY > 0 && currentIndex > 0) {
 navigateToVideo('prev')
 } else if (dragY < 0 && currentIndex < videos.length - 1) {
 navigateToVideo('next')
 }
 }
 
 setDragY(0)
 setIsDragging(false)
 }

 const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
 const { offset } = info
 setDragY(offset.y)
 }

 const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
 const { offset, velocity } = info
 const threshold = 100
 const velocityThreshold = 500
 
 if (Math.abs(offset.y) > threshold || Math.abs(velocity.y) > velocityThreshold) {
 if (offset.y > 0 && currentIndex > 0) {
 navigateToVideo('prev')
 } else if (offset.y < 0 && currentIndex < videos.length - 1) {
 navigateToVideo('next')
 }
 }
 
 setDragY(0)
 setIsDragging(false)
 }

 const handleVideoWatch = async () => {
 if (!state.currentVideo || state.hasWatched) return
 
 setState(prev => ({ ...prev, isLoading: true }))
 
 try {
 await onVideoWatch(state.currentVideo.id)
 setState(prev => ({ 
 ...prev, 
 hasWatched: true, 
 isPlaying: true,
 isLoading: false 
 }))
 } catch (error) {
 console.error('Error watching video:', error)
 setState(prev => ({ ...prev, isLoading: false }))
 }
 }

 const handlePlayPause = () => {
 if (!state.hasWatched) {
 handleVideoWatch()
 } else {
 setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
 }
 }

 if (!state.currentVideo) {
 return (
 <div className={`flex items-center justify-center h-screen bg-black ${className}`}>
 <div className="text-white text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
 <p>Loading videos...</p>
 </div>
 </div>
 )
 }

 return (
 <div 
 ref={containerRef}
 className={`relative h-screen bg-black overflow-hidden ${className}`}
 onTouchStart={handleTouchStart}
 onTouchMove={handleTouchMove}
 onTouchEnd={handleTouchEnd}
 >
 <AnimatePresence mode="wait">
 <motion.div
 key={currentIndex}
 className="absolute inset-0"
 initial={{ opacity: 0, y: 50 }}
 animate={{ 
 opacity: 1, 
 y: dragY,
 transition: { 
 duration: isDragging ? 0 : 0.3,
 ease: 'easeOut'
 }
 }}
 exit={{ opacity: 0, y: -50 }}
 drag="y"
 dragConstraints={{ top: 0, bottom: 0 }}
 dragElastic={0.2}
 onDrag={handleDrag}
 onDragEnd={handleDragEnd}
 whileDrag={{ scale: 0.95 }}
 >
 {}
 <VideoPlayer
 video={state.currentVideo}
 isPlaying={state.isPlaying}
 hasWatched={state.hasWatched}
 onPlayPause={handlePlayPause}
 onVideoEnd={() => navigateToVideo('next')}
 className="absolute inset-0"
 />

 {}
 <VideoOverlay
 video={state.currentVideo}
 isPlaying={state.isPlaying}
 hasWatched={state.hasWatched}
 isLoading={state.isLoading}
 onPlayPause={handlePlayPause}
 onWatch={handleVideoWatch}
 onInsufficientCredits={() => {
 if (onInsufficientCredits && state.currentVideo) {
 onInsufficientCredits(state.currentVideo.id)
 }
 }}
 onShare={() => {

 if (navigator.share) {
 navigator.share({
 title: state.currentVideo?.title,
 text: `Check out "${state.currentVideo?.title}" on Crensa!`,
 url: window.location.href
 })
 }
 }}
 className="absolute inset-0 pointer-events-none"
 />
 </motion.div>
 </AnimatePresence>

 {}
 <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-20">
 {videos.map((_, index) => (
 <button
 key={index}
 onClick={() => onVideoChange(index)}
 className={`w-2 h-8 rounded-full transition-all ${
 index === currentIndex 
 ? 'bg-white' 
 : 'bg-white bg-opacity-40'
 }`}
 aria-label={`Go to video ${index + 1}`}
 />
 ))}
 </div>

 {}
 {currentIndex === 0 && (
 <motion.div
 className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-center z-20"
 initial={{ opacity: 1 }}
 animate={{ opacity: [1, 0.5, 1] }}
 transition={{ duration: 2, repeat: Infinity }}
 >
 <div className="flex flex-col items-center gap-2">
 <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
 <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
 </div>
 <p className="text-sm">Swipe up for next video</p>
 </div>
 </motion.div>
 )}
 </div>
 )
}