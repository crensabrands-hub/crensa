

interface VideoData {
 id: string;
 title: string;
 views: number;
 earnings: number;
 creditCost: number;
 createdAt: string;
 category: string;
}

interface TransactionData {
 id: string;
 amount: number;
 videoId: string | null;
 createdAt: string;
 video?: { id: string; title: string };
}

interface EarningsChartData {
 date: string;
 earnings: number;
}

export function calculateSummaryStats(videos: VideoData[], totalEarnings: number) {
 const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
 const totalVideos = videos.length;
 const avgEarningsPerVideo = totalVideos > 0 ? totalEarnings / totalVideos : 0;
 const avgViewsPerVideo = totalVideos > 0 ? totalViews / totalVideos : 0;

 return {
 totalEarnings,
 totalViews,
 totalVideos,
 avgEarningsPerVideo,
 avgViewsPerVideo
 };
}

export function calculateConversionRate(totalEarnings: number, totalViews: number): number {
 if (totalViews === 0) return 0;
 return (totalEarnings / totalViews) * 100;
}

export function processEarningsChartData(earningsData: EarningsChartData[]): EarningsChartData[] {
 return earningsData.sort((a, b) => a.date.localeCompare(b.date));
}

export function processViewsChartData(videos: VideoData[]): { date: string; views: number }[] {
 const viewsChart = videos.reduce((acc: { [key: string]: number }, video) => {
 const date = new Date(video.createdAt).toISOString().split('T')[0];
 acc[date] = (acc[date] || 0) + video.views;
 return acc;
 }, {});

 return Object.entries(viewsChart)
 .map(([date, views]) => ({ date, views }))
 .sort((a, b) => a.date.localeCompare(b.date));
}

export function sortVideosByMetric(
 videos: VideoData[],
 sortBy: 'title' | 'views' | 'earnings' | 'createdAt',
 sortOrder: 'asc' | 'desc'
): VideoData[] {
 return [...videos].sort((a, b) => {
 const aValue = a[sortBy];
 const bValue = b[sortBy];
 
 if (typeof aValue === 'string' && typeof bValue === 'string') {
 return sortOrder === 'asc' 
 ? aValue.localeCompare(bValue)
 : bValue.localeCompare(aValue);
 }
 
 if (typeof aValue === 'number' && typeof bValue === 'number') {
 return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
 }
 
 return 0;
 });
}

