import { renderHook, act } from '@testing-library/react'
import { useVideoUpload } from '../useVideoUpload'
import { VideoMetadata } from '@/types'

const mockXHR = {
 open: jest.fn(),
 send: jest.fn(),
 setRequestHeader: jest.fn(),
 upload: {
 addEventListener: jest.fn(),
 },
 addEventListener: jest.fn(),
 onload: null,
 onerror: null,
 ontimeout: null,
 status: 200,
 responseText: '',
 timeout: 0,
}

global.XMLHttpRequest = jest.fn(() => mockXHR) as any

const createMockFile = (name = 'test.mp4', size = 1024, type = 'video/mp4'): File => {
 const file = new File(['content'], name, { type })
 Object.defineProperty(file, 'size', { value: size })
 return file
}

const mockMetadata: VideoMetadata = {
 title: 'Test Video',
 description: 'Test description',
 category: 'Entertainment',
 tags: ['test'],
 creditCost: 5,
}

const mockVideoResponse = {
 success: true,
 video: {
 id: 'test-id',
 title: 'Test Video',
 creatorId: 'creator-id',
 videoUrl: 'https://test.com/video.mp4',
 thumbnailUrl: 'https://test.com/thumb.jpg',
 duration: 120,
 creditCost: 5,
 category: 'Entertainment',
 tags: ['test'],
 viewCount: 0,
 totalEarnings: 0,
 isActive: true,
 createdAt: '2025-08-23T14:11:29.598Z',
 updatedAt: '2025-08-23T14:11:29.598Z',
 },
}

