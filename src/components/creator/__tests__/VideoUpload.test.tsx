import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import VideoUpload from '../VideoUpload'
import { Video } from '@/types'

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 },
 AnimatePresence: ({ children }: any) => <>{children}</>,
}))

global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

global.fetch = jest.fn((url) => {

 if (url === '/api/series?creator=me') {
 return Promise.resolve({
 ok: true,
 json: () => Promise.resolve({ series: [] })
 } as Response)
 }
 return Promise.resolve({
 ok: true,
 json: () => Promise.resolve({})
 } as Response)
})
global.XMLHttpRequest = jest.fn(() => ({
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
 responseText: JSON.stringify({
 success: true,
 video: {
 id: 'test-video-id',
 title: 'Test Video',
 creatorId: 'test-creator-id',
 videoUrl: 'https://test.com/video.mp4',
 thumbnailUrl: 'https://test.com/thumb.jpg',
 duration: 120,
 creditCost: 5,
 category: 'Entertainment',
 tags: ['test'],
 viewCount: 0,
 totalEarnings: 0,
 isActive: true,
 createdAt: new Date(),
 updatedAt: new Date(),
 },
 }),
})) as any

const mockOnUploadComplete = jest.fn()

const createMockVideoFile = (
 name = 'test-video.mp4',
 size = 50 * 1024 * 1024, // 50MB
 type = 'video/mp4'
): File => {
 const file = new File(['video content'], name, { type })
 Object.defineProperty(file, 'size', { value: size })
 return file
}

