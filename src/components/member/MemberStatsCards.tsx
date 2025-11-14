"use client";

import CoinBalance from "@/components/wallet/CoinBalance";

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

interface MemberStatsCardsProps {
 stats: MemberStats;
}

export function MemberStatsCards({ stats }: MemberStatsCardsProps) {
 const formatGrowth = (value: number) => {
 const sign = value > 0 ? '+' : '';
 return `${sign}${value}`;
 };

 const getGrowthColor = (value: number) => {
 if (value > 0) return 'text-accent-green';
 if (value < 0) return 'text-red-500';
 return 'text-neutral-dark-gray';
 };

 const getGrowthIcon = (value: number) => {
 if (value > 0) {
 return (
 <svg className="w-4 h-4 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
 </svg>
 );
 }
 if (value < 0) {
 return (
 <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
 </svg>
 );
 }
 return (
 <svg className="w-4 h-4 text-neutral-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
 </svg>
 );
 };

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <div className="card card-hover">
 <div className="flex items-center justify-between mb-2">
 <h3 className="text-lg font-semibold text-primary-navy">
 Videos Watched
 </h3>
 <div className="w-8 h-8 bg-accent-teal/10 rounded-lg flex items-center justify-center">
 <svg className="w-4 h-4 text-accent-teal" fill="currentColor" viewBox="0 0 24 24">
 <path d="M8 5v14l11-7z"/>
 </svg>
 </div>
 </div>
 <p className="text-2xl font-bold text-accent-teal mb-2">
 {stats.totalVideosWatched.toLocaleString()}
 </p>
 <div className="flex items-center space-x-1">
 {getGrowthIcon(stats.monthlyGrowth.videosWatched)}
 <p className={`text-sm ${getGrowthColor(stats.monthlyGrowth.videosWatched)}`}>
 {formatGrowth(stats.monthlyGrowth.videosWatched)} from last month
 </p>
 </div>
 </div>

 <div className="card card-hover">
 <div className="flex items-center justify-between mb-2">
 <h3 className="text-lg font-semibold text-primary-navy">
 Coins Spent
 </h3>
 <div className="w-8 h-8 bg-accent-pink/10 rounded-lg flex items-center justify-center">
 <span className="text-lg" role="img" aria-label="coins">🪙</span>
 </div>
 </div>
 <div className="mb-2">
 <CoinBalance 
 balance={stats.totalCreditsSpent} 
 size="medium"
 showRupeeEquivalent
 animated={false}
 />
 </div>
 <div className="flex items-center space-x-1">
 {getGrowthIcon(stats.monthlyGrowth.creditsSpent)}
 <p className={`text-sm ${getGrowthColor(stats.monthlyGrowth.creditsSpent)}`}>
 {formatGrowth(stats.monthlyGrowth.creditsSpent)} from last month
 </p>
 </div>
 </div>

 <div className="card card-hover">
 <div className="flex items-center justify-between mb-2">
 <h3 className="text-lg font-semibold text-primary-navy">
 Following
 </h3>
 <div className="w-8 h-8 bg-accent-green/10 rounded-lg flex items-center justify-center">
 <svg className="w-4 h-4 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
 </svg>
 </div>
 </div>
 <p className="text-2xl font-bold text-accent-green mb-2">
 {stats.followedCreatorsCount}
 </p>
 <div className="flex items-center space-x-1">
 {getGrowthIcon(stats.monthlyGrowth.newFollows)}
 <p className={`text-sm ${getGrowthColor(stats.monthlyGrowth.newFollows)}`}>
 {formatGrowth(stats.monthlyGrowth.newFollows)} from last month
 </p>
 </div>
 </div>

 <div className="card card-hover">
 <div className="flex items-center justify-between mb-2">
 <h3 className="text-lg font-semibold text-primary-navy">
 Favorite Category
 </h3>
 <div className="w-8 h-8 bg-primary-neon-yellow/10 rounded-lg flex items-center justify-center">
 <svg className="w-4 h-4 text-primary-neon-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
 </svg>
 </div>
 </div>
 <p className="text-2xl font-bold text-primary-neon-yellow capitalize mb-2">
 {stats.favoriteCategory || 'Exploring'}
 </p>
 <p className="text-sm text-neutral-dark-gray">
 {stats.favoriteCategory ? 'Most watched content' : 'Discover your interests'}
 </p>
 </div>
 </div>
 );
}