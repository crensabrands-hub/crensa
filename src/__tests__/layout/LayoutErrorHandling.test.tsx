

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

class TestErrorBoundary extends React.Component<
 { children: React.ReactNode; onError?: (error: Error, errorInfo: any) => void },
 { hasError: boolean; error: Error | null }
> {
 constructor(props: any) {
 super(props);
 this.state = { hasError: false, error: null };
 }

 static getDerivedStateFromError(error: Error) {
 return { hasError: true, error };
 }

 componentDidCatch(error: Error, errorInfo: any) {
 if (this.props.onError) {
 this.props.onError(error, errorInfo);
 }
 }

 render() {
 if (this.state.hasError) {
 return (
 <div data-testid="error-boundary">
 <h2>Something went wrong</h2>
 <p data-testid="error-message">{this.state.error?.message}</p>
 <button
 data-testid="retry-button"
 onClick={() => this.setState({ hasError: false, error: null })}
 >
 Try Again
 </button>
 </div>
 );
 }

 return this.props.children;
 }
}

function ErrorThrowingComponent({ shouldThrow = false, errorMessage = 'Test error' }: { shouldThrow?: boolean; errorMessage?: string }) {
 if (shouldThrow) {
 throw new Error(errorMessage);
 }
 return <div data-testid="error-component">No error</div>;
}

