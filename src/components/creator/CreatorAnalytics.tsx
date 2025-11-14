"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
 transformEarningsData, 
 transformViewsData, 
 fillMissingDates,
 calculateGrowthRate,
 calculatePerformanceScore,
 analyzeTrends,
 formatCurrency,
 formatCoins,
 formatNumber,
 formatDate,
 getDateRange,
 validateAnalyticsData,
 type ChartDataPoint
} from '@/lib/analytics-utils';

interface AnalyticsData {
 summary: {
 totalCoinsEarned: number;
 totalCoinsEarnedRupees: number;
 totalEarnings?: number; // Legacy support
 totalViews: number;
 totalVideos: number;
 avgCoinsPerVideo: number;
 avgCoinsPerVideoRupees: number;
 avgEarningsPerVideo?: number; // Legacy support
 avgViewsPerVideo: number;
 };
 charts: {
 earnings: ChartDataPoint[];
 views: ChartDataPoint[];
 };
 videoPerformance: {
 id: string;
 title: string;
 views: number;
 coinsEarned: number;
 coinsEarnedRupees: number;
 earnings?: number; // Legacy support
 coinPrice: number;
 coinPriceRupees: number;
 creditCost?: number; // Legacy support
 createdAt: string;
 category: string;
 }[];
 transactions: {
 id: string;
 coins: number;
 rupees: number;
 amount?: number; // Legacy support
 contentType?: string;
 contentId: string | null;
 videoId?: string | null; // Legacy support
 createdAt: string;
 description: string;
 video?: { id: string; title: string };
 }[];
 metrics?: {
 performanceScore: number;
 earningsTrend: {
 trend: 'up' | 'down' | 'stable';
 strength: number;
 prediction: number;
 };
 viewsTrend: {
 trend: 'up' | 'down' | 'stable';
 strength: number;
 prediction: number;
 };
 conversionRate: number;
 };
}

interface CreatorAnalyticsProps {
 className?: string;
 videoId?: string; // For individual video analytics
}

