"use client";

import { useEffect } from "react";
import { ContentErrorBoundary } from "@/components/ContentErrorBoundary";
import NewHeader from "@/components/layout/NewHeader";
import { Footer } from "@/components/layout";
import { getLandingPageContent } from "@/lib/content-config";
import FeaturedHeroSection from "./FeaturedHeroSection";
import MustSeesSection from "./MustSeesSection";
import TrendingCreatorsSection from "./TrendingCreatorsSection";

export default function NewLandingPage() {
 const landingPageContent = getLandingPageContent();

 useEffect(() => {
 document.documentElement.style.scrollBehavior = "smooth";

 return () => {
 document.documentElement.style.scrollBehavior = "auto";
 };
 }, []);

 return (
 <div className="min-h-screen bg-gradient-to-br from-neutral-gray via-white to-neutral-light-gray">
 <ContentErrorBoundary sectionName="header">
 <NewHeader alwaysVisible />
 </ContentErrorBoundary>

 <main id="main-content" className="min-h-screen pt-16 md:pt-20">
 {}
 <ContentErrorBoundary sectionName="featured-hero">
 <FeaturedHeroSection className="bg-transparent" />
 </ContentErrorBoundary>

 {}
 <ContentErrorBoundary sectionName="must-sees">
 <MustSeesSection
 limit={10}
 className="bg-white/50 backdrop-blur-sm"
 />
 </ContentErrorBoundary>

 {}
 <ContentErrorBoundary sectionName="trending-creators">
 <section className="py-16 px-4 bg-gradient-to-b from-transparent to-primary-navy/5">
 <div className="container mx-auto max-w-7xl">
 <div className="mb-10">
 <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-pink/10 to-accent-teal/10 rounded-full text-primary-navy font-semibold mb-4 shadow-sm">
 <span className="w-2.5 h-2.5 bg-accent-pink rounded-full animate-pulse"></span>
 Featured Creators
 </div>
 <div className="flex items-end justify-between gap-4 mb-3">
 <h2 className="text-3xl md:text-5xl font-bold text-primary-navy">
 Trending Creators
 </h2>
 <a
 href="/creators"
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
 </a>
 </div>
 <p className="text-lg text-neutral-dark-gray max-w-2xl">
 Discover amazing content from our top creators
 </p>
 </div>
 <TrendingCreatorsSection limit={10} />
 </div>
 </section>
 </ContentErrorBoundary>
 </main>

 <ContentErrorBoundary sectionName="footer">
 <Footer content={landingPageContent.footer} />
 </ContentErrorBoundary>
 </div>
 );
}
