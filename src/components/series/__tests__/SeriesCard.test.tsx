import { render, screen, fireEvent } from '@testing-library/react';
import { Series } from '@/types';
import SeriesCard from '../SeriesCard';

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 },
}));

jest.mock('next/image', () => {
 return function MockImage({ src, alt, ...props }: any) {
 return <img src={src} alt={alt} {...props} />;
 };
});

const mockSeries: Series = {
 id: 'series-1',
 creatorId: 'creator-1',
 title: 'Test Series',
 description: 'A test series description',
 thumbnailUrl: 'https://example.com/thumbnail.jpg',
 totalPrice: 299,
 videoCount: 5,
 totalDuration: 3600, // 1 hour
 category: 'Education',
 tags: ['test', 'series'],
 viewCount: 1500,
 totalEarnings: 0,
 isActive: true,
 moderationStatus: 'approved',
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 creator: {
 id: 'creator-1',
 username: 'testcreator',
 displayName: 'Test Creator',
 avatar: 'https://example.com/avatar.jpg'
 }
};

describe('SeriesCard', () => {
 it('renders series information correctly', () => {
 render(<SeriesCard series={mockSeries} />);
 
 expect(screen.getByText('Test Series')).toBeInTheDocument();
 expect(screen.getByText('A test series description')).toBeInTheDocument();
 expect(screen.getByText('Test Creator')).toBeInTheDocument();
 expect(screen.getByText('₹299')).toBeInTheDocument();
 expect(screen.getByText('5 videos')).toBeInTheDocument();
 expect(screen.getByText('1h 0m')).toBeInTheDocument();
 expect(screen.getByText('1.5K views')).toBeInTheDocument();
 expect(screen.getByText('Education')).toBeInTheDocument();
 expect(screen.getByText('SERIES')).toBeInTheDocument();
 });

 it('handles click events', () => {
 const mockOnClick = jest.fn();
 render(<SeriesCard series={mockSeries} onClick={mockOnClick} />);
 
 const card = screen.getByRole('button', { name: /test series/i });
 fireEvent.click(card);
 
 expect(mockOnClick).toHaveBeenCalledTimes(1);
 });

 it('displays fallback when no thumbnail', () => {
 const seriesWithoutThumbnail = { ...mockSeries, thumbnailUrl: undefined };
 render(<SeriesCard series={seriesWithoutThumbnail} />);

 expect(screen.getByText('Series')).toBeInTheDocument();
 });

 it('displays tags correctly', () => {
 render(<SeriesCard series={mockSeries} />);
 
 expect(screen.getByText('#test')).toBeInTheDocument();
 expect(screen.getByText('#series')).toBeInTheDocument();
 });

 it('formats duration correctly for different durations', () => {
 const shortSeries = { ...mockSeries, totalDuration: 1800 }; // 30 minutes
 const { rerender } = render(<SeriesCard series={shortSeries} />);
 expect(screen.getByText('30m')).toBeInTheDocument();
 
 const longSeries = { ...mockSeries, totalDuration: 7200 }; // 2 hours
 rerender(<SeriesCard series={longSeries} />);
 expect(screen.getByText('2h 0m')).toBeInTheDocument();
 });

 it('formats view count correctly', () => {
 const highViewSeries = { ...mockSeries, viewCount: 1500000 };
 const { rerender } = render(<SeriesCard series={highViewSeries} />);
 expect(screen.getByText('1.5M views')).toBeInTheDocument();
 
 const mediumViewSeries = { ...mockSeries, viewCount: 15000 };
 rerender(<SeriesCard series={mediumViewSeries} />);
 expect(screen.getByText('15.0K views')).toBeInTheDocument();
 });
});