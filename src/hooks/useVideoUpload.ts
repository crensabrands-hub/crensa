'use client'

import { useState, useCallback } from 'react'
import { Video, UploadState, VideoMetadata } from '@/types'

interface UseVideoUploadReturn {
 uploadState: UploadState
 uploadVideo: (file: File, metadata: VideoMetadata) => Promise<Video>
 resetUpload: () => void
 setError: (error: string | null) => void
}

export function useVideoUpload(): UseVideoUploadReturn {
 const [uploadState, setUploadState] = useState<UploadState>({
 file: null,
 uploadProgress: 0,
 isProcessing: false,
 error: null,
 isUploading: false
 })

 const uploadVideo = useCallback(async (file: File, metadata: VideoMetadata): Promise<Video> => {
 setUploadState(prev => ({
 ...prev,
 file,
 isUploading: true,
 isProcessing: true,
 error: null,
 uploadProgress: 0
 }))

 try {

 const formData = new FormData()
 formData.append('video', file)
 formData.append('metadata', JSON.stringify(metadata))

 const result = await new Promise<any>((resolve, reject) => {
 const xhr = new XMLHttpRequest()

 xhr.upload.addEventListener('progress', (e) => {
 if (e.lengthComputable) {
 const progress = Math.round((e.loaded / e.total) * 100)
 setUploadState(prev => ({ ...prev, uploadProgress: progress }))
 }
 })

 xhr.onload = () => {
 if (xhr.status >= 200 && xhr.status < 300) {
 try {
 const responseData = JSON.parse(xhr.responseText)
 resolve(responseData)
 } catch (error) {
 reject(new Error('Invalid response format'))
 }
 } else {
 try {
 const errorData = JSON.parse(xhr.responseText)
 reject(new Error(errorData.error || `Upload failed: ${xhr.statusText}`))
 } catch (error) {
 reject(new Error(`Upload failed: ${xhr.statusText}`))
 }
 }
 }

 xhr.onerror = () => reject(new Error('Network error during upload'))
 xhr.ontimeout = () => reject(new Error('Upload timeout'))

 xhr.open('POST', '/api/videos/upload')
 xhr.timeout = 300000 // 5 minutes timeout
 xhr.send(formData)
 })

 if (!result.success) {
 throw new Error(result.error || 'Upload failed')
 }

 setUploadState({
 file: null,
 uploadProgress: 0,
 isProcessing: false,
 error: null,
 isUploading: false
 })

 return result.video

 } catch (error) {
 const errorMessage = error instanceof Error ? error.message : 'Upload failed'
 
 setUploadState(prev => ({
 ...prev,
 isUploading: false,
 isProcessing: false,
 error: errorMessage
 }))

 throw error
 }
 }, [])

 const resetUpload = useCallback(() => {
 setUploadState({
 file: null,
 uploadProgress: 0,
 isProcessing: false,
 error: null,
 isUploading: false
 })
 }, [])

 const setError = useCallback((error: string | null) => {
 setUploadState(prev => ({ ...prev, error }))
 }, [])

 return {
 uploadState,
 uploadVideo,
 resetUpload,
 setError
 }
}