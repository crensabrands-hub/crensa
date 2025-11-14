import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import MemberHeader from '@/components/layout/MemberHeader';
import HomePageController from '@/components/layout/HomePageController';

jest.mock('next/navigation', () => ({
 useRouter: jest.fn(),
 usePathname: jest.fn(() => '/'),
}));

jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: jest.fn(),
}));

jest.mock('@/contexts/LayoutContext', () => ({
 useLayout: jest.fn(() => ({
 navigation: {
 breadcrumbs: [],
 activeRoute: '/',
 },
 })),
}));

jest.mock('@/contexts/NotificationContext', () => ({
 useNotifications: jest.fn(() => ({
 unreadCount: 0,
 })),
}));

jest.mock('@/hooks/useResponsive', () => ({
 useResponsive: jest.fn(() => ({
 isMobile: false,
 isTablet: false,
 isTouchDevice: false,
 isSmallMobile: false,
 })),
}));

jest.mock('@/lib/animations', () => ({
 smoothScrollTo: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>;

describe('Landing Page Access Control Integration', () => {
 const mockReplace = jest.fn();
 const mockPush = jest.fn();

 beforeEach(() => {
 jest.clearAllMocks();
 mockUseRouter.mockReturnValue({
 replace: mockReplace,
 push: mockPush,
 } as any);
 });

 describe('Unauthenticated User Experience', () => {
 beforeEach(() => {
 mockUseAuthContext.mockReturnValue({
 isSignedIn: false,
 userProfile: null,
 isLoading: false,
 user: null,
 } as any);
 });

 it('should show landing page with proper header for unauthenticated users', () => {
 render(
 <HomePageController>
 <Header />
 <div data-testid="landing-content">Landing Page Content</div>
 </HomePageController>
 );

 expect(screen.getByTestId('landing-content')).toBeInTheDocument();
 expect(screen.getAllByText('Crensa')[0]).toBeInTheDocument();
 expect(screen.getAllByText('Login')[0]).toBeInTheDocument();
 expect(screen.getAllByText('Sign Up')[0]).toBeInTheDocument();
 });

 it('should navigate to landing page when clicking logo', async () => {
 const user = userEvent.setup();
 
 render(<Header />);

 const logo = screen.getAllByText('Crensa')[0].closest('a');
 expect(logo).toHaveAttribute('href', '/');
 });
 });

 describe('Member User Experience', () => {
 beforeEach(() => {
 mockUseAuthContext.mockReturnValue({
 isSignedIn: true,
 userProfile: { 
 role: 'member', 
 id: '1', 
 username: 'testmember',
 email: 'member@test.com',
 clerkId: 'clerk_member_1',
 createdAt: new Date(),
 updatedAt: new Date(),
 },
 isLoading: false,
 user: { id: 'clerk_member_1' },
 } as any);
 });

 it('should redirect member users away from landing page', async () => {
 render(
 <HomePageController>
 <div data-testid="landing-content">Landing Page Content</div>
 </HomePageController>
 );

 await waitFor(() => {
 expect(mockReplace).toHaveBeenCalledWith('/dashboard');
 });
 });

 it('should show member header with dashboard link in logo', () => {
 render(<MemberHeader />);

 const logo = screen.getAllByText('Crensa')[0].closest('a');
 expect(logo).toHaveAttribute('href', '/dashboard');
 });

 it('should show dashboard navigation in member header', () => {
 render(<MemberHeader />);

 expect(screen.getByText('Dashboard')).toBeInTheDocument();
 expect(screen.getByText('Discover')).toBeInTheDocument();
 expect(screen.getByText('Wallet')).toBeInTheDocument();
 });
 });

 describe('Creator User Experience', () => {
 beforeEach(() => {
 mockUseAuthContext.mockReturnValue({
 isSignedIn: true,
 userProfile: { 
 role: 'creator', 
 id: '1', 
 username: 'testcreator',
 email: 'creator@test.com',
 clerkId: 'clerk_creator_1',
 createdAt: new Date(),
 updatedAt: new Date(),
 },
 isLoading: false,
 user: { id: 'clerk_creator_1' },
 } as any);
 });

 it('should redirect creator users away from landing page', async () => {
 render(
 <HomePageController>
 <div data-testid="landing-content">Landing Page Content</div>
 </HomePageController>
 );

 await waitFor(() => {
 expect(mockReplace).toHaveBeenCalledWith('/creator/dashboard');
 });
 });

 it('should show header with creator dashboard link in logo', () => {
 render(<Header />);

 const logo = screen.getAllByText('Crensa')[0].closest('a');
 expect(logo).toHaveAttribute('href', '/creator/dashboard');
 });

 it('should show dashboard link pointing to creator dashboard', () => {
 render(<Header />);

 const dashboardLinks = screen.getAllByText('Dashboard');
 const desktopDashboardLink = dashboardLinks[0].closest('a');
 expect(desktopDashboardLink).toHaveAttribute('href', '/creator/dashboard');
 });
 });

 describe('Loading States', () => {
 it('should show content immediately for unauthenticated users while loading', () => {
 mockUseAuthContext.mockReturnValue({
 isSignedIn: false,
 userProfile: null,
 isLoading: true,
 user: null,
 } as any);

 render(
 <HomePageController>
 <div data-testid="landing-content">Landing Page Content</div>
 </HomePageController>
 );

 expect(screen.getByTestId('landing-content')).toBeInTheDocument();
 expect(screen.queryByText('Checking authentication...')).not.toBeInTheDocument();
 });

 it('should show loading indicator for authenticated users', () => {
 mockUseAuthContext.mockReturnValue({
 isSignedIn: true,
 userProfile: null,
 isLoading: true,
 user: { id: 'clerk_user_1' },
 } as any);

 render(
 <HomePageController>
 <div data-testid="landing-content">Landing Page Content</div>
 </HomePageController>
 );

 expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
 expect(screen.queryByTestId('landing-content')).not.toBeInTheDocument();
 });

 it('should show redirect indicator when authenticated user is on landing page', () => {
 mockUseAuthContext.mockReturnValue({
 isSignedIn: true,
 userProfile: { 
 role: 'member', 
 id: '1', 
 username: 'testmember',
 email: 'member@test.com',
 clerkId: 'clerk_member_1',
 createdAt: new Date(),
 updatedAt: new Date(),
 },
 isLoading: false,
 user: { id: 'clerk_member_1' },
 } as any);

 render(
 <HomePageController>
 <div data-testid="landing-content">Landing Page Content</div>
 </HomePageController>
 );

 expect(screen.getByText('Redirecting to dashboard...')).toBeInTheDocument();
 expect(screen.queryByTestId('landing-content')).not.toBeInTheDocument();
 });
 });

 describe('Edge Cases', () => {
 it('should handle missing user profile gracefully', () => {
 mockUseAuthContext.mockReturnValue({
 isSignedIn: true,
 userProfile: null,
 isLoading: false,
 user: { id: 'clerk_user_1' },
 } as any);

 render(
 <HomePageController>
 <div data-testid="landing-content">Landing Page Content</div>
 </HomePageController>
 );

 expect(mockReplace).not.toHaveBeenCalled();
 expect(screen.getByTestId('landing-content')).toBeInTheDocument();
 });

 it('should handle unknown user roles gracefully', () => {
 mockUseAuthContext.mockReturnValue({
 isSignedIn: true,
 userProfile: { 
 role: 'unknown' as any, 
 id: '1', 
 username: 'testuser',
 email: 'user@test.com',
 clerkId: 'clerk_user_1',
 createdAt: new Date(),
 updatedAt: new Date(),
 },
 isLoading: false,
 user: { id: 'clerk_user_1' },
 } as any);

 render(<Header />);

 const logo = screen.getAllByText('Crensa')[0].closest('a');
 expect(logo).toHaveAttribute('href', '/');
 });
 });
});