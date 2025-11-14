

interface Video {
 id: string;
 title: string;
 viewCount: number;
 totalEarnings: string;
 creditCost: string;
 createdAt: string;
 category: string;
}

interface Transaction {
 id: string;
 amount: string;
 videoId: string | null;
 createdAt: string;
 video?: { id: string; title: string };
}

interface EarningsData {
 date: string;
 earnings: number;
}

export function processAnalyticsData(
 videos: Video[],
 totalEarnings: number,
 earningsData: EarningsData[],
 transactions: Transaction[]
) {

 const totalViews = videos.reduce((sum, video) => sum + video.viewCount, 0);
 const totalVideos = videos.length;
 const avgEarningsPerVideo = totalVideos > 0 ? totalEarnings / totalVideos : 0;
 const avgViewsPerVideo = totalVideos > 0 ? totalViews / totalVideos : 0;

 const videoPerformance = videos.map(video => ({
 id: video.id,
 title: video.title,
 views: video.viewCount,
 earnings: parseFloat(video.totalEarnings),
 creditCost: parseFloat(video.creditCost),
 createdAt: video.createdAt,
 category: video.category
 }));

 const earningsChart = earningsData.map(item => ({
 date: item.date,
 earnings: item.earnings
 }));

 const viewsChart = videos.reduce((acc: { [key: string]: number }, video) => {
 const date = new Date(video.createdAt).toISOString().split('T')[0];
 acc[date] = (acc[date] || 0) + video.viewCount;
 return acc;
 }, {});

 const viewsChartData = Object.entries(viewsChart).map(([date, views]) => ({
 date,
 views
 })).sort((a, b) => a.date.localeCompare(b.date));

 const processedTransactions = transactions.map(t => ({
 id: t.id,
 amount: parseFloat(t.amount),
 videoId: t.videoId,
 createdAt: t.createdAt,
 video: t.video
 }));

 return {
 summary: {
 totalEarnings,
 totalViews,
 totalVideos,
 avgEarningsPerVideo,
 avgViewsPerVideo
 },
 charts: {
 earnings: earningsChart,
 views: viewsChartData
 },
 videoPerformance,
 transactions: processedTransactions
 };
}

export function calculateDateRange(timeRange: 'week' | 'month' | 'year'): { start: Date; end: Date } {
 const now = new Date();
 const end = new Date(now);
 let start: Date;

 switch (timeRange) {
 case 'week':
 start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
 break;
 case 'month':
 start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
 break;
 case 'year':
 start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
 break;
 default:
 start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
 }

 return { start, end };
}

