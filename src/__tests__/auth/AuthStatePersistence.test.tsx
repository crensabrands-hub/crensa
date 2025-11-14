

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayoutProvider } from '@/contexts/LayoutContext';
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

function AuthStateTestComponent() {
 const { useLayout } = require('@/contexts/LayoutContext');
 const layout = useLayout();
 
 return (
 <div>
 <div data-testid="layout-type">{layout.currentLayout}</div>
 <div data-testid="layout-loading">{layout.isLayoutLoading.toString()}</div>
 <div data-testid="layout-error">{layout.error || 'none'}</div>
 <div data-testid="sidebar-open">{layout.navigation.sidebarOpen.toString()}</div>
 
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

describe('Authentication State Persistence', () => {
 beforeEach(() => {
 jest.clearAllMocks();

 mockPersistence.loadPreferences.mockReturnValue({
 sidebarCollapsed: false,
 theme: 'light',
 compactMode: false,
 });
 mockPersistence.loadNavigation.mockReturnValue({
 activeRoute: '/',
 breadcrumbs: [],
 sidebarOpen: true,
 mobileMenuOpen: false,
 });
 });

 describe('Authentication Loading States', () => {
 it('should show loading state while authentication is loading', () => {
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
 <AuthStateTestComponent />
 </TestWrapper>
 );

 expect(screen.getByTestId('layout-loading')).toHaveTextContent('true');
 expect(screen.getByTestId('layout-error')).toHaveTextContent('none');
 });

 it('should transition from loading to loaded state', async () => {

 const mockAuth = {
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
 };

 useAuthContext.mockReturnValue(mockAuth);

 const { rerender } = render(
 <TestWrapper>
 <AuthStateTestComponent />
 </TestWrapper>
 );

 expect(screen.getByTestId('layout-loading')).toHaveTextContent('true');

 mockAuth.isLoading = false;
 mockAuth.user = { publicMetadata: { role: 'creator' } };
 mockAuth.userProfile = { username: 'testcreator', role: 'creator' };
 mockAuth.isSignedIn = true;
 mockAuth.hasRole = jest.fn(() => true);
 mockAuth.lastFetch = Date.now();

 useAuthContext.mockReturnValue(mockAuth);

 rerender(
 <TestWrapper>
 <AuthStateTestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-loading')).toHaveTextContent('false');
 expect(screen.getByTestId('layout-type')).toHaveTextContent('creator');
 });
 });

 it('should handle authentication timeout', async () => {
 jest.useFakeTimers();
 
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
 <AuthStateTestComponent />
 </TestWrapper>
 );

 expect(screen.getByTestId('layout-loading')).toHaveTextContent('true');

 act(() => {
 jest.advanceTimersByTime(30000); // 30 seconds
 });

 expect(screen.getByTestId('layout-loading')).toHaveTextContent('true');

 jest.useRealTimers();
 });
 });

 describe('Authentication Error Handling', () => {
 it('should handle authentication errors gracefully', async () => {
 const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
 
 useAuthContext.mockReturnValue({
 user: null,
 userProfile: null,
 isLoading: false,
 hasRole: jest.fn(() => { throw new Error('Authentication failed'); }),
 isSignedIn: false,
 error: 'Authentication failed',
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 lastFetch: null,
 });

 render(
 <TestWrapper>
 <AuthStateTestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-loading')).toHaveTextContent('false');
 expect(screen.getByTestId('layout-error')).toHaveTextContent('Failed to determine layout');
 });

 expect(consoleSpy).toHaveBeenCalledWith('Layout detection error:', expect.any(Error));

 consoleSpy.mockRestore();
 });

 it('should allow error recovery', async () => {
 const user = userEvent.setup();
 const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
 
 useAuthContext.mockReturnValue({
 user: null,
 userProfile: null,
 isLoading: false,
 hasRole: jest.fn(() => { throw new Error('Authentication failed'); }),
 isSignedIn: false,
 error: 'Authentication failed',
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 lastFetch: null,
 });

 render(
 <TestWrapper>
 <AuthStateTestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-error')).toHaveTextContent('Failed to determine layout');
 });

 await user.click(screen.getByTestId('clear-error'));

 expect(screen.getByTestId('layout-error')).toHaveTextContent('none');

 consoleSpy.mockRestore();
 });

 it('should handle network errors during authentication', async () => {
 const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
 
 useAuthContext.mockReturnValue({
 user: null,
 userProfile: null,
 isLoading: false,
 hasRole: jest.fn(() => { throw new Error('Network error'); }),
 isSignedIn: false,
 error: 'Network error',
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 lastFetch: null,
 });

 render(
 <TestWrapper>
 <AuthStateTestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-error')).toHaveTextContent('Failed to determine layout');
 });

 expect(consoleSpy).toHaveBeenCalledWith('Layout detection error:', expect.any(Error));

 consoleSpy.mockRestore();
 });
 });

 describe('Session Persistence', () => {
 it('should persist authentication state across page refreshes', async () => {

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
 <AuthStateTestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-type')).toHaveTextContent('creator');
 expect(screen.getByTestId('layout-loading')).toHaveTextContent('false');
 });

 expect(mockPersistence.loadPreferences).toHaveBeenCalled();
 expect(mockPersistence.loadNavigation).toHaveBeenCalled();
 });

 it('should handle corrupted session data', async () => {
 const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

 useAuthContext.mockReturnValue({
 user: { publicMetadata: null }, // Corrupted metadata
 userProfile: null,
 isLoading: false,
 hasRole: jest.fn(() => { throw new Error('Invalid role data'); }),
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
 <AuthStateTestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-error')).toHaveTextContent('Failed to determine layout');
 });

 expect(consoleSpy).toHaveBeenCalledWith('Layout detection error:', expect.any(Error));

 consoleSpy.mockRestore();
 });

 it('should handle session expiration', async () => {

 const mockAuth = {
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
 };

 useAuthContext.mockReturnValue(mockAuth);

 const { rerender } = render(
 <TestWrapper>
 <AuthStateTestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-type')).toHaveTextContent('creator');
 });

 mockAuth.user = null;
 mockAuth.userProfile = null;
 mockAuth.isSignedIn = false;
 mockAuth.hasRole = jest.fn(() => false);
 mockAuth.error = 'Session expired';

 useAuthContext.mockReturnValue(mockAuth);

 rerender(
 <TestWrapper>
 <AuthStateTestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-type')).toHaveTextContent('public');
 });
 });
 });

 describe('Role-based Access Control', () => {
 it('should correctly identify creator users', async () => {
 useAuthContext.mockReturnValue({
 user: { publicMetadata: { role: 'creator' } },
 userProfile: { username: 'testcreator', role: 'creator' },
 isLoading: false,
 hasRole: jest.fn((role) => role === 'creator'),
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
 <AuthStateTestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-type')).toHaveTextContent('creator');
 });
 });

 it('should correctly identify member users', async () => {
 useAuthContext.mockReturnValue({
 user: { publicMetadata: { role: 'member' } },
 userProfile: { username: 'testmember', role: 'member' },
 isLoading: false,
 hasRole: jest.fn((role) => role === 'member'),
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
 <AuthStateTestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-type')).toHaveTextContent('member');
 });
 });

 it('should handle users with no role', async () => {
 useAuthContext.mockReturnValue({
 user: { publicMetadata: {} },
 userProfile: { username: 'testuser' },
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

 render(
 <TestWrapper>
 <AuthStateTestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-type')).toHaveTextContent('member');
 });
 });

 it('should handle role changes', async () => {

 const mockAuth = {
 user: { publicMetadata: { role: 'member' } },
 userProfile: { username: 'testuser', role: 'member' },
 isLoading: false,
 hasRole: jest.fn((role) => role === 'member'),
 isSignedIn: true,
 error: null,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 lastFetch: Date.now(),
 };

 useAuthContext.mockReturnValue(mockAuth);

 const { rerender } = render(
 <TestWrapper>
 <AuthStateTestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-type')).toHaveTextContent('member');
 });

 mockAuth.user.publicMetadata.role = 'creator';
 mockAuth.userProfile.role = 'creator';
 mockAuth.hasRole = jest.fn((role) => role === 'creator');

 useAuthContext.mockReturnValue(mockAuth);

 rerender(
 <TestWrapper>
 <AuthStateTestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-type')).toHaveTextContent('creator');
 });
 });
 });

 describe('Storage Integration', () => {
 it('should handle storage unavailability during auth state changes', async () => {
 const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
 
 mockPersistence.isStorageAvailable.mockReturnValue(false);

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
 <AuthStateTestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-type')).toHaveTextContent('creator');
 expect(consoleSpy).toHaveBeenCalledWith('Browser storage is not available, layout state will not persist');
 });

 consoleSpy.mockRestore();
 });

 it('should recover from storage errors', async () => {
 const user = userEvent.setup();
 const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
 
 mockPersistence.savePreferences.mockReturnValue(false);

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
 <AuthStateTestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-type')).toHaveTextContent('creator');
 });

 await user.click(screen.getByTestId('reset-state'));

 expect(mockPersistence.clearAll).toHaveBeenCalled();

 consoleSpy.mockRestore();
 });
 });

 describe('Optimistic Updates', () => {
 it('should handle optimistic authentication updates', async () => {
 useAuthContext.mockReturnValue({
 user: { publicMetadata: { role: 'creator' } },
 userProfile: { username: 'testcreator', role: 'creator' },
 isLoading: false,
 hasRole: jest.fn(() => true),
 isSignedIn: true,
 error: null,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: true, // Optimistic update
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 lastFetch: Date.now(),
 });

 render(
 <TestWrapper>
 <AuthStateTestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-type')).toHaveTextContent('creator');
 expect(screen.getByTestId('layout-loading')).toHaveTextContent('false');
 });

 expect(screen.getByTestId('sidebar-open')).toHaveTextContent('true');
 });

 it('should handle failed optimistic updates', async () => {

 const mockAuth = {
 user: { publicMetadata: { role: 'creator' } },
 userProfile: { username: 'testcreator', role: 'creator' },
 isLoading: false,
 hasRole: jest.fn(() => true),
 isSignedIn: true,
 error: null,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: true,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 lastFetch: Date.now(),
 };

 useAuthContext.mockReturnValue(mockAuth);

 const { rerender } = render(
 <TestWrapper>
 <AuthStateTestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-type')).toHaveTextContent('creator');
 });

 mockAuth.isOptimistic = false;
 mockAuth.error = 'Update failed';
 mockAuth.user = null;
 mockAuth.userProfile = null;
 mockAuth.isSignedIn = false;
 mockAuth.hasRole = jest.fn(() => false);

 useAuthContext.mockReturnValue(mockAuth);

 rerender(
 <TestWrapper>
 <AuthStateTestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-type')).toHaveTextContent('public');
 });
 });
 });
});