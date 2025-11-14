'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '@/types';

export interface SeriesSearchFilters {
 query: string;
 category?: string;
 priceRange?: {
 min: number;
 max: number;
 };
 sortBy: 'newest' | 'oldest' | 'views' | 'price_low' | 'price_high' | 'title' | 'video_count';
 contentType: 'all' | 'videos' | 'series';
}

interface SeriesSearchFiltersProps {
 filters: SeriesSearchFilters;
 onFiltersChange: (filters: SeriesSearchFilters) => void;
 categories: Category[];
 isLoading?: boolean;
 className?: string;
}

const SORT_OPTIONS = [
 { value: 'newest', label: 'Newest First' },
 { value: 'oldest', label: 'Oldest First' },
 { value: 'views', label: 'Most Viewed' },
 { value: 'price_low', label: 'Price: Low to High' },
 { value: 'price_high', label: 'Price: High to Low' },
 { value: 'title', label: 'Title A-Z' },
 { value: 'video_count', label: 'Most Videos' },
];

const CONTENT_TYPE_OPTIONS = [
 { value: 'all', label: 'All Content' },
 { value: 'videos', label: 'Videos Only' },
 { value: 'series', label: 'Series Only' },
];

const PRICE_RANGES = [
 { label: 'Any Price', min: 0, max: 10000 },
 { label: 'Free', min: 0, max: 0 },
 { label: 'Under ₹100', min: 0, max: 100 },
 { label: '₹100 - ₹500', min: 100, max: 500 },
 { label: '₹500 - ₹1000', min: 500, max: 1000 },
 { label: 'Over ₹1000', min: 1000, max: 10000 },
];

