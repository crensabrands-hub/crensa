

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import WalletBalance from '@/components/wallet/WalletBalance'
import { useAuthContext } from '@/contexts/AuthContext'
import { useWalletBalance } from '@/hooks/useWalletBalance'
import type { WalletBalance as WalletBalanceType } from '@/types'

jest.mock('@/contexts/AuthContext')
jest.mock('@/hooks/useWalletBalance')

const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>
const mockUseWalletBalance = useWalletBalance as jest.MockedFunction<typeof useWalletBalance>

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

const mockWalletBalance: WalletBalanceType = {
 balance: 50,
 lastUpdated: new Date(),
 pendingTransactions: 0
}

describe('WalletBalance', () => {
 beforeEach(() => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockUserProfile,
 isLoading: false,
 error: null,
 refreshProfile: jest.fn()
 })

 mockUseWalletBalance.mockReturnValue({
 balance: mockWalletBalance,
 isLoading: false,
 error: null,
 refreshBalance: jest.fn(),
 subscribeToUpdates: true,
 setSubscribeToUpdates: jest.fn()
 })
 })

 afterEach(() => {
 jest.clearAllMocks()
 })

 it('renders wallet balance correctly', () => {
 render(<WalletBalance />)
 
 expect(screen.getByText('Wallet Balance')).toBeInTheDocument()
 expect(screen.getByText('50 credits')).toBeInTheDocument()
 expect(screen.getByText('Recharge Wallet')).toBeInTheDocument()
 })

 it('shows loading state', () => {
 mockUseWalletBalance.mockReturnValue({
 balance: null,
 isLoading: true,
 error: null,
 refreshBalance: jest.fn(),
 subscribeToUpdates: true,
 setSubscribeToUpdates: jest.fn()
 })

 render(<WalletBalance />)
 
 expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled()
 })

 it('shows error state', () => {
 mockUseWalletBalance.mockReturnValue({
 balance: null,
 isLoading: false,
 error: 'Failed to load balance',
 refreshBalance: jest.fn(),
 subscribeToUpdates: true,
 setSubscribeToUpdates: jest.fn()
 })

 render(<WalletBalance />)
 
 expect(screen.getByText('Error')).toBeInTheDocument()
 expect(screen.getByText('Failed to load balance')).toBeInTheDocument()
 expect(screen.getByText('Try Again')).toBeInTheDocument()
 })

 it('shows low balance warning', () => {
 const lowBalance = { ...mockWalletBalance, balance: 5 }
 mockUseWalletBalance.mockReturnValue({
 balance: lowBalance,
 isLoading: false,
 error: null,
 refreshBalance: jest.fn(),
 subscribeToUpdates: true,
 setSubscribeToUpdates: jest.fn()
 })

 render(<WalletBalance />)
 
 expect(screen.getByText(/low balance/i)).toBeInTheDocument()
 })

 it('shows pending transactions notice', () => {
 const balanceWithPending = { ...mockWalletBalance, pendingTransactions: 2 }
 mockUseWalletBalance.mockReturnValue({
 balance: balanceWithPending,
 isLoading: false,
 error: null,
 refreshBalance: jest.fn(),
 subscribeToUpdates: true,
 setSubscribeToUpdates: jest.fn()
 })

 render(<WalletBalance />)
 
 expect(screen.getByText('2 pending transaction(s)')).toBeInTheDocument()
 })

 it('calls refresh function when refresh button is clicked', async () => {
 const mockRefreshBalance = jest.fn()
 mockUseWalletBalance.mockReturnValue({
 balance: mockWalletBalance,
 isLoading: false,
 error: null,
 refreshBalance: mockRefreshBalance,
 subscribeToUpdates: true,
 setSubscribeToUpdates: jest.fn()
 })

 render(<WalletBalance />)
 
 const refreshButton = screen.getByTitle('Refresh balance')
 fireEvent.click(refreshButton)
 
 expect(mockRefreshBalance).toHaveBeenCalledTimes(1)
 })

 it('calls onRecharge when recharge button is clicked', () => {
 const mockOnRecharge = jest.fn()
 
 render(<WalletBalance onRecharge={mockOnRecharge} />)
 
 const rechargeButton = screen.getByText('Recharge Wallet')
 fireEvent.click(rechargeButton)
 
 expect(mockOnRecharge).toHaveBeenCalledTimes(1)
 })

 it('hides recharge button when showRechargeButton is false', () => {
 render(<WalletBalance showRechargeButton={false} />)
 
 expect(screen.queryByText('Recharge Wallet')).not.toBeInTheDocument()
 })

 it('applies different sizes correctly', () => {
 const { rerender } = render(<WalletBalance size="sm" />)
 expect(screen.getByText('50 credits')).toHaveClass('text-lg')
 
 rerender(<WalletBalance size="lg" />)
 expect(screen.getByText('50 credits')).toHaveClass('text-2xl')
 })

 it('does not render for non-member users', () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: { ...mockUserProfile, role: 'creator' },
 isLoading: false,
 error: null,
 refreshProfile: jest.fn()
 })

 const { container } = render(<WalletBalance />)
 expect(container.firstChild).toBeNull()
 })

 it('handles balance updates with animation', async () => {
 const { rerender } = render(<WalletBalance />)

 const updatedBalance = { ...mockWalletBalance, balance: 75 }
 mockUseWalletBalance.mockReturnValue({
 balance: updatedBalance,
 isLoading: false,
 error: null,
 refreshBalance: jest.fn(),
 subscribeToUpdates: true,
 setSubscribeToUpdates: jest.fn()
 })

 rerender(<WalletBalance />)
 
 await waitFor(() => {
 expect(screen.getByText('75 credits')).toBeInTheDocument()
 })
 })

 it('formats large numbers correctly', () => {
 const largeBalance = { ...mockWalletBalance, balance: 12345 }
 mockUseWalletBalance.mockReturnValue({
 balance: largeBalance,
 isLoading: false,
 error: null,
 refreshBalance: jest.fn(),
 subscribeToUpdates: true,
 setSubscribeToUpdates: jest.fn()
 })

 render(<WalletBalance />)
 
 expect(screen.getByText('12,345 credits')).toBeInTheDocument()
 })
})