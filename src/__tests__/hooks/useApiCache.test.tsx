

import { renderHook, act, waitFor } from '@testing-library/react';
import { useApiCache, useNotifications, useUserPreferences } from '@/hooks/useApiCache';
import { apiCache } from '@/lib/api-cache';

jest.mock('@/lib/api-cache', () => ({
 apiCache: {
 fetch: jest.fn(),
 invalidateKey: jest.fn(),
 set: jest.fn(),
 get: jest.fn(),
 },
}));

const mockApiCache = apiCache as jest.Mocked<typeof apiCache>;

describe('useApiCache', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 describe('Basic functionality', () => {
 it('should fetch data on mount', async () => {
 const mockData = { id: 1, name: 'Test' };
 mockApiCache.fetch.mockResolvedValueOnce(mockData);

 const { result } = renderHook(() =>
 useApiCache('/api/test', { enabled: true })
 );

 expect(result.current.isLoading).toBe(true);
 expect(result.current.data).toBeNull();

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false);
 });

 expect(result.current.data).toEqual(mockData);
 expect(result.current.error).toBeNull();
 expect(mockApiCache.fetch).toHaveBeenCalledWith('/api/test', expect.any(Object));
 });

 it('should not fetch when disabled', () => {
 const { result } = renderHook(() =>
 useApiCache('/api/test', { enabled: false })
 );

 expect(result.current.isLoading).toBe(false);
 expect(mockApiCache.fetch).not.toHaveBeenCalled();
 });

 it('should not fetch when url is null', () => {
 const { result } = renderHook(() =>
 useApiCache(null, { enabled: true })
 );

 expect(result.current.isLoading).toBe(false);
 expect(mockApiCache.fetch).not.toHaveBeenCalled();
 });

 it('should use initial data', () => {
 const initialData = { id: 1, name: 'Initial' };
 
 const { result } = renderHook(() =>
 useApiCache('/api/test', { 
 enabled: false,
 initialData 
 })
 );

 expect(result.current.data).toEqual(initialData);
 });
 });

 describe('Error handling', () => {
 it('should handle fetch errors', async () => {
 const error = new Error('Fetch failed');
 mockApiCache.fetch.mockRejectedValueOnce(error);

 const { result } = renderHook(() =>
 useApiCache('/api/test', { enabled: true })
 );

 await waitFor(() => {
 expect(result.current.isLoading).toBe(false);
 });

 expect(result.current.error).toEqual(error);
 expect(result.current.data).toBeNull();
 });

 it('should call onError callback', async () => {
 const error = new Error('Fetch failed');
 const onError = jest.fn();
 mockApiCache.fetch.mockRejectedValueOnce(error);

 renderHook(() =>
 useApiCache('/api/test', { 
 enabled: true,
 onError 
 })
 );

 await waitFor(() => {
 expect(onError).toHaveBeenCalledWith(error);
 });
 });
 });

 describe('Success handling', () => {
 it('should call onSuccess callback', async () => {
 const mockData = { id: 1, name: 'Test' };
 const onSuccess = jest.fn();
 mockApiCache.fetch.mockResolvedValueOnce(mockData);

 renderHook(() =>
 useApiCache('/api/test', { 
 enabled: true,
 onSuccess 
 })
 );

 await waitFor(() => {
 expect(onSuccess).toHaveBeenCalledWith(mockData);
 });
 });
 });

 describe('Cached data handling', () => {
 it('should use cached data and fetch in background', async () => {
 const cachedData = { id: 1, name: 'Cached' };
 const freshData = { id: 1, name: 'Fresh' };
 
 mockApiCache.get.mockReturnValueOnce(cachedData);
 mockApiCache.fetch.mockResolvedValueOnce(freshData);

 const { result } = renderHook(() =>
 useApiCache('/api/test', { 
 enabled: true,
 refetchOnMount: true 
 })
 );

 expect(result.current.data).toEqual(cachedData);
 expect(result.current.isValidating).toBe(true);

 await waitFor(() => {
 expect(result.current.isValidating).toBe(false);
 });

 expect(result.current.data).toEqual(freshData);
 });

 it('should not fetch in background when refetchOnMount is false', () => {
 const cachedData = { id: 1, name: 'Cached' };
 
 mockApiCache.get.mockReturnValueOnce(cachedData);

 const { result } = renderHook(() =>
 useApiCache('/api/test', { 
 enabled: true,
 refetchOnMount: false 
 })
 );

 expect(result.current.data).toEqual(cachedData);
 expect(result.current.isValidating).toBe(false);
 expect(mockApiCache.fetch).not.toHaveBeenCalled();
 });
 });

 describe('Manual operations', () => {
 it('should support manual refetch', async () => {
 const initialData = { id: 1, name: 'Initial' };
 const refetchedData = { id: 1, name: 'Refetched' };
 
 mockApiCache.fetch
 .mockResolvedValueOnce(initialData)
 .mockResolvedValueOnce(refetchedData);

 const { result } = renderHook(() =>
 useApiCache('/api/test', { enabled: true })
 );

 await waitFor(() => {
 expect(result.current.data).toEqual(initialData);
 });

 act(() => {
 result.current.refetch();
 });

 await waitFor(() => {
 expect(result.current.data).toEqual(refetchedData);
 });

 expect(mockApiCache.invalidateKey).toHaveBeenCalledWith('/api/test', expect.any(Object));
 expect(mockApiCache.fetch).toHaveBeenCalledTimes(2);
 });

 it('should support optimistic updates with mutate', () => {
 const initialData = { id: 1, name: 'Initial' };
 const updatedData = { id: 1, name: 'Updated' };
 
 mockApiCache.fetch.mockResolvedValueOnce(initialData);

 const { result } = renderHook(() =>
 useApiCache('/api/test', { enabled: true })
 );

 act(() => {
 result.current.mutate(updatedData);
 });

 expect(result.current.data).toEqual(updatedData);
 expect(mockApiCache.set).toHaveBeenCalledWith('/api/test', updatedData, expect.any(Object));
 });

 it('should support functional updates with mutate', () => {
 const initialData = { id: 1, name: 'Initial' };
 
 mockApiCache.fetch.mockResolvedValueOnce(initialData);

 const { result } = renderHook(() =>
 useApiCache('/api/test', { enabled: true })
 );

 act(() => {
 result.current.mutate((current) => 
 current ? { ...current, name: 'Updated' } : { id: 1, name: 'Updated' }
 );
 });

 expect(result.current.data).toEqual({ id: 1, name: 'Updated' });
 });

 it('should support cache invalidation', () => {
 const { result } = renderHook(() =>
 useApiCache('/api/test', { enabled: false })
 );

 act(() => {
 result.current.invalidate();
 });

 expect(mockApiCache.invalidateKey).toHaveBeenCalledWith('/api/test', expect.any(Object));
 });
 });

 describe('Window focus refetch', () => {
 it('should refetch on window focus when enabled', async () => {
 const initialData = { id: 1, name: 'Initial' };
 const focusData = { id: 1, name: 'Focus' };
 
 mockApiCache.fetch
 .mockResolvedValueOnce(initialData)
 .mockResolvedValueOnce(focusData);

 renderHook(() =>
 useApiCache('/api/test', { 
 enabled: true,
 refetchOnWindowFocus: true 
 })
 );

 await waitFor(() => {
 expect(mockApiCache.fetch).toHaveBeenCalledTimes(1);
 });

 act(() => {
 window.dispatchEvent(new Event('focus'));
 });

 await waitFor(() => {
 expect(mockApiCache.fetch).toHaveBeenCalledTimes(2);
 });
 });

 it('should not refetch on window focus when disabled', async () => {
 const initialData = { id: 1, name: 'Initial' };
 
 mockApiCache.fetch.mockResolvedValueOnce(initialData);

 renderHook(() =>
 useApiCache('/api/test', { 
 enabled: true,
 refetchOnWindowFocus: false 
 })
 );

 await waitFor(() => {
 expect(mockApiCache.fetch).toHaveBeenCalledTimes(1);
 });

 act(() => {
 window.dispatchEvent(new Event('focus'));
 });

 expect(mockApiCache.fetch).toHaveBeenCalledTimes(1);
 });
 });

 describe('Interval refetch', () => {
 beforeEach(() => {
 jest.useFakeTimers();
 });

 afterEach(() => {
 jest.useRealTimers();
 });

 it('should refetch at specified intervals', async () => {
 const mockData = { id: 1, name: 'Test' };
 mockApiCache.fetch.mockResolvedValue(mockData);

 renderHook(() =>
 useApiCache('/api/test', { 
 enabled: true,
 refetchInterval: 1000 // 1 second
 })
 );

 await waitFor(() => {
 expect(mockApiCache.fetch).toHaveBeenCalledTimes(1);
 });

 act(() => {
 jest.advanceTimersByTime(1000);
 });

 await waitFor(() => {
 expect(mockApiCache.fetch).toHaveBeenCalledTimes(2);
 });

 act(() => {
 jest.advanceTimersByTime(1000);
 });

 await waitFor(() => {
 expect(mockApiCache.fetch).toHaveBeenCalledTimes(3);
 });
 });
 });
});

