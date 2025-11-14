import { render, screen, waitFor } from '@testing-library/react';
import { withAuth, withCreatorAuth, withMemberAuth, useAuthGuard } from '../withAuth';
import { useAuthContext } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: jest.fn(),
}));

const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>;

function TestComponent({ isOptimistic }: { isOptimistic?: boolean }) {
 return (
 <div>
 <div data-testid="content">Protected Content</div>
 {isOptimistic && <div data-testid="optimistic">Optimistic</div>}
 </div>
 );
}

const mockLocation = {
 href: '',
 pathname: '/',
};

Object.defineProperty(window, 'location', {
 value: mockLocation,
 writable: true,
});

describe('withAuth', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 mockLocation.href = '';
 mockLocation.pathname = '/';
 });

 it('should render loading state when loading', () => {
 mockUseAuthContext.mockReturnValue({
 isLoading: true,
 isSignedIn: false,
 userProfile: null,
 hasRole: jest.fn(),
 error: null,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 user: null,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 });

 const WrappedComponent = withAuth(TestComponent);
 render(<WrappedComponent />);

 expect(screen.getByText('Loading...')).toBeInTheDocument();
 expect(screen.queryByTestId('content')).not.toBeInTheDocument();
 });

 it('should render error state when error exists', () => {
 const mockError = {
 type: 'network' as const,
 message: 'Network error',
 retryable: true,
 };

 mockUseAuthContext.mockReturnValue({
 isLoading: false,
 isSignedIn: true,
 userProfile: null,
 hasRole: jest.fn(),
 error: mockError,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 user: null,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 });

 const WrappedComponent = withAuth(TestComponent);
 render(<WrappedComponent />);

 expect(screen.getByText('Network error')).toBeInTheDocument();
 expect(screen.queryByTestId('content')).not.toBeInTheDocument();
 });

 it('should redirect when not signed in', () => {
 mockUseAuthContext.mockReturnValue({
 isLoading: false,
 isSignedIn: false,
 userProfile: null,
 hasRole: jest.fn(),
 error: null,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 user: null,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 });

 const WrappedComponent = withAuth(TestComponent);
 render(<WrappedComponent />);

 expect(mockLocation.href).toContain('/sign-in');
 });

 it('should redirect to onboarding when profile is required but missing', () => {
 mockUseAuthContext.mockReturnValue({
 isLoading: false,
 isSignedIn: true,
 userProfile: null,
 hasRole: jest.fn(),
 error: null,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 user: { id: 'user_123' } as any,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 });

 const WrappedComponent = withAuth(TestComponent, { requireProfile: true });
 render(<WrappedComponent />);

 expect(mockLocation.href).toBe('/onboarding');
 });

 it('should render access denied when role requirement not met', () => {
 const mockHasRole = jest.fn().mockReturnValue(false);

 mockUseAuthContext.mockReturnValue({
 isLoading: false,
 isSignedIn: true,
 userProfile: { role: 'member' } as any,
 hasRole: mockHasRole,
 error: null,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 user: { id: 'user_123' } as any,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 });

 const WrappedComponent = withAuth(TestComponent, { requiredRole: 'creator' });
 render(<WrappedComponent />);

 expect(screen.getByText('Access Denied')).toBeInTheDocument();
 expect(screen.getByText(/requires creator access/)).toBeInTheDocument();
 expect(mockHasRole).toHaveBeenCalledWith('creator');
 });

 it('should render component when all requirements are met', () => {
 const mockHasRole = jest.fn().mockReturnValue(true);

 mockUseAuthContext.mockReturnValue({
 isLoading: false,
 isSignedIn: true,
 userProfile: { role: 'creator' } as any,
 hasRole: mockHasRole,
 error: null,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 user: { id: 'user_123' } as any,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 });

 const WrappedComponent = withAuth(TestComponent, { requiredRole: 'creator' });
 render(<WrappedComponent />);

 expect(screen.getByTestId('content')).toBeInTheDocument();
 expect(screen.getByText('Protected Content')).toBeInTheDocument();
 });

 it('should pass isOptimistic prop to wrapped component', () => {
 const mockHasRole = jest.fn().mockReturnValue(true);

 mockUseAuthContext.mockReturnValue({
 isLoading: false,
 isSignedIn: true,
 userProfile: { role: 'creator' } as any,
 hasRole: mockHasRole,
 error: null,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: true,
 user: { id: 'user_123' } as any,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 });

 const WrappedComponent = withAuth(TestComponent);
 render(<WrappedComponent />);

 expect(screen.getByTestId('optimistic')).toBeInTheDocument();
 });
});

