'use client';

import { useState } from 'react';
import { useTrendingShows } from '@/hooks/useTrendingShows';
import TrendingShowCard from '@/components/landing/TrendingShowCard';
import { ContentErrorBoundary } from '@/components/ContentErrorBoundary';
import { ChevronLeft, Filter, Grid, List, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ITEMS_PER_PAGE = 20;

export default function TrendingShowsPage() {
 const router = useRouter();
 const [currentPage, setCurrentPage] = useState(1);
 const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
 const [filterType, setFilterType] = useState<'all' | 'video' | 'series'>('all');

 const limit = currentPage * ITEMS_PER_PAGE;
 const { trendingShows, loading, error, refetch } = useTrendingShows(limit);

 const filteredShows = trendingShows.filter(show => 
 filterType === 'all' || show.type === filterType
 );

 const hasMorePages = trendingShows.length === limit;

 const handleLoadMore = () => {
 setCurrentPage(prev => prev + 1);
 };

 const handleFilterChange = (type: 'all' | 'video' | 'series') => {
 setFilterType(type);
 setCurrentPage(1);
 };

 return (
 <div className="min-h-screen bg-gradient-to-br from-neutral-white to-neutral-gray/10">
 {}
 <div className="bg-neutral-white border-b border-neutral-gray/20">
 <div className="container mx-auto px-4 py-6">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <button
 onClick={() => router.back()}
 className="p-2 hover:bg-neutral-gray/10 rounded-lg transition-colors"
 >
 <ChevronLeft className="w-5 h-5 text-neutral-dark" />
 </button>
 <div>
 <h1 className="text-2xl md:text-3xl font-bold text-primary-navy">
 Trending Shows & Series
 </h1>
 <p className="text-neutral-dark mt-1">
 Discover the hottest content on Crensa
 </p>
 </div>
 </div>

 {}
 <div className="hidden md:flex items-center gap-2 bg-neutral-gray/10 rounded-lg p-1">
 <button
 onClick={() => setViewMode('grid')}
 className={`p-2 rounded transition-colors ${
 viewMode === 'grid' 
 ? 'bg-neutral-white shadow-sm text-primary-navy' 
 : 'text-neutral-dark hover:text-primary-navy'
 }`}
 >
 <Grid className="w-4 h-4" />
 </button>
 <button
 onClick={() => setViewMode('list')}
 className={`p-2 rounded transition-colors ${
 viewMode === 'list' 
 ? 'bg-neutral-white shadow-sm text-primary-navy' 
 : 'text-neutral-dark hover:text-primary-navy'
 }`}
 >
 <List className="w-4 h-4" />
 </button>
 </div>
 </div>
 </div>
 </div>

 <div className="container mx-auto px-4 py-8">
 {}
 <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
 <div className="flex items-center gap-2">
 <Filter className="w-5 h-5 text-neutral-dark" />
 <span className="text-neutral-dark font-medium">Filter by:</span>
 <div className="flex gap-2">
 {[
 { key: 'all', label: 'All Content' },
 { key: 'video', label: 'Videos' },
 { key: 'series', label: 'Series' }
 ].map(({ key, label }) => (
 <button
 key={key}
 onClick={() => handleFilterChange(key as any)}
 className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
 filterType === key
 ? 'bg-primary-navy text-neutral-white'
 : 'bg-neutral-gray/20 text-neutral-dark hover:bg-neutral-gray/30'
 }`}
 >
 {label}
 </button>
 ))}
 </div>
 </div>

 {}
 <div className="text-sm text-neutral-dark">
 {loading ? 'Loading...' : `${filteredShows.length} shows found`}
 </div>
 </div>

 {}
 <ContentErrorBoundary sectionName="trending-shows-list">
 {loading && currentPage === 1 ? (

 <div className={`grid gap-6 ${
 viewMode === 'grid' 
 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
 : 'grid-cols-1'
 }`}>
 {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
 <div key={index} className="animate-pulse">
 <div className="bg-neutral-gray/20 rounded-xl overflow-hidden">
 <div className={`bg-neutral-gray/40 ${
 viewMode === 'grid' ? 'aspect-video' : 'h-32'
 }`}></div>
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
 ) : error ? (

 <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
 <div className="text-red-600 mb-4">
 <p className="font-semibold text-lg">Failed to load trending shows</p>
 <p className="text-sm mt-2">{error}</p>
 </div>
 <button
 onClick={refetch}
 className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
 >
 <RefreshCw className="w-4 h-4" />
 Try Again
 </button>
 </div>
 ) : filteredShows.length === 0 ? (

 <div className="bg-neutral-gray/10 rounded-xl p-12 text-center">
 <p className="text-neutral-dark text-xl mb-2">No shows found</p>
 <p className="text-neutral-dark/70 mb-6">
 {filterType === 'all' 
 ? 'No trending shows available at the moment'
 : `No trending ${filterType}s found with current filters`
 }
 </p>
 {filterType !== 'all' && (
 <button
 onClick={() => handleFilterChange('all')}
 className="px-4 py-2 bg-primary-navy text-neutral-white rounded-lg hover:bg-primary-navy/90 transition-colors"
 >
 Show All Content
 </button>
 )}
 </div>
 ) : (

 <>
 <div className={`grid gap-6 ${
 viewMode === 'grid' 
 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
 : 'grid-cols-1 max-w-4xl mx-auto'
 }`}>
 {filteredShows.map((show) => (
 <TrendingShowCard
 key={`${show.type}-${show.id}`}
 show={show}
 className={viewMode === 'list' ? 'flex-row' : ''}
 />
 ))}
 </div>

 {}
 {hasMorePages && (
 <div className="text-center mt-12">
 <button
 onClick={handleLoadMore}
 disabled={loading}
 className="inline-flex items-center gap-2 px-8 py-3 bg-primary-navy text-neutral-white rounded-lg hover:bg-primary-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? (
 <>
 <RefreshCw className="w-5 h-5 animate-spin" />
 Loading...
 </>
 ) : (
 'Load More Shows'
 )}
 </button>
 </div>
 )}
 </>
 )}
 </ContentErrorBoundary>

 {}
 <div className="text-center mt-12 pt-8 border-t border-neutral-gray/20">
 <Link
 href="/"
 className="inline-flex items-center gap-2 text-primary-navy hover:text-accent-pink transition-colors"
 >
 <ChevronLeft className="w-4 h-4" />
 Back to Home
 </Link>
 </div>
 </div>
 </div>
 );
}