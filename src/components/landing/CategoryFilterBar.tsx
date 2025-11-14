"use client";

import { useEffect, useState } from "react";

interface Category {
 id: string;
 name: string;
 slug: string;
 videoCount?: number;
 seriesCount?: number;
 contentCount?: number;
}

interface CategoryFilterBarProps {
 selectedCategory: string;
 onCategoryChange: (categorySlug: string) => void;
 className?: string;
}

export default function CategoryFilterBar({
 selectedCategory,
 onCategoryChange,
 className = "",
}: CategoryFilterBarProps) {
 const [categories, setCategories] = useState<Category[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 async function fetchCategories() {
 try {
 setLoading(true);
 const response = await fetch("/api/landing/categories");
 
 if (!response.ok) {
 throw new Error("Failed to fetch categories");
 }

 const result = await response.json();

 if (result.success && result.data && result.data.length > 0) {
 setCategories(result.data);
 } else {

 setCategories(getFallbackCategories());
 }
 } catch (err) {
 console.error("Error fetching categories:", err);

 setCategories(getFallbackCategories());
 } finally {
 setLoading(false);
 }
 }

 fetchCategories();
 }, []);

 function getFallbackCategories(): Category[] {
 return [
 { id: "entertainment", name: "Entertainment", slug: "entertainment" },
 { id: "education", name: "Education", slug: "education" },
 { id: "music", name: "Music", slug: "music" },
 { id: "comedy", name: "Comedy", slug: "comedy" },
 { id: "lifestyle", name: "Lifestyle", slug: "lifestyle" },
 { id: "technology", name: "Technology", slug: "technology" },
 { id: "gaming", name: "Gaming", slug: "gaming" },
 { id: "sports", name: "Sports", slug: "sports" },
 ];
 }

 if (loading) {
 return (
 <div className={`flex gap-3 overflow-x-auto py-2 ${className}`}>
 {[...Array(6)].map((_, i) => (
 <div
 key={i}
 className="flex-shrink-0 h-10 w-24 bg-gray-200 animate-pulse rounded-full"
 />
 ))}
 </div>
 );
 }

 const allCategories = [
 { id: "all", name: "All", slug: "all" },
 ...categories,
 ];

 return (
 <div className={`relative ${className}`}>
 <div className="flex gap-3 overflow-x-auto py-3 scrollbar-hide">
 <div className="flex gap-3 px-0.5">
 {allCategories.map((category) => {
 const isSelected = selectedCategory === category.slug;
 const hasStats = category.videoCount !== undefined && category.seriesCount !== undefined;
 
 return (
 <button
 key={category.id}
 onClick={() => onCategoryChange(category.slug)}
 className={`flex-shrink-0 px-6 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap ${
 isSelected
 ? "bg-accent-pink text-white shadow-lg"
 : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
 }`}
 >
 <div className="flex items-center gap-2">
 <span>{category.name}</span>
 {hasStats && category.slug !== "all" && (
 <span className={`text-xs ${isSelected ? "text-white/80" : "text-gray-500"}`}>
 ({category.videoCount}V + {category.seriesCount}S)
 </span>
 )}
 </div>
 </button>
 );
 })}
 </div>
 </div>

 <style jsx>{`
 .scrollbar-hide::-webkit-scrollbar {
 display: none;
 }
 .scrollbar-hide {
 -ms-overflow-style: none;
 scrollbar-width: none;
 }
 `}</style>
 </div>
 );
}
