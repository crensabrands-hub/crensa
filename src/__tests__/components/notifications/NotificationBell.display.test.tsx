import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationBell from '@/components/notifications/NotificationBell';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AuthProvider } from '@/contexts/AuthContext';

const mockNotifications = [
 {
 id: '1',
 userId: 'user1',
 type: 'system' as const,
 title: 'Welcome to Crensa!',
 message: 'This is a very long notification message that should wrap properly and be fully visible without being cut off or truncated in the notification display.',
 isRead: false,
 metadata: null,
 createdAt: new Date('2024-01-01T10:00:00Z'),
 updatedAt: new Date('2024-01-01T10:00:00Z'),
 },
 {
 id: '2',
 userId: 'user1',
 type: 'earning' as const,
 title: 'New Earning',
 message: 'You earned $5.00 from video views',
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
 NotificationProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: () => mockAuthContext,
 AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('NotificationBell Display Improvements', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 it('should display notification text with proper wrapping and spacing', async () => {
 render(<NotificationBell />);

 const bellButton = screen.getByRole('button');
 fireEvent.click(bellButton);

 await waitFor(() => {

 expect(screen.getByText(/This is a very long notification message/)).toBeInTheDocument();
 });

 const notificationTitle = screen.getByText('Welcome to Crensa!');
 expect(notificationTitle).toHaveClass('leading-tight');

 const notificationMessage = screen.getByText(/This is a very long notification message/);
 expect(notificationMessage).toHaveClass('leading-relaxed', 'break-words');
 });

 it('should show loading state with descriptive text', () => {
 const loadingContext = {
 ...mockNotificationContext,
 isLoading: true,
 notifications: [],
 };

 jest.doMock('@/contexts/NotificationContext', () => ({
 useNotifications: () => loadingContext,
 }));

 render(<NotificationBell />);

 const bellButton = screen.getByRole('button');
 fireEvent.click(bellButton);

 expect(screen.getByText('Loading notifications...')).toBeInTheDocument();
 });

 it('should display unread count badge correctly', () => {
 render(<NotificationBell />);

 expect(screen.getByText('1')).toBeInTheDocument();
 });

 it('should handle mark as read action', async () => {
 render(<NotificationBell />);

 const bellButton = screen.getByRole('button');
 fireEvent.click(bellButton);

 await waitFor(() => {

 const markAsReadButtons = screen.getAllByTitle('Mark as read');
 expect(markAsReadButtons).toHaveLength(1);
 
 fireEvent.click(markAsReadButtons[0]);
 expect(mockNotificationContext.markAsRead).toHaveBeenCalledWith('1');
 });
 });

 it('should handle delete notification action', async () => {
 render(<NotificationBell />);

 const bellButton = screen.getByRole('button');
 fireEvent.click(bellButton);

 await waitFor(() => {

 const deleteButtons = screen.getAllByTitle('Delete notification');
 expect(deleteButtons).toHaveLength(2); // Both notifications should have delete buttons
 
 fireEvent.click(deleteButtons[0]);
 expect(mockNotificationContext.deleteNotification).toHaveBeenCalledWith('1');
 });
 });

 it('should show proper empty state when no notifications', () => {
 const emptyContext = {
 ...mockNotificationContext,
 notifications: [],
 unreadCount: 0,
 };

 jest.doMock('@/contexts/NotificationContext', () => ({
 useNotifications: () => emptyContext,
 }));

 render(<NotificationBell />);

 const bellButton = screen.getByRole('button');
 fireEvent.click(bellButton);

 expect(screen.getByText('No notifications')).toBeInTheDocument();
 expect(screen.getByText("You'll see notifications here when you have them.")).toBeInTheDocument();
 });
});