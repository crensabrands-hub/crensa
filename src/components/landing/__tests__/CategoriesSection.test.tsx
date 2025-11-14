import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CategoriesSection from '../CategoriesSection';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types';

jest.mock('@/hooks/useCategories');
const mockUseCategories = useCategories as jest.MockedFunction<typeof useCategories>;

jest.mock('next/link', () => {
 return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
 return <a href={href}>{children}</a>;
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
 }
];

describe('CategoriesSection', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 it('should render categories successfully', () => {
 mockUseCategories.mockReturnValue({
 categories: mockCategories,
 loading: false,
 error: null,
 refetch: jest.fn()
 });

 render(<CategoriesSection />);

 expect(screen.getByText('Entertainment')).toBeInTheDocument();
 expect(screen.getByText('Education')).toBeInTheDocument();
 expect(screen.getByText('Music')).toBeInTheDocument();
 });

 it('should display loading skeleton when loading', () => {
 mockUseCategories.mockReturnValue({
 categories: [],
 loading: true,
 error: null,
 refetch: jest.fn()
 });

 render(<CategoriesSection />);

 const skeletonElements = document.querySelectorAll('.animate-pulse');
 expect(skeletonElements.length).toBeGreaterThan(0);
 });

 it('should display error state when there is an error', () => {
 const mockRefetch = jest.fn();
 mockUseCategories.mockReturnValue({
 categories: [],
 loading: false,
 error: 'Failed to fetch categories',
 refetch: mockRefetch
 });

 render(<CategoriesSection />);

 expect(screen.getByText('Unable to Load Categories')).toBeInTheDocument();
 expect(screen.getByText('Failed to fetch categories')).toBeInTheDocument();
 
 const retryButton = screen.getByText('Try Again');
 expect(retryButton).toBeInTheDocument();
 
 fireEvent.click(retryButton);
 expect(mockRefetch).toHaveBeenCalledTimes(1);
 });

 it('should display empty state when no categories are available', () => {
 mockUseCategories.mockReturnValue({
 categories: [],
 loading: false,
 error: null,
 refetch: jest.fn()
 });

 render(<CategoriesSection />);

 expect(screen.getByText('No Categories Available')).toBeInTheDocument();
 expect(screen.getByText('Categories will appear here once content is added to the platform.')).toBeInTheDocument();
 });

 it('should respect limit prop', () => {
 mockUseCategories.mockReturnValue({
 categories: mockCategories,
 loading: false,
 error: null,
 refetch: jest.fn()
 });

 render(<CategoriesSection limit={2} />);

 expect(screen.getByText('Entertainment')).toBeInTheDocument();
 expect(screen.getByText('Education')).toBeInTheDocument();
 expect(screen.queryByText('Music')).not.toBeInTheDocument();
 });

 it('should show "View All Categories" link when limit is applied and more categories exist', () => {
 mockUseCategories.mockReturnValue({
 categories: mockCategories,
 loading: false,
 error: null,
 refetch: jest.fn()
 });

 render(<CategoriesSection limit={2} />);

 const viewAllLink = screen.getByText('View All Categories');
 expect(viewAllLink).toBeInTheDocument();
 expect(viewAllLink.closest('a')).toHaveAttribute('href', '/discover');
 });

 it('should not show "View All Categories" link when all categories are displayed', () => {
 mockUseCategories.mockReturnValue({
 categories: mockCategories,
 loading: false,
 error: null,
 refetch: jest.fn()
 });

 render(<CategoriesSection limit={5} />);

 expect(screen.queryByText('View All Categories')).not.toBeInTheDocument();
 });

 it('should not show "View All Categories" link when no limit is set', () => {
 mockUseCategories.mockReturnValue({
 categories: mockCategories,
 loading: false,
 error: null,
 refetch: jest.fn()
 });

 render(<CategoriesSection />);

 expect(screen.queryByText('View All Categories')).not.toBeInTheDocument();
 });

 it('should apply custom className', () => {
 mockUseCategories.mockReturnValue({
 categories: mockCategories,
 loading: false,
 error: null,
 refetch: jest.fn()
 });

 const { container } = render(<CategoriesSection className="custom-class" />);
 expect(container.firstChild).toHaveClass('custom-class');
 });

 it('should render categories in a responsive grid', () => {
 mockUseCategories.mockReturnValue({
 categories: mockCategories,
 loading: false,
 error: null,
 refetch: jest.fn()
 });

 render(<CategoriesSection />);

 const grid = document.querySelector('.grid');
 expect(grid).toHaveClass('grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4', 'xl:grid-cols-4');
 });

 it('should handle refetch on error retry', async () => {
 const mockRefetch = jest.fn();
 mockUseCategories.mockReturnValue({
 categories: [],
 loading: false,
 error: 'Network error',
 refetch: mockRefetch
 });

 render(<CategoriesSection />);

 const retryButton = screen.getByText('Try Again');
 fireEvent.click(retryButton);

 expect(mockRefetch).toHaveBeenCalledTimes(1);
 });
});