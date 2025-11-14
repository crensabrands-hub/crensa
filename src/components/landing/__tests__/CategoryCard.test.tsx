import { render, screen, fireEvent } from '@testing-library/react';
import CategoryCard from '../CategoryCard';
import { Category } from '@/types';

jest.mock('next/link', () => {
 return function MockLink({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) {
 return <a href={href} className={className}>{children}</a>;
 };
});

const mockCategory: Category = {
 id: '1',
 name: 'Entertainment',
 slug: 'entertainment',
 description: 'Fun and entertaining content for everyone',
 iconUrl: '/icons/entertainment.svg',
 videoCount: 25,
 seriesCount: 5,
 isActive: true,
 displayOrder: 1,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01')
};

describe('CategoryCard', () => {
 it('should render category information correctly', () => {
 render(<CategoryCard category={mockCategory} />);

 expect(screen.getByText('Entertainment')).toBeInTheDocument();
 expect(screen.getByText('Fun and entertaining content for everyone')).toBeInTheDocument();
 expect(screen.getByText('30')).toBeInTheDocument(); // Total content count
 expect(screen.getByText('items')).toBeInTheDocument();
 expect(screen.getByText('25 videos')).toBeInTheDocument();
 expect(screen.getByText('5 series')).toBeInTheDocument();
 });

 it('should render correct link to discover page', () => {
 render(<CategoryCard category={mockCategory} />);

 const link = screen.getByRole('link');
 expect(link).toHaveAttribute('href', '/discover?category=entertainment');
 });

 it('should display category icon when iconUrl is provided', () => {
 render(<CategoryCard category={mockCategory} />);

 const icon = screen.getByAltText('Entertainment icon');
 expect(icon).toBeInTheDocument();
 expect(icon).toHaveAttribute('src', '/icons/entertainment.svg');
 });

 it('should display default emoji icon when iconUrl is not provided', () => {
 const categoryWithoutIcon = { ...mockCategory, iconUrl: undefined };
 render(<CategoryCard category={categoryWithoutIcon} />);

 expect(screen.getByText('🎭')).toBeInTheDocument(); // Default entertainment emoji
 });

 it('should display default emoji icon when image fails to load', () => {
 render(<CategoryCard category={mockCategory} />);

 const icon = screen.getByAltText('Entertainment icon');
 fireEvent.error(icon);

 expect(screen.getByText('🎭')).toBeInTheDocument();
 });

 it('should handle category with no description', () => {
 const categoryWithoutDescription = { ...mockCategory, description: undefined };
 render(<CategoryCard category={categoryWithoutDescription} />);

 expect(screen.getByText('Entertainment')).toBeInTheDocument();
 expect(screen.queryByText('Fun and entertaining content for everyone')).not.toBeInTheDocument();
 });

 it('should display singular "item" for single content', () => {
 const categoryWithOneItem = {
 ...mockCategory,
 videoCount: 1,
 seriesCount: 0
 };
 render(<CategoryCard category={categoryWithOneItem} />);

 expect(screen.getByText('1')).toBeInTheDocument();
 expect(screen.getByText('item')).toBeInTheDocument();
 expect(screen.getByText('1 video')).toBeInTheDocument();
 });

 it('should handle category with only videos', () => {
 const categoryWithOnlyVideos = {
 ...mockCategory,
 videoCount: 10,
 seriesCount: 0
 };
 render(<CategoryCard category={categoryWithOnlyVideos} />);

 expect(screen.getByText('10 videos')).toBeInTheDocument();
 expect(screen.queryByText('series')).not.toBeInTheDocument();
 });

 it('should handle category with only series', () => {
 const categoryWithOnlySeries = {
 ...mockCategory,
 videoCount: 0,
 seriesCount: 3
 };
 render(<CategoryCard category={categoryWithOnlySeries} />);

 expect(screen.getByText('3 series')).toBeInTheDocument();
 expect(screen.queryByText('videos')).not.toBeInTheDocument();
 });

 it('should handle category with no content', () => {
 const categoryWithNoContent = {
 ...mockCategory,
 videoCount: 0,
 seriesCount: 0
 };
 render(<CategoryCard category={categoryWithNoContent} />);

 expect(screen.getByText('0')).toBeInTheDocument();
 expect(screen.getByText('items')).toBeInTheDocument();
 });

 it('should apply custom className', () => {
 render(
 <CategoryCard category={mockCategory} className="custom-class" />
 );

 const link = screen.getByRole('link');
 expect(link).toHaveClass('group', 'block', 'custom-class');
 });

 it('should display correct default icons for different categories', () => {
 const categories = [
 { ...mockCategory, name: 'Education', iconUrl: undefined },
 { ...mockCategory, name: 'Music', iconUrl: undefined },
 { ...mockCategory, name: 'Comedy', iconUrl: undefined },
 { ...mockCategory, name: 'Technology', iconUrl: undefined },
 { ...mockCategory, name: 'Unknown Category', iconUrl: undefined }
 ];

 categories.forEach((category, index) => {
 const { unmount } = render(<CategoryCard category={category} />);
 
 switch (category.name) {
 case 'Education':
 expect(screen.getByText('📚')).toBeInTheDocument();
 break;
 case 'Music':
 expect(screen.getByText('🎵')).toBeInTheDocument();
 break;
 case 'Comedy':
 expect(screen.getByText('😂')).toBeInTheDocument();
 break;
 case 'Technology':
 expect(screen.getByText('💻')).toBeInTheDocument();
 break;
 case 'Unknown Category':
 expect(screen.getByText('📺')).toBeInTheDocument(); // Default fallback
 break;
 }
 
 unmount();
 });
 });

 it('should format large numbers correctly', () => {
 const categoryWithLargeNumbers = {
 ...mockCategory,
 videoCount: 1500,
 seriesCount: 250
 };
 render(<CategoryCard category={categoryWithLargeNumbers} />);

 expect(screen.getByText('1,750')).toBeInTheDocument(); // Total formatted
 expect(screen.getByText((content, element) => {
 return element?.textContent === '1,500 videos';
 })).toBeInTheDocument();
 expect(screen.getByText((content, element) => {
 return element?.textContent === '250 series';
 })).toBeInTheDocument();
 });
});