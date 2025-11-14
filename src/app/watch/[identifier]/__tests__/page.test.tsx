

import { render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import UnifiedWatchClient from '../UnifiedWatchClient';

jest.mock('@clerk/nextjs', () => ({
 useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
 useRouter: jest.fn(),
}));

jest.mock('@/components/layout/MemberLayout', () => {
 return function MockMemberLayout({ children }: { children: React.ReactNode }) {
 return <div data-testid="member-layout">{children}</div>;
 };
});

jest.mock('@/components/watch/VideoPlayer', () => ({
 VideoPlayer: function MockVideoPlayer({ videoId }: { videoId: string }) {
 return <div data-testid="video-player">Video Player: {videoId}</div>;
 },
}));

global.fetch = jest.fn();

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('UnifiedWatchClient', () => {
 const mockPush = jest.fn();

 beforeEach(() => {
 jest.clearAllMocks();
 mockUseRouter.mockReturnValue({
 push: mockPush,
 back: jest.fn(),
 forward: jest.fn(),
 refresh: jest.fn(),
 replace: jest.fn(),
 prefetch: jest.fn(),
 } as any);
 });

 it('shows loading state initially', () => {
 mockUseAuth.mockReturnValue({
 isSignedIn: true,
 userId: 'user123',
 } as any);

 mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

 render(<UnifiedWatchClient identifier="test-id" />);

 expect(screen.getByText('Loading video...')).toBeInTheDocument();
 });

 it('handles video ID access correctly', async () => {
 mockUseAuth.mockReturnValue({
 isSignedIn: true,
 userId: 'user123',
 } as any);

 const mockVideoData = {
 success: true,
 video: {
 id: 'video123',
 title: 'Test Video',
 description: 'Test Description',
 thumbnailUrl: '/test-thumb.jpg',
 duration: 120,
 creditCost: 5,
 category: 'entertainment',
 tags: ['test'],
 viewCount: 100,
 creator: {
 id: 'creator123',
 username: 'testcreator',
 displayName: 'Test Creator',
 avatar: '/avatar.jpg',
 },
 },
 hasAccess: true,
 accessType: 'owned',
 requiresPurchase: false,
 };

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => mockVideoData,
 } as Response);

 render(<UnifiedWatchClient identifier="video123" />);

 await waitFor(() => {
 expect(screen.getByTestId('member-layout')).toBeInTheDocument();
 expect(screen.getByTestId('video-player')).toBeInTheDocument();
 });
 });

 it('handles share token preview correctly', async () => {
 mockUseAuth.mockReturnValue({
 isSignedIn: true,
 userId: 'user123',
 } as any);

 const mockShareData = {
 success: true,
 video: {
 id: 'video123',
 title: 'Shared Video',
 description: 'Shared Description',
 thumbnailUrl: '/test-thumb.jpg',
 duration: 180,
 creditCost: 10,
 category: 'education',
 tags: ['shared'],
 viewCount: 50,
 creator: {
 id: 'creator456',
 username: 'sharecreator',
 displayName: 'Share Creator',
 avatar: '/share-avatar.jpg',
 },
 },
 hasAccess: false,
 accessType: 'token_preview',
 requiresPurchase: true,
 shareToken: 'share123',
 };

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => mockShareData,
 } as Response);

 render(<UnifiedWatchClient identifier="share123" />);

 await waitFor(() => {
 expect(screen.getByText('Shared Video')).toBeInTheDocument();
 expect(screen.getByText('Watch for 10 Credits')).toBeInTheDocument();
 });
 });

 it('handles API errors correctly', async () => {
 mockUseAuth.mockReturnValue({
 isSignedIn: true,
 userId: 'user123',
 } as any);

 mockFetch.mockResolvedValueOnce({
 ok: false,
 status: 404,
 } as Response);

 render(<UnifiedWatchClient identifier="invalid-id" />);

 await waitFor(() => {
 expect(screen.getByText('Video Not Found')).toBeInTheDocument();
 });
 });

 it('handles network errors correctly', async () => {
 mockUseAuth.mockReturnValue({
 isSignedIn: true,
 userId: 'user123',
 } as any);

 mockFetch.mockRejectedValueOnce(new Error('Network error'));

 render(<UnifiedWatchClient identifier="test-id" />);

 await waitFor(() => {
 expect(screen.getByText('Unable to Load Video')).toBeInTheDocument();
 });
 });
});