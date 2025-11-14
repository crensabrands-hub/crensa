

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import CreditConfirmationModal from '@/components/modals/CreditConfirmationModal'
import type { Video, WalletBalance } from '@/types'

jest.mock('next/navigation', () => ({
 useRouter: () => ({
 push: jest.fn(),
 }),
}))

const mockVideo: Video = {
 id: 'video-123',
 creatorId: 'creator-456',
 title: 'Test Video Title',
 description: 'Test video description',
 videoUrl: 'https://example.com/video.mp4',
 thumbnailUrl: 'https://example.com/thumb.jpg',
 duration: 120,
 creditCost: 5, // Deprecated
 coinPrice: 100, // 100 coins = ₹5.00
 category: 'Test',
 tags: ['test'],
 viewCount: 100,
 totalEarnings: 50,
 isActive: true,
 aspectRatio: '16:9',
 createdAt: new Date(),
 updatedAt: new Date(),
 creator: {
 id: 'creator-456',
 username: 'testcreator',
 displayName: 'Test Creator',
 avatar: null
 }
}

const mockWalletBalance: WalletBalance = {
 balance: 200, // 200 coins = ₹10.00
 lastUpdated: new Date(),
 pendingTransactions: 0
}

const mockProps = {
 isOpen: true,
 video: mockVideo,
 walletBalance: mockWalletBalance,
 onConfirm: jest.fn(),
 onCancel: jest.fn(),
 onPurchaseCoins: jest.fn(),
 isProcessing: false
}

