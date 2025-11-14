

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { UnifiedVideoPlayer } from '../UnifiedVideoPlayer';

jest.mock('@clerk/nextjs', () => ({
 useAuth: jest.fn(),
}));
jest.mock('next/navigation', () => ({
 useRouter: jest.fn(),
}));
jest.mock('framer-motion', () => ({
 motion: {
 button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>
 }
}));

jest.mock('next/image', () => {
 return function MockImage({ src, alt, ...props }: any) {
 return <img src={src} alt={alt} {...props} />;
 };
});

global.fetch = jest.fn();

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockPush = jest.fn();

const mockVideo = {
 id: 'video-123',
 title: 'Test Video',
 description: 'Test video description',
 videoUrl: 'https://example.com/video.mp4',
 thumbnailUrl: 'https://example.com/thumbnail.jpg',
 duration: 300,
 creditCost: 5,
 category: 'entertainment',
 tags: ['test', 'video'],
 viewCount: 1000,
 creator: {
 id: 'creator-123',
 username: 'testcreator',
 displayName: 'Test Creator',
 avatar: 'https://example.com/avatar.jpg'
 }
};

const mockAccessWithAccess = {
 hasAccess: true,
 accessType: 'owned' as const,
 requiresPurchase: false
};

const mockAccessRequiresPurchase = {
 hasAccess: false,
 accessType: 'requires_purchase' as const,
 requiresPurchase: true
};

const mockAccessTokenPreview = {
 hasAccess: false,
 accessType: 'token_preview' as const,
 shareToken: 'token-123',
 requiresPurchase: true
};

