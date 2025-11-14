import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useNotifications } from '@/contexts/NotificationContext';

jest.mock('@/contexts/NotificationContext', () => ({
 useNotifications: jest.fn(),
}));

jest.mock('next/link', () => {
 return function MockLink({ children, href, ...props }: any) {
 return (
 <a href={href} {...props}>
 {children}
 </a>
 );
 };
});

const mockNotifications = [
 {
 id: 'notif-1',
 userId: 'user-1',
 type: 'earning',
 title: 'New Earning!',
 message: 'You earned ₹10 from "Test Video"',
 isRead: false,
 metadata: { videoId: 'video-1', amount: 10, actionUrl: '/creator/analytics' },
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

const mockUseNotifications = {
 notifications: mockNotifications,
 unreadCount: 1,
 isLoading: false,
 error: null,
 markAsRead: jest.fn(),
 markAllAsRead: jest.fn(),
 deleteNotification: jest.fn(),
 fetchNotifications: jest.fn(),
};

describe('NotificationBell', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 (useNotifications as jest.Mock).mockReturnValue(mockUseNotifications);
 });

 it('should render notification bell with unread count', () => {
 render(<NotificationBell />);

 const bellButton = screen.getByRole('button');
 expect(bellButton).toBeInTheDocument();
 expect(bellButton).toHaveAttribute('aria-label', 'Notifications (1 unread)');
 
 const badge = screen.getByText('1');
 expect(badge).toBeInTheDocument();
 });

 it('should render notification bell without badge when no unread notifications', () => {
 (useNotifications as jest.Mock).mockReturnValue({
 ...mockUseNotifications,
 unreadCount: 0,
 });

 render(<NotificationBell />);

 const bellButton = screen.getByRole('button');
 expect(bellButton).toBeInTheDocument();
 expect(bellButton).toHaveAttribute('aria-label', 'Notifications ');
 
 expect(screen.queryByText('1')).not.toBeInTheDocument();
 });

 it('should open dropdown when bell is clicked', async () => {
 const user = userEvent.setup();
 render(<NotificationBell />);

 const bellButton = screen.getByRole('button');
 await user.click(bellButton);

 expect(screen.getByText('Notifications')).toBeInTheDocument();
 expect(screen.getByText('(1 unread)')).toBeInTheDocument();
 expect(screen.getByText('New Earning!')).toBeInTheDocument();
 expect(screen.getByText('New Follower!')).toBeInTheDocument();
 });

 it('should close dropdown when clicking outside', async () => {
 const user = userEvent.setup();
 render(
 <div>
 <NotificationBell />
 <div data-testid="outside">Outside</div>
 </div>
 );

 const bellButton = screen.getByRole('button');
 await user.click(bellButton);

 expect(screen.getByText('Notifications')).toBeInTheDocument();

 await user.click(screen.getByTestId('outside'));

 await waitFor(() => {
 expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
 });
 });

 it('should fetch notifications when dropdown opens', async () => {
 const user = userEvent.setup();
 render(<NotificationBell />);

 const bellButton = screen.getByRole('button');
 await user.click(bellButton);

 expect(mockUseNotifications.fetchNotifications).toHaveBeenCalled();
 });

 it('should mark notification as read when check button is clicked', async () => {
 const user = userEvent.setup();
 render(<NotificationBell />);

 const bellButton = screen.getByRole('button');
 await user.click(bellButton);

 const checkButtons = screen.getAllByTitle('Mark as read');
 await user.click(checkButtons[0]);

 expect(mockUseNotifications.markAsRead).toHaveBeenCalledWith('notif-1');
 });

 it('should delete notification when delete button is clicked', async () => {
 const user = userEvent.setup();
 render(<NotificationBell />);

 const bellButton = screen.getByRole('button');
 await user.click(bellButton);

 const deleteButtons = screen.getAllByTitle('Delete notification');
 await user.click(deleteButtons[0]);

 expect(mockUseNotifications.deleteNotification).toHaveBeenCalledWith('notif-1');
 });

 it('should mark all as read when button is clicked', async () => {
 const user = userEvent.setup();
 render(<NotificationBell />);

 const bellButton = screen.getByRole('button');
 await user.click(bellButton);

 const markAllButton = screen.getByText('Mark all read');
 await user.click(markAllButton);

 expect(mockUseNotifications.markAllAsRead).toHaveBeenCalled();
 });

 it('should show loading state', () => {
 (useNotifications as jest.Mock).mockReturnValue({
 ...mockUseNotifications,
 isLoading: true,
 });

 render(<NotificationBell />);

 const bellButton = screen.getByRole('button');
 act(() => {
 bellButton.click();
 });

 expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
 });

 it('should show empty state when no notifications', async () => {
 const user = userEvent.setup();
 (useNotifications as jest.Mock).mockReturnValue({
 ...mockUseNotifications,
 notifications: [],
 unreadCount: 0,
 });

 render(<NotificationBell />);

 const bellButton = screen.getByRole('button');
 await user.click(bellButton);

 expect(screen.getByText('No notifications')).toBeInTheDocument();
 expect(screen.getByText("You'll see notifications here when you have them.")).toBeInTheDocument();
 });

 it('should show correct notification icons', async () => {
 const user = userEvent.setup();
 render(<NotificationBell />);

 const bellButton = screen.getByRole('button');
 await user.click(bellButton);

 expect(screen.getByText('New Earning!')).toBeInTheDocument();
 expect(screen.getByText('New Follower!')).toBeInTheDocument();
 });

 it('should format time correctly', async () => {
 const user = userEvent.setup();
 const recentNotification = {
 ...mockNotifications[0],
 createdAt: new Date(Date.now() - 30000).toISOString(), // 30 seconds ago
 };

 (useNotifications as jest.Mock).mockReturnValue({
 ...mockUseNotifications,
 notifications: [recentNotification],
 });

 render(<NotificationBell />);

 const bellButton = screen.getByRole('button');
 await user.click(bellButton);

 expect(screen.getByText('Just now')).toBeInTheDocument();
 });

 it('should show View all link when more than 5 notifications', async () => {
 const user = userEvent.setup();
 const manyNotifications = Array.from({ length: 7 }, (_, i) => ({
 ...mockNotifications[0],
 id: `notif-${i}`,
 title: `Notification ${i}`,
 }));

 (useNotifications as jest.Mock).mockReturnValue({
 ...mockUseNotifications,
 notifications: manyNotifications,
 });

 render(<NotificationBell />);

 const bellButton = screen.getByRole('button');
 await user.click(bellButton);

 expect(screen.getByText('View all 7 notifications')).toBeInTheDocument();
 });

 it('should handle 99+ unread count display', () => {
 (useNotifications as jest.Mock).mockReturnValue({
 ...mockUseNotifications,
 unreadCount: 150,
 });

 render(<NotificationBell />);

 expect(screen.getByText('99+')).toBeInTheDocument();
 });
});