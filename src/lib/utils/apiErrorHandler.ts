import { NextRequest, NextResponse } from 'next/server'
import { errorReportingService } from '@/lib/services/errorReportingService'

export interface ApiError {
 message: string
 code?: string
 statusCode: number
 retryable?: boolean
 details?: any
}

export class ApiErrorHandler {
 static handleError(
 error: Error | any,
 request?: NextRequest,
 context?: {
 endpoint?: string
 userId?: string
 action?: string
 }
 ): NextResponse {
 const apiError = this.normalizeError(error)

 if (typeof window === 'undefined') {

 console.error('API Error:', {
 error: apiError,
 endpoint: context?.endpoint || request?.url,
 method: request?.method,
 userId: context?.userId,
 userAgent: request?.headers.get('user-agent'),
 timestamp: new Date().toISOString()
 })
 } else {

 errorReportingService.captureException(
 error instanceof Error ? error : new Error(apiError.message),
 {
 component: 'api-error-handler',
 action: context?.action || 'api-call'
 }
 )
 }

 return NextResponse.json(
 {
 error: apiError.message,
 code: apiError.code,
 retryable: apiError.retryable,
 timestamp: new Date().toISOString(),
 ...(process.env.NODE_ENV === 'development' && {
 details: apiError.details,
 stack: error?.stack
 })
 },
 { status: apiError.statusCode }
 )
 }

 static normalizeError(error: any): ApiError {

 if (error instanceof Error) {
 return this.handleJavaScriptError(error)
 }

 if (typeof error === 'string') {
 return {
 message: error,
 statusCode: 500,
 retryable: false
 }
 }

 if (error?.code) {
 return this.handleCodedError(error)
 }

 return {
 message: 'An unexpected error occurred',
 statusCode: 500,
 retryable: true
 }
 }

 private static handleJavaScriptError(error: Error): ApiError {

 if (error.message.includes('fetch') || error.message.includes('network')) {
 return {
 message: 'Network connection error',
 code: 'NETWORK_ERROR',
 statusCode: 503,
 retryable: true,
 details: error.message
 }
 }

 if (error.message.includes('timeout')) {
 return {
 message: 'Request timeout',
 code: 'TIMEOUT_ERROR',
 statusCode: 408,
 retryable: true,
 details: error.message
 }
 }

 if (error.message.includes('database') || error.message.includes('connection')) {
 return {
 message: 'Database connection error',
 code: 'DATABASE_ERROR',
 statusCode: 503,
 retryable: true,
 details: process.env.NODE_ENV === 'development' ? error.message : undefined
 }
 }

 if (error.message.includes('validation') || error.message.includes('invalid')) {
 return {
 message: 'Invalid request data',
 code: 'VALIDATION_ERROR',
 statusCode: 400,
 retryable: false,
 details: error.message
 }
 }

 if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
 return {
 message: 'Authentication required',
 code: 'AUTH_ERROR',
 statusCode: 401,
 retryable: false,
 details: error.message
 }
 }

 if (error.message.includes('forbidden') || error.message.includes('permission')) {
 return {
 message: 'Insufficient permissions',
 code: 'PERMISSION_ERROR',
 statusCode: 403,
 retryable: false,
 details: error.message
 }
 }

 return {
 message: 'Internal server error',
 code: 'INTERNAL_ERROR',
 statusCode: 500,
 retryable: true,
 details: process.env.NODE_ENV === 'development' ? error.message : undefined
 }
 }

 private static handleCodedError(error: any): ApiError {
 const errorMap: Record<string, Partial<ApiError>> = {
 'ECONNREFUSED': {
 message: 'Service unavailable',
 statusCode: 503,
 retryable: true
 },
 'ENOTFOUND': {
 message: 'Service not found',
 statusCode: 503,
 retryable: true
 },
 'ETIMEDOUT': {
 message: 'Request timeout',
 statusCode: 408,
 retryable: true
 },
 'ECONNRESET': {
 message: 'Connection reset',
 statusCode: 503,
 retryable: true
 }
 }

 const mappedError = errorMap[error.code]
 if (mappedError) {
 return {
 message: mappedError.message || 'Service error',
 code: error.code,
 statusCode: mappedError.statusCode || 500,
 retryable: mappedError.retryable ?? true,
 details: error.message
 }
 }

 return {
 message: error.message || 'Unknown error',
 code: error.code,
 statusCode: 500,
 retryable: true,
 details: error
 }
 }

 static async withErrorHandling<T>(
 handler: () => Promise<T>,
 request?: NextRequest,
 context?: {
 endpoint?: string
 userId?: string
 action?: string
 }
 ): Promise<T | NextResponse> {
 try {
 return await handler()
 } catch (error) {
 return this.handleError(error, request, context)
 }
 }

 static async handleFetchError(response: Response, context?: { endpoint?: string }): Promise<never> {
 let errorMessage = `HTTP ${response.status}: ${response.statusText}`
 let errorDetails: any = undefined

 try {
 const errorData = await response.json()
 errorMessage = errorData.error || errorData.message || errorMessage
 errorDetails = errorData
 } catch {

 }

 const error = new Error(errorMessage)
 ;(error as any).status = response.status
 ;(error as any).response = response
 ;(error as any).details = errorDetails

 errorReportingService.captureException(error, {
 component: 'fetch-error-handler',
 action: 'fetch-error'
 })

 throw error
 }

 static isRetryableError(error: any): boolean {
 if (error?.retryable !== undefined) {
 return error.retryable
 }

 const status = error?.status || error?.response?.status
 if (status) {

 return [408, 429, 500, 502, 503, 504].includes(status)
 }

 const message = error?.message || String(error)
 const retryablePatterns = [
 'network',
 'timeout',
 'connection',
 'fetch',
 'ECONNREFUSED',
 'ENOTFOUND',
 'ETIMEDOUT',
 'ECONNRESET'
 ]

 return retryablePatterns.some(pattern => 
 message.toLowerCase().includes(pattern.toLowerCase())
 )
 }
}