import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import { CoinTransactionHistory } from '../CoinTransactionHistory'

global.fetch = jest.fn()

afterEach(() => {
 cleanup()
 jest.clearAllMocks()
})

const mockTransactions = [
 {
 id: '1',
 transactionType: 'purchase' as const,
 coinAmount: 1000,
 rupeeAmount: 50,
 relatedContentType: null,
 relatedContentId: null,
 paymentId: 'pay_123',
 status: 'completed' as const,
 description: 'Purchased 1000 coins',
 createdAt: '2024-01-15T10:00:00Z'
 },
 {
 id: '2',
 transactionType: 'spend' as const,
 coinAmount: 100,
 rupeeAmount: null,
 relatedContentType: 'video' as const,
 relatedContentId: 'video-123',
 paymentId: null,
 status: 'completed' as const,
 description: 'Purchased video: Amazing Content',
 createdAt: '2024-01-16T14:30:00Z'
 },
 {
 id: '3',
 transactionType: 'earn' as const,
 coinAmount: 50,
 rupeeAmount: null,
 relatedContentType: 'video' as const,
 relatedContentId: 'video-456',
 paymentId: null,
 status: 'completed' as const,
 description: 'Earned from video sale',
 createdAt: '2024-01-17T09:15:00Z'
 }
]

const mockPagination = {
 page: 1,
 limit: 20,
 total: 3,
 totalPages: 1,
 hasMore: false
}

