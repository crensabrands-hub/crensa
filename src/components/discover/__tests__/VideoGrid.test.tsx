import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoGrid from '../VideoGrid';
import { Video } from '@/types';

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 },
}));

jest.mock('next/image', () => ({
 __esModule: true,
 default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

const mockVideos: Video[] = [
 {
 id: 'video-1',
 creatorId: 'creator-1',
 title: 'Test Video 1',
 description: 'Test description',
 videoUrl: 'https://example.com/video1.mp4',
 thumbnailUrl: 'https://example.com/thumb1.jpg',
 duration: 120,
 creditCost: 2,
 category: 'entertainment',
 tags: ['test', 'video'],
 viewCount: 1000,
 totalEarnings: 100,
 isActive: true,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 creator: {
 id: 'creator-1',
 username: 'testcreator',
 displayName: 'Test Creator',
 avatar: 'https://example.com/avatar.jpg'
 }
 },
 {
 id: 'video-2',
 creatorId: 'creator-2',
 title: 'Test Video 2',
 description: 'Test description 2',
 videoUrl: 'https://example.com/video2.mp4',
 thumbnailUrl: 'https://example.com/thumb2.jpg',
 duration: 90,
 creditCost: 1,
 category: 'education',
 tags: ['learn', 'tutorial'],
 viewCount: 500,
 totalEarnings: 50,
 isActive: true,
 createdAt: new Date('2024-01-02'),
 updatedAt: new Date('2024-01-02'),
 creator: {
 id: 'creator-2',
 username: 'educator',
 displayName: 'Edu Creator'
 }
 }
];

describe('VideoGrid', () => {
 it('renders loading skeleton when isLoading is true', () => {
 render(<VideoGrid videos={[]} isLoading={true} />);

 expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
 });

 it('renders empty state when no videos provided', () => {
 render(<VideoGrid videos={[]} isLoading={false} />);
 
 expect(screen.getByText('No videos found')).toBeInTheDocument();
 expect(screen.getByText('Try adjusting your search terms or filters to find more content')).toBeInTheDocument();
 });

 it('renders video cards when videos are provided', () => {
 render(<VideoGrid videos={mockVideos} isLoading={false} />);
 
 expect(screen.getByText('Test Video 1')).toBeInTheDocument();
 expect(screen.getByText('Test Video 2')).toBeInTheDocument();
 expect(screen.getByText('Test Creator')).toBeInTheDocument();
 expect(screen.getByText('Edu Creator')).toBeInTheDocument();
 });

 it('calls onVideoClick when video card is clicked', () => {
 const mockOnVideoClick = jest.fn();
 render(
 <VideoGrid 
 videos={mockVideos} 
 isLoading={false} 
 onVideoClick={mockOnVideoClick}
 />
 );
 
 const videoCard = screen.getByText('Test Video 1').closest('div');
 if (videoCard) {
 fireEvent.click(videoCard);
 expect(mockOnVideoClick).toHaveBeenCalledWith(mockVideos[0]);
 }
 });

 it('shows load more button when hasMore is true', () => {
 render(
 <VideoGrid 
 videos={mockVideos} 
 isLoading={false} 
 hasMore={true}
 onLoadMore={jest.fn()}
 />
 );
 
 expect(screen.getByText('Load More Videos')).toBeInTheDocument();
 });

 it('calls onLoadMore when load more button is clicked', () => {
 const mockOnLoadMore = jest.fn();
 render(
 <VideoGrid 
 videos={mockVideos} 
 isLoading={false} 
 hasMore={true}
 onLoadMore={mockOnLoadMore}
 />
 );
 
 const loadMoreButton = screen.getByText('Load More Videos');
 fireEvent.click(loadMoreButton);
 expect(mockOnLoadMore).toHaveBeenCalled();
 });

 it('shows loading state on load more button when isLoadingMore is true', () => {
 render(
 <VideoGrid 
 videos={mockVideos} 
 isLoading={false} 
 hasMore={true}
 isLoadingMore={true}
 onLoadMore={jest.fn()}
 />
 );
 
 expect(screen.getByText('Loading...')).toBeInTheDocument();
 expect(document.querySelector('.animate-spin')).toBeInTheDocument();
 });
});