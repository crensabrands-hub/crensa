'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import { errorReportingService } from '@/lib/services/errorReportingService'

export interface ApiRetryConfig {
 maxRetries?: number
 baseDelay?: number
 maxDelay?: number
 backoffMultiplier?: number
 retryableStatuses?: number[]
 retryableErrors?: string[]
 onRetry?: (attempt: number, error: Error) => void
 onMaxRetriesReached?: (error: Error) => void
}

export interface ApiState<T> {
 data: T | null
 loading: boolean
 error: Error | null
 retryCount: number
 isRetrying: boolean
}

export interface ApiActions {
 retry: () => Promise<void>
 reset: () => void
 clearError: () => void
 execute: () => Promise<void>
}

const DEFAULT_CONFIG: Required<Omit<ApiRetryConfig, 'onRetry' | 'onMaxRetriesReached'>> = {
 maxRetries: 3,
 baseDelay: 1000,
 maxDelay: 10000,
 backoffMultiplier: 2,
 retryableStatuses: [401, 408, 429, 500, 502, 503, 504],
 retryableErrors: ['NetworkError', 'TimeoutError', 'AbortError', 'fetch']
}

export function useApiWithRetry<T>(
 apiCall: () => Promise<T>,
 config: ApiRetryConfig = {}
): [ApiState<T>, ApiActions] {
 const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config])
 const abortControllerRef = useRef<AbortController | null>(null)
 
 const [state, setState] = useState<ApiState<T>>({
 data: null,
 loading: false,
 error: null,
 retryCount: 0,
 isRetrying: false
 })

 const isRetryableError = useCallback((error: Error, status?: number): boolean => {

 if (status && finalConfig.retryableStatuses.includes(status)) {
 return true
 }

 const errorString = error.message || error.name || String(error)
 return finalConfig.retryableErrors.some(pattern => 
 errorString.toLowerCase().includes(pattern.toLowerCase())
 )
 }, [finalConfig.retryableErrors, finalConfig.retryableStatuses])

 const delay = useCallback((ms: number): Promise<void> => {
 return new Promise(resolve => setTimeout(resolve, ms))
 }, [])

 const calculateDelay = useCallback((attempt: number): number => {
 const exponentialDelay = finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt)
 return Math.min(exponentialDelay, finalConfig.maxDelay)
 }, [finalConfig.baseDelay, finalConfig.backoffMultiplier, finalConfig.maxDelay])

 const executeApiCall = useCallback(async (isRetry = false): Promise<void> => {

 if (abortControllerRef.current) {
 abortControllerRef.current.abort()
 }

 abortControllerRef.current = new AbortController()

 setState(prev => ({
 ...prev,
 loading: true,
 error: null,
 isRetrying: isRetry
 }))

 let lastError: Error | null = null
 let attempt = 0

 while (attempt <= finalConfig.maxRetries) {
 try {
 const result = await apiCall()
 
 setState(prev => ({
 ...prev,
 data: result,
 loading: false,
 error: null,
 isRetrying: false
 }))
 
 return
 } catch (error) {
 lastError = error as Error

 if (abortControllerRef.current?.signal.aborted) {
 setState(prev => ({
 ...prev,
 loading: false,
 isRetrying: false
 }))
 return
 }

 if (attempt === finalConfig.maxRetries) {
 break
 }

 const status = (error as any)?.status || (error as any)?.response?.status
 if (!isRetryableError(lastError, status)) {
 break
 }

 if (config.onRetry) {
 config.onRetry(attempt + 1, lastError)
 }

 errorReportingService.captureMessage(
 `API retry attempt ${attempt + 1}/${finalConfig.maxRetries}`,
 'low',
 {
 component: 'api-retry-hook',
 action: 'retry-attempt'
 }
 )

 const delayMs = calculateDelay(attempt)
 await delay(delayMs)

 attempt++
 setState(prev => ({
 ...prev,
 retryCount: attempt
 }))
 }
 }

 setState(prev => ({
 ...prev,
 loading: false,
 error: lastError,
 isRetrying: false
 }))

 if (lastError) {
 errorReportingService.captureException(lastError, {
 component: 'api-retry-hook',
 action: 'max-retries-reached'
 })

 if (config.onMaxRetriesReached) {
 config.onMaxRetriesReached(lastError)
 }
 }
 }, [apiCall, finalConfig, config, isRetryableError, calculateDelay, delay])

 const retry = useCallback(async (): Promise<void> => {
 if (state.loading || state.isRetrying) {
 return
 }

 setState(prev => ({
 ...prev,
 retryCount: 0
 }))

 await executeApiCall(true)
 }, [executeApiCall, state.loading, state.isRetrying])

 const reset = useCallback((): void => {
 if (abortControllerRef.current) {
 abortControllerRef.current.abort()
 }

 setState({
 data: null,
 loading: false,
 error: null,
 retryCount: 0,
 isRetrying: false
 })
 }, [])

 const clearError = useCallback((): void => {
 setState(prev => ({
 ...prev,
 error: null
 }))
 }, [])

 const execute = useCallback((): Promise<void> => {
 return executeApiCall(false)
 }, [executeApiCall])

 return [
 state,
 {
 retry,
 reset,
 clearError,
 execute
 }
 ]
}

export function useFetchWithRetry<T>(
 url: string | (() => string),
 options: RequestInit = {},
 config: ApiRetryConfig = {}
): [ApiState<T>, ApiActions] {
 const apiCall = useCallback(async (): Promise<T> => {
 const finalUrl = typeof url === 'function' ? url() : url
 const response = await fetch(finalUrl, {
 ...options,
 credentials: 'include'
 })
 
 if (!response.ok) {
 const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
 ;(error as any).status = response.status
 ;(error as any).response = response
 throw error
 }
 
 return response.json()
 }, [url, options])

 return useApiWithRetry<T>(apiCall, config)
}

export function useMultipleApiWithRetry<T extends Record<string, any>>(
 apiCalls: Record<keyof T, () => Promise<T[keyof T]>>,
 config: ApiRetryConfig = {}
): [Record<keyof T, ApiState<T[keyof T]>>, Record<keyof T, ApiActions>] {

 throw new Error('useMultipleApiWithRetry is not implemented. Use individual useApiWithRetry hooks instead.')
}