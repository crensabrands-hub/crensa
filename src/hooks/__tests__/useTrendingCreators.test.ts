import { renderHook, waitFor } from '@testing-library/react';
import { useTrendingCreators } from '../useTrendingCreators';
import { TrendingCreator } from '@/types';

global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const mockCreators: TrendingCreator[] = [
 {
 id: '1',
 username: 'creator1',
 displayName: 'Creator One',
 avatar: '/images/creator1.jpg',
 followerCount: 15000,
 videoCount: 45,
 category: 'Entertainment',
 isVerified: true
 },
 {
 id: '2',
 username: 'creator2',
 displayName: 'Creator Two',
 avatar: '/images/creator2.jpg',
 followerCount: 8500,
 videoCount: 23,
 category: 'Education',
 isVerified: false
 }
];

describe('useTrendingCreators', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 it('fetches trending creators successfully', async () => {
 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: true,
 data: mockCreators
 })
 } as Response);

 const { result } = renderHook(() => useTrendingCreators(10));

 expect(result.current.loading).toBe(true);
 expect(result.current.creators).toEqual([]);
 expect(result.current.error).toBe(null);

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 expect(result.current.creators).toEqual(mockCreators);
 expect(result.current.error).toBe(null);
 expect(mockFetch).toHaveBeenCalledWith('/api/landing/trending-creators?limit=10');
 });

 it('handles fetch error', async () => {
 mockFetch.mockResolvedValueOnce({
 ok: false,
 status: 500
 } as Response);

 const { result } = renderHook(() => useTrendingCreators(10));

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 expect(result.current.creators).toEqual([]);
 expect(result.current.error).toBe('Failed to fetch trending creators: 500');
 });

 it('handles API error response', async () => {
 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: false,
 error: 'Database connection failed'
 })
 } as Response);

 const { result } = renderHook(() => useTrendingCreators(10));

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 expect(result.current.creators).toEqual([]);
 expect(result.current.error).toBe('Database connection failed');
 });

 it('handles network error', async () => {
 mockFetch.mockRejectedValueOnce(new Error('Network error'));

 const { result } = renderHook(() => useTrendingCreators(10));

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 expect(result.current.creators).toEqual([]);
 expect(result.current.error).toBe('Network error');
 });

 it('uses correct limit parameter', async () => {
 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: true,
 data: mockCreators
 })
 } as Response);

 renderHook(() => useTrendingCreators(5));

 await waitFor(() => {
 expect(mockFetch).toHaveBeenCalledWith('/api/landing/trending-creators?limit=5');
 });
 });

 it('uses default limit when not provided', async () => {
 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: true,
 data: mockCreators
 })
 } as Response);

 renderHook(() => useTrendingCreators());

 await waitFor(() => {
 expect(mockFetch).toHaveBeenCalledWith('/api/landing/trending-creators?limit=10');
 });
 });

 it('refetch function works correctly', async () => {
 mockFetch.mockResolvedValue({
 ok: true,
 json: async () => ({
 success: true,
 data: mockCreators
 })
 } as Response);

 const { result } = renderHook(() => useTrendingCreators(10));

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 mockFetch.mockClear();

 result.current.refetch();

 expect(result.current.loading).toBe(true);

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 expect(mockFetch).toHaveBeenCalledTimes(1);
 expect(mockFetch).toHaveBeenCalledWith('/api/landing/trending-creators?limit=10');
 });

 it('handles empty response data', async () => {
 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: true,
 data: null
 })
 } as Response);

 const { result } = renderHook(() => useTrendingCreators(10));

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 expect(result.current.creators).toEqual([]);
 expect(result.current.error).toBe(null);
 });

 it('logs errors to console', async () => {
 const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
 
 mockFetch.mockRejectedValueOnce(new Error('Test error'));

 renderHook(() => useTrendingCreators(10));

 await waitFor(() => {
 expect(consoleSpy).toHaveBeenCalledWith(
 'Error fetching trending creators:',
 expect.any(Error)
 );
 });

 consoleSpy.mockRestore();
 });
});