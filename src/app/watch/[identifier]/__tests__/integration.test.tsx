

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import WatchPage from '../page';

jest.mock('@clerk/nextjs', () => ({
 useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
 useRouter: jest.fn(),
 notFound: jest.fn(),
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

jest.mock('@/hooks/useCreditDeduction', () => ({
 useCreditDeduction: () => ({
 deductCredits: jest.fn().mockResolvedValue({ success: true }),
 isLoading: false,
 }),
}));

jest.mock('@/hooks/useWalletBalance', () => ({
 useWalletBalance: () => ({
 balance: 100,
 refreshBalance: jest.fn(),
 isLoading: false,
 }),
}));

global.fetch = jest.fn();

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('Unified Watch Route Integration Tests', () => {
 const mockPush = jest.fn();
 const mockReplace = jest.fn();

 beforeEach(() => {
 jest.clearAllMocks();
 mockUseRouter.mockReturnValue({
 push: mockPush,
 back: jest.fn(),
 forward: jest.fn(),
 refresh: jest.fn(),
 replace: mockReplace,
 prefetch: jest.fn(),
 } as any);

 mockUseAuth.mockReturnValue({
 isSignedIn: true,
 userId: 'user123',
 } as any);
 });

 describe('End-to-End Video Access by ID (Requirement 1.2)', () => {
 it('should render video player for owned video accessed by ID', async () => {

 const mockVideoData = {
 success: true,
 video: {
 id: 'video123',
 title: 'My Owned Video',
 description: 'This is my owned video',
 thumbnailUrl: '/owned-thumb.jpg',
 duration: 120,
 creditCost: 5,
 category: 'entertainment',
 tags: ['owned', 'test'],
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

 mockFetch.mockResolvedValue({
 ok: true,
 json: async () => mockVideoData,
 } as Response);

 const params = Promise.resolve({ identifier: 'video123' });
 
 render(await WatchPage({ params }));

 await waitFor(() => {
 expect(screen.getByTestId('member-layout')).toBeInTheDocument();
 expect(screen.getByText('My Owned Video')).toBeInTheDocument();
 });

 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('/api/watch/video123'),
 expect.any(Object)
 );
 });

 it('should show purchase interface for unowned video accessed by ID', async () => {

 const mockVideoData = {
 success: true,
 video: {
 id: 'video456',
 title: 'Premium Video',
 description: 'This requires purchase',
 thumbnailUrl: '/premium-thumb.jpg',
 duration: 180,
 creditCost: 10,
 category: 'premium',
 tags: ['premium'],
 viewCount: 50,
 creator: {
 id: 'creator456',
 username: 'premiumcreator',
 displayName: 'Premium Creator',
 avatar: '/premium-avatar.jpg',
 },
 },
 hasAccess: false,
 accessType: 'requires_purchase',
 requiresPurchase: true,
 };

 mockFetch.mockResolvedValue({
 ok: true,
 json: async () => mockVideoData,
 } as Response);

 const params = Promise.resolve({ identifier: 'video456' });
 
 render(await WatchPage({ params }));

 await waitFor(() => {
 expect(screen.getByText('Premium Video')).toBeInTheDocument();
 expect(screen.getByText('Watch for 10 Credits')).toBeInTheDocument();
 expect(screen.getByRole('button', { name: /watch now/i })).toBeInTheDocument();
 });
 });
 });

 describe('End-to-End Share Token Access and Purchase Flow (Requirement 1.3)', () => {
 it('should render share preview and handle purchase flow', async () => {
 const user = userEvent.setup();

 const mockShareData = {
 success: true,
 video: {
 id: 'video789',
 title: 'Shared Premium Video',
 description: 'Shared via token',
 thumbnailUrl: '/shared-thumb.jpg',
 duration: 240,
 creditCost: 15,
 category: 'education',
 tags: ['shared', 'premium'],
 viewCount: 75,
 creator: {
 id: 'creator789',
 username: 'sharecreator',
 displayName: 'Share Creator',
 avatar: '/share-avatar.jpg',
 },
 },
 hasAccess: false,
 accessType: 'token_preview',
 requiresPurchase: true,
 shareToken: 'share123token',
 };

 const mockPurchaseResponse = {
 success: true,
 message: 'Purchase successful',
 newBalance: 85,
 };

 mockFetch
 .mockResolvedValueOnce({
 ok: true,
 json: async () => mockShareData,
 } as Response)
 .mockResolvedValueOnce({
 ok: true,
 json: async () => mockPurchaseResponse,
 } as Response);

 const params = Promise.resolve({ identifier: 'share123token' });
 
 render(await WatchPage({ params }));

 await waitFor(() => {
 expect(screen.getByText('Shared Premium Video')).toBeInTheDocument();
 expect(screen.getByText('Shared by Share Creator')).toBeInTheDocument();
 expect(screen.getByText('Watch for 15 Credits')).toBeInTheDocument();
 });

 const purchaseButton = screen.getByRole('button', { name: /watch now/i });
 await user.click(purchaseButton);

 await waitFor(() => {
 expect(screen.getByText(/processing/i)).toBeInTheDocument();
 });

 await waitFor(() => {
 expect(screen.getByTestId('video-player')).toBeInTheDocument();
 });

 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('/api/watch/share123token/view'),
 expect.objectContaining({
 method: 'POST',
 })
 );
 });

 it('should handle insufficient credits during purchase', async () => {
 const user = userEvent.setup();

 const mockShareData = {
 success: true,
 video: {
 id: 'video999',
 title: 'Expensive Video',
 description: 'Costs more than user has',
 thumbnailUrl: '/expensive-thumb.jpg',
 duration: 300,
 creditCost: 200,
 category: 'premium',
 tags: ['expensive'],
 viewCount: 10,
 creator: {
 id: 'creator999',
 username: 'expensivecreator',
 displayName: 'Expensive Creator',
 avatar: '/expensive-avatar.jpg',
 },
 },
 hasAccess: false,
 accessType: 'token_preview',
 requiresPurchase: true,
 shareToken: 'expensive123',
 };

 const mockInsufficientResponse = {
 success: false,
 error: 'Insufficient credits',
 requiredCredits: 200,
 currentBalance: 100,
 };

 mockFetch
 .mockResolvedValueOnce({
 ok: true,
 json: async () => mockShareData,
 } as Response)
 .mockResolvedValueOnce({
 ok: false,
 status: 402,
 json: async () => mockInsufficientResponse,
 } as Response);

 const params = Promise.resolve({ identifier: 'expensive123' });
 
 render(await WatchPage({ params }));

 await waitFor(() => {
 expect(screen.getByText('Expensive Video')).toBeInTheDocument();
 });

 const purchaseButton = screen.getByRole('button', { name: /watch now/i });
 await user.click(purchaseButton);

 await waitFor(() => {
 expect(screen.getByText(/insufficient credits/i)).toBeInTheDocument();
 expect(screen.getByText(/top up/i)).toBeInTheDocument();
 });
 });
 });

 describe('Creator Self-Access Scenarios (Requirement 1.3)', () => {
 it('should allow creator to access their own video without purchase', async () => {

 mockUseAuth.mockReturnValue({
 isSignedIn: true,
 userId: 'creator123', // Same as video creator
 } as any);

 const mockCreatorVideoData = {
 success: true,
 video: {
 id: 'video123',
 title: 'My Creator Video',
 description: 'Video I created',
 thumbnailUrl: '/creator-thumb.jpg',
 duration: 150,
 creditCost: 8,
 category: 'tutorial',
 tags: ['tutorial', 'creator'],
 viewCount: 200,
 creator: {
 id: 'creator123',
 username: 'testcreator',
 displayName: 'Test Creator',
 avatar: '/creator-avatar.jpg',
 },
 },
 hasAccess: true,
 accessType: 'creator_self_access',
 requiresPurchase: false,
 };

 mockFetch.mockResolvedValue({
 ok: true,
 json: async () => mockCreatorVideoData,
 } as Response);

 const params = Promise.resolve({ identifier: 'video123' });
 
 render(await WatchPage({ params }));

 await waitFor(() => {
 expect(screen.getByText('My Creator Video')).toBeInTheDocument();
 expect(screen.queryByText(/watch for.*credits/i)).not.toBeInTheDocument();
 });
 });

 it('should allow creator to access their video via share token', async () => {

 mockUseAuth.mockReturnValue({
 isSignedIn: true,
 userId: 'creator456',
 } as any);

 const mockCreatorShareData = {
 success: true,
 video: {
 id: 'video456',
 title: 'My Shared Video',
 description: 'My video shared via token',
 thumbnailUrl: '/creator-shared-thumb.jpg',
 duration: 180,
 creditCost: 12,
 category: 'entertainment',
 tags: ['shared', 'creator'],
 viewCount: 150,
 creator: {
 id: 'creator456',
 username: 'sharecreator',
 displayName: 'Share Creator',
 avatar: '/creator-share-avatar.jpg',
 },
 },
 hasAccess: true,
 accessType: 'creator_self_access',
 requiresPurchase: false,
 shareToken: 'creator-share-token',
 };

 mockFetch.mockResolvedValue({
 ok: true,
 json: async () => mockCreatorShareData,
 } as Response);

 const params = Promise.resolve({ identifier: 'creator-share-token' });
 
 render(await WatchPage({ params }));

 await waitFor(() => {
 expect(screen.getByText('My Shared Video')).toBeInTheDocument();
 expect(screen.queryByText(/watch for.*credits/i)).not.toBeInTheDocument();
 });
 });
 });

 describe('Backward Compatibility with Existing URLs (Requirements 3.1, 3.2)', () => {
 it('should handle legacy /watch/[id] URLs correctly', async () => {

 const mockLegacyVideoData = {
 success: true,
 video: {
 id: 'legacy-video-123',
 title: 'Legacy Video',
 description: 'Old URL format',
 thumbnailUrl: '/legacy-thumb.jpg',
 duration: 90,
 creditCost: 3,
 category: 'legacy',
 tags: ['legacy'],
 viewCount: 500,
 creator: {
 id: 'legacy-creator',
 username: 'legacycreator',
 displayName: 'Legacy Creator',
 avatar: '/legacy-avatar.jpg',
 },
 },
 hasAccess: true,
 accessType: 'owned',
 requiresPurchase: false,
 };

 mockFetch.mockResolvedValue({
 ok: true,
 json: async () => mockLegacyVideoData,
 } as Response);

 const params = Promise.resolve({ identifier: 'legacy-video-123' });
 
 render(await WatchPage({ params }));

 await waitFor(() => {
 expect(screen.getByText('Legacy Video')).toBeInTheDocument();
 });

 expect(mockFetch).toHaveBeenCalledWith(
 expect.stringContaining('/api/watch/legacy-video-123'),
 expect.any(Object)
 );
 });

 it('should handle legacy /watch/[token] URLs correctly', async () => {

 const mockLegacyShareData = {
 success: true,
 video: {
 id: 'legacy-shared-video',
 title: 'Legacy Shared Video',
 description: 'Old share token format',
 thumbnailUrl: '/legacy-share-thumb.jpg',
 duration: 200,
 creditCost: 7,
 category: 'legacy-share',
 tags: ['legacy', 'shared'],
 viewCount: 300,
 creator: {
 id: 'legacy-share-creator',
 username: 'legacysharecreator',
 displayName: 'Legacy Share Creator',
 avatar: '/legacy-share-avatar.jpg',
 },
 },
 hasAccess: false,
 accessType: 'token_preview',
 requiresPurchase: true,
 shareToken: 'legacy-share-token-456',
 };

 mockFetch.mockResolvedValue({
 ok: true,
 json: async () => mockLegacyShareData,
 } as Response);

 const params = Promise.resolve({ identifier: 'legacy-share-token-456' });
 
 render(await WatchPage({ params }));

 await waitFor(() => {
 expect(screen.getByText('Legacy Shared Video')).toBeInTheDocument();
 expect(screen.getByText('Shared by Legacy Share Creator')).toBeInTheDocument();
 expect(screen.getByText('Watch for 7 Credits')).toBeInTheDocument();
 });
 });

 it('should handle UUID format identifiers correctly', async () => {

 const uuidIdentifier = '550e8400-e29b-41d4-a716-446655440000';
 
 const mockUuidVideoData = {
 success: true,
 video: {
 id: uuidIdentifier,
 title: 'UUID Video',
 description: 'Video with UUID identifier',
 thumbnailUrl: '/uuid-thumb.jpg',
 duration: 160,
 creditCost: 6,
 category: 'uuid-test',
 tags: ['uuid'],
 viewCount: 80,
 creator: {
 id: 'uuid-creator',
 username: 'uuidcreator',
 displayName: 'UUID Creator',
 avatar: '/uuid-avatar.jpg',
 },
 },
 hasAccess: true,
 accessType: 'owned',
 requiresPurchase: false,
 };

 mockFetch.mockResolvedValue({
 ok: true,
 json: async () => mockUuidVideoData,
 } as Response);

 const params = Promise.resolve({ identifier: uuidIdentifier });
 
 render(await WatchPage({ params }));

 await waitFor(() => {
 expect(screen.getByText('UUID Video')).toBeInTheDocument();
 });
 });
 });

 describe('Error Handling and User Experience (Requirement 3.3)', () => {
 it('should handle invalid identifiers gracefully', async () => {

 mockFetch.mockResolvedValue({
 ok: false,
 status: 400,
 json: async () => ({
 success: false,
 error: 'Invalid identifier provided',
 }),
 } as Response);

 const params = Promise.resolve({ identifier: 'invalid-id-123' });
 
 render(await WatchPage({ params }));

 await waitFor(() => {
 expect(screen.getByText(/invalid.*link/i)).toBeInTheDocument();
 expect(screen.getByText(/go to home/i)).toBeInTheDocument();
 });
 });

 it('should handle expired share tokens', async () => {

 mockFetch.mockResolvedValue({
 ok: false,
 status: 404,
 json: async () => ({
 success: false,
 error: 'Share token has expired',
 }),
 } as Response);

 const params = Promise.resolve({ identifier: 'expired-token-123' });
 
 render(await WatchPage({ params }));

 await waitFor(() => {
 expect(screen.getByText(/video not found/i)).toBeInTheDocument();
 expect(screen.getByText(/discover videos/i)).toBeInTheDocument();
 });
 });

 it('should handle network errors gracefully', async () => {

 mockFetch.mockRejectedValue(new Error('Network error'));

 const params = Promise.resolve({ identifier: 'network-test-123' });
 
 render(await WatchPage({ params }));

 await waitFor(() => {
 expect(screen.getByText(/connection problem/i)).toBeInTheDocument();
 expect(screen.getByText(/try again/i)).toBeInTheDocument();
 });
 });

 it('should handle server errors gracefully', async () => {

 mockFetch.mockResolvedValue({
 ok: false,
 status: 500,
 json: async () => ({
 success: false,
 error: 'Internal server error',
 }),
 } as Response);

 const params = Promise.resolve({ identifier: 'server-error-123' });
 
 render(await WatchPage({ params }));

 await waitFor(() => {
 expect(screen.getByText(/server.*error/i)).toBeInTheDocument();
 expect(screen.getByText(/try again/i)).toBeInTheDocument();
 });
 });
 });

 describe('Metadata Generation', () => {
 it('should generate correct metadata for video ID', async () => {

 const mockVideoData = {
 success: true,
 video: {
 id: 'meta-video-123',
 title: 'SEO Test Video',
 description: 'This is a test video for SEO metadata',
 thumbnailUrl: '/seo-thumb.jpg',
 duration: 240,
 creditCost: 15,
 category: 'tutorial',
 tags: ['seo', 'test'],
 viewCount: 200,
 creator: {
 id: 'seo-creator',
 username: 'seocreator',
 displayName: 'SEO Creator',
 avatar: '/seo-avatar.jpg',
 },
 },
 hasAccess: true,
 accessType: 'owned',
 requiresPurchase: false,
 };

 mockFetch.mockResolvedValue({
 ok: true,
 json: async () => mockVideoData,
 } as Response);

 const { generateMetadata } = await import('../page');
 const params = Promise.resolve({ identifier: 'meta-video-123' });
 
 const metadata = await generateMetadata({ params });

 expect(metadata.title).toBe('SEO Test Video | Crensa');
 expect(metadata.description).toBe('This is a test video for SEO metadata');
 expect(metadata.openGraph?.title).toBe('SEO Test Video');
 expect(metadata.openGraph?.description).toBe('This is a test video for SEO metadata');
 });

 it('should generate fallback metadata for invalid identifiers', async () => {

 mockFetch.mockRejectedValue(new Error('Network error'));

 const { generateMetadata } = await import('../page');
 const params = Promise.resolve({ identifier: 'invalid-meta-id' });
 
 const metadata = await generateMetadata({ params });

 expect(metadata.title).toBe('Watch Video | Crensa');
 expect(metadata.description).toBe('Watch video content on Crensa');
 });
 });
});