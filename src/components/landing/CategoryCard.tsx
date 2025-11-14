'use client';

import { Category } from '@/types';
import Link from 'next/link';
import { useState } from 'react';

interface CategoryCardProps {
 category: Category;
 className?: string;
}

export default function CategoryCard({ category, className = '' }: CategoryCardProps) {
 const [imageError, setImageError] = useState(false);

 const handleImageError = () => {
 setImageError(true);
 };

 const getDefaultIcon = (categoryName: string) => {
 const icons: Record<string, string> = {
 'entertainment': '🎭',
 'education': '📚',
 'music': '🎵',
 'comedy': '😂',
 'lifestyle': '✨',
 'technology': '💻',
 'gaming': '🎮',
 'sports': '⚽',
 'food': '🍳',
 'travel': '✈️',
 'fashion': '👗',
 'health': '💪',
 'business': '💼',
 'art': '🎨',
 'science': '🔬',
 'news': '📰'
 };
 
 return icons[categoryName.toLowerCase()] || '📺';
 };

 const totalContent = category.videoCount + category.seriesCount;

 return (
 <Link 
 href={`/discover?category=${category.slug}`}
 className={`group block ${className}`}
 >
 <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 hover:border-accent-pink/30 group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-accent-pink/5">
 {}
 <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-navy/10 to-accent-pink/10 rounded-xl group-hover:from-primary-navy/20 group-hover:to-accent-pink/20 transition-all duration-300 group-hover:scale-110">
 {category.iconUrl && !imageError ? (
 <img
 src={category.iconUrl}
 alt={`${category.name} icon`}
 className="w-8 h-8 object-contain"
 onError={handleImageError}
 />
 ) : (
 <span className="text-2xl" role="img" aria-label={category.name}>
 {category.iconUrl || getDefaultIcon(category.name)}
 </span>
 )}
 </div>

 {}
 <h3 className="text-lg font-semibold text-gray-900 text-center mb-2 group-hover:text-accent-pink transition-colors duration-300">
 {category.name}
 </h3>

 {}
 {category.description && (
 <p className="text-sm text-gray-600 text-center mb-3 line-clamp-2">
 {category.description}
 </p>
 )}

 {}
 <div className="text-center">
 <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 group-hover:bg-accent-pink/10 rounded-full transition-colors duration-300">
 <span className="text-sm font-medium text-gray-700 group-hover:text-accent-pink">
 {totalContent.toLocaleString()}
 </span>
 <span className="text-xs text-gray-500 group-hover:text-accent-pink/70">
 {totalContent === 1 ? 'item' : 'items'}
 </span>
 </div>
 </div>

 {}
 {(category.videoCount > 0 || category.seriesCount > 0) && (
 <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500 group-hover:text-gray-600">
 {category.videoCount > 0 && (
 <span>{category.videoCount.toLocaleString()} video{category.videoCount !== 1 ? 's' : ''}</span>
 )}
 {category.seriesCount > 0 && (
 <span>{category.seriesCount.toLocaleString()} series</span>
 )}
 </div>
 )}

 {}
 <div className="mt-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
 <div className="flex items-center gap-1 text-xs text-accent-pink font-medium">
 <span>Explore</span>
 <svg 
 className="w-3 h-3 transform group-hover:translate-x-1 transition-transform duration-300" 
 fill="none" 
 stroke="currentColor" 
 viewBox="0 0 24 24"
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 </div>
 </div>
 </Link>
 );
}