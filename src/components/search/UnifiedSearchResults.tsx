'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Series, Video } from '@/types';
import { SeriesCard, SeriesGrid } from '@/components/series';
import { VideoCard, VideoGrid } from '@/components/discover';

interface UnifiedSearchResultsProps {
 videos: Video[];
 series: Series[];
 isLoading?: boolean;
 onVideoClick?: (video: Video) => void;
 onSeriesClick?: (series: Series) => void;
 onLoadMore?: () => void;
 hasMore?: boolean;
 isLoadingMore?: boolean;
 activeTab?: 'all' | 'videos' | 'series';
 onTabChange?: (tab: 'all' | 'videos' | 'series') => void;
 className?: string;
}

export default function UnifiedSearchResults({
 videos,
 series,
 isLoading = false,
 onVideoClick,
 onSeriesClick,
 onLoadMore,
 hasMore = false,
 isLoadingMore = false,
 activeTab = 'all',
 onTabChange,
 className = ''
}: UnifiedSearchResultsProps) {
 const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

 const totalResults = videos.length + series.length;

 if (isLoading) {
 return (
 <div className={`space-y-6 ${className}`}>
 {}
 <div className="flex space-x-1 bg-neutral-light-gray/50 rounded-lg p-1">
 {['All', 'Videos', 'Series'].map((tab, index) => (
 <div key={index} className="flex-1 h-10 bg-neutral-light-gray rounded animate-pulse" />
 ))}
 </div>
 
 {}
 <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
 {Array.from({ length: 12 }).map((_, index) => (
 <div key={`skeleton-${index}`} className="animate-pulse">
 <div className="aspect-video bg-neutral-light-gray rounded-lg mb-3"></div>
 <div className="space-y-2">
 <div className="h-4 bg-neutral-light-gray rounded w-3/4"></div>
 <div className="h-3 bg-neutral-light-gray rounded w-full"></div>
 <div className="h-3 bg-neutral-light-gray rounded w-1/2"></div>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
 }

 if (!isLoading && totalResults === 0) {
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
 d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
 />
 </svg>
 </div>
 <h3 className="text-xl font-semibold text-primary-navy mb-2">
 No results found
 </h3>
 <p className="text-neutral-dark-gray mb-6">
 Try adjusting your search terms or filters to find more content
 </p>
 <button 
 onClick={() => onTabChange?.('all')}
 className="px-6 py-3 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors"
 >
 Clear Filters
 </button>
 </div>
 );
 }

 const getFilteredContent = () => {
 switch (activeTab) {
 case 'videos':
 return { videos, series: [] };
 case 'series':
 return { videos: [], series };
 default:
 return { videos, series };
 }
 };

 const { videos: filteredVideos, series: filteredSeries } = getFilteredContent();
 const filteredTotal = filteredVideos.length + filteredSeries.length;

 return (
 <div className={`space-y-6 ${className}`}>
 {}
 {onTabChange && (
 <div className="flex space-x-1 bg-neutral-light-gray/50 rounded-lg p-1">
 <button
 onClick={() => onTabChange('all')}
 className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
 activeTab === 'all'
 ? 'bg-white text-primary-navy shadow-sm'
 : 'text-neutral-dark-gray hover:text-primary-navy'
 }`}
 >
 All ({totalResults})
 </button>
 
 <button
 onClick={() => onTabChange('videos')}
 className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
 activeTab === 'videos'
 ? 'bg-white text-primary-navy shadow-sm'
 : 'text-neutral-dark-gray hover:text-primary-navy'
 }`}
 >
 Videos ({videos.length})
 </button>
 
 <button
 onClick={() => onTabChange('series')}
 className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
 activeTab === 'series'
 ? 'bg-white text-primary-navy shadow-sm'
 : 'text-neutral-dark-gray hover:text-primary-navy'
 }`}
 >
 Series ({series.length})
 </button>
 </div>
 )}

 {}
 <div className="flex items-center justify-between">
 <p className="text-sm text-neutral-dark-gray">
 Showing {filteredTotal} result{filteredTotal !== 1 ? 's' : ''}
 {activeTab !== 'all' && (
 <span className="ml-1">
 in {activeTab === 'videos' ? 'Videos' : 'Series'}
 </span>
 )}
 </p>
 </div>

 {}
 <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
 {}
 {filteredSeries.map((seriesItem, index) => (
 <motion.div
 key={`series-${seriesItem.id}`}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ 
 duration: 0.4, 
 delay: index * 0.05,
 ease: "easeOut"
 }}
 onHoverStart={() => setHoveredItemId(`series-${seriesItem.id}`)}
 onHoverEnd={() => setHoveredItemId(null)}
 className="w-full"
 >
 <SeriesCard
 series={seriesItem}
 isHovered={hoveredItemId === `series-${seriesItem.id}`}
 onClick={() => onSeriesClick?.(seriesItem)}
 />
 </motion.div>
 ))}

 {}
 {filteredVideos.map((video, index) => (
 <motion.div
 key={`video-${video.id}`}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ 
 duration: 0.4, 
 delay: (filteredSeries.length + index) * 0.05,
 ease: "easeOut"
 }}
 onHoverStart={() => setHoveredItemId(`video-${video.id}`)}
 onHoverEnd={() => setHoveredItemId(null)}
 className="w-full"
 >
 <VideoCard
 video={video}
 isHovered={hoveredItemId === `video-${video.id}`}
 onClick={() => onVideoClick?.(video)}
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
 'Load More Results'
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
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 );
}