describe('Analytics Calculations', () => {
 const mockVideos: VideoData[] = [
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
 },
 {
 id: 'video3',
 title: 'Test Video 3',
 views: 200,
 earnings: 30,
 creditCost: 2,
 createdAt: '2024-01-01T12:00:00Z',
 category: 'Entertainment'
 }
 ];

 describe('calculateSummaryStats', () => {
 it('should calculate correct summary statistics', () => {
 const totalEarnings = 150;
 const result = calculateSummaryStats(mockVideos, totalEarnings);

 expect(result).toEqual({
 totalEarnings: 150,
 totalViews: 1000, // 500 + 300 + 200
 totalVideos: 3,
 avgEarningsPerVideo: 50, // 150 / 3
 avgViewsPerVideo: 333.3333333333333 // 1000 / 3
 });
 });

 it('should handle empty videos array', () => {
 const result = calculateSummaryStats([], 0);

 expect(result).toEqual({
 totalEarnings: 0,
 totalViews: 0,
 totalVideos: 0,
 avgEarningsPerVideo: 0,
 avgViewsPerVideo: 0
 });
 });

 it('should handle zero earnings with videos', () => {
 const result = calculateSummaryStats(mockVideos, 0);

 expect(result.totalEarnings).toBe(0);
 expect(result.totalViews).toBe(1000);
 expect(result.avgEarningsPerVideo).toBe(0);
 });
 });

 describe('calculateConversionRate', () => {
 it('should calculate correct conversion rate', () => {
 const rate = calculateConversionRate(150, 1000);
 expect(rate).toBe(15); // (150 / 1000) * 100
 });

 it('should return 0 for zero views', () => {
 const rate = calculateConversionRate(150, 0);
 expect(rate).toBe(0);
 });

 it('should handle decimal results', () => {
 const rate = calculateConversionRate(123.45, 1000);
 expect(rate).toBe(12.345);
 });
 });

 describe('processEarningsChartData', () => {
 it('should sort earnings data by date', () => {
 const unsortedData = [
 { date: '2024-01-03', earnings: 25 },
 { date: '2024-01-01', earnings: 50 },
 { date: '2024-01-02', earnings: 75 }
 ];

 const result = processEarningsChartData(unsortedData);

 expect(result).toEqual([
 { date: '2024-01-01', earnings: 50 },
 { date: '2024-01-02', earnings: 75 },
 { date: '2024-01-03', earnings: 25 }
 ]);
 });

 it('should handle empty data', () => {
 const result = processEarningsChartData([]);
 expect(result).toEqual([]);
 });
 });

 describe('processViewsChartData', () => {
 it('should aggregate views by date', () => {
 const result = processViewsChartData(mockVideos);

 expect(result).toEqual([
 { date: '2024-01-01', views: 700 }, // video1 (500) + video3 (200)
 { date: '2024-01-02', views: 300 } // video2 (300)
 ]);
 });

 it('should handle empty videos array', () => {
 const result = processViewsChartData([]);
 expect(result).toEqual([]);
 });

 it('should sort results by date', () => {
 const videosWithMixedDates = [
 { ...mockVideos[0], createdAt: '2024-01-03T00:00:00Z' },
 { ...mockVideos[1], createdAt: '2024-01-01T00:00:00Z' },
 { ...mockVideos[2], createdAt: '2024-01-02T00:00:00Z' }
 ];

 const result = processViewsChartData(videosWithMixedDates);

 expect(result[0].date).toBe('2024-01-01');
 expect(result[1].date).toBe('2024-01-02');
 expect(result[2].date).toBe('2024-01-03');
 });
 });

 describe('sortVideosByMetric', () => {
 it('should sort by views in descending order', () => {
 const result = sortVideosByMetric(mockVideos, 'views', 'desc');

 expect(result[0].views).toBe(500); // video1
 expect(result[1].views).toBe(300); // video2
 expect(result[2].views).toBe(200); // video3
 });

 it('should sort by views in ascending order', () => {
 const result = sortVideosByMetric(mockVideos, 'views', 'asc');

 expect(result[0].views).toBe(200); // video3
 expect(result[1].views).toBe(300); // video2
 expect(result[2].views).toBe(500); // video1
 });

 it('should sort by earnings in descending order', () => {
 const result = sortVideosByMetric(mockVideos, 'earnings', 'desc');

 expect(result[0].earnings).toBe(75); // video1
 expect(result[1].earnings).toBe(45); // video2
 expect(result[2].earnings).toBe(30); // video3
 });

 it('should sort by title alphabetically', () => {
 const result = sortVideosByMetric(mockVideos, 'title', 'asc');

 expect(result[0].title).toBe('Test Video 1');
 expect(result[1].title).toBe('Test Video 2');
 expect(result[2].title).toBe('Test Video 3');
 });

 it('should sort by creation date', () => {
 const result = sortVideosByMetric(mockVideos, 'createdAt', 'desc');

 expect(result[0].createdAt).toBe('2024-01-02T00:00:00Z'); // video2
 expect(result[1].createdAt).toBe('2024-01-01T12:00:00Z'); // video3
 expect(result[2].createdAt).toBe('2024-01-01T00:00:00Z'); // video1
 });

 it('should not mutate original array', () => {
 const originalOrder = [...mockVideos];
 sortVideosByMetric(mockVideos, 'views', 'desc');

 expect(mockVideos).toEqual(originalOrder);
 });
 });

 describe('Edge Cases', () => {
 it('should handle videos with zero values', () => {
 const videosWithZeros = [
 { ...mockVideos[0], views: 0, earnings: 0 },
 { ...mockVideos[1], views: 100, earnings: 50 }
 ];

 const stats = calculateSummaryStats(videosWithZeros, 50);
 expect(stats.totalViews).toBe(100);
 expect(stats.avgViewsPerVideo).toBe(50);

 const conversionRate = calculateConversionRate(50, 100);
 expect(conversionRate).toBe(50);
 });

 it('should handle very large numbers', () => {
 const largeVideos = [
 { ...mockVideos[0], views: 1000000, earnings: 50000 }
 ];

 const stats = calculateSummaryStats(largeVideos, 50000);
 expect(stats.totalViews).toBe(1000000);
 expect(stats.avgEarningsPerVideo).toBe(50000);

 const conversionRate = calculateConversionRate(50000, 1000000);
 expect(conversionRate).toBe(5);
 });

 it('should handle decimal earnings', () => {
 const decimalVideos = [
 { ...mockVideos[0], earnings: 12.34 },
 { ...mockVideos[1], earnings: 56.78 }
 ];

 const stats = calculateSummaryStats(decimalVideos, 69.12);
 expect(stats.totalEarnings).toBe(69.12);
 expect(stats.avgEarningsPerVideo).toBe(34.56);
 });
 });
});