'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '@/types';

export interface SeriesFilterOptions {
 category?: string;
 priceRange?: {
 min: number;
 max: number;
 };
 sortBy: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'most_viewed' | 'most_videos';
 sortOrder: 'asc' | 'desc';
}

interface SeriesFiltersProps {
 filters: SeriesFilterOptions;
 onFiltersChange: (filters: SeriesFilterOptions) => void;
 categories: Category[];
 isLoading?: boolean;
 className?: string;
}

const SORT_OPTIONS = [
 { value: 'newest', label: 'Newest First', order: 'desc' as const },
 { value: 'oldest', label: 'Oldest First', order: 'asc' as const },
 { value: 'price_low', label: 'Price: Low to High', order: 'asc' as const },
 { value: 'price_high', label: 'Price: High to Low', order: 'desc' as const },
 { value: 'most_viewed', label: 'Most Viewed', order: 'desc' as const },
 { value: 'most_videos', label: 'Most Videos', order: 'desc' as const },
];

const PRICE_RANGES = [
 { label: 'Any Price', min: 0, max: Infinity },
 { label: 'Under ₹100', min: 0, max: 100 },
 { label: '₹100 - ₹500', min: 100, max: 500 },
 { label: '₹500 - ₹1000', min: 500, max: 1000 },
 { label: 'Over ₹1000', min: 1000, max: Infinity },
];

export default function SeriesFilters({
 filters,
 onFiltersChange,
 categories,
 isLoading = false,
 className = ''
}: SeriesFiltersProps) {
 const [isExpanded, setIsExpanded] = useState(false);
 const [localFilters, setLocalFilters] = useState(filters);

 useEffect(() => {
 setLocalFilters(filters);
 }, [filters]);

 const handleFilterChange = (newFilters: Partial<SeriesFilterOptions>) => {
 const updatedFilters = { ...localFilters, ...newFilters };
 setLocalFilters(updatedFilters);
 onFiltersChange(updatedFilters);
 };

 const handleSortChange = (sortBy: SeriesFilterOptions['sortBy']) => {
 const sortOption = SORT_OPTIONS.find(option => option.value === sortBy);
 if (sortOption) {
 handleFilterChange({
 sortBy,
 sortOrder: sortOption.order
 });
 }
 };

 const handlePriceRangeChange = (range: { min: number; max: number }) => {
 handleFilterChange({
 priceRange: range.max === Infinity ? undefined : range
 });
 };

 const clearFilters = () => {
 const defaultFilters: SeriesFilterOptions = {
 sortBy: 'newest',
 sortOrder: 'desc'
 };
 setLocalFilters(defaultFilters);
 onFiltersChange(defaultFilters);
 };

 const hasActiveFilters = localFilters.category || localFilters.priceRange;

 return (
 <div className={`bg-white border border-neutral-light-gray rounded-lg ${className}`}>
 {}
 <div className="flex items-center justify-between p-4 border-b border-neutral-light-gray">
 <div className="flex items-center space-x-3">
 <h3 className="font-semibold text-primary-navy">Filters & Sort</h3>
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
 Clear All
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
 {(isExpanded || window.innerWidth >= 1024) && (
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
 Sort By
 </label>
 <select
 value={localFilters.sortBy}
 onChange={(e) => handleSortChange(e.target.value as SeriesFilterOptions['sortBy'])}
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
 {category.name} ({category.seriesCount})
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
 (!localFilters.priceRange && range.max === Infinity) ||
 (localFilters.priceRange?.min === range.min && localFilters.priceRange?.max === range.max)
 }
 onChange={() => handlePriceRangeChange(range)}
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
 const max = localFilters.priceRange?.max || 1000;
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
 value={localFilters.priceRange?.max === Infinity ? '' : (localFilters.priceRange?.max || '')}
 onChange={(e) => {
 const max = parseInt(e.target.value) || Infinity;
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
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}