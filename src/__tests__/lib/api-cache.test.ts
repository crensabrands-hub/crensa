

import { apiCache, cachedFetch, cacheInvalidation } from '@/lib/api-cache';

global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

Object.defineProperty(window, 'addEventListener', {
 value: jest.fn(),
 writable: true,
});

describe('APICache', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 apiCache.clearCache();

 mockFetch.mockResolvedValue({
 ok: true,
 status: 200,
 json: async () => ({ data: 'test' }),
 headers: new Headers(),
 } as Response);
 });

 describe('Basic caching', () => {
 it('should cache successful responses', async () => {
 const url = '/api/test';
 const expectedData = { data: 'test' };

 mockFetch.mockResolvedValueOnce({
 ok: true,
 status: 200,
 json: async () => expectedData,
 headers: new Headers(),
 } as Response);

 const result1 = await cachedFetch(url);
 expect(result1).toEqual(expectedData);
 expect(mockFetch).toHaveBeenCalledTimes(1);

 const result2 = await cachedFetch(url);
 expect(result2).toEqual(expectedData);
 expect(mockFetch).toHaveBeenCalledTimes(1); // Still only 1 call
 });

 it('should respect cache maxAge', async () => {
 const url = '/api/test';
 const expectedData = { data: 'test' };

 mockFetch.mockResolvedValue({
 ok: true,
 status: 200,
 json: async () => expectedData,
 headers: new Headers(),
 } as Response);

 await cachedFetch(url, {
 cacheConfig: { maxAge: 100 }, // 100ms
 });
 expect(mockFetch).toHaveBeenCalledTimes(1);

 await cachedFetch(url, {
 cacheConfig: { maxAge: 100 },
 });
 expect(mockFetch).toHaveBeenCalledTimes(1);

 await new Promise(resolve => setTimeout(resolve, 150));

 await cachedFetch(url, {
 cacheConfig: { maxAge: 100 },
 });
 expect(mockFetch).toHaveBeenCalledTimes(2);
 });

 it('should handle different cache keys for different requests', async () => {
 const url1 = '/api/test1';
 const url2 = '/api/test2';
 const data1 = { data: 'test1' };
 const data2 = { data: 'test2' };

 mockFetch
 .mockResolvedValueOnce({
 ok: true,
 status: 200,
 json: async () => data1,
 headers: new Headers(),
 } as Response)
 .mockResolvedValueOnce({
 ok: true,
 status: 200,
 json: async () => data2,
 headers: new Headers(),
 } as Response);

 const result1 = await cachedFetch(url1);
 const result2 = await cachedFetch(url2);

 expect(result1).toEqual(data1);
 expect(result2).toEqual(data2);
 expect(mockFetch).toHaveBeenCalledTimes(2);
 });
 });

 describe('Request deduplication', () => {
 it('should deduplicate simultaneous requests', async () => {
 const url = '/api/test';
 const expectedData = { data: 'test' };

 mockFetch.mockImplementation(
 () =>
 new Promise(resolve =>
 setTimeout(
 () =>
 resolve({
 ok: true,
 status: 200,
 json: async () => expectedData,
 headers: new Headers(),
 } as Response),
 100
 )
 )
 );

 const promises = [
 cachedFetch(url, { cacheConfig: { dedupe: true } }),
 cachedFetch(url, { cacheConfig: { dedupe: true } }),
 cachedFetch(url, { cacheConfig: { dedupe: true } }),
 ];

 const results = await Promise.all(promises);

 results.forEach(result => {
 expect(result).toEqual(expectedData);
 });

 expect(mockFetch).toHaveBeenCalledTimes(1);
 });

 it('should not deduplicate when disabled', async () => {
 const url = '/api/test';
 const expectedData = { data: 'test' };

 mockFetch.mockResolvedValue({
 ok: true,
 status: 200,
 json: async () => expectedData,
 headers: new Headers(),
 } as Response);

 await Promise.all([
 cachedFetch(url, { cacheConfig: { dedupe: false } }),
 cachedFetch(url, { cacheConfig: { dedupe: false } }),
 cachedFetch(url, { cacheConfig: { dedupe: false } }),
 ]);

 expect(mockFetch).toHaveBeenCalledTimes(3);
 });
 });

 describe('Stale-while-revalidate', () => {
 it('should return stale data while fetching fresh data', async () => {
 const url = '/api/test';
 const staleData = { data: 'stale' };
 const freshData = { data: 'fresh' };

 mockFetch.mockResolvedValueOnce({
 ok: true,
 status: 200,
 json: async () => staleData,
 headers: new Headers(),
 } as Response);

 await cachedFetch(url, {
 cacheConfig: { maxAge: 100, staleWhileRevalidate: true },
 });

 await new Promise(resolve => setTimeout(resolve, 150));

 mockFetch.mockResolvedValueOnce({
 ok: true,
 status: 200,
 json: async () => freshData,
 headers: new Headers(),
 } as Response);

 const result = await cachedFetch(url, {
 cacheConfig: { maxAge: 100, staleWhileRevalidate: true },
 });

 expect(result).toEqual(staleData); // Should get stale data immediately
 expect(mockFetch).toHaveBeenCalledTimes(2); // Background fetch should have started
 });
 });

 describe('Error handling', () => {
 it('should throw errors for failed requests', async () => {
 const url = '/api/test';

 mockFetch.mockResolvedValueOnce({
 ok: false,
 status: 404,
 statusText: 'Not Found',
 headers: new Headers(),
 } as Response);

 await expect(cachedFetch(url)).rejects.toThrow('HTTP 404: Not Found');
 });

 it('should return stale data on error if available', async () => {
 const url = '/api/test';
 const staleData = { data: 'stale' };

 mockFetch.mockResolvedValueOnce({
 ok: true,
 status: 200,
 json: async () => staleData,
 headers: new Headers(),
 } as Response);

 await cachedFetch(url, {
 cacheConfig: { staleWhileRevalidate: true },
 });

 mockFetch.mockResolvedValueOnce({
 ok: false,
 status: 500,
 statusText: 'Internal Server Error',
 headers: new Headers(),
 } as Response);

 const result = await cachedFetch(url, {
 cacheConfig: { staleWhileRevalidate: true },
 });

 expect(result).toEqual(staleData);
 });
 });

 describe('Cache invalidation', () => {
 it('should invalidate cache by pattern', async () => {
 const urls = ['/api/user/123', '/api/user/456', '/api/posts/789'];
 const data = { data: 'test' };

 mockFetch.mockResolvedValue({
 ok: true,
 status: 200,
 json: async () => data,
 headers: new Headers(),
 } as Response);

 await Promise.all(urls.map(url => cachedFetch(url)));
 expect(mockFetch).toHaveBeenCalledTimes(3);

 mockFetch.mockClear();
 mockFetch.mockResolvedValue({
 ok: true,
 status: 200,
 json: async () => data,
 headers: new Headers(),
 } as Response);

 apiCache.invalidate('/api/user');

 await cachedFetch('/api/user/123');
 await cachedFetch('/api/user/456');
 expect(mockFetch).toHaveBeenCalledTimes(2);

 await cachedFetch('/api/posts/789');
 expect(mockFetch).toHaveBeenCalledTimes(2); // Still 2, no new request
 });

 it('should invalidate specific cache entries', async () => {
 const url = '/api/test';
 const data = { data: 'test' };

 mockFetch.mockResolvedValue({
 ok: true,
 status: 200,
 json: async () => data,
 headers: new Headers(),
 } as Response);

 await cachedFetch(url);
 expect(mockFetch).toHaveBeenCalledTimes(1);

 mockFetch.mockClear();

 apiCache.invalidateKey(url);

 await cachedFetch(url);
 expect(mockFetch).toHaveBeenCalledTimes(1);
 });
 });

 describe('Cache invalidation helpers', () => {
 it('should invalidate user cache', () => {
 const invalidateSpy = jest.spyOn(apiCache, 'invalidate');
 
 cacheInvalidation.user('123');
 expect(invalidateSpy).toHaveBeenCalledWith('/api/user/123');

 cacheInvalidation.user();
 expect(invalidateSpy).toHaveBeenCalledWith('/api/user');
 });

 it('should invalidate notifications cache', () => {
 const invalidateSpy = jest.spyOn(apiCache, 'invalidate');
 
 cacheInvalidation.notifications();
 expect(invalidateSpy).toHaveBeenCalledWith('/api/notifications');
 });

 it('should invalidate preferences cache', () => {
 const invalidateSpy = jest.spyOn(apiCache, 'invalidate');
 
 cacheInvalidation.preferences();
 expect(invalidateSpy).toHaveBeenCalledWith('/api/user/preferences');
 });

 it('should clear all cache', () => {
 const clearSpy = jest.spyOn(apiCache, 'clearCache');
 
 cacheInvalidation.all();
 expect(clearSpy).toHaveBeenCalled();
 });
 });

 describe('Manual cache operations', () => {
 it('should allow manual cache setting', () => {
 const url = '/api/test';
 const data = { data: 'manual' };

 apiCache.set(url, data);
 const result = apiCache.get(url);

 expect(result).toEqual(data);
 });

 it('should return null for non-existent cache entries', () => {
 const result = apiCache.get('/api/nonexistent');
 expect(result).toBeNull();
 });

 it('should provide cache statistics', async () => {
 const url = '/api/test';
 const data = { data: 'test' };

 mockFetch.mockResolvedValueOnce({
 ok: true,
 status: 200,
 json: async () => data,
 headers: new Headers(),
 } as Response);

 await cachedFetch(url);

 const stats = apiCache.getStats();
 expect(stats.cacheSize).toBe(1);
 expect(stats.entries).toHaveLength(1);
 expect(stats.entries[0].key).toContain(url);
 });
 });
});