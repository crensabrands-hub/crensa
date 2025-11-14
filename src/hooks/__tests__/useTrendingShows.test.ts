import { renderHook, waitFor } from '@testing-library/react';
import { useTrendingShows } from '../useTrendingShows';
import { TrendingShow } from '@/types';

global.fetch = jest.fn();

const mockTrendingShows: TrendingShow[] = [
 {
 id: '1',
 type: 'video',
 title: 'Amazing Video',
 thumbnailUrl: 'https://example.com/thumb1.jpg',
 creatorName: 'Creator One',
 creatorId: 'creator1',
 viewCount: 1500,
 duration: 300,
 price: 10,
 trendingScore: 85,
 recentViews: 150,
 category: 'Entertainment'
 },
 {
 id: '2',
 type: 'series',
 title: 'Epic Series',
 thumbnailUrl: 'https://example.com/thumb2.jpg',
 creatorName: 'Creator Two',
 creatorId: 'creator2',
 viewCount: 5000,
 videoCount: 8,
 price: 50,
 trendingScore: 92,
 recentViews: 500,
 category: 'Education'
 }
];

describe('useTrendingShows', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 it('should fetch trending shows successfully', async () => {
 (fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: true,
 data: mockTrendingShows,
 count: 2
 })
 });

 const { result } = renderHook(() => useTrendingShows(10));

 expect(result.current.loading).toBe(true);
 expect(result.current.trendingShows).toEqual([]);
 expect(result.current.error).toBe(null);

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 expect(result.current.trendingShows).toEqual(mockTrendingShows);
 expect(result.current.error).toBe(null);
 expect(fetch).toHaveBeenCalledWith('/api/landing/trending-shows?limit=10');
 });

 it('should handle API errors', async () => {
 (fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 status: 500
 });

 const { result } = renderHook(() => useTrendingShows());

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 expect(result.current.trendingShows).toEqual([]);
 expect(result.current.error).toBe('Failed to fetch trending shows: 500');
 });

 it('should handle network errors', async () => {
 (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

 const { result } = renderHook(() => useTrendingShows());

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 expect(result.current.trendingShows).toEqual([]);
 expect(result.current.error).toBe('Network error');
 });

 it('should handle API response with success: false', async () => {
 (fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: false,
 error: 'Server error'
 })
 });

 const { result } = renderHook(() => useTrendingShows());

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 expect(result.current.trendingShows).toEqual([]);
 expect(result.current.error).toBe('Server error');
 });

 it('should refetch data when refetch is called', async () => {
 (fetch as jest.Mock).mockResolvedValue({
 ok: true,
 json: async () => ({
 success: true,
 data: mockTrendingShows,
 count: 2
 })
 });

 const { result } = renderHook(() => useTrendingShows());

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 expect(fetch).toHaveBeenCalledTimes(1);

 result.current.refetch();

 await waitFor(() => {
 expect(fetch).toHaveBeenCalledTimes(2);
 });
 });

 it('should use custom limit parameter', async () => {
 (fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: true,
 data: [],
 count: 0
 })
 });

 renderHook(() => useTrendingShows(5));

 await waitFor(() => {
 expect(fetch).toHaveBeenCalledWith('/api/landing/trending-shows?limit=5');
 });
 });
});