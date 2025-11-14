import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreatorAnalytics } from '../CreatorAnalytics';

global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 tr: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
 },
}));

const mockAnalyticsData = {
 summary: {
 totalEarnings: 150.50,
 totalViews: 1250,
 totalVideos: 5,
 avgEarningsPerVideo: 30.10,
 avgViewsPerVideo: 250
 },
 charts: {
 earnings: [
 { date: '2024-01-01', earnings: 50 },
 { date: '2024-01-02', earnings: 75 },
 { date: '2024-01-03', earnings: 25.50 }
 ],
 views: [
 { date: '2024-01-01', views: 400 },
 { date: '2024-01-02', views: 600 },
 { date: '2024-01-03', views: 250 }
 ]
 },
 videoPerformance: [
 {
 id: 'video1',
 title: 'Test Video 1',
 views: 500,
 earnings: 75,
 creditCost: 5,
 createdAt: '2024-01-01T00:00:00Z',
 category: 'Entertainment'
 },
 {
 id: 'video2',
 title: 'Test Video 2',
 views: 300,
 earnings: 45,
 creditCost: 3,
 createdAt: '2024-01-02T00:00:00Z',
 category: 'Education'
 }
 ],
 transactions: [
 {
 id: 'trans1',
 amount: 75,
 videoId: 'video1',
 createdAt: '2024-01-01T12:00:00Z',
 video: { id: 'video1', title: 'Test Video 1' }
 },
 {
 id: 'trans2',
 amount: 45,
 videoId: 'video2',
 createdAt: '2024-01-02T14:00:00Z',
 video: { id: 'video2', title: 'Test Video 2' }
 }
 ]
};

describe('CreatorAnalytics', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 it('should render loading state initially', () => {
 mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

 render(<CreatorAnalytics />);

 expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
 });

 it('should render analytics data after successful fetch', async () => {
 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => mockAnalyticsData,
 } as Response);

 render(<CreatorAnalytics />);

 await waitFor(() => {
 expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
 expect(screen.getByText('₹150.50')).toBeInTheDocument(); // Total earnings
 expect(screen.getByText('1,250')).toBeInTheDocument(); // Total views
 expect(screen.getByText('5')).toBeInTheDocument(); // Total videos
 });

 expect(screen.getByText('Test Video 1')).toBeInTheDocument();
 expect(screen.getByText('Test Video 2')).toBeInTheDocument();
 expect(screen.getByText('Entertainment')).toBeInTheDocument();
 expect(screen.getByText('Education')).toBeInTheDocument();

 expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
 expect(screen.getByText('Earning from "Test Video 1"')).toBeInTheDocument();
 expect(screen.getByText('+₹75.00')).toBeInTheDocument();
 });

 it('should render error state when fetch fails', async () => {
 mockFetch.mockRejectedValueOnce(new Error('Network error'));

 render(<CreatorAnalytics />);

 await waitFor(() => {
 expect(screen.getByText('Failed to load analytics')).toBeInTheDocument();
 expect(screen.getByText('Network error')).toBeInTheDocument();
 expect(screen.getByText('Try Again')).toBeInTheDocument();
 });
 });

 it('should handle API error response', async () => {
 mockFetch.mockResolvedValueOnce({
 ok: false,
 json: async () => ({ error: 'Unauthorized' }),
 } as Response);

 render(<CreatorAnalytics />);

 await waitFor(() => {
 expect(screen.getByText('Failed to load analytics')).toBeInTheDocument();
 expect(screen.getByText('Try Again')).toBeInTheDocument();
 });
 });

 it('should allow time range selection', async () => {
 mockFetch.mockResolvedValue({
 ok: true,
 json: async () => mockAnalyticsData,
 } as Response);

 render(<CreatorAnalytics />);

 await waitFor(() => {
 expect(screen.getByText('Week')).toBeInTheDocument();
 expect(screen.getByText('Month')).toBeInTheDocument();
 expect(screen.getByText('Year')).toBeInTheDocument();
 });

 fireEvent.click(screen.getByText('Week'));

 await waitFor(() => {
 expect(mockFetch).toHaveBeenCalledWith('/api/creator/analytics?timeRange=week');
 });
 });

 it('should handle custom date range selection', async () => {
 mockFetch.mockResolvedValue({
 ok: true,
 json: async () => mockAnalyticsData,
 } as Response);

 render(<CreatorAnalytics />);

 await waitFor(() => {
 expect(screen.getByText('Custom Range')).toBeInTheDocument();
 });

 fireEvent.click(screen.getByText('Custom Range'));

 await waitFor(() => {
 expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
 expect(screen.getByLabelText('End Date')).toBeInTheDocument();
 });

 fireEvent.change(screen.getByLabelText('Start Date'), {
 target: { value: '2024-01-01' }
 });
 fireEvent.change(screen.getByLabelText('End Date'), {
 target: { value: '2024-01-31' }
 });

 fireEvent.click(screen.getByText('Apply'));

 await waitFor(() => {
 expect(mockFetch).toHaveBeenCalledWith('/api/creator/analytics?startDate=2024-01-01&endDate=2024-01-31');
 });
 });

 it('should sort video performance table', async () => {
 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => mockAnalyticsData,
 } as Response);

 render(<CreatorAnalytics />);

 await waitFor(() => {
 expect(screen.getByText('Video Performance')).toBeInTheDocument();
 });

 const viewsHeader = screen.getByText('Views');
 fireEvent.click(viewsHeader);

 await waitFor(() => {
 const rows = screen.getAllByRole('row');

 expect(rows[1]).toHaveTextContent('Test Video 1'); // 500 views
 });
 });

 it('should handle empty data states', async () => {
 const emptyData = {
 summary: {
 totalEarnings: 0,
 totalViews: 0,
 totalVideos: 0,
 avgEarningsPerVideo: 0,
 avgViewsPerVideo: 0
 },
 charts: {
 earnings: [],
 views: []
 },
 videoPerformance: [],
 transactions: []
 };

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => emptyData,
 } as Response);

 render(<CreatorAnalytics />);

 await waitFor(() => {
 expect(screen.getByText('No videos uploaded yet')).toBeInTheDocument();
 expect(screen.getByText('No transactions yet')).toBeInTheDocument();
 expect(screen.getByText('No earnings data available')).toBeInTheDocument();
 expect(screen.getByText('No views data available')).toBeInTheDocument();
 });
 });

 it('should retry fetch on error', async () => {
 mockFetch
 .mockRejectedValueOnce(new Error('Network error'))
 .mockResolvedValueOnce({
 ok: true,
 json: async () => mockAnalyticsData,
 } as Response);

 render(<CreatorAnalytics />);

 await waitFor(() => {
 expect(screen.getByText('Try Again')).toBeInTheDocument();
 });

 fireEvent.click(screen.getByText('Try Again'));

 await waitFor(() => {
 expect(screen.getByText('₹150.50')).toBeInTheDocument();
 });

 expect(mockFetch).toHaveBeenCalledTimes(2);
 });

 it('should calculate conversion rate correctly', async () => {
 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => mockAnalyticsData,
 } as Response);

 render(<CreatorAnalytics />);

 await waitFor(() => {

 expect(screen.getByText('12.0%')).toBeInTheDocument();
 });
 });
});