"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SeriesCardProps {
 id: string;
 title: string;
 thumbnailUrl: string | null;
 coinPrice: number;
 videoCount: number;
 creatorName: string;
 creatorAvatar?: string;
 onClick?: () => void;
}

export default function SeriesCard({
 id,
 title,
 thumbnailUrl,
 coinPrice,
 videoCount,
 creatorName,
 creatorAvatar,
 onClick,
}: SeriesCardProps) {
 const router = useRouter();

 const handleClick = () => {
 if (onClick) {
 onClick();
 } else {
 router.push(`/series/${id}`);
 }
 };

 const handleKeyDown = (e: React.KeyboardEvent) => {
 if (e.key === "Enter" || e.key === " ") {
 e.preventDefault();
 handleClick();
 }
 };

 const rupeePrice = (coinPrice / 20).toFixed(2);

 return (
 <motion.div
 whileHover={{ scale: 1.02, y: -4 }}
 whileTap={{ scale: 0.98 }}
 className="cursor-pointer group"
 onClick={handleClick}
 onKeyDown={handleKeyDown}
 role="button"
 tabIndex={0}
 aria-label={`View series: ${title}`}
 >
 <div className="bg-white rounded-xl shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl">
 {}
 <div className="relative aspect-video bg-neutral-light-gray">
 {thumbnailUrl ? (
 <Image
 src={thumbnailUrl}
 alt={title}
 fill
 className="object-cover"
 sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-navy to-primary-navy/80">
 <svg
 className="w-16 h-16 text-white/50"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={1.5}
 d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
 />
 </svg>
 </div>
 )}

 {}
 <div className="absolute top-3 left-3 bg-primary-neon-yellow text-primary-navy px-3 py-1 rounded-full text-xs font-bold shadow-md">
 SERIES
 </div>

 {}
 <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm">
 {videoCount} {videoCount === 1 ? "video" : "videos"}
 </div>

 {}
 <div className="absolute inset-0 bg-primary-navy/0 group-hover:bg-primary-navy/10 transition-colors duration-300" />
 </div>

 {}
 <div className="p-4">
 {}
 <h3 className="text-lg font-bold text-primary-navy mb-2 line-clamp-2 group-hover:text-primary-navy/80 transition-colors">
 {title}
 </h3>

 {}
 <div className="flex items-center gap-2 mb-3">
 {creatorAvatar ? (
 <Image
 src={creatorAvatar}
 alt={creatorName}
 width={24}
 height={24}
 className="rounded-full"
 />
 ) : (
 <div className="w-6 h-6 rounded-full bg-primary-navy/10 flex items-center justify-center">
 <span className="text-xs font-semibold text-primary-navy">
 {creatorName.charAt(0).toUpperCase()}
 </span>
 </div>
 )}
 <span className="text-sm text-neutral-dark-gray truncate">
 {creatorName}
 </span>
 </div>

 {}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className="flex items-center gap-1">
 <svg
 className="w-5 h-5 text-primary-neon-yellow"
 fill="currentColor"
 viewBox="0 0 20 20"
 >
 <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
 <path
 fillRule="evenodd"
 d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
 clipRule="evenodd"
 />
 </svg>
 <span className="text-lg font-bold text-primary-navy">
 {coinPrice.toLocaleString()}
 </span>
 </div>
 <span className="text-sm text-neutral-dark-gray">
 (₹{rupeePrice})
 </span>
 </div>

 {}
 <button
 className="px-4 py-2 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors text-sm"
 onClick={(e) => {
 e.stopPropagation();
 handleClick();
 }}
 aria-label={`View ${title} series`}
 >
 View
 </button>
 </div>
 </div>
 </div>
 </motion.div>
 );
}
