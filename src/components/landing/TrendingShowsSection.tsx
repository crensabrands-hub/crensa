'use client';

import { useTrendingShows } from '@/hooks/useTrendingShows';
import TrendingShowCard from './TrendingShowCard';
import { ChevronRight, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TrendingShowsSectionProps {
 limit?: number;
 showViewMore?: boolean;
 className?: string;
}

export default function TrendingShowsSection({ 
 limit = 8, 
 showViewMore = true,
 className = '' 
}: TrendingShowsSectionProps) {
 const { trendingShows, loading, error, refetch } = useTrendingShows(limit);
 const router = useRouter();

 const handleViewMore = () => {
 router.push('/trending-shows');
 };

 if (loading) {
 return (
 <div className={`${className}`}>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {Array.from({ length: limit }).map((_, index) => (
 <div key={index} className="animate-pulse" data-testid="skeleton-loader">
 <div className="bg-neutral-gray/20 rounded-xl overflow-hidden">
 <div className="aspect-video bg-neutral-gray/40"></div>
 <div className="p-4 space-y-3">
 <div className="h-4 bg-neutral-gray/40 rounded w-3/4"></div>
 <div className="h-3 bg-neutral-gray/30 rounded w-1/2"></div>
 <div className="flex justify-between">
 <div className="h-3 bg-neutral-gray/30 rounded w-1/4"></div>
 <div className="h-3 bg-neutral-gray/30 rounded w-1/4"></div>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
 }

 if (error) {
 return (
 <div className={`${className}`}>
 <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
 <div className="text-red-600 mb-4">
 <p className="font-semibold">Failed to load trending shows</p>
 <p className="text-sm mt-1">{error}</p>
 </div>
 <button
 onClick={refetch}
 className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
 >
 <RefreshCw className="w-4 h-4" />
 Try Again
 </button>
 </div>
 </div>
 );
 }

 if (trendingShows.length === 0) {
 return (
 <div className={`${className}`}>
 <div className="bg-neutral-gray/10 rounded-xl p-8 text-center">
 <p className="text-neutral-dark text-lg">No trending shows available at the moment</p>
 <p className="text-neutral-dark/70 text-sm mt-2">Check back later for fresh content!</p>
 </div>
 </div>
 );
 }

 return (
 <div className={`${className}`}>
 {}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
 {trendingShows.map((show) => (
 <div key={`${show.type}-${show.id}`} className="h-full">
 <TrendingShowCard
 show={show}
 className="h-full"
 />
 </div>
 ))}
 </div>

 {}
 {showViewMore && (
 <div className="text-center">
 <button
 onClick={handleViewMore}
 className="inline-flex items-center gap-2 px-6 py-3 bg-primary-navy text-neutral-white rounded-lg hover:bg-primary-navy/90 transition-colors font-semibold"
 >
 View More Shows
 <ChevronRight className="w-5 h-5" />
 </button>
 </div>
 )}
 </div>
 );
}