"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { CreatorProtectedRoute } from "@/components/layout/ProtectedRoute";
import { CoinBalance } from "@/components/wallet/CoinBalance";
import { WithdrawalForm } from "@/components/creator/WithdrawalForm";
import { WithdrawalHistory } from "@/components/creator/WithdrawalHistory";
import { coinsToRupees } from "@/lib/utils/coin-utils";
import dynamic from "next/dynamic";

interface EarningsData {
 totalCoinsEarned: number;
 totalCoinsEarnedRupees: number;
 monthlyCoinsEarned: number;
 monthlyCoinsEarnedRupees: number;
 availableCoins: number;
 availableCoinsRupees: number;
 coinsWithdrawn: number;
 coinsWithdrawnRupees: number;
 lastPayout: {
 coins: number;
 rupees: number;
 date: string;
 } | null;
 earningsHistory: Array<{
 id: string;
 coins: number;
 rupees: number;
 date: string;
 type: 'earn';
 description: string;
 contentType?: 'video' | 'series';
 contentId?: string;
 videoTitle?: string;
 }>;
}

function CreatorEarningsContent() {
 const { userProfile } = useAuthContext();
 const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
 const [refreshKey, setRefreshKey] = useState(0);

 useEffect(() => {
 const fetchEarningsData = async () => {
 try {
 setIsLoading(true);
 setError(null);
 
 const response = await fetch('/api/creator/earnings');
 const result = await response.json();
 
 if (!response.ok) {
 throw new Error(result.error || 'Failed to fetch earnings data');
 }
 
 if (result.success) {
 setEarningsData(result.data);
 } else {
 throw new Error('Failed to load earnings data');
 }
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Failed to load earnings data');
 console.error('Error fetching earnings:', err);
 } finally {
 setIsLoading(false);
 }
 };

 if (userProfile) {
 fetchEarningsData();
 }
 }, [userProfile, refreshKey]);

 const handleWithdrawalSuccess = (coins: number, rupees: number) => {
 setShowWithdrawalForm(false);
 setRefreshKey(prev => prev + 1);
 };

 if (isLoading) {
 return (
 <div className="space-y-6">
 <div className="animate-pulse">
 <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
 <div className="h-4 bg-gray-200 rounded w-1/2"></div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {[1, 2, 3].map((i) => (
 <div key={i} className="animate-pulse">
 <div className="h-32 bg-gray-200 rounded"></div>
 </div>
 ))}
 </div>
 </div>
 );
 }

 if (error) {
 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-3xl font-bold text-primary-navy mb-2">
 Earnings
 </h1>
 <p className="text-neutral-dark-gray">
 Track your earnings and payout history.
 </p>
 </div>
 <div className="text-center py-12">
 <p className="text-red-600 mb-4">{error}</p>
 <button
 onClick={() => window.location.reload()}
 className="btn-primary"
 >
 Try Again
 </button>
 </div>
 </div>
 );
 }

 if (!earningsData) {
 return null;
 }

 return (
 <div className="space-y-6">
 {}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold text-primary-navy mb-2">
 Earnings
 </h1>
 <p className="text-neutral-dark-gray">
 Track your coin earnings and request withdrawals.
 </p>
 </div>
 {!showWithdrawalForm && earningsData && earningsData.availableCoins >= 2000 && (
 <button
 onClick={() => setShowWithdrawalForm(true)}
 className="btn-primary"
 >
 Request Withdrawal
 </button>
 )}
 </div>

 {}
 {showWithdrawalForm && earningsData && (
 <div className="card">
 <WithdrawalForm
 availableCoins={earningsData.availableCoins}
 onWithdrawalSuccess={handleWithdrawalSuccess}
 onCancel={() => setShowWithdrawalForm(false)}
 />
 </div>
 )}

 {}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="card">
 <h3 className="text-lg font-semibold text-primary-navy mb-2">
 Total Coins Earned
 </h3>
 <div className="mb-2">
 <CoinBalance 
 balance={earningsData.totalCoinsEarned || 0} 
 size="large" 
 />
 </div>
 <p className="text-sm text-accent-green font-medium">
 ≈ ₹{coinsToRupees(earningsData.totalCoinsEarned || 0).toFixed(2)}
 </p>
 <p className="text-xs text-neutral-dark-gray mt-1">
 All time earnings
 </p>
 </div>

 <div className="card">
 <h3 className="text-lg font-semibold text-primary-navy mb-2">
 This Month
 </h3>
 <div className="mb-2">
 <CoinBalance 
 balance={earningsData.monthlyCoinsEarned || 0} 
 size="large" 
 />
 </div>
 <p className="text-sm text-accent-teal font-medium">
 ≈ ₹{coinsToRupees(earningsData.monthlyCoinsEarned || 0).toFixed(2)}
 </p>
 <p className="text-xs text-neutral-dark-gray mt-1">
 Current month earnings
 </p>
 </div>

 <div className="card">
 <h3 className="text-lg font-semibold text-primary-navy mb-2">
 Available Balance
 </h3>
 <div className="mb-2">
 <CoinBalance 
 balance={earningsData.availableCoins || 0} 
 size="large" 
 />
 </div>
 <p className="text-sm text-accent-pink font-medium">
 ≈ ₹{coinsToRupees(earningsData.availableCoins || 0).toFixed(2)}
 </p>
 <p className="text-xs text-neutral-dark-gray mt-1">
 Available for withdrawal
 </p>
 </div>
 </div>

 {}
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
 <div className="flex items-start gap-3">
 <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <div>
 <p className="text-sm text-blue-800 font-medium mb-1">
 Coin to Rupee Conversion
 </p>
 <p className="text-sm text-blue-700">
 1 coin = ₹0.05 • 20 coins = ₹1 • Minimum withdrawal: 2,000 coins (₹100)
 </p>
 </div>
 </div>
 </div>

 {}
 {earningsData.lastPayout && (
 <div className="card">
 <h3 className="text-xl font-semibold text-primary-navy mb-4">
 Last Withdrawal
 </h3>
 <div className="flex items-center justify-between">
 <div>
 <div className="flex items-center gap-3 mb-2">
 <CoinBalance balance={earningsData.lastPayout.coins} size="medium" />
 <span className="text-neutral-dark-gray">→</span>
 <span className="text-lg font-bold text-accent-green">
 ₹{earningsData.lastPayout.rupees.toFixed(2)}
 </span>
 </div>
 <p className="text-sm text-neutral-dark-gray">
 Paid on {new Date(earningsData.lastPayout.date).toLocaleDateString('en-IN', {
 day: 'numeric',
 month: 'long',
 year: 'numeric'
 })}
 </p>
 </div>
 </div>
 </div>
 )}

 {}
 <div className="card">
 <h3 className="text-xl font-semibold text-primary-navy mb-4">
 Recent Earnings
 </h3>
 <div className="space-y-4">
 {earningsData.earningsHistory.length === 0 ? (
 <div className="text-center py-8 text-neutral-dark-gray">
 <p>No earnings yet</p>
 <p className="text-sm mt-2">Start creating content to earn coins!</p>
 </div>
 ) : (
 earningsData.earningsHistory.map((earning) => (
 <div key={earning.id} className="flex items-center justify-between py-3 border-b border-neutral-light-gray last:border-b-0">
 <div className="flex-1">
 <p className="font-medium text-primary-navy">
 {earning.description}
 </p>
 <p className="text-sm text-neutral-dark-gray">
 {new Date(earning.date).toLocaleDateString('en-IN', {
 day: 'numeric',
 month: 'short',
 year: 'numeric'
 })}
 {earning.videoTitle && ` • ${earning.videoTitle}`}
 </p>
 </div>
 <div className="text-right">
 <CoinBalance balance={earning.coins} size="small" />
 <p className="text-xs text-accent-green mt-1">
 +₹{earning.rupees.toFixed(2)}
 </p>
 </div>
 </div>
 ))
 )}
 </div>
 {earningsData.earningsHistory.length > 0 && (
 <div className="mt-6 text-center">
 <button className="btn-outline">
 View All Earnings
 </button>
 </div>
 )}
 </div>

 {}
 {!showWithdrawalForm && (
 <div className="card">
 <WithdrawalHistory limit={5} />
 </div>
 )}

 {}
 <div className="card">
 <h3 className="text-xl font-semibold text-primary-navy mb-4">
 Payout Settings
 </h3>
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium text-primary-navy">Minimum Payout</p>
 <p className="text-sm text-neutral-dark-gray">2,000 coins (₹100.00)</p>
 </div>
 </div>
 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium text-primary-navy">Payment Method</p>
 <p className="text-sm text-neutral-dark-gray">Bank Transfer</p>
 </div>
 <button className="btn-outline">
 Change
 </button>
 </div>
 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium text-primary-navy">Processing Time</p>
 <p className="text-sm text-neutral-dark-gray">3-5 business days</p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

function CreatorEarningsPage() {
 return (
 <CreatorProtectedRoute>
 <CreatorEarningsContent />
 </CreatorProtectedRoute>
 );
}

export default CreatorEarningsPage;