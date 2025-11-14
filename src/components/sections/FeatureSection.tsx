"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { FeatureItem } from "@/types";

interface FeatureSectionProps {
 title: string;
 subtitle?: string;
 features: FeatureItem[];
 className?: string;
}

export function FeatureSection({ 
 title, 
 subtitle, 
 features, 
 className = "" 
}: FeatureSectionProps) {
 const sectionRef = useRef<HTMLElement>(null);
 const isInView = useInView(sectionRef, { 
 once: true, 
 margin: "-100px 0px" 
 });
 const shouldReduceMotion = useReducedMotion();

 const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 duration: shouldReduceMotion ? 0.01 : 0.6,
 staggerChildren: shouldReduceMotion ? 0 : 0.15,
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

 const featureVariants = {
 hidden: {
 opacity: 0,
 y: shouldReduceMotion ? 0 : 40,
 scale: shouldReduceMotion ? 1 : 0.95,
 },
 visible: {
 opacity: 1,
 y: 0,
 scale: 1,
 transition: {
 duration: shouldReduceMotion ? 0.01 : 0.6,
 ease: "easeOut",
 },
 },
 };

 const iconVariants = {
 hidden: {
 scale: shouldReduceMotion ? 1 : 0.8,
 opacity: 0,
 },
 visible: {
 scale: 1,
 opacity: 1,
 transition: {
 duration: shouldReduceMotion ? 0.01 : 0.4,
 ease: "easeOut",
 },
 },
 hover: {
 scale: shouldReduceMotion ? 1 : 1.1,
 transition: {
 duration: 0.2,
 ease: "easeInOut",
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
 className="text-center mb-12 lg:mb-16"
 variants={headerVariants}
 >
 <h2 className="headline mb-4">
 {title}
 </h2>
 {subtitle && (
 <p className="subheadline max-w-3xl mx-auto">
 {subtitle}
 </p>
 )}
 </motion.div>

 {}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
 {features.map((feature, index) => (
 <motion.div
 key={index}
 className="text-center group"
 variants={featureVariants}
 whileHover={{ y: shouldReduceMotion ? 0 : -8 }}
 transition={{ duration: 0.3, ease: "easeOut" }}
 >
 {}
 <motion.div
 className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-accent-pink/10 to-accent-teal/10 border border-accent-pink/20 group-hover:border-accent-pink/40 transition-colors duration-300"
 variants={iconVariants}
 whileHover="hover"
 >
 <span 
 className="text-4xl"
 role="img"
 aria-label={`${feature.title} icon`}
 >
 {feature.icon}
 </span>
 </motion.div>

 {}
 <h3 className="text-xl md:text-2xl font-semibold text-primary-navy mb-4 group-hover:text-accent-pink transition-colors duration-300">
 {feature.title}
 </h3>
 
 <p className="text-neutral-dark-gray leading-relaxed max-w-sm mx-auto">
 {feature.description}
 </p>
 </motion.div>
 ))}
 </div>
 </motion.div>
 </section>
 );
}