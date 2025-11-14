

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiCache, type RequestOptions } from '@/lib/api-cache';

export interface UseApiCacheOptions<T> extends RequestOptions {

 enabled?: boolean; // Whether to automatically fetch data
 refetchOnMount?: boolean; // Refetch when component mounts
 refetchOnWindowFocus?: boolean; // Refetch when window gains focus
 refetchInterval?: number; // Auto-refetch interval in milliseconds
 onSuccess?: (data: T) => void; // Success callback
 onError?: (error: Error) => void; // Error callback
 initialData?: T; // Initial data to use before first fetch
}

export interface UseApiCacheResult<T> {
 data: T | null;
 error: Error | null;
 isLoading: boolean;
 isValidating: boolean; // True when fetching in background
 mutate: (data?: T | ((current: T | null) => T)) => void; // Manually update data
 refetch: () => Promise<void>; // Manually refetch data
 invalidate: () => void; // Invalidate cache for this request
}

export function useApiCache<T = any>(
 url: string | null,
 options: UseApiCacheOptions<T> = {}
): UseApiCacheResult<T> {
 const {
 enabled = true,
 refetchOnMount = true,
 refetchOnWindowFocus = true,
 refetchInterval,
 onSuccess,
 onError,
 initialData,
 cacheConfig,
 ...fetchOptions
 } = options;

 const [data, setData] = useState<T | null>(initialData || null);
 const [error, setError] = useState<Error | null>(null);
 const [isLoading, setIsLoading] = useState<boolean>(false);
 const [isValidating, setIsValidating] = useState<boolean>(false);

 const abortControllerRef = useRef<AbortController | null>(null);
 const intervalRef = useRef<NodeJS.Timeout | null>(null);
 const mountedRef = useRef<boolean>(true);

 const cacheKey = url ? apiCache['getCacheKey'](url, fetchOptions) : null;

 const fetchData = useCallback(
 async (isBackground = false) => {
 if (!url || !enabled) return;

 if (abortControllerRef.current) {
 abortControllerRef.current.abort();
 }

 abortControllerRef.current = new AbortController();

 try {
 if (!isBackground) {
 setIsLoading(true);
 } else {
 setIsValidating(true);
 }
 setError(null);

 const result = await apiCache.fetch<T>(url, {
 ...fetchOptions,
 signal: abortControllerRef.current.signal,
 cacheConfig: {
 dedupe: true,
 staleWhileRevalidate: true,
 ...cacheConfig,
 },
 });

 if (mountedRef.current) {
 setData(result);
 onSuccess?.(result);
 }
 } catch (err: any) {
 if (err.name === 'AbortError') {
 return; // Request was cancelled, ignore
 }

 const error = err instanceof Error ? err : new Error(String(err));
 
 if (mountedRef.current) {
 setError(error);
 onError?.(error);
 }
 } finally {
 if (mountedRef.current) {
 setIsLoading(false);
 setIsValidating(false);
 }
 }
 },
 [url, enabled, fetchOptions, cacheConfig, onSuccess, onError]
 );

 const refetch = useCallback(async () => {
 if (url) {

 apiCache.invalidateKey(url, fetchOptions);
 await fetchData();
 }
 }, [url, fetchOptions, fetchData]);

 const mutate = useCallback(
 (newData?: T | ((current: T | null) => T)) => {
 if (typeof newData === 'function') {
 setData((current) => (newData as (current: T | null) => T)(current));
 } else if (newData !== undefined) {
 setData(newData);

 if (url) {
 apiCache.set(url, newData, fetchOptions);
 }
 } else {

 refetch();
 }
 },
 [url, fetchOptions, refetch]
 );

 const invalidate = useCallback(() => {
 if (url) {
 apiCache.invalidateKey(url, fetchOptions);
 }
 }, [url, fetchOptions]);

 useEffect(() => {
 if (enabled && url) {

 const cachedData = apiCache.get<T>(url, fetchOptions);
 if (cachedData) {
 setData(cachedData);

 if (refetchOnMount) {
 fetchData(true);
 }
 } else if (refetchOnMount) {
 fetchData();
 }
 }
 }, [url, enabled, refetchOnMount, fetchData, fetchOptions]);

 useEffect(() => {
 if (!refetchOnWindowFocus || !enabled || !url) return;

 const handleFocus = () => {
 fetchData(true);
 };

 window.addEventListener('focus', handleFocus);
 return () => window.removeEventListener('focus', handleFocus);
 }, [refetchOnWindowFocus, enabled, url, fetchData]);

 useEffect(() => {
 if (!refetchInterval || !enabled || !url) return;

 intervalRef.current = setInterval(() => {
 fetchData(true);
 }, refetchInterval);

 return () => {
 if (intervalRef.current) {
 clearInterval(intervalRef.current);
 }
 };
 }, [refetchInterval, enabled, url, fetchData]);

 useEffect(() => {
 mountedRef.current = true;
 
 return () => {
 mountedRef.current = false;
 if (abortControllerRef.current) {
 abortControllerRef.current.abort();
 }
 if (intervalRef.current) {
 clearInterval(intervalRef.current);
 }
 };
 }, []);

 return {
 data,
 error,
 isLoading,
 isValidating,
 mutate,
 refetch,
 invalidate,
 };
}

export function useNotifications(options: Omit<UseApiCacheOptions<any[]>, 'url'> = {}) {
 return useApiCache('/api/notifications', {
 cacheConfig: {
 maxAge: 2 * 60 * 1000, // 2 minutes
 staleWhileRevalidate: true,
 },
 refetchInterval: 30 * 1000, // 30 seconds
 ...options,
 });
}

export function useUserPreferences(options: Omit<UseApiCacheOptions<any>, 'url'> = {}) {
 return useApiCache('/api/user/preferences', {
 cacheConfig: {
 maxAge: 5 * 60 * 1000, // 5 minutes
 staleWhileRevalidate: true,
 },
 ...options,
 });
}

export function useCreatorAnalytics(
 timeRange?: string,
 options: Omit<UseApiCacheOptions<any>, 'url'> = {}
) {
 const url = timeRange 
 ? `/api/creator/analytics?timeRange=${timeRange}`
 : '/api/creator/analytics';
 
 return useApiCache(url, {
 cacheConfig: {
 maxAge: 5 * 60 * 1000, // 5 minutes
 staleWhileRevalidate: true,
 },
 ...options,
 });
}

export function useCreatorDashboard(options: Omit<UseApiCacheOptions<any>, 'url'> = {}) {
 return useApiCache('/api/creator/dashboard', {
 cacheConfig: {
 maxAge: 3 * 60 * 1000, // 3 minutes
 staleWhileRevalidate: true,
 },
 ...options,
 });
}