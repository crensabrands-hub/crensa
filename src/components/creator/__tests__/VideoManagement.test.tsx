import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import VideoManagement from '../VideoManagement'
import { Video } from '@/types'

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 },
 AnimatePresence: ({ children }: any) => <>{children}</>,
}))

jest.mock('../VideoEditModal', () => {
 return function MockVideoEditModal({ isOpen, onClose, onSave, video }: any) {
 if (!isOpen || !video) return null
 return (
 <div data-testid="video-edit-modal">
 <button onClick={onClose}>Close</button>
 <button onClick={() => onSave({ ...video, title: 'Updated Video' })}>
 Save
 </button>
 </div>
 )
 }
})

jest.mock('../VideoDeleteModal', () => {
 return function MockVideoDeleteModal({ isOpen, onClose, onConfirm, video }: any) {
 if (!isOpen || !video) return null
 return (
 <div data-testid="video-delete-modal">
 <button onClick={onClose}>Close</button>
 <button onClick={() => onConfirm(video.id)}>Confirm Delete</button>
 </div>
 )
 }
})

jest.mock('../VideoShareModal', () => {
 return function MockVideoShareModal({ isOpen, onClose, video }: any) {
 if (!isOpen || !video) return null
 return (
 <div data-testid="video-share-modal">
 <button onClick={onClose}>Close</button>
 </div>
 )
 }
})

const mockVideos: Video[] = [
 {
 id: '1',
 creatorId: 'creator1',
 title: 'Test Video 1',
 description: 'Test description',
 videoUrl: 'https://example.com/video1.mp4',
 thumbnailUrl: 'https://example.com/thumb1.jpg',
 duration: 120,
 creditCost: 5,
 category: 'Entertainment',
 tags: ['test', 'video'],
 viewCount: 100,
 totalEarnings: 500,
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01')
 },
 {
 id: '2',
 creatorId: 'creator1',
 title: 'Test Video 2',
 description: 'Another test description',
 videoUrl: 'https://example.com/video2.mp4',
 thumbnailUrl: 'https://example.com/thumb2.jpg',
 duration: 180,
 creditCost: 3,
 category: 'Education',
 tags: ['educational'],
 viewCount: 50,
 totalEarnings: 150,
 isActive: false,
 createdAt: new Date('2024-01-02'),
 updatedAt: new Date('2024-01-02')
 }
]

