

import { backgroundRefresh, refreshStrategies, refreshHelpers } from '@/lib/background-refresh';
import { apiCache } from '@/lib/api-cache';

jest.mock('@/lib/api-cache', () => ({
 apiCache: {
 fetch: jest.fn(),
 get: jest.fn(),
 },
}));

const mockApiCache = apiCache as jest.Mocked<typeof apiCache>;

Object.defineProperty(document, 'hidden', {
 writable: true,
 value: false,
});

Object.defineProperty(document, 'hasFocus', {
 writable: true,
 value: jest.fn(() => true),
});

Object.defineProperty(navigator, 'onLine', {
 writable: true,
 value: true,
});

jest.useFakeTimers();

describe('BackgroundRefreshManager', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 jest.clearAllTimers();

 backgroundRefresh.pauseAll();

 const stats = backgroundRefresh.getStats();
 stats.configs.forEach(config => {
 backgroundRefresh.unregister(config.url);
 });

 document.hidden = false;
 navigator.onLine = true;

 mockApiCache.fetch.mockResolvedValue({ data: 'test' });
 mockApiCache.get.mockReturnValue(null);
 });

 afterEach(() => {
 backgroundRefresh.pauseAll();

 const stats = backgroundRefresh.getStats();
 stats.configs.forEach(config => {
 backgroundRefresh.unregister(config.url);
 });
 });

 describe('Basic registration and unregistration', () => {
 it('should register and start background refresh', () => {
 const config = {
 url: '/api/test',
 strategy: refreshStrategies.frequent,
 };

 backgroundRefresh.register(config);

 const stats = backgroundRefresh.getStats();
 expect(stats.registeredUrls).toBe(1);
 expect(stats.activeTimers).toBe(1);
 });

 it('should unregister and stop background refresh', () => {
 const config = {
 url: '/api/test',
 strategy: refreshStrategies.frequent,
 };

 backgroundRefresh.register(config);
 backgroundRefresh.unregister('/api/test');

 const stats = backgroundRefresh.getStats();
 expect(stats.registeredUrls).toBe(0);
 expect(stats.activeTimers).toBe(0);
 });

 it('should handle multiple registrations', () => {
 const configs = [
 { url: '/api/test1', strategy: refreshStrategies.frequent },
 { url: '/api/test2', strategy: refreshStrategies.periodic },
 { url: '/api/test3', strategy: refreshStrategies.realTime },
 ];

 configs.forEach(config => backgroundRefresh.register(config));

 const stats = backgroundRefresh.getStats();
 expect(stats.registeredUrls).toBe(3);
 expect(stats.activeTimers).toBe(3);
 });
 });

 describe('Refresh intervals', () => {
 it('should respect different refresh intervals', async () => {
 const onSuccess = jest.fn();
 
 backgroundRefresh.register({
 url: '/api/test',
 strategy: { ...refreshStrategies.frequent, interval: 1000 }, // 1 second for testing
 onSuccess,
 });

 jest.advanceTimersByTime(1000);
 await Promise.resolve(); // Allow promises to resolve

 expect(mockApiCache.fetch).toHaveBeenCalledTimes(1);

 jest.advanceTimersByTime(1000);
 await Promise.resolve();

 expect(mockApiCache.fetch).toHaveBeenCalledTimes(2);
 });

 it('should adjust intervals based on visibility', () => {
 backgroundRefresh.register({
 url: '/api/test',
 strategy: { ...refreshStrategies.frequent, interval: 1000 },
 });

 document.hidden = true;
 document.dispatchEvent(new Event('visibilitychange'));

 const stats = backgroundRefresh.getStats();

 expect(stats.registeredUrls).toBe(1);
 });

 it('should adjust intervals based on priority', () => {
 const highPriorityConfig = {
 url: '/api/high',
 strategy: { ...refreshStrategies.realTime, priority: 'high' as const },
 };

 const lowPriorityConfig = {
 url: '/api/low',
 strategy: { ...refreshStrategies.realTime, priority: 'low' as const },
 };

 backgroundRefresh.register(highPriorityConfig);
 backgroundRefresh.register(lowPriorityConfig);

 const stats = backgroundRefresh.getStats();
 expect(stats.registeredUrls).toBe(2);
 
 const highPriorityEntry = stats.configs.find(c => c.url === '/api/high');
 const lowPriorityEntry = stats.configs.find(c => c.url === '/api/low');
 
 expect(highPriorityEntry?.priority).toBe('high');
 expect(lowPriorityEntry?.priority).toBe('low');
 });
 });

 describe('Conditional refresh', () => {
 it('should respect custom conditions', async () => {
 let shouldRefresh = false;
 
 backgroundRefresh.register({
 url: '/api/test',
 strategy: {
 ...refreshStrategies.frequent,
 interval: 1000,
 condition: () => shouldRefresh,
 },
 });

 jest.advanceTimersByTime(1000);
 await Promise.resolve();

 expect(mockApiCache.fetch).not.toHaveBeenCalled();

 shouldRefresh = true;
 jest.advanceTimersByTime(1000);
 await Promise.resolve();

 expect(mockApiCache.fetch).toHaveBeenCalledTimes(1);
 });

 it('should not refresh when offline', async () => {
 backgroundRefresh.register({
 url: '/api/test',
 strategy: { ...refreshStrategies.frequent, interval: 1000 },
 });

 navigator.onLine = false;
 window.dispatchEvent(new Event('offline'));

 jest.advanceTimersByTime(1000);
 await Promise.resolve();

 expect(mockApiCache.fetch).not.toHaveBeenCalled();
 });
 });

 describe('Error handling', () => {
 it('should handle fetch errors gracefully', async () => {
 const onError = jest.fn();
 const error = new Error('Fetch failed');
 
 mockApiCache.fetch.mockRejectedValueOnce(error);

 backgroundRefresh.register({
 url: '/api/test',
 strategy: { ...refreshStrategies.frequent, interval: 1000 },
 onError,
 });

 jest.advanceTimersByTime(1000);
 await Promise.resolve();

 expect(onError).toHaveBeenCalledWith(error);
 });

 it('should continue refreshing after errors', async () => {
 mockApiCache.fetch
 .mockRejectedValueOnce(new Error('First error'))
 .mockResolvedValueOnce({ data: 'success' });

 backgroundRefresh.register({
 url: '/api/test',
 strategy: { ...refreshStrategies.frequent, interval: 1000 },
 });

 jest.advanceTimersByTime(1000);
 await Promise.resolve();

 jest.advanceTimersByTime(1000);
 await Promise.resolve();

 expect(mockApiCache.fetch).toHaveBeenCalledTimes(2);
 });
 });

 describe('Pause and resume', () => {
 it('should pause all refreshes', () => {
 backgroundRefresh.register({
 url: '/api/test1',
 strategy: refreshStrategies.frequent,
 });

 backgroundRefresh.register({
 url: '/api/test2',
 strategy: refreshStrategies.periodic,
 });

 let stats = backgroundRefresh.getStats();
 expect(stats.activeTimers).toBe(2);

 backgroundRefresh.pauseAll();

 stats = backgroundRefresh.getStats();
 expect(stats.activeTimers).toBe(0);
 expect(stats.registeredUrls).toBe(2); // Still registered
 });

 it('should resume all refreshes', () => {
 backgroundRefresh.register({
 url: '/api/test1',
 strategy: refreshStrategies.frequent,
 });

 backgroundRefresh.register({
 url: '/api/test2',
 strategy: refreshStrategies.periodic,
 });

 backgroundRefresh.pauseAll();
 backgroundRefresh.resumeAll();

 const stats = backgroundRefresh.getStats();
 expect(stats.activeTimers).toBe(2);
 expect(stats.registeredUrls).toBe(2);
 });
 });

 describe('Force refresh', () => {
 it('should force refresh specific URL', async () => {
 backgroundRefresh.register({
 url: '/api/test',
 strategy: refreshStrategies.frequent,
 });

 await backgroundRefresh.forceRefresh('/api/test');

 expect(mockApiCache.fetch).toHaveBeenCalledWith('/api/test', expect.any(Object));
 });

 it('should force refresh all registered URLs', async () => {
 backgroundRefresh.register({
 url: '/api/test1',
 strategy: refreshStrategies.frequent,
 });

 backgroundRefresh.register({
 url: '/api/test2',
 strategy: refreshStrategies.periodic,
 });

 await backgroundRefresh.forceRefreshAll();

 expect(mockApiCache.fetch).toHaveBeenCalledTimes(2);
 expect(mockApiCache.fetch).toHaveBeenCalledWith('/api/test1', expect.any(Object));
 expect(mockApiCache.fetch).toHaveBeenCalledWith('/api/test2', expect.any(Object));
 });
 });

 describe('Visibility and online state handling', () => {
 it('should handle visibility changes', () => {
 backgroundRefresh.register({
 url: '/api/test',
 strategy: refreshStrategies.frequent,
 });

 document.hidden = true;
 document.dispatchEvent(new Event('visibilitychange'));

 const stats = backgroundRefresh.getStats();
 expect(stats.registeredUrls).toBe(1);
 });

 it('should handle online/offline events', async () => {
 backgroundRefresh.register({
 url: '/api/test',
 strategy: refreshStrategies.frequent,
 });

 navigator.onLine = false;
 window.dispatchEvent(new Event('offline'));

 navigator.onLine = true;
 window.dispatchEvent(new Event('online'));

 await Promise.resolve();

 expect(mockApiCache.fetch).toHaveBeenCalled();
 });
 });
});