export function CreatorAnalytics({ className = '', videoId }: CreatorAnalyticsProps) {
 const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [retryCount, setRetryCount] = useState(0);
 const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
 const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

 const fetchAnalytics = useCallback(async () => {
 try {
 setLoading(true);
 setError(null);

 const params = new URLSearchParams();
 if (dateRange) {
 params.append('startDate', dateRange.start);
 params.append('endDate', dateRange.end);
 } else {
 params.append('timeRange', timeRange);
 }

 if (videoId) {
 params.append('videoId', videoId);
 }

 const response = await fetch(`/api/creator/analytics?${params}`, {
 method: 'GET',
 headers: {
 'Content-Type': 'application/json',
 },
 });
 
 if (!response.ok) {
 const errorData = await response.json().catch(() => ({}));
 const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
 const errorCode = errorData.code || 'UNKNOWN_ERROR';
 
 throw new Error(`${errorMessage} (${errorCode})`);
 }

 const data = await response.json();

 if (!validateAnalyticsData(data)) {
 throw new Error('Invalid analytics data structure received from server');
 }

 const currentDateRange = getDateRange(timeRange);

 const transformedEarnings = transformEarningsData(data.charts.earnings);
 const transformedViews = transformViewsData(data.charts.views);

 const filledEarnings = fillMissingDates(transformedEarnings, currentDateRange.start, currentDateRange.end, 'earnings');
 const filledViews = fillMissingDates(transformedViews, currentDateRange.start, currentDateRange.end, 'views');

 const performanceScore = calculatePerformanceScore(
 data.summary.totalEarnings,
 data.summary.totalViews,
 data.summary.totalVideos,
 data.summary.avgEarningsPerVideo,
 data.summary.avgViewsPerVideo
 );

 const earningsTrend = analyzeTrends(filledEarnings);
 const viewsTrend = analyzeTrends(filledViews);

 const totalCoinsEarned = data.summary.totalCoinsEarned || data.summary.totalEarnings || 0;
 const totalCoinsEarnedRupees = data.summary.totalCoinsEarnedRupees || data.summary.totalEarnings || 0;
 
 const enhancedData = {
 ...data,
 charts: {
 earnings: filledEarnings,
 views: filledViews
 },
 metrics: {
 performanceScore,
 earningsTrend,
 viewsTrend,
 conversionRate: data.summary.totalViews > 0 
 ? (totalCoinsEarned / data.summary.totalViews) * 100 
 : 0
 }
 };

 setAnalyticsData(enhancedData);
 setRetryCount(0); // Reset retry count on success
 } catch (err) {
 console.error('Analytics fetch error:', err);
 const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
 setError(errorMessage);

 if (retryCount < 3 && (
 errorMessage.includes('network') || 
 errorMessage.includes('timeout') || 
 errorMessage.includes('503') ||
 errorMessage.includes('DATABASE_ERROR')
 )) {
 setTimeout(() => {
 setRetryCount(prev => prev + 1);
 fetchAnalytics();
 }, Math.pow(2, retryCount) * 1000); // Exponential backoff
 }
 } finally {
 setLoading(false);
 }
 }, [timeRange, dateRange, retryCount, videoId]);

 useEffect(() => {
 fetchAnalytics();
 }, [fetchAnalytics]);

 const handleTimeRangeChange = (newTimeRange: 'week' | 'month' | 'year') => {
 setTimeRange(newTimeRange);
 setDateRange(null); // Clear custom date range
 };

 const handleCustomDateRange = (start: string, end: string) => {
 setDateRange({ start, end });
 };

 if (loading) {
 return (
 <div className={`${className} animate-pulse`}>
 <div className="space-y-6">
 <div className="h-8 bg-neutral-light-gray rounded"></div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="h-32 bg-neutral-light-gray rounded-lg"></div>
 ))}
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <div className="h-80 bg-neutral-light-gray rounded-lg"></div>
 <div className="h-80 bg-neutral-light-gray rounded-lg"></div>
 </div>
 </div>
 </div>
 );
 }

 if (error) {
 return (
 <div className={`${className} text-center py-12`}>
 <div className="text-red-500 mb-4">
 <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <p className="text-lg font-semibold">Failed to load analytics</p>
 <p className="text-sm text-neutral-dark-gray mt-2 max-w-md mx-auto">{error}</p>
 {retryCount > 0 && (
 <p className="text-xs text-neutral-dark-gray mt-1">
 Retry attempt {retryCount}/3
 </p>
 )}
 </div>
 <div className="space-x-4">
 <button
 onClick={() => {
 setRetryCount(0);
 fetchAnalytics();
 }}
 disabled={loading}
 className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? 'Retrying...' : 'Try Again'}
 </button>
 <button
 onClick={() => {
 setError(null);
 setAnalyticsData({
 summary: {
 totalCoinsEarned: 0,
 totalCoinsEarnedRupees: 0,
 totalEarnings: 0,
 totalViews: 0,
 totalVideos: 0,
 avgCoinsPerVideo: 0,
 avgCoinsPerVideoRupees: 0,
 avgEarningsPerVideo: 0,
 avgViewsPerVideo: 0
 },
 charts: { earnings: [], views: [] },
 videoPerformance: [],
 transactions: []
 });
 }}
 className="btn-outline"
 >
 Show Empty Dashboard
 </button>
 </div>
 </div>
 );
 }

 if (!analyticsData) {
 return null;
 }

 return (
 <div className={className}>
 {}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
 <div>
 <h2 className="text-2xl font-bold text-primary-navy">
 {videoId ? 'Video Analytics' : 'Analytics Dashboard'}
 </h2>
 <p className="text-neutral-dark-gray">
 {videoId ? 'Track individual video performance' : 'Track your earnings and video performance'}
 </p>
 </div>
 
 <div className="flex flex-wrap gap-2">
 {(['week', 'month', 'year'] as const).map((range) => (
 <button
 key={range}
 onClick={() => handleTimeRangeChange(range)}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
 timeRange === range && !dateRange
 ? 'bg-primary-navy text-white'
 : 'bg-neutral-light-gray text-neutral-dark-gray hover:bg-neutral-gray'
 }`}
 >
 {range.charAt(0).toUpperCase() + range.slice(1)}
 </button>
 ))}
 <DateRangePicker onDateRangeChange={handleCustomDateRange} />
 </div>
 </div>

 {}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="card"
 >
 <div className="flex items-center justify-between mb-2">
 <h3 className="text-lg font-semibold text-primary-navy">Total Coins Earned</h3>
 {analyticsData.metrics?.earningsTrend && (
 <TrendIndicator trend={analyticsData.metrics.earningsTrend.trend} />
 )}
 </div>
 <p className="text-3xl font-bold text-accent-green">
 🪙 {(analyticsData.summary.totalCoinsEarned || analyticsData.summary.totalEarnings || 0).toLocaleString()}
 </p>
 <p className="text-sm text-neutral-dark-gray mt-1">
 ₹{(analyticsData.summary.totalCoinsEarnedRupees || analyticsData.summary.totalEarnings || 0).toFixed(2)} • Avg 🪙 {Math.round(analyticsData.summary.avgCoinsPerVideo || analyticsData.summary.avgEarningsPerVideo || 0).toLocaleString()} per video
 </p>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2 }}
 className="card"
 >
 <div className="flex items-center justify-between mb-2">
 <h3 className="text-lg font-semibold text-primary-navy">Total Views</h3>
 {analyticsData.metrics?.viewsTrend && (
 <TrendIndicator trend={analyticsData.metrics.viewsTrend.trend} />
 )}
 </div>
 <p className="text-3xl font-bold text-accent-teal">
 {formatNumber(analyticsData.summary.totalViews)}
 </p>
 <p className="text-sm text-neutral-dark-gray mt-1">
 Avg {formatNumber(analyticsData.summary.avgViewsPerVideo)} per video
 </p>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.3 }}
 className="card"
 >
 <h3 className="text-lg font-semibold text-primary-navy mb-2">Total Videos</h3>
 <p className="text-3xl font-bold text-accent-pink">
 {analyticsData.summary.totalVideos}
 </p>
 <p className="text-sm text-neutral-dark-gray mt-1">
 Content library size
 </p>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.4 }}
 className="card"
 >
 <h3 className="text-lg font-semibold text-primary-navy mb-2">Performance Score</h3>
 <div className="flex items-center space-x-3">
 <p className="text-3xl font-bold text-primary-neon-yellow">
 {analyticsData.metrics?.performanceScore || 0}
 </p>
 <div className="flex-1">
 <div className="w-full bg-neutral-light-gray rounded-full h-2">
 <div 
 className="bg-primary-neon-yellow h-2 rounded-full transition-all duration-500"
 style={{ width: `${analyticsData.metrics?.performanceScore || 0}%` }}
 ></div>
 </div>
 </div>
 </div>
 <p className="text-sm text-neutral-dark-gray mt-1">
 Overall performance rating
 </p>
 </motion.div>
 </div>

 {}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.5 }}
 className="card"
 >
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-xl font-semibold text-primary-navy">Earnings Trend</h3>
 {analyticsData.metrics?.earningsTrend && (
 <div className="text-sm text-neutral-dark-gray">
 Trend: <TrendIndicator trend={analyticsData.metrics.earningsTrend.trend} />
 </div>
 )}
 </div>
 <ChartWrapper>
 <EarningsChart data={analyticsData.charts.earnings} />
 </ChartWrapper>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.6 }}
 className="card"
 >
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-xl font-semibold text-primary-navy">Views Trend</h3>
 {analyticsData.metrics?.viewsTrend && (
 <div className="text-sm text-neutral-dark-gray">
 Trend: <TrendIndicator trend={analyticsData.metrics.viewsTrend.trend} />
 </div>
 )}
 </div>
 <ChartWrapper>
 <ViewsChart data={analyticsData.charts.views} />
 </ChartWrapper>
 </motion.div>
 </div>

 {}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.7 }}
 className="card mb-8"
 >
 <h3 className="text-xl font-semibold text-primary-navy mb-4">Video Performance</h3>
 <VideoPerformanceTable videos={analyticsData.videoPerformance} />
 </motion.div>

 {}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.8 }}
 className="card"
 >
 <h3 className="text-xl font-semibold text-primary-navy mb-4">Recent Transactions</h3>
 <TransactionHistory transactions={analyticsData.transactions} />
 </motion.div>
 </div>
 );
}

function DateRangePicker({ onDateRangeChange }: { onDateRangeChange: (start: string, end: string) => void }) {
 const [isOpen, setIsOpen] = useState(false);
 const [startDate, setStartDate] = useState('');
 const [endDate, setEndDate] = useState('');

 const handleApply = () => {
 if (startDate && endDate) {
 onDateRangeChange(startDate, endDate);
 setIsOpen(false);
 }
 };

 return (
 <div className="relative">
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="px-4 py-2 bg-neutral-light-gray text-neutral-dark-gray rounded-lg hover:bg-neutral-gray transition-colors"
 >
 Custom Range
 </button>
 
 {isOpen && (
 <div className="absolute right-0 top-full mt-2 bg-white border border-neutral-light-gray rounded-lg shadow-lg p-4 z-10 min-w-[280px]">
 <div className="space-y-4">
 <div>
 <label htmlFor="start-date" className="block text-sm font-medium text-primary-navy mb-1">Start Date</label>
 <input
 id="start-date"
 type="date"
 value={startDate}
 onChange={(e) => setStartDate(e.target.value)}
 className="w-full px-3 py-2 border border-neutral-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy"
 />
 </div>
 <div>
 <label htmlFor="end-date" className="block text-sm font-medium text-primary-navy mb-1">End Date</label>
 <input
 id="end-date"
 type="date"
 value={endDate}
 onChange={(e) => setEndDate(e.target.value)}
 className="w-full px-3 py-2 border border-neutral-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy"
 />
 </div>
 <div className="flex space-x-2">
 <button
 onClick={handleApply}
 disabled={!startDate || !endDate}
 className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
 >
 Apply
 </button>
 <button
 onClick={() => setIsOpen(false)}
 className="flex-1 btn-outline"
 >
 Cancel
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

function ChartWrapper({ children }: { children: React.ReactNode }) {
 return (
 <div className="relative">
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>
 {children}
 </div>
 );
}

function TrendIndicator({ trend }: { trend: 'up' | 'down' | 'stable' }) {
 const getIcon = () => {
 switch (trend) {
 case 'up':
 return (
 <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
 </svg>
 );
 case 'down':
 return (
 <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
 </svg>
 );
 default:
 return (
 <svg className="w-4 h-4 text-neutral-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
 </svg>
 );
 }
 };

 return (
 <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
 trend === 'up' ? 'bg-green-100 text-green-700' :
 trend === 'down' ? 'bg-red-100 text-red-700' :
 'bg-neutral-light-gray text-neutral-dark-gray'
 }`}>
 {getIcon()}
 <span className="capitalize">{trend}</span>
 </div>
 );
}