describe('CoinTransactionHistory', () => {

 it('renders loading state initially', () => {
 ;(global.fetch as jest.Mock).mockImplementation(() => 
 new Promise(() => {}) // Never resolves
 )

 const { container } = render(<CoinTransactionHistory />)
 
 expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
 })

 it('fetches and displays transactions', async () => {
 ;(global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 transactions: mockTransactions,
 pagination: mockPagination
 })
 })

 render(<CoinTransactionHistory />)

 await waitFor(() => {
 expect(screen.getByText('Transaction History')).toBeInTheDocument()
 })

 expect(screen.getByText('Purchased 1000 coins')).toBeInTheDocument()
 expect(screen.getByText('Purchased video: Amazing Content')).toBeInTheDocument()
 expect(screen.getByText('Earned from video sale')).toBeInTheDocument()
 })

 it('displays transaction types with correct icons', async () => {
 ;(global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 transactions: mockTransactions,
 pagination: mockPagination
 })
 })

 render(<CoinTransactionHistory />)

 await waitFor(() => {
 expect(screen.getByText('💰')).toBeInTheDocument() // purchase
 expect(screen.getByText('🛒')).toBeInTheDocument() // spend
 expect(screen.getByText('✨')).toBeInTheDocument() // earn
 })
 })

 it('displays status badges correctly', async () => {
 ;(global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 transactions: mockTransactions,
 pagination: mockPagination
 })
 })

 render(<CoinTransactionHistory />)

 await waitFor(() => {
 const completedBadges = screen.getAllByText('Completed')
 expect(completedBadges).toHaveLength(3)
 })
 })

 it('shows rupee equivalent for purchase transactions', async () => {
 ;(global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 transactions: mockTransactions,
 pagination: mockPagination
 })
 })

 render(<CoinTransactionHistory />)

 await waitFor(() => {
 expect(screen.getByText('₹50.00')).toBeInTheDocument()
 })
 })

 it('filters transactions by type', async () => {
 ;(global.fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 transactions: mockTransactions,
 pagination: mockPagination
 })
 })
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 transactions: [mockTransactions[0]],
 pagination: { ...mockPagination, total: 1 }
 })
 })

 render(<CoinTransactionHistory />)

 await waitFor(() => {
 expect(screen.getByText('Transaction History')).toBeInTheDocument()
 })

 const purchaseButton = screen.getByRole('button', { name: /💰 purchase/i })
 fireEvent.click(purchaseButton)

 await waitFor(() => {
 expect(global.fetch).toHaveBeenCalledWith(
 expect.stringContaining('type=purchase')
 )
 })
 })

 it('handles pagination', async () => {
 const paginatedData = {
 ...mockPagination,
 totalPages: 2,
 hasMore: true
 }

 ;(global.fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 transactions: mockTransactions,
 pagination: paginatedData
 })
 })
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 transactions: [mockTransactions[0]],
 pagination: { ...paginatedData, page: 2, hasMore: false }
 })
 })

 render(<CoinTransactionHistory />)

 await waitFor(() => {
 expect(screen.getByText('Page 1 of 2 (3 total)')).toBeInTheDocument()
 })

 const nextButton = screen.getByRole('button', { name: /next/i })
 fireEvent.click(nextButton)

 await waitFor(() => {
 expect(global.fetch).toHaveBeenCalledWith(
 expect.stringContaining('page=2')
 )
 })
 })

 it('disables previous button on first page', async () => {
 ;(global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 transactions: mockTransactions,
 pagination: { ...mockPagination, totalPages: 2 }
 })
 })

 render(<CoinTransactionHistory />)

 await waitFor(() => {
 const prevButton = screen.getByRole('button', { name: /previous/i })
 expect(prevButton).toBeDisabled()
 })
 })

 it('disables next button on last page', async () => {
 const multiPagePagination = {
 ...mockPagination,
 page: 2,
 totalPages: 2,
 hasMore: false
 }

 ;(global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 transactions: mockTransactions,
 pagination: multiPagePagination
 })
 })

 render(<CoinTransactionHistory />)

 await waitFor(() => {
 expect(screen.getByText('Transaction History')).toBeInTheDocument()
 })

 const nextButton = screen.getByRole('button', { name: /next/i })
 expect(nextButton).toBeDisabled()
 })

 it('handles export functionality', async () => {
 ;(global.fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 transactions: mockTransactions,
 pagination: mockPagination
 })
 })
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 transactions: mockTransactions,
 pagination: mockPagination
 })
 })

 render(<CoinTransactionHistory />)

 await waitFor(() => {
 expect(screen.getByText('Transaction History')).toBeInTheDocument()
 })

 const exportButton = screen.getByRole('button', { name: /📥 Export CSV/i })

 expect(exportButton).toBeInTheDocument()
 expect(exportButton).not.toBeDisabled()

 fireEvent.click(exportButton)
 
 await waitFor(() => {
 expect(global.fetch).toHaveBeenCalledTimes(2)
 })
 })

 it('displays error state when fetch fails', async () => {
 ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

 render(<CoinTransactionHistory />)

 await waitFor(() => {
 expect(screen.getByText('Error loading transactions')).toBeInTheDocument()
 expect(screen.getByText('Network error')).toBeInTheDocument()
 })
 })

 it('allows retry after error', async () => {
 ;(global.fetch as jest.Mock)
 .mockRejectedValueOnce(new Error('Network error'))
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 transactions: mockTransactions,
 pagination: mockPagination
 })
 })

 render(<CoinTransactionHistory />)

 await waitFor(() => {
 expect(screen.getByText('Error loading transactions')).toBeInTheDocument()
 })

 const retryButton = screen.getByRole('button', { name: /retry/i })
 fireEvent.click(retryButton)

 await waitFor(() => {
 expect(screen.getByText('Transaction History')).toBeInTheDocument()
 })
 })

 it('shows empty state when no transactions', async () => {
 ;(global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 transactions: [],
 pagination: { ...mockPagination, total: 0 }
 })
 })

 render(<CoinTransactionHistory />)

 await waitFor(() => {
 expect(screen.getByText('No transactions found')).toBeInTheDocument()
 expect(screen.getByText('Your transaction history will appear here')).toBeInTheDocument()
 })
 })

 it('respects custom limit prop', async () => {
 ;(global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 transactions: mockTransactions,
 pagination: mockPagination
 })
 })

 render(<CoinTransactionHistory limit={10} />)

 await waitFor(() => {
 expect(global.fetch).toHaveBeenCalledWith(
 expect.stringContaining('limit=10')
 )
 })
 })

 it('applies custom className', async () => {
 ;(global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 transactions: mockTransactions,
 pagination: mockPagination
 })
 })

 const { container } = render(<CoinTransactionHistory className="custom-class" />)

 await waitFor(() => {
 expect(container.firstChild).toHaveClass('custom-class')
 })
 })
})