export default function SeriesSearchFilters({
 filters,
 onFiltersChange,
 categories,
 isLoading = false,
 className = ''
}: SeriesSearchFiltersProps) {
 const [isExpanded, setIsExpanded] = useState(false);
 const [localFilters, setLocalFilters] = useState(filters);

 useEffect(() => {
 setLocalFilters(filters);
 }, [filters]);

 const handleFilterChange = (newFilters: Partial<SeriesSearchFilters>) => {
 const updatedFilters = { ...localFilters, ...newFilters };
 setLocalFilters(updatedFilters);
 onFiltersChange(updatedFilters);
 };

 const clearFilters = () => {
 const defaultFilters: SeriesSearchFilters = {
 query: localFilters.query, // Keep the search query
 sortBy: 'newest',
 contentType: 'all'
 };
 setLocalFilters(defaultFilters);
 onFiltersChange(defaultFilters);
 };

 const hasActiveFilters = localFilters.category || localFilters.priceRange || localFilters.contentType !== 'all';

 return (
 <div className={`bg-white border border-neutral-light-gray rounded-lg ${className}`}>
 {}
 <div className="flex items-center justify-between p-4 border-b border-neutral-light-gray">
 <div className="flex items-center space-x-3">
 <h3 className="font-semibold text-primary-navy">Search Filters</h3>
 {hasActiveFilters && (
 <span className="bg-accent-pink text-white text-xs px-2 py-1 rounded-full">
 Active
 </span>
 )}
 </div>
 
 <div className="flex items-center space-x-2">
 {hasActiveFilters && (
 <button
 onClick={clearFilters}
 className="text-sm text-accent-pink hover:text-accent-pink/80 transition-colors"
 >
 Clear Filters
 </button>
 )}
 
 <button
 onClick={() => setIsExpanded(!isExpanded)}
 className="p-2 hover:bg-neutral-light-gray rounded-lg transition-colors lg:hidden"
 >
 <motion.svg
 className="w-5 h-5 text-neutral-dark-gray"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 animate={{ rotate: isExpanded ? 180 : 0 }}
 transition={{ duration: 0.2 }}
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
 </motion.svg>
 </button>
 </div>
 </div>

 {}
 <AnimatePresence>
 {(isExpanded || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="overflow-hidden lg:block"
 >
 <div className="p-4 space-y-6">
 {}
 <div>
 <label className="block text-sm font-medium text-primary-navy mb-3">
 Content Type
 </label>
 <select
 value={localFilters.contentType}
 onChange={(e) => handleFilterChange({ 
 contentType: e.target.value as SeriesSearchFilters['contentType']
 })}
 disabled={isLoading}
 className="w-full px-3 py-2 border border-neutral-light-gray rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {CONTENT_TYPE_OPTIONS.map((option) => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </select>
 </div>

 {}
 <div>
 <label className="block text-sm font-medium text-primary-navy mb-3">
 Sort By
 </label>
 <select
 value={localFilters.sortBy}
 onChange={(e) => handleFilterChange({ 
 sortBy: e.target.value as SeriesSearchFilters['sortBy']
 })}
 disabled={isLoading}
 className="w-full px-3 py-2 border border-neutral-light-gray rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {SORT_OPTIONS.map((option) => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </select>
 </div>

 {}
 <div>
 <label className="block text-sm font-medium text-primary-navy mb-3">
 Category
 </label>
 <select
 value={localFilters.category || ''}
 onChange={(e) => handleFilterChange({ 
 category: e.target.value || undefined 
 })}
 disabled={isLoading}
 className="w-full px-3 py-2 border border-neutral-light-gray rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <option value="">All Categories</option>
 {categories.map((category) => (
 <option key={category.id} value={category.slug}>
 {category.name}
 </option>
 ))}
 </select>
 </div>

 {}
 <div>
 <label className="block text-sm font-medium text-primary-navy mb-3">
 Price Range
 </label>
 <div className="space-y-2">
 {PRICE_RANGES.map((range, index) => (
 <label key={index} className="flex items-center space-x-2 cursor-pointer">
 <input
 type="radio"
 name="priceRange"
 checked={
 (!localFilters.priceRange && range.min === 0 && range.max === 10000) ||
 (localFilters.priceRange?.min === range.min && localFilters.priceRange?.max === range.max)
 }
 onChange={() => handleFilterChange({
 priceRange: (range.min === 0 && range.max === 10000) ? undefined : range
 })}
 disabled={isLoading}
 className="w-4 h-4 text-accent-teal focus:ring-accent-teal border-neutral-light-gray disabled:opacity-50"
 />
 <span className="text-sm text-neutral-dark-gray">
 {range.label}
 </span>
 </label>
 ))}
 </div>
 </div>

 {}
 <div>
 <label className="block text-sm font-medium text-primary-navy mb-3">
 Custom Price Range
 </label>
 <div className="flex items-center space-x-2">
 <input
 type="number"
 placeholder="Min"
 min="0"
 value={localFilters.priceRange?.min || ''}
 onChange={(e) => {
 const min = parseInt(e.target.value) || 0;
 const max = localFilters.priceRange?.max || 10000;
 handleFilterChange({
 priceRange: { min, max }
 });
 }}
 disabled={isLoading}
 className="flex-1 px-3 py-2 border border-neutral-light-gray rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
 />
 <span className="text-neutral-dark-gray">to</span>
 <input
 type="number"
 placeholder="Max"
 min="0"
 value={localFilters.priceRange?.max === 10000 ? '' : (localFilters.priceRange?.max || '')}
 onChange={(e) => {
 const max = parseInt(e.target.value) || 10000;
 const min = localFilters.priceRange?.min || 0;
 handleFilterChange({
 priceRange: { min, max }
 });
 }}
 disabled={isLoading}
 className="flex-1 px-3 py-2 border border-neutral-light-gray rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
 />
 </div>
 </div>

 {}
 <div className="pt-4 border-t border-neutral-light-gray">
 <div className="text-sm text-neutral-dark-gray">
 <p className="font-medium mb-1">Active Filters:</p>
 <ul className="space-y-1 text-xs">
 <li>Content: {CONTENT_TYPE_OPTIONS.find(opt => opt.value === localFilters.contentType)?.label}</li>
 <li>Sort: {SORT_OPTIONS.find(opt => opt.value === localFilters.sortBy)?.label}</li>
 {localFilters.category && (
 <li>Category: {categories.find(cat => cat.slug === localFilters.category)?.name}</li>
 )}
 {localFilters.priceRange && (
 <li>Price: ₹{localFilters.priceRange.min} - ₹{localFilters.priceRange.max}</li>
 )}
 </ul>
 </div>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}