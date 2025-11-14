

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayoutProvider } from '@/contexts/LayoutContext';
import { AuthProvider } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext', () => ({
 AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
 useAuthContext: jest.fn(),
}));

jest.mock('@/hooks/useResponsive', () => ({
 useResponsive: jest.fn(),
}));

jest.mock('next/navigation', () => ({
 usePathname: jest.fn(() => '/dashboard'),
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
 activeRoute: '/dashboard',
 breadcrumbs: [],
 sidebarOpen: false, // Members start with sidebar closed
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

const { useAuthContext } = require('@/contexts/AuthContext');
const { useResponsive } = require('@/hooks/useResponsive');
const { layoutPersistence: mockPersistence } = require('@/lib/layout-persistence');

function MockMemberLayout({ children, showSidebar = false }: { children: React.ReactNode; showSidebar?: boolean }) {
 const { useLayout } = require('@/contexts/LayoutContext');
 const layout = useLayout();
 
 return (
 <div data-testid="member-layout" className="min-h-screen bg-neutral-gray">
 {}
 <header data-testid="member-header" className="bg-neutral-white shadow-sm">
 <div className="flex items-center justify-between p-4">
 <div className="flex items-center space-x-4">
 <h1 className="text-xl font-bold text-primary-navy">Crensa</h1>
 {showSidebar && (
 <button
 data-testid="sidebar-toggle"
 onClick={() => layout.setSidebarOpen(!layout.navigation.sidebarOpen)}
 className="p-2 rounded-lg hover:bg-neutral-gray"
 >
 {layout.navigation.sidebarOpen ? 'Close' : 'Open'} Sidebar
 </button>
 )}
 </div>
 <div data-testid="layout-info">
 Layout: {layout.currentLayout} | Loading: {layout.isLayoutLoading.toString()}
 </div>
 </div>
 </header>

 {}
 {layout.navigation.breadcrumbs.length > 0 && (
 <nav data-testid="breadcrumbs" className="bg-neutral-white border-b px-4 py-2">
 <ol className="flex space-x-2 text-sm">
 {layout.navigation.breadcrumbs.map((crumb: any, index: number) => (
 <li key={crumb.href} className="flex items-center">
 {index > 0 && <span className="mx-2 text-neutral-dark-gray">/</span>}
 <a
 href={crumb.href}
 className={`${crumb.active ? 'text-primary-navy font-medium' : 'text-neutral-dark-gray hover:text-primary-navy'}`}
 >
 {crumb.label}
 </a>
 </li>
 ))}
 </ol>
 </nav>
 )}

 {}
 {!showSidebar && (
 <div data-testid="quick-actions" className="bg-gradient-to-r from-primary-navy to-accent-teal text-neutral-white p-4">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-lg font-semibold">Welcome back, testmember</h2>
 <p className="text-sm opacity-90">Ready to discover amazing content?</p>
 </div>
 <div className="flex space-x-4">
 <a href="/discover" className="px-4 py-2 bg-primary-neon-yellow text-primary-navy rounded-lg font-medium hover:bg-opacity-90">
 Discover
 </a>
 <a href="/wallet" className="px-4 py-2 bg-accent-pink text-neutral-white rounded-lg font-medium hover:bg-opacity-90">
 Wallet
 </a>
 </div>
 </div>
 </div>
 )}

 {}
 {showSidebar && (
 <aside
 data-testid="member-sidebar"
 className={`fixed top-0 left-0 z-50 h-full bg-neutral-white shadow-xl transition-transform duration-300 ${
 layout.navigation.sidebarOpen ? 'translate-x-0' : '-translate-x-full'
 } w-64`}
 >
 <div className="p-4">
 <h2 className="text-xl font-bold text-primary-navy">Member Portal</h2>
 <nav className="mt-4">
 <ul className="space-y-2">
 <li>
 <a href="/dashboard" className="block p-2 rounded hover:bg-neutral-gray">
 Dashboard
 </a>
 </li>
 <li>
 <a href="/discover" className="block p-2 rounded hover:bg-neutral-gray">
 Discover
 </a>
 </li>
 <li>
 <a href="/history" className="block p-2 rounded hover:bg-neutral-gray">
 Watch History
 </a>
 </li>
 <li>
 <a href="/wallet" className="block p-2 rounded hover:bg-neutral-gray">
 Wallet
 </a>
 </li>
 </ul>
 </nav>
 <button
 data-testid="close-sidebar"
 onClick={() => layout.setSidebarOpen(false)}
 className="mt-4 p-2 bg-accent-pink text-white rounded"
 >
 Close
 </button>
 </div>
 </aside>
 )}

 {}
 <main
 data-testid="member-main"
 className={`${showSidebar && layout.navigation.sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}
 >
 <div className="p-6">
 {children}
 </div>
 </main>

 {}
 <div data-testid="debug-info" className="fixed bottom-0 right-0 p-2 bg-black text-white text-xs">
 <div>Sidebar: {layout.navigation.sidebarOpen ? 'open' : 'closed'}</div>
 <div>Theme: {layout.preferences.theme}</div>
 <div>Show Sidebar: {showSidebar ? 'yes' : 'no'}</div>
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

describe('Member Layout Integration', () => {
 beforeEach(() => {
 jest.clearAllMocks();

 useAuthContext.mockReturnValue({
 user: { publicMetadata: { role: 'member' } },
 userProfile: { username: 'testmember', role: 'member' },
 isLoading: false,
 hasRole: jest.fn(() => false),
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

 describe('Layout Initialization', () => {
 it('should initialize member layout correctly', async () => {
 render(
 <TestWrapper>
 <MockMemberLayout>
 <div data-testid="test-content">Member Dashboard Content</div>
 </MockMemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-info')).toHaveTextContent('Layout: member | Loading: false');
 });

 expect(screen.getByTestId('member-layout')).toBeInTheDocument();
 expect(screen.getByTestId('member-header')).toBeInTheDocument();
 expect(screen.getByTestId('member-main')).toBeInTheDocument();
 expect(screen.getByTestId('test-content')).toHaveTextContent('Member Dashboard Content');
 });

 it('should show quick actions bar by default', async () => {
 render(
 <TestWrapper>
 <MockMemberLayout>
 <div>Content</div>
 </MockMemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
 });

 expect(screen.getByText('Welcome back, testmember')).toBeInTheDocument();
 expect(screen.getByText('Discover')).toBeInTheDocument();
 expect(screen.getByText('Wallet')).toBeInTheDocument();
 });

 it('should hide quick actions when sidebar is shown', async () => {
 render(
 <TestWrapper>
 <MockMemberLayout showSidebar>
 <div>Content</div>
 </MockMemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-info')).toHaveTextContent('Layout: member');
 });

 expect(screen.queryByTestId('quick-actions')).not.toBeInTheDocument();
 expect(screen.getByTestId('member-sidebar')).toBeInTheDocument();
 });
 });

 describe('Sidebar Functionality', () => {
 it('should toggle sidebar visibility when showSidebar is true', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <MockMemberLayout showSidebar>
 <div>Content</div>
 </MockMemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('debug-info')).toHaveTextContent('Sidebar: closed');
 });

 const sidebar = screen.getByTestId('member-sidebar');
 expect(sidebar).toHaveClass('-translate-x-full');

 await user.click(screen.getByTestId('sidebar-toggle'));

 await waitFor(() => {
 expect(screen.getByTestId('debug-info')).toHaveTextContent('Sidebar: open');
 });

 expect(sidebar).toHaveClass('translate-x-0');
 });

 it('should close sidebar from within sidebar', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <MockMemberLayout showSidebar>
 <div>Content</div>
 </MockMemberLayout>
 </TestWrapper>
 );

 await user.click(screen.getByTestId('sidebar-toggle'));

 await waitFor(() => {
 expect(screen.getByTestId('debug-info')).toHaveTextContent('Sidebar: open');
 });

 await user.click(screen.getByTestId('close-sidebar'));

 await waitFor(() => {
 expect(screen.getByTestId('debug-info')).toHaveTextContent('Sidebar: closed');
 });
 });

 it('should adjust main content margin based on sidebar state', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <MockMemberLayout showSidebar>
 <div>Content</div>
 </MockMemberLayout>
 </TestWrapper>
 );

 const mainContent = screen.getByTestId('member-main');

 await waitFor(() => {
 expect(mainContent).toHaveClass('ml-0'); // Sidebar closed initially
 });

 await user.click(screen.getByTestId('sidebar-toggle'));

 await waitFor(() => {
 expect(mainContent).toHaveClass('ml-64'); // Sidebar open
 });
 });
 });

 describe('Breadcrumb Navigation', () => {
 it('should display breadcrumbs when available', async () => {
 const user = userEvent.setup();
 
 function TestComponentWithBreadcrumbs() {
 const { useLayout } = require('@/contexts/LayoutContext');
 const layout = useLayout();
 
 return (
 <MockMemberLayout>
 <div>
 <button
 data-testid="set-breadcrumbs"
 onClick={() => layout.setBreadcrumbs([
 { label: 'Home', href: '/', active: false },
 { label: 'Dashboard', href: '/dashboard', active: true }
 ])}
 >
 Set Breadcrumbs
 </button>
 </div>
 </MockMemberLayout>
 );
 }

 render(
 <TestWrapper>
 <TestComponentWithBreadcrumbs />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('set-breadcrumbs')).toBeInTheDocument();
 });

 expect(screen.queryByTestId('breadcrumbs')).not.toBeInTheDocument();

 await user.click(screen.getByTestId('set-breadcrumbs'));

 await waitFor(() => {
 expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
 });

 expect(screen.getByText('Home')).toBeInTheDocument();
 expect(screen.getByText('Dashboard')).toBeInTheDocument();
 });

 it('should hide breadcrumbs when empty', async () => {
 render(
 <TestWrapper>
 <MockMemberLayout>
 <div>Content</div>
 </MockMemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-info')).toHaveTextContent('Layout: member');
 });

 expect(screen.queryByTestId('breadcrumbs')).not.toBeInTheDocument();
 });
 });

 describe('Mobile Responsiveness', () => {
 it('should handle mobile layout correctly', async () => {
 useResponsive.mockReturnValue({
 isMobile: true,
 isTablet: false,
 isDesktop: false,
 isTouchDevice: true,
 width: 375,
 height: 667,
 isMobileDevice: true,
 orientation: 'portrait',
 isSmallMobile: true,
 });

 render(
 <TestWrapper>
 <MockMemberLayout>
 <div>Mobile Content</div>
 </MockMemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-info')).toHaveTextContent('Layout: member');
 });

 expect(screen.queryByTestId('quick-actions')).not.toBeInTheDocument();
 });

 it('should handle tablet layout correctly', async () => {
 useResponsive.mockReturnValue({
 isMobile: false,
 isTablet: true,
 isDesktop: false,
 isTouchDevice: true,
 width: 768,
 height: 1024,
 isMobileDevice: false,
 orientation: 'portrait',
 isSmallMobile: false,
 });

 render(
 <TestWrapper>
 <MockMemberLayout>
 <div>Tablet Content</div>
 </MockMemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-info')).toHaveTextContent('Layout: member');
 });

 expect(screen.getByTestId('member-layout')).toBeInTheDocument();
 });
 });

 describe('State Persistence', () => {
 it('should persist sidebar state changes', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <MockMemberLayout showSidebar>
 <div>Content</div>
 </MockMemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('debug-info')).toHaveTextContent('Sidebar: closed');
 });

 await user.click(screen.getByTestId('sidebar-toggle'));

 await waitFor(() => {
 expect(mockPersistence.saveNavigation).toHaveBeenCalledWith(
 expect.objectContaining({
 sidebarOpen: true,
 })
 );
 });
 });

 it('should load persisted member layout state', async () => {
 mockPersistence.loadPreferences.mockReturnValue({
 sidebarCollapsed: true,
 theme: 'dark',
 compactMode: true,
 });

 mockPersistence.loadNavigation.mockReturnValue({
 activeRoute: '/discover',
 breadcrumbs: [],
 sidebarOpen: true, // Member has sidebar open
 mobileMenuOpen: false,
 });

 render(
 <TestWrapper>
 <MockMemberLayout showSidebar>
 <div>Content</div>
 </MockMemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('debug-info')).toHaveTextContent('Sidebar: open');
 expect(screen.getByTestId('debug-info')).toHaveTextContent('Theme: dark');
 });
 });
 });

 describe('Authentication Integration', () => {
 it('should handle authentication loading state', () => {
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
 <MockMemberLayout>
 <div>Content</div>
 </MockMemberLayout>
 </TestWrapper>
 );

 expect(screen.getByTestId('layout-info')).toHaveTextContent('Loading: true');
 });

 it('should handle non-member users', async () => {
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

 render(
 <TestWrapper>
 <MockMemberLayout>
 <div>Content</div>
 </MockMemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-info')).toHaveTextContent('Layout: creator');
 });
 });

 it('should handle unauthenticated users', async () => {
 useAuthContext.mockReturnValue({
 user: null,
 userProfile: null,
 isLoading: false,
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
 <MockMemberLayout>
 <div>Content</div>
 </MockMemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-info')).toHaveTextContent('Layout: public');
 });
 });
 });

 describe('Error Handling', () => {
 it('should handle layout errors gracefully', async () => {
 const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
 
 useAuthContext.mockReturnValue({
 user: { publicMetadata: { role: 'member' } },
 userProfile: null,
 isLoading: false,
 hasRole: jest.fn(() => { throw new Error('Role check failed'); }),
 isSignedIn: true,
 error: null,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 lastFetch: Date.now(),
 });

 render(
 <TestWrapper>
 <MockMemberLayout>
 <div>Content</div>
 </MockMemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-info')).toHaveTextContent('Loading: false');
 });

 expect(consoleSpy).toHaveBeenCalledWith('Layout detection error:', expect.any(Error));

 consoleSpy.mockRestore();
 });
 });

 describe('Performance', () => {
 it('should not cause excessive re-renders', async () => {
 const renderSpy = jest.fn();
 
 function TestComponent() {
 renderSpy();
 return <div>Performance Test</div>;
 }

 render(
 <TestWrapper>
 <MockMemberLayout>
 <TestComponent />
 </MockMemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByText('Performance Test')).toBeInTheDocument();
 });

 expect(renderSpy).toHaveBeenCalledTimes(1);

 const discoverLink = screen.getByText('Discover');
 fireEvent.click(discoverLink);

 expect(renderSpy).toHaveBeenCalledTimes(1);
 });
 });

 describe('User Experience', () => {
 it('should provide appropriate welcome message', async () => {
 render(
 <TestWrapper>
 <MockMemberLayout>
 <div>Content</div>
 </MockMemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByText('Welcome back, testmember')).toBeInTheDocument();
 });

 expect(screen.getByText('Ready to discover amazing content?')).toBeInTheDocument();
 });

 it('should provide quick access to key features', async () => {
 render(
 <TestWrapper>
 <MockMemberLayout>
 <div>Content</div>
 </MockMemberLayout>
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByText('Discover')).toBeInTheDocument();
 });

 const discoverLink = screen.getByText('Discover');
 const walletLink = screen.getByText('Wallet');

 expect(discoverLink).toHaveAttribute('href', '/discover');
 expect(walletLink).toHaveAttribute('href', '/wallet');
 });
 });
});