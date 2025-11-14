import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import TrendingShowCard from '../TrendingShowCard';
import { TrendingShow } from '@/types';

jest.mock('next/navigation', () => ({
 useRouter: jest.fn()
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({
 push: mockPush
});

const mockVideoShow: TrendingShow = {
 id: '1',
 type: 'video',
 title: 'Amazing Video Content',
 thumbnailUrl: 'https://example.com/thumb.jpg',
 creatorName: 'John Creator',
 creatorId: 'creator1',
 viewCount: 1500,
 rating: 4.5,
 duration: 300, // 5 minutes
 price: 10,
 trendingScore: 85,
 recentViews: 150,
 category: 'Entertainment'
};

const mockSeriesShow: TrendingShow = {
 id: '2',
 type: 'series',
 title: 'Epic Series Collection',
 thumbnailUrl: 'https://example.com/series-thumb.jpg',
 creatorName: 'Jane Creator',
 creatorId: 'creator2',
 viewCount: 5000,
 videoCount: 8,
 price: 50,
 trendingScore: 92,
 recentViews: 500,
 category: 'Education'
};

describe('TrendingShowCard', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 it('should render video show correctly', () => {
 render(<TrendingShowCard show={mockVideoShow} />);

 expect(screen.getByText('Amazing Video Content')).toBeInTheDocument();
 expect(screen.getByText('by John Creator')).toBeInTheDocument();
 expect(screen.getByText('1.5K views')).toBeInTheDocument();
 expect(screen.getByText('4.5')).toBeInTheDocument();
 expect(screen.getByText('5m')).toBeInTheDocument();
 expect(screen.getByText('10 credits')).toBeInTheDocument();
 expect(screen.getByText('Entertainment')).toBeInTheDocument();
 expect(screen.getByText('Video')).toBeInTheDocument();
 });

 it('should render series show correctly', () => {
 render(<TrendingShowCard show={mockSeriesShow} />);

 expect(screen.getByText('Epic Series Collection')).toBeInTheDocument();
 expect(screen.getByText('by Jane Creator')).toBeInTheDocument();
 expect(screen.getByText('5.0K views')).toBeInTheDocument();
 expect(screen.getByText('8 videos')).toBeInTheDocument();
 expect(screen.getByText('50 credits')).toBeInTheDocument();
 expect(screen.getByText('Education')).toBeInTheDocument();
 expect(screen.getByText('Series')).toBeInTheDocument();
 });

 it('should format view counts correctly', () => {
 const showWithManyViews: TrendingShow = {
 ...mockVideoShow,
 viewCount: 1500000
 };

 render(<TrendingShowCard show={showWithManyViews} />);
 expect(screen.getByText('1.5M views')).toBeInTheDocument();
 });

 it('should handle free content', () => {
 const freeShow: TrendingShow = {
 ...mockVideoShow,
 price: 0
 };

 render(<TrendingShowCard show={freeShow} />);
 expect(screen.getByText('Free')).toBeInTheDocument();
 });

 it('should handle missing thumbnail', () => {
 const showWithoutThumbnail: TrendingShow = {
 ...mockVideoShow,
 thumbnailUrl: ''
 };

 render(<TrendingShowCard show={showWithoutThumbnail} />);

 const playIcon = screen.getAllByTestId('play-icon')[0]; // There might be multiple play icons
 expect(playIcon).toBeInTheDocument();
 });

 it('should handle image load error', () => {
 render(<TrendingShowCard show={mockVideoShow} />);
 
 const image = screen.getByAltText('Amazing Video Content');
 fireEvent.error(image);

 const playIcon = screen.getAllByTestId('play-icon')[0];
 expect(playIcon).toBeInTheDocument();
 });

 it('should generate correct URLs for videos and series', () => {
 const { rerender } = render(<TrendingShowCard show={mockVideoShow} />);
 
 const videoLink = screen.getByRole('link');
 expect(videoLink).toHaveAttribute('href', '/watch/1');

 rerender(<TrendingShowCard show={mockSeriesShow} />);
 
 const seriesLink = screen.getByRole('link');
 expect(seriesLink).toHaveAttribute('href', '/series/2');
 });

 it('should format duration correctly', () => {
 const longVideo: TrendingShow = {
 ...mockVideoShow,
 duration: 3900 // 1 hour 5 minutes
 };

 render(<TrendingShowCard show={longVideo} />);
 expect(screen.getByText('1h 5m')).toBeInTheDocument();
 });

 it('should not show rating if not provided', () => {
 const showWithoutRating: TrendingShow = {
 ...mockVideoShow,
 rating: undefined
 };

 render(<TrendingShowCard show={showWithoutRating} />);
 expect(screen.queryByTestId('star-icon')).not.toBeInTheDocument();
 });

 it('should apply custom className', () => {
 const { container } = render(
 <TrendingShowCard show={mockVideoShow} className="custom-class" />
 );
 
 expect(container.firstChild).toHaveClass('custom-class');
 });

 it('should be accessible', () => {
 render(<TrendingShowCard show={mockVideoShow} />);
 
 const link = screen.getByRole('link');
 expect(link).toHaveAttribute('href', '/watch/1');
 
 const image = screen.getByAltText('Amazing Video Content');
 expect(image).toBeInTheDocument();
 });
});