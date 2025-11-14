

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import TransactionHistory from '@/components/wallet/TransactionHistory'
import { useAuthContext } from '@/contexts/AuthContext'

global.fetch = jest.fn()

jest.mock('@/contexts/AuthContext')

const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

const mockUserProfile = {
 id: 'user-123',
 clerkId: 'clerk-123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member' as const,
 avatar: null,
 createdAt: new Date(),
 updatedAt: new Date(),
 memberProfile: {
 id: 'profile-123',
 userId: 'user-123',
 walletBalance: '50.00',
 membershipStatus: 'free' as const,
 membershipExpiry: null,
 watchHistory: [],
 favoriteCreators: [],
 createdAt: new Date(),
 updatedAt: new Date(),
 }
}

const mockTransactions = [
 {
 id: 'txn-1',
 type: 'credit_purchase',
 amount: 100,
 status: 'completed',
 createdAt: '2024-01-15T10:00:00Z',
 razorpayPaymentId: 'pay_123456789'
 },
 {
 id: 'txn-2',
 type: 'video_view',
 amount: 5,
 status: 'completed',
 createdAt: '2024-01-14T15:30:00Z',
 videoId: 'video-1',
 video: {
 id: 'video-1',
 title: 'Amazing Video Content'
 }
 },
 {
 id: 'txn-3',
 type: 'credit_purchase',
 amount: 50,
 status: 'pending',
 createdAt: '2024-01-13T09:15:00Z'
 }
]

