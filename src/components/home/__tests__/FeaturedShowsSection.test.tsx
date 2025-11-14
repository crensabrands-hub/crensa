import { render, screen, fireEvent } from '@testing-library/react';
import { Video } from '@/types';
import FeaturedShowsSection from '../FeaturedShowsSection';

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
 section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
 },
}));

jest.mock('next/image', () => ({
 __esModule: true,
 default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

const mockVideos: Video[] = [
 {
 id: '1',
 creatorId: 'creator1',
 title: 'Amazing Dance Performance',
 description: 'A stunning contemporary dance piece',
 videoUrl: '/videos/dance1.mp4',
 thumbnailUrl: '/images/thumbnails/dance1.jpg',
 duration: 180,
 creditCost: 5,
 category: 'Dance',
 tags: ['dance', 'contemporary'],
 viewCount: 15420,
 totalEarnings: 77100,
 isActive: true,
 createdAt: new Date(),
 updatedAt: new Date()
 },
 {
 id: '2',
 creatorId: 'creator2',
 title: 'Comedy Sketch',
 description: 'Hilarious office comedy',
 videoUrl: '/videos/comedy1.mp4',
 thumbnailUrl: '/images/thumbnails/comedy1.jpg',
 duration: 240,
 creditCost: 3,
 category: 'Comedy',
 tags: ['comedy', 'office'],
 viewCount: 28350,
 totalEarnings: 85050,
 isActive: true,
 createdAt: new Date(),
 updatedAt: new Date()
 }
];

describe('FeaturedShowsSection', () => {
 const mockOnVideoClick = jest.fn();

 beforeEach(() => {
 mockOnVideoClick.mockClear();
 });

 it('renders featured shows section with title', () => {
 render(<FeaturedShowsSection videos={mockVideos} onVideoClick={mockOnVideoClick} />);
 
 expect(screen.getByText('Featured Shows')).toBeInTheDocument();
 });

 it('displays all provided videos', () => {
 render(<FeaturedShowsSection videos={mockVideos} onVideoClick={mockOnVideoClick} />);
 
 expect(screen.getByText('Amazing Dance Performance')).toBeInTheDocument();
 expect(screen.getByText('Comedy Sketch')).toBeInTheDocument();
 });

 it('shows video details correctly', () => {
 render(<FeaturedShowsSection videos={mockVideos} onVideoClick={mockOnVideoClick} />);

 expect(screen.getByText('3:00')).toBeInTheDocument(); // 180 seconds
 expect(screen.getByText('4:00')).toBeInTheDocument(); // 240 seconds

 expect(screen.getByText('15,420')).toBeInTheDocument();
 expect(screen.getByText('28,350')).toBeInTheDocument();

 expect(screen.getByText('5 credits')).toBeInTheDocument();
 expect(screen.getByText('3 credits')).toBeInTheDocument();

 expect(screen.getByText('Dance')).toBeInTheDocument();
 expect(screen.getByText('Comedy')).toBeInTheDocument();
 });

 it('calls onVideoClick when video is clicked', () => {
 render(<FeaturedShowsSection videos={mockVideos} onVideoClick={mockOnVideoClick} />);
 
 const firstVideo = screen.getByText('Amazing Dance Performance').closest('.group');
 fireEvent.click(firstVideo!);
 
 expect(mockOnVideoClick).toHaveBeenCalledWith(mockVideos[0]);
 });

 it('displays video thumbnails with correct alt text', () => {
 render(<FeaturedShowsSection videos={mockVideos} onVideoClick={mockOnVideoClick} />);
 
 const thumbnail1 = screen.getByAltText('Amazing Dance Performance');
 const thumbnail2 = screen.getByAltText('Comedy Sketch');
 
 expect(thumbnail1).toHaveAttribute('src', '/images/thumbnails/dance1.jpg');
 expect(thumbnail2).toHaveAttribute('src', '/images/thumbnails/comedy1.jpg');
 });

 it('handles empty video list gracefully', () => {
 render(<FeaturedShowsSection videos={[]} onVideoClick={mockOnVideoClick} />);
 
 expect(screen.getByText('Featured Shows')).toBeInTheDocument();

 });

 it('truncates long descriptions', () => {
 const videoWithLongDescription: Video = {
 ...mockVideos[0],
 description: 'This is a very long description that should be truncated when displayed in the card to maintain proper layout and readability for users browsing the content'
 };

 render(<FeaturedShowsSection videos={[videoWithLongDescription]} onVideoClick={mockOnVideoClick} />);

 expect(screen.getByText(/This is a very long description/)).toBeInTheDocument();
 });

 it('formats view counts with proper localization', () => {
 const videoWithHighViews: Video = {
 ...mockVideos[0],
 viewCount: 1234567
 };

 render(<FeaturedShowsSection videos={[videoWithHighViews]} onVideoClick={mockOnVideoClick} />);
 
 expect(screen.getByText('1,234,567')).toBeInTheDocument();
 });
});