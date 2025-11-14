"use client";

import { Feature } from "@/types";

interface FeatureCardProps {
 feature: Feature;
}

export default function FeatureCard({ feature }: FeatureCardProps) {
 return (
 <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 group border border-white/10 hover:border-white/30 h-full flex flex-col">
 <div className="flex flex-col items-center text-center h-full">
 {}
 <div className="w-20 h-20 bg-gradient-to-br from-accent-pink to-primary-neon-yellow rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
 <span className="text-3xl" role="img" aria-label={feature.title}>
 {feature.iconUrl}
 </span>
 </div>

 {}
 <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-primary-neon-yellow transition-colors duration-300">
 {feature.title}
 </h3>

 {}
 <p className="text-white/90 leading-relaxed text-lg flex-1">
 {feature.description}
 </p>
 </div>
 </div>
 );
}