describe('UnifiedVideoPlayer', () => {
 beforeEach(() => {
 mockUseRouter.mockReturnValue({
 push: mockPush,
 back: jest.fn(),
 forward: jest.fn(),
 refresh: jest.fn(),
 replace: jest.fn(),
 prefetch: jest.fn()
 } as any);

 mockUseAuth.mockReturnValue({
 isSignedIn: true,
 userId: 'user-123'
 } as any);

 (global.fetch as jest.Mock).mockClear();
 mockPush.mockClear();
 });

 describe('Video Player with Access', () => {
 it('renders video player when user has access', () => {
 render(
 <UnifiedVideoPlayer
 video={mockVideo}
 access={mockAccessWithAccess}
 identifierType="video_id"
 />
 );

 expect(screen.getByText('Test Video')).toBeInTheDocument();
 expect(screen.getByText('Test Creator')).toBeInTheDocument();
 expect(screen.getByText('@testcreator')).toBeInTheDocument();
 expect(screen.getByText('1,000 views')).toBeInTheDocument();
 });

 it('displays video controls', () => {
 render(
 <UnifiedVideoPlayer
 video={mockVideo}
 access={mockAccessWithAccess}
 identifierType="video_id"
 />
 );

 const videoElement = document.querySelector('video');
 expect(videoElement).toBeInTheDocument();
 expect(videoElement).toHaveAttribute('poster', mockVideo.thumbnailUrl);
 });

 it('shows creator attribution for shared content', () => {
 render(
 <UnifiedVideoPlayer
 video={mockVideo}
 access={mockAccessWithAccess}
 identifierType="share_token"
 />
 );

 expect(screen.getByText(/Shared Content/)).toBeInTheDocument();
 expect(screen.getByText(/proper attribution and revenue/)).toBeInTheDocument();
 });
 });

 describe('Purchase Flow', () => {
 it('renders purchase overlay when access is required', () => {
 render(
 <UnifiedVideoPlayer
 video={mockVideo}
 access={mockAccessRequiresPurchase}
 identifierType="video_id"
 />
 );

 expect(screen.getByText('Premium Content')).toBeInTheDocument();
 expect(screen.getByText('This video requires 5 credits to watch')).toBeInTheDocument();
 expect(screen.getByText('Watch for 5 Credits')).toBeInTheDocument();
 });

 it('shows creator attribution in purchase overlay for shared content', () => {
 render(
 <UnifiedVideoPlayer
 video={mockVideo}
 access={mockAccessTokenPreview}
 identifierType="share_token"
 />
 );

 expect(screen.getByText(/Shared by Test Creator/)).toBeInTheDocument();
 expect(screen.getByText(/creator earns revenue with proper attribution/)).toBeInTheDocument();
 });

 it('handles purchase flow for video ID', async () => {
 const mockOnAccessGranted = jest.fn();
 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({ success: true })
 });

 render(
 <UnifiedVideoPlayer
 video={mockVideo}
 access={mockAccessRequiresPurchase}
 identifierType="video_id"
 onAccessGranted={mockOnAccessGranted}
 />
 );

 const purchaseButton = screen.getByText('Watch for 5 Credits');
 fireEvent.click(purchaseButton);

 await waitFor(() => {
 expect(global.fetch).toHaveBeenCalledWith('/api/videos/video-123/purchase', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 }
 });
 });

 await waitFor(() => {
 expect(mockOnAccessGranted).toHaveBeenCalled();
 });
 });

 it('handles purchase flow for share token', async () => {
 const mockOnAccessGranted = jest.fn();
 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({ success: true })
 });

 render(
 <UnifiedVideoPlayer
 video={mockVideo}
 access={mockAccessTokenPreview}
 identifierType="share_token"
 onAccessGranted={mockOnAccessGranted}
 />
 );

 const purchaseButton = screen.getByText('Watch for 5 Credits');
 fireEvent.click(purchaseButton);

 await waitFor(() => {
 expect(global.fetch).toHaveBeenCalledWith('/api/watch/token-123/view', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 }
 });
 });

 await waitFor(() => {
 expect(mockOnAccessGranted).toHaveBeenCalled();
 });
 });

 it('redirects to wallet on insufficient credits', async () => {
 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 status: 402,
 json: async () => ({ error: 'Insufficient credits' })
 });

 render(
 <UnifiedVideoPlayer
 video={mockVideo}
 access={mockAccessRequiresPurchase}
 identifierType="video_id"
 />
 );

 const purchaseButton = screen.getByText('Watch for 5 Credits');
 fireEvent.click(purchaseButton);

 await waitFor(() => {
 expect(mockPush).toHaveBeenCalledWith('/wallet?reason=insufficient_credits');
 });
 });

 it('shows error message on purchase failure', async () => {
 const mockOnError = jest.fn();
 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 status: 400,
 json: async () => ({ error: 'Purchase failed' })
 });

 render(
 <UnifiedVideoPlayer
 video={mockVideo}
 access={mockAccessRequiresPurchase}
 identifierType="video_id"
 onError={mockOnError}
 />
 );

 const purchaseButton = screen.getByText('Watch for 5 Credits');
 fireEvent.click(purchaseButton);

 await waitFor(() => {
 expect(mockOnError).toHaveBeenCalledWith('Purchase failed');
 });
 });

 it('redirects to sign-in when user is not authenticated', () => {
 mockUseAuth.mockReturnValue({
 isSignedIn: false,
 userId: null
 } as any);

 render(
 <UnifiedVideoPlayer
 video={mockVideo}
 access={mockAccessRequiresPurchase}
 identifierType="video_id"
 />
 );

 const purchaseButton = screen.getByText('Watch for 5 Credits');
 fireEvent.click(purchaseButton);

 expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/sign-in?redirect_url='));
 });
 });

 describe('Video Controls', () => {
 it('renders action buttons', () => {
 render(
 <UnifiedVideoPlayer
 video={mockVideo}
 access={mockAccessWithAccess}
 identifierType="video_id"
 />
 );

 expect(screen.getByText('Like')).toBeInTheDocument();
 expect(screen.getByText('Share')).toBeInTheDocument();
 expect(screen.getByText('Comments')).toBeInTheDocument();
 });

 it('disables like and comment buttons when user is not signed in', () => {
 mockUseAuth.mockReturnValue({
 isSignedIn: false,
 userId: null
 } as any);

 render(
 <UnifiedVideoPlayer
 video={mockVideo}
 access={mockAccessWithAccess}
 identifierType="video_id"
 />
 );

 const likeButton = screen.getByText('Like').closest('button');
 const commentButton = screen.getByText('Comments').closest('button');

 expect(likeButton).toBeDisabled();
 expect(commentButton).toBeDisabled();
 });
 });

 describe('Share Functionality', () => {
 it('uses native share API when available', async () => {
 const mockShare = jest.fn().mockResolvedValue(undefined);
 Object.defineProperty(navigator, 'share', {
 value: mockShare,
 writable: true
 });

 render(
 <UnifiedVideoPlayer
 video={mockVideo}
 access={mockAccessWithAccess}
 identifierType="video_id"
 />
 );

 const shareButton = screen.getByText('Share');
 fireEvent.click(shareButton);

 await waitFor(() => {
 expect(mockShare).toHaveBeenCalledWith({
 title: 'Test Video',
 text: 'Check out "Test Video" on Crensa!',
 url: expect.stringContaining('/watch/video-123')
 });
 });
 });

 it('falls back to clipboard when native share fails', async () => {
 const mockShare = jest.fn().mockRejectedValue(new Error('Share failed'));
 const mockWriteText = jest.fn().mockResolvedValue(undefined);
 
 Object.defineProperty(navigator, 'share', {
 value: mockShare,
 writable: true
 });
 
 Object.defineProperty(navigator, 'clipboard', {
 value: {
 writeText: mockWriteText
 },
 writable: true
 });

 render(
 <UnifiedVideoPlayer
 video={mockVideo}
 access={mockAccessWithAccess}
 identifierType="video_id"
 />
 );

 const shareButton = screen.getByText('Share');
 fireEvent.click(shareButton);

 await waitFor(() => {
 expect(mockWriteText).toHaveBeenCalled();
 });
 });
 });

 describe('Access Control Validation', () => {
 it('validates creator self-access', () => {
 const creatorAccess = {
 hasAccess: true,
 accessType: 'creator_self_access' as const,
 requiresPurchase: false
 };

 render(
 <UnifiedVideoPlayer
 video={mockVideo}
 access={creatorAccess}
 identifierType="video_id"
 />
 );

 expect(screen.getByText('Test Video')).toBeInTheDocument();
 expect(screen.queryByText('Premium Content')).not.toBeInTheDocument();
 });

 it('validates owned content access', () => {
 render(
 <UnifiedVideoPlayer
 video={mockVideo}
 access={mockAccessWithAccess}
 identifierType="video_id"
 />
 );

 expect(screen.getByText('Test Video')).toBeInTheDocument();
 expect(screen.queryByText('Premium Content')).not.toBeInTheDocument();
 });

 it('validates token preview access', () => {
 render(
 <UnifiedVideoPlayer
 video={mockVideo}
 access={mockAccessTokenPreview}
 identifierType="share_token"
 />
 );

 expect(screen.getByText('Premium Content')).toBeInTheDocument();
 expect(screen.getByText(/Shared by Test Creator/)).toBeInTheDocument();
 });
 });
});