describe('withCreatorAuth', () => {
 it('should require creator role', () => {
 const mockHasRole = jest.fn().mockReturnValue(false);

 mockUseAuthContext.mockReturnValue({
 isLoading: false,
 isSignedIn: true,
 userProfile: { role: 'member' } as any,
 hasRole: mockHasRole,
 error: null,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 user: { id: 'user_123' } as any,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 });

 const WrappedComponent = withCreatorAuth(TestComponent);
 render(<WrappedComponent />);

 expect(screen.getByText('Access Denied')).toBeInTheDocument();
 expect(mockHasRole).toHaveBeenCalledWith('creator');
 });
});

describe('withMemberAuth', () => {
 it('should require member role', () => {
 const mockHasRole = jest.fn().mockReturnValue(false);

 mockUseAuthContext.mockReturnValue({
 isLoading: false,
 isSignedIn: true,
 userProfile: { role: 'creator' } as any,
 hasRole: mockHasRole,
 error: null,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 user: { id: 'user_123' } as any,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 });

 const WrappedComponent = withMemberAuth(TestComponent);
 render(<WrappedComponent />);

 expect(screen.getByText('Access Denied')).toBeInTheDocument();
 expect(mockHasRole).toHaveBeenCalledWith('member');
 });
});

describe('useAuthGuard', () => {
 function TestHookComponent({ requiredRole }: { requiredRole?: 'creator' | 'member' }) {
 const { canAccess, isLoading, error } = useAuthGuard(requiredRole);
 
 return (
 <div>
 <div data-testid="can-access">{canAccess ? 'can-access' : 'cannot-access'}</div>
 <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
 <div data-testid="error">{error ? 'has-error' : 'no-error'}</div>
 </div>
 );
 }

 it('should return false when loading', () => {
 mockUseAuthContext.mockReturnValue({
 isLoading: true,
 isSignedIn: false,
 userProfile: null,
 hasRole: jest.fn(),
 error: null,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 user: null,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 });

 render(<TestHookComponent />);

 expect(screen.getByTestId('can-access')).toHaveTextContent('cannot-access');
 expect(screen.getByTestId('loading')).toHaveTextContent('loading');
 });

 it('should return false when error exists', () => {
 mockUseAuthContext.mockReturnValue({
 isLoading: false,
 isSignedIn: true,
 userProfile: { role: 'creator' } as any,
 hasRole: jest.fn(),
 error: { type: 'network', message: 'Error', retryable: true } as any,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 user: { id: 'user_123' } as any,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 });

 render(<TestHookComponent />);

 expect(screen.getByTestId('can-access')).toHaveTextContent('cannot-access');
 expect(screen.getByTestId('error')).toHaveTextContent('has-error');
 });

 it('should return true when all conditions are met', () => {
 const mockHasRole = jest.fn().mockReturnValue(true);

 mockUseAuthContext.mockReturnValue({
 isLoading: false,
 isSignedIn: true,
 userProfile: { role: 'creator' } as any,
 hasRole: mockHasRole,
 error: null,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 user: { id: 'user_123' } as any,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 });

 render(<TestHookComponent requiredRole="creator" />);

 expect(screen.getByTestId('can-access')).toHaveTextContent('can-access');
 expect(mockHasRole).toHaveBeenCalledWith('creator');
 });
});