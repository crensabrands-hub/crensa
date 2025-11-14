import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import ProtectedRoute, { CreatorProtectedRoute, MemberProtectedRoute, useRouteAccess } from '../ProtectedRoute';

jest.mock('next/navigation', () => ({
 useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: jest.fn(),
}));

jest.mock('@/components/auth/AuthLoading', () => {
 return function MockAuthLoading() {
 return <div data-testid="auth-loading">Loading...</div>;
 };
});

jest.mock('@/components/auth/AuthError', () => ({
 AuthError: ({ error, onRetry, onDismiss }: any) => (
 <div data-testid="auth-error">
 <p>{error.message}</p>
 {onRetry && <button onClick={onRetry} data-testid="retry-button">Retry</button>}
 {onDismiss && <button onClick={onDismiss} data-testid="dismiss-button">Dismiss</button>}
 </div>
 ),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>;

describe('ProtectedRoute', () => {
 const mockPush = jest.fn();
 const mockBack = jest.fn();

 const defaultAuthContext = {
 user: { publicMetadata: { role: 'creator' } },
 userProfile: { 
 id: '1',
 username: 'testuser',
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

 beforeEach(() => {
 mockUseRouter.mockReturnValue({
 push: mockPush,
 back: mockBack,
 forward: jest.fn(),
 refresh: jest.fn(),
 replace: jest.fn(),
 prefetch: jest.fn(),
 });
 
 mockUseAuthContext.mockReturnValue(defaultAuthContext);

 Object.defineProperty(window, 'location', {
 value: {
 pathname: '/creator/dashboard',
 href: '',
 },
 writable: true,
 });
 });

 afterEach(() => {
 jest.clearAllMocks();
 });

 describe('Authentication States', () => {
 it('shows loading state when auth is loading', () => {
 mockUseAuthContext.mockReturnValue({
 ...defaultAuthContext,
 isLoading: true,
 });

 render(
 <ProtectedRoute>
 <div>Protected Content</div>
 </ProtectedRoute>
 );

 expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
 expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
 });

 it('shows error state when there is an auth error', () => {
 const mockError = { type: 'network', message: 'Network error', retryable: true };
 mockUseAuthContext.mockReturnValue({
 ...defaultAuthContext,
 error: mockError,
 });

 render(
 <ProtectedRoute>
 <div>Protected Content</div>
 </ProtectedRoute>
 );

 expect(screen.getByTestId('auth-error')).toBeInTheDocument();
 expect(screen.getByText('Network error')).toBeInTheDocument();
 expect(screen.getByTestId('retry-button')).toBeInTheDocument();
 expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
 });

 it('redirects to sign-in when not authenticated', async () => {
 mockUseAuthContext.mockReturnValue({
 ...defaultAuthContext,
 isSignedIn: false,
 userProfile: null,
 });

 render(
 <ProtectedRoute>
 <div>Protected Content</div>
 </ProtectedRoute>
 );

 await waitFor(() => {
 expect(mockPush).toHaveBeenCalledWith('/sign-in?redirect=%2Fcreator%2Fdashboard');
 });
 });

 it('redirects to onboarding when profile is missing', async () => {
 mockUseAuthContext.mockReturnValue({
 ...defaultAuthContext,
 userProfile: null,
 });

 render(
 <ProtectedRoute>
 <div>Protected Content</div>
 </ProtectedRoute>
 );

 await waitFor(() => {
 expect(mockPush).toHaveBeenCalledWith('/onboarding');
 });
 });

 it('allows access when authenticated with profile', () => {
 render(
 <ProtectedRoute>
 <div>Protected Content</div>
 </ProtectedRoute>
 );

 expect(screen.getByText('Protected Content')).toBeInTheDocument();
 });
 });

 describe('Role-based Access Control', () => {
 it('allows access when user has required role', () => {
 render(
 <ProtectedRoute requiredRole="creator">
 <div>Creator Content</div>
 </ProtectedRoute>
 );

 expect(screen.getByText('Creator Content')).toBeInTheDocument();
 });

 it('denies access when user lacks required role', () => {
 mockUseAuthContext.mockReturnValue({
 ...defaultAuthContext,
 userProfile: { 
 ...defaultAuthContext.userProfile!,
 role: 'member' as const,
 },
 hasRole: jest.fn((role: string) => role === 'member'),
 });

 render(
 <ProtectedRoute requiredRole="creator">
 <div>Creator Content</div>
 </ProtectedRoute>
 );

 expect(screen.getByText('Access Denied')).toBeInTheDocument();
 expect(screen.getByText(/This page requires creator access/)).toBeInTheDocument();
 expect(screen.queryByText('Creator Content')).not.toBeInTheDocument();
 });

 it('allows access when user has one of allowed roles', () => {
 render(
 <ProtectedRoute allowedRoles={['creator', 'admin']}>
 <div>Multi-role Content</div>
 </ProtectedRoute>
 );

 expect(screen.getByText('Multi-role Content')).toBeInTheDocument();
 });

 it('denies access when user has none of allowed roles', () => {
 mockUseAuthContext.mockReturnValue({
 ...defaultAuthContext,
 userProfile: { 
 ...defaultAuthContext.userProfile!,
 role: 'member' as const,
 },
 hasRole: jest.fn((role: string) => role === 'member'),
 });

 render(
 <ProtectedRoute allowedRoles={['creator', 'admin']}>
 <div>Multi-role Content</div>
 </ProtectedRoute>
 );

 expect(screen.getByText('Access Denied')).toBeInTheDocument();
 expect(screen.getByText(/This page requires one of: creator, admin/)).toBeInTheDocument();
 expect(screen.queryByText('Multi-role Content')).not.toBeInTheDocument();
 });

 it('redirects based on user role when access denied', async () => {
 mockUseAuthContext.mockReturnValue({
 ...defaultAuthContext,
 userProfile: { 
 ...defaultAuthContext.userProfile!,
 role: 'member' as const,
 },
 hasRole: jest.fn((role: string) => role === 'member'),
 });

 render(
 <ProtectedRoute requiredRole="creator">
 <div>Creator Content</div>
 </ProtectedRoute>
 );

 await waitFor(() => {
 expect(mockPush).toHaveBeenCalledWith('/dashboard');
 });
 });
 });

 describe('Custom Options', () => {
 it('uses custom redirect URL', async () => {
 mockUseAuthContext.mockReturnValue({
 ...defaultAuthContext,
 isSignedIn: false,
 userProfile: null,
 });

 render(
 <ProtectedRoute redirectTo="/custom-login">
 <div>Protected Content</div>
 </ProtectedRoute>
 );

 await waitFor(() => {
 expect(mockPush).toHaveBeenCalledWith('/custom-login?redirect=%2Fcreator%2Fdashboard');
 });
 });

 it('shows custom fallback component', () => {
 mockUseAuthContext.mockReturnValue({
 ...defaultAuthContext,
 isLoading: true,
 });

 const CustomFallback = () => <div data-testid="custom-fallback">Custom Loading</div>;

 render(
 <ProtectedRoute fallback={<CustomFallback />}>
 <div>Protected Content</div>
 </ProtectedRoute>
 );

 expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
 expect(screen.queryByTestId('auth-loading')).not.toBeInTheDocument();
 });

 it('skips profile requirement when requireProfile is false', () => {
 mockUseAuthContext.mockReturnValue({
 ...defaultAuthContext,
 userProfile: null,
 });

 render(
 <ProtectedRoute requireProfile={false}>
 <div>No Profile Required</div>
 </ProtectedRoute>
 );

 expect(screen.getByText('No Profile Required')).toBeInTheDocument();
 });
 });

 describe('Access Denied UI', () => {
 beforeEach(() => {
 mockUseAuthContext.mockReturnValue({
 ...defaultAuthContext,
 userProfile: { 
 ...defaultAuthContext.userProfile!,
 role: 'member' as const,
 },
 hasRole: jest.fn((role: string) => role === 'member'),
 });
 });

 it('shows go back button', () => {
 render(
 <ProtectedRoute requiredRole="creator">
 <div>Creator Content</div>
 </ProtectedRoute>
 );

 const goBackButton = screen.getByText('Go Back');
 expect(goBackButton).toBeInTheDocument();

 fireEvent.click(goBackButton);
 expect(mockBack).toHaveBeenCalledTimes(1);
 });

 it('shows go home button', () => {
 render(
 <ProtectedRoute requiredRole="creator">
 <div>Creator Content</div>
 </ProtectedRoute>
 );

 const goHomeButton = screen.getByText('Go Home');
 expect(goHomeButton).toBeInTheDocument();

 fireEvent.click(goHomeButton);
 expect(mockPush).toHaveBeenCalledWith('/');
 });
 });

 describe('Error Handling', () => {
 it('handles retry for retryable errors', () => {
 const mockRetry = jest.fn();
 const mockError = { type: 'network', message: 'Network error', retryable: true };
 
 mockUseAuthContext.mockReturnValue({
 ...defaultAuthContext,
 error: mockError,
 retry: mockRetry,
 });

 render(
 <ProtectedRoute>
 <div>Protected Content</div>
 </ProtectedRoute>
 );

 const retryButton = screen.getByTestId('retry-button');
 fireEvent.click(retryButton);

 expect(mockRetry).toHaveBeenCalledTimes(1);
 });

 it('handles dismiss for errors', () => {
 const mockClearError = jest.fn();
 const mockError = { type: 'network', message: 'Network error', retryable: false };
 
 mockUseAuthContext.mockReturnValue({
 ...defaultAuthContext,
 error: mockError,
 clearError: mockClearError,
 });

 render(
 <ProtectedRoute>
 <div>Protected Content</div>
 </ProtectedRoute>
 );

 const dismissButton = screen.getByTestId('dismiss-button');
 fireEvent.click(dismissButton);

 expect(mockClearError).toHaveBeenCalledTimes(1);
 });
 });
});

describe('CreatorProtectedRoute', () => {
 beforeEach(() => {
 mockUseRouter.mockReturnValue({
 push: jest.fn(),
 back: jest.fn(),
 forward: jest.fn(),
 refresh: jest.fn(),
 replace: jest.fn(),
 prefetch: jest.fn(),
 });
 
 mockUseAuthContext.mockReturnValue({
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
 });
 });

 it('allows creator access', () => {
 render(
 <CreatorProtectedRoute>
 <div>Creator Dashboard</div>
 </CreatorProtectedRoute>
 );

 expect(screen.getByText('Creator Dashboard')).toBeInTheDocument();
 });

 it('denies non-creator access', () => {
 mockUseAuthContext.mockReturnValue({
 user: { publicMetadata: { role: 'member' } },
 userProfile: { 
 id: '1',
 username: 'testmember',
 role: 'member' as const,
 email: 'test@example.com',
 clerkId: 'clerk_123',
 createdAt: new Date(),
 updatedAt: new Date(),
 },
 isLoading: false,
 isSignedIn: true,
 error: null,
 hasRole: jest.fn((role: string) => role === 'member'),
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 retry: jest.fn(),
 clearError: jest.fn(),
 });

 render(
 <CreatorProtectedRoute>
 <div>Creator Dashboard</div>
 </CreatorProtectedRoute>
 );

 expect(screen.getByText('Access Denied')).toBeInTheDocument();
 expect(screen.queryByText('Creator Dashboard')).not.toBeInTheDocument();
 });
});

describe('MemberProtectedRoute', () => {
 beforeEach(() => {
 mockUseRouter.mockReturnValue({
 push: jest.fn(),
 back: jest.fn(),
 forward: jest.fn(),
 refresh: jest.fn(),
 replace: jest.fn(),
 prefetch: jest.fn(),
 });
 
 mockUseAuthContext.mockReturnValue({
 user: { publicMetadata: { role: 'member' } },
 userProfile: { 
 id: '1',
 username: 'testmember',
 role: 'member' as const,
 email: 'test@example.com',
 clerkId: 'clerk_123',
 createdAt: new Date(),
 updatedAt: new Date(),
 },
 isLoading: false,
 isSignedIn: true,
 error: null,
 hasRole: jest.fn((role: string) => role === 'member'),
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 retry: jest.fn(),
 clearError: jest.fn(),
 });
 });

 it('allows member access', () => {
 render(
 <MemberProtectedRoute>
 <div>Member Dashboard</div>
 </MemberProtectedRoute>
 );

 expect(screen.getByText('Member Dashboard')).toBeInTheDocument();
 });
});

describe('useRouteAccess hook', () => {
 const TestComponent = ({ requiredRole, allowedRoles }: { requiredRole?: any; allowedRoles?: any[] }) => {
 const { canAccess, isLoading, isSignedIn, userProfile } = useRouteAccess(requiredRole, allowedRoles);
 
 return (
 <div>
 <div data-testid="can-access">{canAccess.toString()}</div>
 <div data-testid="is-loading">{isLoading.toString()}</div>
 <div data-testid="is-signed-in">{isSignedIn.toString()}</div>
 <div data-testid="user-role">{userProfile?.role || 'none'}</div>
 </div>
 );
 };

 beforeEach(() => {
 mockUseAuthContext.mockReturnValue({
 user: { publicMetadata: { role: 'creator' } },
 userProfile: { 
 id: '1',
 username: 'testuser',
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
 });
 });

 it('returns correct access state for authorized user', () => {
 render(<TestComponent requiredRole="creator" />);

 expect(screen.getByTestId('can-access')).toHaveTextContent('true');
 expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
 expect(screen.getByTestId('is-signed-in')).toHaveTextContent('true');
 expect(screen.getByTestId('user-role')).toHaveTextContent('creator');
 });

 it('returns correct access state for unauthorized user', () => {
 render(<TestComponent requiredRole="admin" />);

 expect(screen.getByTestId('can-access')).toHaveTextContent('false');
 expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
 expect(screen.getByTestId('is-signed-in')).toHaveTextContent('true');
 expect(screen.getByTestId('user-role')).toHaveTextContent('creator');
 });

 it('returns correct access state during loading', () => {
 mockUseAuthContext.mockReturnValue({
 user: null,
 userProfile: null,
 isLoading: true,
 isSignedIn: false,
 error: null,
 hasRole: jest.fn(() => false),
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 retry: jest.fn(),
 clearError: jest.fn(),
 });

 render(<TestComponent requiredRole="creator" />);

 expect(screen.getByTestId('can-access')).toHaveTextContent('false');
 expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
 expect(screen.getByTestId('is-signed-in')).toHaveTextContent('false');
 expect(screen.getByTestId('user-role')).toHaveTextContent('none');
 });
});