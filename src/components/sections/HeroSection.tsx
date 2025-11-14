"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HeroContent } from "@/types";
import { useResponsive } from "@/hooks/useResponsive";
import { optimizeVideoForMobile } from "@/lib/mobile-optimization";

interface HeroSectionProps {
 content: HeroContent;
}

export function HeroSection({ content }: HeroSectionProps) {
 const videoRef = useRef<HTMLVideoElement>(null);
 const [videoLoaded, setVideoLoaded] = useState(false);
 const [videoError, setVideoError] = useState(false);
 const shouldReduceMotion = useReducedMotion();
 const { isMobile, isTouchDevice, width } = useResponsive();

 useEffect(() => {
 const video = videoRef.current;
 if (!video) return;

 const handleLoadedData = () => {
 setVideoLoaded(true);
 };

 const handleError = () => {
 setVideoError(true);
 };

 optimizeVideoForMobile(video);

 video.addEventListener("loadeddata", handleLoadedData);
 video.addEventListener("error", handleError);

 return () => {
 video.removeEventListener("loadeddata", handleLoadedData);
 video.removeEventListener("error", handleError);
 };
 }, []);

 const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 duration: shouldReduceMotion ? 0.01 : 0.8,
 staggerChildren: shouldReduceMotion ? 0 : 0.2,
 },
 },
 };

 const itemVariants = {
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

 const buttonVariants = {
 hidden: {
 opacity: 0,
 scale: shouldReduceMotion ? 1 : 0.9,
 },
 visible: {
 opacity: 1,
 scale: 1,
 transition: {
 duration: shouldReduceMotion ? 0.01 : 0.4,
 ease: "easeOut",
 },
 },
 hover: {
 scale: shouldReduceMotion ? 1 : 1.05,
 transition: {
 duration: 0.2,
 ease: "easeInOut",
 },
 },
 tap: {
 scale: shouldReduceMotion ? 1 : 0.98,
 },
 };

 return (
 <section
 className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-navy via-accent-dark-pink to-primary-navy"
 aria-label="Hero section"
 >
 {}
 {!videoError && !isMobile && (
 <video
 ref={videoRef}
 className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
 videoLoaded ? "opacity-100" : "opacity-0"
 }`}
 autoPlay={!shouldReduceMotion}
 muted={true}
 loop
 playsInline
 poster="/images/hero-fallback.svg"
 aria-label="Background video showcasing Crensa platform"
 preload={isMobile ? "none" : "metadata"}
 >
 <source src={content.backgroundVideo} type="video/mp4" />
 <track kind="descriptions" src="/videos/hero-background-description.vtt" srcLang="en" label="Video description" />
 </video>
 )}

 {}
 <div
 className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
 (videoLoaded && !videoError && !isMobile) ? "opacity-0" : "opacity-100"
 }`}
 style={{
 backgroundImage: "url(/images/hero-fallback.svg)",
 }}
 />

 {}
 <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />

 {}
 <motion.div
 className="relative z-10 container text-center px-4 sm:px-6 lg:px-8"
 variants={containerVariants}
 initial="hidden"
 animate="visible"
 >
 <motion.h1
 className={`text-white font-bold mb-4 sm:mb-6 leading-tight max-w-5xl mx-auto ${
 isMobile 
 ? "text-2xl sm:text-3xl" 
 : "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
 }`}
 variants={itemVariants}
 style={{ color: "#FFFFFF" }}
 >
 {content.headline}
 </motion.h1>

 <motion.p
 className={`text-white/90 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4 ${
 isMobile 
 ? "text-base sm:text-lg" 
 : "text-lg sm:text-xl md:text-2xl"
 }`}
 variants={itemVariants}
 >
 {content.subheadline}
 </motion.p>

 <motion.div variants={itemVariants}>
 <motion.a
 href={content.ctaLink}
 className={`inline-block bg-primary-neon-yellow text-primary-navy font-bold rounded-lg transition-all duration-200 hover:bg-primary-light-yellow focus:outline-none focus:ring-4 focus:ring-primary-neon-yellow/50 shadow-lg hover:shadow-xl ${
 isMobile 
 ? "text-base px-6 py-3 min-h-[44px] min-w-[44px]" 
 : "text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
 } ${isTouchDevice ? "touch-manipulation" : ""}`}
 variants={buttonVariants}
 whileHover="hover"
 whileTap="tap"
 aria-describedby="cta-description"
 style={{ 
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation'
 }}
 >
 {content.ctaText}
 </motion.a>
 <div id="cta-description" className="sr-only">
 Start your journey as a creator on the Crensa platform
 </div>
 </motion.div>
 </motion.div>
 </section>
 );
}
