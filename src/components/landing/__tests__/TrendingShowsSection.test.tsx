import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import TrendingShowsSection from '../TrendingShowsSection';
import { useTrendingShows } from '@/hooks/useTrendingShows';
import { TrendingShow } from '@/types';

jest.mock('next/navigation', () => ({
 useRouter: jest.fn()
}));

jest.mock('@/hooks/useTrendingShows');

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({
 push: mockPush
});

const mockTrendingShows: TrendingShow[] = [
 {
 id: '1',
 type: 'video',
 title: 'Video 1',
 thumbnailUrl: 'https://example.com/thumb1.jpg',
 creatorName: 'Creator 1',
 creatorId: 'creator1',
 viewCount: 1000,
 duration: 300,
 price: 10,
 trendingScore: 85,
 recentViews: 100,
 category: 'Entertainment'
 },
 {
 id: '2',
 type: 'series',
 title: 'Series 1',
 thumbnailUrl: 'https://example.com/thumb2.jpg',
 creatorName: 'Creator 2',
 creatorId: 'creator2',
 viewCount: 2000,
 videoCount: 5,
 price: 25,
 trendingScore: 90,
 recentViews: 200,
 category: 'Education'
 }
];

describe('TrendingShowsSection', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 it('should render loading state', () => {
 (useTrendingShows as jest.Mock).mockReturnValue({
 trendingShows: [],
 loading: true,
 error: null,
 refetch: jest.fn()
 });

 render(<TrendingShowsSection />);

 const skeletons = screen.getAllByTestId('skeleton-loader');
 expect(skeletons).toHaveLength(8); // Default limit
 });

 it('should render trending shows successfully', () => {
 (useTrendingShows as jest.Mock).mockReturnValue({
 trendingShows: mockTrendingShows,
 loading: false,
 error: null,
 refetch: jest.fn()
 });

 render(<TrendingShowsSection />);

 expect(screen.getByText('Video 1')).toBeInTheDocument();
 expect(screen.getByText('Series 1')).toBeInTheDocument();
 expect(screen.getByText('View More Shows')).toBeInTheDocument();
 });

 it('should render error state', () => {
 const mockRefetch = jest.fn();
 (useTrendingShows as jest.Mock).mockReturnValue({
 trendingShows: [],
 loading: false,
 error: 'Network error',
 refetch: mockRefetch
 });

 render(<TrendingShowsSection />);

 expect(screen.getByText('Failed to load trending shows')).toBeInTheDocument();
 expect(screen.getByText('Network error')).toBeInTheDocument();
 
 const retryButton = screen.getByText('Try Again');
 fireEvent.click(retryButton);
 
 expect(mockRefetch).toHaveBeenCalled();
 });

 it('should render empty state', () => {
 (useTrendingShows as jest.Mock).mockReturnValue({
 trendingShows: [],
 loading: false,
 error: null,
 refetch: jest.fn()
 });

 render(<TrendingShowsSection />);

 expect(screen.getByText('No trending shows available at the moment')).toBeInTheDocument();
 expect(screen.getByText('Check back later for fresh content!')).toBeInTheDocument();
 });

 it('should handle View More button click', () => {
 (useTrendingShows as jest.Mock).mockReturnValue({
 trendingShows: mockTrendingShows,
 loading: false,
 error: null,
 refetch: jest.fn()
 });

 render(<TrendingShowsSection />);

 const viewMoreButton = screen.getByText('View More Shows');
 fireEvent.click(viewMoreButton);

 expect(mockPush).toHaveBeenCalledWith('/trending-shows');
 });

 it('should hide View More button when showViewMore is false', () => {
 (useTrendingShows as jest.Mock).mockReturnValue({
 trendingShows: mockTrendingShows,
 loading: false,
 error: null,
 refetch: jest.fn()
 });

 render(<TrendingShowsSection showViewMore={false} />);

 expect(screen.queryByText('View More Shows')).not.toBeInTheDocument();
 });

 it('should use custom limit', () => {
 (useTrendingShows as jest.Mock).mockReturnValue({
 trendingShows: [],
 loading: true,
 error: null,
 refetch: jest.fn()
 });

 render(<TrendingShowsSection limit={4} />);

 expect(useTrendingShows).toHaveBeenCalledWith(4);
 });

 it('should apply custom className', () => {
 (useTrendingShows as jest.Mock).mockReturnValue({
 trendingShows: mockTrendingShows,
 loading: false,
 error: null,
 refetch: jest.fn()
 });

 const { container } = render(
 <TrendingShowsSection className="custom-class" />
 );

 expect(container.firstChild).toHaveClass('custom-class');
 });

 it('should render correct number of skeleton loaders based on limit', () => {
 (useTrendingShows as jest.Mock).mockReturnValue({
 trendingShows: [],
 loading: true,
 error: null,
 refetch: jest.fn()
 });

 render(<TrendingShowsSection limit={6} />);

 const skeletons = screen.getAllByTestId('skeleton-loader');
 expect(skeletons).toHaveLength(6);
 });
});