function EarningsChart({ data }: { data: ChartDataPoint[] }) {
 if (data.length === 0) {
 return (
 <div className="h-64 flex items-center justify-center text-neutral-dark-gray">
 <div className="text-center">
 <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
 </svg>
 <p>No earnings data available</p>
 </div>
 </div>
 );
 }

 const maxEarnings = Math.max(...data.map(d => d.value), 1); // Ensure minimum of 1 to avoid division by zero
 const chartHeight = 200;
 const chartPadding = 40;

 return (
 <div className="h-64">
 <div className="relative h-full">
 <svg width="100%" height={chartHeight} className="overflow-visible">
 {}
 {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
 <line
 key={ratio}
 x1="0"
 y1={chartHeight - ratio * (chartHeight - chartPadding)}
 x2="100%"
 y2={chartHeight - ratio * (chartHeight - chartPadding)}
 stroke="#f3f4f6"
 strokeWidth="1"
 strokeDasharray="2,2"
 />
 ))}
 
 {}
 {data.length > 0 && (
 <>
 <polyline
 fill="none"
 stroke="#10B981"
 strokeWidth="3"
 points={data.map((point, index) => {
 const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
 const y = chartHeight - (point.value / maxEarnings) * (chartHeight - chartPadding);
 return `${x}%,${y}`;
 }).join(' ')}
 />
 
 {data.map((point, index) => {
 const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
 const y = chartHeight - (point.value / maxEarnings) * (chartHeight - chartPadding);
 
 return (
 <g key={`${point.date}-${index}`}>
 <circle
 cx={`${x}%`}
 cy={y}
 r="5"
 fill="#10B981"
 className="hover:r-7 transition-all cursor-pointer drop-shadow-sm"
 />
 <title>{`${formatDate(point.date)}: ${point.label || formatCurrency(point.value)}`}</title>
 {index % Math.ceil(data.length / 6) === 0 && ( // Show every nth label to avoid crowding
 <text
 x={`${x}%`}
 y={chartHeight - 5}
 textAnchor="middle"
 className="text-xs fill-neutral-dark-gray"
 >
 {formatDate(point.date)}
 </text>
 )}
 </g>
 );
 })}
 </>
 )}
 
 {}
 {[0, 0.5, 1].map((ratio) => (
 <text
 key={ratio}
 x="5"
 y={chartHeight - ratio * (chartHeight - chartPadding) + 4}
 className="text-xs fill-neutral-dark-gray"
 >
 🪙 {Math.round(maxEarnings * ratio).toLocaleString()}
 </text>
 ))}
 </svg>
 </div>
 </div>
 );
}

