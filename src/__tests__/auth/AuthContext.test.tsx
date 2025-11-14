import { render, screen, waitFor, act } from '@testing-library/react';
import { useUser, useAuth } from '@clerk/nextjs';
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext';

jest.mock('@clerk/nextjs', () => ({
 useUser: jest.fn(),
 useAuth: jest.fn(),
}));

global.fetch = jest.fn();

const mockLocalStorage = {
 getItem: jest.fn(),
 setItem: jest.fn(),
 removeItem: jest.fn(),
 clear: jest.fn(),
};

const mockSessionStorage = {
 getItem: jest.fn(),
 setItem: jest.fn(),
 removeItem: jest.fn(),
 clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
 value: mockLocalStorage,
});

Object.defineProperty(window, 'sessionStorage', {
 value: mockSessionStorage,
});

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

function TestComponent() {
 const { 
 user, 
 userProfile, 
 isLoading, 
 isSignedIn, 
 hasRole, 
 error, 
 isOptimistic,
 retry,
 clearError 
 } = useAuthContext();
 
 return (
 <div>
 <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
 <div data-testid="signed-in">{isSignedIn ? 'signed-in' : 'signed-out'}</div>
 <div data-testid="user-id">{user?.id || 'no-user'}</div>
 <div data-testid="profile-role">{userProfile?.role || 'no-role'}</div>
 <div data-testid="is-creator">{hasRole('creator') ? 'creator' : 'not-creator'}</div>
 <div data-testid="error">{error ? error.message : 'no-error'}</div>
 <div data-testid="optimistic">{isOptimistic ? 'optimistic' : 'not-optimistic'}</div>
 <button data-testid="retry" onClick={retry}>Retry</button>
 <button data-testid="clear-error" onClick={clearError}>Clear Error</button>
 </div>
 );
}

