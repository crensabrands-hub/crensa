import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import VideoEditModal from '../VideoEditModal'
import { Video } from '@/types'

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 },
 AnimatePresence: ({ children }: any) => <>{children}</>,
}))

global.fetch = jest.fn()

const mockVideo: Video = {
 id: '1',
 creatorId: 'creator1',
 title: 'Test Video',
 description: 'Test description',
 videoUrl: 'https://example.com/video.mp4',
 thumbnailUrl: 'https://example.com/thumb.jpg',
 duration: 120,
 creditCost: 5,
 category: 'Entertainment',
 tags: ['test', 'video'],
 viewCount: 100,
 totalEarnings: 500,
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01')
}

describe('VideoEditModal', () => {
 const mockProps = {
 video: mockVideo,
 isOpen: true,
 onClose: jest.fn(),
 onSave: jest.fn()
 }

 beforeEach(() => {
 jest.clearAllMocks()
 ;(global.fetch as jest.Mock).mockClear()
 })

 it('renders modal when open', () => {
 render(<VideoEditModal {...mockProps} />)
 
 expect(screen.getByText('Edit Video')).toBeInTheDocument()
 expect(screen.getByDisplayValue('Test Video')).toBeInTheDocument()
 expect(screen.getByDisplayValue('Test description')).toBeInTheDocument()
 })

 it('does not render when closed', () => {
 render(<VideoEditModal {...mockProps} isOpen={false} />)
 
 expect(screen.queryByText('Edit Video')).not.toBeInTheDocument()
 })

 it('populates form with video data', () => {
 render(<VideoEditModal {...mockProps} />)
 
 expect(screen.getByDisplayValue('Test Video')).toBeInTheDocument()
 expect(screen.getByDisplayValue('Test description')).toBeInTheDocument()
 expect(screen.getByDisplayValue('Entertainment')).toBeInTheDocument()
 expect(screen.getByDisplayValue('5')).toBeInTheDocument()
 expect(screen.getByText('#test')).toBeInTheDocument()
 expect(screen.getByText('#video')).toBeInTheDocument()
 })

 it('validates required fields', async () => {
 render(<VideoEditModal {...mockProps} />)

 const titleInput = screen.getByDisplayValue('Test Video')
 fireEvent.change(titleInput, { target: { value: '' } })

 const saveButton = screen.getByText('Save Changes')
 fireEvent.click(saveButton)
 
 await waitFor(() => {
 expect(screen.getByText('Title is required')).toBeInTheDocument()
 })
 })

 it('validates credit cost range', async () => {
 render(<VideoEditModal {...mockProps} />)

 const creditInput = screen.getByDisplayValue('5')
 fireEvent.change(creditInput, { target: { value: '101' } })

 const saveButton = screen.getByText('Save Changes')
 fireEvent.click(saveButton)
 
 await waitFor(() => {
 expect(screen.getByText('Credit cost must be between 1 and 100')).toBeInTheDocument()
 })
 })

 it('adds tags correctly', () => {
 render(<VideoEditModal {...mockProps} />)
 
 const tagInput = screen.getByPlaceholderText('Add a tag and press Enter')
 const addButton = screen.getByText('Add')
 
 fireEvent.change(tagInput, { target: { value: 'newtag' } })
 fireEvent.click(addButton)
 
 expect(screen.getByText('#newtag')).toBeInTheDocument()
 })

 it('removes tags correctly', () => {
 render(<VideoEditModal {...mockProps} />)

 const testTag = screen.getByText('#test').closest('span')
 const removeButton = testTag?.querySelector('button')
 
 if (removeButton) {
 fireEvent.click(removeButton)
 }
 
 expect(screen.queryByText('#test')).not.toBeInTheDocument()
 })

 it('adds tag on Enter key press', () => {
 render(<VideoEditModal {...mockProps} />)
 
 const tagInput = screen.getByPlaceholderText('Add a tag and press Enter')
 
 fireEvent.change(tagInput, { target: { value: 'entertag' } })
 fireEvent.keyDown(tagInput, { key: 'Enter' })
 
 expect(screen.getByText('#entertag')).toBeInTheDocument()
 })

 it('prevents adding duplicate tags', () => {
 render(<VideoEditModal {...mockProps} />)
 
 const tagInput = screen.getByPlaceholderText('Add a tag and press Enter')
 const addButton = screen.getByText('Add')

 fireEvent.change(tagInput, { target: { value: 'test' } })
 fireEvent.click(addButton)

 const testTags = screen.getAllByText('#test')
 expect(testTags).toHaveLength(1)
 })

 it('limits tags to 10', () => {

 const videoWith10Tags = {
 ...mockVideo,
 tags: Array.from({ length: 10 }, (_, i) => `tag${i}`)
 }
 
 render(<VideoEditModal {...mockProps} video={videoWith10Tags} />)
 
 const tagInput = screen.getByPlaceholderText('Add a tag and press Enter')
 const addButton = screen.getByText('Add')
 
 fireEvent.change(tagInput, { target: { value: 'newtag' } })

 expect(addButton).toBeDisabled()
 })

 it('submits form successfully', async () => {
 const mockResponse = {
 ok: true,
 json: async () => ({
 video: { ...mockVideo, title: 'Updated Title' }
 })
 }
 ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)
 
 render(<VideoEditModal {...mockProps} />)

 const titleInput = screen.getByDisplayValue('Test Video')
 fireEvent.change(titleInput, { target: { value: 'Updated Title' } })

 const saveButton = screen.getByText('Save Changes')
 fireEvent.click(saveButton)
 
 await waitFor(() => {
 expect(global.fetch).toHaveBeenCalledWith('/api/videos/1', {
 method: 'PATCH',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 title: 'Updated Title',
 description: 'Test description',
 category: 'Entertainment',
 tags: ['test', 'video'],
 creditCost: 5
 })
 })
 })
 
 await waitFor(() => {
 expect(mockProps.onSave).toHaveBeenCalledWith({
 ...mockVideo,
 title: 'Updated Title'
 })
 })
 })

 it('handles API errors', async () => {
 const mockResponse = {
 ok: false,
 json: async () => ({
 error: 'Update failed'
 })
 }
 ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)
 
 render(<VideoEditModal {...mockProps} />)
 
 const saveButton = screen.getByText('Save Changes')
 fireEvent.click(saveButton)
 
 await waitFor(() => {
 expect(screen.getByText('Update failed')).toBeInTheDocument()
 })
 })

 it('shows loading state during submission', async () => {
 const mockResponse = {
 ok: true,
 json: async () => ({
 video: mockVideo
 })
 }
 ;(global.fetch as jest.Mock).mockImplementation(() => 
 new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
 )
 
 render(<VideoEditModal {...mockProps} />)
 
 const saveButton = screen.getByText('Save Changes')
 fireEvent.click(saveButton)
 
 expect(screen.getByText('Saving...')).toBeInTheDocument()
 expect(saveButton).toBeDisabled()
 })

 it('shows success message and closes modal', async () => {
 const mockResponse = {
 ok: true,
 json: async () => ({
 video: mockVideo
 })
 }
 ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)
 
 render(<VideoEditModal {...mockProps} />)
 
 const saveButton = screen.getByText('Save Changes')
 fireEvent.click(saveButton)
 
 await waitFor(() => {
 expect(screen.getByText('Video updated successfully!')).toBeInTheDocument()
 })

 await waitFor(() => {
 expect(mockProps.onClose).toHaveBeenCalled()
 }, { timeout: 2000 })
 })

 it('closes modal when close button clicked', () => {
 render(<VideoEditModal {...mockProps} />)

 const closeButtons = screen.getAllByRole('button')
 const closeButton = closeButtons.find(button => 
 button.querySelector('svg') && 
 button.querySelector('path[d*="M6 18 18 6M6 6l12 12"]')
 )
 
 if (closeButton) {
 fireEvent.click(closeButton)
 }
 
 expect(mockProps.onClose).toHaveBeenCalled()
 })

 it('closes modal when cancel button clicked', () => {
 render(<VideoEditModal {...mockProps} />)
 
 const cancelButton = screen.getByText('Cancel')
 fireEvent.click(cancelButton)
 
 expect(mockProps.onClose).toHaveBeenCalled()
 })
})