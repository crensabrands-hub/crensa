import React from 'react';
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';

describe('Member Layout Integration', () => {

 jest.mock('@/hooks/useResponsive', () => ({
 useResponsive: () => ({
 isMobile: false,
 isTablet: false,
 isTouchDevice: false,
 isSmallMobile: false,
 }),
 useSidebarTouch: () => ({
 sidebarTouchHandlers: {},
 }),
 }));

 const mockAuthContext = {
 user: { id: 'user1' },
 userProfile: {
 id: '1',
 clerkId: 'clerk_1',
 email: 'member@example.com',
 username: 'member',
 role: 'member',
 createdAt: new Date(),
 updatedAt: new Date(),
 },
 isLoading: false,
 isSignedIn: true,
 };

 const mockLayoutContext = {
 navigation: {
 activeRoute: '/dashboard',
 breadcrumbs: [
 { label: 'Dashboard', href: '/dashboard', active: true }
 ],
 sidebarOpen: false,
 mobileMenuOpen: false,
 },
 };

 const mockNotificationContext = {
 unreadCount: 3,
 };

 jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: () => mockAuthContext,
 }));

 jest.mock('@/contexts/LayoutContext', () => ({
 useLayout: () => mockLayoutContext,
 }));

 jest.mock('@/contexts/NotificationContext', () => ({
 useNotifications: () => mockNotificationContext,
 }));

 jest.mock('next/navigation', () => ({
 usePathname: () => '/dashboard',
 }));

 jest.mock('@/lib/mobile-optimization', () => ({
 getTouchOptimizedSpacing: () => ({
 buttonPadding: 'p-2',
 minTouchTarget: 'min-h-[44px]',
 iconSize: 'w-5 h-5',
 listItemPadding: 'px-3 py-2',
 }),
 getOptimizedAnimationClasses: () => 'transition-all duration-200',
 prefersReducedMotion: () => false,
 getSidebarWidth: () => 'w-64',
 }));

 describe('MemberHeader Component', () => {
 it('should render member navigation items', async () => {
 const MemberHeader = (await import('@/components/layout/MemberHeader')).default;
 
 render(<MemberHeader />);

 expect(screen.getByText('Dashboard')).toBeInTheDocument();
 expect(screen.getByText('Discover')).toBeInTheDocument();
 expect(screen.getByText('Wallet')).toBeInTheDocument();
 expect(screen.getByText('Notifications')).toBeInTheDocument();
 });

 it('should show notification badge when there are unread notifications', async () => {
 const MemberHeader = (await import('@/components/layout/MemberHeader')).default;
 
 render(<MemberHeader />);

 expect(screen.getByText('3')).toBeInTheDocument(); // Badge count
 });

 it('should show Crensa logo and branding', async () => {
 const MemberHeader = (await import('@/components/layout/MemberHeader')).default;
 
 render(<MemberHeader />);

 expect(screen.getByText('Crensa')).toBeInTheDocument();
 });
 });

 describe('MemberSidebar Component', () => {
 it('should render member sidebar navigation', async () => {
 const MemberSidebar = (await import('@/components/layout/MemberSidebar')).default;
 
 render(<MemberSidebar isOpen={true} onClose={() => {}} />);

 expect(screen.getByText('Dashboard')).toBeInTheDocument();
 expect(screen.getByText('Discover')).toBeInTheDocument();
 expect(screen.getByText('Watch History')).toBeInTheDocument();
 expect(screen.getByText('Wallet')).toBeInTheDocument();
 expect(screen.getByText('Membership')).toBeInTheDocument();
 expect(screen.getByText('Notifications')).toBeInTheDocument();
 expect(screen.getByText('Profile')).toBeInTheDocument();
 expect(screen.getByText('Settings')).toBeInTheDocument();
 });

 it('should show member profile information', async () => {
 const MemberSidebar = (await import('@/components/layout/MemberSidebar')).default;
 
 render(<MemberSidebar isOpen={true} onClose={() => {}} />);

 expect(screen.getByText('member')).toBeInTheDocument();
 expect(screen.getByText('Member Account')).toBeInTheDocument();
 });

 it('should show quick actions for members', async () => {
 const MemberSidebar = (await import('@/components/layout/MemberSidebar')).default;
 
 render(<MemberSidebar isOpen={true} onClose={() => {}} />);

 expect(screen.getByText('Quick Actions')).toBeInTheDocument();
 expect(screen.getByText('Discover New Content →')).toBeInTheDocument();
 expect(screen.getByText('Top Up Wallet →')).toBeInTheDocument();
 });
 });

 describe('MemberLayout Component', () => {
 it('should render member layout with header and content', async () => {
 const MemberLayout = (await import('@/components/layout/MemberLayout')).default;
 
 render(
 <MemberLayout>
 <div data-testid="member-content">Member Dashboard Content</div>
 </MemberLayout>
 );

 expect(screen.getByTestId('member-content')).toBeInTheDocument();
 expect(screen.getByText('Member Dashboard Content')).toBeInTheDocument();
 });

 it('should show member quick actions when sidebar is not shown', async () => {
 const MemberLayout = (await import('@/components/layout/MemberLayout')).default;
 
 render(
 <MemberLayout showSidebar={false}>
 <div data-testid="member-content">Content</div>
 </MemberLayout>
 );

 expect(screen.getByText('Welcome back, member')).toBeInTheDocument();
 expect(screen.getByText('Member Account')).toBeInTheDocument();
 });

 it('should handle breadcrumbs correctly', async () => {
 const MemberLayout = (await import('@/components/layout/MemberLayout')).default;
 
 render(
 <MemberLayout>
 <div data-testid="member-content">Content</div>
 </MemberLayout>
 );

 expect(screen.getByTestId('member-content')).toBeInTheDocument();
 });
 });

 describe('Layout Component Integration', () => {
 it('should properly integrate member header and layout', async () => {
 const MemberLayout = (await import('@/components/layout/MemberLayout')).default;
 
 render(
 <MemberLayout>
 <div data-testid="dashboard-content">
 <h1>Member Dashboard</h1>
 <p>Welcome to your member dashboard</p>
 </div>
 </MemberLayout>
 );

 expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
 expect(screen.getByText('Member Dashboard')).toBeInTheDocument();
 expect(screen.getByText('Welcome to your member dashboard')).toBeInTheDocument();

 expect(screen.getByText('Welcome back, member')).toBeInTheDocument();
 });

 it('should handle responsive behavior', async () => {

 jest.doMock('@/hooks/useResponsive', () => ({
 useResponsive: () => ({
 isMobile: true,
 isTablet: false,
 isTouchDevice: true,
 isSmallMobile: false,
 }),
 useSidebarTouch: () => ({
 sidebarTouchHandlers: {},
 }),
 }));

 const MemberHeader = (await import('@/components/layout/MemberHeader')).default;
 
 render(<MemberHeader />);

 expect(screen.getByText('Crensa')).toBeInTheDocument();
 });
 });
});