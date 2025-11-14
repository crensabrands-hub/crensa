'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Series } from '@/types';
import SeriesCard from './SeriesCard';

interface SeriesGridProps {
 series: Series[];
 isLoading?: boolean;
 onSeriesClick?: (series: Series) => void;
 onLoadMore?: () => void;
 hasMore?: boolean;
 isLoadingMore?: boolean;
 className?: string;
}

export default function SeriesGrid({
 series,
 isLoading = false,
 onSeriesClick,
 onLoadMore,
 hasMore = false,
 isLoadingMore = false,
 className = ''
}: SeriesGridProps) {
 const [hoveredSeriesId, setHoveredSeriesId] = useState<string | null>(null);

 if (isLoading) {
 return (
 <div className={`space-y-6 sm:space-y-8 ${className}`}>
 <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
 {Array.from({ length: 12 }).map((_, index) => (
 <div key={`skeleton-${index}`} className="animate-pulse">
 <div className="aspect-video bg-neutral-light-gray rounded-lg mb-3"></div>
 <div className="space-y-2">
 <div className="h-4 bg-neutral-light-gray rounded w-3/4"></div>
 <div className="h-3 bg-neutral-light-gray rounded w-full"></div>
 <div className="h-3 bg-neutral-light-gray rounded w-1/2"></div>
 <div className="h-3 bg-neutral-light-gray rounded w-2/3"></div>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
 }

 if (!series || series.length === 0) {
 return (
 <div className="text-center py-12">
 <div className="w-24 h-24 bg-neutral-light-gray rounded-full flex items-center justify-center mx-auto mb-4">
 <svg 
 className="w-12 h-12 text-neutral-dark-gray" 
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
 </div>
 <h3 className="text-xl font-semibold text-primary-navy mb-2">
 No series found
 </h3>
 <p className="text-neutral-dark-gray mb-6">
 Try adjusting your search terms or filters to find more series
 </p>
 <button className="px-6 py-3 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors">
 Clear Filters
 </button>
 </div>
 );
 }

 return (
 <div className={`space-y-6 sm:space-y-8 ${className}`}>
 {}
 <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
 {series.map((seriesItem, index) => (
 <motion.div
 key={seriesItem.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ 
 duration: 0.4, 
 delay: index * 0.05,
 ease: "easeOut"
 }}
 onHoverStart={() => setHoveredSeriesId(seriesItem.id)}
 onHoverEnd={() => setHoveredSeriesId(null)}
 className="w-full"
 >
 <SeriesCard
 series={seriesItem}
 isHovered={hoveredSeriesId === seriesItem.id}
 onClick={() => onSeriesClick?.(seriesItem)}
 />
 </motion.div>
 ))}
 </div>

 {}
 {hasMore && onLoadMore && (
 <div className="text-center pt-6 sm:pt-8">
 <button
 onClick={onLoadMore}
 disabled={isLoadingMore}
 className="px-6 sm:px-8 py-3 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto min-w-[140px] sm:min-w-[160px] min-h-[44px] text-sm sm:text-base"
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 }}
 >
 {isLoadingMore ? (
 <>
 <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-primary-navy mr-2"></div>
 Loading...
 </>
 ) : (
 'Load More Series'
 )}
 </button>
 </div>
 )}

 {}
 {isLoadingMore && (
 <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-6">
 {Array.from({ length: 8 }).map((_, index) => (
 <div key={`loading-${index}`} className="animate-pulse">
 <div className="aspect-video bg-neutral-light-gray rounded-lg mb-3"></div>
 <div className="space-y-2">
 <div className="h-4 bg-neutral-light-gray rounded w-3/4"></div>
 <div className="h-3 bg-neutral-light-gray rounded w-full"></div>
 <div className="h-3 bg-neutral-light-gray rounded w-1/2"></div>
 <div className="h-3 bg-neutral-light-gray rounded w-2/3"></div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 );
}