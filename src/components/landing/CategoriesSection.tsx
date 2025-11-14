'use client';

import { useCategories } from '@/hooks/useCategories';
import CategoryCard from './CategoryCard';
import { Category } from '@/types';

interface CategoriesSectionProps {
 limit?: number;
 className?: string;
}

export default function CategoriesSection({ limit, className = '' }: CategoriesSectionProps) {
 const { categories, loading, error, refetch } = useCategories();

 const displayCategories = limit ? categories.slice(0, limit) : categories;

 if (loading) {
 return <CategoriesSectionSkeleton />;
 }

 if (error) {
 return (
 <div className={`text-center ${className}`}>
 <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
 <div className="text-red-600 mb-4">
 <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 <h3 className="text-lg font-semibold text-red-800 mb-2">
 Unable to Load Categories
 </h3>
 <p className="text-red-600 mb-4">
 {error}
 </p>
 <button
 onClick={refetch}
 className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
 </svg>
 Try Again
 </button>
 </div>
 </div>
 );
 }

 if (displayCategories.length === 0) {
 return (
 <div className={`text-center ${className}`}>
 <div className="bg-neutral-gray/10 rounded-2xl p-8">
 <div className="text-neutral-dark/60 mb-4">
 <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
 </svg>
 </div>
 <h3 className="text-lg font-semibold text-neutral-dark mb-2">
 No Categories Available
 </h3>
 <p className="text-neutral-dark/70">
 Categories will appear here once content is added to the platform.
 </p>
 </div>
 </div>
 );
 }

 return (
 <div className={className}>
 {}
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6">
 {displayCategories.map((category) => (
 <CategoryCard
 key={category.id}
 category={category}
 className="w-full"
 />
 ))}
 </div>

 {}
 {limit && categories.length > limit && (
 <div className="text-center mt-8">
 <a
 href="/discover"
 className="inline-flex items-center gap-2 px-6 py-3 bg-primary-navy text-neutral-white rounded-xl hover:bg-primary-navy/90 transition-all duration-300 transform hover:scale-105 font-medium"
 >
 <span>View All Categories</span>
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </a>
 </div>
 )}
 </div>
 );
}

function CategoriesSectionSkeleton() {
 return (
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6">
 {Array.from({ length: 8 }).map((_, index) => (
 <div key={index} className="animate-pulse">
 <div className="bg-neutral-white rounded-2xl p-6 shadow-sm border border-neutral-gray/20">
 {}
 <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-neutral-gray/20 rounded-xl"></div>
 
 {}
 <div className="h-5 bg-neutral-gray/20 rounded-lg mb-2 mx-auto w-3/4"></div>
 
 {}
 <div className="space-y-1 mb-3">
 <div className="h-3 bg-neutral-gray/20 rounded w-full"></div>
 <div className="h-3 bg-neutral-gray/20 rounded w-2/3 mx-auto"></div>
 </div>
 
 {}
 <div className="flex justify-center">
 <div className="h-6 bg-neutral-gray/20 rounded-full w-16"></div>
 </div>
 
 {}
 <div className="flex justify-center gap-4 mt-3">
 <div className="h-3 bg-neutral-gray/20 rounded w-12"></div>
 <div className="h-3 bg-neutral-gray/20 rounded w-12"></div>
 </div>
 </div>
 </div>
 ))}
 </div>
 );
}