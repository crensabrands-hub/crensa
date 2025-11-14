"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import FeaturedSeriesCard from "./FeaturedSeriesCard";

interface FeaturedSeries {
 id: string;
 title: string;
 description: string;
 thumbnailUrl: string;
 episodeCount: number;
 creatorName: string;
 creatorAvatar: string;
 creatorId: string;
 category: string;
 tags: string[];
 price: number;
 viewCount: number;
 href: string;
}

interface FeaturedHeroSectionProps {
 className?: string;
}

export default function FeaturedHeroSection({
 className = "",
}: FeaturedHeroSectionProps) {
 const [mainFeatured, setMainFeatured] = useState<FeaturedSeries | null>(null);
 const [sideFeatured, setSideFeatured] = useState<FeaturedSeries[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 async function fetchFeaturedSeries() {
 try {
 setLoading(true);
 setError(null);

 const response = await fetch("/api/landing/featured-series");

 if (!response.ok) {
 throw new Error("Failed to fetch featured series");
 }

 const result = await response.json();

 if (result.success && result.data) {
 setMainFeatured(result.data.main);
 setSideFeatured(result.data.side || []);
 } else {
 throw new Error("Invalid response format");
 }
 } catch (err) {
 console.error("Error fetching featured series:", err);
 setError(
 err instanceof Error ? err.message : "Failed to load featured series"
 );
 } finally {
 setLoading(false);
 }
 }

 fetchFeaturedSeries();
 }, []);

 if (loading) {
 return (
 <section className={`py-12 md:py-16 px-4 ${className}`}>
 <div className="container mx-auto max-w-7xl">
 {}
 <div className="text-center mb-10 md:mb-14">
 <div className="h-8 w-40 mx-auto bg-gradient-to-r from-neutral-gray to-neutral-light-gray animate-pulse rounded-full mb-5" />
 <div className="h-12 w-80 mx-auto bg-gradient-to-r from-neutral-gray to-neutral-light-gray animate-pulse rounded-xl mb-4" />
 <div className="h-6 w-96 mx-auto bg-gradient-to-r from-neutral-gray to-neutral-light-gray animate-pulse rounded-lg" />
 </div>

 {}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
 {}
 <div className="h-[500px] md:h-[600px] lg:row-span-2 bg-gradient-to-br from-neutral-gray to-neutral-light-gray animate-pulse rounded-3xl shadow-lg" />

 {}
 <div className="h-[400px] md:h-[290px] bg-gradient-to-br from-neutral-gray to-neutral-light-gray animate-pulse rounded-3xl shadow-lg" />
 <div className="h-[400px] md:h-[290px] bg-gradient-to-br from-neutral-gray to-neutral-light-gray animate-pulse rounded-3xl shadow-lg" />
 </div>
 </div>
 </section>
 );
 }

 if (error || !mainFeatured) {
 return (
 <section className={`py-12 md:py-16 px-4 ${className}`}>
 <div className="container mx-auto max-w-7xl">
 {}
 <div className="text-center mb-10 md:mb-14">
 <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-pink/10 to-accent-teal/10 rounded-full text-accent-pink font-semibold mb-5 shadow-sm">
 <span className="w-2.5 h-2.5 bg-accent-pink rounded-full animate-pulse"></span>
 Featured Series
 </div>
 <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary-navy to-accent-pink bg-clip-text text-transparent mb-4 md:mb-5 px-4">
 Trending Series
 </h2>
 <p className="text-base md:text-xl text-neutral-dark-gray max-w-2xl mx-auto px-4">
 Discover the most popular series from top creators
 </p>
 </div>

 {}
 <div className="bg-gradient-to-br from-white via-neutral-gray to-accent-teal/5 rounded-3xl p-8 md:p-16 lg:p-20 text-center border border-neutral-light-gray shadow-2xl">
 <div className="max-w-2xl mx-auto">
 {}
 <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 md:mb-8 bg-gradient-to-br from-accent-pink to-accent-teal rounded-full flex items-center justify-center shadow-xl">
 <svg
 className="w-10 h-10 md:w-12 md:h-12 text-white"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
 />
 </svg>
 </div>

 {}
 <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-navy mb-4 md:mb-5">
 No Series Available Yet
 </h3>
 <p className="text-base md:text-lg text-neutral-dark-gray mb-8 md:mb-10 leading-relaxed">
 We&apos;re working on bringing you amazing series content. Check
 back soon or explore our other content!
 </p>

 {}
 <div className="flex flex-col sm:flex-row gap-4 md:gap-5 justify-center">
 <a
 href="/browse"
 className="px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-accent-pink to-accent-bright-pink hover:from-accent-bright-pink hover:to-accent-pink text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
 >
 Browse All Content
 </a>
 <Link
 href="/sign-up?role=creator"
 className="px-8 md:px-10 py-3 md:py-4 bg-white hover:bg-neutral-gray text-primary-navy font-bold rounded-2xl border-2 border-primary-navy transition-all duration-300 hover:shadow-xl"
 >
 Become a Creator
 </Link>
 </div>
 </div>
 </div>
 </div>
 </section>
 );
 }

 return (
 <section className={`py-12 md:py-16 px-4 ${className}`}>
 <div className="container mx-auto max-w-7xl">
 {}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
 {}
 <div className="flex flex-col justify-center space-y-6">
 {}
 <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-pink/10 to-accent-teal/10 rounded-full text-accent-pink font-semibold w-fit shadow-sm">
 <span className="w-2.5 h-2.5 bg-accent-pink rounded-full animate-pulse"></span>
 Featured Series
 </div>

 {}
 <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary-navy to-accent-pink bg-clip-text text-transparent leading-tight">
 Discover Amazing Series
 </h1>

 {}
 <p className="text-lg md:text-xl text-neutral-dark-gray leading-relaxed">
 Watch exclusive content from top creators. Unlock premium series
 with coins and enjoy unlimited entertainment.
 </p>

 {}
 <div className="relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer">
 <Link href={mainFeatured.href}>
 <div className="relative h-64 md:h-80">
 <Image
 src={
 mainFeatured.thumbnailUrl || "/images/hero-fallback.jpg"
 }
 alt={mainFeatured.title}
 fill
 className="object-cover group-hover:scale-105 transition-transform duration-500"
 priority
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

 {}
 <div className="absolute top-4 left-4">
 <span className="px-4 py-2 bg-gradient-to-r from-accent-pink to-accent-bright-pink backdrop-blur-md text-white text-sm font-bold rounded-full shadow-xl">
 {mainFeatured.category}
 </span>
 </div>

 {}
 <div className="absolute top-4 right-4">
 <span className="px-4 py-2 bg-white/95 backdrop-blur-md text-primary-navy text-sm font-bold rounded-full shadow-xl">
 {mainFeatured.episodeCount} Episodes
 </span>
 </div>

 {}
 <div className="absolute bottom-0 left-0 right-0 p-6">
 <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 line-clamp-2">
 {mainFeatured.title}
 </h3>
 <p className="text-white/90 text-sm line-clamp-2">
 {mainFeatured.description}
 </p>
 </div>

 {}
 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
 <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl">
 <svg
 className="w-10 h-10 text-accent-pink ml-1"
 fill="currentColor"
 viewBox="0 0 24 24"
 >
 <path d="M8 5v14l11-7z" />
 </svg>
 </div>
 </div>
 </div>
 </Link>
 </div>

 {}
 <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-neutral-gray/50 to-white rounded-2xl border border-neutral-light-gray">
 <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-accent-pink/30 flex-shrink-0">
 <Image
 src={
 mainFeatured.creatorAvatar || "/images/default-avatar.png"
 }
 alt={mainFeatured.creatorName}
 fill
 className="object-cover"
 />
 </div>
 <div className="flex-1">
 <p className="text-sm text-neutral-dark-gray font-medium">
 Created by
 </p>
 <p className="text-lg font-bold text-primary-navy">
 {mainFeatured.creatorName}
 </p>
 </div>
 <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-pink/10 to-accent-teal/10 rounded-full">
 <span role="img" aria-label="coins" className="text-2xl">
 🪙
 </span>
 <span className="text-xl font-bold bg-gradient-to-r from-accent-pink to-accent-teal bg-clip-text text-transparent">
 {mainFeatured.price.toLocaleString("en-IN")}
 </span>
 </div>
 </div>

 {}
 <div className="flex flex-col sm:flex-row gap-4 pt-4">
 <Link
 href={mainFeatured.href}
 className="flex-1 px-8 py-4 bg-gradient-to-r from-accent-pink to-accent-bright-pink hover:from-accent-bright-pink hover:to-accent-pink text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl text-center"
 >
 Watch Now
 </Link>
 <Link
 href="/browse"
 className="flex-1 px-8 py-4 bg-white hover:bg-neutral-gray text-primary-navy font-bold rounded-2xl border-2 border-primary-navy transition-all duration-300 hover:shadow-xl text-center"
 >
 Browse All
 </Link>
 </div>
 </div>

 {}
 <div className="flex flex-col gap-5 h-full">
 {sideFeatured.length > 0 ? (
 <>
 {sideFeatured.slice(0, 2).map((series) => (
 <FeaturedSeriesCard
 key={series.id}
 id={series.id}
 title={series.title}
 description={series.description}
 thumbnailUrl={series.thumbnailUrl}
 episodeCount={series.episodeCount}
 creatorName={series.creatorName}
 creatorAvatar={series.creatorAvatar}
 category={series.category}
 price={series.price}
 href={series.href}
 size="small"
 />
 ))}

 {}
 {sideFeatured.length === 1 && (
 <div className="h-full min-h-[280px] bg-gradient-to-br from-neutral-gray/50 to-neutral-light-gray/50 rounded-3xl flex flex-col items-center justify-center shadow-lg border-2 border-dashed border-neutral-light-gray p-8 text-center">
 <div className="w-16 h-16 mb-4 bg-gradient-to-br from-accent-pink/20 to-accent-teal/20 rounded-full flex items-center justify-center">
 <svg
 className="w-8 h-8 text-accent-pink"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M12 4v16m8-8H4"
 />
 </svg>
 </div>
 <p className="text-neutral-dark-gray font-semibold text-lg">
 More series coming soon
 </p>
 </div>
 )}
 </>
 ) : (
 
 <>
 <div className="h-[280px] bg-gradient-to-br from-neutral-gray/50 to-neutral-light-gray/50 rounded-3xl flex items-center justify-center shadow-lg border-2 border-dashed border-neutral-light-gray">
 <p className="text-neutral-dark-gray font-semibold">
 More series coming soon
 </p>
 </div>
 <div className="h-[280px] bg-gradient-to-br from-neutral-gray/50 to-neutral-light-gray/50 rounded-3xl flex items-center justify-center shadow-lg border-2 border-dashed border-neutral-light-gray">
 <p className="text-neutral-dark-gray font-semibold">
 More series coming soon
 </p>
 </div>
 </>
 )}
 </div>
 </div>
 </div>
 </section>
 );
}
