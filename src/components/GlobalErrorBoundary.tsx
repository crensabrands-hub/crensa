'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { errorReportingService } from '@/lib/services/errorReportingService'

interface Props {
 children: ReactNode
 fallback?: ReactNode
 level: 'page' | 'component' | 'section'
 componentName?: string
 enableRetry?: boolean
 enableReporting?: boolean
 onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
 hasError: boolean
 error?: Error
 errorInfo?: ErrorInfo
 retryCount: number
 isRetrying: boolean
}

export class GlobalErrorBoundary extends Component<Props, State> {
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

 componentDidCatch(error: Error, errorInfo: ErrorInfo) {
 this.setState({ errorInfo })

 if (this.props.enableReporting !== false) {
 errorReportingService.captureException(error, {
 component: this.props.componentName || 'unknown',
 page: typeof window !== 'undefined' ? window.location.pathname : undefined,
 action: 'component-error'
 })
 }

 if (this.props.onError) {
 this.props.onError(error, errorInfo)
 }

 console.error('GlobalErrorBoundary caught an error:', {
 error,
 errorInfo,
 componentName: this.props.componentName,
 level: this.props.level
 })
 }

 handleRetry = () => {
 if (this.state.retryCount >= 3) {
 return
 }

 this.setState({ 
 isRetrying: true,
 retryCount: this.state.retryCount + 1
 })

 this.retryTimeoutId = setTimeout(() => {
 this.setState({
 hasError: false,
 error: undefined,
 errorInfo: undefined,
 isRetrying: false
 })
 }, 500)
 }

 handleReload = () => {
 window.location.reload()
 }

 handleGoHome = () => {
 window.location.href = '/'
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

 return this.renderErrorUI()
 }

 return this.props.children
 }

 private renderErrorUI() {
 const { level, componentName, enableRetry = true } = this.props
 const { error, retryCount, isRetrying } = this.state

 if (level === 'component' || level === 'section') {
 return (
 <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
 <div className="flex items-start">
 <div className="flex-shrink-0">
 <svg
 className="h-5 w-5 text-red-400"
 viewBox="0 0 20 20"
 fill="currentColor"
 >
 <path
 fillRule="evenodd"
 d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
 clipRule="evenodd"
 />
 </svg>
 </div>
 <div className="ml-3 flex-1">
 <h3 className="text-sm font-medium text-red-800">
 {componentName ? `${componentName} Error` : 'Component Error'}
 </h3>
 <div className="mt-2 text-sm text-red-700">
 <p>
 This section is temporarily unavailable. 
 {enableRetry && retryCount < 3 && ' You can try again or continue using other parts of the site.'}
 </p>
 </div>
 {enableRetry && retryCount < 3 && (
 <div className="mt-3">
 <button
 onClick={this.handleRetry}
 disabled={isRetrying}
 className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm font-medium hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {isRetrying ? 'Retrying...' : `Try Again ${retryCount > 0 ? `(${retryCount}/3)` : ''}`}
 </button>
 </div>
 )}
 </div>
 </div>
 </div>
 )
 }

 return (
 <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
 <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
 <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
 <svg
 className="w-6 h-6 text-red-600"
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
 
 <div className="mt-4 text-center">
 <h3 className="text-lg font-medium text-gray-900">
 Oops! Something went wrong
 </h3>
 <p className="mt-2 text-sm text-gray-500">
 We encountered an unexpected error. Don&apos;t worry, our team has been notified and is working on a fix.
 </p>
 
 {process.env.NODE_ENV === 'development' && error && (
 <details className="mt-4 text-left">
 <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
 Error Details (Development)
 </summary>
 <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto max-h-32">
 {error.message}
 {error.stack && `\n\n${error.stack}`}
 </pre>
 </details>
 )}
 
 <div className="mt-6 space-y-3">
 {enableRetry && retryCount < 3 && (
 <button
 onClick={this.handleRetry}
 disabled={isRetrying}
 className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {isRetrying ? (
 <>
 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
 </svg>
 Retrying...
 </>
 ) : (
 `Try Again ${retryCount > 0 ? `(${retryCount}/3)` : ''}`
 )}
 </button>
 )}
 
 <button
 onClick={this.handleReload}
 className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
 >
 Refresh Page
 </button>
 
 <button
 onClick={this.handleGoHome}
 className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
 >
 Go to Homepage
 </button>
 </div>
 
 <p className="mt-4 text-xs text-gray-400">
 Error ID: {error?.message ? btoa(error.message).slice(0, 8) : 'unknown'}
 </p>
 </div>
 </div>
 </div>
 )
 }
}