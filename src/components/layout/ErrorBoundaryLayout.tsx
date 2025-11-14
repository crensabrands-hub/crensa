'use client'

import React, { ReactNode, useEffect } from 'react'
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary'
import { ApiErrorBoundary } from '@/components/ApiErrorBoundary'
import { ContentErrorBoundary } from '@/components/ContentErrorBoundary'
import { errorReportingService } from '@/lib/services/errorReportingService'

interface ErrorBoundaryLayoutProps {
 children: ReactNode
 level?: 'page' | 'section' | 'component'
 enableApiErrorBoundary?: boolean
 enableContentErrorBoundary?: boolean
 sectionName?: string
}

export function ErrorBoundaryLayout({
 children,
 level = 'page',
 enableApiErrorBoundary = true,
 enableContentErrorBoundary = true,
 sectionName = 'content'
}: ErrorBoundaryLayoutProps) {

 const wrapWithErrorBoundaries = (content: ReactNode) => {
 let wrappedContent = content

 wrappedContent = (
 <GlobalErrorBoundary
 level={level}
 componentName={sectionName}
 enableRetry={true}
 enableReporting={true}
 >
 {wrappedContent}
 </GlobalErrorBoundary>
 )

 if (enableApiErrorBoundary) {
 wrappedContent = (
 <ApiErrorBoundary
 maxRetries={3}
 onRetry={() => {

 console.log('API retry triggered')
 }}
 >
 {wrappedContent}
 </ApiErrorBoundary>
 )
 }

 if (enableContentErrorBoundary) {
 wrappedContent = (
 <ContentErrorBoundary sectionName={sectionName}>
 {wrappedContent}
 </ContentErrorBoundary>
 )
 }

 return wrappedContent
 }

 return <>{wrapWithErrorBoundaries(children)}</>
}

export function withErrorBoundaries<P extends object>(
 Component: React.ComponentType<P>,
 options: Partial<ErrorBoundaryLayoutProps> = {}
) {
 return function ErrorBoundaryWrappedComponent(props: P) {
 return (
 <ErrorBoundaryLayout {...options}>
 <Component {...props} />
 </ErrorBoundaryLayout>
 )
 }
}

export function FeatureErrorBoundary({
 children,
 featureName,
 fallback
}: {
 children: ReactNode
 featureName: string
 fallback?: ReactNode
}) {
 const defaultFallback = (
 <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
 <div className="text-gray-500 text-sm">
 <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
 </svg>
 <p className="font-medium text-gray-700">{featureName} Unavailable</p>
 <p className="text-xs text-gray-500 mt-1">This feature is temporarily disabled</p>
 </div>
 </div>
 )

 return (
 <GlobalErrorBoundary
 level="component"
 componentName={featureName}
 fallback={fallback || defaultFallback}
 enableRetry={true}
 >
 {children}
 </GlobalErrorBoundary>
 )
}

export function AsyncErrorBoundary({
 children,
 loading,
 error,
 retry
}: {
 children: ReactNode
 loading?: boolean
 error?: Error | null
 retry?: () => void
}) {
 if (loading) {
 return (
 <div className="flex items-center justify-center p-8">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
 </div>
 )
 }

 if (error) {
 return (
 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
 <div className="flex items-start">
 <div className="flex-shrink-0">
 <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
 </svg>
 </div>
 <div className="ml-3 flex-1">
 <h3 className="text-sm font-medium text-red-800">Loading Error</h3>
 <div className="mt-2 text-sm text-red-700">
 <p>Failed to load content. Please try again.</p>
 </div>
 {retry && (
 <div className="mt-3">
 <button
 onClick={retry}
 className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm font-medium hover:bg-red-200"
 >
 Try Again
 </button>
 </div>
 )}
 </div>
 </div>
 </div>
 )
 }

 return <>{children}</>
}