function ViewsChart({ data }: { data: ChartDataPoint[] }) {
 if (data.length === 0) {
 return (
 <div className="h-64 flex items-center justify-center text-neutral-dark-gray">
 <div className="text-center">
 <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
 </svg>
 <p>No views data available</p>
 </div>
 </div>
 );
 }

 const maxViews = Math.max(...data.map(d => d.value), 1); // Ensure minimum of 1 to avoid division by zero
 const chartHeight = 200;
 const chartPadding = 40;

 return (
 <div className="h-64">
 <div className="relative h-full">
 <svg width="100%" height={chartHeight} className="overflow-visible">
 {}
 {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
 <line
 key={ratio}
 x1="0"
 y1={chartHeight - ratio * (chartHeight - chartPadding)}
 x2="100%"
 y2={chartHeight - ratio * (chartHeight - chartPadding)}
 stroke="#f3f4f6"
 strokeWidth="1"
 strokeDasharray="2,2"
 />
 ))}
 
 {}
 {data.length > 0 && (
 <>
 <polyline
 fill="none"
 stroke="#14B8A6"
 strokeWidth="3"
 points={data.map((point, index) => {
 const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
 const y = chartHeight - (point.value / maxViews) * (chartHeight - chartPadding);
 return `${x}%,${y}`;
 }).join(' ')}
 />
 
 {data.map((point, index) => {
 const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
 const y = chartHeight - (point.value / maxViews) * (chartHeight - chartPadding);
 
 return (
 <g key={`${point.date}-${index}`}>
 <circle
 cx={`${x}%`}
 cy={y}
 r="5"
 fill="#14B8A6"
 className="hover:r-7 transition-all cursor-pointer drop-shadow-sm"
 />
 <title>{`${formatDate(point.date)}: ${point.label || formatNumber(point.value)} views`}</title>
 {index % Math.ceil(data.length / 6) === 0 && ( // Show every nth label to avoid crowding
 <text
 x={`${x}%`}
 y={chartHeight - 5}
 textAnchor="middle"
 className="text-xs fill-neutral-dark-gray"
 >
 {formatDate(point.date)}
 </text>
 )}
 </g>
 );
 })}
 </>
 )}
 
 {}
 {[0, 0.5, 1].map((ratio) => (
 <text
 key={ratio}
 x="5"
 y={chartHeight - ratio * (chartHeight - chartPadding) + 4}
 className="text-xs fill-neutral-dark-gray"
 >
 {formatNumber(maxViews * ratio)}
 </text>
 ))}
 </svg>
 </div>
 </div>
 );
}

