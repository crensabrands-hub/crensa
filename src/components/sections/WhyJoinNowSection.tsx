"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";

interface WhyJoinNowSectionProps {
 title: string;
 benefits: string[];
 ctaText: string;
 ctaLink: string;
 className?: string;
}

export function WhyJoinNowSection({ 
 title, 
 benefits, 
 ctaText, 
 ctaLink,
 className = "" 
}: WhyJoinNowSectionProps) {
 const sectionRef = useRef<HTMLElement>(null);
 const isInView = useInView(sectionRef, { 
 once: true, 
 margin: "-100px 0px" 
 });
 const shouldReduceMotion = useReducedMotion();

 const [counter, setCounter] = useState(0);
 const targetCount = 247; // Number of early adopters

 useEffect(() => {
 if (isInView && !shouldReduceMotion) {
 const duration = 2000; // 2 seconds
 const steps = 60;
 const increment = targetCount / steps;
 let current = 0;
 
 const timer = setInterval(() => {
 current += increment;
 if (current >= targetCount) {
 setCounter(targetCount);
 clearInterval(timer);
 } else {
 setCounter(Math.floor(current));
 }
 }, duration / steps);

 return () => clearInterval(timer);
 } else {
 setCounter(targetCount);
 }
 }, [isInView, shouldReduceMotion]);

 const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 duration: shouldReduceMotion ? 0.01 : 0.6,
 staggerChildren: shouldReduceMotion ? 0 : 0.1,
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

 const benefitVariants = {
 hidden: {
 opacity: 0,
 x: shouldReduceMotion ? 0 : -30,
 scale: shouldReduceMotion ? 1 : 0.95,
 },
 visible: {
 opacity: 1,
 x: 0,
 scale: 1,
 transition: {
 duration: shouldReduceMotion ? 0.01 : 0.5,
 ease: "easeOut",
 },
 },
 };

 const ctaVariants = {
 hidden: {
 opacity: 0,
 y: shouldReduceMotion ? 0 : 20,
 },
 visible: {
 opacity: 1,
 y: 0,
 transition: {
 duration: shouldReduceMotion ? 0.01 : 0.6,
 ease: "easeOut",
 delay: shouldReduceMotion ? 0 : 0.3,
 },
 },
 };

 const urgencyVariants = {
 hidden: {
 opacity: 0,
 scale: shouldReduceMotion ? 1 : 0.9,
 },
 visible: {
 opacity: 1,
 scale: 1,
 transition: {
 duration: shouldReduceMotion ? 0.01 : 0.8,
 ease: "easeOut",
 delay: shouldReduceMotion ? 0 : 0.2,
 },
 },
 };

 return (
 <section
 ref={sectionRef}
 className={`section-padding bg-gradient-to-br from-accent-pink/5 via-neutral-white to-accent-teal/5 relative overflow-hidden ${className}`}
 aria-label={title}
 >
 {}
 <div className="absolute inset-0 bg-gradient-to-r from-accent-pink/10 to-accent-teal/10 opacity-50" />
 <div className="absolute top-0 right-0 w-96 h-96 bg-primary-neon-yellow/10 rounded-full blur-3xl -translate-y-48 translate-x-48" />
 <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-pink/10 rounded-full blur-3xl translate-y-48 -translate-x-48" />

 <motion.div
 className="container relative z-10"
 variants={containerVariants}
 initial="hidden"
 animate={isInView ? "visible" : "hidden"}
 >
 {}
 <motion.div 
 className="text-center mb-12 space-y-6"
 variants={urgencyVariants}
 >
 {}
 <div className="flex justify-center">
 <div className="inline-flex items-center gap-2 bg-accent-pink/10 border border-accent-pink/20 rounded-full px-4 py-2">
 <div className="w-2 h-2 bg-accent-pink rounded-full animate-pulse" />
 <span className="text-sm font-medium text-accent-pink">
 Limited Time Offer
 </span>
 </div>
 </div>
 
 {}
 <div className="flex justify-center">
 <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-neutral-white/80 backdrop-blur-sm border border-accent-pink/20 rounded-2xl px-6 py-4 shadow-lg max-w-sm sm:max-w-none">
 <div className="text-center">
 <div className="text-2xl sm:text-3xl font-bold text-accent-pink">
 {counter}
 </div>
 <div className="text-xs text-neutral-dark-gray whitespace-nowrap">
 Early Adopters
 </div>
 </div>
 <div className="hidden sm:block w-px h-8 bg-accent-pink/20" />
 <div className="block sm:hidden w-8 h-px bg-accent-pink/20" />
 <div className="text-center">
 <div className="text-2xl sm:text-3xl font-bold text-accent-teal">
 50%
 </div>
 <div className="text-xs text-neutral-dark-gray whitespace-nowrap">
 Lower Fees
 </div>
 </div>
 </div>
 </div>
 </motion.div>

 {}
 <motion.div 
 className="text-center mb-12 lg:mb-16"
 variants={headerVariants}
 >
 <h2 className="headline mb-4 text-gradient">
 {title}
 </h2>
 <p className="subheadline max-w-3xl mx-auto text-neutral-dark-gray">
 Join the exclusive group of creators shaping the future of content monetization
 </p>
 </motion.div>

 {}
 <div className="max-w-4xl mx-auto mb-12">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {benefits.map((benefit, index) => (
 <motion.div
 key={index}
 className="flex items-start gap-4 p-6 bg-neutral-white/60 backdrop-blur-sm rounded-xl border border-accent-pink/10 hover:border-accent-pink/20 transition-all duration-300 group"
 variants={benefitVariants}
 whileHover={{ 
 scale: shouldReduceMotion ? 1 : 1.02,
 y: shouldReduceMotion ? 0 : -4 
 }}
 transition={{ duration: 0.2, ease: "easeOut" }}
 >
 {}
 <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-accent-pink to-accent-teal rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
 <svg 
 className="w-4 h-4 text-neutral-white" 
 fill="currentColor" 
 viewBox="0 0 20 20"
 aria-hidden="true"
 >
 <path 
 fillRule="evenodd" 
 d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
 clipRule="evenodd" 
 />
 </svg>
 </div>
 
 {}
 <div className="flex-1">
 <p className="text-primary-navy font-medium leading-relaxed group-hover:text-accent-pink transition-colors duration-200">
 {benefit}
 </p>
 </div>
 </motion.div>
 ))}
 </div>
 </div>

 {}
 <motion.div 
 className="text-center"
 variants={ctaVariants}
 >
 <div className="inline-flex flex-col sm:flex-row gap-4 items-center">
 <a
 href={ctaLink}
 className="btn-secondary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
 aria-label={`${ctaText} - Join as early adopter`}
 >
 {ctaText}
 </a>
 
 <div className="flex items-center gap-2 text-sm text-neutral-dark-gray">
 <svg 
 className="w-4 h-4 text-accent-teal" 
 fill="currentColor" 
 viewBox="0 0 20 20"
 aria-hidden="true"
 >
 <path 
 fillRule="evenodd" 
 d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
 clipRule="evenodd" 
 />
 </svg>
 <span>No commitment required</span>
 </div>
 </div>
 
 <p className="text-sm text-neutral-dark-gray mt-4 max-w-md mx-auto">
 Limited spots available. Early adopters get exclusive benefits and priority support.
 </p>
 </motion.div>
 </motion.div>
 </section>
 );
}