"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Marquee from "@/components/ui/marquee";
import TrendingVideoCard from "./TrendingVideoCard";

interface TrendingVideo {
 id: string;
 title: string;
 thumbnailUrl: string;
 duration: number;
 viewCount: number;
 creatorName: string;
 creatorAvatar: string;
 creatorId: string;
 price: number;
 category: string;
 href: string;
 trendingScore: number;
}

interface MustSeesSectionProps {
 limit?: number;
 className?: string;
}

export default function MustSeesSection({
 limit = 10,
 className = "",
}: MustSeesSectionProps) {
 const [videos, setVideos] = useState<TrendingVideo[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 async function fetchTrendingVideos() {
 try {
 setLoading(true);
 setError(null);

 const response = await fetch(
 `/api/landing/trending-videos?limit=${limit}`
 );

 if (!response.ok) {
 throw new Error("Failed to fetch trending videos");
 }

 const result = await response.json();

 if (result.success && result.data) {
 setVideos(result.data);
 } else {
 throw new Error("Invalid response format");
 }
 } catch (err) {
 console.error("Error fetching trending videos:", err);
 setError(
 err instanceof Error ? err.message : "Failed to load trending videos"
 );
 } finally {
 setLoading(false);
 }
 }

 fetchTrendingVideos();
 }, [limit]);

 if (loading) {
 return (
 <section className={`py-16 px-4 ${className}`}>
 <div className="container mx-auto max-w-7xl">
 <div className="flex items-center justify-between mb-10">
 <div className="h-10 w-56 bg-gradient-to-r from-neutral-gray to-neutral-light-gray animate-pulse rounded-xl" />
 <div className="h-8 w-24 bg-gradient-to-r from-neutral-gray to-neutral-light-gray animate-pulse rounded-xl" />
 </div>
 <div className="flex gap-8 overflow-x-auto pb-6">
 {[...Array(5)].map((_, i) => (
 <div
 key={i}
 className="flex-shrink-0 w-72 h-80 bg-gradient-to-br from-neutral-gray to-neutral-light-gray animate-pulse rounded-3xl shadow-lg"
 />
 ))}
 </div>
 </div>
 </section>
 );
 }

 if (error || videos.length === 0) {
 return (
 <section className={`py-16 px-4 ${className}`}>
 <div className="container mx-auto max-w-7xl">
 <div className="bg-gradient-to-br from-accent-teal/10 to-accent-green/10 border-2 border-accent-teal/30 rounded-3xl p-12 text-center shadow-lg">
 <p className="text-primary-navy font-semibold text-lg">
 {error || "No trending videos available at the moment"}
 </p>
 </div>
 </div>
 </section>
 );
 }

 return (
 <section className={`py-16 px-4 ${className}`}>
 <div className="container mx-auto max-w-7xl">
 {}
 <div className="mb-10">
 {}
 <div className="mb-4">
 <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-teal/10 to-accent-green/10 rounded-full text-accent-teal font-semibold shadow-sm">
 <span className="w-2.5 h-2.5 bg-accent-teal rounded-full animate-pulse"></span>
 Must-Sees
 </div>
 </div>

 {}
 <div className="flex items-end justify-between gap-4">
 <h2 className="text-3xl md:text-5xl font-bold text-primary-navy">
 Trending Videos
 </h2>
 <Link
 href="/discover"
 className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-pink to-accent-bright-pink text-white font-bold rounded-2xl hover:from-accent-bright-pink hover:to-accent-pink transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
 >
 View More
 <svg
 className="w-5 h-5"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M17 8l4 4m0 0l-4 4m4-4H3"
 />
 </svg>
 </Link>
 </div>
 </div>

 {}
 <Marquee pauseOnHover className="[--duration:60s] [--gap:3rem]">
 {videos.map((video) => (
 <TrendingVideoCard
 key={video.id}
 id={video.id}
 title={video.title}
 thumbnailUrl={video.thumbnailUrl}
 duration={video.duration}
 creatorName={video.creatorName}
 creatorAvatar={video.creatorAvatar}
 price={video.price}
 category={video.category}
 href={video.href}
 />
 ))}
 </Marquee>
 </div>
 </section>
 );
}