describe('VideoUpload Component', () => {
 beforeEach(() => {
 jest.clearAllMocks()
 mockOnUploadComplete.mockClear()
 })

 it('renders upload interface correctly', () => {
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />)
 
 expect(screen.getByText('Upload Video')).toBeInTheDocument()
 expect(screen.getByText('Share your content with the world and start earning')).toBeInTheDocument()
 expect(screen.getByText('Drop your video here or click to browse')).toBeInTheDocument()
 })

 it('handles file selection via input', async () => {
 const user = userEvent.setup()
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />)
 
 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
 const mockFile = createMockVideoFile()
 
 await user.upload(fileInput, mockFile)
 
 await waitFor(() => {
 expect(screen.getByText('test-video.mp4')).toBeInTheDocument()
 expect(screen.getByText('50MB')).toBeInTheDocument()
 })
 })

 it('validates file format', async () => {
 const user = userEvent.setup()
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />)
 
 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
 const invalidFile = createMockVideoFile('test.txt', 1024, 'text/plain')
 
 await user.upload(fileInput, invalidFile)
 
 await waitFor(() => {
 expect(screen.getByText(/Invalid file format/)).toBeInTheDocument()
 })
 })

 it('validates file size', async () => {
 const user = userEvent.setup()
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} maxFileSize={10 * 1024 * 1024} />)
 
 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
 const largeFile = createMockVideoFile('large-video.mp4', 50 * 1024 * 1024)
 
 await user.upload(fileInput, largeFile)
 
 await waitFor(() => {
 expect(screen.getByText(/File size too large/)).toBeInTheDocument()
 })
 })

 it('handles drag and drop', async () => {
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />)
 
 const dropZone = screen.getByText('Drop your video here or click to browse').closest('div')!
 const mockFile = createMockVideoFile()

 fireEvent.dragOver(dropZone, {
 dataTransfer: {
 files: [mockFile],
 },
 })

 fireEvent.drop(dropZone, {
 dataTransfer: {
 files: [mockFile],
 },
 })
 
 await waitFor(() => {
 expect(screen.getByText('test-video.mp4')).toBeInTheDocument()
 })
 })

 it('shows metadata form after file selection', async () => {
 const user = userEvent.setup()
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />)
 
 const fileInput = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement
 const mockFile = createMockVideoFile()
 
 await user.upload(fileInput, mockFile)
 
 await waitFor(() => {
 expect(screen.getByText('Video Details')).toBeInTheDocument()
 expect(screen.getByLabelText(/Title/)).toBeInTheDocument()
 expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
 expect(screen.getByLabelText(/Category/)).toBeInTheDocument()
 expect(screen.getByLabelText(/Coin Price/)).toBeInTheDocument()
 })
 })

 it('auto-populates title from filename', async () => {
 const user = userEvent.setup()
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />)
 
 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
 const mockFile = createMockVideoFile('my-awesome-video.mp4')
 
 await user.upload(fileInput, mockFile)
 
 await waitFor(() => {
 const titleInput = screen.getByLabelText(/Title/) as HTMLInputElement
 expect(titleInput.value).toBe('my-awesome-video')
 })
 })

 it('handles tag addition and removal', async () => {
 const user = userEvent.setup()
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />)

 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
 const mockFile = createMockVideoFile()
 await user.upload(fileInput, mockFile)
 
 await waitFor(() => {
 expect(screen.getByText('Video Details')).toBeInTheDocument()
 })

 const tagInput = screen.getByPlaceholderText('Add a tag and press Enter')
 await user.type(tagInput, 'comedy')
 await user.click(screen.getByText('Add'))
 
 await waitFor(() => {
 expect(screen.getByText('comedy')).toBeInTheDocument()
 })

 const removeButton = screen.getByRole('button', { name: '' }) // X button
 await user.click(removeButton)
 
 await waitFor(() => {
 expect(screen.queryByText('comedy')).not.toBeInTheDocument()
 })
 })

 it('validates required fields before upload', async () => {
 const user = userEvent.setup()
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />)

 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
 const mockFile = createMockVideoFile()
 await user.upload(fileInput, mockFile)
 
 await waitFor(() => {
 expect(screen.getByText('Upload Video', { selector: 'button' })).toBeInTheDocument()
 })

 const uploadButton = screen.getByText('Upload Video', { selector: 'button' })
 await user.click(uploadButton)
 
 await waitFor(() => {
 expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument()
 })
 })

 it('handles successful upload', async () => {
 const user = userEvent.setup()
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />)

 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
 const mockFile = createMockVideoFile()
 await user.upload(fileInput, mockFile)
 
 await waitFor(() => {
 expect(screen.getByLabelText(/Title/)).toBeInTheDocument()
 })

 const titleInput = screen.getByLabelText(/Title/)
 const categorySelect = screen.getByLabelText(/Category/)
 
 await user.clear(titleInput)
 await user.type(titleInput, 'Test Video Title')
 await user.selectOptions(categorySelect, 'Entertainment')

 const mockXHR = {
 open: jest.fn(),
 send: jest.fn(),
 setRequestHeader: jest.fn(),
 upload: {
 addEventListener: jest.fn((event, callback) => {
 if (event === 'progress') {

 setTimeout(() => callback({ lengthComputable: true, loaded: 100, total: 100 }), 100)
 }
 }),
 },
 addEventListener: jest.fn(),
 onload: null,
 onerror: null,
 ontimeout: null,
 status: 200,
 responseText: JSON.stringify({
 success: true,
 video: {
 id: 'test-video-id',
 title: 'Test Video Title',
 creatorId: 'test-creator-id',
 videoUrl: 'https://test.com/video.mp4',
 thumbnailUrl: 'https://test.com/thumb.jpg',
 duration: 120,
 creditCost: 1,
 category: 'Entertainment',
 tags: [],
 viewCount: 0,
 totalEarnings: 0,
 isActive: true,
 createdAt: new Date(),
 updatedAt: new Date(),
 },
 }),
 }
 
 ;(global.XMLHttpRequest as jest.Mock).mockImplementation(() => mockXHR)

 const uploadButton = screen.getByText('Upload Video', { selector: 'button' })
 await user.click(uploadButton)

 setTimeout(() => {
 if (mockXHR.onload) {
 mockXHR.onload()
 }
 }, 200)
 
 await waitFor(() => {
 expect(mockOnUploadComplete).toHaveBeenCalledWith(
 expect.objectContaining({
 id: 'test-video-id',
 title: 'Test Video Title',
 })
 )
 }, { timeout: 3000 })
 })

 it('handles upload errors', async () => {
 const user = userEvent.setup()
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />)

 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
 const mockFile = createMockVideoFile()
 await user.upload(fileInput, mockFile)
 
 await waitFor(() => {
 expect(screen.getByLabelText(/Title/)).toBeInTheDocument()
 })
 
 const titleInput = screen.getByLabelText(/Title/)
 const categorySelect = screen.getByLabelText(/Category/)
 
 await user.clear(titleInput)
 await user.type(titleInput, 'Test Video')
 await user.selectOptions(categorySelect, 'Entertainment')

 const mockXHR = {
 open: jest.fn(),
 send: jest.fn(),
 upload: { addEventListener: jest.fn() },
 addEventListener: jest.fn(),
 onload: null,
 onerror: null,
 status: 500,
 statusText: 'Internal Server Error',
 }
 
 ;(global.XMLHttpRequest as jest.Mock).mockImplementation(() => mockXHR)
 
 const uploadButton = screen.getByText('Upload Video', { selector: 'button' })
 await user.click(uploadButton)

 setTimeout(() => {
 if (mockXHR.onload) {
 mockXHR.onload()
 }
 }, 100)
 
 await waitFor(() => {
 expect(screen.getByText(/Upload failed/)).toBeInTheDocument()
 }, { timeout: 2000 })
 })

 it('allows file removal', async () => {
 const user = userEvent.setup()
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />)

 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
 const mockFile = createMockVideoFile()
 await user.upload(fileInput, mockFile)
 
 await waitFor(() => {
 expect(screen.getByText('test-video.mp4')).toBeInTheDocument()
 })

 const removeButton = screen.getByText('Remove')
 await user.click(removeButton)
 
 await waitFor(() => {
 expect(screen.queryByText('test-video.mp4')).not.toBeInTheDocument()
 expect(screen.getByText('Drop your video here or click to browse')).toBeInTheDocument()
 })
 })

 it('enforces tag limits', async () => {
 const user = userEvent.setup()
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />)

 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
 const mockFile = createMockVideoFile()
 await user.upload(fileInput, mockFile)
 
 await waitFor(() => {
 expect(screen.getByText('Video Details')).toBeInTheDocument()
 })
 
 const tagInput = screen.getByPlaceholderText('Add a tag and press Enter')
 const addButton = screen.getByText('Add')

 for (let i = 1; i <= 10; i++) {
 await user.type(tagInput, `tag${i}`)
 await user.click(addButton)
 }
 
 await waitFor(() => {
 expect(screen.getByText('10/10 tags')).toBeInTheDocument()
 })

 await user.type(tagInput, 'tag11')

 expect(addButton).toBeDisabled()
 })

 it('uses CoinInput component for pricing', async () => {
 const user = userEvent.setup()
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />)

 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
 const mockFile = createMockVideoFile()
 await user.upload(fileInput, mockFile)
 
 await waitFor(() => {
 expect(screen.getByText('Video Details')).toBeInTheDocument()
 })

 expect(screen.getByText('Coin Price')).toBeInTheDocument()

 const coinPriceInput = screen.getByPlaceholderText('Enter coin price')
 expect(coinPriceInput).toBeInTheDocument()

 expect(coinPriceInput).toHaveValue('20')

 await waitFor(() => {
 expect(screen.getByText(/Rupee equivalent:/)).toBeInTheDocument()
 expect(screen.getByText(/₹1\.00/)).toBeInTheDocument()
 })
 })

 it('validates coin price range (1-2000)', async () => {
 const user = userEvent.setup()
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />)

 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
 const mockFile = createMockVideoFile()
 await user.upload(fileInput, mockFile)
 
 await waitFor(() => {
 expect(screen.getByText('Video Details')).toBeInTheDocument()
 })
 
 const coinPriceInput = screen.getByPlaceholderText('Enter coin price')

 await user.clear(coinPriceInput)
 await user.type(coinPriceInput, '2500')
 
 await waitFor(() => {
 expect(screen.getByText(/Maximum is 2,000 coins/)).toBeInTheDocument()
 })

 await user.clear(coinPriceInput)
 await user.type(coinPriceInput, '100')
 
 await waitFor(() => {
 expect(screen.getByText(/₹5\.00/)).toBeInTheDocument()
 expect(screen.queryByText(/Maximum is 2,000 coins/)).not.toBeInTheDocument()
 })
 })

 it('displays rupee equivalent for coin price', async () => {
 const user = userEvent.setup()
 render(<VideoUpload onUploadComplete={mockOnUploadComplete} />)

 const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
 const mockFile = createMockVideoFile()
 await user.upload(fileInput, mockFile)
 
 await waitFor(() => {
 expect(screen.getByText('Video Details')).toBeInTheDocument()
 })
 
 const coinPriceInput = screen.getByPlaceholderText('Enter coin price')

 await user.clear(coinPriceInput)
 await user.type(coinPriceInput, '100')
 
 await waitFor(() => {
 expect(screen.getByText(/₹5\.00/)).toBeInTheDocument()
 })
 
 await user.clear(coinPriceInput)
 await user.type(coinPriceInput, '500')
 
 await waitFor(() => {
 expect(screen.getByText(/₹25\.00/)).toBeInTheDocument()
 })
 })
})