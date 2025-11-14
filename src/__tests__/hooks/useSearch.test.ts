import { renderHook, act, waitFor } from '@testing-library/react';
import { useSearch } from '@/hooks/useSearch';

global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const mockVideoResponse = {
 success: true,
 videos: [
 {
 id: '1',
 title: 'Test Video 1',
 thumbnailUrl: '/test-thumbnail.jpg',
 creator: {
 username: 'testcreator',
 displayName: 'Test Creator',
 },
 creditCost: 5,
 duration: 120,
 },
 {
 id: '2',
 title: 'Test Video 2',
 thumbnailUrl: '/test-thumbnail2.jpg',
 creator: {
 username: 'creator2',
 displayName: 'Creator Two',
 },
 creditCost: 3,
 duration: 90,
 },
 ],
};

describe('useSearch Hook', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 mockFetch.mockClear();
 });

 afterEach(() => {
 jest.clearAllTimers();
 });

 it('initializes with default state', () => {
 const { result } = renderHook(() => useSearch());

 expect(result.current.query).toBe('');
 expect(result.current.results).toEqual([]);
 expect(result.current.loading).toBe(false);
 expect(result.current.error).toBe(null);
 expect(result.current.isOpen).toBe(false);
 expect(result.current.selectedIndex).toBe(-1);
 });

 it('updates query and opens search when query length meets minimum', () => {
 const { result } = renderHook(() => useSearch({ minQueryLength: 2 }));

 act(() => {
 result.current.setQuery('te');
 });

 expect(result.current.query).toBe('te');
 expect(result.current.isOpen).toBe(true);
 });

 it('does not open search when query is too short', () => {
 const { result } = renderHook(() => useSearch({ minQueryLength: 2 }));

 act(() => {
 result.current.setQuery('t');
 });

 expect(result.current.query).toBe('t');
 expect(result.current.isOpen).toBe(false);
 });

 it('performs search with debouncing', async () => {
 jest.useFakeTimers();
 
 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => mockVideoResponse,
 } as Response);

 const { result } = renderHook(() => useSearch({ debounceMs: 300, minQueryLength: 2 }));

 act(() => {
 result.current.setQuery('test');
 });

 expect(result.current.loading).toBe(false);
 expect(mockFetch).not.toHaveBeenCalled();

 act(() => {
 jest.advanceTimersByTime(300);
 });

 await waitFor(() => {
 expect(result.current.loading).toBe(true);
 });

 await waitFor(() => {
 expect(mockFetch).toHaveBeenCalledWith(
 '/api/discover/videos?search=test&limit=10&page=1',
 expect.any(Object)
 );
 });

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 expect(result.current.results).toHaveLength(2);
 expect(result.current.results[0].title).toBe('Test Video 1');
 });

 jest.useRealTimers();
 });

 it('handles search API errors', async () => {
 jest.useFakeTimers();
 
 mockFetch.mockRejectedValueOnce(new Error('Network error'));

 const { result } = renderHook(() => useSearch({ debounceMs: 300, minQueryLength: 2 }));

 act(() => {
 result.current.setQuery('test');
 });

 act(() => {
 jest.advanceTimersByTime(300);
 });

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 expect(result.current.error).toBe('Network error');
 expect(result.current.results).toEqual([]);
 });

 jest.useRealTimers();
 });

 it('handles API response errors', async () => {
 jest.useFakeTimers();
 
 mockFetch.mockResolvedValueOnce({
 ok: false,
 status: 500,
 statusText: 'Internal Server Error',
 } as Response);

 const { result } = renderHook(() => useSearch({ debounceMs: 300, minQueryLength: 2 }));

 act(() => {
 result.current.setQuery('test');
 });

 act(() => {
 jest.advanceTimersByTime(300);
 });

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 expect(result.current.error).toBe('Search failed: 500 Internal Server Error');
 expect(result.current.results).toEqual([]);
 });

 jest.useRealTimers();
 });

 it('clears results correctly', () => {
 const { result } = renderHook(() => useSearch());

 act(() => {
 result.current.setQuery('test');
 });

 act(() => {
 result.current.clearResults();
 });

 expect(result.current.query).toBe('');
 expect(result.current.results).toEqual([]);
 expect(result.current.loading).toBe(false);
 expect(result.current.error).toBe(null);
 expect(result.current.isOpen).toBe(false);
 expect(result.current.selectedIndex).toBe(-1);
 });

 it('handles keyboard navigation correctly', async () => {
 jest.useFakeTimers();
 
 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: true,
 videos: [
 { id: '1', title: 'Result 1', creator: { username: 'user1', displayName: 'User 1' } },
 { id: '2', title: 'Result 2', creator: { username: 'user2', displayName: 'User 2' } },
 ],
 }),
 } as Response);

 const { result } = renderHook(() => useSearch({ debounceMs: 300, minQueryLength: 2 }));

 act(() => {
 result.current.setQuery('test');
 });

 act(() => {
 jest.advanceTimersByTime(300);
 });

 await waitFor(() => {
 expect(result.current.results).toHaveLength(2);
 });

 act(() => {
 result.current.handleKeyboardNavigation('down');
 });
 expect(result.current.selectedIndex).toBe(0);

 act(() => {
 result.current.handleKeyboardNavigation('down');
 });
 expect(result.current.selectedIndex).toBe(1);

 act(() => {
 result.current.handleKeyboardNavigation('down');
 });
 expect(result.current.selectedIndex).toBe(0);

 act(() => {
 result.current.handleKeyboardNavigation('up');
 });
 expect(result.current.selectedIndex).toBe(1);

 act(() => {
 result.current.handleKeyboardNavigation('escape');
 });
 expect(result.current.isOpen).toBe(false);
 expect(result.current.selectedIndex).toBe(-1);

 jest.useRealTimers();
 });

 it('cancels previous requests when new search is initiated', async () => {
 jest.useFakeTimers();
 
 const abortSpy = jest.fn();
 const mockAbortController = {
 abort: abortSpy,
 signal: {} as AbortSignal,
 };
 
 jest.spyOn(global, 'AbortController').mockImplementation(() => mockAbortController as any);

 mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

 const { result } = renderHook(() => useSearch({ debounceMs: 300, minQueryLength: 2 }));

 act(() => {
 result.current.setQuery('test1');
 });

 act(() => {
 jest.advanceTimersByTime(300);
 });

 act(() => {
 result.current.setQuery('test2');
 });

 act(() => {
 jest.advanceTimersByTime(300);
 });

 expect(abortSpy).toHaveBeenCalled();

 jest.useRealTimers();
 });

 it('transforms video data to search results correctly', async () => {
 jest.useFakeTimers();
 
 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => mockVideoResponse,
 } as Response);

 const { result } = renderHook(() => useSearch({ debounceMs: 300, minQueryLength: 2 }));

 act(() => {
 result.current.setQuery('test');
 });

 act(() => {
 jest.advanceTimersByTime(300);
 });

 await waitFor(() => {
 expect(result.current.results).toHaveLength(2);
 
 const firstResult = result.current.results[0];
 expect(firstResult.id).toBe('1');
 expect(firstResult.title).toBe('Test Video 1');
 expect(firstResult.type).toBe('video');
 expect(firstResult.url).toBe('/watch/1');
 expect(firstResult.thumbnail).toBe('/test-thumbnail.jpg');
 expect(firstResult.creditCost).toBe(5);
 expect(firstResult.duration).toBe(120);
 expect(firstResult.creator?.username).toBe('testcreator');
 });

 jest.useRealTimers();
 });
});