describe('Refresh helpers', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 backgroundRefresh.pauseAll();

 const stats = backgroundRefresh.getStats();
 stats.configs.forEach(config => {
 backgroundRefresh.unregister(config.url);
 });
 });

 afterEach(() => {
 backgroundRefresh.pauseAll();

 const stats = backgroundRefresh.getStats();
 stats.configs.forEach(config => {
 backgroundRefresh.unregister(config.url);
 });
 });

 it('should register notifications refresh', () => {
 const onSuccess = jest.fn();
 const onError = jest.fn();

 refreshHelpers.notifications(onSuccess, onError);

 const stats = backgroundRefresh.getStats();
 expect(stats.registeredUrls).toBe(1);
 
 const config = stats.configs.find(c => c.url === '/api/notifications');
 expect(config).toBeDefined();
 expect(config?.priority).toBe('high');
 });

 it('should register preferences refresh', () => {
 refreshHelpers.preferences();

 const stats = backgroundRefresh.getStats();
 expect(stats.registeredUrls).toBe(1);
 
 const config = stats.configs.find(c => c.url === '/api/user/preferences');
 expect(config).toBeDefined();
 expect(config?.priority).toBe('medium');
 });

 it('should register analytics refresh with time range', () => {
 refreshHelpers.analytics('30d');

 const stats = backgroundRefresh.getStats();
 expect(stats.registeredUrls).toBe(1);
 
 const config = stats.configs.find(c => c.url === '/api/creator/analytics?timeRange=30d');
 expect(config).toBeDefined();
 expect(config?.priority).toBe('low');
 });

 it('should register dashboard refresh', () => {
 refreshHelpers.dashboard();

 const stats = backgroundRefresh.getStats();
 expect(stats.registeredUrls).toBe(1);
 
 const config = stats.configs.find(c => c.url === '/api/creator/dashboard');
 expect(config).toBeDefined();
 expect(config?.priority).toBe('medium');
 });
});