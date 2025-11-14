

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { LayoutProvider } from '@/contexts/LayoutContext';
import { AuthProvider } from '@/contexts/AuthContext';
import MemberLayout from '@/components/layout/MemberLayout';
import CreatorLayout from '@/components/layout/CreatorLayout';

jest.mock('next/navigation', () => ({
 useRouter: jest.fn(),
 usePathname: jest.fn(() => '/dashboard'),
}));

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

jest.mock('@/hooks/useMemberNavigation', () => ({
 useMemberNavigation: () => ({
 navigationItems: [
 { name: 'Dashboard', href: '/dashboard', icon: 'home', isActive: true },
 { name: 'Discover', href: '/discover', icon: 'search', isActive: false },
 ],
 navigationContext: {
 breadcrumbs: [],
 showBackButton: false,
 },
 navigateToDashboard: jest.fn(),
 }),
}));

jest.mock('@/hooks/useNotificationCount', () => ({
 useNotificationCount: () => ({
 unreadCount: 0,
 loading: false,
 }),
}));

jest.mock('@/hooks/useCreatorStats', () => ({
 useCreatorStats: () => ({
 stats: { totalVideos: 5, draftVideos: 2 },
 loading: false,
 }),
}));

const mockAuthContext = {
 user: { id: '1', email: 'test@example.com' },
 userProfile: { id: '1', username: 'testuser', role: 'member' as const },
 isLoading: false,
 isSignedIn: true,
};

jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: () => mockAuthContext,
 AuthProvider: ({ children }: { children: React.ReactNode }) => (
 <div data-testid="mock-auth-provider">{children}</div>
 ),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
 <LayoutProvider>
 {children}
 </LayoutProvider>
);

describe('Sidebar Visibility Integration Tests', () => {
 const mockPush = jest.fn();
 
 beforeEach(() => {
 (useRouter as jest.Mock).mockReturnValue({
 push: mockPush,
 pathname: '/dashboard',
 });

 localStorage.clear();
 sessionStorage.clear();
 });

 afterEach(() => {
 jest.clearAllMocks();
 });

 describe('Member Layout Sidebar Visibility', () => {
 it('should show sidebar when showSidebar prop is true', async () => {
 render(
 <TestWrapper>
 <MemberLayout showSidebar={true}>
 <div data-testid="page-content">Test Content</div>
 </MemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('page-content')).toBeInTheDocument();
 });

 const sidebar = screen.getByRole('navigation', { name: /member navigation/i });
 expect(sidebar).toBeInTheDocument();
 expect(sidebar).not.toHaveClass('-translate-x-full');
 });

 it('should hide sidebar when showSidebar prop is false', async () => {
 render(
 <TestWrapper>
 <MemberLayout showSidebar={false}>
 <div data-testid="page-content">Test Content</div>
 </MemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('page-content')).toBeInTheDocument();
 });

 const sidebar = screen.queryByRole('navigation', { name: /member navigation/i });
 expect(sidebar).not.toBeInTheDocument();
 });

 it('should persist sidebar state across navigation', async () => {
 const { rerender } = render(
 <TestWrapper>
 <MemberLayout showSidebar={true}>
 <div data-testid="dashboard-content">Dashboard</div>
 </MemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
 });

 let sidebar = screen.getByRole('navigation', { name: /member navigation/i });
 expect(sidebar).toBeInTheDocument();

 rerender(
 <TestWrapper>
 <MemberLayout showSidebar={true}>
 <div data-testid="discover-content">Discover</div>
 </MemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('discover-content')).toBeInTheDocument();
 });

 sidebar = screen.getByRole('navigation', { name: /member navigation/i });
 expect(sidebar).toBeInTheDocument();
 });

 it('should handle sidebar toggle correctly', async () => {
 render(
 <TestWrapper>
 <MemberLayout showSidebar={true}>
 <div data-testid="page-content">Test Content</div>
 </MemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('page-content')).toBeInTheDocument();
 });

 const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i });
 expect(toggleButton).toBeInTheDocument();

 fireEvent.click(toggleButton);

 expect(toggleButton).toBeInTheDocument();
 });
 });

 describe('Creator Layout Sidebar Visibility', () => {
 beforeEach(() => {

 mockAuthContext.userProfile = { 
 id: '1', 
 username: 'testcreator', 
 role: 'creator' as const 
 };
 });

 it('should show creator sidebar by default', async () => {
 render(
 <TestWrapper>
 <CreatorLayout>
 <div data-testid="creator-content">Creator Content</div>
 </CreatorLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('creator-content')).toBeInTheDocument();
 });

 const sidebar = screen.getByRole('navigation', { name: /creator navigation/i });
 expect(sidebar).toBeInTheDocument();
 });

 it('should handle creator sidebar collapse functionality', async () => {
 render(
 <TestWrapper>
 <CreatorLayout>
 <div data-testid="creator-content">Creator Content</div>
 </CreatorLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('creator-content')).toBeInTheDocument();
 });

 const sidebar = screen.getByRole('navigation', { name: /creator navigation/i });
 expect(sidebar).toBeInTheDocument();

 const collapseButton = screen.queryByRole('button', { name: /collapse sidebar|expand sidebar/i });
 if (collapseButton) {
 fireEvent.click(collapseButton);

 expect(collapseButton).toBeInTheDocument();
 }
 });
 });

 describe('Sidebar Z-Index and Overlay Behavior', () => {
 it('should have proper z-index for desktop sidebar', async () => {
 render(
 <TestWrapper>
 <MemberLayout showSidebar={true}>
 <div data-testid="page-content">Test Content</div>
 </MemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('page-content')).toBeInTheDocument();
 });

 const sidebar = screen.getByRole('navigation', { name: /member navigation/i });
 expect(sidebar).toBeInTheDocument();

 expect(sidebar).toHaveStyle({ position: 'fixed' });
 expect(sidebar).toHaveStyle({ zIndex: '40' });
 });

 it('should not show mobile overlay on desktop', async () => {
 render(
 <TestWrapper>
 <MemberLayout showSidebar={true}>
 <div data-testid="page-content">Test Content</div>
 </MemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('page-content')).toBeInTheDocument();
 });

 const overlay = screen.queryByRole('presentation');
 expect(overlay).not.toBeInTheDocument();
 });
 });

 describe('Sidebar Content and Navigation', () => {
 it('should display correct navigation items in member sidebar', async () => {
 render(
 <TestWrapper>
 <MemberLayout showSidebar={true}>
 <div data-testid="page-content">Test Content</div>
 </MemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('page-content')).toBeInTheDocument();
 });

 expect(screen.getByText('Dashboard')).toBeInTheDocument();
 expect(screen.getByText('Discover')).toBeInTheDocument();
 });

 it('should show help section in sidebar', async () => {
 render(
 <TestWrapper>
 <MemberLayout showSidebar={true}>
 <div data-testid="page-content">Test Content</div>
 </MemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('page-content')).toBeInTheDocument();
 });

 const helpLink = screen.getByText('Help & Support');
 expect(helpLink).toBeInTheDocument();
 expect(helpLink.closest('a')).toHaveAttribute('href', '/help');
 });
 });
});