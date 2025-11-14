"use client";

import { useState, useRef } from "react";
import {
 motion,
 useReducedMotion,
 useInView,
 AnimatePresence,
} from "framer-motion";
import type { FAQItem } from "@/types";
import { useResponsive } from "@/hooks/useResponsive";

interface FAQSectionProps {
 title: string;
 faqs: FAQItem[];
 className?: string;
}

const categoryLabels = {
 general: "General",
 creator: "For Creators",
 viewer: "For Viewers",
 payment: "Payments",
};

const categoryColors = {
 general: "from-accent-teal/10 to-accent-green/10 border-accent-teal/20",
 creator: "from-accent-pink/10 to-accent-bright-pink/10 border-accent-pink/20",
 viewer:
 "from-primary-neon-yellow/10 to-primary-light-yellow/10 border-primary-neon-yellow/20",
 payment: "from-accent-green/10 to-accent-teal/10 border-accent-green/20",
};

export function FAQSection({ title, faqs, className = "" }: FAQSectionProps) {
 const [searchTerm, setSearchTerm] = useState("");
 const [selectedCategory, setSelectedCategory] = useState<string>("all");
 const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

 const sectionRef = useRef<HTMLElement>(null);
 const isInView = useInView(sectionRef, {
 once: true,
 margin: "-100px 0px",
 });
 const shouldReduceMotion = useReducedMotion();
 const { isMobile, isTouchDevice } = useResponsive();

 const filteredFaqs = faqs.filter((faq) => {
 const matchesSearch =
 faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
 faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
 const matchesCategory =
 selectedCategory === "all" || faq.category === selectedCategory;
 return matchesSearch && matchesCategory;
 });

 const groupedFaqs = filteredFaqs.reduce((acc, faq, index) => {
 if (!acc[faq.category]) {
 acc[faq.category] = [];
 }
 acc[faq.category].push({ ...faq, originalIndex: index });
 return acc;
 }, {} as Record<string, (FAQItem & { originalIndex: number })[]>);

 const toggleExpanded = (index: number) => {
 const newExpanded = new Set(expandedItems);
 if (newExpanded.has(index)) {
 newExpanded.delete(index);
 } else {
 newExpanded.add(index);
 }
 setExpandedItems(newExpanded);
 };

 const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

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

 const faqItemVariants = {
 hidden: {
 opacity: 0,
 y: shouldReduceMotion ? 0 : 20,
 },
 visible: {
 opacity: 1,
 y: 0,
 transition: {
 duration: shouldReduceMotion ? 0.01 : 0.4,
 ease: "easeOut",
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
 <h2 className="headline mb-8">{title}</h2>

 {}
 <div className="max-w-2xl mx-auto space-y-6">
 {}
 <div className="relative">
 <input
 type="text"
 placeholder="Search frequently asked questions..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className={`w-full pl-12 rounded-lg border border-neutral-dark-gray/20 focus:border-accent-pink focus:ring-2 focus:ring-accent-pink/20 transition-colors duration-200 ${
 isMobile ? "px-3 py-3 text-base" : "px-4 py-3"
 } ${isTouchDevice ? "touch-manipulation" : ""}`}
 aria-label="Search FAQs"
 style={{
 WebkitTapHighlightColor: 'transparent',
 fontSize: isMobile ? '16px' : undefined, // Prevent zoom on iOS
 }}
 />
 <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-dark-gray">
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
 d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
 />
 </svg>
 </div>
 </div>

 {}
 <div className="flex flex-wrap justify-center gap-2">
 <button
 onClick={() => setSelectedCategory("all")}
 className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
 selectedCategory === "all"
 ? "bg-accent-pink text-neutral-white"
 : "bg-neutral-white text-neutral-dark-gray hover:bg-accent-pink/10"
 } ${isTouchDevice ? "touch-manipulation min-h-[44px]" : ""}`}
 aria-pressed={selectedCategory === "all"}
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 }}
 >
 All Categories
 </button>
 {categories.map((category) => (
 <button
 key={category}
 onClick={() => setSelectedCategory(category)}
 className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
 selectedCategory === category
 ? "bg-accent-pink text-neutral-white"
 : "bg-neutral-white text-neutral-dark-gray hover:bg-accent-pink/10"
 } ${isTouchDevice ? "touch-manipulation min-h-[44px]" : ""}`}
 aria-pressed={selectedCategory === category}
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 }}
 >
 {categoryLabels[category as keyof typeof categoryLabels]}
 </button>
 ))}
 </div>
 </div>
 </motion.div>

 {}
 <div className="max-w-4xl mx-auto">
 {Object.keys(groupedFaqs).length === 0 ? (
 <motion.div
 className="text-center py-12"
 variants={faqItemVariants}
 >
 <p className="text-neutral-dark-gray text-lg">
 No FAQs found matching your search criteria.
 </p>
 </motion.div>
 ) : (
 <div className={`grid gap-8 ${isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
 {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
 <motion.div
 key={category}
 className="space-y-4"
 variants={faqItemVariants}
 >
 {}
 <div
 className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${
 categoryColors[category as keyof typeof categoryColors]
 } border`}
 >
 <h3 className="text-sm font-semibold text-primary-navy">
 {categoryLabels[category as keyof typeof categoryLabels]}
 </h3>
 </div>

 {}
 <div className="space-y-3">
 {categoryFaqs.map((faq, index) => (
 <FAQItem
 key={faq.originalIndex}
 faq={faq}
 isExpanded={expandedItems.has(faq.originalIndex)}
 onToggle={() => toggleExpanded(faq.originalIndex)}
 shouldReduceMotion={shouldReduceMotion || false}
 />
 ))}
 </div>
 </motion.div>
 ))}
 </div>
 )}
 </div>
 </motion.div>
 </section>
 );
}

interface FAQItemProps {
 faq: FAQItem;
 isExpanded: boolean;
 onToggle: () => void;
 shouldReduceMotion: boolean;
}

function FAQItem({
 faq,
 isExpanded,
 onToggle,
 shouldReduceMotion,
}: FAQItemProps) {
 const { isMobile, isTouchDevice } = useResponsive();
 
 return (
 <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-dark-gray/10 overflow-hidden">
 <button
 onClick={onToggle}
 className={`w-full text-left flex items-center justify-between hover:bg-neutral-gray/50 transition-colors duration-200 focus:bg-neutral-gray/50 ${
 isMobile ? "px-4 py-4" : "px-6 py-4"
 } ${isTouchDevice ? "touch-manipulation min-h-[44px]" : ""}`}
 aria-expanded={isExpanded}
 aria-controls={`faq-answer-${faq.question
 .replace(/\s+/g, "-")
 .toLowerCase()}`}
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 }}
 >
 <h4 className={`font-semibold text-primary-navy pr-4 ${
 isMobile ? "text-base" : "text-lg"
 }`}>
 {faq.question}
 </h4>
 <motion.div
 animate={{ rotate: isExpanded ? 180 : 0 }}
 transition={{ duration: shouldReduceMotion ? 0.01 : 0.2 }}
 className="flex-shrink-0"
 >
 <svg
 className="w-5 h-5 text-accent-pink"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M19 9l-7 7-7-7"
 />
 </svg>
 </motion.div>
 </button>

 <AnimatePresence>
 {isExpanded && (
 <motion.div
 id={`faq-answer-${faq.question.replace(/\s+/g, "-").toLowerCase()}`}
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{
 duration: shouldReduceMotion ? 0.01 : 0.3,
 ease: "easeInOut",
 }}
 className="overflow-hidden"
 >
 <div className={`pb-4 pt-2 ${isMobile ? "px-4" : "px-6"}`}>
 <p className={`text-neutral-dark-gray leading-relaxed ${
 isMobile ? "text-sm" : "text-base"
 }`}>
 {faq.answer}
 </p>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
