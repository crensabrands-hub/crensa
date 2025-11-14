'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export interface Category {
 id: string;
 name: string;
 icon: string;
 videoCount: number;
 color: string;
}

interface CategoryFilterProps {
 selectedCategory?: string;
 onCategoryChange: (categoryId: string | undefined) => void;
 isLoading?: boolean;
}

export default function CategoryFilter({
 selectedCategory,
 onCategoryChange,
 isLoading = false,
}: CategoryFilterProps) {
 const [categories, setCategories] = useState<Category[]>([]);
 const [categoriesLoading, setCategoriesLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 const fetchCategories = async () => {
 try {
 setCategoriesLoading(true);
 setError(null);
 
 const response = await fetch('/api/home/categories');
 if (!response.ok) {
 throw new Error(`Failed to fetch categories: ${response.statusText}`);
 }
 
 const apiCategories = await response.json();

 const validCategories: Category[] = apiCategories
 .filter((cat: any) => cat && cat.id && cat.name)
 .map((cat: any) => ({
 id: cat.id,
 name: cat.name,
 icon: cat.icon || '📹',
 videoCount: cat.videoCount || cat.count || 0,
 color: cat.color || 'bg-gray-500'
 }));
 
 setCategories(validCategories);
 } catch (error) {
 console.error('Error fetching categories:', error);
 setError(error instanceof Error ? error.message : 'Failed to load categories');

 setCategories([
 { id: 'dance', name: 'Dance', icon: '💃', videoCount: 0, color: 'bg-accent-pink' },
 { id: 'comedy', name: 'Comedy', icon: '😂', videoCount: 0, color: 'bg-primary-neon-yellow' },
 { id: 'education', name: 'Education', icon: '📚', videoCount: 0, color: 'bg-accent-teal' },
 { id: 'music', name: 'Music', icon: '🎵', videoCount: 0, color: 'bg-accent-green' },
 { id: 'cooking', name: 'Cooking', icon: '👨‍🍳', videoCount: 0, color: 'bg-accent-green' },
 { id: 'fitness', name: 'Fitness', icon: '💪', videoCount: 0, color: 'bg-red-500' },
 { id: 'art', name: 'Art', icon: '🎨', videoCount: 0, color: 'bg-purple-500' },
 { id: 'technology', name: 'Technology', icon: '💻', videoCount: 0, color: 'bg-gray-500' },
 { id: 'lifestyle', name: 'Lifestyle', icon: '✨', videoCount: 0, color: 'bg-teal-500' },
 { id: 'gaming', name: 'Gaming', icon: '🎮', videoCount: 0, color: 'bg-violet-500' },
 ]);
 } finally {
 setCategoriesLoading(false);
 }
 };

 fetchCategories();
 }, []);

 const handleCategoryClick = (categoryId: string) => {
 if (selectedCategory === categoryId) {

 onCategoryChange(undefined);
 } else {
 onCategoryChange(categoryId);
 }
 };

 return (
 <div className="space-y-3">
 <h3 className="text-sm font-semibold text-primary-navy">Categories</h3>
 
 <div className="flex flex-wrap gap-2">
 {}
 <motion.button
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 onClick={() => onCategoryChange(undefined)}
 disabled={isLoading}
 className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed ${
 !selectedCategory
 ? 'bg-primary-navy text-white shadow-md'
 : 'bg-neutral-light-gray text-neutral-dark-gray hover:bg-neutral-gray'
 }`}
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 }}
 >
 All Categories
 </motion.button>

 {}
 {categoriesLoading ? (
 Array.from({ length: 6 }).map((_, i) => (
 <div
 key={i}
 className="h-8 sm:h-10 bg-neutral-light-gray rounded-full w-20 sm:w-24 animate-pulse"
 />
 ))
 ) : (
 
 categories.map((category) => (
 <motion.button
 key={category.id}
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 onClick={() => handleCategoryClick(category.id)}
 disabled={isLoading}
 className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed ${
 selectedCategory === category.id
 ? 'bg-primary-navy text-white shadow-md'
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
 {category.videoCount > 0 && (
 <span className="text-xs opacity-75 hidden sm:inline">
 ({category.videoCount})
 </span>
 )}
 </motion.button>
 ))
 )}
 </div>

 {}
 {selectedCategory && !categoriesLoading && (
 <div className="text-xs text-neutral-dark-gray">
 {(() => {
 const category = categories.find(c => c.id === selectedCategory);
 if (category) {
 return `Showing ${category.videoCount} videos in ${category.name}`;
 }
 return `Filtering by ${selectedCategory}`;
 })()}
 </div>
 )}
 </div>
 );
}