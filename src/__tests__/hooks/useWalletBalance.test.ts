

import { renderHook, act, waitFor } from '@testing-library/react'
import { useWalletBalance } from '@/hooks/useWalletBalance'
import { useAuthContext } from '@/contexts/AuthContext'
import type { WalletBalance } from '@/types'

jest.mock('@/contexts/AuthContext')

global.fetch = jest.fn()

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

const mockWalletBalance: WalletBalance = {
 balance: 50,
 lastUpdated: new Date(),
 pendingTransactions: 0
}

describe('useWalletBalance', () => {
 beforeEach(() => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockUserProfile,
 isLoading: false,
 error: null,
 refreshProfile: jest.fn()
 })

 mockFetch.mockResolvedValue({
 ok: true,
 json: async () => mockWalletBalance
 } as Response)
 })

 afterEach(() => {
 jest.clearAllMocks()
 })

 it('should fetch wallet balance on mount', async () => {
 const { result } = renderHook(() => useWalletBalance())

 expect(result.current.isLoading).toBe(true)
 expect(result.current.balance).toBe(null)

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 expect(result.current.balance).toEqual(mockWalletBalance)
 expect(result.current.error).toBe(null)
 expect(mockFetch).toHaveBeenCalledWith('/api/wallet/balance', {
 method: 'GET',
 headers: {
 'Content-Type': 'application/json',
 },
 })
 })

 it('should handle API errors', async () => {
 mockFetch.mockRejectedValue(new Error('API Error'))

 const { result } = renderHook(() => useWalletBalance())

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 expect(result.current.balance).toBe(null)
 expect(result.current.error).toBe('API Error')
 })

 it('should handle HTTP errors', async () => {
 mockFetch.mockResolvedValue({
 ok: false,
 status: 500,
 statusText: 'Internal Server Error'
 } as Response)

 const { result } = renderHook(() => useWalletBalance())

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 expect(result.current.balance).toBe(null)
 expect(result.current.error).toBe('HTTP 500: Internal Server Error')
 })

 it('should refresh balance manually', async () => {
 const { result } = renderHook(() => useWalletBalance())

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 mockFetch.mockClear()

 await act(async () => {
 await result.current.refreshBalance()
 })

 expect(mockFetch).toHaveBeenCalledTimes(1)
 })

 it('should not fetch when user profile is not available', () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: null,
 isLoading: false,
 error: null,
 refreshProfile: jest.fn()
 })

 renderHook(() => useWalletBalance())

 expect(mockFetch).not.toHaveBeenCalled()
 })

 it('should manage subscription state', () => {
 const { result } = renderHook(() => useWalletBalance(false))

 expect(result.current.subscribeToUpdates).toBe(false)

 act(() => {
 result.current.setSubscribeToUpdates(true)
 })

 expect(result.current.subscribeToUpdates).toBe(true)
 })

 it('should handle custom wallet update events', async () => {
 const { result } = renderHook(() => useWalletBalance())

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 const updatedBalance: WalletBalance = {
 balance: 75,
 lastUpdated: new Date(),
 pendingTransactions: 1
 }

 act(() => {
 const event = new CustomEvent('walletBalanceUpdate', {
 detail: { userId: mockUserProfile.id, balance: updatedBalance }
 })
 window.dispatchEvent(event)
 })

 expect(result.current.balance).toEqual(updatedBalance)
 })

 it('should ignore events for different users', async () => {
 const { result } = renderHook(() => useWalletBalance())

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 const originalBalance = result.current.balance

 act(() => {
 const event = new CustomEvent('walletBalanceUpdate', {
 detail: { 
 userId: 'different-user', 
 balance: { balance: 999, lastUpdated: new Date(), pendingTransactions: 0 }
 }
 })
 window.dispatchEvent(event)
 })

 expect(result.current.balance).toEqual(originalBalance)
 })
})