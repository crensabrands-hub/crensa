"use client";

import Link from "next/link";
import Image from "next/image";

interface TrendingVideoCardProps {
 id: string;
 title: string;
 thumbnailUrl: string;
 duration: number;
 creatorName: string;
 creatorAvatar: string;
 price: number;
 category: string;
 href: string;
}

function formatDuration(seconds: number): string {
 const minutes = Math.floor(seconds / 60);
 const remainingSeconds = seconds % 60;
 return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function TrendingVideoCard({
 id,
 title,
 thumbnailUrl,
 duration,
 creatorName,
 creatorAvatar,
 price,
 category,
 href,
}: TrendingVideoCardProps) {
 return (
 <Link
 href={href}
 className="group relative flex flex-col flex-shrink-0 w-72 h-[360px] bg-gradient-to-br from-white to-neutral-gray rounded-3xl shadow-md transition-all duration-300 transform hover:scale-105 overflow-hidden border border-neutral-light-gray snap-start"
 >
 {}
 <div className="relative h-44 flex-shrink-0 overflow-hidden">
 <Image
 src={thumbnailUrl || "/images/hero-fallback.jpg"}
 alt={title}
 fill
 className="object-cover group-hover:scale-110 transition-transform duration-500"
 sizes="288px"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
 
 {}
 <div className="absolute top-3 left-3">
 <span className="px-3 py-1.5 bg-gradient-to-r from-accent-teal to-accent-bright-teal backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg">
 Video
 </span>
 </div>

 {}
 <div className="absolute bottom-3 right-3">
 <span className="px-3 py-1.5 bg-black/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg">
 {formatDuration(duration)}
 </span>
 </div>
 </div>

 {}
 <div className="flex flex-col flex-1 p-5">
 {}
 <h3 className="font-bold text-primary-navy line-clamp-2 text-base group-hover:text-accent-pink transition-colors mb-3 h-12">
 {title}
 </h3>

 {}
 <div className="flex items-center gap-2.5 mb-3">
 <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-accent-teal/20">
 <Image
 src={creatorAvatar || "/images/default-avatar.png"}
 alt={creatorName}
 fill
 className="object-cover"
 />
 </div>
 <p className="text-sm font-medium text-neutral-dark-gray truncate flex-1">
 {creatorName}
 </p>
 </div>

 {}
 <div className="flex items-center justify-between pt-3 border-t-2 border-neutral-light-gray mt-auto">
 <span className="text-xs font-semibold text-neutral-dark-gray px-2 py-1 bg-primary-navy/5 rounded-lg truncate max-w-[100px]">{category}</span>
 <div className="flex items-center gap-1.5 text-base font-bold bg-gradient-to-r from-accent-pink to-accent-teal bg-clip-text text-transparent flex-shrink-0">
 <span role="img" aria-label="coins" className="text-lg">🪙</span>
 <span>{price.toLocaleString('en-IN')}</span>
 </div>
 </div>
 </div>

 {}
 <div className="absolute inset-0 bg-gradient-to-t from-accent-teal/10 via-transparent to-accent-pink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />
 </Link>
 );
}
