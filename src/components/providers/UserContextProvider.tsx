'use client'

import React, { useEffect, ReactNode } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { errorReportingService } from '@/lib/services/errorReportingService'

interface UserContextProviderProps {
 children: ReactNode
}

export function UserContextProvider({ children }: UserContextProviderProps) {
 const { userId } = useAuth()
 const { user } = useUser()

 useEffect(() => {
 if (userId && user) {
 errorReportingService.setUserContext(
 userId,
 (user as any)?.publicMetadata?.role || 'member'
 )
 }
 }, [userId, user])

 return <>{children}</>
}