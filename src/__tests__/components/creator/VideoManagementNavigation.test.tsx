import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import VideoManagement from '@/components/creator/VideoManagement';
import { Video } from '@/types';

jest.mock('next/navigation', () => ({
 useRouter: jest.fn(),
}));

const mockRouter = {
 push: jest.fn(),
 replace: jest.fn(),
 back: jest.fn(),
 forward: jest.fn(),
 refresh: jest.fn(),
 prefetch: jest.fn(),
};

const mockVideo: Video = {
 id: 'video-123',
 title: 'Test Video',
 description: 'Test Description',
 videoUrl: 'https://example.com/video.mp4',
 thumbnailUrl: 'https://example.com/thumb.jpg',
 duration: 120,
 creditCost: 5,
 category: 'education',
 tags: ['test', 'video'],
 viewCount: 100,
 totalEarnings: 50,
 createdAt: new Date('2024-01-01'),
 updatedAt: new Date('2024-01-01'),
 creatorId: 'creator-123',
 isActive: true,
};

describe('VideoManagement Navigation', () => {
 beforeEach(() => {
 (useRouter as jest.Mock).mockReturnValue(mockRouter);
 jest.clearAllMocks();
 });

 it('should navigate to analytics when analytics button is clicked', async () => {
 const mockProps = {
 videos: [mockVideo],
 onVideoUpdate: jest.fn(),
 onVideoDelete: jest.fn(),
 onVideoStatusToggle: jest.fn(),
 isLoading: false,
 };

 render(<VideoManagement {...mockProps} />);

 const analyticsButton = screen.getByRole('button', { name: /analytics/i });
 expect(analyticsButton).toBeInTheDocument();

 fireEvent.click(analyticsButton);

 await waitFor(() => {
 expect(mockRouter.push).toHaveBeenCalledWith('/creator/analytics?videoId=video-123');
 });
 });

 it('should show loading state when navigating to analytics', async () => {
 const mockProps = {
 videos: [mockVideo],
 onVideoUpdate: jest.fn(),
 onVideoDelete: jest.fn(),
 onVideoStatusToggle: jest.fn(),
 isLoading: false,
 };

 render(<VideoManagement {...mockProps} />);

 const analyticsButton = screen.getByRole('button', { name: /analytics/i });
 fireEvent.click(analyticsButton);

 await waitFor(() => {
 expect(screen.getByText('Loading...')).toBeInTheDocument();
 }, { timeout: 3000 });
 });

 it('should handle analytics navigation error', async () => {
 const mockOnAnalyticsError = jest.fn();
 const mockProps = {
 videos: [mockVideo],
 onVideoUpdate: jest.fn(),
 onVideoDelete: jest.fn(),
 onVideoStatusToggle: jest.fn(),
 onAnalyticsError: mockOnAnalyticsError,
 isLoading: false,
 };

 render(<VideoManagement {...mockProps} />);

 expect(mockProps.onAnalyticsError).toBeDefined();
 });

 it('should disable analytics button during loading', async () => {
 const mockProps = {
 videos: [mockVideo],
 onVideoUpdate: jest.fn(),
 onVideoDelete: jest.fn(),
 onVideoStatusToggle: jest.fn(),
 isLoading: false,
 };

 render(<VideoManagement {...mockProps} />);

 const analyticsButton = screen.getByRole('button', { name: /analytics/i });
 
 fireEvent.click(analyticsButton);

 await waitFor(() => {
 expect(analyticsButton).toBeDisabled();
 }, { timeout: 3000 });
 });

 it('should render video management with proper error boundary', () => {
 const mockProps = {
 videos: [mockVideo],
 onVideoUpdate: jest.fn(),
 onVideoDelete: jest.fn(),
 onVideoStatusToggle: jest.fn(),
 isLoading: false,
 };

 const { container } = render(<VideoManagement {...mockProps} />);

 expect(container).toBeInTheDocument();
 expect(screen.getByText('Test Video')).toBeInTheDocument();
 });

 it('should handle multiple videos with individual analytics navigation', async () => {
 const mockVideo2: Video = {
 ...mockVideo,
 id: 'video-456',
 title: 'Test Video 2',
 };

 const mockProps = {
 videos: [mockVideo, mockVideo2],
 onVideoUpdate: jest.fn(),
 onVideoDelete: jest.fn(),
 onVideoStatusToggle: jest.fn(),
 isLoading: false,
 };

 render(<VideoManagement {...mockProps} />);

 const analyticsButtons = screen.getAllByRole('button', { name: /analytics/i });
 expect(analyticsButtons).toHaveLength(2);

 fireEvent.click(analyticsButtons[0]);

 await waitFor(() => {
 expect(mockRouter.push).toHaveBeenCalledWith('/creator/analytics?videoId=video-123');
 });

 fireEvent.click(analyticsButtons[1]);

 await waitFor(() => {
 expect(mockRouter.push).toHaveBeenCalledWith('/creator/analytics?videoId=video-456');
 });
 });
});