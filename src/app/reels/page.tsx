'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { ReelsInterface } from '@/components/reels'
import { Video } from '@/types'

export default function ReelsPage() {
 const { isSignedIn, userId } = useAuth()
 const router = useRouter()
 const [currentIndex, setCurrentIndex] = useState(0)
 const [videos, setVideos] = useState<Video[]>([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)

 useEffect(() => {
 const loadVideos = async () => {
 try {
 setLoading(true)
 setError(null)
 
 const response = await fetch('/api/reels/videos?limit=20')
 if (!response.ok) {
 throw new Error('Failed to load videos')
 }
 
 const videosData = await response.json()
 setVideos(videosData)
 } catch (error) {
 console.error('Error loading videos:', error)
 setError('Failed to load videos. Please try again.')
 } finally {
 setLoading(false)
 }
 }

 if (isSignedIn) {
 loadVideos()
 }
 }, [isSignedIn])

 useEffect(() => {
 if (!isSignedIn) {
 router.push('/sign-in?redirect_url=' + encodeURIComponent('/reels'))
 }
 }, [isSignedIn, router])

 const handleVideoChange = (index: number) => {
 setCurrentIndex(index)
 }

 const handleVideoWatch = async (videoId: string) => {
 if (!userId) {
 throw new Error('User not authenticated')
 }

 setLoading(true)
 
 try {
 const response = await fetch(`/api/videos/${videoId}/watch`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 }
 })

 if (!response.ok) {
 const errorData = await response.json()
 if (response.status === 400 && errorData.error?.includes('Insufficient')) {

 throw new Error(errorData.error)
 }
 throw new Error(errorData.error || 'Failed to watch video')
 }

 const data = await response.json()
 console.log('Video watch successful:', data)
 
 } catch (error) {
 console.error('Error watching video:', error)
 throw error
 } finally {
 setLoading(false)
 }
 }

 const handleInsufficientCredits = (videoId: string) => {
 const video = videos.find(v => v.id === videoId)
 const videoTitle = video?.title || 'this video'
 
 router.push(`/wallet/recharge?reason=insufficient_credits&video=${encodeURIComponent(videoTitle)}`)
 }

 if (!isSignedIn) {
 return (
 <div className="min-h-screen bg-black flex items-center justify-center">
 <div className="text-white text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
 <p>Redirecting to sign in...</p>
 </div>
 </div>
 )
 }

 if (loading) {
 return (
 <div className="min-h-screen bg-black flex items-center justify-center">
 <div className="text-white text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
 <p>Loading videos...</p>
 </div>
 </div>
 )
 }

 if (error) {
 return (
 <div className="min-h-screen bg-black flex items-center justify-center">
 <div className="text-white text-center">
 <p className="mb-4">{error}</p>
 <button 
 onClick={() => window.location.reload()} 
 className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
 >
 Try Again
 </button>
 </div>
 </div>
 )
 }

 if (videos.length === 0) {
 return (
 <div className="min-h-screen bg-black flex items-center justify-center">
 <div className="text-white text-center">
 <p className="mb-4">No videos available at the moment.</p>
 <button 
 onClick={() => router.push('/dashboard')} 
 className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
 >
 Go to Dashboard
 </button>
 </div>
 </div>
 )
 }

 return (
 <div className="min-h-screen bg-black">
 <ReelsInterface
 videos={videos}
 currentIndex={currentIndex}
 onVideoChange={handleVideoChange}
 onVideoWatch={handleVideoWatch}
 onInsufficientCredits={handleInsufficientCredits}
 className="w-full h-screen"
 />
 </div>
 )
}