describe('VideoManagement', () => {
 const mockProps = {
 videos: mockVideos,
 onVideoUpdate: jest.fn(),
 onVideoDelete: jest.fn(),
 onVideoStatusToggle: jest.fn(),
 isLoading: false
 }

 beforeEach(() => {
 jest.clearAllMocks()
 })

 it('renders video management interface', () => {
 render(<VideoManagement {...mockProps} />)
 
 expect(screen.getByText('Video Management')).toBeInTheDocument()
 expect(screen.getByText('Manage your uploaded videos, pricing, and settings')).toBeInTheDocument()
 })

 it('displays videos correctly', () => {
 render(<VideoManagement {...mockProps} />)
 
 expect(screen.getByText('Test Video 1')).toBeInTheDocument()
 expect(screen.getByText('Test Video 2')).toBeInTheDocument()
 expect(screen.getByText('100 views')).toBeInTheDocument()
 expect(screen.getByText('50 views')).toBeInTheDocument()
 })

 it('shows loading state', () => {
 render(<VideoManagement {...mockProps} isLoading={true} />)

 expect(document.querySelectorAll('.animate-pulse')).toHaveLength(3)
 })

 it('shows empty state when no videos', () => {
 render(<VideoManagement {...mockProps} videos={[]} />)
 
 expect(screen.getByText('No videos uploaded yet')).toBeInTheDocument()
 expect(screen.getByText('Upload your first video to start earning')).toBeInTheDocument()
 })

 it('filters videos correctly', () => {
 render(<VideoManagement {...mockProps} />)

 const filterSelect = screen.getByDisplayValue('All Videos')
 fireEvent.change(filterSelect, { target: { value: 'active' } })

 expect(screen.getByText('Test Video 1')).toBeInTheDocument()
 expect(screen.getByText('Test Video 2')).toBeInTheDocument()
 })

 it('sorts videos correctly', () => {
 render(<VideoManagement {...mockProps} />)

 const sortSelect = screen.getByDisplayValue('Newest First')
 fireEvent.change(sortSelect, { target: { value: 'views' } })

 expect(screen.getByText('Test Video 1')).toBeInTheDocument()
 expect(screen.getByText('Test Video 2')).toBeInTheDocument()
 })

 it('opens edit modal when edit button clicked', async () => {
 render(<VideoManagement {...mockProps} />)
 
 const editButtons = screen.getAllByText('Edit')
 fireEvent.click(editButtons[0])
 
 await waitFor(() => {
 expect(screen.getByTestId('video-edit-modal')).toBeInTheDocument()
 })
 })

 it('opens delete modal when delete button clicked', async () => {
 render(<VideoManagement {...mockProps} />)
 
 const deleteButtons = screen.getAllByText('Delete')
 fireEvent.click(deleteButtons[0])
 
 await waitFor(() => {
 expect(screen.getByTestId('video-delete-modal')).toBeInTheDocument()
 })
 })

 it('opens share modal when share button clicked', async () => {
 render(<VideoManagement {...mockProps} />)
 
 const shareButtons = screen.getAllByText('Share')
 fireEvent.click(shareButtons[0])
 
 await waitFor(() => {
 expect(screen.getByTestId('video-share-modal')).toBeInTheDocument()
 })
 })

 it('calls onVideoStatusToggle when status button clicked', async () => {
 render(<VideoManagement {...mockProps} />)

 const deactivateButton = screen.getByText('Deactivate')
 fireEvent.click(deactivateButton)
 
 await waitFor(() => {
 expect(mockProps.onVideoStatusToggle).toHaveBeenCalledWith('1', false)
 })
 })

 it('calls onVideoUpdate when video is saved in edit modal', async () => {
 render(<VideoManagement {...mockProps} />)

 const editButtons = screen.getAllByText('Edit')
 fireEvent.click(editButtons[0])
 
 await waitFor(() => {
 expect(screen.getByTestId('video-edit-modal')).toBeInTheDocument()
 })

 const saveButton = screen.getByText('Save')
 fireEvent.click(saveButton)
 
 await waitFor(() => {
 expect(mockProps.onVideoUpdate).toHaveBeenCalledWith({
 id: '1',
 title: 'Updated Video'
 })
 })
 })

 it('calls onVideoDelete when video is confirmed for deletion', async () => {
 render(<VideoManagement {...mockProps} />)

 const deleteButtons = screen.getAllByText('Delete')
 fireEvent.click(deleteButtons[0])
 
 await waitFor(() => {
 expect(screen.getByTestId('video-delete-modal')).toBeInTheDocument()
 })

 const confirmButton = screen.getByText('Confirm Delete')
 fireEvent.click(confirmButton)
 
 await waitFor(() => {
 expect(mockProps.onVideoDelete).toHaveBeenCalledWith('1')
 })
 })

 it('displays video status correctly', () => {
 render(<VideoManagement {...mockProps} />)

 expect(screen.getByText('Deactivate')).toBeInTheDocument()

 expect(screen.getByText('Activate')).toBeInTheDocument()
 })

 it('displays video metadata correctly', () => {
 render(<VideoManagement {...mockProps} />)

 expect(screen.getByText('5 credits')).toBeInTheDocument()
 expect(screen.getByText('3 credits')).toBeInTheDocument()

 expect(screen.getByText('Entertainment')).toBeInTheDocument()
 expect(screen.getByText('Education')).toBeInTheDocument()

 expect(screen.getByText('500 earned')).toBeInTheDocument()
 expect(screen.getByText('150 earned')).toBeInTheDocument()
 })

 it('displays video tags correctly', () => {
 render(<VideoManagement {...mockProps} />)
 
 expect(screen.getByText('#test')).toBeInTheDocument()
 expect(screen.getByText('#video')).toBeInTheDocument()
 expect(screen.getByText('#educational')).toBeInTheDocument()
 })

 it('shows inactive overlay for inactive videos', () => {
 render(<VideoManagement {...mockProps} />)

 expect(screen.getByText('INACTIVE')).toBeInTheDocument()
 })
})