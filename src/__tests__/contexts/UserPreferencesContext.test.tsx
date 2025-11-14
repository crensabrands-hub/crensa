import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ClerkProvider } from '@clerk/nextjs';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserPreferencesProvider, useUserPreferences } from '@/contexts/UserPreferencesContext';

jest.mock('@clerk/nextjs', () => ({
 ClerkProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
 useUser: () => ({
 user: {
 id: 'test-user-id',
 emailAddresses: [{ emailAddress: 'test@example.com' }],
 },
 isLoaded: true,
 }),
 useAuth: () => ({
 isSignedIn: true,
 signOut: jest.fn(),
 }),
}));

global.fetch = jest.fn();

function TestComponent() {
 const {
 preferences,
 isLoading,
 error,
 updateNotificationPreferences,
 updatePrivacyPreferences,
 updatePlaybackPreferences,
 } = useUserPreferences();

 return (
 <div>
 <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
 <div data-testid="error">{error || 'no-error'}</div>
 <div data-testid="email-notifications">
 {preferences.notifications.email ? 'enabled' : 'disabled'}
 </div>
 <div data-testid="profile-visibility">
 {preferences.privacy.profileVisibility}
 </div>
 <div data-testid="autoplay">
 {preferences.playback.autoplay ? 'enabled' : 'disabled'}
 </div>
 <button
 data-testid="update-notifications"
 onClick={() => updateNotificationPreferences({ email: false })}
 >
 Disable Email
 </button>
 <button
 data-testid="update-privacy"
 onClick={() => updatePrivacyPreferences({ profileVisibility: 'private' })}
 >
 Make Private
 </button>
 <button
 data-testid="update-playback"
 onClick={() => updatePlaybackPreferences({ autoplay: false })}
 >
 Disable Autoplay
 </button>
 </div>
 );
}

function TestWrapper({ children }: { children: React.ReactNode }) {
 return (
 <ClerkProvider>
 <AuthProvider>
 <UserPreferencesProvider>
 {children}
 </UserPreferencesProvider>
 </AuthProvider>
 </ClerkProvider>
 );
}

describe('UserPreferencesContext', () => {
 beforeEach(() => {
 jest.clearAllMocks();

 localStorage.clear();
 });

 it('should provide default preferences initially', async () => {

 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 notifications: { email: true, push: true, earnings: true, newFollowers: true, videoComments: true },
 privacy: { profileVisibility: 'public', showEarnings: true, showViewCount: true },
 playback: { autoplay: true, quality: 'auto', volume: 80 },
 }),
 });

 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 expect(screen.getByTestId('email-notifications')).toHaveTextContent('enabled');
 expect(screen.getByTestId('profile-visibility')).toHaveTextContent('public');
 expect(screen.getByTestId('autoplay')).toHaveTextContent('enabled');
 });

 it('should handle API fetch errors gracefully', async () => {

 (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('error')).toHaveTextContent('Network error');
 });

 expect(screen.getByTestId('email-notifications')).toHaveTextContent('enabled');
 });

 it('should update notification preferences optimistically', async () => {

 (global.fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 notifications: { email: true, push: true, earnings: true, newFollowers: true, videoComments: true },
 privacy: { profileVisibility: 'public', showEarnings: true, showViewCount: true },
 playback: { autoplay: true, quality: 'auto', volume: 80 },
 }),
 })
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 notifications: { email: false, push: true, earnings: true, newFollowers: true, videoComments: true },
 privacy: { profileVisibility: 'public', showEarnings: true, showViewCount: true },
 playback: { autoplay: true, quality: 'auto', volume: 80 },
 }),
 });

 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
 });

 act(() => {
 screen.getByTestId('update-notifications').click();
 });

 await waitFor(() => {
 expect(screen.getByTestId('email-notifications')).toHaveTextContent('disabled');
 });
 });

 it('should cache preferences in localStorage', async () => {
 const mockPreferences = {
 notifications: { email: true, push: false, earnings: true, newFollowers: true, videoComments: true },
 privacy: { profileVisibility: 'private', showEarnings: false, showViewCount: true },
 playback: { autoplay: false, quality: 'high', volume: 60 },
 };

 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => mockPreferences,
 });

 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
 });

 const cached = localStorage.getItem('user_preferences_cache');
 expect(cached).toBeTruthy();
 
 if (cached) {
 const { preferences } = JSON.parse(cached);
 expect(preferences.privacy.profileVisibility).toBe('private');
 expect(preferences.playback.autoplay).toBe(false);
 }
 });

 it('should use cached preferences on initialization', () => {
 const cachedPreferences = {
 notifications: { email: false, push: true, earnings: true, newFollowers: true, videoComments: true },
 privacy: { profileVisibility: 'private', showEarnings: true, showViewCount: true },
 playback: { autoplay: false, quality: 'auto', volume: 80 },
 };

 localStorage.setItem('user_preferences_cache', JSON.stringify({
 preferences: cachedPreferences,
 timestamp: Date.now(),
 }));

 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 expect(screen.getByTestId('email-notifications')).toHaveTextContent('disabled');
 expect(screen.getByTestId('profile-visibility')).toHaveTextContent('private');
 expect(screen.getByTestId('autoplay')).toHaveTextContent('disabled');
 });

 it('should handle update failures by rolling back optimistic updates', async () => {

 (global.fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 notifications: { email: true, push: true, earnings: true, newFollowers: true, videoComments: true },
 privacy: { profileVisibility: 'public', showEarnings: true, showViewCount: true },
 playback: { autoplay: true, quality: 'auto', volume: 80 },
 }),
 })
 .mockRejectedValueOnce(new Error('Update failed'));

 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
 });

 expect(screen.getByTestId('email-notifications')).toHaveTextContent('enabled');

 act(() => {
 screen.getByTestId('update-notifications').click();
 });

 await waitFor(() => {
 expect(screen.getByTestId('email-notifications')).toHaveTextContent('enabled');
 expect(screen.getByTestId('error')).toHaveTextContent('Update failed');
 });
 });
});