describe('Specialized hooks', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 describe('useNotifications', () => {
 it('should use correct endpoint and cache config', () => {
 const mockData = [{ id: 1, message: 'Test notification' }];
 mockApiCache.fetch.mockResolvedValueOnce(mockData);

 renderHook(() => useNotifications());

 expect(mockApiCache.fetch).toHaveBeenCalledWith('/api/notifications', 
 expect.objectContaining({
 cacheConfig: expect.objectContaining({
 maxAge: 2 * 60 * 1000, // 2 minutes
 staleWhileRevalidate: true,
 }),
 })
 );
 });
 });

 describe('useUserPreferences', () => {
 it('should use correct endpoint and cache config', () => {
 const mockData = { notifications: { email: true } };
 mockApiCache.fetch.mockResolvedValueOnce(mockData);

 renderHook(() => useUserPreferences());

 expect(mockApiCache.fetch).toHaveBeenCalledWith('/api/user/preferences', 
 expect.objectContaining({
 cacheConfig: expect.objectContaining({
 maxAge: 5 * 60 * 1000, // 5 minutes
 staleWhileRevalidate: true,
 }),
 })
 );
 });
 });

 describe('useCreatorAnalytics', () => {
 it('should use correct endpoint without time range', () => {
 const mockData = { views: 1000, earnings: 500 };
 mockApiCache.fetch.mockResolvedValueOnce(mockData);

 renderHook(() => useCreatorAnalytics());

 expect(mockApiCache.fetch).toHaveBeenCalledWith('/api/creator/analytics', 
 expect.objectContaining({
 cacheConfig: expect.objectContaining({
 maxAge: 5 * 60 * 1000, // 5 minutes
 staleWhileRevalidate: true,
 }),
 })
 );
 });

 it('should use correct endpoint with time range', () => {
 const mockData = { views: 1000, earnings: 500 };
 mockApiCache.fetch.mockResolvedValueOnce(mockData);

 renderHook(() => useCreatorAnalytics('7d'));

 expect(mockApiCache.fetch).toHaveBeenCalledWith('/api/creator/analytics?timeRange=7d', 
 expect.objectContaining({
 cacheConfig: expect.objectContaining({
 maxAge: 5 * 60 * 1000, // 5 minutes
 staleWhileRevalidate: true,
 }),
 })
 );
 });
 });

 describe('useCreatorDashboard', () => {
 it('should use correct endpoint and cache config', () => {
 const mockData = { totalVideos: 10, totalViews: 5000 };
 mockApiCache.fetch.mockResolvedValueOnce(mockData);

 renderHook(() => useCreatorDashboard());

 expect(mockApiCache.fetch).toHaveBeenCalledWith('/api/creator/dashboard', 
 expect.objectContaining({
 cacheConfig: expect.objectContaining({
 maxAge: 3 * 60 * 1000, // 3 minutes
 staleWhileRevalidate: true,
 }),
 })
 );
 });
 });
});