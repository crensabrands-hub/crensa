"use client";

import { useEffect, useState } from "react";
import CategoryFilterBar from "./CategoryFilterBar";
import UnifiedContentCard from "./UnifiedContentCard";

interface UnifiedContent {
 id: string;
 type: "series" | "video";
 title: string;
 description: string;
 thumbnailUrl: string;
 creatorName: string;
 creatorAvatar: string;
 creatorId: string;
 category: string;
 tags: string[];
 episodeCount?: number;
 duration?: number;
 viewCount: number;
 price: number;
 href: string;
}

interface BrowsePageProps {
 className?: string;
}

export default function BrowsePage({ className = "" }: BrowsePageProps) {
 const [selectedCategory, setSelectedCategory] = useState("all");
 const [contentTypeFilter, setContentTypeFilter] = useState<"all" | "series" | "video">("all");
 const [content, setContent] = useState<UnifiedContent[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 async function fetchContent() {
 try {
 setLoading(true);
 setError(null);

 const response = await fetch(
 `/api/landing/unified-content?category=${selectedCategory}&limit=20`
 );
 
 if (!response.ok) {
 throw new Error("Failed to fetch content");
 }

 const result = await response.json();

 if (result.success && result.data) {
 setContent(result.data);
 } else {
 throw new Error("Invalid response format");
 }
 } catch (err) {
 console.error("Error fetching content:", err);
 setError(err instanceof Error ? err.message : "Failed to load content");
 } finally {
 setLoading(false);
 }
 }

 fetchContent();
 }, [selectedCategory]);

 const handleCategoryChange = (categorySlug: string) => {
 setSelectedCategory(categorySlug);
 };

 const handleContentTypeChange = (type: "all" | "series" | "video") => {
 setContentTypeFilter(type);
 };

 const filteredContent = content.filter((item) => {
 if (contentTypeFilter === "all") return true;
 return item.type === contentTypeFilter;
 });

 return (
 <div className={`py-12 px-4 ${className}`}>
 <div className="container mx-auto">
 {}
 <div className="text-center mb-12">
 <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-navy/10 rounded-full text-primary-navy font-medium mb-4">
 <span className="w-2 h-2 bg-primary-navy rounded-full"></span>
 Browse Content
 </div>
 <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
 Discover Series & Videos
 </h2>
 <p className="text-xl text-gray-600 max-w-2xl mx-auto">
 Explore our collection of series and videos across all categories
 </p>
 </div>

 {}
 <div className="mb-8 -mx-4 px-4">
 <CategoryFilterBar
 selectedCategory={selectedCategory}
 onCategoryChange={handleCategoryChange}
 />
 </div>

 {}
 <div className="mb-8 flex justify-center">
 <div className="inline-flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
 <button
 onClick={() => handleContentTypeChange("all")}
 className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
 contentTypeFilter === "all"
 ? "bg-white text-gray-900 shadow-sm"
 : "text-gray-600 hover:text-gray-900"
 }`}
 >
 All Content
 </button>
 <button
 onClick={() => handleContentTypeChange("series")}
 className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
 contentTypeFilter === "series"
 ? "bg-white text-gray-900 shadow-sm"
 : "text-gray-600 hover:text-gray-900"
 }`}
 >
 Series Only
 </button>
 <button
 onClick={() => handleContentTypeChange("video")}
 className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
 contentTypeFilter === "video"
 ? "bg-white text-gray-900 shadow-sm"
 : "text-gray-600 hover:text-gray-900"
 }`}
 >
 Videos Only
 </button>
 </div>
 </div>

 {}
 {loading ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {[...Array(8)].map((_, i) => (
 <div
 key={i}
 className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
 >
 <div className="h-48 bg-gray-200" />
 <div className="p-5 space-y-3">
 <div className="h-6 bg-gray-200 rounded w-3/4" />
 <div className="h-4 bg-gray-200 rounded w-full" />
 <div className="h-4 bg-gray-200 rounded w-5/6" />
 <div className="flex items-center gap-3 pt-2">
 <div className="w-8 h-8 bg-gray-200 rounded-full" />
 <div className="h-4 bg-gray-200 rounded w-24" />
 </div>
 <div className="pt-3 border-t border-gray-100">
 <div className="h-6 bg-gray-200 rounded w-20 ml-auto" />
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : error ? (
 <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
 <p className="text-red-600 font-medium">{error}</p>
 <button
 onClick={() => window.location.reload()}
 className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
 >
 Retry
 </button>
 </div>
 ) : filteredContent.length === 0 ? (
 <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center">
 <p className="text-gray-600 font-medium text-lg mb-2">
 No content found
 </p>
 <p className="text-gray-500">
 {contentTypeFilter !== "all"
 ? `No ${contentTypeFilter === "series" ? "series" : "videos"} found in this category`
 : "Try selecting a different category or check back later"}
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {filteredContent.map((item) => (
 <UnifiedContentCard
 key={item.id}
 id={item.id}
 type={item.type}
 title={item.title}
 description={item.description}
 thumbnailUrl={item.thumbnailUrl}
 creatorName={item.creatorName}
 creatorAvatar={item.creatorAvatar}
 category={item.category}
 episodeCount={item.episodeCount}
 duration={item.duration}
 price={item.price}
 href={item.href}
 />
 ))}
 </div>
 )}

 {}
 {!loading && !error && filteredContent.length > 0 && (
 <div className="text-center mt-12">
 <button className="px-8 py-3 bg-accent-pink hover:bg-accent-bright-pink text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
 Load More
 </button>
 </div>
 )}
 </div>
 </div>
 );
}
