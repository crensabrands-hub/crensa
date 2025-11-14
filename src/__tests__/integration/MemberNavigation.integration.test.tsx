import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import MemberHeader from '@/components/layout/MemberHeader';
import MemberSidebar from '@/components/layout/MemberSidebar';
import MemberLayout from '@/components/layout/MemberLayout';
import { useAuthContext } from '@/contexts/AuthContext';
import { useLayout } from '@/contexts/LayoutContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useResponsive } from '@/hooks/useResponsive';

jest.mock('next/navigation', () => ({
 useRouter: jest.fn(),
 usePathname: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: jest.fn(),
}));

jest.mock('@/contexts/LayoutContext', () => ({
 useLayout: jest.fn(),
}));

jest.mock('@/contexts/NotificationContext', () => ({
 useNotifications: jest.fn(),
}));

jest.mock('@/hooks/useResponsive', () => ({
 useResponsive: jest.fn(),
 useSidebarTouch: jest.fn(() => ({ sidebarTouchHandlers: {} })),
}));

jest.mock('@/hooks/useNotificationCount', () => ({
 useNotificationCount: jest.fn(() => ({ unreadCount: 2, loading: false })),
}));

jest.mock('@/components/profile', () => ({
 ProfileDropdown: () => <div data-testid="profile-dropdown">Profile</div>,
}));

const mockRouter = {
 push: jest.fn(),
 back: jest.fn(),
};

const mockAuthContext = {
 user: { id: '1' },
 userProfile: { username: 'testuser', role: 'member' },
 hasRole: jest.fn((role: string) => role === 'member'),
 isLoading: false,
 isSignedIn: true,
};

const mockLayoutContext = {
 navigation: {
 activeRoute: '/dashboard',
 breadcrumbs: [],
 },
};

const mockNotificationContext = {
 unreadCount: 2,
};

const mockResponsive = {
 isMobile: false,
 isTablet: false,
 isTouchDevice: false,
 isSmallMobile: false,
};