function VideoPerformanceTable({ videos }: { videos: AnalyticsData['videoPerformance'] }) {
 const [sortBy, setSortBy] = useState<'title' | 'views' | 'coinsEarned' | 'coinPrice' | 'createdAt'>('coinsEarned');
 const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

 const sortedVideos = [...videos].sort((a, b) => {
 let aValue: any;
 let bValue: any;

 if (sortBy === 'coinsEarned') {
 aValue = a.coinsEarned || a.earnings || 0;
 bValue = b.coinsEarned || b.earnings || 0;
 } else if (sortBy === 'coinPrice') {
 aValue = a.coinPrice || a.creditCost || 0;
 bValue = b.coinPrice || b.creditCost || 0;
 } else {
 aValue = a[sortBy];
 bValue = b[sortBy];
 }
 
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

 const handleSort = (column: typeof sortBy) => {
 if (sortBy === column) {
 setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
 } else {
 setSortBy(column);
 setSortOrder('desc');
 }
 };

 if (videos.length === 0) {
 return (
 <div className="text-center py-8">
 <svg className="w-12 h-12 mx-auto mb-4 text-neutral-dark-gray opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
 </svg>
 <p className="text-neutral-dark-gray">No videos uploaded yet</p>
 <p className="text-sm text-neutral-dark-gray mt-1">Upload your first video to see performance data</p>
 </div>
 );
 }

 return (
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-neutral-light-gray">
 <th className="text-left py-3 px-4">
 <button
 onClick={() => handleSort('title')}
 className="flex items-center space-x-1 font-semibold text-primary-navy hover:text-accent-teal transition-colors"
 >
 <span>Video Title</span>
 {sortBy === 'title' && (
 <svg className={`w-4 h-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
 </svg>
 )}
 </button>
 </th>
 <th className="text-left py-3 px-4">
 <button
 onClick={() => handleSort('views')}
 className="flex items-center space-x-1 font-semibold text-primary-navy hover:text-accent-teal transition-colors"
 >
 <span>Views</span>
 {sortBy === 'views' && (
 <svg className={`w-4 h-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
 </svg>
 )}
 </button>
 </th>
 <th className="text-left py-3 px-4">
 <button
 onClick={() => handleSort('coinsEarned')}
 className="flex items-center space-x-1 font-semibold text-primary-navy hover:text-accent-teal transition-colors"
 >
 <span>Coins Earned</span>
 {sortBy === 'coinsEarned' && (
 <svg className={`w-4 h-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
 </svg>
 )}
 </button>
 </th>
 <th className="text-left py-3 px-4">
 <button
 onClick={() => handleSort('coinPrice')}
 className="flex items-center space-x-1 font-semibold text-primary-navy hover:text-accent-teal transition-colors"
 >
 <span>Coin Price</span>
 {sortBy === 'coinPrice' && (
 <svg className={`w-4 h-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
 </svg>
 )}
 </button>
 </th>
 <th className="text-left py-3 px-4">Category</th>
 <th className="text-left py-3 px-4">
 <button
 onClick={() => handleSort('createdAt')}
 className="flex items-center space-x-1 font-semibold text-primary-navy hover:text-accent-teal transition-colors"
 >
 <span>Upload Date</span>
 {sortBy === 'createdAt' && (
 <svg className={`w-4 h-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
 </svg>
 )}
 </button>
 </th>
 </tr>
 </thead>
 <tbody>
 {sortedVideos.map((video, index) => (
 <motion.tr
 key={video.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.05 }}
 className="border-b border-neutral-light-gray hover:bg-neutral-light-gray/50 transition-colors"
 >
 <td className="py-3 px-4">
 <div className="font-medium text-primary-navy truncate max-w-xs" title={video.title}>
 {video.title}
 </div>
 </td>
 <td className="py-3 px-4">
 <div className="flex items-center space-x-2">
 <svg className="w-4 h-4 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
 </svg>
 <span className="text-neutral-dark-gray">{formatNumber(video.views)}</span>
 </div>
 </td>
 <td className="py-3 px-4">
 <div className="flex flex-col">
 <div className="flex items-center space-x-2">
 <span className="font-semibold text-accent-green">
 🪙 {(video.coinsEarned || video.earnings || 0).toLocaleString()}
 </span>
 </div>
 <span className="text-xs text-neutral-dark-gray">
 ₹{(video.coinsEarnedRupees || video.earnings || 0).toFixed(2)}
 </span>
 </div>
 </td>
 <td className="py-3 px-4">
 <div className="flex flex-col">
 <span className="text-neutral-dark-gray">
 🪙 {(video.coinPrice || video.creditCost || 0).toLocaleString()}
 </span>
 <span className="text-xs text-neutral-dark-gray">
 ₹{(video.coinPriceRupees || video.creditCost || 0).toFixed(2)}
 </span>
 </div>
 </td>
 <td className="py-3 px-4">
 <span className="inline-block px-2 py-1 bg-accent-pink/10 text-accent-pink rounded-full text-xs font-medium">
 {video.category}
 </span>
 </td>
 <td className="py-3 px-4">
 <span className="text-neutral-dark-gray text-sm">
 {new Date(video.createdAt).toLocaleDateString('en-US', {
 year: 'numeric',
 month: 'short',
 day: 'numeric'
 })}
 </span>
 </td>
 </motion.tr>
 ))}
 </tbody>
 </table>
 </div>
 );
}

function TransactionHistory({ transactions }: { transactions: AnalyticsData['transactions'] }) {
 if (transactions.length === 0) {
 return (
 <div className="text-center py-8">
 <svg className="w-12 h-12 mx-auto mb-4 text-neutral-dark-gray opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
 </svg>
 <p className="text-neutral-dark-gray">No transactions yet</p>
 <p className="text-sm text-neutral-dark-gray mt-1">Earnings will appear here when viewers purchase your content</p>
 </div>
 );
 }

 return (
 <div className="space-y-3 max-h-96 overflow-y-auto">
 {transactions.map((transaction, index) => {
 const coins = transaction.coins || transaction.amount || 0;
 const rupees = transaction.rupees || transaction.amount || 0;
 const contentType = transaction.contentType || 'video';
 const description = transaction.description || (transaction.video ? `Earning from "${transaction.video.title}"` : `${contentType} earning`);
 
 return (
 <motion.div
 key={transaction.id}
 initial={{ opacity: 0, x: -10 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: index * 0.05 }}
 className="flex items-center justify-between p-4 bg-neutral-light-gray/50 rounded-lg hover:bg-neutral-light-gray transition-colors"
 >
 <div className="flex items-center space-x-3">
 <div className="w-10 h-10 bg-accent-green/10 rounded-full flex items-center justify-center">
 <span className="text-lg">🪙</span>
 </div>
 <div>
 <p className="font-medium text-primary-navy">
 {description}
 </p>
 <p className="text-sm text-neutral-dark-gray">
 {new Date(transaction.createdAt).toLocaleDateString('en-US', {
 year: 'numeric',
 month: 'short',
 day: 'numeric',
 hour: '2-digit',
 minute: '2-digit'
 })}
 </p>
 </div>
 </div>
 <div className="text-right">
 <p className="font-semibold text-accent-green">+🪙 {coins.toLocaleString()}</p>
 <p className="text-xs text-neutral-dark-gray">₹{rupees.toFixed(2)}</p>
 </div>
 </motion.div>
 );
 })}
 </div>
 );
}