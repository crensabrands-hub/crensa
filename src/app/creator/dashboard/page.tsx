"use client";

import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";

import { LayoutPersistenceDebug } from "@/components/layout/LayoutPersistenceDebug";
import { CreatorProtectedRoute } from "@/components/layout/ProtectedRoute";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import SeriesQuickActions from "@/components/creator/SeriesQuickActions";
import CoinBalance from "@/components/wallet/CoinBalance";
import { coinsToRupees, formatRupees } from "@/lib/utils/coin-utils";
import { useState, useEffect, useCallback } from "react";

interface DashboardStats {
    totalCoinsEarned: number;
    totalEarnings: number; // Rupee equivalent for backward compatibility
    totalViews: number;
    videoCount: number;
    seriesCount: number;
    avgCoinsPerVideo: number;
    avgEarningsPerVideo: number; // Rupee equivalent for backward compatibility
    avgViewsPerVideo: number;
    avgWatchTimeSeconds: number;
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

function ReferralCard() {
    const [referralCode, setReferralCode] = useState<string | null>(null);
    const [totalReferred, setTotalReferred] = useState(0);
    const [allReferrals, setAllReferrals] = useState<Array<{ username: string; joinedAt: string }>>([]);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/creator/referrals")
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (data) {
                    setReferralCode(data.referralCode ?? null);
                    setTotalReferred(data.totalReferred ?? 0);
                    setAllReferrals(data.recentReferrals ?? []);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const referralLink = referralCode
        ? `${typeof window !== "undefined" ? window.location.origin : ""}/sign-up?ref=${referralCode}`
        : null;

    const handleCopy = useCallback(() => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [referralLink]);

    return (
        <div className="card">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-primary-navy">Referral Program</h3>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                    <p className="text-xs text-green-700 mb-1">Users Referred</p>
                    <p className="text-3xl font-bold text-green-800">{loading ? "—" : totalReferred}</p>
                    <p className="text-xs text-green-600 mt-1">total sign-ups via your link</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Referral Earnings</p>
                    <p className="text-3xl font-bold text-gray-400">₹0</p>
                    <p className="text-xs text-gray-400 mt-1">rewards not yet enabled</p>
                </div>
            </div>

            {/* Referral link */}
            {loading ? (
                <div className="h-12 bg-gray-100 rounded-lg animate-pulse mb-4" />
            ) : referralLink ? (
                <div className="mb-6">
                    <p className="text-xs font-medium text-neutral-dark-gray mb-2">Your referral link</p>
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <code className="text-xs font-mono text-green-800 flex-1 break-all">{referralLink}</code>
                        <button
                            onClick={handleCopy}
                            className="shrink-0 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-md transition-colors"
                        >
                            {copied ? "✓ Copied!" : "Copy Link"}
                        </button>
                    </div>
                    <p className="text-xs text-neutral-dark-gray mt-1.5">
                        Code: <code className="font-mono font-semibold text-primary-navy">{referralCode}</code>
                    </p>
                </div>
            ) : (
                <p className="text-sm text-neutral-dark-gray mb-6">Referral code not available.</p>
            )}

            {/* Referred users list */}
            <div>
                <p className="text-sm font-medium text-primary-navy mb-3">
                    Users joined via your link
                    {totalReferred > 0 && (
                        <span className="ml-2 text-xs font-normal text-neutral-dark-gray">
                            (showing latest {Math.min(allReferrals.length, 5)})
                        </span>
                    )}
                </p>

                {loading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                        ))}
                    </div>
                ) : allReferrals.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
                        <p className="text-sm text-neutral-dark-gray">No referrals yet</p>
                        <p className="text-xs text-neutral-dark-gray mt-1">Share your link to start tracking sign-ups</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                        {allReferrals.map((r, i) => (
                            <div key={`${r.username}-${i}`} className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                        <span className="text-white text-xs font-semibold">
                                            {r.username[0].toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-primary-navy">@{r.username}</span>
                                </div>
                                <span className="text-xs text-neutral-dark-gray">
                                    {new Date(r.joinedAt).toLocaleDateString("en-IN", {
                                        day: "numeric", month: "short", year: "numeric",
                                    })}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
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
            { }
            <div>
                <h1 className="text-3xl font-bold text-primary-navy mb-2">
                    Creator Dashboard
                </h1>
                <p className="text-neutral-dark-gray">
                    Welcome back! Here&apos;s an overview of your creator performance.
                </p>
            </div>

            { }
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                <div className="card">
                    <h3 className="text-lg font-semibold text-primary-navy mb-2">
                        Avg. Watch Time
                    </h3>
                    <p className="text-2xl font-bold text-orange-500">
                        {(() => {
                            const s = stats.avgWatchTimeSeconds || 0;
                            if (s < 60) return `${s}s`;
                            const m = Math.floor(s / 60);
                            const rem = s % 60;
                            return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
                        })()}
                    </p>
                    <p className="text-sm text-neutral-dark-gray mt-1">
                        per session across videos &amp; series
                    </p>
                </div>
            </div>

            { }
            {process.env.NODE_ENV === 'development' && (
                <LayoutPersistenceDebug className="mb-6" />
            )}

            { }
            <SeriesQuickActions />

            { }
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">                { }
                <div className="card">
                    <h3 className="text-xl font-semibold text-primary-navy mb-4">
                        Quick Actions
                    </h3>
                    <div className="space-y-3">
                        <Link href="/creator/upload" className="w-full btn-primary flex items-center justify-center">
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
                        </Link>
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
                        <Link
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
                        </Link>
                        <Link
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
                        </Link>
                        <Link href="/creator/help" className="w-full btn-outline flex items-center justify-center border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300">
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
                        </Link>
                    </div>
                </div>

                { }
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

            { }
            <ReferralCard />
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