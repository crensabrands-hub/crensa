

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import WalletBalance from '@/components/wallet/WalletBalance'
import { useAuthContext } from '@/contexts/AuthContext'

jest.mock('@/contexts/AuthContext')
const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>

global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

Object.defineProperty(window, 'location', {
 value: {
 href: ''
 },
 writable: true
})

const mockMemberProfile = {
 id: 'user-123',
 clerkId: 'clerk-123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member' as const,
 avatar: null,
 createdAt: new Date(),
 updatedAt: new Date()
}

const mockCreatorProfile = {
 ...mockMemberProfile,
 role: 'creator' as const
}

describe('WalletBalance', () => {
 beforeEach(() => {
 jest.clearAllMocks()
 mockFetch.mockClear()
 })

 it('does not render for creator users', () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 user: null,
 isLoading: false,
 isSignedIn: true,
 error: null,
 lastFetch: null,
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 retry: jest.fn(),
 clearError: jest.fn()
 })

 const { container } = render(<WalletBalance />)
 expect(container.firstChild).toBeNull()
 })

 it('does not render when no user profile', () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: null,
 user: null,
 isLoading: false,
 isSignedIn: false,
 error: null,
 lastFetch: null,
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 retry: jest.fn(),
 clearError: jest.fn()
 })

 const { container } = render(<WalletBalance />)
 expect(container.firstChild).toBeNull()
 })

 it('shows loading state initially', () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockMemberProfile,
 user: null,
 isLoading: false,
 isSignedIn: true,
 error: null,
 lastFetch: null,
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 retry: jest.fn(),
 clearError: jest.fn()
 })

 mockFetch.mockImplementation(() => new Promise(() => {}))

 render(<WalletBalance />)
 
 expect(screen.getByRole('generic')).toHaveClass('animate-pulse')
 })

 it('displays wallet balance successfully', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockMemberProfile,
 user: null,
 isLoading: false,
 isSignedIn: true,
 error: null,
 lastFetch: null,
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 retry: jest.fn(),
 clearError: jest.fn()
 })

 const mockBalance = {
 balance: 25.5,
 lastUpdated: new Date().toISOString(),
 pendingTransactions: 0
 }

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => mockBalance
 } as Response)

 render(<WalletBalance />)

 await waitFor(() => {
 expect(screen.getByText('25.5 credits')).toBeInTheDocument()
 })

 expect(screen.getByText('Wallet Balance')).toBeInTheDocument()
 expect(screen.getByText('Recharge Wallet')).toBeInTheDocument()
 })

 it('displays error state and retry button', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockMemberProfile,
 user: null,
 isLoading: false,
 isSignedIn: true,
 error: null,
 lastFetch: null,
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 retry: jest.fn(),
 clearError: jest.fn()
 })

 mockFetch.mockRejectedValueOnce(new Error('Network error'))

 render(<WalletBalance />)

 await waitFor(() => {
 expect(screen.getByText('Error')).toBeInTheDocument()
 })

 expect(screen.getByText('Network error')).toBeInTheDocument()
 expect(screen.getByText('Try Again')).toBeInTheDocument()
 })

 it('shows pending transactions notice', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockMemberProfile,
 user: null,
 isLoading: false,
 isSignedIn: true,
 error: null,
 lastFetch: null,
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 retry: jest.fn(),
 clearError: jest.fn()
 })

 const mockBalance = {
 balance: 15,
 lastUpdated: new Date().toISOString(),
 pendingTransactions: 2
 }

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => mockBalance
 } as Response)

 render(<WalletBalance />)

 await waitFor(() => {
 expect(screen.getByText('2 pending transaction(s)')).toBeInTheDocument()
 })
 })

 it('shows low balance warning', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockMemberProfile,
 user: null,
 isLoading: false,
 isSignedIn: true,
 error: null,
 lastFetch: null,
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 retry: jest.fn(),
 clearError: jest.fn()
 })

 const mockBalance = {
 balance: 5, // Low balance
 lastUpdated: new Date().toISOString(),
 pendingTransactions: 0
 }

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => mockBalance
 } as Response)

 render(<WalletBalance />)

 await waitFor(() => {
 expect(screen.getByText(/Low balance! Consider recharging/)).toBeInTheDocument()
 })
 })

 it('calls onRecharge when recharge button clicked', async () => {
 const mockOnRecharge = jest.fn()

 mockUseAuthContext.mockReturnValue({
 userProfile: mockMemberProfile,
 user: null,
 isLoading: false,
 isSignedIn: true,
 error: null,
 lastFetch: null,
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 retry: jest.fn(),
 clearError: jest.fn()
 })

 const mockBalance = {
 balance: 15,
 lastUpdated: new Date().toISOString(),
 pendingTransactions: 0
 }

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => mockBalance
 } as Response)

 render(<WalletBalance onRecharge={mockOnRecharge} />)

 await waitFor(() => {
 expect(screen.getByText('Recharge Wallet')).toBeInTheDocument()
 })

 fireEvent.click(screen.getByText('Recharge Wallet'))
 expect(mockOnRecharge).toHaveBeenCalledTimes(1)
 })

 it('redirects to recharge page when no onRecharge provided', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockMemberProfile,
 user: null,
 isLoading: false,
 isSignedIn: true,
 error: null,
 lastFetch: null,
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 retry: jest.fn(),
 clearError: jest.fn()
 })

 const mockBalance = {
 balance: 15,
 lastUpdated: new Date().toISOString(),
 pendingTransactions: 0
 }

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => mockBalance
 } as Response)

 render(<WalletBalance />)

 await waitFor(() => {
 expect(screen.getByText('Recharge Wallet')).toBeInTheDocument()
 })

 fireEvent.click(screen.getByText('Recharge Wallet'))
 expect(window.location.href).toBe('/wallet/recharge')
 })

 it('refreshes balance when refresh button clicked', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockMemberProfile,
 user: null,
 isLoading: false,
 isSignedIn: true,
 error: null,
 lastFetch: null,
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 retry: jest.fn(),
 clearError: jest.fn()
 })

 const mockBalance = {
 balance: 15,
 lastUpdated: new Date().toISOString(),
 pendingTransactions: 0
 }

 mockFetch.mockResolvedValue({
 ok: true,
 json: async () => mockBalance
 } as Response)

 render(<WalletBalance />)

 await waitFor(() => {
 expect(screen.getByText('15 credits')).toBeInTheDocument()
 })

 const refreshButton = screen.getByTitle('Refresh balance')
 fireEvent.click(refreshButton)

 await waitFor(() => {
 expect(mockFetch).toHaveBeenCalledTimes(2)
 })
 })

 it('hides recharge button when showRechargeButton is false', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockMemberProfile,
 user: null,
 isLoading: false,
 isSignedIn: true,
 error: null,
 lastFetch: null,
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 retry: jest.fn(),
 clearError: jest.fn()
 })

 const mockBalance = {
 balance: 15,
 lastUpdated: new Date().toISOString(),
 pendingTransactions: 0
 }

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => mockBalance
 } as Response)

 render(<WalletBalance showRechargeButton={false} />)

 await waitFor(() => {
 expect(screen.getByText('15 credits')).toBeInTheDocument()
 })

 expect(screen.queryByText('Recharge Wallet')).not.toBeInTheDocument()
 })

 it('applies different size classes', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockMemberProfile,
 user: null,
 isLoading: false,
 isSignedIn: true,
 error: null,
 lastFetch: null,
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 retry: jest.fn(),
 clearError: jest.fn()
 })

 const mockBalance = {
 balance: 15,
 lastUpdated: new Date().toISOString(),
 pendingTransactions: 0
 }

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => mockBalance
 } as Response)

 const { rerender } = render(<WalletBalance size="sm" />)

 await waitFor(() => {
 expect(screen.getByText('15 credits')).toBeInTheDocument()
 })

 expect(screen.getByText('15 credits')).toHaveClass('text-lg')

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => mockBalance
 } as Response)

 rerender(<WalletBalance size="lg" />)

 await waitFor(() => {
 expect(screen.getByText('15 credits')).toHaveClass('text-2xl')
 })
 })
})