import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationPreferences from '@/components/notifications/NotificationPreferences';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuthContext } from '@/contexts/AuthContext';

jest.mock('@/contexts/NotificationContext', () => ({
 useNotifications: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: jest.fn(),
}));

const mockPreferences = {
 email: true,
 push: true,
 earnings: true,
 newFollowers: true,
 videoComments: true,
 videoLikes: true,
 paymentUpdates: true,
 systemUpdates: true,
};

const mockUseNotifications = {
 preferences: mockPreferences,
 updatePreferences: jest.fn(),
 isPreferencesLoading: false,
};

const mockUserProfile = {
 id: 'user-1',
 role: 'creator' as const,
 email: 'test@example.com',
 username: 'testuser',
};

describe('NotificationPreferences', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 (useNotifications as jest.Mock).mockReturnValue(mockUseNotifications);
 (useAuthContext as jest.Mock).mockReturnValue({
 userProfile: mockUserProfile,
 });
 });

 it('should render notification preferences for creator', () => {
 render(<NotificationPreferences />);

 expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
 expect(screen.getByText('Choose how you want to be notified')).toBeInTheDocument();

 expect(screen.getByText('Email Notifications')).toBeInTheDocument();
 expect(screen.getByText('Push Notifications')).toBeInTheDocument();

 expect(screen.getByText('Creator Notifications')).toBeInTheDocument();
 expect(screen.getByText('Earnings & Views')).toBeInTheDocument();
 expect(screen.getByText('New Followers')).toBeInTheDocument();

 expect(screen.getByText('Video Comments')).toBeInTheDocument();
 expect(screen.getByText('Video Likes')).toBeInTheDocument();

 expect(screen.getByText('Payment Updates')).toBeInTheDocument();
 expect(screen.getByText('System Updates')).toBeInTheDocument();
 });

 it('should render notification preferences for member', () => {
 (useAuthContext as jest.Mock).mockReturnValue({
 userProfile: { ...mockUserProfile, role: 'member' },
 });

 render(<NotificationPreferences />);

 expect(screen.getByText('Activity Notifications')).toBeInTheDocument();
 expect(screen.queryByText('Earnings & Views')).not.toBeInTheDocument();
 expect(screen.queryByText('New Followers')).not.toBeInTheDocument();

 expect(screen.getByText('Get notified about comment replies')).toBeInTheDocument();
 expect(screen.getByText('Get notified about likes on your comments')).toBeInTheDocument();
 });

 it('should show loading state', () => {
 (useNotifications as jest.Mock).mockReturnValue({
 ...mockUseNotifications,
 isPreferencesLoading: true,
 });

 render(<NotificationPreferences />);

 expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
 });

 it('should toggle email notifications', async () => {
 const user = userEvent.setup();
 const mockUpdatePreferences = jest.fn().mockResolvedValue(undefined);
 
 (useNotifications as jest.Mock).mockReturnValue({
 ...mockUseNotifications,
 updatePreferences: mockUpdatePreferences,
 });

 render(<NotificationPreferences />);

 const toggles = screen.getAllByRole('switch');
 const emailToggle = toggles[0]; // First toggle is email
 expect(emailToggle).toHaveAttribute('aria-checked', 'true');

 await user.click(emailToggle);

 expect(mockUpdatePreferences).toHaveBeenCalledWith({ email: false });
 });

 it('should toggle push notifications', async () => {
 const user = userEvent.setup();
 const mockUpdatePreferences = jest.fn().mockResolvedValue(undefined);
 
 (useNotifications as jest.Mock).mockReturnValue({
 ...mockUseNotifications,
 updatePreferences: mockUpdatePreferences,
 });

 render(<NotificationPreferences />);

 const toggles = screen.getAllByRole('switch');
 const pushToggle = toggles[1]; // Second toggle is push
 expect(pushToggle).toHaveAttribute('aria-checked', 'true');

 await user.click(pushToggle);

 expect(mockUpdatePreferences).toHaveBeenCalledWith({ push: false });
 });

 it('should toggle earnings notifications for creator', async () => {
 const user = userEvent.setup();
 const mockUpdatePreferences = jest.fn().mockResolvedValue(undefined);
 
 (useNotifications as jest.Mock).mockReturnValue({
 ...mockUseNotifications,
 updatePreferences: mockUpdatePreferences,
 });

 render(<NotificationPreferences />);

 const toggles = screen.getAllByRole('switch');
 const earningsToggle = toggles[2]; // Third toggle is earnings
 expect(earningsToggle).toHaveAttribute('aria-checked', 'true');

 await user.click(earningsToggle);

 expect(mockUpdatePreferences).toHaveBeenCalledWith({ earnings: false });
 });

 it('should show success message after saving preferences', async () => {
 const user = userEvent.setup();
 const mockUpdatePreferences = jest.fn().mockResolvedValue(undefined);
 
 (useNotifications as jest.Mock).mockReturnValue({
 ...mockUseNotifications,
 updatePreferences: mockUpdatePreferences,
 });

 render(<NotificationPreferences />);

 const emailToggle = screen.getByRole('switch', { name: /email notifications/i });
 await user.click(emailToggle);

 await waitFor(() => {
 expect(screen.getByText('Preferences saved successfully!')).toBeInTheDocument();
 });

 await waitFor(
 () => {
 expect(screen.queryByText('Preferences saved successfully!')).not.toBeInTheDocument();
 },
 { timeout: 4000 }
 );
 });

 it('should show error message when saving fails', async () => {
 const user = userEvent.setup();
 const mockUpdatePreferences = jest.fn().mockRejectedValue(new Error('Save failed'));
 
 (useNotifications as jest.Mock).mockReturnValue({
 ...mockUseNotifications,
 updatePreferences: mockUpdatePreferences,
 });

 render(<NotificationPreferences />);

 const emailToggle = screen.getByRole('switch', { name: /email notifications/i });
 await user.click(emailToggle);

 await waitFor(() => {
 expect(screen.getByText('Failed to save preferences. Please try again.')).toBeInTheDocument();
 });
 });

 it('should disable toggles while saving', async () => {
 const user = userEvent.setup();
 let resolvePromise: () => void;
 const mockUpdatePreferences = jest.fn().mockImplementation(
 () => new Promise(resolve => { resolvePromise = resolve; })
 );
 
 (useNotifications as jest.Mock).mockReturnValue({
 ...mockUseNotifications,
 updatePreferences: mockUpdatePreferences,
 });

 render(<NotificationPreferences />);

 const toggles = screen.getAllByRole('switch');
 const emailToggle = toggles[0]; // First toggle is email
 await user.click(emailToggle);

 expect(emailToggle).toBeDisabled();

 resolvePromise!();

 await waitFor(() => {
 expect(emailToggle).not.toBeDisabled();
 });
 });

 it('should show correct switch states based on preferences', () => {
 const customPreferences = {
 ...mockPreferences,
 email: false,
 push: true,
 earnings: false,
 };

 (useNotifications as jest.Mock).mockReturnValue({
 ...mockUseNotifications,
 preferences: customPreferences,
 });

 render(<NotificationPreferences />);

 const toggles = screen.getAllByRole('switch');
 const emailToggle = toggles[0]; // First toggle is email
 const pushToggle = toggles[1]; // Second toggle is push
 const earningsToggle = toggles[2]; // Third toggle is earnings

 expect(emailToggle).toHaveAttribute('aria-checked', 'false');
 expect(pushToggle).toHaveAttribute('aria-checked', 'true');
 expect(earningsToggle).toHaveAttribute('aria-checked', 'false');
 });

 it('should show info box about notifications', () => {
 render(<NotificationPreferences />);

 expect(screen.getByText('About Notifications')).toBeInTheDocument();
 expect(screen.getByText(/You can change these preferences anytime/)).toBeInTheDocument();
 expect(screen.getByText(/Critical security and account notifications/)).toBeInTheDocument();
 });

 it('should have proper accessibility attributes', () => {
 render(<NotificationPreferences />);

 const toggles = screen.getAllByRole('switch');
 const emailToggle = toggles[0]; // First toggle is email
 
 expect(emailToggle).toHaveAttribute('aria-checked', 'true');
 expect(emailToggle).toHaveAttribute('role', 'switch');
 });
});