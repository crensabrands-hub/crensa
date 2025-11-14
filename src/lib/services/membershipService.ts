

import type { MembershipPlan, MembershipStatus, ExclusiveContent } from '@/types'

export interface MembershipActivationRequest {
 userId: string
 planId: string
 paymentId: string
 orderId: string
}

export interface MembershipActivationResponse {
 success: boolean
 membershipStatus: MembershipStatus
 message: string
}

export interface MembershipUpgradeRequest {
 userId: string
 currentPlanId: string
 newPlanId: string
 paymentId: string
}

export interface MembershipCancellationRequest {
 userId: string
 reason?: string
 feedback?: string
}

export class MembershipService {
 private baseUrl = '/api/membership'

 async getPlans(): Promise<MembershipPlan[]> {
 try {
 const response = await fetch(`${this.baseUrl}/plans`)
 if (!response.ok) {
 throw new Error('Failed to fetch membership plans')
 }
 return await response.json()
 } catch (error) {
 console.error('Error fetching membership plans:', error)
 throw error
 }
 }

 async getMembershipStatus(userId: string): Promise<MembershipStatus> {
 try {
 const response = await fetch(`${this.baseUrl}/status/${userId}`)
 if (!response.ok) {
 throw new Error('Failed to fetch membership status')
 }
 return await response.json()
 } catch (error) {
 console.error('Error fetching membership status:', error)
 throw error
 }
 }

 async activateMembership(request: MembershipActivationRequest): Promise<MembershipActivationResponse> {
 try {
 const response = await fetch(`${this.baseUrl}/activate`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(request),
 })

 if (!response.ok) {
 throw new Error('Failed to activate membership')
 }

 return await response.json()
 } catch (error) {
 console.error('Error activating membership:', error)
 throw error
 }
 }

 async upgradeMembership(request: MembershipUpgradeRequest): Promise<MembershipActivationResponse> {
 try {
 const response = await fetch(`${this.baseUrl}/upgrade`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(request),
 })

 if (!response.ok) {
 throw new Error('Failed to upgrade membership')
 }

 return await response.json()
 } catch (error) {
 console.error('Error upgrading membership:', error)
 throw error
 }
 }

 async cancelMembership(request: MembershipCancellationRequest): Promise<{ success: boolean; message: string }> {
 try {
 const response = await fetch(`${this.baseUrl}/cancel`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(request),
 })

 if (!response.ok) {
 throw new Error('Failed to cancel membership')
 }

 return await response.json()
 } catch (error) {
 console.error('Error canceling membership:', error)
 throw error
 }
 }

 async getExclusiveContent(userId: string, category?: string): Promise<ExclusiveContent[]> {
 try {
 const params = new URLSearchParams()
 if (category && category !== 'all') {
 params.append('category', category)
 }

 const response = await fetch(`${this.baseUrl}/exclusive-content/${userId}?${params}`)
 if (!response.ok) {
 throw new Error('Failed to fetch exclusive content')
 }

 return await response.json()
 } catch (error) {
 console.error('Error fetching exclusive content:', error)
 throw error
 }
 }

 async checkContentAccess(userId: string, contentId: string): Promise<{ hasAccess: boolean; reason?: string }> {
 try {
 const response = await fetch(`${this.baseUrl}/check-access/${userId}/${contentId}`)
 if (!response.ok) {
 throw new Error('Failed to check content access')
 }

 return await response.json()
 } catch (error) {
 console.error('Error checking content access:', error)
 throw error
 }
 }

 async getUsageStats(userId: string, period: 'month' | 'year' = 'month'): Promise<{
 videosWatched: number
 watchTime: number // in minutes
 creditsUsed: number
 exclusiveContentAccessed: number
 }> {
 try {
 const response = await fetch(`${this.baseUrl}/usage/${userId}?period=${period}`)
 if (!response.ok) {
 throw new Error('Failed to fetch usage statistics')
 }

 return await response.json()
 } catch (error) {
 console.error('Error fetching usage statistics:', error)
 throw error
 }
 }

 async getMembershipHistory(userId: string): Promise<Array<{
 id: string
 type: 'activation' | 'upgrade' | 'renewal' | 'cancellation'
 planName: string
 amount: number
 date: Date
 status: 'completed' | 'pending' | 'failed'
 }>> {
 try {
 const response = await fetch(`${this.baseUrl}/history/${userId}`)
 if (!response.ok) {
 throw new Error('Failed to fetch membership history')
 }

 const data = await response.json()
 return data.map((item: any) => ({
 ...item,
 date: new Date(item.date)
 }))
 } catch (error) {
 console.error('Error fetching membership history:', error)
 throw error
 }
 }

 async calculateProration(userId: string, newPlanId: string): Promise<{
 proratedAmount: number
 creditAmount: number
 chargeAmount: number
 nextBillingDate: Date
 }> {
 try {
 const response = await fetch(`${this.baseUrl}/calculate-proration/${userId}/${newPlanId}`)
 if (!response.ok) {
 throw new Error('Failed to calculate proration')
 }

 const data = await response.json()
 return {
 ...data,
 nextBillingDate: new Date(data.nextBillingDate)
 }
 } catch (error) {
 console.error('Error calculating proration:', error)
 throw error
 }
 }

 async toggleAutoRenewal(userId: string, enabled: boolean): Promise<{ success: boolean; message: string }> {
 try {
 const response = await fetch(`${this.baseUrl}/auto-renewal`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({ userId, enabled }),
 })

 if (!response.ok) {
 throw new Error('Failed to toggle auto-renewal')
 }

 return await response.json()
 } catch (error) {
 console.error('Error toggling auto-renewal:', error)
 throw error
 }
 }
}

export const membershipService = new MembershipService()