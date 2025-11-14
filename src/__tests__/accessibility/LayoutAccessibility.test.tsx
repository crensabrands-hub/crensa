

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayoutProvider } from '@/contexts/LayoutContext';
import { AuthProvider } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext', () => ({
 AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
 useAuthContext: jest.fn(),
}));

jest.mock('@/hooks/useResponsive', () => ({
 useResponsive: jest.fn(),
 useSidebarTouch: jest.fn(() => ({ sidebarTouchHandlers: {} })),
}));

jest.mock('next/navigation', () => ({
 usePathname: jest.fn(() => '/creator/dashboard'),
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

jest.mock('@/lib/layout-persistence', () => ({
 layoutPersistence: {
 loadPreferences: jest.fn(() => ({
 sidebarCollapsed: false,
 theme: 'light' as const,
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
 isStorageAvailable: jest.fn(() => true),
 addSyncListener: jest.fn(() => () => {}),
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
 buttonPadding: 'p-3',
 listItemPadding: 'p-3',
 minTouchTarget: 'min-h-[44px]',
 iconSize: 'w-6 h-6',
 })),
 getOptimizedAnimationClasses: jest.fn(() => 'transition-all duration-300'),
 prefersReducedMotion: jest.fn(() => false),
}));

const { useAuthContext } = require('@/contexts/AuthContext');
const { useResponsive } = require('@/hooks/useResponsive');

function AccessibleLayoutComponent() {
 const { useLayout } = require('@/contexts/LayoutContext');
 const layout = useLayout();
 
 return (
 <div>
 {}
 <div className="sr-only">
 <a href="#main-content" className="skip-link">
 Skip to main content
 </a>
 <a href="#navigation" className="skip-link">
 Skip to navigation
 </a>
 </div>

 {}
 <header role="banner" aria-label="Site header">
 <div className="flex items-center justify-between p-4">
 <h1 className="text-xl font-bold">Creator Studio</h1>
 <button
 data-testid="sidebar-toggle"
 onClick={() => layout.setSidebarOpen(!layout.navigation.sidebarOpen)}
 aria-expanded={layout.navigation.sidebarOpen}
 aria-controls="sidebar-navigation"
 aria-label={layout.navigation.sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
 className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
 >
 <span aria-hidden="true">☰</span>
 </button>
 </div>
 </header>

 {}
 <aside
 id="sidebar-navigation"
 role="navigation"
 aria-label="Main navigation"
 aria-hidden={!layout.navigation.sidebarOpen}
 className={`fixed top-0 left-0 z-50 h-full bg-white shadow-xl transition-transform duration-300 ${
 layout.navigation.sidebarOpen ? 'translate-x-0' : '-translate-x-full'
 } w-64`}
 >
 <div className="p-4">
 <nav role="navigation" aria-label="Creator navigation">
 <ul role="menubar" aria-orientation="vertical">
 <li role="none">
 <a
 href="/creator/dashboard"
 role="menuitem"
 tabIndex={layout.navigation.sidebarOpen ? 0 : -1}
 aria-current={layout.navigation.activeRoute === '/creator/dashboard' ? 'page' : undefined}
 className="block p-3 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
 data-testid="nav-dashboard"
 >
 <span aria-hidden="true">📊</span>
 <span className="ml-2">Dashboard</span>
 </a>
 </li>
 <li role="none">
 <a
 href="/creator/upload"
 role="menuitem"
 tabIndex={layout.navigation.sidebarOpen ? 0 : -1}
 aria-current={layout.navigation.activeRoute === '/creator/upload' ? 'page' : undefined}
 className="block p-3 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
 data-testid="nav-upload"
 >
 <span aria-hidden="true">📤</span>
 <span className="ml-2">Upload Video</span>
 <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full" aria-label="3 drafts">
 3
 </span>
 </a>
 </li>
 <li role="none">
 <a
 href="/creator/analytics"
 role="menuitem"
 tabIndex={layout.navigation.sidebarOpen ? 0 : -1}
 aria-current={layout.navigation.activeRoute === '/creator/analytics' ? 'page' : undefined}
 className="block p-3 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
 data-testid="nav-analytics"
 >
 <span aria-hidden="true">📈</span>
 <span className="ml-2">Analytics</span>
 </a>
 </li>
 </ul>
 </nav>

 <button
 data-testid="close-sidebar"
 onClick={() => layout.setSidebarOpen(false)}
 aria-label="Close navigation sidebar"
 className="mt-4 p-2 bg-blue-500 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-700"
 >
 Close
 </button>
 </div>
 </aside>

 {}
 <main
 id="main-content"
 role="main"
 aria-label="Main content"
 className={`transition-all duration-300 ${
 layout.navigation.sidebarOpen ? 'ml-64' : 'ml-0'
 } pt-16`}
 >
 <div className="p-6">
 <h2 className="text-2xl font-bold mb-4">Creator Dashboard</h2>
 <p>Main content area</p>
 
 {}
 {layout.navigation.breadcrumbs.length > 0 && (
 <nav aria-label="Breadcrumb" className="mt-4">
 <ol className="flex space-x-2">
 {layout.navigation.breadcrumbs.map((crumb: any, index: number) => (
 <li key={crumb.href} className="flex items-center">
 {index > 0 && <span aria-hidden="true" className="mx-2">/</span>}
 <a
 href={crumb.href}
 aria-current={crumb.active ? 'page' : undefined}
 className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
 >
 {crumb.label}
 </a>
 </li>
 ))}
 </ol>
 </nav>
 )}

 {}
 <div className="mt-6 space-y-4">
 <button
 data-testid="set-breadcrumbs"
 onClick={() => layout.setBreadcrumbs([
 { label: 'Home', href: '/', active: false },
 { label: 'Creator', href: '/creator', active: false },
 { label: 'Dashboard', href: '/creator/dashboard', active: true }
 ])}
 className="px-4 py-2 bg-green-500 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-700"
 >
 Set Breadcrumbs
 </button>
 
 <button
 data-testid="clear-breadcrumbs"
 onClick={() => layout.setBreadcrumbs([])}
 className="px-4 py-2 bg-red-500 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-700"
 >
 Clear Breadcrumbs
 </button>
 </div>
 </div>
 </main>

 {}
 <div
 aria-live="polite"
 aria-atomic="true"
 className="sr-only"
 data-testid="live-region"
 >
 {layout.navigation.sidebarOpen ? 'Navigation opened' : 'Navigation closed'}
 </div>

 {}
 <div className="sr-only" data-testid="status-info">
 Current layout: {layout.currentLayout}
 {layout.isLayoutLoading && ', Loading'}
 {layout.error && `, Error: ${layout.error}`}
 </div>
 </div>
 );
}

function TestWrapper({ children }: { children: React.ReactNode }) {
 return (
 <AuthProvider>
 <LayoutProvider>
 {children}
 </LayoutProvider>
 </AuthProvider>
 );
}

describe('Layout Accessibility', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 
 useAuthContext.mockReturnValue({
 user: { publicMetadata: { role: 'creator' } },
 userProfile: { username: 'testcreator', role: 'creator' },
 isLoading: false,
 hasRole: jest.fn(() => true),
 isSignedIn: true,
 error: null,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 lastFetch: Date.now(),
 });

 useResponsive.mockReturnValue({
 isMobile: false,
 isTablet: false,
 isDesktop: true,
 isTouchDevice: false,
 width: 1024,
 height: 768,
 isMobileDevice: false,
 orientation: 'landscape',
 isSmallMobile: false,
 });
 });

 describe('Semantic HTML and ARIA', () => {
 it('should have proper landmark roles', async () => {
 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByRole('banner')).toBeInTheDocument();
 expect(screen.getByRole('main')).toBeInTheDocument();
 expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
 });
 });

 it('should have proper ARIA labels and descriptions', async () => {
 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 const sidebarToggle = screen.getByTestId('sidebar-toggle');
 expect(sidebarToggle).toHaveAttribute('aria-expanded', 'true');
 expect(sidebarToggle).toHaveAttribute('aria-controls', 'sidebar-navigation');
 expect(sidebarToggle).toHaveAttribute('aria-label', 'Close sidebar');
 });

 const sidebar = screen.getByRole('navigation', { name: 'Main navigation' });
 expect(sidebar).toHaveAttribute('aria-hidden', 'false');
 });

 it('should update ARIA states when sidebar toggles', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 const sidebarToggle = screen.getByTestId('sidebar-toggle');
 expect(sidebarToggle).toHaveAttribute('aria-expanded', 'true');
 });

 const sidebarToggle = screen.getByTestId('sidebar-toggle');
 await user.click(sidebarToggle);

 await waitFor(() => {
 expect(sidebarToggle).toHaveAttribute('aria-expanded', 'false');
 expect(sidebarToggle).toHaveAttribute('aria-label', 'Open sidebar');
 });

 const sidebar = screen.getByRole('navigation', { name: 'Main navigation' });
 expect(sidebar).toHaveAttribute('aria-hidden', 'true');
 });

 it('should have proper menubar structure', async () => {
 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 const menubar = screen.getByRole('menubar');
 expect(menubar).toHaveAttribute('aria-orientation', 'vertical');
 });

 const menuItems = screen.getAllByRole('menuitem');
 expect(menuItems).toHaveLength(3);

 const dashboardItem = screen.getByTestId('nav-dashboard');
 expect(dashboardItem).toHaveAttribute('aria-current', 'page');
 });

 it('should have proper badge labeling', async () => {
 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 const uploadLink = screen.getByTestId('nav-upload');
 const badge = uploadLink.querySelector('[aria-label="3 drafts"]');
 expect(badge).toBeInTheDocument();
 expect(badge).toHaveTextContent('3');
 });
 });
 });

 describe('Keyboard Navigation', () => {
 it('should support tab navigation through interactive elements', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('sidebar-toggle')).toBeInTheDocument();
 });

 await user.tab();
 expect(screen.getByTestId('sidebar-toggle')).toHaveFocus();

 await user.tab();
 expect(screen.getByTestId('nav-dashboard')).toHaveFocus();

 await user.tab();
 expect(screen.getByTestId('nav-upload')).toHaveFocus();

 await user.tab();
 expect(screen.getByTestId('nav-analytics')).toHaveFocus();

 await user.tab();
 expect(screen.getByTestId('close-sidebar')).toHaveFocus();
 });

 it('should handle Enter key activation', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('sidebar-toggle')).toBeInTheDocument();
 });

 const sidebarToggle = screen.getByTestId('sidebar-toggle');
 sidebarToggle.focus();
 
 expect(sidebarToggle).toHaveAttribute('aria-expanded', 'true');

 await user.keyboard('{Enter}');

 await waitFor(() => {
 expect(sidebarToggle).toHaveAttribute('aria-expanded', 'false');
 });
 });

 it('should handle Space key activation', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('sidebar-toggle')).toBeInTheDocument();
 });

 const sidebarToggle = screen.getByTestId('sidebar-toggle');
 sidebarToggle.focus();

 await user.keyboard(' ');

 await waitFor(() => {
 expect(sidebarToggle).toHaveAttribute('aria-expanded', 'false');
 });
 });

 it('should manage focus when sidebar closes', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('nav-dashboard')).toBeInTheDocument();
 });

 const navItem = screen.getByTestId('nav-dashboard');
 navItem.focus();
 expect(navItem).toHaveFocus();

 const closeButton = screen.getByTestId('close-sidebar');
 await user.click(closeButton);

 await waitFor(() => {

 expect(screen.getByTestId('sidebar-toggle')).toHaveFocus();
 });
 });

 it('should handle Escape key to close sidebar', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('nav-dashboard')).toBeInTheDocument();
 });

 const navItem = screen.getByTestId('nav-dashboard');
 navItem.focus();

 await user.keyboard('{Escape}');

 await waitFor(() => {
 const sidebarToggle = screen.getByTestId('sidebar-toggle');
 expect(sidebarToggle).toHaveAttribute('aria-expanded', 'false');
 });
 });

 it('should skip navigation items when sidebar is closed', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('sidebar-toggle')).toBeInTheDocument();
 });

 await user.click(screen.getByTestId('sidebar-toggle'));

 await waitFor(() => {
 const navItems = screen.getAllByRole('menuitem');
 navItems.forEach(item => {
 expect(item).toHaveAttribute('tabIndex', '-1');
 });
 });
 });
 });

 describe('Screen Reader Support', () => {
 it('should announce sidebar state changes', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('live-region')).toHaveTextContent('Navigation opened');
 });

 await user.click(screen.getByTestId('sidebar-toggle'));

 await waitFor(() => {
 expect(screen.getByTestId('live-region')).toHaveTextContent('Navigation closed');
 });
 });

 it('should provide status information', async () => {
 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 const statusInfo = screen.getByTestId('status-info');
 expect(statusInfo).toHaveTextContent('Current layout: creator');
 expect(statusInfo).not.toHaveTextContent('Loading');
 expect(statusInfo).not.toHaveTextContent('Error');
 });
 });

 it('should announce loading states', () => {
 useAuthContext.mockReturnValue({
 user: null,
 userProfile: null,
 isLoading: true,
 hasRole: jest.fn(() => false),
 isSignedIn: false,
 error: null,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 lastFetch: null,
 });

 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 const statusInfo = screen.getByTestId('status-info');
 expect(statusInfo).toHaveTextContent('Loading');
 });

 it('should announce error states', async () => {
 const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
 
 useAuthContext.mockReturnValue({
 user: null,
 userProfile: null,
 isLoading: false,
 hasRole: jest.fn(() => { throw new Error('Auth error'); }),
 isSignedIn: false,
 error: 'Auth error',
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 lastFetch: null,
 });

 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 const statusInfo = screen.getByTestId('status-info');
 expect(statusInfo).toHaveTextContent('Error: Failed to determine layout');
 });

 consoleSpy.mockRestore();
 });
 });

 describe('Breadcrumb Navigation', () => {
 it('should have proper breadcrumb structure', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('set-breadcrumbs')).toBeInTheDocument();
 });

 await user.click(screen.getByTestId('set-breadcrumbs'));

 await waitFor(() => {
 const breadcrumbNav = screen.getByRole('navigation', { name: 'Breadcrumb' });
 expect(breadcrumbNav).toBeInTheDocument();
 });

 const breadcrumbLinks = screen.getAllByRole('link');
 const breadcrumbLinksInNav = breadcrumbLinks.filter(link => 
 link.closest('[aria-label="Breadcrumb"]')
 );
 
 expect(breadcrumbLinksInNav).toHaveLength(3);

 const activeLink = breadcrumbLinksInNav.find(link => 
 link.getAttribute('aria-current') === 'page'
 );
 expect(activeLink).toHaveTextContent('Dashboard');
 });

 it('should hide breadcrumbs when empty', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 await user.click(screen.getByTestId('set-breadcrumbs'));

 await waitFor(() => {
 expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
 });

 await user.click(screen.getByTestId('clear-breadcrumbs'));

 await waitFor(() => {
 expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument();
 });
 });
 });

 describe('Focus Management', () => {
 it('should have visible focus indicators', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('sidebar-toggle')).toBeInTheDocument();
 });

 const sidebarToggle = screen.getByTestId('sidebar-toggle');
 await user.tab();
 
 expect(sidebarToggle).toHaveFocus();
 expect(sidebarToggle).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
 });

 it('should trap focus within sidebar when open', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('nav-dashboard')).toBeInTheDocument();
 });

 const navDashboard = screen.getByTestId('nav-dashboard');
 navDashboard.focus();
 
 await user.tab();
 expect(screen.getByTestId('nav-upload')).toHaveFocus();
 
 await user.tab();
 expect(screen.getByTestId('nav-analytics')).toHaveFocus();
 
 await user.tab();
 expect(screen.getByTestId('close-sidebar')).toHaveFocus();
 });

 it('should restore focus appropriately', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('sidebar-toggle')).toBeInTheDocument();
 });

 const sidebarToggle = screen.getByTestId('sidebar-toggle');
 sidebarToggle.focus();

 await user.keyboard('{Enter}');
 
 await waitFor(() => {
 expect(sidebarToggle).toHaveFocus();
 });
 });
 });

 describe('Reduced Motion Support', () => {
 it('should respect prefers-reduced-motion', () => {

 const { prefersReducedMotion } = require('@/lib/mobile-optimization');
 prefersReducedMotion.mockReturnValue(true);

 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 expect(prefersReducedMotion).toHaveBeenCalled();
 });
 });

 describe('High Contrast Support', () => {
 it('should maintain accessibility in high contrast mode', async () => {
 render(
 <TestWrapper>
 <AccessibleLayoutComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 const sidebarToggle = screen.getByTestId('sidebar-toggle');
 expect(sidebarToggle).toHaveClass('focus:outline-none', 'focus:ring-2');
 });

 const interactiveElements = [
 screen.getByTestId('sidebar-toggle'),
 screen.getByTestId('nav-dashboard'),
 screen.getByTestId('nav-upload'),
 screen.getByTestId('nav-analytics'),
 screen.getByTestId('close-sidebar'),
 ];

 interactiveElements.forEach(element => {
 expect(element).toHaveClass('focus:outline-none');
 expect(element).toHaveClass('focus:ring-2');
 });
 });
 });
});