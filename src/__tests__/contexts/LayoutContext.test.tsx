

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayoutProvider, useLayout } from '@/contexts/LayoutContext';
import { AuthProvider } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext', () => ({
 AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
 useAuthContext: jest.fn(),
}));

jest.mock('@/lib/layout-persistence', () => ({
 layoutPersistence: {
 loadPreferences: jest.fn(() => ({
 sidebarCollapsed: false,
 theme: 'light' as const,
 compactMode: false,
 })),
 loadNavigation: jest.fn(() => ({
 activeRoute: '/',
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

const { useAuthContext } = require('@/contexts/AuthContext');
const { layoutPersistence: mockPersistence } = require('@/lib/layout-persistence');

function TestComponent() {
 const layout = useLayout();
 
 return (
 <div>
 <div data-testid="current-layout">{layout.currentLayout}</div>
 <div data-testid="is-loading">{layout.isLayoutLoading.toString()}</div>
 <div data-testid="error">{layout.error || 'none'}</div>
 <div data-testid="sidebar-open">{layout.navigation.sidebarOpen.toString()}</div>
 <div data-testid="mobile-menu-open">{layout.navigation.mobileMenuOpen.toString()}</div>
 <div data-testid="theme">{layout.preferences.theme}</div>
 <div data-testid="sidebar-collapsed">{layout.preferences.sidebarCollapsed.toString()}</div>
 <div data-testid="compact-mode">{layout.preferences.compactMode.toString()}</div>
 <div data-testid="active-route">{layout.navigation.activeRoute}</div>
 <div data-testid="breadcrumbs-count">{layout.navigation.breadcrumbs.length}</div>
 
 <button 
 data-testid="toggle-sidebar" 
 onClick={() => layout.setSidebarOpen(!layout.navigation.sidebarOpen)}
 >
 Toggle Sidebar
 </button>
 <button 
 data-testid="toggle-mobile-menu" 
 onClick={() => layout.setMobileMenuOpen(!layout.navigation.mobileMenuOpen)}
 >
 Toggle Mobile Menu
 </button>
 <button 
 data-testid="update-preferences" 
 onClick={() => layout.updateLayoutPreferences({ theme: 'dark' })}
 >
 Update Preferences
 </button>
 <button 
 data-testid="set-route" 
 onClick={() => layout.setActiveRoute('/test')}
 >
 Set Route
 </button>
 <button 
 data-testid="set-breadcrumbs" 
 onClick={() => layout.setBreadcrumbs([
 { label: 'Home', href: '/', active: false },
 { label: 'Test', href: '/test', active: true }
 ])}
 >
 Set Breadcrumbs
 </button>
 <button 
 data-testid="clear-error" 
 onClick={layout.clearError}
 >
 Clear Error
 </button>
 <button 
 data-testid="reset-state" 
 onClick={layout.resetLayoutState}
 >
 Reset State
 </button>
 <button 
 data-testid="get-storage-info" 
 onClick={() => {
 const info = layout.getStorageInfo();
 console.log('Storage info:', info);
 }}
 >
 Get Storage Info
 </button>
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

describe('LayoutContext and LayoutProvider', () => {
 beforeEach(() => {
 jest.clearAllMocks();

 useAuthContext.mockReturnValue({
 user: null,
 isLoading: false,
 hasRole: jest.fn(() => false),
 userProfile: null,
 isSignedIn: false,
 error: null,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 lastFetch: null,
 });
 });

 describe('Initial State', () => {
 it('should initialize with default state for public layout', async () => {
 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
 });

 expect(screen.getByTestId('current-layout')).toHaveTextContent('public');
 expect(screen.getByTestId('error')).toHaveTextContent('none');
 expect(screen.getByTestId('sidebar-open')).toHaveTextContent('true');
 expect(screen.getByTestId('mobile-menu-open')).toHaveTextContent('false');
 expect(screen.getByTestId('theme')).toHaveTextContent('light');
 expect(screen.getByTestId('sidebar-collapsed')).toHaveTextContent('false');
 expect(screen.getByTestId('compact-mode')).toHaveTextContent('false');
 expect(screen.getByTestId('active-route')).toHaveTextContent('/');
 expect(screen.getByTestId('breadcrumbs-count')).toHaveTextContent('0');
 });

 it('should load initial state from persistence', () => {
 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 expect(mockPersistence.loadPreferences).toHaveBeenCalled();
 expect(mockPersistence.loadNavigation).toHaveBeenCalled();
 expect(mockPersistence.addSyncListener).toHaveBeenCalled();
 });
 });

 describe('Layout Detection', () => {
 it('should detect creator layout for creator users', async () => {
 useAuthContext.mockReturnValue({
 user: { publicMetadata: { role: 'creator' } },
 isLoading: false,
 hasRole: jest.fn(() => true),
 userProfile: { role: 'creator' },
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
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('current-layout')).toHaveTextContent('creator');
 });
 });

 it('should detect member layout for member users', async () => {
 useAuthContext.mockReturnValue({
 user: { publicMetadata: { role: 'member' } },
 isLoading: false,
 hasRole: jest.fn(() => false),
 userProfile: { role: 'member' },
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
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('current-layout')).toHaveTextContent('member');
 });
 });

 it('should show loading state while auth is loading', () => {
 useAuthContext.mockReturnValue({
 user: null,
 isLoading: true,
 hasRole: jest.fn(() => false),
 userProfile: null,
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
 <TestComponent />
 </TestWrapper>
 );

 expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
 });
 });

 describe('State Management', () => {
 it('should toggle sidebar state', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
 });

 expect(screen.getByTestId('sidebar-open')).toHaveTextContent('true');

 await user.click(screen.getByTestId('toggle-sidebar'));

 expect(screen.getByTestId('sidebar-open')).toHaveTextContent('false');
 });

 it('should toggle mobile menu state', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
 });

 expect(screen.getByTestId('mobile-menu-open')).toHaveTextContent('false');

 await user.click(screen.getByTestId('toggle-mobile-menu'));

 expect(screen.getByTestId('mobile-menu-open')).toHaveTextContent('true');
 });

 it('should update preferences', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
 });

 expect(screen.getByTestId('theme')).toHaveTextContent('light');

 await user.click(screen.getByTestId('update-preferences'));

 expect(screen.getByTestId('theme')).toHaveTextContent('dark');
 });

 it('should set active route', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
 });

 expect(screen.getByTestId('active-route')).toHaveTextContent('/');

 await user.click(screen.getByTestId('set-route'));

 expect(screen.getByTestId('active-route')).toHaveTextContent('/test');
 });

 it('should set breadcrumbs', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
 });

 expect(screen.getByTestId('breadcrumbs-count')).toHaveTextContent('0');

 await user.click(screen.getByTestId('set-breadcrumbs'));

 expect(screen.getByTestId('breadcrumbs-count')).toHaveTextContent('2');
 });
 });

 describe('Persistence', () => {
 it('should persist preferences when updated', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
 });

 await user.click(screen.getByTestId('update-preferences'));

 await waitFor(() => {
 expect(mockPersistence.savePreferences).toHaveBeenCalledWith(
 expect.objectContaining({
 theme: 'dark',
 })
 );
 });
 });

 it('should persist navigation state when updated', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
 });

 await user.click(screen.getByTestId('toggle-sidebar'));

 await waitFor(() => {
 expect(mockPersistence.saveNavigation).toHaveBeenCalledWith(
 expect.objectContaining({
 sidebarOpen: false,
 })
 );
 });
 });

 it('should handle storage unavailability', async () => {
 mockPersistence.isStorageAvailable.mockReturnValue(false);
 
 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('error')).toHaveTextContent('Storage unavailable - settings will not be saved');
 });
 });
 });

 describe('Error Handling', () => {
 it('should handle layout detection errors', async () => {

 mockPersistence.isStorageAvailable.mockReturnValue(true);

 const userWithError = {
 get publicMetadata() {
 throw new Error('Role check failed');
 }
 };
 
 useAuthContext.mockReturnValue({
 user: userWithError,
 isLoading: false,
 hasRole: jest.fn(() => false),
 userProfile: null,
 isSignedIn: true,
 error: null,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 lastFetch: Date.now(),
 });

 const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('error')).toHaveTextContent('Failed to determine layout');
 });

 consoleSpy.mockRestore();
 });

 it('should clear errors', async () => {
 const user = userEvent.setup();

 mockPersistence.isStorageAvailable.mockReturnValue(true);

 const userWithError = {
 get publicMetadata() {
 throw new Error('Role check failed');
 }
 };

 useAuthContext.mockReturnValue({
 user: userWithError,
 isLoading: false,
 hasRole: jest.fn(() => false),
 userProfile: null,
 isSignedIn: true,
 error: null,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 lastFetch: Date.now(),
 });

 const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('error')).toHaveTextContent('Failed to determine layout');
 });

 await user.click(screen.getByTestId('clear-error'));

 expect(screen.getByTestId('error')).toHaveTextContent('none');

 consoleSpy.mockRestore();
 });
 });

 describe('State Reset', () => {
 it('should reset layout state', async () => {
 const user = userEvent.setup();
 
 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
 });

 await user.click(screen.getByTestId('toggle-sidebar'));
 await user.click(screen.getByTestId('update-preferences'));
 await user.click(screen.getByTestId('set-route'));

 expect(screen.getByTestId('sidebar-open')).toHaveTextContent('false');
 expect(screen.getByTestId('theme')).toHaveTextContent('dark');
 expect(screen.getByTestId('active-route')).toHaveTextContent('/test');

 await user.click(screen.getByTestId('reset-state'));

 expect(mockPersistence.clearAll).toHaveBeenCalled();

 await waitFor(() => {
 expect(screen.getByTestId('sidebar-open')).toHaveTextContent('true');
 expect(screen.getByTestId('theme')).toHaveTextContent('light');
 expect(screen.getByTestId('active-route')).toHaveTextContent('/');
 });
 });
 });

 describe('Storage Info', () => {
 it('should provide storage information', async () => {
 const user = userEvent.setup();
 const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
 
 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
 });

 await user.click(screen.getByTestId('get-storage-info'));

 expect(mockPersistence.getStorageInfo).toHaveBeenCalled();
 expect(consoleSpy).toHaveBeenCalledWith('Storage info:', {
 preferences: 100,
 navigation: 50,
 available: true,
 });

 consoleSpy.mockRestore();
 });
 });

 describe('Cross-tab Synchronization', () => {
 it('should handle sync events', async () => {
 let syncListener: (event: any) => void;
 
 mockPersistence.addSyncListener.mockImplementation((listener) => {
 syncListener = listener;
 return () => {};
 });

 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
 });

 act(() => {
 syncListener({
 type: 'preferences',
 data: { theme: 'auto', sidebarCollapsed: true, compactMode: true },
 timestamp: Date.now(),
 });
 });

 await waitFor(() => {
 expect(screen.getByTestId('theme')).toHaveTextContent('auto');
 expect(screen.getByTestId('sidebar-collapsed')).toHaveTextContent('true');
 expect(screen.getByTestId('compact-mode')).toHaveTextContent('true');
 });
 });

 it('should handle full state sync events', async () => {
 let syncListener: (event: any) => void;
 
 mockPersistence.addSyncListener.mockImplementation((listener) => {
 syncListener = listener;
 return () => {};
 });

 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
 });

 act(() => {
 syncListener({
 type: 'full_state',
 data: {
 preferences: { theme: 'dark', sidebarCollapsed: false, compactMode: true },
 navigation: { activeRoute: '/synced', breadcrumbs: [], sidebarOpen: false, mobileMenuOpen: true },
 },
 timestamp: Date.now(),
 });
 });

 await waitFor(() => {
 expect(screen.getByTestId('theme')).toHaveTextContent('dark');
 expect(screen.getByTestId('compact-mode')).toHaveTextContent('true');
 expect(screen.getByTestId('active-route')).toHaveTextContent('/synced');
 expect(screen.getByTestId('sidebar-open')).toHaveTextContent('false');
 expect(screen.getByTestId('mobile-menu-open')).toHaveTextContent('true');
 });
 });

 });

 describe('Hook Usage', () => {
 it('should throw error when used outside provider', () => {
 const TestComponentOutsideProvider = () => {
 useLayout();
 return <div>Test</div>;
 };

 const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

 expect(() => {
 render(<TestComponentOutsideProvider />);
 }).toThrow('useLayout must be used within a LayoutProvider');

 consoleSpy.mockRestore();
 });
 });
});