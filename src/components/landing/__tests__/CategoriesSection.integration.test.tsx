import { render, screen, waitFor } from '@testing-library/react';
import CategoriesSection from '../CategoriesSection';
import { Category } from '@/types';

global.fetch = jest.fn();

jest.mock('next/link', () => {
 return function MockLink({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) {
 return <a href={href} className={className}>{children}</a>;
 };
});

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
 description: 'Educational content',
 iconUrl: '/icons/education.svg',
 videoCount: 15,
 seriesCount: 8,
 isActive: true,
 displayOrder: 2,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01')
 },
 {
 id: '3',
 name: 'Music',
 slug: 'music',
 description: 'Music videos',
 iconUrl: '/icons/music.svg',
 videoCount: 20,
 seriesCount: 3,
 isActive: true,
 displayOrder: 3,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01')
 },
 {
 id: '4',
 name: 'Comedy',
 slug: 'comedy',
 description: 'Funny content',
 iconUrl: '/icons/comedy.svg',
 videoCount: 12,
 seriesCount: 2,
 isActive: true,
 displayOrder: 4,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01')
 }
];

describe('CategoriesSection Integration', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 it('should integrate with API and render categories correctly', async () => {
 (fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: true,
 data: mockCategories,
 count: mockCategories.length
 })
 });

 render(<CategoriesSection />);

 expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);

 await waitFor(() => {
 expect(screen.getByText('Entertainment')).toBeInTheDocument();
 });

 expect(screen.getByText('Entertainment')).toBeInTheDocument();
 expect(screen.getByText('Education')).toBeInTheDocument();
 expect(screen.getByText('Music')).toBeInTheDocument();
 expect(screen.getByText('Comedy')).toBeInTheDocument();

 expect(fetch).toHaveBeenCalledWith('/api/landing/categories');
 expect(fetch).toHaveBeenCalledTimes(1);
 });

 it('should handle API errors gracefully', async () => {
 (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

 render(<CategoriesSection />);

 await waitFor(() => {
 expect(screen.getByText('Unable to Load Categories')).toBeInTheDocument();
 });

 expect(screen.getByText('Network error')).toBeInTheDocument();
 expect(screen.getByText('Try Again')).toBeInTheDocument();
 });

 it('should respect limit prop and show view all link', async () => {
 (fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: true,
 data: mockCategories,
 count: mockCategories.length
 })
 });

 render(<CategoriesSection limit={2} />);

 await waitFor(() => {
 expect(screen.getByText('Entertainment')).toBeInTheDocument();
 });

 expect(screen.getByText('Entertainment')).toBeInTheDocument();
 expect(screen.getByText('Education')).toBeInTheDocument();
 expect(screen.queryByText('Music')).not.toBeInTheDocument();
 expect(screen.queryByText('Comedy')).not.toBeInTheDocument();

 const viewAllLink = screen.getByText('View All Categories');
 expect(viewAllLink).toBeInTheDocument();
 expect(viewAllLink.closest('a')).toHaveAttribute('href', '/discover');
 });

 it('should render category cards with correct navigation links', async () => {
 (fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: true,
 data: mockCategories.slice(0, 2),
 count: 2
 })
 });

 render(<CategoriesSection />);

 await waitFor(() => {
 expect(screen.getByText('Entertainment')).toBeInTheDocument();
 });

 const entertainmentLink = screen.getByText('Entertainment').closest('a');
 const educationLink = screen.getByText('Education').closest('a');

 expect(entertainmentLink).toHaveAttribute('href', '/discover?category=entertainment');
 expect(educationLink).toHaveAttribute('href', '/discover?category=education');
 });

 it('should display content counts correctly', async () => {
 (fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: true,
 data: mockCategories.slice(0, 1),
 count: 1
 })
 });

 render(<CategoriesSection />);

 await waitFor(() => {
 expect(screen.getByText('Entertainment')).toBeInTheDocument();
 });

 expect(screen.getByText('30')).toBeInTheDocument();
 expect(screen.getByText('items')).toBeInTheDocument();
 expect(screen.getByText('25 videos')).toBeInTheDocument();
 expect(screen.getByText('5 series')).toBeInTheDocument();
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

 render(<CategoriesSection />);

 await waitFor(() => {
 expect(screen.getByText('No Categories Available')).toBeInTheDocument();
 });

 expect(screen.getByText('Categories will appear here once content is added to the platform.')).toBeInTheDocument();
 });

 it('should render in responsive grid layout', async () => {
 (fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: true,
 data: mockCategories,
 count: mockCategories.length
 })
 });

 render(<CategoriesSection />);

 await waitFor(() => {
 expect(screen.getByText('Entertainment')).toBeInTheDocument();
 });

 const grid = document.querySelector('.grid');
 expect(grid).toHaveClass(
 'grid-cols-2',
 'md:grid-cols-3', 
 'lg:grid-cols-4',
 'xl:grid-cols-4'
 );
 });
});