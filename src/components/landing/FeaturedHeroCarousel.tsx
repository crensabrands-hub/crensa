'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon } from '@heroicons/react/24/outline';
import { FeaturedContent } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

interface FeaturedHeroCarouselProps {
 featuredContent: FeaturedContent[];
 autoplayInterval?: number;
}

export default function FeaturedHeroCarousel({ 
 featuredContent, 
 autoplayInterval = 5000 
}: FeaturedHeroCarouselProps) {
 const [currentIndex, setCurrentIndex] = useState(0);
 const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
 const [touchStart, setTouchStart] = useState<number | null>(null);
 const [touchEnd, setTouchEnd] = useState<number | null>(null);

 const minSwipeDistance = 50;

 const nextSlide = useCallback(() => {
 setCurrentIndex((prevIndex) => 
 prevIndex === featuredContent.length - 1 ? 0 : prevIndex + 1
 );
 }, [featuredContent.length]);

 const prevSlide = useCallback(() => {
 setCurrentIndex((prevIndex) => 
 prevIndex === 0 ? featuredContent.length - 1 : prevIndex - 1
 );
 }, [featuredContent.length]);

 const goToSlide = (index: number) => {
 setCurrentIndex(index);
 };

 useEffect(() => {
 if (featuredContent.length <= 1) return;

 const interval = setInterval(nextSlide, autoplayInterval);
 return () => clearInterval(interval);
 }, [nextSlide, autoplayInterval, featuredContent.length]);

 const onTouchStart = (e: React.TouchEvent) => {
 setTouchEnd(null);
 setTouchStart(e.targetTouches[0].clientX);
 };

 const onTouchMove = (e: React.TouchEvent) => {
 setTouchEnd(e.targetTouches[0].clientX);
 };

 const onTouchEnd = () => {
 if (!touchStart || !touchEnd) return;
 
 const distance = touchStart - touchEnd;
 const isLeftSwipe = distance > minSwipeDistance;
 const isRightSwipe = distance < -minSwipeDistance;

 if (isLeftSwipe) {
 nextSlide();
 } else if (isRightSwipe) {
 prevSlide();
 }
 };

 useEffect(() => {
 const handleKeyDown = (event: KeyboardEvent) => {
 if (event.key === 'ArrowLeft') {
 prevSlide();
 } else if (event.key === 'ArrowRight') {
 nextSlide();
 }
 };

 window.addEventListener('keydown', handleKeyDown);
 return () => window.removeEventListener('keydown', handleKeyDown);
 }, [nextSlide, prevSlide]);

 if (!featuredContent || featuredContent.length === 0) {
 return (
 <div className="relative w-full h-96 md:h-[500px] bg-neutral-gray/20 rounded-2xl flex items-center justify-center">
 <p className="text-neutral-dark text-lg">No featured content available</p>
 </div>
 );
 }

 const currentContent = featuredContent[currentIndex];

 return (
 <div 
 className="relative w-full h-96 md:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-primary-navy to-accent-pink/30 shadow-2xl"
 onTouchStart={onTouchStart}
 onTouchMove={onTouchMove}
 onTouchEnd={onTouchEnd}
 role="region"
 aria-label="Featured content carousel"
 >
 {}
 <div className="absolute inset-0">
 <Image
 src={currentContent.imageUrl || '/images/hero-fallback.jpg'}
 alt={currentContent.title}
 fill
 className="object-cover"
 priority
 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
 />
 <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
 </div>

 {}
 <div className="relative z-10 h-full flex items-center">
 <div className="container mx-auto px-6 md:px-8">
 <div className="max-w-2xl">
 {}
 <div className="inline-flex items-center gap-2 mb-4">
 <span className="px-3 py-1 bg-accent-pink/20 backdrop-blur-sm rounded-full text-neutral-white text-sm font-medium border border-accent-pink/30">
 {currentContent.type === 'series' ? 'Series' : 'Video'}
 </span>
 <span className="px-3 py-1 bg-primary-navy/20 backdrop-blur-sm rounded-full text-neutral-white text-sm font-medium border border-primary-navy/30">
 {currentContent.category}
 </span>
 </div>

 {}
 <h2 className="text-3xl md:text-5xl font-bold text-neutral-white mb-4 leading-tight">
 {currentContent.title}
 </h2>

 {}
 <p className="text-lg md:text-xl text-neutral-white/90 mb-6 leading-relaxed line-clamp-3">
 {currentContent.description}
 </p>

 {}
 <div className="flex items-center gap-3 mb-8">
 <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-gray/20">
 {currentContent.creatorAvatar ? (
 <Image
 src={currentContent.creatorAvatar}
 alt={currentContent.creatorName}
 width={40}
 height={40}
 className="object-cover"
 />
 ) : (
 <div className="w-full h-full bg-primary-navy/30 flex items-center justify-center">
 <span className="text-neutral-white font-medium text-sm">
 {currentContent.creatorName.charAt(0).toUpperCase()}
 </span>
 </div>
 )}
 </div>
 <span className="text-neutral-white/90 font-medium">
 by {currentContent.creatorName}
 </span>
 </div>

 {}
 <Link
 href={currentContent.href}
 className="inline-flex items-center gap-3 px-8 py-4 bg-accent-pink hover:bg-accent-pink/90 text-neutral-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
 >
 <PlayIcon className="w-5 h-5" />
 {currentContent.type === 'series' ? 'Watch Series' : 'Watch Now'}
 </Link>
 </div>
 </div>
 </div>

 </div>
 );
}