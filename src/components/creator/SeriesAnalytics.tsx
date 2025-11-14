"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
 ChartBarIcon,
 EyeIcon,
 CurrencyRupeeIcon,
 UsersIcon,
 ArrowTrendingUpIcon,
 ArrowTrendingDownIcon,
 CalendarIcon,
 PlayIcon,
} from "@heroicons/react/24/outline";
import { Series } from "@/types";

interface SeriesAnalyticsProps {
 seriesId: string;
}

interface SeriesAnalyticsData {
 series: Series;
 analytics: {
 totalViews: number;
 totalEarnings: number;
 totalPurchases: number;
 averageRating: number;
 completionRate: number;
 viewsGrowth: number;
 earningsGrowth: number;
 purchasesGrowth: number;
 dailyStats: Array<{
 date: string;
 views: number;
 earnings: number;
 purchases: number;
 }>;
 videoPerformance: Array<{
 videoId: string;
 title: string;
 views: number;
 earnings: number;
 completionRate: number;
 averageWatchTime: number;
 }>;
 demographics: {
 ageGroups: Array<{ range: string; percentage: number }>;
 locations: Array<{ city: string; percentage: number }>;
 devices: Array<{ type: string; percentage: number }>;
 };
 };
}

export default function SeriesAnalytics({ seriesId }: SeriesAnalyticsProps) {
 const [data, setData] = useState<SeriesAnalyticsData | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">(
 "30d"
 );

 useEffect(() => {
 const loadAnalytics = async () => {
 setIsLoading(true);
 try {
 const response = await fetch(
 `/api/series/${seriesId}/analytics?range=${timeRange}`
 );
 if (response.ok) {
 const analyticsData = await response.json();
 setData(analyticsData);
 } else {
 throw new Error("Failed to load analytics");
 }
 } catch (error) {
 console.error("Failed to load analytics:", error);
 setError("Failed to load series analytics");
 } finally {
 setIsLoading(false);
 }
 };

 loadAnalytics();
 }, [seriesId, timeRange]);

 const formatCurrency = (amount: number) => {
 return new Intl.NumberFormat("en-IN", {
 style: "currency",
 currency: "INR",
 minimumFractionDigits: 0,
 }).format(amount);
 };

 const formatPercentage = (value: number) => {
 return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
 };

 const getGrowthIcon = (growth: number) => {
 return growth >= 0 ? (
 <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
 ) : (
 <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
 );
 };

 const getGrowthColor = (growth: number) => {
 return growth >= 0 ? "text-green-600" : "text-red-600";
 };

 if (isLoading) {
 return (
 <div className="flex items-center justify-center py-12">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
 </div>
 );
 }

 if (error || !data) {
 return (
 <div className="text-center py-12">
 <p className="text-red-600">{error || "Failed to load analytics"}</p>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {}
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-2xl font-bold text-gray-900">Series Analytics</h2>
 <p className="text-gray-600 mt-1">{data.series.title}</p>
 </div>

 {}
 <div className="flex items-center gap-2">
 <CalendarIcon className="w-4 h-4 text-gray-500" />
 <select
 value={timeRange}
 onChange={(e) => setTimeRange(e.target.value as any)}
 className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
 >
 <option value="7d">Last 7 days</option>
 <option value="30d">Last 30 days</option>
 <option value="90d">Last 90 days</option>
 <option value="1y">Last year</option>
 </select>
 </div>
 </div>

 {}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-white p-6 rounded-lg border border-gray-200"
 >
 <div className="flex items-center justify-between mb-4">
 <div className="p-2 bg-blue-100 rounded-lg">
 <EyeIcon className="w-5 h-5 text-blue-600" />
 </div>
 <div className="flex items-center gap-1">
 {getGrowthIcon(data.analytics.viewsGrowth)}
 <span
 className={`text-sm ${getGrowthColor(
 data.analytics.viewsGrowth
 )}`}
 >
 {formatPercentage(data.analytics.viewsGrowth)}
 </span>
 </div>
 </div>
 <div>
 <p className="text-2xl font-bold text-gray-900">
 {data.analytics.totalViews.toLocaleString()}
 </p>
 <p className="text-sm text-gray-600">Total Views</p>
 </div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="bg-white p-6 rounded-lg border border-gray-200"
 >
 <div className="flex items-center justify-between mb-4">
 <div className="p-2 bg-green-100 rounded-lg">
 <CurrencyRupeeIcon className="w-5 h-5 text-green-600" />
 </div>
 <div className="flex items-center gap-1">
 {getGrowthIcon(data.analytics.earningsGrowth)}
 <span
 className={`text-sm ${getGrowthColor(
 data.analytics.earningsGrowth
 )}`}
 >
 {formatPercentage(data.analytics.earningsGrowth)}
 </span>
 </div>
 </div>
 <div>
 <p className="text-2xl font-bold text-gray-900">
 {formatCurrency(data.analytics.totalEarnings)}
 </p>
 <p className="text-sm text-gray-600">Total Earnings</p>
 </div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2 }}
 className="bg-white p-6 rounded-lg border border-gray-200"
 >
 <div className="flex items-center justify-between mb-4">
 <div className="p-2 bg-purple-100 rounded-lg">
 <UsersIcon className="w-5 h-5 text-purple-600" />
 </div>
 <div className="flex items-center gap-1">
 {getGrowthIcon(data.analytics.purchasesGrowth)}
 <span
 className={`text-sm ${getGrowthColor(
 data.analytics.purchasesGrowth
 )}`}
 >
 {formatPercentage(data.analytics.purchasesGrowth)}
 </span>
 </div>
 </div>
 <div>
 <p className="text-2xl font-bold text-gray-900">
 {data.analytics.totalPurchases.toLocaleString()}
 </p>
 <p className="text-sm text-gray-600">Total Purchases</p>
 </div>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.3 }}
 className="bg-white p-6 rounded-lg border border-gray-200"
 >
 <div className="flex items-center justify-between mb-4">
 <div className="p-2 bg-orange-100 rounded-lg">
 <ChartBarIcon className="w-5 h-5 text-orange-600" />
 </div>
 </div>
 <div>
 <p className="text-2xl font-bold text-gray-900">
 {data.analytics.completionRate.toFixed(1)}%
 </p>
 <p className="text-sm text-gray-600">Completion Rate</p>
 </div>
 </motion.div>
 </div>

 {}
 <div className="bg-white p-6 rounded-lg border border-gray-200">
 <h3 className="text-lg font-semibold text-gray-900 mb-4">
 Performance Over Time
 </h3>
 <div className="h-64 flex items-center justify-center text-gray-500">
 {}
 <div className="text-center">
 <ChartBarIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
 <p>Performance chart would be displayed here</p>
 <p className="text-sm">Integration with charting library needed</p>
 </div>
 </div>
 </div>

 {}
 <div className="bg-white rounded-lg border border-gray-200">
 <div className="p-6 border-b border-gray-200">
 <h3 className="text-lg font-semibold text-gray-900">
 Video Performance
 </h3>
 </div>
 <div className="divide-y divide-gray-200">
 {data.analytics.videoPerformance.map((video, index) => (
 <motion.div
 key={video.videoId}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: index * 0.1 }}
 className="p-6"
 >
 <div className="flex items-center justify-between">
 <div className="flex-1 min-w-0">
 <h4 className="font-medium text-gray-900 truncate">
 {video.title}
 </h4>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-gray-600">
 <div className="flex items-center gap-1">
 <EyeIcon className="w-4 h-4" />
 <span>{video.views.toLocaleString()} views</span>
 </div>
 <div className="flex items-center gap-1">
 <CurrencyRupeeIcon className="w-4 h-4" />
 <span>{formatCurrency(video.earnings)}</span>
 </div>
 <div className="flex items-center gap-1">
 <PlayIcon className="w-4 h-4" />
 <span>{video.completionRate.toFixed(1)}% completion</span>
 </div>
 <div className="flex items-center gap-1">
 <ChartBarIcon className="w-4 h-4" />
 <span>
 {Math.floor(video.averageWatchTime / 60)}m avg watch
 </span>
 </div>
 </div>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 </div>

 {}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {}
 <div className="bg-white p-6 rounded-lg border border-gray-200">
 <h3 className="text-lg font-semibold text-gray-900 mb-4">
 Age Groups
 </h3>
 <div className="space-y-3">
 {data.analytics.demographics.ageGroups.map((group) => (
 <div
 key={group.range}
 className="flex items-center justify-between"
 >
 <span className="text-sm text-gray-600">{group.range}</span>
 <div className="flex items-center gap-2">
 <div className="w-20 bg-gray-200 rounded-full h-2">
 <div
 className="bg-purple-600 h-2 rounded-full"
 style={{ width: `${group.percentage}%` }}
 />
 </div>
 <span className="text-sm font-medium text-gray-900 w-10 text-right">
 {group.percentage.toFixed(1)}%
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>

 {}
 <div className="bg-white p-6 rounded-lg border border-gray-200">
 <h3 className="text-lg font-semibold text-gray-900 mb-4">
 Top Locations
 </h3>
 <div className="space-y-3">
 {data.analytics.demographics.locations.map((location) => (
 <div
 key={location.city}
 className="flex items-center justify-between"
 >
 <span className="text-sm text-gray-600">{location.city}</span>
 <div className="flex items-center gap-2">
 <div className="w-20 bg-gray-200 rounded-full h-2">
 <div
 className="bg-blue-600 h-2 rounded-full"
 style={{ width: `${location.percentage}%` }}
 />
 </div>
 <span className="text-sm font-medium text-gray-900 w-10 text-right">
 {location.percentage.toFixed(1)}%
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>

 {}
 <div className="bg-white p-6 rounded-lg border border-gray-200">
 <h3 className="text-lg font-semibold text-gray-900 mb-4">
 Device Types
 </h3>
 <div className="space-y-3">
 {data.analytics.demographics.devices.map((device) => (
 <div
 key={device.type}
 className="flex items-center justify-between"
 >
 <span className="text-sm text-gray-600 capitalize">
 {device.type}
 </span>
 <div className="flex items-center gap-2">
 <div className="w-20 bg-gray-200 rounded-full h-2">
 <div
 className="bg-green-600 h-2 rounded-full"
 style={{ width: `${device.percentage}%` }}
 />
 </div>
 <span className="text-sm font-medium text-gray-900 w-10 text-right">
 {device.percentage.toFixed(1)}%
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}