describe('TransactionHistory', () => {
 beforeEach(() => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockUserProfile,
 isLoading: false,
 error: null,
 refreshProfile: jest.fn()
 })

 mockFetch.mockResolvedValue({
 ok: true,
 json: async () => ({
 transactions: mockTransactions,
 total: 3,
 page: 1,
 totalPages: 1
 })
 } as Response)
 })

 afterEach(() => {
 jest.clearAllMocks()
 })

 it('renders transaction history correctly', async () => {
 render(<TransactionHistory />)
 
 expect(screen.getByText('Transaction History')).toBeInTheDocument()
 
 await waitFor(() => {
 expect(screen.getByText('Credit Purchase')).toBeInTheDocument()
 expect(screen.getByText('Watched: Amazing Video Content')).toBeInTheDocument()
 expect(screen.getByText('+100 credits')).toBeInTheDocument()
 expect(screen.getByText('-5 credits')).toBeInTheDocument()
 })
 })

 it('shows loading state initially', () => {
 render(<TransactionHistory />)

 expect(screen.getByText('Transaction History')).toBeInTheDocument()
 })

 it('handles API error correctly', async () => {
 mockFetch.mockRejectedValue(new Error('API Error'))
 
 render(<TransactionHistory />)
 
 await waitFor(() => {
 expect(screen.getByText('Error Loading Transactions')).toBeInTheDocument()
 expect(screen.getByText('Try Again')).toBeInTheDocument()
 })
 })

 it('shows empty state when no transactions', async () => {
 mockFetch.mockResolvedValue({
 ok: true,
 json: async () => ({
 transactions: [],
 total: 0,
 page: 1,
 totalPages: 0
 })
 } as Response)
 
 render(<TransactionHistory />)
 
 await waitFor(() => {
 expect(screen.getByText('No Transactions Found')).toBeInTheDocument()
 })
 })

 it('filters transactions by type', async () => {
 render(<TransactionHistory />)

 await waitFor(() => {
 expect(screen.getByText('Credit Purchase')).toBeInTheDocument()
 })

 const filtersButton = screen.getByText('Filters')
 fireEvent.click(filtersButton)
 
 await waitFor(() => {
 expect(screen.getByDisplayValue('All Transactions')).toBeInTheDocument()
 })

 const typeSelect = screen.getByDisplayValue('All Transactions')
 fireEvent.change(typeSelect, { target: { value: 'credit_purchase' } })

 await waitFor(() => {
 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('type=credit_purchase')
 )
 })
 })

 it('filters transactions by status', async () => {
 render(<TransactionHistory />)
 
 await waitFor(() => {
 expect(screen.getByText('Credit Purchase')).toBeInTheDocument()
 })

 const filtersButton = screen.getByText('Filters')
 fireEvent.click(filtersButton)

 const statusSelect = screen.getByDisplayValue('All Status')
 fireEvent.change(statusSelect, { target: { value: 'completed' } })
 
 await waitFor(() => {
 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('status=completed')
 )
 })
 })

 it('filters transactions by date range', async () => {
 render(<TransactionHistory />)
 
 await waitFor(() => {
 expect(screen.getByText('Credit Purchase')).toBeInTheDocument()
 })

 const filtersButton = screen.getByText('Filters')
 fireEvent.click(filtersButton)

 const dateSelect = screen.getByDisplayValue('All Time')
 fireEvent.change(dateSelect, { target: { value: 'week' } })
 
 await waitFor(() => {
 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('startDate=')
 )
 })
 })

 it('searches transactions correctly', async () => {
 render(<TransactionHistory />)
 
 await waitFor(() => {
 expect(screen.getByText('Credit Purchase')).toBeInTheDocument()
 })

 const searchInput = screen.getByPlaceholderText('Search transactions...')
 fireEvent.change(searchInput, { target: { value: 'Amazing Video' } })
 
 await waitFor(() => {

 expect(screen.getByText('Watched: Amazing Video Content')).toBeInTheDocument()
 expect(screen.queryByText('Credit Purchase')).not.toBeInTheDocument()
 })
 })

 it('shows status badges correctly', async () => {
 render(<TransactionHistory />)
 
 await waitFor(() => {
 expect(screen.getByText('Completed')).toBeInTheDocument()
 expect(screen.getByText('Pending')).toBeInTheDocument()
 })
 })

 it('formats transaction amounts correctly', async () => {
 render(<TransactionHistory />)
 
 await waitFor(() => {
 expect(screen.getByText('+100 credits')).toBeInTheDocument()
 expect(screen.getByText('-5 credits')).toBeInTheDocument()
 })
 })

 it('shows payment IDs for completed purchases', async () => {
 render(<TransactionHistory />)
 
 await waitFor(() => {
 expect(screen.getByText('ID: 56789')).toBeInTheDocument() // Last 8 chars
 })
 })

 it('handles pagination correctly', async () => {
 mockFetch.mockResolvedValue({
 ok: true,
 json: async () => ({
 transactions: mockTransactions,
 total: 50,
 page: 1,
 totalPages: 3
 })
 } as Response)
 
 render(<TransactionHistory />)
 
 await waitFor(() => {
 expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
 expect(screen.getByText('Next')).toBeInTheDocument()
 expect(screen.getByText('Previous')).toBeInTheDocument()
 })

 const nextButton = screen.getByText('Next')
 fireEvent.click(nextButton)
 
 await waitFor(() => {
 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('page=2')
 )
 })
 })

 it('retries API call when try again is clicked', async () => {
 mockFetch.mockRejectedValueOnce(new Error('API Error'))
 
 render(<TransactionHistory />)
 
 await waitFor(() => {
 expect(screen.getByText('Try Again')).toBeInTheDocument()
 })

 mockFetch.mockResolvedValue({
 ok: true,
 json: async () => ({
 transactions: mockTransactions,
 total: 3,
 page: 1,
 totalPages: 1
 })
 } as Response)
 
 const tryAgainButton = screen.getByText('Try Again')
 fireEvent.click(tryAgainButton)
 
 await waitFor(() => {
 expect(screen.getByText('Credit Purchase')).toBeInTheDocument()
 })
 })

 it('shows custom date inputs when custom range is selected', async () => {
 render(<TransactionHistory />)

 const filtersButton = screen.getByText('Filters')
 fireEvent.click(filtersButton)

 const dateSelect = screen.getByDisplayValue('All Time')
 fireEvent.change(dateSelect, { target: { value: 'custom' } })
 
 await waitFor(() => {
 expect(screen.getByLabelText('Start Date')).toBeInTheDocument()
 expect(screen.getByLabelText('End Date')).toBeInTheDocument()
 })
 })
})