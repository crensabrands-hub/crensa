'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Series, Video, Category } from '@/types';
import { UnifiedSearchResults, SeriesSearchFilters } from '@/components/search';
import type { SeriesSearchFiltersType } from '@/components/search';

interface SearchResponse {
 success: boolean;
 results: {
 videos: Video[];
 series: Series[];
 combined: (Video | Series)[];
 };
 counts: {
 videos: number;
 series: number;
 total: number;
 };
 pagination: {
 total: number;
 limit: number;
 offset: number;
 page: number;
 totalPages: number;
 hasMore: boolean;
 hasPrev: boolean;
 };
 filters: {
 query: string;
 category?: string;
 creatorId?: string;
 contentType: string;
 minPrice: number;
 maxPrice: number;
 sortBy: string;
 };
}

export default function SearchPage() {
 const searchParams = useSearchParams();
 const router = useRouter();
 
 const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
 const [categories, setCategories] = useState<Category[]>([]);
 const [isLoading, setIsLoading] = useState(false);
 const [isLoadingMore, setIsLoadingMore] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'series'>('all');

 const [filters, setFilters] = useState<SeriesSearchFiltersType>({
 query: searchParams.get('q') || '',
 category: searchParams.get('category') || undefined,
 priceRange: searchParams.get('minPrice') || searchParams.get('maxPrice') ? {
 min: parseInt(searchParams.get('minPrice') || '0'),
 max: parseInt(searchParams.get('maxPrice') || '10000')
 } : undefined,
 sortBy: (searchParams.get('sortBy') as SeriesSearchFiltersType['sortBy']) || 'newest',
 contentType: (searchParams.get('type') as SeriesSearchFiltersType['contentType']) || 'all'
 });

 useEffect(() => {
 const loadCategories = async () => {
 try {
 const response = await fetch('/api/landing/categories');
 if (response.ok) {
 const data = await response.json();
 setCategories(data.categories || []);
 }
 } catch (error) {
 console.error('Failed to load categories:', error);
 }
 };

 loadCategories();
 }, []);

 const performSearch = useCallback(async (loadMore = false) => {
 if (!filters.query.trim() && !filters.category && !filters.priceRange) {
 setSearchResults(null);
 return;
 }

 const isLoadingMoreData = loadMore && searchResults;
 if (isLoadingMoreData) {
 setIsLoadingMore(true);
 } else {
 setIsLoading(true);
 }
 
 setError(null);

 try {
 const params = new URLSearchParams();
 
 if (filters.query.trim()) {
 params.set('q', filters.query.trim());
 }
 
 if (filters.category) {
 params.set('category', filters.category);
 }
 
 if (filters.priceRange) {
 params.set('minPrice', filters.priceRange.min.toString());
 params.set('maxPrice', filters.priceRange.max.toString());
 }
 
 params.set('sortBy', filters.sortBy);
 params.set('type', filters.contentType);
 params.set('limit', '20');
 
 if (isLoadingMoreData && searchResults) {
 params.set('offset', (searchResults.results.videos.length + searchResults.results.series.length).toString());
 } else {
 params.set('offset', '0');
 }

 const response = await fetch(`/api/search?${params.toString()}`);
 
 if (!response.ok) {
 throw new Error('Search failed');
 }

 const data: SearchResponse = await response.json();
 
 if (isLoadingMoreData && searchResults) {

 setSearchResults({
 ...data,
 results: {
 videos: [...searchResults.results.videos, ...data.results.videos],
 series: [...searchResults.results.series, ...data.results.series],
 combined: [...searchResults.results.combined, ...data.results.combined]
 }
 });
 } else {
 setSearchResults(data);
 }

 const newUrl = new URL(window.location.href);
 newUrl.pathname = '/search';
 newUrl.search = params.toString();
 router.replace(newUrl.toString(), { scroll: false });

 } catch (err) {
 setError(err instanceof Error ? err.message : 'Search failed');
 } finally {
 setIsLoading(false);
 setIsLoadingMore(false);
 }
 }, [filters, searchResults, router]);

 useEffect(() => {
 const timeoutId = setTimeout(() => {
 performSearch();
 }, 300); // Debounce search

 return () => clearTimeout(timeoutId);
 }, [performSearch]);

 const handleFiltersChange = (newFilters: SeriesSearchFiltersType) => {
 setFilters(newFilters);
 setSearchResults(null); // Clear results to trigger new search
 };

 const handleTabChange = (tab: 'all' | 'videos' | 'series') => {
 setActiveTab(tab);

 if (tab !== 'all' && filters.contentType !== tab) {
 handleFiltersChange({
 ...filters,
 contentType: tab
 });
 } else if (tab === 'all' && filters.contentType !== 'all') {
 handleFiltersChange({
 ...filters,
 contentType: 'all'
 });
 }
 };

 const handleVideoClick = (video: Video) => {
 router.push(`/watch/${video.id}`);
 };

 const handleSeriesClick = (series: Series) => {
 router.push(`/series/${series.id}`);
 };

 const handleLoadMore = () => {
 performSearch(true);
 };

 return (
 <div className="min-h-screen bg-neutral-light-gray/30">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
 {}
 <div className="mb-6 lg:mb-8">
 <h1 className="text-2xl lg:text-3xl font-bold text-primary-navy mb-2">
 Search Results
 </h1>
 {filters.query && (
 <p className="text-neutral-dark-gray">
 Results for &quot;{filters.query}&quot;
 </p>
 )}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
 {}
 <div className="lg:col-span-1">
 <div className="sticky top-6">
 <SeriesSearchFilters
 filters={filters}
 onFiltersChange={handleFiltersChange}
 categories={categories}
 isLoading={isLoading}
 />
 </div>
 </div>

 {}
 <div className="lg:col-span-3">
 {error ? (
 <div className="text-center py-12">
 <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 <h3 className="text-xl font-semibold text-primary-navy mb-2">
 Search Error
 </h3>
 <p className="text-neutral-dark-gray mb-6">
 {error}
 </p>
 <button
 onClick={() => performSearch()}
 className="px-6 py-3 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors"
 >
 Try Again
 </button>
 </div>
 ) : (
 <UnifiedSearchResults
 videos={searchResults?.results.videos || []}
 series={searchResults?.results.series || []}
 isLoading={isLoading}
 onVideoClick={handleVideoClick}
 onSeriesClick={handleSeriesClick}
 onLoadMore={searchResults?.pagination.hasMore ? handleLoadMore : undefined}
 hasMore={searchResults?.pagination.hasMore || false}
 isLoadingMore={isLoadingMore}
 activeTab={activeTab}
 onTabChange={handleTabChange}
 />
 )}
 </div>
 </div>
 </div>
 </div>
 );
}