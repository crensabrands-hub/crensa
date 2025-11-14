import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AspectRatioVideoPlayer } from '../AspectRatioVideoPlayer';
import { AspectRatio } from '@/types';

const mockPlay = jest.fn();
const mockPause = jest.fn();
const mockLoad = jest.fn();

Object.defineProperty(HTMLMediaElement.prototype, 'play', {
 writable: true,
 value: mockPlay,
});

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
 writable: true,
 value: mockPause,
});

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
 writable: true,
 value: mockLoad,
});

Object.defineProperty(Element.prototype, 'requestFullscreen', {
 writable: true,
 value: jest.fn(),
});

Object.defineProperty(Document.prototype, 'exitFullscreen', {
 writable: true,
 value: jest.fn(),
});

describe('AspectRatioVideoPlayer', () => {
 const defaultProps = {
 videoUrl: 'https://example.com/video.mp4',
 thumbnailUrl: 'https://example.com/thumbnail.jpg',
 aspectRatio: '16:9' as AspectRatio,
 };

 beforeEach(() => {
 jest.clearAllMocks();
 });

 it('renders video player with correct aspect ratio', () => {
 render(<AspectRatioVideoPlayer {...defaultProps} />);
 
 const video = document.querySelector('video');
 expect(video).toBeInTheDocument();
 expect(video).toHaveAttribute('poster', defaultProps.thumbnailUrl);
 });

 it('displays aspect ratio indicator', () => {
 render(<AspectRatioVideoPlayer {...defaultProps} />);
 
 expect(screen.getByText('16:9')).toBeInTheDocument();
 });

 it('shows mobile indicator for vertical ratios', () => {
 render(
 <AspectRatioVideoPlayer 
 {...defaultProps} 
 aspectRatio="9:16" 
 />
 );
 
 expect(screen.getByText('📱')).toBeInTheDocument();
 expect(screen.getByText('📱 Optimized for mobile viewing')).toBeInTheDocument();
 });

 it('applies correct styling for vertical ratios', () => {
 const { container } = render(
 <AspectRatioVideoPlayer 
 {...defaultProps} 
 aspectRatio="9:16" 
 />
 );
 
 const aspectContainer = container.querySelector('[style*="padding-bottom: 177.78%"]');
 expect(aspectContainer).toBeInTheDocument();
 });

 it('applies correct styling for square ratios', () => {
 const { container } = render(
 <AspectRatioVideoPlayer 
 {...defaultProps} 
 aspectRatio="1:1" 
 />
 );
 
 const aspectContainer = container.querySelector('[style*="padding-bottom: 100%"]');
 expect(aspectContainer).toBeInTheDocument();
 });

 it('toggles play/pause when center button is clicked', async () => {
 render(<AspectRatioVideoPlayer {...defaultProps} />);
 
 const playButton = screen.getAllByRole('button').find(btn => 
 btn.querySelector('svg')?.classList.contains('w-8')
 );
 
 expect(playButton).toBeInTheDocument();
 
 if (playButton) {
 fireEvent.click(playButton);
 await waitFor(() => {
 expect(mockPlay).toHaveBeenCalled();
 });
 }
 });

 it('calls onPlay callback when video starts playing', async () => {
 const onPlay = jest.fn();
 render(
 <AspectRatioVideoPlayer 
 {...defaultProps} 
 onPlay={onPlay}
 />
 );
 
 const video = document.querySelector('video');
 if (video) {
 fireEvent.play(video);
 expect(onPlay).toHaveBeenCalled();
 }
 });

 it('calls onPause callback when video is paused', async () => {
 const onPause = jest.fn();
 render(
 <AspectRatioVideoPlayer 
 {...defaultProps} 
 onPause={onPause}
 />
 );
 
 const video = document.querySelector('video');
 if (video) {
 fireEvent.pause(video);
 expect(onPause).toHaveBeenCalled();
 }
 });

 it('calls onTimeUpdate callback during playback', async () => {
 const onTimeUpdate = jest.fn();
 render(
 <AspectRatioVideoPlayer 
 {...defaultProps} 
 onTimeUpdate={onTimeUpdate}
 />
 );
 
 const video = document.querySelector('video');
 if (video) {

 Object.defineProperty(video, 'currentTime', {
 writable: true,
 value: 30,
 });
 
 fireEvent.timeUpdate(video);
 expect(onTimeUpdate).toHaveBeenCalledWith(30);
 }
 });

 it('hides controls when disabled', () => {
 render(
 <AspectRatioVideoPlayer 
 {...defaultProps} 
 controls={false}
 />
 );

 const controlButtons = screen.queryAllByRole('button');
 expect(controlButtons).toHaveLength(0);
 });

 it('shows loading state initially', () => {
 render(<AspectRatioVideoPlayer {...defaultProps} />);
 
 const loadingSpinner = document.querySelector('.animate-spin');
 expect(loadingSpinner).toBeInTheDocument();
 });

 it('applies custom className', () => {
 const { container } = render(
 <AspectRatioVideoPlayer 
 {...defaultProps} 
 className="custom-class"
 />
 );
 
 expect(container.firstChild).toHaveClass('custom-class');
 });

 it('handles different aspect ratios correctly', () => {
 const aspectRatios: AspectRatio[] = ['16:9', '9:16', '1:1', '4:5', '3:2', '2:3'];
 
 aspectRatios.forEach(ratio => {
 const { container, unmount } = render(
 <AspectRatioVideoPlayer 
 {...defaultProps} 
 aspectRatio={ratio}
 />
 );
 
 expect(screen.getByText(ratio)).toBeInTheDocument();
 unmount();
 });
 });

 it('formats time correctly', () => {
 render(<AspectRatioVideoPlayer {...defaultProps} />);
 
 const video = document.querySelector('video');
 if (video) {

 Object.defineProperty(video, 'duration', {
 writable: true,
 value: 125, // 2:05
 });
 
 Object.defineProperty(video, 'currentTime', {
 writable: true,
 value: 65, // 1:05
 });
 
 fireEvent.loadedMetadata(video);
 fireEvent.timeUpdate(video);

 expect(screen.getByText(/1:05 \/ 2:05/)).toBeInTheDocument();
 }
 });

 it('handles autoplay correctly', () => {
 render(
 <AspectRatioVideoPlayer 
 {...defaultProps} 
 autoplay={true}
 />
 );
 
 const video = document.querySelector('video');
 expect(video).toHaveProperty('autoplay', true);
 expect(video).toHaveProperty('muted', true); // Autoplay requires muted
 });

 it('optimizes layout for vertical videos on mobile', () => {
 render(
 <AspectRatioVideoPlayer 
 {...defaultProps} 
 aspectRatio="9:16"
 />
 );
 
 const container = document.querySelector('.max-w-sm');
 expect(container).toBeInTheDocument();
 });
});