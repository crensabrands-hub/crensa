"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { FeatureItem } from "@/types";

interface HowItWorksSectionProps {
 title: string;
 steps: FeatureItem[];
 className?: string;
}

export function HowItWorksSection({
 title,
 steps,
 className = "",
}: HowItWorksSectionProps) {
 const sectionRef = useRef<HTMLElement>(null);
 const isInView = useInView(sectionRef, {
 once: true,
 margin: "-100px 0px",
 });
 const shouldReduceMotion = useReducedMotion();

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

 const stepVariants = {
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
 duration: shouldReduceMotion ? 0.01 : 0.7,
 ease: "easeOut",
 },
 },
 };

 const lineVariants = {
 hidden: {
 scaleX: 0,
 opacity: 0,
 },
 visible: {
 scaleX: 1,
 opacity: 1,
 transition: {
 duration: shouldReduceMotion ? 0.01 : 0.8,
 ease: "easeOut",
 delay: shouldReduceMotion ? 0 : 0.3,
 },
 },
 };

 const numberVariants = {
 hidden: {
 scale: shouldReduceMotion ? 1 : 0.8,
 opacity: 0,
 },
 visible: {
 scale: 1,
 opacity: 1,
 transition: {
 duration: shouldReduceMotion ? 0.01 : 0.5,
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
 className={`section-padding bg-neutral-gray ${className}`}
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
 <h2 className="headline mb-4">{title}</h2>
 <p className="subheadline max-w-3xl mx-auto">
 Get started in three simple steps and begin monetizing your content
 today
 </p>
 </motion.div>

 {}
 <div className="max-w-6xl mx-auto">
 {}
 <div className="block lg:hidden space-y-8">
 {steps.map((step, index) => (
 <motion.div
 key={index}
 className="flex items-start gap-6 group"
 variants={stepVariants}
 whileHover={{ x: shouldReduceMotion ? 0 : 8 }}
 transition={{ duration: 0.3, ease: "easeOut" }}
 >
 {}
 <motion.div
 className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-accent-pink to-accent-teal flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
 variants={numberVariants}
 whileHover="hover"
 >
 {index + 1}
 </motion.div>

 {}
 <div className="flex-1 pt-2">
 <div className="flex items-center gap-3 mb-3">
 <span
 className="text-3xl"
 role="img"
 aria-label={`${step.title} icon`}
 >
 {step.icon}
 </span>
 <h3 className="text-xl md:text-2xl font-semibold text-primary-navy group-hover:text-accent-pink transition-colors duration-300">
 {step.title}
 </h3>
 </div>
 <p className="text-neutral-dark-gray leading-relaxed">
 {step.description}
 </p>
 </div>
 </motion.div>
 ))}
 </div>

 {}
 <div className="hidden lg:block">
 <div className="relative">
 {}
 <motion.div
 className="absolute top-8 left-8 right-8 h-0.5 bg-gradient-to-r from-accent-pink to-accent-teal origin-left"
 variants={lineVariants}
 style={{ transformOrigin: "left center" }}
 />

 {}
 <div className="grid grid-cols-3 gap-8">
 {steps.map((step, index) => (
 <motion.div
 key={index}
 className="text-center group cursor-pointer"
 variants={stepVariants}
 whileHover={{ y: shouldReduceMotion ? 0 : -12 }}
 transition={{ duration: 0.3, ease: "easeOut" }}
 >
 {}
 <motion.div
 className="relative w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent-pink to-accent-teal flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300 z-10"
 variants={numberVariants}
 whileHover="hover"
 >
 {index + 1}
 </motion.div>

 {}
 <div className="mb-4">
 <span
 className="text-4xl block mb-3"
 role="img"
 aria-label={`${step.title} icon`}
 >
 {step.icon}
 </span>
 <h3 className="text-xl md:text-2xl font-semibold text-primary-navy group-hover:text-accent-pink transition-colors duration-300">
 {step.title}
 </h3>
 </div>

 {}
 <p className="text-neutral-dark-gray leading-relaxed max-w-sm mx-auto">
 {step.description}
 </p>
 </motion.div>
 ))}
 </div>
 </div>
 </div>
 </div>

 {}
 <motion.div
 className="text-center mt-12 lg:mt-16"
 variants={headerVariants}
 >
 <motion.button
 className="btn-primary text-lg px-8 py-4"
 whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
 whileTap={{ scale: shouldReduceMotion ? 1 : 0.95 }}
 transition={{ duration: 0.2 }}
 >
 Get Started Now
 </motion.button>
 </motion.div>
 </motion.div>
 </section>
 );
}
