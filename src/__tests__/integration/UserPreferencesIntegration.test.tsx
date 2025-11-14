import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ClerkProvider } from '@clerk/nextjs';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext';
import UserSettings from '@/components/profile/UserSettings';
import NotificationPreferences from '@/components/notifications/NotificationPreferences';

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

describe('UserPreferences Integration', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 localStorage.clear();

 (global.fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 id: 'test-user-id',
 role: 'creator',
 }),
 })
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 notifications: {
 email: true,
 push: true,
 earnings: true,
 newFollowers: true,
 videoComments: true,
 videoLikes: true,
 paymentUpdates: true,
 systemUpdates: true,
 },
 privacy: {
 profileVisibility: 'public',
 showEarnings: true,
 showViewCount: true,
 },
 playback: {
 autoplay: true,
 quality: 'auto',
 volume: 80,
 },
 }),
 });
 });

 it('should integrate UserSettings with UserPreferencesContext', async () => {
 render(
 <TestWrapper>
 <UserSettings />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.queryByText('Settings')).toBeInTheDocument();
 });

 const emailToggle = screen.getByRole('checkbox', { name: /email notifications/i });
 expect(emailToggle).toBeChecked();

 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 notifications: {
 email: false,
 push: true,
 earnings: true,
 newFollowers: true,
 videoComments: true,
 videoLikes: true,
 paymentUpdates: true,
 systemUpdates: true,
 },
 privacy: {
 profileVisibility: 'public',
 showEarnings: true,
 showViewCount: true,
 },
 playback: {
 autoplay: true,
 quality: 'auto',
 volume: 80,
 },
 }),
 });

 fireEvent.click(emailToggle);

 await waitFor(() => {
 expect(screen.getByText('Settings saved!')).toBeInTheDocument();
 });
 });

 it('should integrate NotificationPreferences with UserPreferencesContext', async () => {
 render(
 <TestWrapper>
 <NotificationPreferences />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
 });

 const emailSwitch = screen.getByRole('switch', { name: /email notifications/i });
 expect(emailSwitch).toHaveAttribute('aria-checked', 'true');

 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 notifications: {
 email: false,
 push: true,
 earnings: true,
 newFollowers: true,
 videoComments: true,
 videoLikes: true,
 paymentUpdates: true,
 systemUpdates: true,
 },
 privacy: {
 profileVisibility: 'public',
 showEarnings: true,
 showViewCount: true,
 },
 playback: {
 autoplay: true,
 quality: 'auto',
 volume: 80,
 },
 }),
 });

 fireEvent.click(emailSwitch);

 await waitFor(() => {
 expect(screen.getByText('Preferences saved successfully!')).toBeInTheDocument();
 });
 });

 it('should handle API errors gracefully', async () => {

 (global.fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 id: 'test-user-id',
 role: 'creator',
 }),
 })
 .mockRejectedValueOnce(new Error('Network error'));

 render(
 <TestWrapper>
 <UserSettings />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByText('Settings')).toBeInTheDocument();
 });

 await waitFor(() => {
 expect(screen.getByText('Network error')).toBeInTheDocument();
 });
 });

 it('should share preferences state between components', async () => {
 const TestComponent = () => (
 <div>
 <UserSettings />
 <NotificationPreferences />
 </div>
 );

 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByText('Settings')).toBeInTheDocument();
 expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
 });

 const userSettingsEmailToggle = screen.getAllByRole('checkbox')[0]; // First checkbox in UserSettings
 const notificationPrefsEmailSwitch = screen.getByRole('switch', { name: /email notifications/i });

 expect(userSettingsEmailToggle).toBeChecked();
 expect(notificationPrefsEmailSwitch).toHaveAttribute('aria-checked', 'true');
 });
});