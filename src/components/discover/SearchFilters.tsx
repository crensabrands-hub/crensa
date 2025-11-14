'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export interface SearchFilters {
 category?: string;
 duration?: 'short' | 'medium' | 'long';
 creditRange?: [number, number];
 sortBy?: 'trending' | 'newest' | 'popular' | 'recommended';
}

export interface CategoryFilter {
 id: string;
 name: string;
 icon: string;
 videoCount: number;
 color: string;
}

interface SearchFiltersProps {
 onFiltersChange: (filters: SearchFilters & { searchQuery: string }) => void;
 onSearchChange: (query: string) => void;
 initialFilters?: SearchFilters;
 initialSearchQuery?: string;
 isLoading?: boolean;
}

const defaultCategories: CategoryFilter[] = [
 { id: 'art-design', name: 'Art & Design', icon: '🎨', videoCount: 0, color: 'bg-purple-500' },
 { id: 'education', name: 'Education', icon: '📚', videoCount: 0, color: 'bg-accent-teal' },
 { id: 'entertainment', name: 'Entertainment', icon: '🎬', videoCount: 0, color: 'bg-accent-pink' },
 { id: 'technology', name: 'Technology', icon: '💻', videoCount: 0, color: 'bg-gray-500' },
 { id: 'lifestyle', name: 'Lifestyle', icon: '✨', videoCount: 0, color: 'bg-teal-500' },
 { id: 'music', name: 'Music', icon: '🎵', videoCount: 0, color: 'bg-accent-green' },
 { id: 'gaming', name: 'Gaming', icon: '🎮', videoCount: 0, color: 'bg-violet-500' },
 { id: 'fitness-health', name: 'Fitness & Health', icon: '💪', videoCount: 0, color: 'bg-red-500' },
 { id: 'business', name: 'Business', icon: '💼', videoCount: 0, color: 'bg-blue-600' },
 { id: 'comedy', name: 'Comedy', icon: '😂', videoCount: 0, color: 'bg-primary-neon-yellow' },
];

const durationOptions = [
 { value: 'short', label: 'Short (< 2 min)', icon: '⚡' },
 { value: 'medium', label: 'Medium (2-10 min)', icon: '⏱️' },
 { value: 'long', label: 'Long (> 10 min)', icon: '🎞️' },
];

const sortOptions = [
 { value: 'trending', label: 'Trending', icon: '🔥' },
 { value: 'newest', label: 'Newest', icon: '🆕' },
 { value: 'popular', label: 'Most Popular', icon: '⭐' },
 { value: 'recommended', label: 'Recommended', icon: '🎯' },
];

