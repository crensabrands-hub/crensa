

import { renderHook, waitFor } from '@testing-library/react'
import { useAuthContext } from '@/contexts/AuthContext'
import { membershipService } from '@/lib/services/membershipService'
import { useMembershipAccess, useContentAccess } from '@/hooks/useMembershipAccess'
import type { User, MemberProfile } from '@/lib/database/schema'
import type { MembershipStatus } from '@/types'

jest.mock('@/contexts/AuthContext')
jest.mock('@/lib/services/membershipService')

const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>
const mockMembershipService = membershipService as jest.Mocked<typeof membershipService>

describe('useMembershipAccess', () => {
 const mockUser: User & { memberProfile: MemberProfile } = {
 id: 'user-123',
 clerkId: 'clerk-123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member',
 avatar: null,
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString(),
 memberProfile: {
 id: 'profile-123',
 userId: 'user-123',
 walletBalance: '50.00',
 membershipStatus: 'free' as const,
 membershipExpiry: null,
 watchHistory: [],
 favoriteCreators: [],
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString(),
 }
 }

 beforeEach(() => {
 jest.clearAllMocks()
 })

 it('should return initial loading state', () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: null,
 isLoading: true,
 error: null,
 refreshUserProfile: jest.fn()
 })

 const { result } = renderHook(() => useMembershipAccess())

 expect(result.current.isLoading).toBe(true)
 expect(result.current.hasAccess).toBe(false)
 expect(result.current.isPremium).toBe(false)
 })

 it('should handle non-member users', async () => {
 const nonMemberUser = { ...mockUser, role: 'creator' as const }
 
 mockUseAuthContext.mockReturnValue({
 userProfile: nonMemberUser,
 isLoading: false,
 error: null,
 refreshUserProfile: jest.fn()
 })

 const { result } = renderHook(() => useMembershipAccess())

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 expect(result.current.hasAccess).toBe(false)
 expect(result.current.isPremium).toBe(false)
 })

 it('should fetch membership status for member users', async () => {
 const membershipStatus: MembershipStatus = {
 status: 'premium',
 expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
 daysRemaining: 30,
 autoRenew: false
 }

 mockUseAuthContext.mockReturnValue({
 userProfile: mockUser,
 isLoading: false,
 error: null,
 refreshUserProfile: jest.fn()
 })

 mockMembershipService.getMembershipStatus.mockResolvedValue(membershipStatus)

 const { result } = renderHook(() => useMembershipAccess())

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 expect(mockMembershipService.getMembershipStatus).toHaveBeenCalledWith('user-123')
 expect(result.current.membershipStatus).toEqual(membershipStatus)
 expect(result.current.isPremium).toBe(true)
 expect(result.current.hasAccess).toBe(true)
 expect(result.current.daysRemaining).toBe(30)
 })

 it('should handle expired membership', async () => {
 const expiredMembershipStatus: MembershipStatus = {
 status: 'premium',
 expiry: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
 daysRemaining: 0,
 autoRenew: false
 }

 mockUseAuthContext.mockReturnValue({
 userProfile: mockUser,
 isLoading: false,
 error: null,
 refreshUserProfile: jest.fn()
 })

 mockMembershipService.getMembershipStatus.mockResolvedValue(expiredMembershipStatus)

 const { result } = renderHook(() => useMembershipAccess())

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 expect(result.current.isPremium).toBe(true)
 expect(result.current.isExpired).toBe(true)
 expect(result.current.hasAccess).toBe(false)
 expect(result.current.daysRemaining).toBe(0)
 })

 it('should handle expiring soon membership', async () => {
 const expiringSoonStatus: MembershipStatus = {
 status: 'premium',
 expiry: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
 daysRemaining: 3,
 autoRenew: false
 }

 mockUseAuthContext.mockReturnValue({
 userProfile: mockUser,
 isLoading: false,
 error: null,
 refreshUserProfile: jest.fn()
 })

 mockMembershipService.getMembershipStatus.mockResolvedValue(expiringSoonStatus)

 const { result } = renderHook(() => useMembershipAccess())

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 expect(result.current.isPremium).toBe(true)
 expect(result.current.isExpiringSoon).toBe(true)
 expect(result.current.hasAccess).toBe(true)
 expect(result.current.daysRemaining).toBe(3)
 })

 it('should handle service errors', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockUser,
 isLoading: false,
 error: null,
 refreshUserProfile: jest.fn()
 })

 mockMembershipService.getMembershipStatus.mockRejectedValue(new Error('Service error'))

 const { result } = renderHook(() => useMembershipAccess())

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 expect(result.current.error).toBe('Service error')
 expect(result.current.hasAccess).toBe(false)
 })

 it('should check content access', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockUser,
 isLoading: false,
 error: null,
 refreshUserProfile: jest.fn()
 })

 mockMembershipService.getMembershipStatus.mockResolvedValue({
 status: 'free',
 daysRemaining: 0
 })

 mockMembershipService.checkContentAccess.mockResolvedValue({
 hasAccess: false,
 reason: 'Premium membership required'
 })

 const { result } = renderHook(() => useMembershipAccess())

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 const hasAccess = await result.current.checkContentAccess('content-123')

 expect(mockMembershipService.checkContentAccess).toHaveBeenCalledWith('user-123', 'content-123')
 expect(hasAccess).toBe(false)
 })
})

