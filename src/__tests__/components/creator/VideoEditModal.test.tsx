

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VideoEditModal from '@/components/creator/VideoEditModal'
import { Video } from '@/types'

global.fetch = jest.fn()

const mockVideo: Video = {
 id: 'video-123',
 creatorId: 'creator-123',
 title: 'Test Video',
 description: 'Test Description',
 videoUrl: 'https://example.com/video.mp4',
 thumbnailUrl: 'https://example.com/thumb.jpg',
 duration: 120,
 creditCost: 5,
 category: 'Entertainment',
 tags: ['test', 'video'],
 viewCount: 100,
 totalEarnings: 50,
 isActive: true,
 createdAt: new Date(),
 updatedAt: new Date(),
 creator: {
 id: 'creator-123',
 username: 'testcreator',
 displayName: 'Test Creator',
 avatar: null
 }
}

describe('VideoEditModal', () => {
 const mockOnClose = jest.fn()
 const mockOnSave = jest.fn()

 beforeEach(() => {
 jest.clearAllMocks()
 ;(fetch as jest.Mock).mockClear()
 })

 it('should render modal when open', () => {
 render(
 <VideoEditModal
 video={mockVideo}
 isOpen={true}
 onClose={mockOnClose}
 onSave={mockOnSave}
 />
 )

 expect(screen.getByText('Edit Video')).toBeInTheDocument()
 expect(screen.getByDisplayValue('Test Video')).toBeInTheDocument()
 expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
 })

 it('should not render when closed', () => {
 render(
 <VideoEditModal
 video={mockVideo}
 isOpen={false}
 onClose={mockOnClose}
 onSave={mockOnSave}
 />
 )

 expect(screen.queryByText('Edit Video')).not.toBeInTheDocument()
 })

 it('should handle successful video update', async () => {
 const user = userEvent.setup()
 const updatedVideo = { ...mockVideo, title: 'Updated Title' }

 ;(fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 text: () => Promise.resolve(JSON.stringify({
 success: true,
 message: 'Video updated successfully',
 video: updatedVideo
 }))
 })

 render(
 <VideoEditModal
 video={mockVideo}
 isOpen={true}
 onClose={mockOnClose}
 onSave={mockOnSave}
 />
 )

 const titleInput = screen.getByDisplayValue('Test Video')
 await user.clear(titleInput)
 await user.type(titleInput, 'Updated Title')

 const saveButton = screen.getByText('Save Changes')
 await user.click(saveButton)

 await waitFor(() => {
 expect(fetch).toHaveBeenCalledWith('/api/videos/video-123', {
 method: 'PATCH',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 title: 'Updated Title',
 description: 'Test Description',
 category: 'Entertainment',
 tags: ['test', 'video'],
 creditCost: 5
 })
 })
 })

 await waitFor(() => {
 expect(screen.getByText('Video updated successfully!')).toBeInTheDocument()
 })

 await waitFor(() => {
 expect(mockOnSave).toHaveBeenCalledWith(updatedVideo)
 }, { timeout: 2000 })
 })

 it('should handle validation errors', async () => {
 const user = userEvent.setup()

 render(
 <VideoEditModal
 video={mockVideo}
 isOpen={true}
 onClose={mockOnClose}
 onSave={mockOnSave}
 />
 )

 const titleInput = screen.getByDisplayValue('Test Video')
 await user.clear(titleInput)

 const saveButton = screen.getByText('Save Changes')
 await user.click(saveButton)

 await waitFor(() => {
 expect(screen.getByText('Title is required')).toBeInTheDocument()
 })

 expect(fetch).not.toHaveBeenCalled()
 })

 it('should handle server validation errors', async () => {
 const user = userEvent.setup()

 ;(fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 status: 400,
 text: () => Promise.resolve(JSON.stringify({
 success: false,
 error: 'Validation failed',
 details: ['Title cannot exceed 255 characters', 'Invalid category']
 }))
 })

 render(
 <VideoEditModal
 video={mockVideo}
 isOpen={true}
 onClose={mockOnClose}
 onSave={mockOnSave}
 />
 )

 const saveButton = screen.getByText('Save Changes')
 await user.click(saveButton)

 await waitFor(() => {
 expect(screen.getByText('Title cannot exceed 255 characters, Invalid category')).toBeInTheDocument()
 })
 })

 it('should handle JSON parsing errors', async () => {
 const user = userEvent.setup()

 ;(fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 text: () => Promise.resolve('invalid json')
 })

 render(
 <VideoEditModal
 video={mockVideo}
 isOpen={true}
 onClose={mockOnClose}
 onSave={mockOnSave}
 />
 )

 const saveButton = screen.getByText('Save Changes')
 await user.click(saveButton)

 await waitFor(() => {
 expect(screen.getByText('Invalid response format from server. Please try again.')).toBeInTheDocument()
 })
 })

 it('should handle empty response', async () => {
 const user = userEvent.setup()

 ;(fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 text: () => Promise.resolve('')
 })

 render(
 <VideoEditModal
 video={mockVideo}
 isOpen={true}
 onClose={mockOnClose}
 onSave={mockOnSave}
 />
 )

 const saveButton = screen.getByText('Save Changes')
 await user.click(saveButton)

 await waitFor(() => {
 expect(screen.getByText('Empty response from server')).toBeInTheDocument()
 })
 })

 it('should handle network errors', async () => {
 const user = userEvent.setup()

 ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('fetch failed'))

 render(
 <VideoEditModal
 video={mockVideo}
 isOpen={true}
 onClose={mockOnClose}
 onSave={mockOnSave}
 />
 )

 const saveButton = screen.getByText('Save Changes')
 await user.click(saveButton)

 await waitFor(() => {
 expect(screen.getByText('Network error. Please check your connection and try again.')).toBeInTheDocument()
 })
 })

 it('should show retry button for failed requests', async () => {
 const user = userEvent.setup()

 ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Server error'))

 render(
 <VideoEditModal
 video={mockVideo}
 isOpen={true}
 onClose={mockOnClose}
 onSave={mockOnSave}
 />
 )

 const saveButton = screen.getByText('Save Changes')
 await user.click(saveButton)

 await waitFor(() => {
 expect(screen.getByText('Try again')).toBeInTheDocument()
 })

 ;(fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 text: () => Promise.resolve(JSON.stringify({
 success: true,
 message: 'Video updated successfully',
 video: mockVideo
 }))
 })

 const retryButton = screen.getByText('Try again')
 await user.click(retryButton)

 await waitFor(() => {
 expect(screen.getByText('Video updated successfully!')).toBeInTheDocument()
 })
 })

 it('should handle authentication errors', async () => {
 const user = userEvent.setup()

 ;(fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 status: 401,
 text: () => Promise.resolve(JSON.stringify({
 success: false,
 error: 'Authentication required'
 }))
 })

 render(
 <VideoEditModal
 video={mockVideo}
 isOpen={true}
 onClose={mockOnClose}
 onSave={mockOnSave}
 />
 )

 const saveButton = screen.getByText('Save Changes')
 await user.click(saveButton)

 await waitFor(() => {
 expect(screen.getByText('You need to be logged in to update videos')).toBeInTheDocument()
 })
 })

 it('should handle permission errors', async () => {
 const user = userEvent.setup()

 ;(fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 status: 403,
 text: () => Promise.resolve(JSON.stringify({
 success: false,
 error: 'You can only update your own videos'
 }))
 })

 render(
 <VideoEditModal
 video={mockVideo}
 isOpen={true}
 onClose={mockOnClose}
 onSave={mockOnSave}
 />
 )

 const saveButton = screen.getByText('Save Changes')
 await user.click(saveButton)

 await waitFor(() => {
 expect(screen.getByText('You can only update your own videos')).toBeInTheDocument()
 })
 })

 it('should validate credit cost range', async () => {
 const user = userEvent.setup()

 render(
 <VideoEditModal
 video={mockVideo}
 isOpen={true}
 onClose={mockOnClose}
 onSave={mockOnSave}
 />
 )

 const creditCostInput = screen.getByDisplayValue('5')
 await user.clear(creditCostInput)
 await user.type(creditCostInput, '101')

 const saveButton = screen.getByText('Save Changes')
 await user.click(saveButton)

 await waitFor(() => {
 expect(screen.getByText('Credit cost must be between 1 and 100')).toBeInTheDocument()
 })

 expect(fetch).not.toHaveBeenCalled()
 })

 it('should validate tag limit', async () => {
 const user = userEvent.setup()

 render(
 <VideoEditModal
 video={mockVideo}
 isOpen={true}
 onClose={mockOnClose}
 onSave={mockOnSave}
 />
 )

 const tagInput = screen.getByPlaceholderText('Add a tag and press Enter')

 for (let i = 0; i < 11; i++) {
 await user.type(tagInput, `tag${i}`)
 await user.keyboard('{Enter}')
 }

 const saveButton = screen.getByText('Save Changes')
 await user.click(saveButton)

 await waitFor(() => {
 expect(screen.getByText('Cannot have more than 10 tags')).toBeInTheDocument()
 })

 expect(fetch).not.toHaveBeenCalled()
 })
})