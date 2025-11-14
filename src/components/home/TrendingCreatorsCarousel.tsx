'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Users, Video, TrendingUp } from 'lucide-react';

interface Creator {
 id: string;
 username: string;
 displayName: string;
 avatar?: string;
 videoCount: number;
 totalViews: number;
 category: string;
 isFollowing?: boolean;
}

interface TrendingCreatorsCarouselProps {
 creators: Creator[];
 onCreatorClick: (creator: Creator) => void;
 onFollowToggle: (creatorId: string) => void;
 loading?: boolean;
 error?: string | null;
 followingStates?: Record<string, boolean>;
}

export default function TrendingCreatorsCarousel({ 
 creators, 
 onCreatorClick, 
 onFollowToggle,
 loading = false,
 error = null,
 followingStates = {}
}: TrendingCreatorsCarouselProps) {
 const [currentIndex, setCurrentIndex] = useState(0);
 const scrollRef = useRef<HTMLDivElement>(null);

 const itemsPerView = 3;
 const maxIndex = Math.max(0, creators.length - itemsPerView);

 const scrollToIndex = (index: number) => {
 if (scrollRef.current) {
 const itemWidth = scrollRef.current.scrollWidth / creators.length;
 scrollRef.current.scrollTo({
 left: index * itemWidth,
 behavior: 'smooth'
 });
 }
 setCurrentIndex(index);
 };

 const nextSlide = () => {
 const newIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
 scrollToIndex(newIndex);
 };

 const prevSlide = () => {
 const newIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
 scrollToIndex(newIndex);
 };

 return (
 <section className="py-12">
 <div className="container mx-auto px-4">
 <div className="flex items-center justify-between mb-8">
 <motion.h2 
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 className="text-3xl md:text-4xl font-bold text-primary-navy flex items-center gap-3"
 >
 <TrendingUp className="w-8 h-8 text-accent-pink" />
 Trending Creators
 </motion.h2>
 
 <div className="flex gap-2">
 <button
 onClick={prevSlide}
 className="bg-neutral-white hover:bg-accent-pink hover:text-neutral-white border border-neutral-light-gray rounded-full p-2 transition-colors duration-300"
 disabled={creators.length <= itemsPerView}
 >
 <ChevronLeft className="w-6 h-6 text-primary-navy" />
 </button>
 <button
 onClick={nextSlide}
 className="bg-neutral-white hover:bg-accent-pink hover:text-neutral-white border border-neutral-light-gray rounded-full p-2 transition-colors duration-300"
 disabled={creators.length <= itemsPerView}
 >
 <ChevronRight className="w-6 h-6 text-primary-navy" />
 </button>
 </div>
 </div>

 {}
 {loading && (
 <div className="relative overflow-hidden">
 <div className="flex gap-6">
 {[...Array(3)].map((_, index) => (
 <div key={index} className="flex-shrink-0 w-80">
 <div className="bg-neutral-white rounded-2xl p-6 border border-neutral-light-gray animate-pulse">
 <div className="flex items-center gap-4 mb-4">
 <div className="w-16 h-16 rounded-full bg-gray-200"></div>
 <div className="flex-1">
 <div className="h-5 bg-gray-200 rounded mb-2"></div>
 <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
 <div className="h-3 bg-gray-200 rounded w-1/2"></div>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4 mb-4">
 <div className="text-center">
 <div className="h-5 bg-gray-200 rounded mb-1"></div>
 <div className="h-3 bg-gray-200 rounded"></div>
 </div>
 <div className="text-center">
 <div className="h-5 bg-gray-200 rounded mb-1"></div>
 <div className="h-3 bg-gray-200 rounded"></div>
 </div>
 </div>
 <div className="flex gap-2">
 <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
 <div className="w-20 h-10 bg-gray-200 rounded-lg"></div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {}
 {error && !loading && (
 <div className="text-center py-12">
 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 <h3 className="text-lg font-semibold text-primary-navy mb-2">
 Failed to Load Trending Creators
 </h3>
 <p className="text-neutral-dark-gray mb-4">{error}</p>
 <button
 onClick={() => window.location.reload()}
 className="bg-accent-pink hover:bg-accent-bright-pink text-neutral-white px-6 py-2 rounded-lg font-medium transition-colors duration-300"
 >
 Try Again
 </button>
 </div>
 )}

 {}
 {!loading && !error && creators.length === 0 && (
 <div className="text-center py-12">
 <div className="w-16 h-16 bg-neutral-light-gray rounded-full flex items-center justify-center mx-auto mb-4">
 <TrendingUp className="w-8 h-8 text-neutral-dark-gray" />
 </div>
 <h3 className="text-lg font-semibold text-primary-navy mb-2">
 No Trending Creators
 </h3>
 <p className="text-neutral-dark-gray">
 Check back later for trending creators to follow.
 </p>
 </div>
 )}

 {}
 {!loading && !error && creators.length > 0 && (
 <div className="relative overflow-hidden">
 <motion.div
 ref={scrollRef}
 className="flex gap-6 overflow-x-auto scrollbar-hide"
 style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
 >
 {creators.map((creator, index) => (
 <motion.div
 key={creator.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.1 }}
 className="flex-shrink-0 w-80"
 >
 <div className="bg-neutral-white rounded-2xl p-6 border border-neutral-light-gray hover:border-accent-pink hover:shadow-lg transition-all duration-300 group">
 <div className="flex items-center gap-4 mb-4">
 <div className="relative">
 <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-accent-pink to-accent-teal">
 {creator.avatar ? (
 <Image
 src={creator.avatar}
 alt={creator.displayName}
 width={64}
 height={64}
 className="w-full h-full object-cover"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-neutral-white font-bold text-xl">
 {creator.displayName.charAt(0).toUpperCase()}
 </div>
 )}
 </div>
 <div className="absolute -top-1 -right-1 bg-gradient-to-r from-accent-green to-primary-neon-yellow rounded-full p-1">
 <TrendingUp className="w-3 h-3 text-primary-navy" />
 </div>
 </div>
 
 <div className="flex-1">
 <h3 className="text-lg font-semibold text-primary-navy mb-1">
 {creator.displayName}
 </h3>
 <p className="text-neutral-dark-gray text-sm">@{creator.username}</p>
 <span className="inline-block bg-gradient-to-r from-accent-pink to-accent-teal text-neutral-white px-2 py-1 rounded-lg text-xs font-medium mt-1">
 {creator.category}
 </span>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4 mb-4">
 <div className="text-center">
 <div className="flex items-center justify-center gap-1 text-primary-navy font-semibold">
 <Video className="w-4 h-4" />
 {creator.videoCount}
 </div>
 <p className="text-neutral-dark-gray text-sm">Videos</p>
 </div>
 <div className="text-center">
 <div className="flex items-center justify-center gap-1 text-primary-navy font-semibold">
 <Users className="w-4 h-4" />
 {creator.totalViews.toLocaleString()}
 </div>
 <p className="text-neutral-dark-gray text-sm">Views</p>
 </div>
 </div>

 <div className="flex gap-2">
 <button
 onClick={() => onCreatorClick(creator)}
 className="flex-1 bg-gradient-to-r from-accent-pink to-accent-teal hover:from-accent-bright-pink hover:to-accent-bright-teal text-neutral-white py-2 px-4 rounded-lg font-medium transition-all duration-300"
 >
 View Profile
 </button>
 <button
 onClick={() => onFollowToggle(creator.id)}
 disabled={followingStates[creator.id]}
 className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
 creator.isFollowing
 ? 'bg-primary-neon-yellow text-primary-navy hover:bg-primary-light-yellow'
 : 'bg-neutral-light-gray text-primary-navy hover:bg-accent-pink hover:text-neutral-white'
 }`}
 >
 {followingStates[creator.id] ? (
 <div className="flex items-center gap-1">
 <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
 <span>...</span>
 </div>
 ) : (
 creator.isFollowing ? 'Following' : 'Follow'
 )}
 </button>
 </div>
 </div>
 </motion.div>
 ))}
 </motion.div>
 </div>
 )}

 {}
 {!loading && !error && creators.length > itemsPerView && (
 <div className="flex justify-center gap-2 mt-6">
 {Array.from({ length: maxIndex + 1 }).map((_, index) => (
 <button
 key={index}
 onClick={() => scrollToIndex(index)}
 className={`w-2 h-2 rounded-full transition-all duration-300 ${
 index === currentIndex ? 'bg-accent-pink' : 'bg-neutral-light-gray'
 }`}
 />
 ))}
 </div>
 )}
 </div>
 </section>
 );
}