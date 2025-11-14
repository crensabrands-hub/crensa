import { renderHook, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { useFeaturedContent } from '../useFeaturedContent';
import { FeaturedContent } from '@/types';

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

const mockFeaturedContent: FeaturedContent[] = [
 {
 id: '1',
 type: 'video',
 title: 'Test Video',
 description: 'Test description',
 imageUrl: '/test.jpg',
 creatorName: 'Test Creator',
 creatorAvatar: '/avatar.jpg',
 category: 'Test',
 href: '/watch/1'
 }
];

describe('useFeaturedContent', () => {
 beforeEach(() => {
 mockFetch.mockClear();
 });

 it('fetches featured content successfully', async () => {
 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: true,
 data: mockFeaturedContent,
 count: 1
 })
 } as Response);

 const { result } = renderHook(() => useFeaturedContent(5));

 expect(result.current.loading).toBe(true);
 expect(result.current.featuredContent).toEqual([]);
 expect(result.current.error).toBe(null);

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 expect(result.current.featuredContent).toEqual(mockFeaturedContent);
 expect(result.current.error).toBe(null);
 expect(mockFetch).toHaveBeenCalledWith('/api/landing/featured?limit=5');
 });

 it('handles fetch error', async () => {
 mockFetch.mockResolvedValueOnce({
 ok: false,
 status: 500
 } as Response);

 const { result } = renderHook(() => useFeaturedContent(5));

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 expect(result.current.featuredContent).toEqual([]);
 expect(result.current.error).toBe('Failed to fetch featured content: 500');
 });

 it('handles API error response', async () => {
 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: false,
 error: 'Database connection failed'
 })
 } as Response);

 const { result } = renderHook(() => useFeaturedContent(5));

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 expect(result.current.featuredContent).toEqual([]);
 expect(result.current.error).toBe('Database connection failed');
 });

 it('handles network error', async () => {
 mockFetch.mockRejectedValueOnce(new Error('Network error'));

 const { result } = renderHook(() => useFeaturedContent(5));

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 expect(result.current.featuredContent).toEqual([]);
 expect(result.current.error).toBe('Network error');
 });

 it('uses custom limit parameter', async () => {
 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: true,
 data: mockFeaturedContent,
 count: 1
 })
 } as Response);

 renderHook(() => useFeaturedContent(10));

 await waitFor(() => {
 expect(mockFetch).toHaveBeenCalledWith('/api/landing/featured?limit=10');
 });
 });

 it('refetch function works correctly', async () => {
 mockFetch.mockResolvedValue({
 ok: true,
 json: async () => ({
 success: true,
 data: mockFeaturedContent,
 count: 1
 })
 } as Response);

 const { result } = renderHook(() => useFeaturedContent(5));

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 mockFetch.mockClear();

 result.current.refetch();

 await waitFor(() => {
 expect(mockFetch).toHaveBeenCalledWith('/api/landing/featured?limit=5');
 });
 });
});