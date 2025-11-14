import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchFilters, { SearchFilters as SearchFiltersType, CategoryFilter } from '../SearchFilters';

jest.mock('next/navigation', () => ({
 useRouter: jest.fn(),
 useSearchParams: jest.fn(),
}));

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 },
 AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockRouter = {
 replace: jest.fn(),
 push: jest.fn(),
};

const mockSearchParams = {
 get: jest.fn(),
};

const mockCategories: CategoryFilter[] = [
 { id: 'entertainment', name: 'Entertainment', icon: '🎬', videoCount: 245, color: 'bg-accent-pink' },
 { id: 'education', name: 'Education', icon: '📚', videoCount: 189, color: 'bg-accent-teal' },
 { id: 'music', name: 'Music', icon: '🎵', videoCount: 156, color: 'bg-accent-green' },
];

const defaultProps = {
 onFiltersChange: jest.fn(),
 onSearchChange: jest.fn(),
 initialFilters: {},
 initialSearchQuery: '',
 categories: mockCategories,
 isLoading: false,
};

describe('SearchFilters', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 (useRouter as jest.Mock).mockReturnValue(mockRouter);
 (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
 mockSearchParams.get.mockReturnValue(null);
 });

 it('renders search input correctly', () => {
 render(<SearchFilters {...defaultProps} />);
 
 const searchInput = screen.getByPlaceholderText('Search for videos, creators, or topics...');
 expect(searchInput).toBeInTheDocument();
 });

 it('renders category filters correctly', () => {
 render(<SearchFilters {...defaultProps} />);
 
 expect(screen.getByText('All Categories')).toBeInTheDocument();
 expect(screen.getByText('Entertainment')).toBeInTheDocument();
 expect(screen.getByText('Education')).toBeInTheDocument();
 expect(screen.getByText('Music')).toBeInTheDocument();
 });

 it('renders sort options correctly', () => {
 render(<SearchFilters {...defaultProps} />);
 
 const sortSelect = screen.getByDisplayValue('🔥 Trending');
 expect(sortSelect).toBeInTheDocument();
 });

 it('handles search input with debouncing', async () => {
 const onSearchChange = jest.fn();
 const onFiltersChange = jest.fn();
 
 render(
 <SearchFilters 
 {...defaultProps} 
 onSearchChange={onSearchChange}
 onFiltersChange={onFiltersChange}
 />
 );
 
 const searchInput = screen.getByPlaceholderText('Search for videos, creators, or topics...');
 fireEvent.change(searchInput, { target: { value: 'test query' } });

 expect(onSearchChange).not.toHaveBeenCalled();

 await waitFor(() => {
 expect(onSearchChange).toHaveBeenCalledWith('test query');
 }, { timeout: 500 });
 });

 it('handles category selection', () => {
 const onFiltersChange = jest.fn();
 
 render(
 <SearchFilters 
 {...defaultProps} 
 onFiltersChange={onFiltersChange}
 />
 );
 
 const entertainmentButton = screen.getByText('Entertainment');
 fireEvent.click(entertainmentButton);
 
 expect(onFiltersChange).toHaveBeenCalledWith(
 expect.objectContaining({
 category: 'entertainment',
 searchQuery: '',
 })
 );
 });

 it('handles sort selection', () => {
 const onFiltersChange = jest.fn();
 
 render(
 <SearchFilters 
 {...defaultProps} 
 onFiltersChange={onFiltersChange}
 />
 );
 
 const sortSelect = screen.getByDisplayValue('🔥 Trending');
 fireEvent.change(sortSelect, { target: { value: 'newest' } });
 
 expect(onFiltersChange).toHaveBeenCalledWith(
 expect.objectContaining({
 sortBy: 'newest',
 searchQuery: '',
 })
 );
 });

 it('shows advanced filters when toggle is clicked', () => {
 render(<SearchFilters {...defaultProps} />);
 
 const filtersButton = screen.getByText('Filters');
 fireEvent.click(filtersButton);
 
 expect(screen.getByText('Duration')).toBeInTheDocument();
 expect(screen.getByText(/Credit Cost:/)).toBeInTheDocument();
 });

 it('handles duration filter selection', () => {
 const onFiltersChange = jest.fn();
 
 render(
 <SearchFilters 
 {...defaultProps} 
 onFiltersChange={onFiltersChange}
 />
 );

 const filtersButton = screen.getByText('Filters');
 fireEvent.click(filtersButton);

 const shortButton = screen.getByText('Short (< 2 min)');
 fireEvent.click(shortButton);
 
 expect(onFiltersChange).toHaveBeenCalledWith(
 expect.objectContaining({
 duration: 'short',
 searchQuery: '',
 })
 );
 });

 it('handles credit range changes', () => {
 const onFiltersChange = jest.fn();
 
 render(
 <SearchFilters 
 {...defaultProps} 
 onFiltersChange={onFiltersChange}
 />
 );

 const filtersButton = screen.getByText('Filters');
 fireEvent.click(filtersButton);

 const minSlider = screen.getAllByRole('slider')[0];
 fireEvent.change(minSlider, { target: { value: '3' } });
 
 expect(onFiltersChange).toHaveBeenCalledWith(
 expect.objectContaining({
 creditRange: [3, 10],
 searchQuery: '',
 })
 );
 });

 it('clears all filters when clear button is clicked', () => {
 const onFiltersChange = jest.fn();
 const onSearchChange = jest.fn();
 
 render(
 <SearchFilters 
 {...defaultProps} 
 onFiltersChange={onFiltersChange}
 onSearchChange={onSearchChange}
 initialFilters={{ category: 'entertainment' }}
 initialSearchQuery="test"
 />
 );
 
 const clearButton = screen.getByText('Clear all');
 fireEvent.click(clearButton);
 
 expect(onSearchChange).toHaveBeenCalledWith('');
 expect(onFiltersChange).toHaveBeenCalledWith({ searchQuery: '' });
 expect(mockRouter.replace).toHaveBeenCalledWith('/discover', { scroll: false });
 });

 it('shows active filters count', async () => {
 render(
 <SearchFilters 
 {...defaultProps} 
 initialFilters={{ category: 'entertainment', sortBy: 'newest' }}
 initialSearchQuery="test"
 />
 );

 await waitFor(() => {
 const filtersButton = screen.getByText('Filters');
 const badge = filtersButton.querySelector('.bg-primary-neon-yellow');
 expect(badge).toHaveTextContent('3'); // search + category + sort (newest is not default)
 });
 });

 it('initializes from URL parameters', () => {
 mockSearchParams.get.mockImplementation((param: string) => {
 switch (param) {
 case 'q': return 'test search';
 case 'category': return 'entertainment';
 case 'sort': return 'newest';
 case 'duration': return 'short';
 case 'minCredits': return '2';
 case 'maxCredits': return '8';
 default: return null;
 }
 });
 
 const onFiltersChange = jest.fn();
 const onSearchChange = jest.fn();
 
 render(
 <SearchFilters 
 {...defaultProps} 
 onFiltersChange={onFiltersChange}
 onSearchChange={onSearchChange}
 />
 );

 expect(screen.getByText('Duration')).toBeInTheDocument();
 });

 it('disables inputs when loading', () => {
 render(<SearchFilters {...defaultProps} isLoading={true} />);
 
 const searchInput = screen.getByPlaceholderText('Search for videos, creators, or topics...');
 const sortSelect = screen.getByDisplayValue('🔥 Trending');
 
 expect(searchInput).toBeDisabled();
 expect(sortSelect).toBeDisabled();
 });

 it('shows active filters summary', async () => {
 render(
 <SearchFilters 
 {...defaultProps} 
 initialFilters={{ 
 category: 'entertainment', 
 duration: 'short',
 sortBy: 'newest',
 creditRange: [2, 8]
 }}
 initialSearchQuery="test query"
 />
 );

 await waitFor(() => {
 expect(screen.getByText('Active filters:')).toBeInTheDocument();
 });
 
 expect(screen.getByText('Search: "test query"')).toBeInTheDocument();

 const activeFiltersSection = screen.getByText('Active filters:').parentElement;
 expect(activeFiltersSection).toHaveTextContent('Entertainment');
 expect(activeFiltersSection).toHaveTextContent('Short (< 2 min)');
 expect(activeFiltersSection).toHaveTextContent('Newest');
 expect(activeFiltersSection).toHaveTextContent('2-8 credits');
 });
});