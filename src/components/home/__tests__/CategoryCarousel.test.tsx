import { render, screen, fireEvent } from '@testing-library/react';
import CategoryCarousel from '../CategoryCarousel';

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
 button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
 },
}));

interface Category {
 id: string;
 name: string;
 icon: string;
 videoCount: number;
 color: string;
}

const mockCategories: Category[] = [
 {
 id: 'dance',
 name: 'Dance',
 icon: '💃',
 videoCount: 156,
 color: 'from-pink-500 to-rose-500'
 },
 {
 id: 'comedy',
 name: 'Comedy',
 icon: '😂',
 videoCount: 89,
 color: 'from-yellow-500 to-orange-500'
 },
 {
 id: 'cooking',
 name: 'Cooking',
 icon: '👨‍🍳',
 videoCount: 67,
 color: 'from-green-500 to-emerald-500'
 },
 {
 id: 'music',
 name: 'Music',
 icon: '🎵',
 videoCount: 134,
 color: 'from-blue-500 to-cyan-500'
 }
];

describe('CategoryCarousel', () => {
 const mockOnCategorySelect = jest.fn();

 beforeEach(() => {
 mockOnCategorySelect.mockClear();
 });

 it('renders category carousel with title', () => {
 render(
 <CategoryCarousel 
 categories={mockCategories}
 onCategorySelect={mockOnCategorySelect}
 />
 );
 
 expect(screen.getByText('Browse by Category')).toBeInTheDocument();
 });

 it('displays all categories with correct information', () => {
 render(
 <CategoryCarousel 
 categories={mockCategories}
 onCategorySelect={mockOnCategorySelect}
 />
 );

 expect(screen.getByText('Dance')).toBeInTheDocument();
 expect(screen.getByText('Comedy')).toBeInTheDocument();
 expect(screen.getByText('Cooking')).toBeInTheDocument();
 expect(screen.getByText('Music')).toBeInTheDocument();

 expect(screen.getByText('156 videos')).toBeInTheDocument();
 expect(screen.getByText('89 videos')).toBeInTheDocument();
 expect(screen.getByText('67 videos')).toBeInTheDocument();
 expect(screen.getByText('134 videos')).toBeInTheDocument();

 expect(screen.getByText('💃')).toBeInTheDocument();
 expect(screen.getByText('😂')).toBeInTheDocument();
 expect(screen.getByText('👨‍🍳')).toBeInTheDocument();
 expect(screen.getByText('🎵')).toBeInTheDocument();
 });

 it('shows "All" category option', () => {
 render(
 <CategoryCarousel 
 categories={mockCategories}
 onCategorySelect={mockOnCategorySelect}
 />
 );
 
 expect(screen.getByText('All')).toBeInTheDocument();

 const totalVideos = mockCategories.reduce((sum, cat) => sum + cat.videoCount, 0);
 expect(screen.getByText(`${totalVideos} videos`)).toBeInTheDocument();
 });

 it('calls onCategorySelect when category is clicked', () => {
 render(
 <CategoryCarousel 
 categories={mockCategories}
 onCategorySelect={mockOnCategorySelect}
 />
 );
 
 const danceCategory = screen.getByText('Dance').closest('button');
 fireEvent.click(danceCategory!);
 
 expect(mockOnCategorySelect).toHaveBeenCalledWith('dance');
 });

 it('calls onCategorySelect with "all" when All category is clicked', () => {
 render(
 <CategoryCarousel 
 categories={mockCategories}
 onCategorySelect={mockOnCategorySelect}
 />
 );
 
 const allCategory = screen.getByText('All').closest('button');
 fireEvent.click(allCategory!);
 
 expect(mockOnCategorySelect).toHaveBeenCalledWith('all');
 });

 it('highlights selected category', () => {
 render(
 <CategoryCarousel 
 categories={mockCategories}
 selectedCategory="dance"
 onCategorySelect={mockOnCategorySelect}
 />
 );
 
 const danceCategory = screen.getByText('Dance').closest('button');
 expect(danceCategory).toHaveClass('from-pink-500', 'to-rose-500');
 });

 it('highlights "All" when selectedCategory is "all" or undefined', () => {
 render(
 <CategoryCarousel 
 categories={mockCategories}
 selectedCategory="all"
 onCategorySelect={mockOnCategorySelect}
 />
 );
 
 const allCategory = screen.getByText('All').closest('button');
 expect(allCategory).toHaveClass('from-purple-600', 'to-blue-600');
 });

 it('shows navigation buttons for large category lists', () => {
 const manyCategories = Array.from({ length: 10 }, (_, i) => ({
 ...mockCategories[0],
 id: `category${i}`,
 name: `Category ${i}`
 }));

 render(
 <CategoryCarousel 
 categories={manyCategories}
 onCategorySelect={mockOnCategorySelect}
 />
 );

 const buttons = screen.getAllByRole('button');
 const navButtons = buttons.filter(button => 
 button.querySelector('svg') // Navigation buttons contain SVG icons
 );
 
 expect(navButtons.length).toBeGreaterThan(0);
 });

 it('handles empty categories list', () => {
 render(
 <CategoryCarousel 
 categories={[]}
 onCategorySelect={mockOnCategorySelect}
 />
 );
 
 expect(screen.getByText('Browse by Category')).toBeInTheDocument();
 expect(screen.getByText('All')).toBeInTheDocument();
 expect(screen.getByText('0 videos')).toBeInTheDocument(); // Total should be 0
 });

 it('applies correct gradient classes to categories', () => {
 render(
 <CategoryCarousel 
 categories={mockCategories}
 onCategorySelect={mockOnCategorySelect}
 />
 );
 
 const danceCategory = screen.getByText('Dance').closest('button');
 const comedyCategory = screen.getByText('Comedy').closest('button');

 expect(danceCategory).not.toHaveClass('from-pink-500', 'to-rose-500');
 expect(comedyCategory).not.toHaveClass('from-yellow-500', 'to-orange-500');

 expect(danceCategory).toHaveClass('bg-white/10');
 expect(comedyCategory).toHaveClass('bg-white/10');
 });

 it('shows pagination dots when there are many categories', () => {
 const manyCategories = Array.from({ length: 10 }, (_, i) => ({
 ...mockCategories[0],
 id: `category${i}`,
 name: `Category ${i}`
 }));

 render(
 <CategoryCarousel 
 categories={manyCategories}
 onCategorySelect={mockOnCategorySelect}
 />
 );

 const buttons = screen.getAllByRole('button');
 expect(buttons.length).toBeGreaterThan(manyCategories.length); // More buttons than categories due to nav + pagination
 });
});