"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import Image from "next/image";

interface ViewingHistory {
    dailyViews: Array<{
        date: string;
        count: number;
        totalSpent: number;
    }>;
    categoryViews: Array<{
        category: string;
        count: number;
        totalSpent: number;
    }>;
    totalStats: {
        totalVideos: number;
        totalSpent: number;
        avgPerVideo: number;
    };
}

interface SpendingAnalytics {
    spendingByType: Array<{
        type: string;
        count: number;
        totalAmount: number;
    }>;
    monthlySpending: Array<{
        month: string;
        totalSpent: number;
        creditsAdded: number;
    }>;
}

interface EngagementMetrics {
    likesGiven: number;
    savesMade: number;
    followsMade: number;
    creatorEngagement: Array<{
        creatorId: string;
        creatorUsername: string;
        creatorAvatar?: string;
        videosWatched: number;
        totalSpent: number;
    }>;
}

interface CategoryPreferences {
    category: string;
    videosWatched: number;
    totalSpent: number;
    avgCostPerVideo: number;
}

interface TimeAnalytics {
    hourlyActivity: Array<{
        hour: number;
        count: number;
    }>;
    weeklyActivity: Array<{
        dayOfWeek: number;
        count: number;
    }>;
}

interface MemberAnalyticsData {
    viewingHistory: ViewingHistory;
    spendingAnalytics: SpendingAnalytics;
    engagementMetrics: EngagementMetrics;
    categoryPreferences: CategoryPreferences[];
    timeAnalytics: TimeAnalytics;
    period: number;
    dateRange: {
        start: string;
        end: string;
    };
}

interface MemberAnalyticsProps {
    className?: string;
}

