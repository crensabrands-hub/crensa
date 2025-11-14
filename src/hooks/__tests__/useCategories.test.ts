import { renderHook, waitFor } from '@testing-library/react';
import { useCategories } from '../useCategories';
import { Category } from '@/types';

global.fetch = jest.fn();

const mockCategories: Category[] = [
 {
 id: '1',
 name: 'Entertainment',
 slug: 'entertainment',
 description: 'Fun and entertaining content',
 iconUrl: '/icons/entertainment.svg',
 videoCount: 25,
 seriesCount: 5,
 isActive: true,
 displayOrder: 1,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01')
 },
 {
 id: '2',
 name: 'Education',
 slug: 'education',
 description: 'Educational and learning content',
 iconUrl: '/icons/education.svg',
 videoCount: 15,
 seriesCount: 8,
 isActive: true,
 displayOrder: 2,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01')
 }
];

describe('useCategories', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 it('should fetch categories successfully', async () => {
 (fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: true,
 data: mockCategories,
 count: mockCategories.length
 })
 });

 const { result } = renderHook(() => useCategories());

 expect(result.current.loading).toBe(true);
 expect(result.current.categories).toEqual([]);
 expect(result.current.error).toBe(null);

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 expect(result.current.categories).toEqual(mockCategories);
 expect(result.current.error).toBe(null);
 expect(fetch).toHaveBeenCalledWith('/api/landing/categories');
 });

 it('should handle fetch error', async () => {
 const errorMessage = 'Failed to fetch categories: 500';
 (fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 status: 500
 });

 const { result } = renderHook(() => useCategories());

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 expect(result.current.categories).toEqual([]);
 expect(result.current.error).toBe(errorMessage);
 });

 it('should handle API error response', async () => {
 const errorMessage = 'Database connection failed';
 (fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: false,
 error: errorMessage
 })
 });

 const { result } = renderHook(() => useCategories());

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 expect(result.current.categories).toEqual([]);
 expect(result.current.error).toBe(errorMessage);
 });

 it('should handle network error', async () => {
 (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

 const { result } = renderHook(() => useCategories());

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 expect(result.current.categories).toEqual([]);
 expect(result.current.error).toBe('Network error');
 });

 it('should refetch categories when refetch is called', async () => {
 (fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: true,
 data: mockCategories,
 count: mockCategories.length
 })
 })
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: true,
 data: [...mockCategories, {
 id: '3',
 name: 'Music',
 slug: 'music',
 description: 'Music videos and performances',
 iconUrl: '/icons/music.svg',
 videoCount: 20,
 seriesCount: 3,
 isActive: true,
 displayOrder: 3,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01')
 }],
 count: 3
 })
 });

 const { result } = renderHook(() => useCategories());

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 expect(result.current.categories).toHaveLength(2);

 result.current.refetch();

 await waitFor(() => {
 expect(result.current.categories).toHaveLength(3);
 });

 expect(fetch).toHaveBeenCalledTimes(2);
 });

 it('should handle empty categories response', async () => {
 (fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: true,
 data: [],
 count: 0
 })
 });

 const { result } = renderHook(() => useCategories());

 await waitFor(() => {
 expect(result.current.loading).toBe(false);
 });

 expect(result.current.categories).toEqual([]);
 expect(result.current.error).toBe(null);
 });
});