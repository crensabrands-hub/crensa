import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationsPage from '@/app/notifications/page';

const mockNotifications = [
 {
 id: '1',
 userId: 'user1',
 type: 'system' as const,
 title: 'System Notification',
 message: 'This is a very long system notification message that should wrap properly and display all text without truncation or visibility issues.',
 isRead: false,
 metadata: null,
 createdAt: new Date('2024-01-01T10:00:00Z'),
 updatedAt: new Date('2024-01-01T10:00:00Z'),
 },
 {
 id: '2',
 userId: 'user1',
 type: 'earning' as const,
 title: 'Earning Notification',
 message: 'You earned money from video views',
 isRead: true,
 metadata: null,
 createdAt: new Date('2024-01-01T09:00:00Z'),
 updatedAt: new Date('2024-01-01T09:00:00Z'),
 },
];

const mockNotificationContext = {
 notifications: mockNotifications,
 unreadCount: 1,
 isLoading: false,
 error: null,
 preferences: {
 email: true,
 push: true,
 earnings: true,
 newFollowers: true,
 videoComments: true,
 videoLikes: true,
 paymentUpdates: true,
 systemUpdates: true,
 },
 isPreferencesLoading: false,
 lastFetch: Date.now(),
 fetchNotifications: jest.fn(),
 markAsRead: jest.fn(),
 markAllAsRead: jest.fn(),
 deleteNotification: jest.fn(),
 updatePreferences: jest.fn(),
 clearError: jest.fn(),
 subscribeToRealTimeUpdates: jest.fn(),
 unsubscribeFromRealTimeUpdates: jest.fn(),
};

const mockAuthContext = {
 user: { id: 'user1' },
 userProfile: { id: 'user1', role: 'member' as const },
 isLoading: false,
 isSignedIn: true,
};

jest.mock('@/contexts/NotificationContext', () => ({
 useNotifications: () => mockNotificationContext,
}));

jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: () => mockAuthContext,
}));

jest.mock('@/components/notifications', () => ({
 NotificationPreferences: () => <div data-testid="notification-preferences">Notification Preferences</div>,
}));

describe('NotificationsPage Display Improvements', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 it('should display notification text with proper wrapping and spacing', () => {
 render(<NotificationsPage />);

 expect(screen.getByText(/This is a very long system notification message/)).toBeInTheDocument();

 const systemTitle = screen.getByText('System Notification');
 expect(systemTitle).toHaveClass('leading-tight');

 const systemMessage = screen.getByText(/This is a very long system notification message/);
 expect(systemMessage).toHaveClass('leading-relaxed', 'break-words');
 });

 it('should show loading state with descriptive text', () => {
 const loadingContext = {
 ...mockNotificationContext,
 isLoading: true,
 };

 jest.doMock('@/contexts/NotificationContext', () => ({
 useNotifications: () => loadingContext,
 }));

 render(<NotificationsPage />);

 expect(screen.getByText('Loading notifications...')).toBeInTheDocument();
 });

 it('should display error state with retry functionality', () => {
 const errorContext = {
 ...mockNotificationContext,
 error: 'Failed to load notifications',
 };

 jest.doMock('@/contexts/NotificationContext', () => ({
 useNotifications: () => errorContext,
 }));

 render(<NotificationsPage />);

 expect(screen.getByText('Error Loading Notifications')).toBeInTheDocument();
 expect(screen.getByText('Failed to load notifications')).toBeInTheDocument();

 const retryButton = screen.getByText('Try Again');
 expect(retryButton).toBeInTheDocument();

 fireEvent.click(retryButton);
 expect(mockNotificationContext.clearError).toHaveBeenCalled();
 expect(mockNotificationContext.fetchNotifications).toHaveBeenCalledWith(true);
 });

 it('should handle mark all as read action', () => {
 render(<NotificationsPage />);

 const markAllReadButton = screen.getByText('Mark All Read');
 fireEvent.click(markAllReadButton);

 expect(mockNotificationContext.markAllAsRead).toHaveBeenCalled();
 });

 it('should filter notifications correctly', () => {
 render(<NotificationsPage />);

 expect(screen.getByText('All (2)')).toBeInTheDocument();
 expect(screen.getByText('Unread (1)')).toBeInTheDocument();

 const unreadFilter = screen.getByText('Unread (1)');
 fireEvent.click(unreadFilter);

 expect(screen.getByText('System Notification')).toBeInTheDocument();
 });

 it('should switch between notifications and preferences tabs', () => {
 render(<NotificationsPage />);

 expect(screen.getByText('System Notification')).toBeInTheDocument();

 const preferencesTab = screen.getByText('Preferences');
 fireEvent.click(preferencesTab);

 expect(screen.getByTestId('notification-preferences')).toBeInTheDocument();

 const notificationsTab = screen.getByText('Notifications');
 fireEvent.click(notificationsTab);

 expect(screen.getByText('System Notification')).toBeInTheDocument();
 });

 it('should show proper empty state for filtered notifications', () => {
 const emptyUnreadContext = {
 ...mockNotificationContext,
 notifications: [mockNotifications[1]], // Only read notification
 unreadCount: 0,
 };

 jest.doMock('@/contexts/NotificationContext', () => ({
 useNotifications: () => emptyUnreadContext,
 }));

 render(<NotificationsPage />);

 const unreadFilter = screen.getByText('Unread (0)');
 fireEvent.click(unreadFilter);

 expect(screen.getByText('No unread notifications')).toBeInTheDocument();
 expect(screen.getByText('All caught up! Check back later for new notifications.')).toBeInTheDocument();
 });

 it('should handle individual notification actions', () => {
 render(<NotificationsPage />);

 const markAsReadButtons = screen.getAllByTitle('Mark as read');
 expect(markAsReadButtons).toHaveLength(1);

 fireEvent.click(markAsReadButtons[0]);
 expect(mockNotificationContext.markAsRead).toHaveBeenCalledWith('1');

 const deleteButtons = screen.getAllByTitle('Delete notification');
 expect(deleteButtons).toHaveLength(2);

 fireEvent.click(deleteButtons[0]);
 expect(mockNotificationContext.deleteNotification).toHaveBeenCalledWith('1');
 });
});