describe('Member Navigation Integration', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 (useRouter as jest.Mock).mockReturnValue(mockRouter);
 (useAuthContext as jest.Mock).mockReturnValue(mockAuthContext);
 (useLayout as jest.Mock).mockReturnValue(mockLayoutContext);
 (useNotifications as jest.Mock).mockReturnValue(mockNotificationContext);
 (useResponsive as jest.Mock).mockReturnValue(mockResponsive);
 (usePathname as jest.Mock).mockReturnValue('/dashboard');
 });

 describe('MemberHeader', () => {
 it('should render all navigation items', () => {
 render(<MemberHeader />);
 
 expect(screen.getByText('Dashboard')).toBeInTheDocument();
 expect(screen.getByText('Discover')).toBeInTheDocument();
 expect(screen.getByText('Reels')).toBeInTheDocument();
 expect(screen.getByText('Wallet')).toBeInTheDocument();
 expect(screen.getByText('Membership')).toBeInTheDocument();
 expect(screen.getByText('Notifications')).toBeInTheDocument();
 });

 it('should show notification badge when there are unread notifications', () => {
 render(<MemberHeader />);
 
 const notificationBadge = screen.getByText('2');
 expect(notificationBadge).toBeInTheDocument();
 expect(notificationBadge).toHaveClass('bg-accent-pink');
 });

 it('should highlight active navigation item', () => {
 render(<MemberHeader />);
 
 const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
 expect(dashboardLink).toHaveClass('bg-primary-neon-yellow');
 });

 it('should show mobile menu when on mobile', () => {
 (useResponsive as jest.Mock).mockReturnValue({
 ...mockResponsive,
 isMobile: true,
 });

 render(<MemberHeader />);
 
 const menuButton = screen.getByLabelText('Open mobile menu');
 expect(menuButton).toBeInTheDocument();
 
 fireEvent.click(menuButton);

 expect(screen.getByPlaceholderText('Search videos...')).toBeInTheDocument();
 });
 });

 describe('MemberSidebar', () => {
 it('should render all navigation items with proper structure', () => {
 render(<MemberSidebar isOpen={true} onClose={jest.fn()} />);
 
 expect(screen.getByText('Dashboard')).toBeInTheDocument();
 expect(screen.getByText('Discover')).toBeInTheDocument();
 expect(screen.getByText('Reels')).toBeInTheDocument();
 expect(screen.getByText('Wallet')).toBeInTheDocument();
 expect(screen.getByText('Membership')).toBeInTheDocument();
 expect(screen.getByText('Notifications')).toBeInTheDocument();
 expect(screen.getByText('Profile')).toBeInTheDocument();
 expect(screen.getByText('Settings')).toBeInTheDocument();
 });

 it('should show member portal branding', () => {
 render(<MemberSidebar isOpen={true} onClose={jest.fn()} />);
 
 expect(screen.getByText('Crensa')).toBeInTheDocument();
 expect(screen.getByText('Member Portal')).toBeInTheDocument();
 });

 it('should show user profile summary', () => {
 render(<MemberSidebar isOpen={true} onClose={jest.fn()} />);
 
 expect(screen.getByText('testuser')).toBeInTheDocument();
 expect(screen.getByText('Member Account')).toBeInTheDocument();
 });

 it('should show quick actions section', () => {
 render(<MemberSidebar isOpen={true} onClose={jest.fn()} />);
 
 expect(screen.getByText('Quick Actions')).toBeInTheDocument();
 expect(screen.getByText('Discover New Content →')).toBeInTheDocument();
 expect(screen.getByText('Top Up Wallet →')).toBeInTheDocument();
 });

 it('should call onClose when navigation item is clicked on mobile', () => {
 (useResponsive as jest.Mock).mockReturnValue({
 ...mockResponsive,
 isMobile: true,
 });

 const onClose = jest.fn();
 render(<MemberSidebar isOpen={true} onClose={onClose} />);
 
 const discoverLink = screen.getByRole('link', { name: /discover/i });
 fireEvent.click(discoverLink);
 
 expect(onClose).toHaveBeenCalled();
 });
 });

 describe('MemberLayout', () => {
 it('should render children within layout structure', () => {
 render(
 <MemberLayout>
 <div data-testid="test-content">Test Content</div>
 </MemberLayout>
 );
 
 expect(screen.getByTestId('test-content')).toBeInTheDocument();
 });

 it('should show breadcrumbs when available', () => {
 (usePathname as jest.Mock).mockReturnValue('/wallet');
 
 render(
 <MemberLayout>
 <div>Content</div>
 </MemberLayout>
 );

 const breadcrumbNav = screen.getByLabelText('Breadcrumb');
 expect(breadcrumbNav).toBeInTheDocument();

 const breadcrumbLinks = screen.getAllByText('Dashboard');
 const walletElements = screen.getAllByText('Wallet');
 expect(breadcrumbLinks.length).toBeGreaterThan(0);
 expect(walletElements.length).toBeGreaterThan(0);
 });

 it('should show quick actions bar when sidebar is not shown', () => {
 render(
 <MemberLayout showSidebar={false}>
 <div>Content</div>
 </MemberLayout>
 );
 
 expect(screen.getByText('Welcome back, testuser')).toBeInTheDocument();
 expect(screen.getByText('Member Account')).toBeInTheDocument();
 });

 it('should handle sidebar toggle correctly', () => {
 render(
 <MemberLayout showSidebar={true}>
 <div>Content</div>
 </MemberLayout>
 );

 const sidebarToggle = screen.getByLabelText('Open sidebar');
 expect(sidebarToggle).toBeInTheDocument();
 });
 });

 describe('Navigation Integration', () => {
 it('should maintain consistent navigation state across components', () => {
 (usePathname as jest.Mock).mockReturnValue('/discover');
 mockLayoutContext.navigation.activeRoute = '/discover';

 const { rerender } = render(<MemberHeader />);

 const headerDiscoverLink = screen.getByRole('link', { name: /discover/i });
 expect(headerDiscoverLink).toHaveClass('bg-primary-neon-yellow');

 rerender(<MemberSidebar isOpen={true} onClose={jest.fn()} />);
 
 const sidebarDiscoverLink = screen.getByRole('menuitem', { name: /discover/i });
 expect(sidebarDiscoverLink).toHaveClass('bg-primary-neon-yellow');
 });

 it('should handle navigation between different sections', async () => {
 render(<MemberHeader />);
 
 const walletLink = screen.getByRole('link', { name: /wallet/i });
 fireEvent.click(walletLink);

 expect(walletLink).toHaveAttribute('href', '/wallet');
 });

 it('should show appropriate navigation for member role', () => {
 render(<MemberSidebar isOpen={true} onClose={jest.fn()} />);

 expect(screen.getByText('Dashboard')).toBeInTheDocument();
 expect(screen.getByText('Membership')).toBeInTheDocument();

 expect(screen.queryByText('Creator Studio')).not.toBeInTheDocument();
 expect(screen.queryByText('Upload Video')).not.toBeInTheDocument();
 });
 });
});