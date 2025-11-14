"use client";

import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";

import { LayoutPersistenceDebug } from "@/components/layout/LayoutPersistenceDebug";
import { CreatorProtectedRoute } from "@/components/layout/ProtectedRoute";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import SeriesQuickActions from "@/components/creator/SeriesQuickActions";
import CoinBalance from "@/components/wallet/CoinBalance";
import { coinsToRupees, formatRupees } from "@/lib/utils/coin-utils";
import { useState, useEffect } from "react";

interface DashboardStats {
 totalCoinsEarned: number;
 totalEarnings: number; // Rupee equivalent for backward compatibility
 totalViews: number;
 videoCount: number;
 seriesCount: number;
 avgCoinsPerVideo: number;
 avgEarningsPerVideo: number; // Rupee equivalent for backward compatibility
 avgViewsPerVideo: number;
 monthlyGrowth: {
 earnings: number;
 views: number;
 videos: number;
 series: number;
 };
}

interface RecentActivity {
 id: string;
 type: 'video_upload' | 'earning' | 'milestone' | 'payout';
 title: string;
 description: string;
 timestamp: Date;
 metadata?: any;
}

interface DashboardData {
 stats: DashboardStats;
 recentActivity: RecentActivity[];
 topVideos: any[];
 profile: any;
}

