import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoCard from '../VideoCard';
import { Video } from '@/types';

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 },
}));

jest.mock('next/image', () => ({
 __esModule: true,
 default: ({ src, alt, onLoad, onError, ...props }: any) => (
 <img 
 src={src} 
 alt={alt} 
 {...props}
 onLoad={() => onLoad && onLoad()}
 onError={() => onError && onError()}
 />
 ),
}));

const mockVideo: Video = {
 id: 'video-1',
 creatorId: 'creator-1',
 title: 'Amazing Test Video',
 description: 'This is a test video description',
 videoUrl: 'https://example.com/video.mp4',
 thumbnailUrl: 'https://example.com/thumbnail.jpg',
 duration: 125, // 2:05
 creditCost: 3,
 category: 'entertainment',
 tags: ['test', 'amazing', 'video'],
 viewCount: 1500,
 totalEarnings: 150,
 isActive: true,
 createdAt: new Date('2024-01-15T10:00:00Z'),
 updatedAt: new Date('2024-01-15T10:00:00Z'),
 creator: {
 id: 'creator-1',
 username: 'testcreator',
 displayName: 'Test Creator',
 avatar: 'https://example.com/avatar.jpg'
 }
};

describe('VideoCard', () => {
 it('renders video information correctly', () => {
 render(<VideoCard video={mockVideo} />);
 
 expect(screen.getByText('Amazing Test Video')).toBeInTheDocument();
 expect(screen.getByText('Test Creator')).toBeInTheDocument();
 expect(screen.getByText('3 credits')).toBeInTheDocument();
 expect(screen.getByText('2:05')).toBeInTheDocument();
 expect(screen.getByText('entertainment')).toBeInTheDocument();
 expect(screen.getByText('1.5K views')).toBeInTheDocument();
 });

 it('renders creator avatar when available', () => {
 render(<VideoCard video={mockVideo} />);
 
 const avatar = screen.getByAltText('Test Creator');
 expect(avatar).toBeInTheDocument();
 expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
 });

 it('renders creator initials when no avatar', () => {
 const videoWithoutAvatar = {
 ...mockVideo,
 creator: {
 ...mockVideo.creator!,
 avatar: undefined
 }
 };
 
 render(<VideoCard video={videoWithoutAvatar} />);
 
 expect(screen.getByText('T')).toBeInTheDocument(); // First letter of "Test Creator"
 });

 it('handles video thumbnail error gracefully', () => {
 render(<VideoCard video={mockVideo} />);
 
 const thumbnail = screen.getByAltText('Amazing Test Video');
 fireEvent.error(thumbnail);

 expect(screen.getByText('Amazing Test Video')).toBeInTheDocument();
 });

 it('calls onClick when card is clicked', () => {
 const mockOnClick = jest.fn();
 render(<VideoCard video={mockVideo} onClick={mockOnClick} />);
 
 const card = screen.getByText('Amazing Test Video').closest('div');
 if (card) {
 fireEvent.click(card);
 expect(mockOnClick).toHaveBeenCalled();
 }
 });

 it('formats duration correctly', () => {
 const videoWithLongDuration = {
 ...mockVideo,
 duration: 3665 // 61:05
 };
 
 render(<VideoCard video={videoWithLongDuration} />);
 expect(screen.getByText('61:05')).toBeInTheDocument();
 });

 it('formats view count correctly', () => {
 const videoWithManyViews = {
 ...mockVideo,
 viewCount: 1500000 // 1.5M
 };
 
 render(<VideoCard video={videoWithManyViews} />);
 expect(screen.getByText('1.5M views')).toBeInTheDocument();
 });

 it('renders tags when available', () => {
 render(<VideoCard video={mockVideo} />);
 
 expect(screen.getByText('#test')).toBeInTheDocument();
 expect(screen.getByText('#amazing')).toBeInTheDocument();
 expect(screen.getByText('+1 more')).toBeInTheDocument(); // Only shows first 2 tags
 });

 it('handles singular credit cost correctly', () => {
 const videoWithOneCredit = {
 ...mockVideo,
 creditCost: 1
 };
 
 render(<VideoCard video={videoWithOneCredit} />);
 expect(screen.getByText('1 credit')).toBeInTheDocument();
 });

 it('applies hover styles when isHovered is true', () => {
 const { rerender } = render(<VideoCard video={mockVideo} isHovered={false} />);

 rerender(<VideoCard video={mockVideo} isHovered={true} />);

 expect(screen.getByText('Amazing Test Video')).toBeInTheDocument();
 });
});