describe('useContentAccess', () => {
 const mockUser: User & { memberProfile: MemberProfile } = {
 id: 'user-123',
 clerkId: 'clerk-123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member',
 avatar: null,
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString(),
 memberProfile: {
 id: 'profile-123',
 userId: 'user-123',
 walletBalance: '50.00',
 membershipStatus: 'premium' as const,
 membershipExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
 watchHistory: [],
 favoriteCreators: [],
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString(),
 }
 }

 beforeEach(() => {
 jest.clearAllMocks()
 })

 it('should check content access for premium user', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockUser,
 isLoading: false,
 error: null,
 refreshUserProfile: jest.fn()
 })

 mockMembershipService.checkContentAccess.mockResolvedValue({
 hasAccess: true
 })

 const { result } = renderHook(() => useContentAccess('content-123'))

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 expect(mockMembershipService.checkContentAccess).toHaveBeenCalledWith('user-123', 'content-123')
 expect(result.current.hasAccess).toBe(true)
 expect(result.current.error).toBeNull()
 })

 it('should handle no access for free user', async () => {
 const freeUser = {
 ...mockUser,
 memberProfile: {
 ...mockUser.memberProfile,
 membershipStatus: 'free' as const,
 membershipExpiry: null
 }
 }

 mockUseAuthContext.mockReturnValue({
 userProfile: freeUser,
 isLoading: false,
 error: null,
 refreshUserProfile: jest.fn()
 })

 mockMembershipService.checkContentAccess.mockResolvedValue({
 hasAccess: false,
 reason: 'Premium membership required'
 })

 const { result } = renderHook(() => useContentAccess('content-123'))

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 expect(result.current.hasAccess).toBe(false)
 })

 it('should handle service errors', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockUser,
 isLoading: false,
 error: null,
 refreshUserProfile: jest.fn()
 })

 mockMembershipService.checkContentAccess.mockRejectedValue(new Error('Service error'))

 const { result } = renderHook(() => useContentAccess('content-123'))

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 expect(result.current.hasAccess).toBe(false)
 expect(result.current.error).toBe('Service error')
 })

 it('should return false for users without profile', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: null,
 isLoading: false,
 error: null,
 refreshUserProfile: jest.fn()
 })

 const { result } = renderHook(() => useContentAccess('content-123'))

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false)
 })

 expect(result.current.hasAccess).toBe(false)
 expect(mockMembershipService.checkContentAccess).not.toHaveBeenCalled()
 })
})