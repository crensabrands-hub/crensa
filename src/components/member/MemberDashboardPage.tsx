"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { MemberStatsCards } from "./MemberStatsCards";
import { MemberQuickActions } from "./MemberQuickActions";
import { MemberRecentActivity } from "./MemberRecentActivity";
import { FollowedCreatorsSection } from "./FollowedCreatorsSection";
import { VisitHistory } from "./VisitHistory";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import CoinBalance from "@/components/wallet/CoinBalance";
import CoinPurchaseModal from "@/components/wallet/CoinPurchaseModal";
import { CoinTransactionHistory } from "@/components/wallet/CoinTransactionHistory";

interface MemberStats {
 totalVideosWatched: number;
 totalCreditsSpent: number;
 followedCreatorsCount: number;
 favoriteCategory: string;
 monthlyGrowth: {
 videosWatched: number;
 creditsSpent: number;
 newFollows: number;
 };
}

interface MemberActivity {
 id: string;
 type: "video_watch" | "creator_follow" | "credit_purchase" | "profile_visit";
 title: string;
 description: string;
 timestamp: Date;
 metadata?: any;
}

interface MemberDashboardData {
 stats: MemberStats;
 recentActivity: MemberActivity[];
 followedCreators: any[];
 recommendations: any[];
}

export function MemberDashboardPage() {
 const { userProfile } = useAuthContext();
 const [dashboardData, setDashboardData] =
 useState<MemberDashboardData | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [coinBalance, setCoinBalance] = useState<number>(0);
 const [showPurchaseModal, setShowPurchaseModal] = useState(false);
 const [showTransactionHistory, setShowTransactionHistory] = useState(false);

 useEffect(() => {
 const fetchDashboardData = async () => {
 try {
 setLoading(true);
 setError(null);

 const response = await fetch("/api/member/dashboard");
 const result = await response.json();

 if (!response.ok) {
 throw new Error(result.error || "Failed to fetch dashboard data");
 }

 if (result.success) {

 const processedData = {
 ...result.data,
 recentActivity: result.data.recentActivity.map((activity: any) => ({
 ...activity,
 timestamp: new Date(activity.timestamp),
 })),
 };
 setDashboardData(processedData);
 } else {
 throw new Error("Failed to load dashboard data");
 }
 } catch (err) {
 console.error("Error fetching dashboard data:", err);
 setError(err instanceof Error ? err.message : "Unknown error occurred");
 } finally {
 setLoading(false);
 }
 };

 if (userProfile) {
 fetchDashboardData();
 }
 }, [userProfile]);

 useEffect(() => {
 const fetchCoinBalance = async () => {
 try {
 const response = await fetch("/api/coins/balance");
 if (response.ok) {
 const data = await response.json();
 setCoinBalance(data.balance || 0);
 }
 } catch (err) {
 console.error("Error fetching coin balance:", err);
 }
 };

 if (userProfile) {
 fetchCoinBalance();
 }
 }, [userProfile]);

 const handlePurchaseComplete = (coins: number) => {

 setCoinBalance((prev) => prev + coins);
 };

 const handleBalanceClick = () => {
 setShowTransactionHistory(true);
 };

 if (loading) {
 return (
 <LoadingScreen
 message="Loading member dashboard..."
 variant="dashboard"
 fullScreen={false}
 />
 );
 }

 if (error) {
 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-3xl font-bold text-primary-navy mb-2">
 Member Dashboard
 </h1>
 <p className="text-neutral-dark-gray">
 Welcome back! Here&apos;s your personalized member experience.
 </p>
 </div>
 <div className="bg-red-50 border border-red-200 rounded-lg p-6">
 <div className="flex items-center space-x-3">
 <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
 <svg
 className="w-4 h-4 text-red-600"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
 />
 </svg>
 </div>
 <div>
 <h3 className="text-lg font-semibold text-red-800">
 Error Loading Dashboard
 </h3>
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
 Member Dashboard
 </h1>
 <p className="text-neutral-dark-gray">
 Welcome back! Here&apos;s your personalized member experience.
 </p>
 </div>
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
 <p className="text-center text-neutral-dark-gray">
 No dashboard data available.
 </p>
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
 Member Dashboard
 </h1>
 <p className="text-neutral-dark-gray">
 Welcome back, {userProfile?.username || "Member"}! Here&apos;s your
 personalized experience.
 </p>
 </div>

 {}
 <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6">
 <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
 <div className="flex-1">
 <p className="text-purple-100 text-sm font-medium mb-2">
 Your Coin Balance
 </p>
 <div 
 onClick={handleBalanceClick}
 className="cursor-pointer hover:opacity-90 transition-opacity"
 role="button"
 tabIndex={0}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 handleBalanceClick();
 }
 }}
 >
 <CoinBalance
 balance={coinBalance}
 size="large"
 showRupeeEquivalent
 className="text-white"
 />
 </div>
 <p className="text-purple-200 text-xs mt-2">
 Click to view transaction history
 </p>
 </div>
 <button
 onClick={() => setShowPurchaseModal(true)}
 className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors shadow-md flex items-center gap-2"
 >
 <span className="text-xl">💰</span>
 Purchase Coins
 </button>
 </div>
 </div>

 {}
 <MemberStatsCards stats={stats} />

 {}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {}
 <MemberQuickActions />

 {}
 <MemberRecentActivity activities={recentActivity} />
 </div>

 {}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {}
 <FollowedCreatorsSection />

 {}
 <VisitHistory limit={8} />
 </div>

 {}
 <CoinPurchaseModal
 isOpen={showPurchaseModal}
 onClose={() => setShowPurchaseModal(false)}
 onPurchaseComplete={handlePurchaseComplete}
 currentBalance={coinBalance}
 />

 {}
 {showTransactionHistory && (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
 <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
 <div className="p-4 border-b border-gray-200 flex items-center justify-between">
 <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
 <button
 onClick={() => setShowTransactionHistory(false)}
 className="text-gray-500 hover:text-gray-700 transition-colors"
 aria-label="Close"
 >
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>
 <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
 <CoinTransactionHistory />
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