describe('Analytics API Logic', () => {
 const mockVideos: Video[] = [
 {
 id: 'video1',
 title: 'Test Video 1',
 viewCount: 500,
 totalEarnings: '75.00',
 creditCost: '5.00',
 createdAt: '2024-01-01T00:00:00Z',
 category: 'Entertainment'
 },
 {
 id: 'video2',
 title: 'Test Video 2',
 viewCount: 300,
 totalEarnings: '45.00',
 creditCost: '3.00',
 createdAt: '2024-01-02T00:00:00Z',
 category: 'Education'
 }
 ];

 const mockEarningsData: EarningsData[] = [
 { date: '2024-01-01', earnings: 75 },
 { date: '2024-01-02', earnings: 45 }
 ];

 const mockTransactions: Transaction[] = [
 {
 id: 'trans1',
 amount: '75.00',
 videoId: 'video1',
 createdAt: '2024-01-01T12:00:00Z',
 video: { id: 'video1', title: 'Test Video 1' }
 },
 {
 id: 'trans2',
 amount: '45.00',
 videoId: 'video2',
 createdAt: '2024-01-02T14:00:00Z',
 video: { id: 'video2', title: 'Test Video 2' }
 }
 ];

 describe('processAnalyticsData', () => {
 it('should process analytics data correctly', () => {
 const result = processAnalyticsData(mockVideos, 120, mockEarningsData, mockTransactions);

 expect(result.summary).toEqual({
 totalEarnings: 120,
 totalViews: 800, // 500 + 300
 totalVideos: 2,
 avgEarningsPerVideo: 60, // 120 / 2
 avgViewsPerVideo: 400 // 800 / 2
 });

 expect(result.charts.earnings).toEqual([
 { date: '2024-01-01', earnings: 75 },
 { date: '2024-01-02', earnings: 45 }
 ]);

 expect(result.charts.views).toEqual([
 { date: '2024-01-01', views: 500 },
 { date: '2024-01-02', views: 300 }
 ]);

 expect(result.videoPerformance).toHaveLength(2);
 expect(result.videoPerformance[0]).toEqual({
 id: 'video1',
 title: 'Test Video 1',
 views: 500,
 earnings: 75,
 creditCost: 5,
 createdAt: '2024-01-01T00:00:00Z',
 category: 'Entertainment'
 });

 expect(result.transactions).toHaveLength(2);
 expect(result.transactions[0].amount).toBe(75);
 });

 it('should handle empty data', () => {
 const result = processAnalyticsData([], 0, [], []);

 expect(result.summary).toEqual({
 totalEarnings: 0,
 totalViews: 0,
 totalVideos: 0,
 avgEarningsPerVideo: 0,
 avgViewsPerVideo: 0
 });

 expect(result.charts.earnings).toEqual([]);
 expect(result.charts.views).toEqual([]);
 expect(result.videoPerformance).toEqual([]);
 expect(result.transactions).toEqual([]);
 });

 it('should aggregate views by date correctly', () => {
 const videosWithSameDate = [
 { ...mockVideos[0], createdAt: '2024-01-01T00:00:00Z', viewCount: 300 },
 { ...mockVideos[1], createdAt: '2024-01-01T12:00:00Z', viewCount: 200 }
 ];

 const result = processAnalyticsData(videosWithSameDate, 120, [], []);

 expect(result.charts.views).toEqual([
 { date: '2024-01-01', views: 500 } // 300 + 200
 ]);
 });
 });

 describe('calculateDateRange', () => {
 beforeEach(() => {

 jest.useFakeTimers();
 jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
 });

 afterEach(() => {
 jest.useRealTimers();
 });

 it('should calculate week range correctly', () => {
 const { start, end } = calculateDateRange('week');
 
 expect(end.toISOString()).toBe('2024-01-15T12:00:00.000Z');
 expect(start.toISOString()).toBe('2024-01-08T12:00:00.000Z'); // 7 days before
 });

 it('should calculate month range correctly', () => {
 const { start, end } = calculateDateRange('month');
 
 expect(end.toISOString()).toBe('2024-01-15T12:00:00.000Z');

 expect(start.getFullYear()).toBe(2023);
 expect(start.getMonth()).toBe(11); // December (0-indexed)
 expect(start.getDate()).toBe(15);
 });

 it('should calculate year range correctly', () => {
 const { start, end } = calculateDateRange('year');
 
 expect(end.toISOString()).toBe('2024-01-15T12:00:00.000Z');

 expect(start.getFullYear()).toBe(2023);
 expect(start.getMonth()).toBe(0); // January (0-indexed)
 expect(start.getDate()).toBe(15);
 });

 it('should default to month range for invalid input', () => {
 const { start, end } = calculateDateRange('invalid' as any);
 
 expect(end.toISOString()).toBe('2024-01-15T12:00:00.000Z');

 expect(start.getFullYear()).toBe(2023);
 expect(start.getMonth()).toBe(11); // December (0-indexed)
 expect(start.getDate()).toBe(15);
 });
 });

 describe('Edge Cases', () => {
 it('should handle videos with decimal earnings', () => {
 const videosWithDecimals = [
 { ...mockVideos[0], totalEarnings: '12.34' },
 { ...mockVideos[1], totalEarnings: '56.78' }
 ];

 const result = processAnalyticsData(videosWithDecimals, 69.12, [], []);

 expect(result.videoPerformance[0].earnings).toBe(12.34);
 expect(result.videoPerformance[1].earnings).toBe(56.78);
 });

 it('should handle transactions without video data', () => {
 const transactionsWithoutVideo = [
 {
 id: 'trans1',
 amount: '50.00',
 videoId: null,
 createdAt: '2024-01-01T12:00:00Z'
 }
 ];

 const result = processAnalyticsData([], 50, [], transactionsWithoutVideo);

 expect(result.transactions[0]).toEqual({
 id: 'trans1',
 amount: 50,
 videoId: null,
 createdAt: '2024-01-01T12:00:00Z',
 video: undefined
 });
 });

 it('should sort views chart data by date', () => {
 const unsortedVideos = [
 { ...mockVideos[0], createdAt: '2024-01-03T00:00:00Z' },
 { ...mockVideos[1], createdAt: '2024-01-01T00:00:00Z' }
 ];

 const result = processAnalyticsData(unsortedVideos, 120, [], []);

 expect(result.charts.views[0].date).toBe('2024-01-01');
 expect(result.charts.views[1].date).toBe('2024-01-03');
 });
 });
});