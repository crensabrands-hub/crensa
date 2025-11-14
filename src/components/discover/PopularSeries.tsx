"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SeriesCard from "./SeriesCard";

interface Series {
 id: string;
 title: string;
 description: string | null;
 thumbnailUrl: string | null;
 coinPrice: number;
 videoCount: number;
 totalDuration: number;
 category: string;
 tags: string[];
 viewCount: number;
 totalEarnings: number;
 createdAt: Date;
 creator: {
 id: string;
 username: string;
 displayName: string;
 avatar?: string;
 };
}

export default function PopularSeries() {
 const [series, setSeries] = useState<Series[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 fetchPopularSeries();
 }, []);

 const fetchPopularSeries = async () => {
 try {
 setIsLoading(true);
 setError(null);

 const response = await fetch("/api/discover/series?limit=6&sortBy=views");

 if (!response.ok) {
 throw new Error(`Failed to fetch series: ${response.statusText}`);
 }

 const data = await response.json();

 if (!data.success) {
 throw new Error(data.error || "Failed to fetch series");
 }

 setSeries(data.series || []);
 } catch (err) {
 console.error("Error fetching popular series:", err);
 setError(err instanceof Error ? err.message : "Failed to load series");
 } finally {
 setIsLoading(false);
 }
 };

 if (!isLoading && series.length === 0) {
 return null;
 }

 if (isLoading) {
 return (
 <div className="mb-8">
 <div className="flex items-center justify-between mb-4">
 <div className="h-8 bg-neutral-light-gray rounded w-48 animate-pulse"></div>
 </div>
 <div className="overflow-x-auto scrollbar-hide">
 <div className="flex gap-4 pb-4">
 {Array.from({ length: 6 }).map((_, i) => (
 <div
 key={i}
 className="flex-shrink-0 w-80 bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
 >
 <div className="aspect-video bg-neutral-light-gray"></div>
 <div className="p-4 space-y-3">
 <div className="h-6 bg-neutral-light-gray rounded w-3/4"></div>
 <div className="h-4 bg-neutral-light-gray rounded w-1/2"></div>
 <div className="h-8 bg-neutral-light-gray rounded"></div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
 }

 if (error) {
 return (
 <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
 <p className="text-red-600 text-sm">
 Failed to load popular series. Please try again later.
 </p>
 </div>
 );
 }

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="mb-8"
 >
 {}
 <div className="flex items-center justify-between mb-4">
 <div>
 <h2 className="text-2xl font-bold text-primary-navy mb-1">
 Popular Series
 </h2>
 <p className="text-sm text-neutral-dark-gray">
 Discover curated collections of videos
 </p>
 </div>
 </div>

 {}
 <div className="relative">
 <div
 className="overflow-x-auto scrollbar-hide pb-4"
 style={{
 scrollbarWidth: "none",
 msOverflowStyle: "none",
 WebkitOverflowScrolling: "touch",
 }}
 >
 <div className="flex gap-4">
 {series.map((s, index) => (
 <motion.div
 key={s.id}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.3, delay: index * 0.1 }}
 className="flex-shrink-0 w-80"
 >
 <SeriesCard
 id={s.id}
 title={s.title}
 thumbnailUrl={s.thumbnailUrl}
 coinPrice={s.coinPrice}
 videoCount={s.videoCount}
 creatorName={s.creator.displayName}
 creatorAvatar={s.creator.avatar}
 />
 </motion.div>
 ))}
 </div>
 </div>

 {}
 {series.length > 3 && (
 <>
 <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
 <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
 </>
 )}
 </div>

 {}
 <style jsx>{`
 .scrollbar-hide::-webkit-scrollbar {
 display: none;
 }
 `}</style>
 </motion.div>
 );
}
