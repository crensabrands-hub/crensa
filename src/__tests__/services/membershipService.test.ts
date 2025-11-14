

import { membershipService } from '@/lib/services/membershipService'
import type { MembershipPlan, MembershipStatus, ExclusiveContent } from '@/types'

global.fetch = jest.fn()

describe('MembershipService', () => {
 beforeEach(() => {
 jest.clearAllMocks()
 })

 describe('getPlans', () => {
 it('should fetch membership plans successfully', async () => {
 const mockPlans: MembershipPlan[] = [
 {
 id: 'monthly',
 name: 'Monthly Premium',
 description: 'Perfect for trying out premium features',
 price: 299,
 duration: 30,
 features: ['Access to all exclusive content', 'Ad-free viewing experience']
 }
 ]

 ;(fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => mockPlans
 })

 const result = await membershipService.getPlans()

 expect(fetch).toHaveBeenCalledWith('/api/membership/plans')
 expect(result).toEqual(mockPlans)
 })

 it('should throw error when fetch fails', async () => {
 ;(fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 status: 500
 })

 await expect(membershipService.getPlans()).rejects.toThrow('Failed to fetch membership plans')
 })
 })

 describe('getMembershipStatus', () => {
 it('should fetch membership status successfully', async () => {
 const userId = 'user-123'
 const mockStatus: MembershipStatus = {
 status: 'premium',
 expiry: new Date('2024-12-31'),
 daysRemaining: 30,
 autoRenew: false
 }

 ;(fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => mockStatus
 })

 const result = await membershipService.getMembershipStatus(userId)

 expect(fetch).toHaveBeenCalledWith(`/api/membership/status/${userId}`)
 expect(result).toEqual(mockStatus)
 })

 it('should throw error when user not found', async () => {
 const userId = 'invalid-user'

 ;(fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 status: 404
 })

 await expect(membershipService.getMembershipStatus(userId)).rejects.toThrow('Failed to fetch membership status')
 })
 })

 describe('activateMembership', () => {
 it('should activate membership successfully', async () => {
 const request = {
 userId: 'user-123',
 planId: 'monthly',
 paymentId: 'pay_123',
 orderId: 'order_123'
 }

 const mockResponse = {
 success: true,
 membershipStatus: {
 status: 'premium',
 expiry: new Date('2024-02-15'),
 daysRemaining: 30,
 autoRenew: false
 },
 message: 'Membership activated successfully'
 }

 ;(fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => mockResponse
 })

 const result = await membershipService.activateMembership(request)

 expect(fetch).toHaveBeenCalledWith('/api/membership/activate', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(request),
 })
 expect(result).toEqual(mockResponse)
 })

 it('should throw error when activation fails', async () => {
 const request = {
 userId: 'user-123',
 planId: 'monthly',
 paymentId: 'pay_123',
 orderId: 'order_123'
 }

 ;(fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 status: 400
 })

 await expect(membershipService.activateMembership(request)).rejects.toThrow('Failed to activate membership')
 })
 })

 describe('getExclusiveContent', () => {
 it('should fetch exclusive content successfully', async () => {
 const userId = 'user-123'
 const mockContent: ExclusiveContent[] = [
 {
 id: '1',
 title: 'Exclusive Video',
 description: 'Premium content',
 type: 'video',
 thumbnailUrl: '/thumb.jpg',
 creatorId: 'creator-1',
 creator: {
 username: 'creator',
 displayName: 'Creator Name'
 },
 requiredMembership: 'premium',
 releaseDate: new Date('2024-01-15')
 }
 ]

 ;(fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => mockContent
 })

 const result = await membershipService.getExclusiveContent(userId)

 expect(fetch).toHaveBeenCalledWith(`/api/membership/exclusive-content/${userId}?`)
 expect(result).toEqual(mockContent)
 })

 it('should fetch exclusive content with category filter', async () => {
 const userId = 'user-123'
 const category = 'video'

 ;(fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => []
 })

 await membershipService.getExclusiveContent(userId, category)

 expect(fetch).toHaveBeenCalledWith(`/api/membership/exclusive-content/${userId}?category=video`)
 })
 })

 describe('checkContentAccess', () => {
 it('should check content access successfully', async () => {
 const userId = 'user-123'
 const contentId = 'content-456'
 const mockResponse = { hasAccess: true }

 ;(fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => mockResponse
 })

 const result = await membershipService.checkContentAccess(userId, contentId)

 expect(fetch).toHaveBeenCalledWith(`/api/membership/check-access/${userId}/${contentId}`)
 expect(result).toEqual(mockResponse)
 })

 it('should return no access for non-premium users', async () => {
 const userId = 'user-123'
 const contentId = 'content-456'
 const mockResponse = { hasAccess: false, reason: 'Premium membership required' }

 ;(fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => mockResponse
 })

 const result = await membershipService.checkContentAccess(userId, contentId)

 expect(result).toEqual(mockResponse)
 })
 })

 describe('getUsageStats', () => {
 it('should fetch usage statistics successfully', async () => {
 const userId = 'user-123'
 const mockStats = {
 videosWatched: 24,
 watchTime: 510, // minutes
 creditsUsed: 120,
 exclusiveContentAccessed: 8
 }

 ;(fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => mockStats
 })

 const result = await membershipService.getUsageStats(userId, 'month')

 expect(fetch).toHaveBeenCalledWith(`/api/membership/usage/${userId}?period=month`)
 expect(result).toEqual(mockStats)
 })
 })

 describe('getMembershipHistory', () => {
 it('should fetch membership history successfully', async () => {
 const userId = 'user-123'
 const mockHistory = [
 {
 id: 'hist-1',
 type: 'activation',
 planName: 'Monthly Premium',
 amount: 299,
 date: '2024-01-15T00:00:00.000Z',
 status: 'completed'
 }
 ]

 ;(fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => mockHistory
 })

 const result = await membershipService.getMembershipHistory(userId)

 expect(fetch).toHaveBeenCalledWith(`/api/membership/history/${userId}`)
 expect(result[0].date).toBeInstanceOf(Date)
 expect(result[0].type).toBe('activation')
 })
 })

 describe('toggleAutoRenewal', () => {
 it('should toggle auto-renewal successfully', async () => {
 const userId = 'user-123'
 const enabled = true
 const mockResponse = { success: true, message: 'Auto-renewal enabled' }

 ;(fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => mockResponse
 })

 const result = await membershipService.toggleAutoRenewal(userId, enabled)

 expect(fetch).toHaveBeenCalledWith('/api/membership/auto-renewal', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({ userId, enabled }),
 })
 expect(result).toEqual(mockResponse)
 })
 })
})