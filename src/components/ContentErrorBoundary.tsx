'use client'

import React from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { errorReportingService } from '@/lib/services/errorReportingService'

interface ContentErrorBoundaryProps {
 children: React.ReactNode
 sectionName: string
}

export function ContentErrorBoundary({ children, sectionName }: ContentErrorBoundaryProps) {
 const handleError = (error: Error) => {
 console.error(`Content error in ${sectionName}:`, error)

 errorReportingService.captureError(error, {
 context: {
 component: 'content-error-boundary',
 page: typeof window !== 'undefined' ? window.location.pathname : undefined,
 action: 'content-error'
 },
 metadata: { sectionName },
 severity: 'high',
 tags: ['content-error-boundary']
 })
 }

 const fallback = (
 <div className="py-16 bg-gray-50">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center">
 <div className="flex items-center justify-center w-16 h-16 mx-auto bg-yellow-100 rounded-full">
 <svg
 className="w-8 h-8 text-yellow-600"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
 />
 </svg>
 </div>
 <h3 className="mt-4 text-lg font-medium text-gray-900">
 Content Temporarily Unavailable
 </h3>
 <p className="mt-2 text-sm text-gray-500">
 The {sectionName} section is currently experiencing issues. Please try again later.
 </p>
 </div>
 </div>
 </div>
 )

 return (
 <ErrorBoundary fallback={fallback} onError={handleError}>
 {children}
 </ErrorBoundary>
 )
}