describe('AuthContext', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 mockFetch.mockClear();
 mockLocalStorage.getItem.mockReturnValue(null);
 mockSessionStorage.getItem.mockReturnValue(null);
 jest.clearAllTimers();
 jest.useFakeTimers();
 });

 afterEach(() => {
 jest.runOnlyPendingTimers();
 jest.useRealTimers();
 });

 it('should show loading state initially', () => {
 mockUseUser.mockReturnValue({
 user: null,
 isLoaded: false,
 } as any);

 mockUseAuth.mockReturnValue({
 isSignedIn: false,
 signOut: jest.fn(),
 } as any);

 render(
 <AuthProvider>
 <TestComponent />
 </AuthProvider>
 );

 expect(screen.getByTestId('loading')).toHaveTextContent('loading');
 });

 it('should handle signed out state', async () => {
 mockUseUser.mockReturnValue({
 user: null,
 isLoaded: true,
 } as any);

 mockUseAuth.mockReturnValue({
 isSignedIn: false,
 signOut: jest.fn(),
 } as any);

 render(
 <AuthProvider>
 <TestComponent />
 </AuthProvider>
 );

 await waitFor(() => {
 expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
 expect(screen.getByTestId('signed-in')).toHaveTextContent('signed-out');
 expect(screen.getByTestId('user-id')).toHaveTextContent('no-user');
 });
 });

 it('should handle signed in user with profile', async () => {
 const mockUser = {
 id: 'user_123',
 emailAddresses: [{ emailAddress: 'test@example.com' }],
 };

 const mockProfile = {
 id: 'user_123',
 clerkId: 'user_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'creator' as const,
 createdAt: new Date(),
 updatedAt: new Date(),
 };

 mockUseUser.mockReturnValue({
 user: mockUser,
 isLoaded: true,
 } as any);

 mockUseAuth.mockReturnValue({
 isSignedIn: true,
 signOut: jest.fn(),
 } as any);

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => ({ user: mockProfile }),
 } as Response);

 render(
 <AuthProvider>
 <TestComponent />
 </AuthProvider>
 );

 await waitFor(() => {
 expect(screen.getByTestId('signed-in')).toHaveTextContent('signed-in');
 expect(screen.getByTestId('user-id')).toHaveTextContent('user_123');
 expect(screen.getByTestId('profile-role')).toHaveTextContent('creator');
 expect(screen.getByTestId('is-creator')).toHaveTextContent('creator');
 });

 expect(mockFetch).toHaveBeenCalledWith('/api/auth/profile', {
 headers: {
 'Cache-Control': 'max-age=300',
 },
 });
 });

 it('should handle profile not found', async () => {
 const mockUser = {
 id: 'user_123',
 emailAddresses: [{ emailAddress: 'test@example.com' }],
 };

 mockUseUser.mockReturnValue({
 user: mockUser,
 isLoaded: true,
 } as any);

 mockUseAuth.mockReturnValue({
 isSignedIn: true,
 signOut: jest.fn(),
 } as any);

 mockFetch.mockResolvedValueOnce({
 ok: false,
 status: 404,
 } as Response);

 render(
 <AuthProvider>
 <TestComponent />
 </AuthProvider>
 );

 await waitFor(() => {
 expect(mockFetch).toHaveBeenCalledWith('/api/auth/profile', {
 headers: {
 'Cache-Control': 'max-age=300',
 },
 });
 expect(screen.getByTestId('profile-role')).toHaveTextContent('no-role');
 });
 });

 it('should handle hasRole correctly for member', async () => {
 const mockUser = {
 id: 'user_123',
 emailAddresses: [{ emailAddress: 'test@example.com' }],
 };

 const mockProfile = {
 id: 'user_123',
 clerkId: 'user_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member' as const,
 createdAt: new Date(),
 updatedAt: new Date(),
 };

 mockUseUser.mockReturnValue({
 user: mockUser,
 isLoaded: true,
 } as any);

 mockUseAuth.mockReturnValue({
 isSignedIn: true,
 signOut: jest.fn(),
 } as any);

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => ({ user: mockProfile }),
 } as Response);

 render(
 <AuthProvider>
 <TestComponent />
 </AuthProvider>
 );

 await waitFor(() => {
 expect(screen.getByTestId('profile-role')).toHaveTextContent('member');
 expect(screen.getByTestId('is-creator')).toHaveTextContent('not-creator');
 });
 });

 it('should use cached profile when available', async () => {
 const mockProfile = {
 id: 'user_123',
 clerkId: 'user_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'creator' as const,
 createdAt: new Date(),
 updatedAt: new Date(),
 };

 mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
 profile: mockProfile,
 timestamp: Date.now() - 1000, // 1 second ago
 }));

 const mockUser = {
 id: 'user_123',
 emailAddresses: [{ emailAddress: 'test@example.com' }],
 };

 mockUseUser.mockReturnValue({
 user: mockUser,
 isLoaded: true,
 } as any);

 mockUseAuth.mockReturnValue({
 isSignedIn: true,
 signOut: jest.fn(),
 } as any);

 render(
 <AuthProvider>
 <TestComponent />
 </AuthProvider>
 );

 await waitFor(() => {
 expect(screen.getByTestId('profile-role')).toHaveTextContent('creator');
 });

 expect(mockFetch).not.toHaveBeenCalled();
 });

 it('should handle network errors with retry', async () => {
 const mockUser = {
 id: 'user_123',
 emailAddresses: [{ emailAddress: 'test@example.com' }],
 };

 mockUseUser.mockReturnValue({
 user: mockUser,
 isLoaded: true,
 } as any);

 mockUseAuth.mockReturnValue({
 isSignedIn: true,
 signOut: jest.fn(),
 } as any);

 mockFetch.mockRejectedValueOnce(new Error('Network error'));

 render(
 <AuthProvider>
 <TestComponent />
 </AuthProvider>
 );

 await waitFor(() => {
 expect(screen.getByTestId('error')).toHaveTextContent('Network error. Please check your connection and try again.');
 });

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => ({ user: { role: 'creator' } }),
 } as Response);

 act(() => {
 screen.getByTestId('retry').click();
 });

 await waitFor(() => {
 expect(screen.getByTestId('error')).toHaveTextContent('no-error');
 });
 });

 it('should handle session persistence', async () => {
 const mockProfile = {
 id: 'user_123',
 clerkId: 'user_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'creator' as const,
 createdAt: new Date(),
 updatedAt: new Date(),
 };

 mockSessionStorage.getItem.mockReturnValue(JSON.stringify({
 userProfile: mockProfile,
 isSignedIn: true,
 lastFetch: Date.now() - 1000,
 error: null,
 }));

 const mockUser = {
 id: 'user_123',
 emailAddresses: [{ emailAddress: 'test@example.com' }],
 };

 mockUseUser.mockReturnValue({
 user: mockUser,
 isLoaded: true,
 } as any);

 mockUseAuth.mockReturnValue({
 isSignedIn: true,
 signOut: jest.fn(),
 } as any);

 render(
 <AuthProvider>
 <TestComponent />
 </AuthProvider>
 );

 expect(screen.getByTestId('optimistic')).toHaveTextContent('optimistic');

 await waitFor(() => {
 expect(screen.getByTestId('profile-role')).toHaveTextContent('creator');
 expect(screen.getByTestId('optimistic')).toHaveTextContent('not-optimistic');
 });
 });

 it('should handle optimistic updates', async () => {
 const mockProfile = {
 id: 'user_123',
 clerkId: 'user_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'creator' as const,
 createdAt: new Date(),
 updatedAt: new Date(),
 };

 const mockUser = {
 id: 'user_123',
 emailAddresses: [{ emailAddress: 'test@example.com' }],
 };

 mockUseUser.mockReturnValue({
 user: mockUser,
 isLoaded: true,
 } as any);

 mockUseAuth.mockReturnValue({
 isSignedIn: true,
 signOut: jest.fn(),
 } as any);

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => ({ user: mockProfile }),
 } as Response);

 const TestUpdateComponent = () => {
 const { userProfile, updateUserProfile, isOptimistic } = useAuthContext();
 
 return (
 <div>
 <div data-testid="username">{userProfile?.username || 'no-username'}</div>
 <div data-testid="optimistic">{isOptimistic ? 'optimistic' : 'not-optimistic'}</div>
 <button 
 data-testid="update" 
 onClick={() => updateUserProfile({ username: 'newusername' })}
 >
 Update
 </button>
 </div>
 );
 };

 render(
 <AuthProvider>
 <TestUpdateComponent />
 </AuthProvider>
 );

 await waitFor(() => {
 expect(screen.getByTestId('username')).toHaveTextContent('testuser');
 });

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => ({ ...mockProfile, username: 'newusername' }),
 } as Response);

 act(() => {
 screen.getByTestId('update').click();
 });

 expect(screen.getByTestId('username')).toHaveTextContent('newusername');
 expect(screen.getByTestId('optimistic')).toHaveTextContent('optimistic');

 await waitFor(() => {
 expect(screen.getByTestId('optimistic')).toHaveTextContent('not-optimistic');
 });
 });

 it('should clear error when clearError is called', async () => {
 const mockUser = {
 id: 'user_123',
 emailAddresses: [{ emailAddress: 'test@example.com' }],
 };

 mockUseUser.mockReturnValue({
 user: mockUser,
 isLoaded: true,
 } as any);

 mockUseAuth.mockReturnValue({
 isSignedIn: true,
 signOut: jest.fn(),
 } as any);

 mockFetch.mockRejectedValueOnce(new Error('Network error'));

 render(
 <AuthProvider>
 <TestComponent />
 </AuthProvider>
 );

 await waitFor(() => {
 expect(screen.getByTestId('error')).not.toHaveTextContent('no-error');
 });

 act(() => {
 screen.getByTestId('clear-error').click();
 });

 expect(screen.getByTestId('error')).toHaveTextContent('no-error');
 });
});