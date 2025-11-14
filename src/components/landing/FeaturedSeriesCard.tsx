"use client";

import Link from "next/link";
import Image from "next/image";

interface FeaturedSeriesCardProps {
 id: string;
 title: string;
 description: string;
 thumbnailUrl: string;
 episodeCount: number;
 creatorName: string;
 creatorAvatar: string;
 category: string;
 price: number;
 href: string;
 size?: "large" | "small";
}

export default function FeaturedSeriesCard({
 id,
 title,
 description,
 thumbnailUrl,
 episodeCount,
 creatorName,
 creatorAvatar,
 category,
 price,
 href,
 size = "large",
}: FeaturedSeriesCardProps) {
 const isLarge = size === "large";

 if (!isLarge) {
 return (
 <Link
 href={href}
 className="group relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-white to-neutral-gray shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01] border border-neutral-light-gray flex-1"
 >
 {}
 <div className="relative flex-1 min-h-[180px] overflow-hidden">
 <Image
 src={thumbnailUrl || "/images/hero-fallback.jpg"}
 alt={title}
 fill
 className="object-cover group-hover:scale-110 transition-transform duration-500"
 sizes="(max-width: 768px) 100vw, 50vw"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
 
 {}
 <div className="absolute top-3 left-3">
 <span className="px-3 py-1.5 bg-gradient-to-r from-accent-pink to-accent-bright-pink backdrop-blur-md text-white text-xs font-bold rounded-full shadow-lg">
 {category}
 </span>
 </div>

 {}
 <div className="absolute top-3 right-3">
 <span className="px-3 py-1.5 bg-white/95 backdrop-blur-md text-primary-navy text-xs font-bold rounded-full shadow-lg">
 {episodeCount} Ep
 </span>
 </div>

 {}
 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
 <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl">
 <svg
 className="w-8 h-8 text-accent-pink ml-1"
 fill="currentColor"
 viewBox="0 0 24 24"
 >
 <path d="M8 5v14l11-7z" />
 </svg>
 </div>
 </div>
 </div>

 {}
 <div className="flex flex-col p-4 bg-gradient-to-br from-white to-neutral-gray/30">
 {}
 <h3 className="text-base font-bold text-primary-navy line-clamp-2 group-hover:text-accent-pink transition-colors mb-2">
 {title}
 </h3>

 {}
 <p className="text-sm text-neutral-dark-gray line-clamp-1 mb-3 leading-relaxed">
 {description}
 </p>

 {}
 <div className="flex items-center gap-2.5 mb-3">
 <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-accent-pink/30">
 <Image
 src={creatorAvatar || "/images/default-avatar.png"}
 alt={creatorName}
 fill
 className="object-cover"
 />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-primary-navy truncate">
 {creatorName}
 </p>
 </div>
 </div>

 {}
 <div className="pt-2.5 border-t-2 border-neutral-light-gray">
 <div className="flex items-center justify-between">
 <span className="text-xs font-medium text-neutral-dark-gray">Price</span>
 <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-accent-pink/10 to-accent-teal/10 rounded-full">
 <span role="img" aria-label="coins" className="text-base">🪙</span>
 <span className="text-sm font-bold bg-gradient-to-r from-accent-pink to-accent-teal bg-clip-text text-transparent">
 {price.toLocaleString('en-IN')}
 </span>
 </div>
 </div>
 </div>
 </div>

 {}
 <div className="absolute inset-0 bg-gradient-to-t from-accent-pink/10 via-transparent to-accent-teal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />
 </Link>
 );
 }

 return (
 <Link
 href={href}
 className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01] border border-neutral-light-gray"
 >
 {}
 <div className="relative h-80 md:h-96 overflow-hidden flex-shrink-0">
 <Image
 src={thumbnailUrl || "/images/hero-fallback.jpg"}
 alt={title}
 fill
 className="object-cover group-hover:scale-110 transition-transform duration-500"
 sizes="(max-width: 768px) 100vw, 50vw"
 priority
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
 
 {}
 <div className="absolute top-6 left-6">
 <span className="px-4 py-2 bg-gradient-to-r from-accent-pink to-accent-bright-pink backdrop-blur-md text-white text-sm font-bold rounded-full shadow-xl">
 {category}
 </span>
 </div>

 {}
 <div className="absolute top-6 right-6">
 <span className="px-4 py-2 bg-white/95 backdrop-blur-md text-primary-navy text-sm font-bold rounded-full shadow-xl">
 {episodeCount} Episodes
 </span>
 </div>

 {}
 <div className="absolute bottom-0 left-0 right-0 p-8">
 <h3 className="text-3xl font-bold text-white line-clamp-2 drop-shadow-lg">
 {title}
 </h3>
 </div>
 </div>

 {}
 <div className="flex-1 flex flex-col p-8 bg-gradient-to-br from-white to-neutral-gray/30">
 <p className="text-neutral-dark-gray line-clamp-2 text-base leading-relaxed mb-4">
 {description}
 </p>

 {}
 <div className="flex items-center gap-3 mb-4">
 <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-accent-pink/30">
 <Image
 src={creatorAvatar || "/images/default-avatar.png"}
 alt={creatorName}
 fill
 className="object-cover"
 />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-primary-navy truncate">
 {creatorName}
 </p>
 <p className="text-xs text-neutral-dark-gray">Creator</p>
 </div>
 </div>

 {}
 <div className="mt-auto pt-4 border-t-2 border-neutral-light-gray">
 <div className="flex items-center justify-between">
 <span className="text-sm font-semibold text-neutral-dark-gray">Series Price</span>
 <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-pink/10 to-accent-teal/10 rounded-full">
 <span role="img" aria-label="coins" className="text-xl">🪙</span>
 <span className="text-lg font-bold bg-gradient-to-r from-accent-pink to-accent-teal bg-clip-text text-transparent">
 {price.toLocaleString('en-IN')}
 </span>
 </div>
 </div>
 </div>
 </div>

 {}
 <div className="absolute inset-0 bg-gradient-to-t from-accent-pink/5 via-transparent to-accent-teal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />
 </Link>
 );
}
