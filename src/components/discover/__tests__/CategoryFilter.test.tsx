import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoryFilter from '../CategoryFilter';

global.fetch = jest.fn();

const mockCategories = [
 { id: 'dance', name: 'Dance', icon: '💃', videoCount: 5, color: 'bg-accent-pink' },
 { id: 'comedy', name: 'Comedy', icon: '😂', videoCount: 3, color: 'bg-primary-neon-yellow' },
 { id: 'education', name: 'Education', icon: '📚', videoCount: 7, color: 'bg-accent-teal' },
];

describe('CategoryFilter', () => {
 const mockOnCategoryChange = jest.fn();

 beforeEach(() => {
 jest.clearAllMocks();
 (fetch as jest.Mock).mockResolvedValue({
 ok: true,
 json: async () => mockCategories,
 });
 });

 it('renders all categories button and fetched categories', async () => {
 render(
 <CategoryFilter
 selectedCategory={undefined}
 onCategoryChange={mockOnCategoryChange}
 />
 );

 expect(screen.getByText('All Categories')).toBeInTheDocument();

 await waitFor(() => {
 expect(screen.getByText('Dance')).toBeInTheDocument();
 expect(screen.getByText('Comedy')).toBeInTheDocument();
 expect(screen.getByText('Education')).toBeInTheDocument();
 });

 expect(screen.getByText('(5)')).toBeInTheDocument();
 expect(screen.getByText('(3)')).toBeInTheDocument();
 expect(screen.getByText('(7)')).toBeInTheDocument();
 });

 it('calls onCategoryChange when category is selected', async () => {
 render(
 <CategoryFilter
 selectedCategory={undefined}
 onCategoryChange={mockOnCategoryChange}
 />
 );

 await waitFor(() => {
 expect(screen.getByText('Dance')).toBeInTheDocument();
 });

 fireEvent.click(screen.getByText('Dance'));

 expect(mockOnCategoryChange).toHaveBeenCalledWith('dance');
 });

 it('deselects category when clicking selected category', async () => {
 render(
 <CategoryFilter
 selectedCategory="dance"
 onCategoryChange={mockOnCategoryChange}
 />
 );

 await waitFor(() => {
 expect(screen.getByText('Dance')).toBeInTheDocument();
 });

 fireEvent.click(screen.getByText('Dance'));

 expect(mockOnCategoryChange).toHaveBeenCalledWith(undefined);
 });

 it('shows selected category info', async () => {
 render(
 <CategoryFilter
 selectedCategory="dance"
 onCategoryChange={mockOnCategoryChange}
 />
 );

 await waitFor(() => {
 expect(screen.getByText('Showing 5 videos in Dance')).toBeInTheDocument();
 });
 });

 it('handles API error gracefully', async () => {
 (fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

 render(
 <CategoryFilter
 selectedCategory={undefined}
 onCategoryChange={mockOnCategoryChange}
 />
 );

 await waitFor(() => {
 expect(screen.getByText('Dance')).toBeInTheDocument();
 expect(screen.getByText('Comedy')).toBeInTheDocument();
 });
 });

 it('shows loading state initially', () => {
 render(
 <CategoryFilter
 selectedCategory={undefined}
 onCategoryChange={mockOnCategoryChange}
 />
 );

 const skeletons = screen.getAllByRole('generic');
 expect(skeletons.some(el => el.className.includes('animate-pulse'))).toBe(true);
 });

 it('disables buttons when isLoading is true', async () => {
 render(
 <CategoryFilter
 selectedCategory={undefined}
 onCategoryChange={mockOnCategoryChange}
 isLoading={true}
 />
 );

 await waitFor(() => {
 expect(screen.getByText('Dance')).toBeInTheDocument();
 });

 const danceButton = screen.getByText('Dance').closest('button');
 expect(danceButton).toBeDisabled();
 });
});