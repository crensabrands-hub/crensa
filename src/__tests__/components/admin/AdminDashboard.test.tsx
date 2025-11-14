import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { AdminStats } from '@/lib/services/adminService';

jest.mock('@/components/admin/AdminStatsCards', () => {
 return function MockAdminStatsCards({ stats }: { stats: AdminStats | null }) {
 return <div data-testid="admin-stats-cards">Stats Cards</div>;
 };
});

jest.mock('@/components/admin/UserManagement', () => {
 return function MockUserManagement() {
 return <div data-testid="user-management">User Management</div>;
 };
});

jest.mock('@/components/admin/VideoModeration', () => {
 return function MockVideoModeration() {
 return <div data-testid="video-moderation">Video Moderation</div>;
 };
});

jest.mock('@/components/admin/ReportsManagement', () => {
 return function MockReportsManagement() {
 return <div data-testid="reports-management">Reports Management</div>;
 };
});

jest.mock('@/components/admin/AuditLogs', () => {
 return function MockAuditLogs() {
 return <div data-testid="audit-logs">Audit Logs</div>;
 };
});

jest.mock('@/components/admin/ContentFilters', () => {
 return function MockContentFilters() {
 return <div data-testid="content-filters">Content Filters</div>;
 };
});

describe('AdminDashboard', () => {
 const mockStats: AdminStats = {
 totalUsers: 1000,
 totalCreators: 250,
 totalMembers: 750,
 totalVideos: 500,
 totalReports: 25,
 pendingReports: 5,
 suspendedUsers: 10,
 flaggedVideos: 3,
 totalRevenue: 50000,
 monthlyActiveUsers: 800,
 };

 it('should render admin dashboard with header', () => {
 render(<AdminDashboard stats={mockStats} />);

 expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
 expect(screen.getByText('Manage users, content, and platform settings')).toBeInTheDocument();
 });

 it('should render navigation tabs', () => {
 render(<AdminDashboard stats={mockStats} />);

 expect(screen.getByText('Overview')).toBeInTheDocument();
 expect(screen.getByText('User Management')).toBeInTheDocument();
 expect(screen.getByText('Video Moderation')).toBeInTheDocument();
 expect(screen.getByText('Reports')).toBeInTheDocument();
 expect(screen.getByText('Audit Logs')).toBeInTheDocument();
 expect(screen.getByText('Content Filters')).toBeInTheDocument();
 });

 it('should show overview tab by default', () => {
 render(<AdminDashboard stats={mockStats} />);

 expect(screen.getByTestId('admin-stats-cards')).toBeInTheDocument();
 expect(screen.queryByTestId('user-management')).not.toBeInTheDocument();
 });

 it('should switch tabs when clicked', () => {
 render(<AdminDashboard stats={mockStats} />);

 fireEvent.click(screen.getByText('User Management'));
 expect(screen.getByTestId('user-management')).toBeInTheDocument();
 expect(screen.queryByTestId('admin-stats-cards')).not.toBeInTheDocument();

 fireEvent.click(screen.getByText('Video Moderation'));
 expect(screen.getByTestId('video-moderation')).toBeInTheDocument();
 expect(screen.queryByTestId('user-management')).not.toBeInTheDocument();

 fireEvent.click(screen.getByText('Reports'));
 expect(screen.getByTestId('reports-management')).toBeInTheDocument();

 fireEvent.click(screen.getByText('Audit Logs'));
 expect(screen.getByTestId('audit-logs')).toBeInTheDocument();

 fireEvent.click(screen.getByText('Content Filters'));
 expect(screen.getByTestId('content-filters')).toBeInTheDocument();
 });

 it('should handle null stats', () => {
 render(<AdminDashboard stats={null} />);

 expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
 expect(screen.getByTestId('admin-stats-cards')).toBeInTheDocument();
 });

 it('should apply active tab styling', () => {
 render(<AdminDashboard stats={mockStats} />);

 const overviewTab = screen.getByText('Overview').closest('button');
 const userManagementTab = screen.getByText('User Management').closest('button');

 expect(overviewTab).toHaveClass('border-blue-500', 'text-blue-600');
 expect(userManagementTab).toHaveClass('border-transparent', 'text-gray-500');

 fireEvent.click(screen.getByText('User Management'));

 expect(userManagementTab).toHaveClass('border-blue-500', 'text-blue-600');
 expect(overviewTab).toHaveClass('border-transparent', 'text-gray-500');
 });
});