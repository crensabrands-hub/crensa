import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemberAnalytics } from '@/components/member/MemberAnalytics';
import { useAuthContext } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: jest.fn(),
}));

global.fetch = jest.fn();

const mockUserProfile = {
 id: 'user-1',
 username: 'testuser',
 role: 'member',
};

const mockAnalyticsData = {
 viewingHistory: {
 dailyViews: [
 { date: '2024-01-01', count: 5, totalSpent: 25.00 },
 { date: '2024-01-02', count: 3, totalSpent: 15.00 },
 ],
 categoryViews: [
 { category: 'Entertainment', count: 10, totalSpent: 50.00 },
 { category: 'Education', count: 8, totalSpent: 40.00 },
 ],
 totalStats: {
 totalVideos: 18,
 totalSpent: 90.00,
 avgPerVideo: 5.00,
 },
 },
 spendingAnalytics: {
 spendingByType: [
 { type: 'video_view', count: 18, totalAmount: 90.00 },
 { type: 'credit_purchase', count: 2, totalAmount: 100.00 },
 ],
 monthlySpending: [
 { month: '2024-01-01', totalSpent: 90.00, creditsAdded: 100.00 },
 ],
 },
 engagementMetrics: {
 likesGiven: 15,
 savesMade: 8,
 followsMade: 5,
 creatorEngagement: [
 {
 creatorId: 'creator-1',
 creatorUsername: 'creator1',
 creatorAvatar: 'avatar1.jpg',
 videosWatched: 5,
 totalSpent: 25.00,
 },
 ],
 },
 categoryPreferences: [
 {
 category: 'Entertainment',
 videosWatched: 10,
 totalSpent: 50.00,
 avgCostPerVideo: 5.00,
 },
 ],
 timeAnalytics: {
 hourlyActivity: [
 { hour: 9, count: 3 },
 { hour: 14, count: 5 },
 { hour: 20, count: 8 },
 ],
 weeklyActivity: [
 { dayOfWeek: 1, count: 5 },
 { dayOfWeek: 2, count: 8 },
 { dayOfWeek: 6, count: 10 },
 ],
 },
 period: 30,
 dateRange: {
 start: '2024-01-01',
 end: '2024-01-31',
 },
};

describe('MemberAnalytics', () => {
 beforeEach(() => {
 (useAuthContext as jest.Mock).mockReturnValue({
 userProfile: mockUserProfile,
 });

 (fetch as jest.Mock).mockResolvedValue({
 ok: true,
 json: async () => ({
 success: true,
 data: mockAnalyticsData,
 }),
 });
 });

 afterEach(() => {
 jest.clearAllMocks();
 });

 it('renders loading state initially', () => {
 render(<MemberAnalytics />);

 expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
 });

 it('fetches and displays analytics data', async () => {
 render(<MemberAnalytics />);

 await waitFor(() => {
 expect(screen.getByText('Analytics & Insights')).toBeInTheDocument();
 });

 expect(fetch).toHaveBeenCalledWith('/api/member/analytics?period=30');

 await waitFor(() => {
 expect(screen.getByText('18')).toBeInTheDocument(); // Total videos
 expect(screen.getByText('$90.00')).toBeInTheDocument(); // Total spent
 });
 });

 it('displays overview tab content by default', async () => {
 render(<MemberAnalytics />);

 await waitFor(() => {
 expect(screen.getByText('Videos Watched')).toBeInTheDocument();
 expect(screen.getByText('Credits Spent')).toBeInTheDocument();
 expect(screen.getByText('Likes Given')).toBeInTheDocument();
 expect(screen.getByText('Creators Followed')).toBeInTheDocument();
 });

 await waitFor(() => {
 expect(screen.getByText('18')).toBeInTheDocument(); // Videos watched
 expect(screen.getByText('15')).toBeInTheDocument(); // Likes given
 expect(screen.getByText('5')).toBeInTheDocument(); // Creators followed
 });
 });

 it('switches between tabs correctly', async () => {
 render(<MemberAnalytics />);

 await waitFor(() => {
 expect(screen.getByText('Analytics & Insights')).toBeInTheDocument();
 });

 fireEvent.click(screen.getByText('Viewing History'));
 
 await waitFor(() => {
 expect(screen.getByText('Total Videos')).toBeInTheDocument();
 expect(screen.getByText('Total Spent')).toBeInTheDocument();
 expect(screen.getByText('Avg per Video')).toBeInTheDocument();
 });

 fireEvent.click(screen.getByText('Spending'));
 
 await waitFor(() => {
 expect(screen.getByText('Spending by Type')).toBeInTheDocument();
 });

 fireEvent.click(screen.getByText('Engagement'));
 
 await waitFor(() => {
 expect(screen.getByText('Likes Given')).toBeInTheDocument();
 expect(screen.getByText('Top Creator Engagement')).toBeInTheDocument();
 });

 fireEvent.click(screen.getByText('Preferences'));
 
 await waitFor(() => {
 expect(screen.getByText('Category Preferences')).toBeInTheDocument();
 expect(screen.getByText('Activity by Hour')).toBeInTheDocument();
 expect(screen.getByText('Activity by Day')).toBeInTheDocument();
 });
 });

 it('changes period and refetches data', async () => {
 render(<MemberAnalytics />);

 await waitFor(() => {
 expect(screen.getByText('Analytics & Insights')).toBeInTheDocument();
 });

 const periodSelector = screen.getByDisplayValue('Last 30 days');
 fireEvent.change(periodSelector, { target: { value: '7' } });

 await waitFor(() => {
 expect(fetch).toHaveBeenCalledWith('/api/member/analytics?period=7');
 });
 });

 it('handles API error gracefully', async () => {
 (fetch as jest.Mock).mockResolvedValue({
 ok: false,
 json: async () => ({
 error: 'Failed to fetch analytics',
 }),
 });

 render(<MemberAnalytics />);

 await waitFor(() => {
 expect(screen.getByText('Error Loading Analytics')).toBeInTheDocument();
 expect(screen.getByText('Failed to fetch analytics')).toBeInTheDocument();
 });
 });

 it('handles network error gracefully', async () => {
 (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

 render(<MemberAnalytics />);

 await waitFor(() => {
 expect(screen.getByText('Error Loading Analytics')).toBeInTheDocument();
 expect(screen.getByText('Network error')).toBeInTheDocument();
 });
 });

 it('displays no data message when analytics data is null', async () => {
 (fetch as jest.Mock).mockResolvedValue({
 ok: true,
 json: async () => ({
 success: true,
 data: null,
 }),
 });

 render(<MemberAnalytics />);

 await waitFor(() => {
 expect(screen.getByText('No analytics data available.')).toBeInTheDocument();
 });
 });

 it('formats currency correctly', async () => {
 render(<MemberAnalytics />);

 await waitFor(() => {
 expect(screen.getByText('$90.00')).toBeInTheDocument();
 expect(screen.getByText('$40.00')).toBeInTheDocument(); // From category spending
 });
 });

 it('displays time analytics correctly', async () => {
 render(<MemberAnalytics />);

 await waitFor(() => {
 fireEvent.click(screen.getByText('Preferences'));
 });

 await waitFor(() => {
 expect(screen.getByText('9 AM')).toBeInTheDocument();
 expect(screen.getByText('2 PM')).toBeInTheDocument();
 expect(screen.getByText('8 PM')).toBeInTheDocument();
 expect(screen.getByText('Monday')).toBeInTheDocument();
 expect(screen.getByText('Tuesday')).toBeInTheDocument();
 expect(screen.getByText('Saturday')).toBeInTheDocument();
 });
 });
});