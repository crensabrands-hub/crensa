'use client'

import React, { Component, ReactNode } from 'react'
import { errorReportingService } from '@/lib/services/errorReportingService'

interface Props {
 children: ReactNode
 apiEndpoint?: string
 onRetry?: () => void
 fallback?: ReactNode
 maxRetries?: number
}

interface State {
 hasError: boolean
 error?: Error
 retryCount: number
 isRetrying: boolean
 lastRetryTime?: Date
}

export class ApiErrorBoundary extends Component<Props, State> {
 private retryTimeoutId?: NodeJS.Timeout

 constructor(props: Props) {
 super(props)
 this.state = {
 hasError: false,
 retryCount: 0,
 isRetrying: false
 }
 }

 static getDerivedStateFromError(error: Error): Partial<State> {
 return { hasError: true, error }
 }

 componentDidCatch(error: Error) {

 errorReportingService.captureError(error, {
 context: {
 component: 'api-boundary',
 action: 'api-error'
 },
 metadata: {
 endpoint: this.props.apiEndpoint,
 retryCount: this.state.retryCount
 }
 })

 console.error('ApiErrorBoundary caught an error:', {
 error,
 endpoint: this.props.apiEndpoint,
 retryCount: this.state.retryCount
 })
 }

 handleRetry = async () => {
 const maxRetries = this.props.maxRetries || 3
 
 if (this.state.retryCount >= maxRetries) {
 return
 }

 this.setState({ 
 isRetrying: true,
 retryCount: this.state.retryCount + 1,
 lastRetryTime: new Date()
 })

 try {

 if (this.props.onRetry) {
 await this.props.onRetry()
 }

 this.retryTimeoutId = setTimeout(() => {
 this.setState({
 hasError: false,
 error: undefined,
 isRetrying: false
 })
 }, 1000)
 } catch (retryError) {
 console.error('Retry failed:', retryError)
 this.setState({ isRetrying: false })

 errorReportingService.captureError(retryError as Error, {
 context: {
 component: 'api-boundary',
 action: 'retry-failed'
 }
 })
 }
 }

 componentWillUnmount() {
 if (this.retryTimeoutId) {
 clearTimeout(this.retryTimeoutId)
 }
 }

 render() {
 if (this.state.hasError) {
 if (this.props.fallback) {
 return this.props.fallback
 }

 return this.renderApiErrorUI()
 }

 return this.props.children
 }

 private renderApiErrorUI() {
 const { apiEndpoint, maxRetries = 3 } = this.props
 const { error, retryCount, isRetrying, lastRetryTime } = this.state

 const canRetry = retryCount < maxRetries
 const isNetworkError = error?.message?.includes('fetch') || error?.message?.includes('network')
 const isServerError = error?.message?.includes('500') || error?.message?.includes('502') || error?.message?.includes('503')

 return (
 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
 <div className="flex items-start">
 <div className="flex-shrink-0">
 <svg
 className="h-5 w-5 text-yellow-400"
 viewBox="0 0 20 20"
 fill="currentColor"
 >
 <path
 fillRule="evenodd"
 d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
 clipRule="evenodd"
 />
 </svg>
 </div>
 <div className="ml-3 flex-1">
 <h3 className="text-sm font-medium text-yellow-800">
 {isNetworkError ? 'Connection Problem' : 'Service Temporarily Unavailable'}
 </h3>
 <div className="mt-2 text-sm text-yellow-700">
 <p>
 {isNetworkError 
 ? 'Unable to connect to our servers. Please check your internet connection.'
 : isServerError
 ? 'Our servers are experiencing issues. Please try again in a few moments.'
 : 'This feature is temporarily unavailable. We\'re working to fix it.'
 }
 </p>
 {apiEndpoint && process.env.NODE_ENV === 'development' && (
 <p className="mt-1 text-xs text-yellow-600">
 Endpoint: {apiEndpoint}
 </p>
 )}
 {lastRetryTime && (
 <p className="mt-1 text-xs text-yellow-600">
 Last retry: {lastRetryTime.toLocaleTimeString()}
 </p>
 )}
 </div>
 
 <div className="mt-3 flex flex-wrap gap-2">
 {canRetry && (
 <button
 onClick={this.handleRetry}
 disabled={isRetrying}
 className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm font-medium hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
 >
 {isRetrying ? (
 <>
 <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-yellow-800" fill="none" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
 </svg>
 Retrying...
 </>
 ) : (
 `Try Again ${retryCount > 0 ? `(${retryCount}/${maxRetries})` : ''}`
 )}
 </button>
 )}
 
 <button
 onClick={() => window.location.reload()}
 className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm font-medium hover:bg-yellow-200"
 >
 Refresh Page
 </button>
 
 {!canRetry && (
 <button
 onClick={() => window.location.href = '/'}
 className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm font-medium hover:bg-yellow-200"
 >
 Go Home
 </button>
 )}
 </div>
 
 {process.env.NODE_ENV === 'development' && error && (
 <details className="mt-3">
 <summary className="text-xs text-yellow-600 cursor-pointer hover:text-yellow-800">
 Error Details (Development)
 </summary>
 <pre className="mt-1 text-xs text-yellow-700 bg-yellow-100 p-2 rounded overflow-auto max-h-24">
 {error.message}
 </pre>
 </details>
 )}
 </div>
 </div>
 </div>
 )
 }
}