export default function SearchFilters({
 onFiltersChange,
 onSearchChange,
 initialFilters = {},
 initialSearchQuery = '',
 isLoading = false,
}: SearchFiltersProps) {
 const router = useRouter();
 const searchParams = useSearchParams();

 const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
 const [filters, setFilters] = useState<SearchFilters>(initialFilters);
 const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
 const [creditRange, setCreditRange] = useState<[number, number]>([1, 10]);
 const [categories, setCategories] = useState<CategoryFilter[]>(defaultCategories);
 const [categoriesLoading, setCategoriesLoading] = useState(true);

 const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

 useEffect(() => {
 const fetchCategories = async () => {
 try {
 setCategoriesLoading(true);
 const response = await fetch('/api/categories');
 if (response.ok) {
 const data = await response.json();
 const apiCategories = data.success ? data.categories : [];
 console.log('Fetched categories from API:', apiCategories);

 const transformedCategories: CategoryFilter[] = apiCategories.map((cat: any) => {

 const defaultCat = defaultCategories.find(dc => 
 dc.id === cat.slug || 
 dc.name.toLowerCase() === cat.name.toLowerCase()
 );
 
 return {
 id: cat.slug || cat.id, // Use slug as the ID for filtering
 name: cat.name,
 icon: cat.icon || defaultCat?.icon || '📹',
 videoCount: cat.videoCount || 0,
 color: cat.color || defaultCat?.color || 'bg-gray-500'
 };
 });
 
 console.log('Transformed categories:', transformedCategories);
 setCategories(transformedCategories);
 } else {
 console.warn('Failed to fetch categories, using defaults');
 setCategories(defaultCategories);
 }
 } catch (error) {
 console.error('Error fetching categories:', error);
 setCategories(defaultCategories);
 } finally {
 setCategoriesLoading(false);
 }
 };

 fetchCategories();
 }, []);

 useEffect(() => {
 const urlSearchQuery = searchParams.get('q') || initialSearchQuery;
 const urlCategory = searchParams.get('category') || initialFilters.category || '';
 const urlDuration = searchParams.get('duration') as 'short' | 'medium' | 'long' || initialFilters.duration;
 const urlSortBy = searchParams.get('sort') as 'trending' | 'newest' | 'popular' | 'recommended' || initialFilters.sortBy || 'trending';
 const urlMinCredits = parseInt(searchParams.get('minCredits') || (initialFilters.creditRange?.[0]?.toString() || '1'));
 const urlMaxCredits = parseInt(searchParams.get('maxCredits') || (initialFilters.creditRange?.[1]?.toString() || '10'));

 setSearchQuery(urlSearchQuery);
 setFilters({
 category: urlCategory || undefined,
 duration: urlDuration,
 sortBy: urlSortBy,
 creditRange: [urlMinCredits, urlMaxCredits],
 });
 setCreditRange([urlMinCredits, urlMaxCredits]);

 if (urlDuration || urlMinCredits !== 1 || urlMaxCredits !== 10) {
 setShowAdvancedFilters(true);
 }
 }, [searchParams, initialFilters, initialSearchQuery]);

 const updateURL = useCallback((newFilters: SearchFilters, newSearchQuery: string) => {
 const params = new URLSearchParams();
 
 if (newSearchQuery) params.set('q', newSearchQuery);
 if (newFilters.category) params.set('category', newFilters.category);
 if (newFilters.duration) params.set('duration', newFilters.duration);
 if (newFilters.sortBy && newFilters.sortBy !== 'trending') params.set('sort', newFilters.sortBy);
 if (newFilters.creditRange) {
 if (newFilters.creditRange[0] !== 1) params.set('minCredits', newFilters.creditRange[0].toString());
 if (newFilters.creditRange[1] !== 10) params.set('maxCredits', newFilters.creditRange[1].toString());
 }

 const newURL = params.toString() ? `?${params.toString()}` : '/discover';
 router.replace(newURL, { scroll: false });
 }, [router]);

 const handleSearchChange = (value: string) => {
 setSearchQuery(value);

 if (searchTimeout) {
 clearTimeout(searchTimeout);
 }

 const timeout = setTimeout(() => {
 onSearchChange(value);
 updateURL(filters, value);
 onFiltersChange({ ...filters, searchQuery: value });
 }, 300);

 setSearchTimeout(timeout);
 };

 const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
 const updatedFilters = { ...filters, ...newFilters };
 setFilters(updatedFilters);
 updateURL(updatedFilters, searchQuery);
 onFiltersChange({ ...updatedFilters, searchQuery });
 };

 const handleCreditRangeChange = (range: [number, number]) => {
 setCreditRange(range);
 handleFilterChange({ creditRange: range });
 };

 const clearFilters = () => {
 setSearchQuery('');
 setFilters({});
 setCreditRange([1, 10]);
 setShowAdvancedFilters(false);
 router.replace('/discover', { scroll: false });
 onSearchChange('');
 onFiltersChange({ searchQuery: '' });
 };

 const activeFiltersCount = (() => {
 let count = 0;
 if (searchQuery) count++;
 if (filters.category) count++;
 if (filters.duration) count++;
 if (filters.sortBy && filters.sortBy !== 'trending') count++;
 if (filters.creditRange && (filters.creditRange[0] !== 1 || filters.creditRange[1] !== 10)) count++;
 return count;
 })();

 return (
 <div className="space-y-4 sm:space-y-6">
 {}
 <div className="relative">
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => handleSearchChange(e.target.value)}
 placeholder="Search for videos, creators, or topics..."
 disabled={isLoading}
 className="w-full pl-10 sm:pl-12 pr-12 sm:pr-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-neutral-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 }}
 />
 <svg
 className="absolute left-3 sm:left-4 top-3 sm:top-4.5 w-5 h-5 sm:w-6 sm:h-6 text-neutral-dark-gray"
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
 {searchQuery && (
 <button
 onClick={() => handleSearchChange('')}
 className="absolute right-3 sm:right-4 top-3 sm:top-4 p-1 text-neutral-dark-gray hover:text-primary-navy transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 }}
 >
 <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 )}
 </div>

 {}
 <div className="flex flex-wrap items-center gap-2 sm:gap-3">
 {}
 <div className="relative flex-1 sm:flex-none min-w-[140px]">
 <select
 value={filters.sortBy || 'trending'}
 onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
 disabled={isLoading}
 className="appearance-none bg-white border-2 border-neutral-light-gray rounded-lg px-3 sm:px-4 py-2 pr-8 sm:pr-10 focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed w-full text-sm sm:text-base min-h-[44px]"
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 }}
 >
 {sortOptions.map((option) => (
 <option key={option.value} value={option.value}>
 {option.icon} {option.label}
 </option>
 ))}
 </select>
 <svg
 className="absolute right-2 sm:right-3 top-3 w-4 h-4 text-neutral-dark-gray pointer-events-none"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
 </svg>
 </div>

 {}
 <button
 onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
 className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border-2 transition-all duration-200 min-h-[44px] text-sm sm:text-base ${
 showAdvancedFilters || activeFiltersCount > 1
 ? 'border-primary-navy bg-primary-navy text-white'
 : 'border-neutral-light-gray bg-white text-neutral-dark-gray hover:border-primary-navy'
 }`}
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 }}
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
 </svg>
 <span className="hidden xs:inline">Filters</span>
 {activeFiltersCount > 0 && (
 <span className="bg-primary-neon-yellow text-primary-navy text-xs font-bold px-2 py-1 rounded-full">
 {activeFiltersCount}
 </span>
 )}
 </button>

 {}
 {activeFiltersCount > 0 && (
 <button
 onClick={clearFilters}
 className="text-xs sm:text-sm text-neutral-dark-gray hover:text-primary-navy transition-colors px-2 py-1 min-h-[44px] flex items-center"
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 }}
 >
 Clear all
 </button>
 )}
 </div>

 {}
 <div className="flex flex-wrap gap-2">
 <button
 onClick={() => handleFilterChange({ category: undefined })}
 className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 min-h-[44px] ${
 !filters.category
 ? 'bg-primary-navy text-white'
 : 'bg-neutral-light-gray text-neutral-dark-gray hover:bg-neutral-gray'
 }`}
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 }}
 >
 All Categories
 </button>
 {categoriesLoading ? (

 Array.from({ length: 6 }).map((_, i) => (
 <div
 key={i}
 className="h-8 sm:h-10 bg-neutral-light-gray rounded-full w-20 sm:w-24 animate-pulse"
 />
 ))
 ) : (
 categories.map((category) => (
 <button
 key={category.id}
 onClick={() => handleFilterChange({ 
 category: filters.category === category.id ? undefined : category.id 
 })}
 className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 min-h-[44px] ${
 filters.category === category.id
 ? 'bg-primary-navy text-white'
 : 'bg-neutral-light-gray text-neutral-dark-gray hover:bg-neutral-gray'
 }`}
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 }}
 >
 <span>{category.icon}</span>
 <span className="hidden xs:inline sm:inline">{category.name}</span>
 <span className="xs:hidden sm:hidden">{category.name.slice(0, 3)}</span>
 <span className="text-xs opacity-75 hidden sm:inline">({category.videoCount})</span>
 </button>
 ))
 )}
 </div>

 {}
 <AnimatePresence>
 {showAdvancedFilters && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 transition={{ duration: 0.3 }}
 className="bg-neutral-light-gray rounded-xl p-6 space-y-6"
 >
 {}
 <div>
 <h3 className="text-sm font-semibold text-primary-navy mb-3">Duration</h3>
 <div className="flex flex-wrap gap-2">
 <button
 onClick={() => handleFilterChange({ duration: undefined })}
 className={`px-3 py-2 rounded-lg text-xs sm:text-sm transition-all duration-200 min-h-[44px] ${
 !filters.duration
 ? 'bg-primary-navy text-white'
 : 'bg-white text-neutral-dark-gray hover:bg-neutral-gray'
 }`}
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 }}
 >
 Any Duration
 </button>
 {durationOptions.map((option) => (
 <button
 key={option.value}
 onClick={() => handleFilterChange({ 
 duration: filters.duration === option.value ? undefined : option.value as any
 })}
 className={`flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm transition-all duration-200 min-h-[44px] ${
 filters.duration === option.value
 ? 'bg-primary-navy text-white'
 : 'bg-white text-neutral-dark-gray hover:bg-neutral-gray'
 }`}
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 }}
 >
 <span>{option.icon}</span>
 <span className="hidden xs:inline">{option.label}</span>
 <span className="xs:hidden">{option.label.split(' ')[0]}</span>
 </button>
 ))}
 </div>
 </div>

 {}
 <div>
 <h3 className="text-sm font-semibold text-primary-navy mb-3">
 Credit Cost: {creditRange[0]} - {creditRange[1]} credits
 </h3>
 <div className="space-y-4">
 <div className="flex items-center gap-2 sm:gap-4">
 <label className="text-xs sm:text-sm text-neutral-dark-gray min-w-[40px] sm:min-w-[60px]">Min:</label>
 <input
 type="range"
 min="1"
 max="10"
 value={creditRange[0]}
 onChange={(e) => {
 const newMin = parseInt(e.target.value);
 const newRange: [number, number] = [newMin, Math.max(newMin, creditRange[1])];
 handleCreditRangeChange(newRange);
 }}
 className="flex-1 h-3 sm:h-2 bg-neutral-gray rounded-lg appearance-none cursor-pointer slider touch-target"
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 }}
 />
 <span className="text-xs sm:text-sm font-medium text-primary-navy min-w-[20px] sm:min-w-[30px]">
 {creditRange[0]}
 </span>
 </div>
 <div className="flex items-center gap-2 sm:gap-4">
 <label className="text-xs sm:text-sm text-neutral-dark-gray min-w-[40px] sm:min-w-[60px]">Max:</label>
 <input
 type="range"
 min="1"
 max="10"
 value={creditRange[1]}
 onChange={(e) => {
 const newMax = parseInt(e.target.value);
 const newRange: [number, number] = [Math.min(creditRange[0], newMax), newMax];
 handleCreditRangeChange(newRange);
 }}
 className="flex-1 h-3 sm:h-2 bg-neutral-gray rounded-lg appearance-none cursor-pointer slider touch-target"
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 }}
 />
 <span className="text-xs sm:text-sm font-medium text-primary-navy min-w-[20px] sm:min-w-[30px]">
 {creditRange[1]}
 </span>
 </div>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {}
 {activeFiltersCount > 0 && (
 <div className="flex flex-wrap items-center gap-2 text-sm">
 <span className="text-neutral-dark-gray">Active filters:</span>
 {searchQuery && (
 <span className="bg-primary-neon-yellow text-primary-navy px-3 py-1 rounded-full font-medium">
 Search: &ldquo;{searchQuery}&rdquo;
 </span>
 )}
 {filters.category && (
 <span className="bg-accent-pink text-white px-3 py-1 rounded-full font-medium">
 {categories.find(c => c.id === filters.category)?.name}
 </span>
 )}
 {filters.duration && (
 <span className="bg-accent-teal text-white px-3 py-1 rounded-full font-medium">
 {durationOptions.find(d => d.value === filters.duration)?.label}
 </span>
 )}
 {filters.sortBy && filters.sortBy !== 'trending' && (
 <span className="bg-accent-green text-white px-3 py-1 rounded-full font-medium">
 {sortOptions.find(s => s.value === filters.sortBy)?.label}
 </span>
 )}
 {filters.creditRange && (filters.creditRange[0] !== 1 || filters.creditRange[1] !== 10) && (
 <span className="bg-primary-navy text-white px-3 py-1 rounded-full font-medium">
 {filters.creditRange[0]}-{filters.creditRange[1]} credits
 </span>
 )}
 </div>
 )}

 {}
 <style jsx>{`
 .slider::-webkit-slider-thumb {
 appearance: none;
 height: 20px;
 width: 20px;
 border-radius: 50%;
 background: #01164D;
 cursor: pointer;
 border: 2px solid #CCE53F;
 }

 .slider::-moz-range-thumb {
 height: 20px;
 width: 20px;
 border-radius: 50%;
 background: #01164D;
 cursor: pointer;
 border: 2px solid #CCE53F;
 }

 .slider::-webkit-slider-track {
 height: 8px;
 border-radius: 4px;
 background: #E9ECEF;
 }

 .slider::-moz-range-track {
 height: 8px;
 border-radius: 4px;
 background: #E9ECEF;
 }
 `}</style>
 </div>
 );
}