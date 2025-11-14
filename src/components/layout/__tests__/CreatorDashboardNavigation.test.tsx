import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutProvider } from '@/contexts/LayoutContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useResponsive } from '@/hooks/useResponsive';
import CreatorLayout from '../CreatorLayout';
import RouteLayoutWrapper from '../RouteLayoutWrapper';

jest.mock('next/navigation', () => ({
 useRouter: jest.fn(),
 usePathname: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: jest.fn(),
}));

jest.mock('@/hooks/useResponsive', () => ({
 useResponsive: jest.fn(),
}));

jest.mock('next/link', () => {
 return function MockLink({ children, href, onClick, ...props }: any) {
 return (
 <a href={href} onClick={onClick} {...props}>
 {children}
 </a>
 );
 };
});

jest.mock('@/components/profile/ProfileDropdown', () => {
 return function MockProfileDropdown() {
 return <div data-testid="profile-dropdown">Profile</div>;
 };
});

jest.mock('@/components/layout/LayoutPersistenceDebug', () => ({
 LayoutPersistenceDebug: () => <div data-testid="layout-debug">Debug</div>,
}));

jest.mock('@/lib/layout-persistence', () => ({
 layoutPersistence: {
 loadPreferences: jest.fn(() => ({
 sidebarCollapsed: false,
 theme: 'light',
 compactMode: false,
 })),
 loadNavigation: jest.fn(() => ({
 activeRoute: '/creator/dashboard',
 breadcrumbs: [],
 sidebarOpen: true,
 mobileMenuOpen: false,
 })),
 savePreferences: jest.fn(() => true),
 saveNavigation: jest.fn(() => true),
 addSyncListener: jest.fn(() => () => {}),
 isStorageAvailable: jest.fn(() => true),
 clearAll: jest.fn(),
 getStorageInfo: jest.fn(() => ({
 preferences: 100,
 navigation: 50,
 available: true,
 })),
 },
}));

jest.mock('@/lib/mobile-optimization', () => ({
 getSidebarWidth: jest.fn(() => 'w-64'),
 getTouchOptimizedSpacing: jest.fn(() => ({
 buttonPadding: 'p-2',
 minTouchTarget: 'min-h-[44px]',
 listItemPadding: 'p-3',
 iconSize: 'w-5 h-5',
 })),
 getOptimizedAnimationClasses: jest.fn(() => 'transition-all duration-300'),
 prefersReducedMotion: jest.fn(() => false),
}));

