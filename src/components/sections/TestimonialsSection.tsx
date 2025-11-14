"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
import { Testimonial } from "@/types";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { useResponsive, useTouch } from "@/hooks/useResponsive";

interface TestimonialsSectionProps {
 title: string;
 testimonials: Testimonial[];
 autoRotateInterval?: number;
 className?: string;
}

export function TestimonialsSection({
 title,
 testimonials,
 autoRotateInterval = 5000,
 className = "",
}: TestimonialsSectionProps) {
 const [currentIndex, setCurrentIndex] = useState(0);
 const [isAutoPlaying, setIsAutoPlaying] = useState(true);
 const intervalRef = useRef<NodeJS.Timeout | null>(null);
 const sectionRef = useRef<HTMLElement>(null);
 const isInView = useInView(sectionRef, { 
 once: true, 
 margin: "-100px 0px" 
 });
 const shouldReduceMotion = useReducedMotion();
 const { isMobile, isTouchDevice } = useResponsive();
 const { touchHandlers, getSwipeDirection } = useTouch();

 useEffect(() => {
 if (isAutoPlaying && testimonials.length > 1) {
 intervalRef.current = setInterval(() => {
 setCurrentIndex((prev) => (prev + 1) % testimonials.length);
 }, autoRotateInterval);
 }

 return () => {
 if (intervalRef.current) {
 clearInterval(intervalRef.current);
 }
 };
 }, [isAutoPlaying, testimonials.length, autoRotateInterval]);

 const goToNext = () => {
 setCurrentIndex((prev) => (prev + 1) % testimonials.length);
 setIsAutoPlaying(false);
 };

 const goToPrevious = () => {
 setCurrentIndex(
 (prev) => (prev - 1 + testimonials.length) % testimonials.length
 );
 setIsAutoPlaying(false);
 };

 const goToSlide = (index: number) => {
 setCurrentIndex(index);
 setIsAutoPlaying(false);
 };

 const handleKeyDown = (event: React.KeyboardEvent) => {
 switch (event.key) {
 case 'ArrowLeft':
 event.preventDefault();
 goToPrevious();
 break;
 case 'ArrowRight':
 event.preventDefault();
 goToNext();
 break;
 case 'Home':
 event.preventDefault();
 goToSlide(0);
 break;
 case 'End':
 event.preventDefault();
 goToSlide(testimonials.length - 1);
 break;
 case ' ':
 case 'Enter':
 if (event.target === event.currentTarget) {
 event.preventDefault();
 setIsAutoPlaying(!isAutoPlaying);
 }
 break;
 }
 };

 const handleTouchEnd = () => {
 const swipeResult = getSwipeDirection();
 if (!swipeResult) return;

 const { isLeftSwipe, isRightSwipe } = swipeResult;
 
 if (isLeftSwipe) {
 goToNext();
 } else if (isRightSwipe) {
 goToPrevious();
 }
 };

 const resumeAutoPlay = () => {
 setTimeout(() => setIsAutoPlaying(true), 3000);
 };

 useEffect(() => {
 if (!isAutoPlaying) {
 resumeAutoPlay();
 }
 }, [isAutoPlaying]);

 if (!testimonials.length) return null;

 const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 duration: shouldReduceMotion ? 0.01 : 0.6,
 staggerChildren: shouldReduceMotion ? 0 : 0.2,
 },
 },
 };

 const headerVariants = {
 hidden: {
 opacity: 0,
 y: shouldReduceMotion ? 0 : 30,
 },
 visible: {
 opacity: 1,
 y: 0,
 transition: {
 duration: shouldReduceMotion ? 0.01 : 0.6,
 ease: "easeOut",
 },
 },
 };

 const carouselVariants = {
 hidden: {
 opacity: 0,
 y: shouldReduceMotion ? 0 : 40,
 },
 visible: {
 opacity: 1,
 y: 0,
 transition: {
 duration: shouldReduceMotion ? 0.01 : 0.8,
 ease: "easeOut",
 },
 },
 };

 return (
 <section 
 ref={sectionRef}
 className={`section-padding bg-neutral-white ${className}`}
 aria-label={title}
 >
 <motion.div 
 className="container"
 variants={containerVariants}
 initial="hidden"
 animate={isInView ? "visible" : "hidden"}
 >
 {}
 <motion.div 
 className="text-center mb-12"
 variants={headerVariants}
 >
 <h2 className="headline mb-4">
 {title}
 </h2>
 </motion.div>

 {}
 <motion.div 
 className="relative max-w-4xl mx-auto px-2 sm:px-4 md:px-8"
 variants={carouselVariants}
 onKeyDown={handleKeyDown}
 {...(isTouchDevice ? {
 ...touchHandlers,
 onTouchEnd: handleTouchEnd,
 } : {})}
 tabIndex={0}
 role="region"
 aria-label="Testimonials carousel"
 aria-live="polite"
 aria-atomic="false"
 style={{
 touchAction: 'pan-y pinch-zoom',
 }}
 >
 {}
 <div className="relative overflow-hidden">
 <AnimatePresence mode="wait">
 <motion.div
 key={currentIndex}
 initial={{ opacity: 0, x: 100 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -100 }}
 transition={{ duration: 0.5, ease: "easeInOut" }}
 className="w-full"
 >
 <TestimonialCard
 testimonial={testimonials[currentIndex]}
 className="mx-auto max-w-2xl"
 />
 </motion.div>
 </AnimatePresence>
 </div>

 {}
 {testimonials.length > 1 && (
 <>
 {}
 <button
 onClick={goToPrevious}
 className={`absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 sm:-translate-x-4 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group hover:scale-105 z-10 focus:outline-none focus:ring-2 focus:ring-accent-pink focus:ring-offset-2 ${
 isMobile ? "w-12 h-12" : "w-10 h-10 sm:w-12 sm:h-12"
 } ${isTouchDevice ? "touch-manipulation" : ""}`}
 aria-label={`Previous testimonial. Currently showing ${currentIndex + 1} of ${testimonials.length}`}
 disabled={testimonials.length <= 1}
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 minWidth: '44px',
 minHeight: '44px',
 }}
 >
 <svg
 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-navy group-hover:text-accent-pink transition-colors"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 aria-hidden="true"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M15 19l-7-7 7-7"
 />
 </svg>
 </button>

 <button
 onClick={goToNext}
 className={`absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 sm:translate-x-4 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group hover:scale-105 z-10 focus:outline-none focus:ring-2 focus:ring-accent-pink focus:ring-offset-2 ${
 isMobile ? "w-12 h-12" : "w-10 h-10 sm:w-12 sm:h-12"
 } ${isTouchDevice ? "touch-manipulation" : ""}`}
 aria-label={`Next testimonial. Currently showing ${currentIndex + 1} of ${testimonials.length}`}
 disabled={testimonials.length <= 1}
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 minWidth: '44px',
 minHeight: '44px',
 }}
 >
 <svg
 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-navy group-hover:text-accent-pink transition-colors"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 aria-hidden="true"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M9 5l7 7-7 7"
 />
 </svg>
 </button>

 {}
 <div className="flex justify-center gap-2 mt-8" role="tablist" aria-label="Testimonial navigation">
 {testimonials.map((testimonial, index) => (
 <button
 key={index}
 onClick={() => goToSlide(index)}
 className={`rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-pink focus:ring-offset-2 ${
 isMobile ? "w-4 h-4" : "w-3 h-3"
 } ${
 index === currentIndex
 ? "bg-accent-pink scale-125"
 : "bg-neutral-darkGray/30 hover:bg-neutral-darkGray/50"
 } ${isTouchDevice ? "touch-manipulation" : ""}`}
 role="tab"
 aria-selected={index === currentIndex}
 aria-controls={`testimonial-panel-${index}`}
 aria-label={`Show testimonial from ${testimonial.name}, ${index + 1} of ${testimonials.length}`}
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 minWidth: '44px',
 minHeight: '44px',
 }}
 />
 ))}
 </div>

 {}
 <div className="flex justify-center mt-4">
 <button
 onClick={() => setIsAutoPlaying(!isAutoPlaying)}
 className="flex items-center gap-2 text-sm text-neutral-darkGray hover:text-accent-pink transition-colors"
 aria-label={
 isAutoPlaying ? "Pause auto-play" : "Resume auto-play"
 }
 >
 {isAutoPlaying ? (
 <>
 <svg
 className="w-4 h-4"
 fill="currentColor"
 viewBox="0 0 20 20"
 >
 <path
 fillRule="evenodd"
 d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
 clipRule="evenodd"
 />
 </svg>
 Pause
 </>
 ) : (
 <>
 <svg
 className="w-4 h-4"
 fill="currentColor"
 viewBox="0 0 20 20"
 >
 <path
 fillRule="evenodd"
 d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
 clipRule="evenodd"
 />
 </svg>
 Play
 </>
 )}
 </button>
 </div>
 </>
 )}
 </motion.div>
 </motion.div>
 </section>
 );
}