describe('useVideoUpload', () => {
 beforeEach(() => {
 jest.clearAllMocks()
 mockXHR.status = 200
 mockXHR.responseText = JSON.stringify(mockVideoResponse)
 })

 it('initializes with correct default state', () => {
 const { result } = renderHook(() => useVideoUpload())

 expect(result.current.uploadState).toEqual({
 file: null,
 uploadProgress: 0,
 isProcessing: false,
 error: null,
 isUploading: false,
 })
 })

 it('handles successful upload', async () => {
 const { result } = renderHook(() => useVideoUpload())
 const mockFile = createMockFile()

 let uploadPromise: Promise<any>

 act(() => {
 uploadPromise = result.current.uploadVideo(mockFile, mockMetadata)
 })

 expect(result.current.uploadState.isUploading).toBe(true)
 expect(result.current.uploadState.isProcessing).toBe(true)
 expect(result.current.uploadState.file).toBe(mockFile)

 act(() => {
 const progressCallback = mockXHR.upload.addEventListener.mock.calls.find(
 call => call[0] === 'progress'
 )?.[1]
 
 if (progressCallback) {
 progressCallback({
 lengthComputable: true,
 loaded: 50,
 total: 100,
 })
 }
 })

 expect(result.current.uploadState.uploadProgress).toBe(50)

 act(() => {
 if (mockXHR.onload) {
 mockXHR.onload()
 }
 })

 const video = await act(async () => await uploadPromise!)
 
 expect(video).toEqual(mockVideoResponse.video)
 expect(result.current.uploadState.isUploading).toBe(false)
 expect(result.current.uploadState.isProcessing).toBe(false)
 expect(result.current.uploadState.error).toBe(null)
 })

 it('handles upload errors', async () => {
 const { result } = renderHook(() => useVideoUpload())
 const mockFile = createMockFile()

 mockXHR.status = 400
 mockXHR.responseText = JSON.stringify({ error: 'Invalid file' })

 let uploadPromise: Promise<any>
 let error: any

 act(() => {
 uploadPromise = result.current.uploadVideo(mockFile, mockMetadata)
 })

 await act(async () => {
 if (mockXHR.onload) {
 mockXHR.onload()
 }
 
 try {
 await uploadPromise!
 } catch (e) {
 error = e
 }
 })

 expect(error).toBeInstanceOf(Error)
 expect(error.message).toBe('Invalid file')
 expect(result.current.uploadState.isUploading).toBe(false)
 expect(result.current.uploadState.isProcessing).toBe(false)
 expect(result.current.uploadState.error).toBe('Invalid file')
 })

 it('handles network errors', async () => {
 const { result } = renderHook(() => useVideoUpload())
 const mockFile = createMockFile()

 let uploadPromise: Promise<any>
 let error: any

 act(() => {
 uploadPromise = result.current.uploadVideo(mockFile, mockMetadata)
 })

 await act(async () => {
 if (mockXHR.onerror) {
 mockXHR.onerror()
 }
 
 try {
 await uploadPromise!
 } catch (e) {
 error = e
 }
 })

 expect(error).toBeInstanceOf(Error)
 expect(error.message).toBe('Network error during upload')
 expect(result.current.uploadState.error).toBe('Network error during upload')
 })

 it('handles timeout errors', async () => {
 const { result } = renderHook(() => useVideoUpload())
 const mockFile = createMockFile()

 let uploadPromise: Promise<any>
 let error: any

 act(() => {
 uploadPromise = result.current.uploadVideo(mockFile, mockMetadata)
 })

 await act(async () => {
 if (mockXHR.ontimeout) {
 mockXHR.ontimeout()
 }
 
 try {
 await uploadPromise!
 } catch (e) {
 error = e
 }
 })

 expect(error).toBeInstanceOf(Error)
 expect(error.message).toBe('Upload timeout')
 expect(result.current.uploadState.error).toBe('Upload timeout')
 })

 it('resets upload state', () => {
 const { result } = renderHook(() => useVideoUpload())

 act(() => {
 result.current.setError('Test error')
 })

 expect(result.current.uploadState.error).toBe('Test error')

 act(() => {
 result.current.resetUpload()
 })

 expect(result.current.uploadState).toEqual({
 file: null,
 uploadProgress: 0,
 isProcessing: false,
 error: null,
 isUploading: false,
 })
 })

 it('sets error state', () => {
 const { result } = renderHook(() => useVideoUpload())

 act(() => {
 result.current.setError('Custom error')
 })

 expect(result.current.uploadState.error).toBe('Custom error')

 act(() => {
 result.current.setError(null)
 })

 expect(result.current.uploadState.error).toBe(null)
 })

 it('configures XMLHttpRequest correctly', async () => {
 const { result } = renderHook(() => useVideoUpload())
 const mockFile = createMockFile()

 act(() => {
 result.current.uploadVideo(mockFile, mockMetadata)
 })

 expect(mockXHR.open).toHaveBeenCalledWith('POST', '/api/videos/upload')
 expect(mockXHR.timeout).toBe(300000) // 5 minutes
 expect(mockXHR.send).toHaveBeenCalledWith(expect.any(FormData))
 })

 it('tracks upload progress correctly', async () => {
 const { result } = renderHook(() => useVideoUpload())
 const mockFile = createMockFile()

 act(() => {
 result.current.uploadVideo(mockFile, mockMetadata)
 })

 const progressCallback = mockXHR.upload.addEventListener.mock.calls.find(
 call => call[0] === 'progress'
 )?.[1]

 if (progressCallback) {
 act(() => {
 progressCallback({ lengthComputable: true, loaded: 25, total: 100 })
 })
 expect(result.current.uploadState.uploadProgress).toBe(25)

 act(() => {
 progressCallback({ lengthComputable: true, loaded: 75, total: 100 })
 })
 expect(result.current.uploadState.uploadProgress).toBe(75)

 act(() => {
 progressCallback({ lengthComputable: true, loaded: 100, total: 100 })
 })
 expect(result.current.uploadState.uploadProgress).toBe(100)
 }
 })

 it('handles non-computable progress', async () => {
 const { result } = renderHook(() => useVideoUpload())
 const mockFile = createMockFile()

 act(() => {
 result.current.uploadVideo(mockFile, mockMetadata)
 })

 const progressCallback = mockXHR.upload.addEventListener.mock.calls.find(
 call => call[0] === 'progress'
 )?.[1]

 if (progressCallback) {
 act(() => {
 progressCallback({ lengthComputable: false, loaded: 50, total: 0 })
 })

 expect(result.current.uploadState.uploadProgress).toBe(0)
 }
 })
})