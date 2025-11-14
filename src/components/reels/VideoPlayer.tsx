'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Video } from '@/types'
import { 
 PlayIcon, 
 PauseIcon, 
 SpeakerWaveIcon, 
 SpeakerXMarkIcon 
} from '@heroicons/react/24/solid'

interface VideoPlayerProps {
 video: Video
 isPlaying: boolean
 hasWatched: boolean
 onPlayPause: () => void
 onVideoEnd: () => void
 className?: string
}

interface PlayerControls {
 play: () => void
 pause: () => void
 seek: (time: number) => void
 setVolume: (volume: number) => void
 getCurrentTime: () => number
 getDuration: () => number
}

export default function VideoPlayer({
 video,
 isPlaying,
 hasWatched,
 onPlayPause,
 onVideoEnd,
 className = ''
}: VideoPlayerProps) {
 const videoRef = useRef<HTMLVideoElement>(null)
 const [currentTime, setCurrentTime] = useState(0)
 const [duration, setDuration] = useState(0)
 const [volume, setVolume] = useState(1)
 const [isMuted, setIsMuted] = useState(false)
 const [isBuffering, setIsBuffering] = useState(false)
 const [showControls, setShowControls] = useState(false)
 const [error, setError] = useState<string | null>(null)
 
 const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

 const controls: PlayerControls = {
 play: () => videoRef.current?.play(),
 pause: () => videoRef.current?.pause(),
 seek: (time: number) => {
 if (videoRef.current) {
 videoRef.current.currentTime = time
 }
 },
 setVolume: (vol: number) => {
 if (videoRef.current) {
 videoRef.current.volume = vol
 setVolume(vol)
 }
 },
 getCurrentTime: () => videoRef.current?.currentTime || 0,
 getDuration: () => videoRef.current?.duration || 0
 }

 useEffect(() => {
 if (!videoRef.current || !hasWatched) return

 if (isPlaying) {
 videoRef.current.play().catch(error => {
 console.error('Error playing video:', error)
 setError('Failed to play video')
 })
 } else {
 videoRef.current.pause()
 }
 }, [isPlaying, hasWatched])

 const handleLoadedMetadata = () => {
 if (videoRef.current) {
 setDuration(videoRef.current.duration)
 setError(null)
 }
 }

 const handleTimeUpdate = () => {
 if (videoRef.current) {
 setCurrentTime(videoRef.current.currentTime)
 }
 }

 const handleEnded = () => {
 onVideoEnd()
 }

 const handleWaiting = () => {
 setIsBuffering(true)
 }

 const handleCanPlay = () => {
 setIsBuffering(false)
 }

 const handleError = () => {
 setError('Failed to load video')
 setIsBuffering(false)
 }

 const toggleMute = () => {
 if (videoRef.current) {
 const newMuted = !isMuted
 videoRef.current.muted = newMuted
 setIsMuted(newMuted)
 }
 }

 const handleVolumeChange = (newVolume: number) => {
 controls.setVolume(newVolume)
 if (newVolume === 0) {
 setIsMuted(true)
 } else if (isMuted) {
 setIsMuted(false)
 }
 }

 const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
 if (!videoRef.current || !hasWatched) return
 
 const rect = e.currentTarget.getBoundingClientRect()
 const clickX = e.clientX - rect.left
 const percentage = clickX / rect.width
 const newTime = percentage * duration
 
 controls.seek(newTime)
 }

 const showControlsTemporarily = useCallback(() => {
 setShowControls(true)
 
 if (controlsTimeoutRef.current) {
 clearTimeout(controlsTimeoutRef.current)
 }
 
 controlsTimeoutRef.current = setTimeout(() => {
 setShowControls(false)
 }, 3000)
 }, [])

 const handleVideoTap = () => {
 if (hasWatched) {
 showControlsTemporarily()
 } else {
 onPlayPause()
 }
 }

 const formatTime = (time: number) => {
 const minutes = Math.floor(time / 60)
 const seconds = Math.floor(time % 60)
 return `${minutes}:${seconds.toString().padStart(2, '0')}`
 }

 const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

 return (
 <div className={`relative w-full h-full bg-black ${className}`}>
 {}
 {hasWatched ? (
 <video
 ref={videoRef}
 src={video.videoUrl}
 className="w-full h-full object-cover"
 playsInline
 preload="metadata"
 onLoadedMetadata={handleLoadedMetadata}
 onTimeUpdate={handleTimeUpdate}
 onEnded={handleEnded}
 onWaiting={handleWaiting}
 onCanPlay={handleCanPlay}
 onError={handleError}
 onClick={handleVideoTap}
 />
 ) : (

 <div 
 className="w-full h-full relative cursor-pointer"
 onClick={handleVideoTap}
 >
 <Image
 src={video.thumbnailUrl}
 alt={video.title}
 fill
 className="object-cover"
 priority
 />
 
 {}
 <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
 <motion.div
 className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center"
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.95 }}
 >
 <PlayIcon className="w-8 h-8 text-black ml-1" />
 </motion.div>
 </div>
 </div>
 )}

 {}
 {isBuffering && hasWatched && (
 <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
 </div>
 )}

 {}
 {error && (
 <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
 <div className="text-white text-center">
 <p className="text-lg mb-4">{error}</p>
 <button
 onClick={() => {
 setError(null)
 if (videoRef.current) {
 videoRef.current.load()
 }
 }}
 className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
 >
 Retry
 </button>
 </div>
 </div>
 )}

 {}
 {hasWatched && (
 <motion.div
 className="absolute inset-0 pointer-events-none"
 initial={{ opacity: 0 }}
 animate={{ opacity: showControls ? 1 : 0 }}
 transition={{ duration: 0.3 }}
 >
 {}
 <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto">
 <button
 onClick={toggleMute}
 className="w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-75 transition-all"
 >
 {isMuted ? (
 <SpeakerXMarkIcon className="w-5 h-5" />
 ) : (
 <SpeakerWaveIcon className="w-5 h-5" />
 )}
 </button>
 </div>

 {}
 <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
 <motion.button
 onClick={onPlayPause}
 className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-75 transition-all"
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.95 }}
 >
 {isPlaying ? (
 <PauseIcon className="w-6 h-6" />
 ) : (
 <PlayIcon className="w-6 h-6 ml-1" />
 )}
 </motion.button>
 </div>

 {}
 <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
 {}
 <div 
 className="w-full h-1 bg-white bg-opacity-30 rounded-full cursor-pointer mb-2"
 onClick={handleProgressClick}
 >
 <div 
 className="h-full bg-white rounded-full transition-all duration-100"
 style={{ width: `${progressPercentage}%` }}
 />
 </div>

 {}
 <div className="flex items-center justify-between text-white text-sm">
 <span>{formatTime(currentTime)}</span>
 <span>{formatTime(duration)}</span>
 </div>
 </div>
 </motion.div>
 )}

 {}
 {!hasWatched && (
 <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
 {formatTime(video.duration)}
 </div>
 )}
 </div>
 )
}