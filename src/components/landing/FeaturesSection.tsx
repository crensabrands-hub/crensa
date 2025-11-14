"use client";

import { Feature } from "@/types";
import FeatureCard from "./FeatureCard";

interface FeaturesSectionProps {
 features?: Feature[];
 loading?: boolean;
}

const defaultFeatures: Feature[] = [
 {
 id: "1",
 title: "Series & Collections",
 description:
 "Create and organize video series with bundled pricing for better monetization and viewer engagement",
 iconUrl: "🎬",
 order: 1,
 },
 {
 id: "2",
 title: "Flexible Video Formats",
 description:
 "Support for multiple aspect ratios including vertical, horizontal, and square videos optimized for any device",
 iconUrl: "📱",
 order: 2,
 },
 {
 id: "3",
 title: "Direct Monetization",
 description:
 "Earn credits directly from viewers with transparent pricing, instant payouts, and no hidden fees",
 iconUrl: "💎",
 order: 3,
 },
 {
 id: "4",
 title: "Advanced Analytics",
 description:
 "Track performance, earnings, and audience engagement with detailed insights and real-time data",
 iconUrl: "📈",
 order: 4,
 },
 {
 id: "5",
 title: "Smart Discovery",
 description:
 "AI-powered trending algorithms and category-based browsing help viewers discover your content",
 iconUrl: "🚀",
 order: 5,
 },
 {
 id: "6",
 title: "Premium Memberships",
 description:
 "Offer exclusive content and benefits through tiered membership plans with recurring revenue",
 iconUrl: "👑",
 order: 6,
 },
];

export default function FeaturesSection({
 features = defaultFeatures,
 loading = false,
}: FeaturesSectionProps) {
 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {Array.from({ length: 6 }).map((_, index) => (
 <div
 key={index}
 className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 animate-pulse border border-white/10"
 >
 <div className="w-16 h-16 bg-white/20 rounded-2xl mb-6"></div>
 <div className="h-6 bg-white/20 rounded mb-4"></div>
 <div className="space-y-3">
 <div className="h-4 bg-white/20 rounded"></div>
 <div className="h-4 bg-white/20 rounded w-4/5"></div>
 <div className="h-4 bg-white/20 rounded w-3/4"></div>
 </div>
 </div>
 ))}
 </div>
 );
 }

 const sortedFeatures = [...features].sort((a, b) => a.order - b.order);

 return (
 <div className="max-w-7xl mx-auto">
 {}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
 {sortedFeatures.map((feature) => (
 <div key={feature.id} className="h-full">
 <FeatureCard feature={feature} />
 </div>
 ))}
 </div>

 {}
 <div className="text-center">
 <div className="inline-flex flex-col sm:flex-row gap-4 items-center justify-center">
 <button className="px-8 py-4 bg-white text-primary-navy font-semibold rounded-xl hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
 Start Creating Today
 </button>
 <button className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 transition-all duration-300">
 Learn More
 </button>
 </div>
 <p className="text-white/70 text-sm mt-4">
 Join thousands of creators already earning on Crensa
 </p>
 </div>
 </div>
 );
}