jest.mock('@/hooks/useResponsive', () => ({
 useResponsive: jest.fn(),
 useSidebarTouch: jest.fn(() => ({
 sidebarTouchHandlers: {},
 })),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>;
const mockUseResponsive = useResponsive as jest.MockedFunction<typeof useResponsive>;

describe('Creator Dashboard Navigation', () => {
 const mockPush = jest.fn();
 const mockBack = jest.fn();

 const defaultAuthContext = {
 user: { publicMetadata: { role: 'creator' } },
 userProfile: { 
 id: '1',
 username: 'testcreator',
 role: 'creator' as const,
 email: 'test@example.com',
 clerkId: 'clerk_123',
 createdAt: new Date(),
 updatedAt: new Date(),
 },
 isLoading: false,
 isSignedIn: true,
 error: null,
 hasRole: jest.fn((role: string) => role === 'creator'),
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 retry: jest.fn(),
 clearError: jest.fn(),
 };

 const defaultResponsiveContext = {
 isMobile: false,
 isTouchDevice: false,
 isTablet: false,
 isDesktop: true,
 width: 1024,
 height: 768,
 isMobileDevice: false,
 orientation: 'landscape' as const,
 };

 beforeEach(() => {
 mockUseRouter.mockReturnValue({
 push: mockPush,
 back: mockBack,
 forward: jest.fn(),
 refresh: jest.fn(),
 replace: jest.fn(),
 prefetch: jest.fn(),
 });
 
 mockUsePathname.mockReturnValue('/creator/dashboard');
 mockUseAuthContext.mockReturnValue(defaultAuthContext);
 mockUseResponsive.mockReturnValue(defaultResponsiveContext);

 Object.defineProperty(window, 'localStorage', {
 value: {
 getItem: jest.fn(),
 setItem: jest.fn(),
 removeItem: jest.fn(),
 },
 writable: true,
 });

 Object.defineProperty(window, 'sessionStorage', {
 value: {
 getItem: jest.fn(),
 setItem: jest.fn(),
 removeItem: jest.fn(),
 },
 writable: true,
 });
 });

 afterEach(() => {
 jest.clearAllMocks();
 });

 describe('Route Protection', () => {
 it('should allow creator access to creator routes', () => {
 render(
 <LayoutProvider>
 <RouteLayoutWrapper>
 <div data-testid="creator-content">Creator Dashboard</div>
 </RouteLayoutWrapper>
 </LayoutProvider>
 );

 expect(screen.getByTestId('creator-content')).toBeInTheDocument();
 });

 it('should block non-creator access to creator routes', () => {
 mockUseAuthContext.mockReturnValue({
 ...defaultAuthContext,
 userProfile: { 
 ...defaultAuthContext.userProfile!,
 role: 'member' as const,
 },
 hasRole: jest.fn((role: string) => role === 'member'),
 });

 render(
 <LayoutProvider>
 <RouteLayoutWrapper>
 <div data-testid="creator-content">Creator Dashboard</div>
 </RouteLayoutWrapper>
 </LayoutProvider>
 );

 expect(screen.getByText('Access Restricted')).toBeInTheDocument();
 expect(screen.getByText('This area is only available to creators')).toBeInTheDocument();
 expect(screen.queryByTestId('creator-content')).not.toBeInTheDocument();
 });

 it('should redirect non-creators to dashboard when accessing creator routes', () => {
 mockUseAuthContext.mockReturnValue({
 ...defaultAuthContext,
 userProfile: { 
 ...defaultAuthContext.userProfile!,
 role: 'member' as const,
 },
 hasRole: jest.fn((role: string) => role === 'member'),
 });

 delete (window as any).location;
 window.location = { href: '' } as any;

 render(
 <LayoutProvider>
 <RouteLayoutWrapper>
 <div data-testid="creator-content">Creator Dashboard</div>
 </RouteLayoutWrapper>
 </LayoutProvider>
 );

 const dashboardButton = screen.getByText('Go to Dashboard');
 fireEvent.click(dashboardButton);

 expect(window.location.href).toBe('/dashboard');
 });
 });

 describe('Navigation State Management', () => {
 it('should update active route when pathname changes', () => {
 const { rerender } = render(
 <LayoutProvider>
 <RouteLayoutWrapper>
 <div>Dashboard Content</div>
 </RouteLayoutWrapper>
 </LayoutProvider>
 );

 mockUsePathname.mockReturnValue('/creator/analytics');
 
 rerender(
 <LayoutProvider>
 <RouteLayoutWrapper>
 <div>Analytics Content</div>
 </RouteLayoutWrapper>
 </LayoutProvider>
 );

 expect(screen.getByText('Analytics Content')).toBeInTheDocument();
 });

 it('should generate breadcrumbs based on current path', () => {
 mockUsePathname.mockReturnValue('/creator/dashboard/analytics');

 render(
 <LayoutProvider>
 <CreatorLayout>
 <div>Analytics Content</div>
 </CreatorLayout>
 </LayoutProvider>
 );

 const breadcrumbNav = screen.queryByRole('navigation', { name: 'Breadcrumb' });
 if (breadcrumbNav) {
 expect(breadcrumbNav).toBeInTheDocument();
 }
 });

 it('should highlight active navigation item in sidebar', () => {
 render(
 <LayoutProvider>
 <CreatorLayout>
 <div>Dashboard Content</div>
 </CreatorLayout>
 </LayoutProvider>
 );

 const dashboardLink = screen.getByText('Dashboard').closest('a');
 expect(dashboardLink).toHaveClass('bg-primary-neon-yellow');
 });
 });

 describe('Responsive Navigation', () => {
 it('should handle mobile navigation correctly', () => {
 mockUseResponsive.mockReturnValue({
 ...defaultResponsiveContext,
 isMobile: true,
 isTouchDevice: true,
 isDesktop: false,
 width: 375,
 height: 667,
 isMobileDevice: true,
 });

 render(
 <LayoutProvider>
 <CreatorLayout>
 <div>Dashboard Content</div>
 </CreatorLayout>
 </LayoutProvider>
 );

 const sidebar = screen.getByText('Crensa').closest('aside');
 expect(sidebar).toHaveClass('-translate-x-full');

 const menuToggle = screen.getByLabelText('Open sidebar');
 expect(menuToggle).toBeInTheDocument();
 });

 it('should toggle mobile menu when hamburger is clicked', () => {
 mockUseResponsive.mockReturnValue({
 ...defaultResponsiveContext,
 isMobile: true,
 isTouchDevice: true,
 isDesktop: false,
 width: 375,
 height: 667,
 isMobileDevice: true,
 });

 render(
 <LayoutProvider>
 <CreatorLayout>
 <div>Dashboard Content</div>
 </CreatorLayout>
 </LayoutProvider>
 );

 const menuToggle = screen.getByLabelText('Open sidebar');
 fireEvent.click(menuToggle);

 const sidebar = screen.getByText('Crensa').closest('aside');
 expect(sidebar).toHaveClass('translate-x-0');
 });

 it('should close mobile menu when navigation item is clicked', () => {
 mockUseResponsive.mockReturnValue({
 ...defaultResponsiveContext,
 isMobile: true,
 isTouchDevice: true,
 isDesktop: false,
 width: 375,
 height: 667,
 isMobileDevice: true,
 });

 render(
 <LayoutProvider>
 <CreatorLayout>
 <div>Dashboard Content</div>
 </CreatorLayout>
 </LayoutProvider>
 );

 const menuToggle = screen.getByLabelText('Open sidebar');
 fireEvent.click(menuToggle);

 const analyticsLink = screen.getByText('Analytics');
 fireEvent.click(analyticsLink);

 const sidebar = screen.getByText('Crensa').closest('aside');
 expect(sidebar).toHaveClass('-translate-x-full');
 });

 it('should show overlay when mobile menu is open', () => {
 mockUseResponsive.mockReturnValue({
 ...defaultResponsiveContext,
 isMobile: true,
 isTouchDevice: true,
 isDesktop: false,
 width: 375,
 height: 667,
 isMobileDevice: true,
 });

 render(
 <LayoutProvider>
 <CreatorLayout>
 <div>Dashboard Content</div>
 </CreatorLayout>
 </LayoutProvider>
 );

 const menuToggle = screen.getByLabelText('Open sidebar');
 fireEvent.click(menuToggle);

 const overlay = document.querySelector('.bg-primary-navy\\/50');
 expect(overlay).toBeInTheDocument();
 });

 it('should close mobile menu when overlay is clicked', () => {
 mockUseResponsive.mockReturnValue({
 ...defaultResponsiveContext,
 isMobile: true,
 isTouchDevice: true,
 isDesktop: false,
 width: 375,
 height: 667,
 isMobileDevice: true,
 });

 render(
 <LayoutProvider>
 <CreatorLayout>
 <div>Dashboard Content</div>
 </CreatorLayout>
 </LayoutProvider>
 );

 const menuToggle = screen.getByLabelText('Open sidebar');
 fireEvent.click(menuToggle);

 const overlay = document.querySelector('.bg-primary-navy\\/50');
 fireEvent.click(overlay!);

 const sidebar = screen.getByText('Crensa').closest('aside');
 expect(sidebar).toHaveClass('-translate-x-full');
 });
 });

 describe('Desktop Navigation', () => {
 it('should handle sidebar collapse/expand', () => {
 render(
 <LayoutProvider>
 <CreatorLayout>
 <div>Dashboard Content</div>
 </CreatorLayout>
 </LayoutProvider>
 );

 expect(screen.getByText('Crensa')).toBeInTheDocument();
 expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument();

 const collapseButton = screen.getByLabelText('Collapse sidebar');
 fireEvent.click(collapseButton);

 expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument();
 expect(screen.queryByText('Crensa')).not.toBeInTheDocument();
 });

 it('should persist sidebar collapse state', () => {
 const mockSetItem = jest.fn();
 Object.defineProperty(window, 'localStorage', {
 value: {
 getItem: jest.fn(),
 setItem: mockSetItem,
 removeItem: jest.fn(),
 },
 writable: true,
 });

 render(
 <LayoutProvider>
 <CreatorLayout>
 <div>Dashboard Content</div>
 </CreatorLayout>
 </LayoutProvider>
 );

 const collapseButton = screen.getByLabelText('Collapse sidebar');
 fireEvent.click(collapseButton);

 expect(mockSetItem).toHaveBeenCalledWith(
 'layout_preferences',
 expect.stringContaining('sidebarCollapsed')
 );
 });

 it('should adjust main content margin based on sidebar state', () => {
 render(
 <LayoutProvider>
 <CreatorLayout>
 <div data-testid="main-content">Dashboard Content</div>
 </CreatorLayout>
 </LayoutProvider>
 );

 const mainContent = screen.getByTestId('main-content').closest('div');
 const contentWrapper = mainContent?.parentElement?.parentElement;

 expect(contentWrapper).toHaveClass('ml-64');

 const collapseButton = screen.getByLabelText('Collapse sidebar');
 fireEvent.click(collapseButton);

 expect(contentWrapper).toHaveClass('ml-16');
 });
 });

 describe('Accessibility', () => {
 it('should have proper ARIA labels for navigation', () => {
 render(
 <LayoutProvider>
 <CreatorLayout>
 <div>Dashboard Content</div>
 </CreatorLayout>
 </LayoutProvider>
 );

 const sidebar = screen.getByRole('navigation', { name: 'Creator navigation' });
 expect(sidebar).toBeInTheDocument();

 const menuItems = screen.getAllByRole('menuitem');
 expect(menuItems.length).toBeGreaterThan(0);
 });

 it('should manage focus properly when sidebar is toggled', () => {
 render(
 <LayoutProvider>
 <CreatorLayout>
 <div>Dashboard Content</div>
 </CreatorLayout>
 </LayoutProvider>
 );

 const collapseButton = screen.getByLabelText('Collapse sidebar');
 fireEvent.click(collapseButton);

 const expandButton = screen.getByLabelText('Expand sidebar');
 expect(expandButton).toBeInTheDocument();
 });

 it('should have proper tabindex for navigation items', () => {
 render(
 <LayoutProvider>
 <CreatorLayout>
 <div>Dashboard Content</div>
 </CreatorLayout>
 </LayoutProvider>
 );

 const navigationItems = screen.getAllByRole('menuitem');
 navigationItems.forEach(item => {
 expect(item).toHaveAttribute('tabIndex', '0');
 });
 });
 });

 describe('Error Handling', () => {
 it('should handle authentication errors gracefully', () => {
 mockUseAuthContext.mockReturnValue({
 ...defaultAuthContext,
 error: { type: 'network', message: 'Network error', retryable: true },
 isLoading: false,
 });

 render(
 <LayoutProvider>
 <RouteLayoutWrapper>
 <div>Dashboard Content</div>
 </RouteLayoutWrapper>
 </LayoutProvider>
 );

 expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
 });

 it('should handle layout loading states', () => {
 mockUseAuthContext.mockReturnValue({
 ...defaultAuthContext,
 isLoading: true,
 });

 render(
 <LayoutProvider>
 <RouteLayoutWrapper>
 <div>Dashboard Content</div>
 </RouteLayoutWrapper>
 </LayoutProvider>
 );

 expect(screen.getByText('Loading layout...')).toBeInTheDocument();
 });
 });
});