function LayoutWithErrorHandling({ throwError = false }: { throwError?: boolean }) {
 const { useLayout } = require('@/contexts/LayoutContext');
 const layout = useLayout();
 
 return (
 <div data-testid="layout-container">
 <div data-testid="layout-state">
 <div>Layout: {layout.currentLayout}</div>
 <div>Loading: {layout.isLayoutLoading.toString()}</div>
 <div>Error: {layout.error || 'none'}</div>
 </div>
 
 <TestErrorBoundary>
 <ErrorThrowingComponent shouldThrow={throwError} />
 </TestErrorBoundary>
 
 <div data-testid="layout-actions">
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
 data-testid="toggle-sidebar"
 onClick={() => layout.setSidebarOpen(!layout.navigation.sidebarOpen)}
 >
 Toggle Sidebar
 </button>
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

describe('Layout Error Handling', () => {
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
 mockPersistence.savePreferences.mockReturnValue(true);
 mockPersistence.saveNavigation.mockReturnValue(true);
 mockPersistence.isStorageAvailable.mockReturnValue(true);
 });

 describe('Authentication Errors', () => {
 it('should handle authentication loading errors', async () => {
 const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
 
 useAuthContext.mockReturnValue({
 user: null,
 userProfile: null,
 isLoading: false,
 hasRole: jest.fn(() => { throw new Error('Auth service unavailable'); }),
 isSignedIn: false,
 error: 'Auth service unavailable',
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 lastFetch: null,
 });

 render(
 <TestWrapper>
 <LayoutWithErrorHandling />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-state')).toHaveTextContent('Error: Failed to determine layout');
 });

 expect(consoleSpy).toHaveBeenCalledWith('Layout detection error:', expect.any(Error));

 consoleSpy.mockRestore();
 });

 it('should allow error recovery after authentication errors', async () => {
 const user = userEvent.setup();
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
 <LayoutWithErrorHandling />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-state')).toHaveTextContent('Error: Failed to determine layout');
 });

 await user.click(screen.getByTestId('clear-error'));

 expect(screen.getByTestId('layout-state')).toHaveTextContent('Error: none');

 consoleSpy.mockRestore();
 });

 it('should handle corrupted user data gracefully', async () => {
 const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
 
 useAuthContext.mockReturnValue({
 user: { publicMetadata: null }, // Corrupted data
 userProfile: undefined,
 isLoading: false,
 hasRole: jest.fn(() => { throw new Error('Invalid user data'); }),
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
 <LayoutWithErrorHandling />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-state')).toHaveTextContent('Error: Failed to determine layout');
 });

 expect(consoleSpy).toHaveBeenCalledWith('Layout detection error:', expect.any(Error));

 consoleSpy.mockRestore();
 });
 });

 describe('Storage Errors', () => {
 it('should handle storage unavailability', async () => {
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
 <LayoutWithErrorHandling />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-state')).toHaveTextContent('Error: Storage unavailable - settings will not be saved');
 });

 expect(consoleSpy).toHaveBeenCalledWith('Browser storage is not available, layout state will not persist');

 consoleSpy.mockRestore();
 });

 it('should handle storage write failures', async () => {
 const user = userEvent.setup();
 const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
 
 mockPersistence.saveNavigation.mockReturnValue(false);

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
 <LayoutWithErrorHandling />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-state')).toHaveTextContent('Layout: creator');
 });

 await user.click(screen.getByTestId('toggle-sidebar'));

 await waitFor(() => {
 expect(consoleSpy).toHaveBeenCalledWith('Failed to persist navigation state');
 });

 consoleSpy.mockRestore();
 });

 it('should handle corrupted storage data', async () => {
 const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
 
 mockPersistence.loadPreferences.mockImplementation(() => {
 throw new Error('Corrupted storage data');
 });

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
 <LayoutWithErrorHandling />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-state')).toHaveTextContent('Layout: creator');
 });

 consoleSpy.mockRestore();
 });
 });

 describe('Component Error Boundaries', () => {
 it('should catch and handle component errors', () => {
 const onError = jest.fn();
 
 render(
 <TestWrapper>
 <TestErrorBoundary onError={onError}>
 <ErrorThrowingComponent shouldThrow={true} errorMessage="Component crashed" />
 </TestErrorBoundary>
 </TestWrapper>
 );

 expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
 expect(screen.getByTestId('error-message')).toHaveTextContent('Component crashed');
 expect(onError).toHaveBeenCalledWith(
 expect.any(Error),
 expect.objectContaining({
 componentStack: expect.any(String),
 })
 );
 });

 it('should allow error recovery through retry mechanism', async () => {
 const user = userEvent.setup();
 
 const { rerender } = render(
 <TestWrapper>
 <TestErrorBoundary>
 <ErrorThrowingComponent shouldThrow={true} />
 </TestErrorBoundary>
 </TestWrapper>
 );

 expect(screen.getByTestId('error-boundary')).toBeInTheDocument();

 await user.click(screen.getByTestId('retry-button'));

 rerender(
 <TestWrapper>
 <TestErrorBoundary>
 <ErrorThrowingComponent shouldThrow={false} />
 </TestErrorBoundary>
 </TestWrapper>
 );

 expect(screen.getByTestId('error-component')).toHaveTextContent('No error');
 });
 });

 describe('Sync Error Handling', () => {
 it('should handle sync event errors gracefully', async () => {
 const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
 let syncListener: (event: any) => void;
 
 mockPersistence.addSyncListener.mockImplementation((listener) => {
 syncListener = listener;
 return () => {};
 });

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
 <LayoutWithErrorHandling />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-state')).toHaveTextContent('Layout: creator');
 });

 act(() => {
 syncListener({
 type: 'invalid_type',
 data: null,
 timestamp: Date.now(),
 });
 });

 expect(consoleSpy).toHaveBeenCalledWith('Failed to handle sync event:', expect.any(Error));

 consoleSpy.mockRestore();
 });

 it('should handle malformed sync data', async () => {
 const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
 let syncListener: (event: any) => void;
 
 mockPersistence.addSyncListener.mockImplementation((listener) => {
 syncListener = listener;
 return () => {};
 });

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
 <LayoutWithErrorHandling />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-state')).toHaveTextContent('Layout: creator');
 });

 act(() => {
 syncListener({
 type: 'preferences',
 data: 'invalid_data', // Should be an object
 timestamp: Date.now(),
 });
 });

 expect(consoleSpy).toHaveBeenCalledWith('Failed to handle sync event:', expect.any(Error));

 consoleSpy.mockRestore();
 });
 });

 describe('Graceful Degradation', () => {
 it('should continue working when storage fails', async () => {
 const user = userEvent.setup();
 const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
 
 mockPersistence.savePreferences.mockReturnValue(false);
 mockPersistence.saveNavigation.mockReturnValue(false);

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
 <LayoutWithErrorHandling />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-state')).toHaveTextContent('Layout: creator');
 });

 await user.click(screen.getByTestId('toggle-sidebar'));

 await waitFor(() => {
 expect(consoleSpy).toHaveBeenCalledWith('Failed to persist navigation state');
 });

 consoleSpy.mockRestore();
 });

 it('should provide fallback when all storage operations fail', async () => {
 const user = userEvent.setup();
 
 mockPersistence.loadPreferences.mockImplementation(() => {
 throw new Error('Storage read failed');
 });
 mockPersistence.loadNavigation.mockImplementation(() => {
 throw new Error('Storage read failed');
 });
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
 <LayoutWithErrorHandling />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-state')).toHaveTextContent('Layout: creator');
 });

 await user.click(screen.getByTestId('toggle-sidebar'));
 await user.click(screen.getByTestId('clear-error'));
 await user.click(screen.getByTestId('reset-state'));

 expect(screen.getByTestId('layout-container')).toBeInTheDocument();
 });
 });

 describe('Recovery Mechanisms', () => {
 it('should provide state reset functionality', async () => {
 const user = userEvent.setup();
 
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
 <LayoutWithErrorHandling />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-state')).toHaveTextContent('Layout: creator');
 });

 await user.click(screen.getByTestId('reset-state'));

 expect(mockPersistence.clearAll).toHaveBeenCalled();
 });

 it('should handle reset failures gracefully', async () => {
 const user = userEvent.setup();
 const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
 
 mockPersistence.clearAll.mockImplementation(() => {
 throw new Error('Clear failed');
 });

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
 <LayoutWithErrorHandling />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('layout-state')).toHaveTextContent('Layout: creator');
 });

 await user.click(screen.getByTestId('reset-state'));

 expect(screen.getByTestId('layout-container')).toBeInTheDocument();

 consoleSpy.mockRestore();
 });
 });
});