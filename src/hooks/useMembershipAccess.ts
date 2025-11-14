

import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { membershipService } from '@/lib/services/membershipService'
import type { MembershipStatus } from '@/types'

interface MembershipAccessState {
 membershipStatus: MembershipStatus | null
 isLoading: boolean
 error: string | null
 hasAccess: boolean
 isPremium: boolean
 isExpired: boolean
 isExpiringSoon: boolean
 daysRemaining: number
}

export function useMembershipAccess() {
 const { userProfile } = useAuthContext()
 const [state, setState] = useState<MembershipAccessState>({
 membershipStatus: null,
 isLoading: true,
 error: null,
 hasAccess: false,
 isPremium: false,
 isExpired: false,
 isExpiringSoon: false,
 daysRemaining: 0
 })

 const fetchMembershipStatus = useCallback(async () => {
 if (!userProfile) return

 try {
 setState(prev => ({ ...prev, isLoading: true, error: null }))
 
 const membershipStatus = await membershipService.getMembershipStatus(userProfile.id)
 
 const isPremium = membershipStatus.status === 'premium'
 const daysRemaining = membershipStatus.daysRemaining || 0
 const isExpired = isPremium && daysRemaining === 0
 const isExpiringSoon = isPremium && daysRemaining > 0 && daysRemaining <= 7
 const hasAccess = isPremium && !isExpired

 setState({
 membershipStatus,
 isLoading: false,
 error: null,
 hasAccess,
 isPremium,
 isExpired,
 isExpiringSoon,
 daysRemaining
 })
 } catch (error) {
 console.error('Error fetching membership status:', error)
 setState(prev => ({
 ...prev,
 isLoading: false,
 error: error instanceof Error ? error.message : 'Failed to fetch membership status'
 }))
 }
 }, [userProfile])

 useEffect(() => {
 if (!userProfile || userProfile.role !== 'member') {
 setState(prev => ({
 ...prev,
 isLoading: false,
 hasAccess: false,
 isPremium: false
 }))
 return
 }

 fetchMembershipStatus()
 }, [userProfile, fetchMembershipStatus])

 const checkContentAccess = async (contentId: string): Promise<boolean> => {
 if (!userProfile) return false

 try {
 const result = await membershipService.checkContentAccess(userProfile.id, contentId)
 return result.hasAccess
 } catch (error) {
 console.error('Error checking content access:', error)
 return false
 }
 }

 const refreshMembershipStatus = () => {
 fetchMembershipStatus()
 }

 return {
 ...state,
 checkContentAccess,
 refreshMembershipStatus
 }
}

export function useContentAccess(contentId: string) {
 const { userProfile } = useAuthContext()
 const [hasAccess, setHasAccess] = useState<boolean | null>(null)
 const [isLoading, setIsLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)

 const checkAccess = useCallback(async () => {
 if (!userProfile || !contentId) return

 try {
 setIsLoading(true)
 setError(null)
 
 const result = await membershipService.checkContentAccess(userProfile.id, contentId)
 setHasAccess(result.hasAccess)
 } catch (error) {
 console.error('Error checking content access:', error)
 setError(error instanceof Error ? error.message : 'Failed to check access')
 setHasAccess(false)
 } finally {
 setIsLoading(false)
 }
 }, [userProfile, contentId])

 useEffect(() => {
 if (!userProfile || !contentId) {
 setHasAccess(false)
 setIsLoading(false)
 return
 }

 checkAccess()
 }, [userProfile, contentId, checkAccess])

 return {
 hasAccess,
 isLoading,
 error,
 recheckAccess: checkAccess
 }
}