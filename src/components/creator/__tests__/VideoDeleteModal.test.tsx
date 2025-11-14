import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import VideoDeleteModal from '../VideoDeleteModal'
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

describe('VideoDeleteModal', () => {
 const mockProps = {
 video: mockVideo,
 isOpen: true,
 onClose: jest.fn(),
 onConfirm: jest.fn()
 }

 beforeEach(() => {
 jest.clearAllMocks()
 ;(global.fetch as jest.Mock).mockClear()
 })

 it('renders modal when open', () => {
 render(<VideoDeleteModal {...mockProps} />)
 
 expect(screen.getByText('Delete Video')).toBeInTheDocument()
 expect(screen.getByText('This action cannot be undone!')).toBeInTheDocument()
 })

 it('does not render when closed', () => {
 render(<VideoDeleteModal {...mockProps} isOpen={false} />)
 
 expect(screen.queryByText('Delete Video')).not.toBeInTheDocument()
 })

 it('displays video information', () => {
 render(<VideoDeleteModal {...mockProps} />)
 
 expect(screen.getByText('Test Video')).toBeInTheDocument()
 expect(screen.getByText('100 views • ₹500 earned')).toBeInTheDocument()
 })

 it('requires DELETE confirmation text', () => {
 render(<VideoDeleteModal {...mockProps} />)
 
 const deleteButton = screen.getByText('Delete Video')
 expect(deleteButton).toBeDisabled()

 const confirmInput = screen.getByPlaceholderText('Type DELETE to confirm')
 fireEvent.change(confirmInput, { target: { value: 'delete' } })
 
 expect(deleteButton).toBeDisabled()

 fireEvent.change(confirmInput, { target: { value: 'DELETE' } })
 
 expect(deleteButton).not.toBeDisabled()
 })

 it('shows warning message', () => {
 render(<VideoDeleteModal {...mockProps} />)
 
 expect(screen.getByText('This action cannot be undone!')).toBeInTheDocument()
 expect(screen.getByText(/Deleting this video will permanently remove it/)).toBeInTheDocument()
 })

 it('shows impact summary', () => {
 render(<VideoDeleteModal {...mockProps} />)
 
 expect(screen.getByText('What will happen:')).toBeInTheDocument()
 expect(screen.getByText('Video will be permanently deleted')).toBeInTheDocument()
 expect(screen.getByText('Viewers will no longer be able to access it')).toBeInTheDocument()
 expect(screen.getByText('Shared links will become invalid')).toBeInTheDocument()
 expect(screen.getByText('View and earnings history will be preserved')).toBeInTheDocument()
 })

 it('deletes video successfully', async () => {
 const mockResponse = {
 ok: true,
 json: async () => ({
 success: true,
 message: 'Video deleted successfully'
 })
 }
 ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)
 
 render(<VideoDeleteModal {...mockProps} />)

 const confirmInput = screen.getByPlaceholderText('Type DELETE to confirm')
 fireEvent.change(confirmInput, { target: { value: 'DELETE' } })

 const deleteButton = screen.getByText('Delete Video')
 fireEvent.click(deleteButton)
 
 await waitFor(() => {
 expect(global.fetch).toHaveBeenCalledWith('/api/videos/1', {
 method: 'DELETE'
 })
 })
 
 await waitFor(() => {
 expect(mockProps.onConfirm).toHaveBeenCalledWith('1')
 })
 })

 it('handles API errors', async () => {
 const mockResponse = {
 ok: false,
 json: async () => ({
 error: 'Delete failed'
 })
 }
 ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

 const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
 
 render(<VideoDeleteModal {...mockProps} />)

 const confirmInput = screen.getByPlaceholderText('Type DELETE to confirm')
 fireEvent.change(confirmInput, { target: { value: 'DELETE' } })

 const deleteButton = screen.getByText('Delete Video')
 fireEvent.click(deleteButton)
 
 await waitFor(() => {
 expect(consoleSpy).toHaveBeenCalledWith('Failed to delete video:', expect.any(Error))
 })
 
 consoleSpy.mockRestore()
 })

 it('shows loading state during deletion', async () => {
 const mockResponse = {
 ok: true,
 json: async () => ({
 success: true
 })
 }
 ;(global.fetch as jest.Mock).mockImplementation(() => 
 new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
 )
 
 render(<VideoDeleteModal {...mockProps} />)

 const confirmInput = screen.getByPlaceholderText('Type DELETE to confirm')
 fireEvent.change(confirmInput, { target: { value: 'DELETE' } })

 const deleteButton = screen.getByText('Delete Video')
 fireEvent.click(deleteButton)
 
 expect(screen.getByText('Deleting...')).toBeInTheDocument()
 expect(deleteButton).toBeDisabled()
 })

 it('prevents closing during deletion', async () => {
 const mockResponse = {
 ok: true,
 json: async () => ({
 success: true
 })
 }
 ;(global.fetch as jest.Mock).mockImplementation(() => 
 new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
 )
 
 render(<VideoDeleteModal {...mockProps} />)

 const confirmInput = screen.getByPlaceholderText('Type DELETE to confirm')
 fireEvent.change(confirmInput, { target: { value: 'DELETE' } })
 
 const deleteButton = screen.getByText('Delete Video')
 fireEvent.click(deleteButton)

 const closeButton = screen.getByRole('button', { name: /close/i })
 expect(closeButton).toBeDisabled()
 
 const cancelButton = screen.getByText('Cancel')
 expect(cancelButton).toBeDisabled()
 })

 it('closes modal when close button clicked', () => {
 render(<VideoDeleteModal {...mockProps} />)

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
 render(<VideoDeleteModal {...mockProps} />)
 
 const cancelButton = screen.getByText('Cancel')
 fireEvent.click(cancelButton)
 
 expect(mockProps.onClose).toHaveBeenCalled()
 })

 it('resets confirmation text when closed', () => {
 const { rerender } = render(<VideoDeleteModal {...mockProps} />)

 const confirmInput = screen.getByPlaceholderText('Type DELETE to confirm')
 fireEvent.change(confirmInput, { target: { value: 'DELETE' } })

 rerender(<VideoDeleteModal {...mockProps} isOpen={false} />)
 rerender(<VideoDeleteModal {...mockProps} isOpen={true} />)

 const newConfirmInput = screen.getByPlaceholderText('Type DELETE to confirm')
 expect(newConfirmInput).toHaveValue('')
 })

 it('handles null video gracefully', () => {
 render(<VideoDeleteModal {...mockProps} video={null} />)
 
 expect(screen.queryByText('Delete Video')).not.toBeInTheDocument()
 })
})