export function MemberAnalytics({ className = "" }: MemberAnalyticsProps) {
    const { userProfile } = useAuthContext();
    const [analyticsData, setAnalyticsData] = useState<MemberAnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<string>("30");
    const [activeTab, setActiveTab] = useState<string>("overview");

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/member/analytics?period=${selectedPeriod}`);
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to fetch analytics data');
                }

                if (result.success) {
                    setAnalyticsData(result.data);
                } else {
                    throw new Error('Failed to load analytics data');
                }
            } catch (err) {
                console.error('Error fetching analytics data:', err);
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (userProfile) {
            fetchAnalyticsData();
        }
    }, [userProfile, selectedPeriod]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getDayName = (dayOfWeek: number) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayOfWeek] || 'Unknown';
    };

    const getHourLabel = (hour: number) => {
        if (hour === 0) return '12 AM';
        if (hour < 12) return `${hour} AM`;
        if (hour === 12) return '12 PM';
        return `${hour - 12} PM`;
    };

    if (loading) {
        return (
            <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray min-h-[600px]">
                <div className={`p-6 space-y-6 ${className}`}>
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="card">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-1"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray min-h-[600px]">
                <div className={`p-6 ${className}`}>
                    <div className="card bg-red-50 border-red-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-red-800">Error Loading Analytics</h3>
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
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray min-h-[600px]">
                <div className={`p-6 ${className}`}>
                    <div className="card">
                        <p className="text-center text-neutral-dark-gray">No analytics data available.</p>
                    </div>
                </div>
            </div>
        );
    }

    const { viewingHistory, spendingAnalytics, engagementMetrics, categoryPreferences, timeAnalytics } = analyticsData;

    return (
        <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray min-h-[600px]">
            <div className={`p-6 space-y-6 ${className}`}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-primary-navy">Analytics & Insights</h2>
                        <p className="text-neutral-dark-gray">Your viewing patterns and engagement metrics</p>
                    </div>
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                    </select>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'overview', label: 'Overview' },
                            { id: 'viewing', label: 'Viewing History' },
                            { id: 'spending', label: 'Spending' },
                            { id: 'engagement', label: 'Engagement' },
                            { id: 'preferences', label: 'Preferences' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                    ? 'border-primary-blue text-primary-blue'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="card">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-neutral-dark-gray">Videos Watched</p>
                                        <p className="text-2xl font-bold text-primary-navy">{viewingHistory.totalStats.totalVideos}</p>
                                    </div>
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-neutral-dark-gray">Credits Spent</p>
                                        <p className="text-2xl font-bold text-primary-navy">{formatCurrency(viewingHistory.totalStats.totalSpent)}</p>
                                    </div>
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-neutral-dark-gray">Likes Given</p>
                                        <p className="text-2xl font-bold text-primary-navy">{engagementMetrics.likesGiven}</p>
                                    </div>
                                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-neutral-dark-gray">Creators Followed</p>
                                        <p className="text-2xl font-bold text-primary-navy">{engagementMetrics.followsMade}</p>
                                    </div>
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Categories */}
                        <div className="card">
                            <h3 className="text-lg font-semibold text-primary-navy mb-4">Top Categories</h3>
                            <div className="space-y-3">
                                {viewingHistory.categoryViews.slice(0, 5).map((category, index) => (
                                    <div key={category.category} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                            <span className="font-medium text-primary-navy">{category.category}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-primary-navy">{category.count} videos</p>
                                            <p className="text-xs text-neutral-dark-gray">{formatCurrency(category.totalSpent)} spent</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'viewing' && (
                    <div className="space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="card">
                                <h3 className="text-lg font-semibold text-primary-navy mb-2">Total Videos</h3>
                                <p className="text-3xl font-bold text-primary-blue">{viewingHistory.totalStats.totalVideos}</p>
                                <p className="text-sm text-neutral-dark-gray">in the last {selectedPeriod} days</p>
                            </div>
                            <div className="card">
                                <h3 className="text-lg font-semibold text-primary-navy mb-2">Total Spent</h3>
                                <p className="text-3xl font-bold text-green-600">{formatCurrency(viewingHistory.totalStats.totalSpent)}</p>
                                <p className="text-sm text-neutral-dark-gray">on video content</p>
                            </div>
                            <div className="card">
                                <h3 className="text-lg font-semibold text-primary-navy mb-2">Avg per Video</h3>
                                <p className="text-3xl font-bold text-orange-600">{formatCurrency(viewingHistory.totalStats.avgPerVideo)}</p>
                                <p className="text-sm text-neutral-dark-gray">average cost</p>
                            </div>
                        </div>

                        {/* Category List */}
                        <div className="card">
                            <h3 className="text-lg font-semibold text-primary-navy mb-4">Category Breakdown</h3>
                            <div className="space-y-4">
                                {viewingHistory.categoryViews.map((category) => (
                                    <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-primary-navy">{category.category}</h4>
                                            <p className="text-sm text-neutral-dark-gray">{category.count} videos watched</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-primary-blue">{formatCurrency(category.totalSpent)}</p>
                                            <p className="text-xs text-neutral-dark-gray">total spent</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'spending' && (
                    <div className="space-y-6">
                        {/* By Type */}
                        <div className="card">
                            <h3 className="text-lg font-semibold text-primary-navy mb-4">Spending by Type</h3>
                            <div className="space-y-3">
                                {spendingAnalytics.spendingByType.map((type) => (
                                    <div key={type.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-primary-navy capitalize">{type.type.replace('_', ' ')}</h4>
                                            <p className="text-sm text-neutral-dark-gray">{type.count} transactions</p>
                                        </div>
                                        <p className="font-semibold text-primary-blue">{formatCurrency(type.totalAmount)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Monthly Trend */}
                        {spendingAnalytics.monthlySpending.length > 0 && (
                            <div className="card">
                                <h3 className="text-lg font-semibold text-primary-navy mb-4">Monthly Spending Trend</h3>
                                <div className="space-y-3">
                                    {spendingAnalytics.monthlySpending.map((month) => (
                                        <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <h4 className="font-medium text-primary-navy">
                                                    {new Date(month.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                                                </h4>
                                                <p className="text-sm text-neutral-dark-gray">
                                                    Credits added: {formatCurrency(month.creditsAdded)}
                                                </p>
                                            </div>
                                            <p className="font-semibold text-red-600">{formatCurrency(month.totalSpent)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'engagement' && (
                    <div className="space-y-6">
                        {/* Engagement Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="card">
                                <h3 className="text-lg font-semibold text-primary-navy mb-2">Likes Given</h3>
                                <p className="text-3xl font-bold text-red-600">{engagementMetrics.likesGiven}</p>
                            </div>
                            <div className="card">
                                <h3 className="text-lg font-semibold text-primary-navy mb-2">Videos Saved</h3>
                                <p className="text-3xl font-bold text-blue-600">{engagementMetrics.savesMade}</p>
                            </div>
                            <div className="card">
                                <h3 className="text-lg font-semibold text-primary-navy mb-2">Creators Followed</h3>
                                <p className="text-3xl font-bold text-purple-600">{engagementMetrics.followsMade}</p>
                            </div>
                        </div>

                        {/* Top Creators Engaged */}
                        <div className="card">
                            <h3 className="text-lg font-semibold text-primary-navy mb-4">Top Creator Engagement</h3>
                            <div className="space-y-4">
                                {engagementMetrics.creatorEngagement.map((creator) => (
                                    <div key={creator.creatorId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            {creator.creatorAvatar ? (
                                                <Image
                                                    src={creator.creatorAvatar}
                                                    alt={creator.creatorUsername}
                                                    width={40}
                                                    height={40}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {creator.creatorUsername.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-medium text-primary-navy">{creator.creatorUsername}</h4>
                                                <p className="text-sm text-neutral-dark-gray">{creator.videosWatched} videos watched</p>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-primary-blue">{formatCurrency(creator.totalSpent)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'preferences' && (
                    <div className="space-y-6">
                        {/* Category Preferences */}
                        <div className="card">
                            <h3 className="text-lg font-semibold text-primary-navy mb-4">Category Preferences</h3>
                            <div className="space-y-4">
                                {categoryPreferences.map((category) => (
                                    <div key={category.category} className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-primary-navy">{category.category}</h4>
                                            <span className="text-sm text-neutral-dark-gray">{category.videosWatched} videos</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-neutral-dark-gray">Total Spent:</span>
                                                <span className="ml-2 font-medium text-primary-blue">{formatCurrency(category.totalSpent)}</span>
                                            </div>
                                            <div>
                                                <span className="text-neutral-dark-gray">Avg per Video:</span>
                                                <span className="ml-2 font-medium text-orange-600">{formatCurrency(category.avgCostPerVideo)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Time Analytics */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Hourly */}
                            <div className="card">
                                <h3 className="text-lg font-semibold text-primary-navy mb-4">Activity by Hour</h3>
                                <div className="space-y-2">
                                    {timeAnalytics.hourlyActivity.map((hour) => (
                                        <div key={hour.hour} className="flex items-center justify-between">
                                            <span className="text-sm text-neutral-dark-gray">{getHourLabel(hour.hour)}</span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-primary-blue h-2 rounded-full"
                                                        style={{
                                                            width: `${Math.max(10, (hour.count / Math.max(...timeAnalytics.hourlyActivity.map(h => h.count))) * 100)}%`
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-primary-navy">{hour.count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Weekly */}
                            <div className="card">
                                <h3 className="text-lg font-semibold text-primary-navy mb-4">Activity by Day</h3>
                                <div className="space-y-2">
                                    {timeAnalytics.weeklyActivity.map((day) => (
                                        <div key={day.dayOfWeek} className="flex items-center justify-between">
                                            <span className="text-sm text-neutral-dark-gray">{getDayName(day.dayOfWeek)}</span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-primary-blue h-2 rounded-full"
                                                        style={{
                                                            width: `${Math.max(10, (day.count / Math.max(...timeAnalytics.weeklyActivity.map(d => d.count))) * 100)}%`
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-primary-navy">{day.count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}