describe('CreditConfirmationModal - Coin Purchase Flow', () => {
 beforeEach(() => {
 jest.clearAllMocks()
 })

 it('renders modal when open with coin pricing', () => {
 render(<CreditConfirmationModal {...mockProps} />)
 
 expect(screen.getByText('Test Video Title')).toBeInTheDocument()
 expect(screen.getByText('by Test Creator')).toBeInTheDocument()
 expect(screen.getByText('Cost to Watch')).toBeInTheDocument()
 expect(screen.getByText('Your Balance:')).toBeInTheDocument()

 expect(screen.getAllByText('100').length).toBeGreaterThan(0) // Coin amount appears multiple times
 expect(screen.getByText('200')).toBeInTheDocument() // Balance
 })

 it('does not render when closed', () => {
 render(<CreditConfirmationModal {...mockProps} isOpen={false} />)
 
 expect(screen.queryByText('Test Video Title')).not.toBeInTheDocument()
 })

 it('shows sufficient coins state with remaining balance', () => {
 render(<CreditConfirmationModal {...mockProps} />)
 
 expect(screen.getByText('Watch Now')).toBeInTheDocument()
 expect(screen.getByText('Cancel')).toBeInTheDocument()
 expect(screen.queryByText('Purchase Coins')).not.toBeInTheDocument()

 expect(screen.getByText('After Purchase:')).toBeInTheDocument()
 })

 it('shows insufficient coins state with purchase option', () => {
 const insufficientBalance = { ...mockWalletBalance, balance: 50 } // Need 100, have 50
 
 render(
 <CreditConfirmationModal 
 {...mockProps} 
 walletBalance={insufficientBalance}
 />
 )
 
 expect(screen.getByText('Insufficient Coins')).toBeInTheDocument()
 expect(screen.getByText('Purchase Coins')).toBeInTheDocument()
 expect(screen.queryByText('Watch Now')).not.toBeInTheDocument()
 })

 it('calls onConfirm when Watch Now is clicked with sufficient coins', async () => {
 render(<CreditConfirmationModal {...mockProps} />)
 
 fireEvent.click(screen.getByText('Watch Now'))
 
 await waitFor(() => {
 expect(mockProps.onConfirm).toHaveBeenCalledTimes(1)
 })
 })

 it('shows success state after purchase', async () => {
 const mockOnConfirm = jest.fn().mockResolvedValue(undefined)
 
 render(<CreditConfirmationModal {...mockProps} onConfirm={mockOnConfirm} />)
 
 fireEvent.click(screen.getByText('Watch Now'))
 
 await waitFor(() => {
 expect(screen.getByText('Purchase Successful!')).toBeInTheDocument()
 expect(screen.getByText('Enjoy your video')).toBeInTheDocument()
 })
 })

 it('calls onPurchaseCoins when Purchase Coins is clicked with insufficient coins', () => {
 const insufficientBalance = { ...mockWalletBalance, balance: 50 }
 
 render(
 <CreditConfirmationModal 
 {...mockProps} 
 walletBalance={insufficientBalance}
 />
 )
 
 fireEvent.click(screen.getByText('Purchase Coins'))
 
 expect(mockProps.onPurchaseCoins).toHaveBeenCalledTimes(1)
 })

 it('calls onCancel when Cancel is clicked', () => {
 render(<CreditConfirmationModal {...mockProps} />)
 
 fireEvent.click(screen.getByText('Cancel'))
 
 expect(mockProps.onCancel).toHaveBeenCalledTimes(1)
 })

 it('calls onCancel when close button is clicked', () => {
 render(<CreditConfirmationModal {...mockProps} />)
 
 const closeButton = screen.getByRole('button', { name: '' }) // Close button has no text
 fireEvent.click(closeButton)
 
 expect(mockProps.onCancel).toHaveBeenCalledTimes(1)
 })

 it('shows processing state', () => {
 render(<CreditConfirmationModal {...mockProps} isProcessing={true} />)
 
 expect(screen.getByText('Processing...')).toBeInTheDocument()
 expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled()
 })

 it('displays error message', () => {
 const errorMessage = 'Network error occurred'
 
 render(<CreditConfirmationModal {...mockProps} error={errorMessage} />)
 
 expect(screen.getByText(errorMessage)).toBeInTheDocument()
 })

 it('displays insufficient coins error object', () => {
 const insufficientError = {
 required: 100,
 available: 40,
 shortfall: 60
 }
 
 render(<CreditConfirmationModal {...mockProps} error={insufficientError} />)
 
 expect(screen.getByText('Insufficient Coins')).toBeInTheDocument()
 expect(screen.getByText('Required:')).toBeInTheDocument()
 expect(screen.getByText('Available:')).toBeInTheDocument()
 expect(screen.getByText('Shortfall:')).toBeInTheDocument()

 expect(screen.getAllByText('100').length).toBeGreaterThan(0)
 expect(screen.getByText('40')).toBeInTheDocument()
 expect(screen.getByText('60')).toBeInTheDocument()
 })

 it('shows pending transactions notice', () => {
 const balanceWithPending = { ...mockWalletBalance, pendingTransactions: 2 }
 
 render(
 <CreditConfirmationModal 
 {...mockProps} 
 walletBalance={balanceWithPending}
 />
 )
 
 expect(screen.getByText(/You have 2 pending transaction/)).toBeInTheDocument()
 })

 it('formats video duration correctly', () => {
 render(<CreditConfirmationModal {...mockProps} />)
 
 expect(screen.getByText('2:00')).toBeInTheDocument()
 })

 it('handles missing creator displayName gracefully', () => {
 const videoWithoutDisplayName = {
 ...mockVideo,
 creator: {
 ...mockVideo.creator!,
 displayName: undefined
 }
 }
 
 render(
 <CreditConfirmationModal 
 {...mockProps} 
 video={videoWithoutDisplayName}
 />
 )
 
 expect(screen.getByText('by testcreator')).toBeInTheDocument()
 })

 it('disables buttons during processing', () => {
 render(<CreditConfirmationModal {...mockProps} isProcessing={true} />)
 
 expect(screen.getByText('Cancel')).toBeDisabled()
 expect(screen.getByText('Processing...')).toBeDisabled()
 })

 it('displays rupee equivalent for coin price', () => {
 render(<CreditConfirmationModal {...mockProps} />)

 expect(screen.getByText('≈ ₹5.00')).toBeInTheDocument()
 })

 it('calculates and displays remaining balance after purchase', () => {
 render(<CreditConfirmationModal {...mockProps} />)

 expect(screen.getByText('After Purchase:')).toBeInTheDocument()

 const balanceElements = screen.getAllByText('100')
 expect(balanceElements.length).toBeGreaterThan(0)
 })

 it('calls onPurchaseCoins when insufficient coins and primary button clicked', () => {
 const insufficientBalance = { ...mockWalletBalance, balance: 50 }
 
 render(
 <CreditConfirmationModal 
 {...mockProps} 
 walletBalance={insufficientBalance}
 />
 )

 fireEvent.click(screen.getByText('Purchase Coins'))
 
 expect(mockProps.onPurchaseCoins).toHaveBeenCalledTimes(1)
 })
})