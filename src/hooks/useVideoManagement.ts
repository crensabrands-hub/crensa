'use client'

import { useState, useEffect, useCallback } from 'react'
import { Video } from '@/types'

interface UseVideoManagementOptions {
 sortBy?: 'newest' | 'oldest' | 'views' | 'earnings' | 'title'
 filterBy?: 'all' | 'active' | 'inactive'
 limit?: number
}

interface UseVideoManagementReturn {
 videos: Video[]
 isLoading: boolean
 error: string | null
 refetch: () => Promise<void>
 updateVideo: (video: Video) => Promise<void>
 deleteVideo: (videoId: string) => Promise<void>
 toggleVideoStatus: (videoId: string, isActive: boolean) => Promise<void>
 pagination: {
 total: number
 limit: number
 offset: number
 hasMore: boolean
 }
}

export function useVideoManagement(options: UseVideoManagementOptions = {}): UseVideoManagementReturn {
 const {
 sortBy = 'newest',
 filterBy = 'all',
 limit = 50
 } = options

 const [videos, setVideos] = useState<Video[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)
 const [pagination, setPagination] = useState({
 total: 0,
 limit: 50,
 offset: 0,
 hasMore: false
 })

 const fetchVideos = useCallback(async () => {
 try {
 setIsLoading(true)
 setError(null)

 const params = new URLSearchParams({
 sortBy,
 filterBy,
 limit: limit.toString(),
 offset: '0'
 })

 const response = await fetch(`/api/videos?${params}`)
 
 if (!response.ok) {
 const errorData = await response.json()
 throw new Error(errorData.error || 'Failed to fetch videos')
 }

 const data = await response.json()
 
 setVideos(data.videos)
 setPagination(data.pagination)

 } catch (error) {
 setError(error instanceof Error ? error.message : 'Failed to fetch videos')
 setVideos([])
 } finally {
 setIsLoading(false)
 }
 }, [sortBy, filterBy, limit])

 const updateVideo = useCallback(async (updatedVideo: Video) => {
 try {
 const response = await fetch(`/api/videos/${updatedVideo.id}`, {
 method: 'PATCH',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 title: updatedVideo.title,
 description: updatedVideo.description,
 category: updatedVideo.category,
 tags: updatedVideo.tags,
 creditCost: updatedVideo.creditCost,
 isActive: updatedVideo.isActive
 }),
 })

 if (!response.ok) {
 const errorData = await response.json()
 throw new Error(errorData.error || 'Failed to update video')
 }

 const { video } = await response.json()

 setVideos(prev => prev.map(v => v.id === video.id ? video : v))

 } catch (error) {
 throw error // Re-throw to let the component handle it
 }
 }, [])

 const deleteVideo = useCallback(async (videoId: string) => {
 try {
 const response = await fetch(`/api/videos/${videoId}`, {
 method: 'DELETE',
 })

 if (!response.ok) {
 const errorData = await response.json()
 throw new Error(errorData.error || 'Failed to delete video')
 }

 setVideos(prev => prev.filter(v => v.id !== videoId))
 setPagination(prev => ({
 ...prev,
 total: prev.total - 1
 }))

 } catch (error) {
 throw error // Re-throw to let the component handle it
 }
 }, [])

 const toggleVideoStatus = useCallback(async (videoId: string, isActive: boolean) => {
 try {
 const response = await fetch(`/api/videos/${videoId}`, {
 method: 'PATCH',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({ isActive }),
 })

 if (!response.ok) {
 const errorData = await response.json()
 throw new Error(errorData.error || 'Failed to update video status')
 }

 const { video } = await response.json()

 setVideos(prev => prev.map(v => v.id === video.id ? video : v))

 } catch (error) {
 throw error // Re-throw to let the component handle it
 }
 }, [])

 useEffect(() => {
 fetchVideos()
 }, [fetchVideos])

 return {
 videos,
 isLoading,
 error,
 refetch: fetchVideos,
 updateVideo,
 deleteVideo,
 toggleVideoStatus,
 pagination
 }
}