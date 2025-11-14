

export interface ChartDataPoint {
 date: string;
 value: number;
 label?: string;
}

export interface EarningsDataPoint {
 date: string;
 earnings: number;
}

export interface ViewsDataPoint {
 date: string;
 views: number;
}

export interface TransformedAnalyticsData {
 summary: {
 totalEarnings: number;
 totalViews: number;
 totalVideos: number;
 avgEarningsPerVideo: number;
 avgViewsPerVideo: number;
 conversionRate: number;
 growthRate: number;
 };
 charts: {
 earnings: ChartDataPoint[];
 views: ChartDataPoint[];
 combined: ChartDataPoint[];
 };
 trends: {
 earningsGrowth: number;
 viewsGrowth: number;
 performanceScore: number;
 };
}

export function transformEarningsData(data: any[]): ChartDataPoint[] {
 if (!Array.isArray(data) || data.length === 0) {
 return [];
 }

 return data
 .filter(item => item && typeof item.date === 'string')
 .map(item => {

 const coins = item.coins !== undefined ? Number(item.coins) : 0;
 const rupees = item.rupees !== undefined ? Number(item.rupees) : Number(item.earnings) || 0;
 
 return {
 date: item.date,
 value: coins,
 label: `🪙 ${coins.toLocaleString()} coins (₹${rupees.toFixed(2)})`
 };
 })
 .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function transformViewsData(data: ViewsDataPoint[]): ChartDataPoint[] {
 if (!Array.isArray(data) || data.length === 0) {
 return [];
 }

 return data
 .filter(item => item && typeof item.date === 'string' && typeof item.views === 'number')
 .map(item => ({
 date: item.date,
 value: Number(item.views) || 0,
 label: `${(Number(item.views) || 0).toLocaleString()} views`
 }))
 .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function fillMissingDates(
 data: ChartDataPoint[], 
 startDate: Date, 
 endDate: Date,
 valueType: 'earnings' | 'views' = 'earnings'
): ChartDataPoint[] {
 if (!Array.isArray(data)) {
 return [];
 }

 const filledData: ChartDataPoint[] = [];
 const currentDate = new Date(startDate);
 const dataMap = new Map(data.map(item => [item.date, item]));

 while (currentDate <= endDate) {
 const dateStr = currentDate.toISOString().split('T')[0];
 const existingData = dataMap.get(dateStr);
 
 if (existingData) {
 filledData.push(existingData);
 } else {
 filledData.push({
 date: dateStr,
 value: 0,
 label: valueType === 'earnings' ? '🪙 0 coins (₹0.00)' : '0 views'
 });
 }
 
 currentDate.setDate(currentDate.getDate() + 1);
 }

 return filledData;
}

export function calculateGrowthRate(current: number, previous: number): number {
 if (previous === 0) {
 return current > 0 ? 100 : 0;
 }
 return ((current - previous) / previous) * 100;
}

export function calculatePerformanceScore(
 totalEarnings: number,
 totalViews: number,
 totalVideos: number,
 avgEarningsPerVideo: number,
 avgViewsPerVideo: number
): number {
 if (totalVideos === 0) return 0;

 const earningsScore = Math.min((avgEarningsPerVideo / 100) * 100, 100); // Assuming ₹100 per video is excellent
 const viewsScore = Math.min((avgViewsPerVideo / 1000) * 100, 100); // Assuming 1000 views per video is excellent
 const volumeScore = Math.min((totalVideos / 50) * 100, 100); // Assuming 50 videos is excellent volume

 return Math.round((earningsScore * 0.4 + viewsScore * 0.4 + volumeScore * 0.2));
}

export function analyzeTrends(data: ChartDataPoint[]): {
 trend: 'up' | 'down' | 'stable';
 strength: number;
 prediction: number;
} {
 if (!Array.isArray(data) || data.length < 2) {
 return { trend: 'stable', strength: 0, prediction: 0 };
 }

 const n = data.length;
 const xValues = data.map((_, index) => index);
 const yValues = data.map(item => item.value);
 
 const sumX = xValues.reduce((a, b) => a + b, 0);
 const sumY = yValues.reduce((a, b) => a + b, 0);
 const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
 const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
 
 const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
 const intercept = (sumY - slope * sumX) / n;

 const trend = slope > 0.1 ? 'up' : slope < -0.1 ? 'down' : 'stable';
 const strength = Math.abs(slope);
 const prediction = slope * n + intercept; // Predict next value
 
 return { trend, strength, prediction };
}

export function formatCurrency(amount: number): string {
 if (typeof amount !== 'number' || isNaN(amount)) {
 return '₹0.00';
 }
 
 return new Intl.NumberFormat('en-IN', {
 style: 'currency',
 currency: 'INR',
 minimumFractionDigits: 2,
 maximumFractionDigits: 2
 }).format(amount);
}

export function formatCoins(coins: number, showRupees: boolean = true): string {
 if (typeof coins !== 'number' || isNaN(coins)) {
 return '🪙 0 coins';
 }
 
 const coinsFormatted = `🪙 ${coins.toLocaleString()} coins`;
 
 if (showRupees) {
 const rupees = coins / 20; // 1 rupee = 20 coins
 return `${coinsFormatted} (₹${rupees.toFixed(2)})`;
 }
 
 return coinsFormatted;
}

export function formatNumber(num: number): string {
 if (typeof num !== 'number' || isNaN(num)) {
 return '0';
 }

 if (num >= 1000000) {
 return (num / 1000000).toFixed(1) + 'M';
 }
 if (num >= 1000) {
 return (num / 1000).toFixed(1) + 'K';
 }
 return num.toString();
}

export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
 try {
 const dateObj = typeof date === 'string' ? new Date(date) : date;
 
 if (isNaN(dateObj.getTime())) {
 return 'Invalid Date';
 }

 if (format === 'long') {
 return dateObj.toLocaleDateString('en-US', {
 year: 'numeric',
 month: 'long',
 day: 'numeric'
 });
 }
 
 return dateObj.toLocaleDateString('en-US', {
 month: 'short',
 day: 'numeric'
 });
 } catch (error) {
 console.error('Error formatting date:', error);
 return 'Invalid Date';
 }
}

export function getDateRange(timeRange: 'week' | 'month' | 'year'): { start: Date; end: Date } {
 const now = new Date();
 const end = new Date(now);
 let start: Date;

 switch (timeRange) {
 case 'week':
 start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
 break;
 case 'year':
 start = new Date(now.getFullYear(), 0, 1);
 break;
 case 'month':
 default:
 start = new Date(now.getFullYear(), now.getMonth(), 1);
 break;
 }

 return { start, end };
}

export function validateAnalyticsData(data: any): boolean {
 if (!data || typeof data !== 'object') {
 return false;
 }

 if (!data.summary || typeof data.summary !== 'object') {
 return false;
 }

 const requiredSummaryFields = ['totalEarnings', 'totalViews', 'totalVideos', 'avgEarningsPerVideo', 'avgViewsPerVideo'];
 for (const field of requiredSummaryFields) {
 if (typeof data.summary[field] !== 'number') {
 return false;
 }
 }

 if (!data.charts || typeof data.charts !== 'object') {
 return false;
 }

 if (!Array.isArray(data.charts.earnings) || !Array.isArray(data.charts.views)) {
 return false;
 }

 if (!Array.isArray(data.videoPerformance) || !Array.isArray(data.transactions)) {
 return false;
 }

 return true;
}