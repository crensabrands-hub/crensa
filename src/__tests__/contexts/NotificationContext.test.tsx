import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationProvider, useNotifications } from '@/contexts/NotificationContext';
import { useAuthContext } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: jest.fn(),
}));

global.fetch = jest.fn();

const mockUserProfile = {
 id: 'user-1',
 role: 'creator' as const,
 email: 'test@example.com',
 username: 'testuser',
};

const mockNotifications = [
 {
 id: 'notif-1',
 userId: 'user-1',
 type: 'earning',
 title: 'New Earning!',
 message: 'You earned ₹10 from "Test Video"',
 isRead: false,
 metadata: { videoId: 'video-1', amount: 10 },
 createdAt: '2024-01-01T00:00:00Z',
 updatedAt: '2024-01-01T00:00:00Z',
 },
 {
 id: 'notif-2',
 userId: 'user-1',
 type: 'follower',
 title: 'New Follower!',
 message: 'John started following you',
 isRead: true,
 metadata: { followerId: 'user-2' },
 createdAt: '2024-01-01T00:00:00Z',
 updatedAt: '2024-01-01T00:00:00Z',
 },
];

function TestComponent() {
 const {
 notifications,
 unreadCount,
 isLoading,
 error,
 fetchNotifications,
 markAsRead,
 markAllAsRead,
 deleteNotification,
 preferences,
 updatePreferences,
 } = useNotifications();

 return (
 <div>
 <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
 <div data-testid="error">{error || 'No Error'}</div>
 <div data-testid="unread-count">{unreadCount}</div>
 <div data-testid="notification-count">{notifications.length}</div>
 
 <div data-testid="preferences">
 {JSON.stringify(preferences)}
 </div>
 
 <button onClick={() => fetchNotifications(true)}>Fetch Notifications</button>
 <button onClick={() => markAsRead('notif-1')}>Mark First as Read</button>
 <button onClick={markAllAsRead}>Mark All as Read</button>
 <button onClick={() => deleteNotification('notif-1')}>Delete First</button>
 <button onClick={() => updatePreferences({ email: false })}>
 Update Preferences
 </button>
 
 <div data-testid="notifications">
 {notifications.map(notification => (
 <div key={notification.id} data-testid={`notification-${notification.id}`}>
 {notification.title} - {notification.isRead ? 'Read' : 'Unread'}
 </div>
 ))}
 </div>
 </div>
 );
}

describe('NotificationContext', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 (useAuthContext as jest.Mock).mockReturnValue({
 userProfile: mockUserProfile,
 isLoading: false,
 });
 (fetch as jest.Mock).mockResolvedValue({
 ok: true,
 json: () => Promise.resolve(mockNotifications),
 });
 });

 it('should provide notification context', async () => {
 render(
 <NotificationProvider>
 <TestComponent />
 </NotificationProvider>
 );

 await waitFor(() => {
 expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
 });

 expect(screen.getByTestId('error')).toHaveTextContent('No Error');
 expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
 expect(screen.getByTestId('notification-count')).toHaveTextContent('2');
 });

 it('should fetch notifications on mount', async () => {
 render(
 <NotificationProvider>
 <TestComponent />
 </NotificationProvider>
 );

 await waitFor(() => {
 expect(fetch).toHaveBeenCalledWith('/api/notifications', expect.any(Object));
 });

 expect(screen.getByTestId('notification-notif-1')).toHaveTextContent('New Earning! - Unread');
 expect(screen.getByTestId('notification-notif-2')).toHaveTextContent('New Follower! - Read');
 });

 it('should mark notification as read', async () => {
 const user = userEvent.setup();
 
 (fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve(mockNotifications),
 })
 .mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve({ success: true }),
 });

 render(
 <NotificationProvider>
 <TestComponent />
 </NotificationProvider>
 );

 await waitFor(() => {
 expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
 });

 await act(async () => {
 await user.click(screen.getByText('Mark First as Read'));
 });

 await waitFor(() => {
 expect(fetch).toHaveBeenCalledWith('/api/notifications/notif-1', {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ action: 'mark_read' }),
 });
 });

 expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
 });

 it('should mark all notifications as read', async () => {
 const user = userEvent.setup();
 
 (fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve(mockNotifications),
 })
 .mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve({ success: true, updatedCount: 1 }),
 });

 render(
 <NotificationProvider>
 <TestComponent />
 </NotificationProvider>
 );

 await waitFor(() => {
 expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
 });

 await act(async () => {
 await user.click(screen.getByText('Mark All as Read'));
 });

 await waitFor(() => {
 expect(fetch).toHaveBeenCalledWith('/api/notifications/mark-all-read', {
 method: 'POST',
 });
 });

 expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
 });

 it('should delete notification', async () => {
 const user = userEvent.setup();
 
 (fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve(mockNotifications),
 })
 .mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve({ success: true }),
 });

 render(
 <NotificationProvider>
 <TestComponent />
 </NotificationProvider>
 );

 await waitFor(() => {
 expect(screen.getByTestId('notification-count')).toHaveTextContent('2');
 });

 await act(async () => {
 await user.click(screen.getByText('Delete First'));
 });

 await waitFor(() => {
 expect(fetch).toHaveBeenCalledWith('/api/notifications/notif-1', {
 method: 'DELETE',
 });
 });

 expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
 });

 it('should update preferences', async () => {
 const user = userEvent.setup();
 
 (fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve(mockNotifications),
 })
 .mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve([]), // preferences response
 })
 .mockResolvedValueOnce({
 ok: true,
 json: () => Promise.resolve({
 notifications: { email: false, push: true, earnings: true },
 }),
 });

 render(
 <NotificationProvider>
 <TestComponent />
 </NotificationProvider>
 );

 await waitFor(() => {
 expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
 });

 await act(async () => {
 await user.click(screen.getByText('Update Preferences'));
 });

 await waitFor(() => {
 expect(fetch).toHaveBeenCalledWith('/api/user/preferences', expect.objectContaining({
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 notifications: expect.objectContaining({ email: false }),
 }),
 }));
 });
 });

 it('should handle fetch error', async () => {
 (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

 render(
 <NotificationProvider>
 <TestComponent />
 </NotificationProvider>
 );

 await waitFor(() => {
 expect(screen.getByTestId('error')).toHaveTextContent('Network error');
 });
 });

 it('should not fetch notifications when user is not available', () => {
 (useAuthContext as jest.Mock).mockReturnValue({
 userProfile: null,
 isLoading: false,
 });

 render(
 <NotificationProvider>
 <TestComponent />
 </NotificationProvider>
 );

 expect(fetch).not.toHaveBeenCalled();
 });

 it('should reset state when user logs out', async () => {
 const { rerender } = render(
 <NotificationProvider>
 <TestComponent />
 </NotificationProvider>
 );

 await waitFor(() => {
 expect(screen.getByTestId('notification-count')).toHaveTextContent('2');
 });

 (useAuthContext as jest.Mock).mockReturnValue({
 userProfile: null,
 isLoading: false,
 });

 rerender(
 <NotificationProvider>
 <TestComponent />
 </NotificationProvider>
 );

 await waitFor(() => {
 expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
 expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
 });
 });
});