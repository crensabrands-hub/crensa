"use client";

import Link from "next/link";
import Image from "next/image";

interface UnifiedContentCardProps {
 id: string;
 type: "series" | "video";
 title: string;
 description: string;
 thumbnailUrl: string;
 creatorName: string;
 creatorAvatar: string;
 category: string;
 episodeCount?: number;
 duration?: number;
 price: number;
 href: string;
}

function formatDuration(seconds: number): string {
 const minutes = Math.floor(seconds / 60);
 const remainingSeconds = seconds % 60;
 return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function UnifiedContentCard({
 id,
 type,
 title,
 description,
 thumbnailUrl,
 creatorName,
 creatorAvatar,
 category,
 episodeCount,
 duration,
 price,
 href,
}: UnifiedContentCardProps) {
 const isSeries = type === "series";

 return (
 <Link
 href={href}
 className="group block bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
 >
 {}
 <div className="relative h-48 overflow-hidden">
 <Image
 src={thumbnailUrl || "/images/hero-fallback.jpg"}
 alt={title}
 fill
 className="object-cover group-hover:scale-110 transition-transform duration-500"
 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
 
 {}
 <div className="absolute top-3 left-3">
 <span
 className={`px-3 py-1 backdrop-blur-sm text-white text-xs font-semibold rounded ${
 isSeries ? "bg-accent-pink/90" : "bg-accent-teal/90"
 }`}
 >
 {isSeries ? "Series" : "Video"}
 </span>
 </div>

 {}
 <div className="absolute bottom-3 right-3">
 <span className="px-3 py-1 bg-black/80 backdrop-blur-sm text-white text-xs font-semibold rounded">
 {isSeries
 ? `${episodeCount} ${episodeCount === 1 ? "Episode" : "Episodes"}`
 : formatDuration(duration || 0)}
 </span>
 </div>

 {}
 <div className="absolute top-3 right-3">
 <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded">
 {category}
 </span>
 </div>
 </div>

 {}
 <div className="p-5 space-y-3">
 {}
 <h3 className="font-bold text-gray-900 line-clamp-2 text-lg group-hover:text-accent-pink transition-colors">
 {title}
 </h3>

 {}
 <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
 {description}
 </p>

 {}
 <div className="flex items-center gap-3 pt-2">
 <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
 <Image
 src={creatorAvatar || "/images/default-avatar.png"}
 alt={creatorName}
 fill
 className="object-cover"
 />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-gray-900 truncate">
 {creatorName}
 </p>
 </div>
 </div>

 {}
 <div className="pt-3 border-t border-gray-100">
 <div className="flex items-center justify-between">
 <span className="text-sm text-gray-500">
 {isSeries ? "Series Price" : "Video Price"}
 </span>
 <div className="flex items-center gap-1 text-lg font-bold text-purple-600">
 <span role="img" aria-label="coins">🪙</span>
 <span>{price.toLocaleString('en-IN')}</span>
 </div>
 </div>
 </div>
 </div>

 {}
 <div className="absolute inset-0 bg-gradient-to-t from-accent-pink/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
 </Link>
 );
}