function CreatorDashboardContent() {
 const { userProfile } = useAuthContext();
 const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 const fetchDashboardData = async () => {
 try {
 setLoading(true);
 setError(null);
 
 const controller = new AbortController();
 const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
 
 const response = await fetch('/api/creator/dashboard', {
 signal: controller.signal,
 headers: {
 'Cache-Control': 'max-age=300', // 5 minute cache
 }
 });
 
 clearTimeout(timeoutId);
 const result = await response.json();
 
 if (!response.ok) {
 throw new Error(result.error || 'Failed to fetch dashboard data');
 }
 
 if (result.success) {

 const processedData = {
 ...result.data,
 recentActivity: result.data.recentActivity.map((activity: any) => ({
 ...activity,
 timestamp: new Date(activity.timestamp)
 }))
 };
 setDashboardData(processedData);
 } else {
 throw new Error('Failed to load dashboard data');
 }
 } catch (err) {
 console.error('Error fetching dashboard data:', err);
 
 if (err instanceof Error && err.name === 'AbortError') {
 setError('Dashboard loading timeout. Please refresh the page.');
 } else {
 setError(err instanceof Error ? err.message : 'Unknown error occurred');
 }
 } finally {
 setLoading(false);
 }
 };

 if (userProfile) {
 fetchDashboardData();
 }
 }, [userProfile]);

 if (loading) {
 return <LoadingScreen message="Loading creator dashboard..." variant="dashboard" fullScreen={false} />;
 }

 if (error) {
 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-3xl font-bold text-primary-navy mb-2">
 Creator Dashboard
 </h1>
 <p className="text-neutral-dark-gray">
 Welcome back! Here&apos;s an overview of your creator performance.
 </p>
 </div>
 <div className="card bg-red-50 border-red-200">
 <div className="flex items-center space-x-3">
 <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
 <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 <div>
 <h3 className="text-lg font-semibold text-red-800">Error Loading Dashboard</h3>
 <p className="text-red-600">{error}</p>
 <button 
 onClick={() => window.location.reload()} 
 className="mt-2 text-sm text-red-700 underline hover:text-red-800"
 >
 Try again
 </button>
 </div>
 </div>
 </div>
 </div>
 );
 }

 if (!dashboardData) {
 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-3xl font-bold text-primary-navy mb-2">
 Creator Dashboard
 </h1>
 <p className="text-neutral-dark-gray">
 Welcome back! Here&apos;s an overview of your creator performance.
 </p>
 </div>
 <div className="card">
 <p className="text-center text-neutral-dark-gray">No dashboard data available.</p>
 </div>
 </div>
 );
 }

 const { stats, recentActivity } = dashboardData;

 return (
 <div className="space-y-6">
 {}
 <div>
 <h1 className="text-3xl font-bold text-primary-navy mb-2">
 Creator Dashboard
 </h1>
 <p className="text-neutral-dark-gray">
 Welcome back! Here&apos;s an overview of your creator performance.
 </p>
 </div>

 {}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
 <div className="card">
 <h3 className="text-lg font-semibold text-primary-navy mb-2">
 Total Coins Earned
 </h3>
 <div className="mb-1">
 <CoinBalance 
 balance={stats.totalCoinsEarned || 0} 
 size="large"
 showRupeeEquivalent={false}
 animated={false}
 />
 </div>
 <p className="text-sm text-neutral-dark-gray">
 {formatRupees(coinsToRupees(stats.totalCoinsEarned || 0))} equivalent
 </p>
 <p className="text-xs text-neutral-dark-gray mt-1">
 {(stats.monthlyGrowth?.earnings || 0) > 0 ? '+' : ''}{(stats.monthlyGrowth?.earnings || 0).toFixed(1)}% from last month
 </p>
 </div>

 <div className="card">
 <h3 className="text-lg font-semibold text-primary-navy mb-2">
 Total Views
 </h3>
 <p className="text-2xl font-bold text-accent-teal">
 {stats.totalViews.toLocaleString()}
 </p>
 <p className="text-sm text-neutral-dark-gray mt-1">
 {(stats.monthlyGrowth?.views || 0) > 0 ? '+' : ''}{(stats.monthlyGrowth?.views || 0).toFixed(1)}% from last month
 </p>
 </div>

 <div className="card">
 <h3 className="text-lg font-semibold text-primary-navy mb-2">
 Videos
 </h3>
 <p className="text-2xl font-bold text-accent-pink">
 {stats.videoCount}
 </p>
 <p className="text-sm text-neutral-dark-gray mt-1">
 {(stats.monthlyGrowth?.videos || 0) > 0 ? '+' : ''}{(stats.monthlyGrowth?.videos || 0).toFixed(1)}% from last month
 </p>
 </div>

 <div className="card">
 <h3 className="text-lg font-semibold text-primary-navy mb-2">
 Series
 </h3>
 <p className="text-2xl font-bold text-purple-600">
 {stats.seriesCount || 0}
 </p>
 <p className="text-sm text-neutral-dark-gray mt-1">
 {(stats.monthlyGrowth?.series || 0) > 0 ? '+' : ''}{(stats.monthlyGrowth?.series || 0).toFixed(1)}% from last month
 </p>
 </div>

 <div className="card">
 <h3 className="text-lg font-semibold text-primary-navy mb-2">
 Avg. Coins Per Video
 </h3>
 <div className="mb-1">
 <CoinBalance 
 balance={stats.avgCoinsPerVideo || 0} 
 size="large"
 showRupeeEquivalent={false}
 animated={false}
 />
 </div>
 <p className="text-xs text-neutral-dark-gray">
 {formatRupees(coinsToRupees(stats.avgCoinsPerVideo || 0))} per video
 </p>
 </div>
 </div>

 {}
 {process.env.NODE_ENV === 'development' && (
 <LayoutPersistenceDebug className="mb-6" />
 )}

 {}
 <SeriesQuickActions />

 {}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {}
 <div className="card">
 <h3 className="text-xl font-semibold text-primary-navy mb-4">
 Quick Actions
 </h3>
 <div className="space-y-3">
 <a href="/creator/upload" className="w-full btn-primary flex items-center justify-center">
 <svg
 className="w-5 h-5 mr-2"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M12 4v16m8-8H4"
 />
 </svg>
 Upload New Video
 </a>
 <Link 
 href="/creator/series" 
 className="w-full btn-secondary flex items-center justify-center"
 role="button"
 aria-label="Navigate to series management"
 >
 <svg
 className="w-5 h-5 mr-2"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
 />
 </svg>
 Manage Series
 </Link>
 <a 
 href="/creator/analytics" 
 className="w-full btn-outline flex items-center justify-center"
 role="button"
 aria-label="Navigate to analytics dashboard"
 >
 <svg
 className="w-5 h-5 mr-2"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
 />
 </svg>
 View Analytics
 </a>
 <a 
 href="/creator/videos" 
 className="w-full btn-outline flex items-center justify-center"
 role="button"
 aria-label="Navigate to video management"
 >
 <svg
 className="w-5 h-5 mr-2"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
 />
 </svg>
 Manage Videos
 </a>
 <a href="/creator/help" className="w-full btn-outline flex items-center justify-center border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300">
 <svg
 className="w-5 h-5 mr-2"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
 />
 </svg>
 Get Help & Support
 </a>
 </div>
 </div>

 {}
 <div className="card">
 <h3 className="text-xl font-semibold text-primary-navy mb-4">
 Recent Activity
 </h3>
 <div className="space-y-4">
 {recentActivity.length > 0 ? (
 recentActivity.map((activity) => {
 const getActivityColor = (type: string) => {
 switch (type) {
 case 'video_upload': return 'bg-accent-green';
 case 'earning': return 'bg-accent-teal';
 case 'milestone': return 'bg-accent-pink';
 case 'payout': return 'bg-primary-neon-yellow';
 default: return 'bg-neutral-dark-gray';
 }
 };

 const getTimeAgo = (timestamp: Date) => {
 const now = new Date();
 const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
 
 if (diffInHours < 1) return 'Less than an hour ago';
 if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
 
 const diffInDays = Math.floor(diffInHours / 24);
 if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
 
 return timestamp.toLocaleDateString();
 };

 return (
 <div key={activity.id} className="flex items-start space-x-3">
 <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full mt-2`}></div>
 <div>
 <p className="text-sm font-medium text-primary-navy">
 {activity.title}
 </p>
 <p className="text-xs text-neutral-dark-gray mb-1">
 {activity.description}
 </p>
 <p className="text-xs text-neutral-dark-gray">
 {getTimeAgo(activity.timestamp)}
 </p>
 </div>
 </div>
 );
 })
 ) : (
 <div className="text-center py-8">
 <p className="text-sm text-neutral-dark-gray">
 No recent activity
 </p>
 <p className="text-xs text-neutral-dark-gray">
 Upload your first video to get started
 </p>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}

function CreatorDashboardPage() {
 return (
 <CreatorProtectedRoute>
 <CreatorDashboardContent />
 </CreatorProtectedRoute>
 );
}

export default CreatorDashboardPage;