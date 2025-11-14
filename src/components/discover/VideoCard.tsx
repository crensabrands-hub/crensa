'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video } from '@/types';
import Image from 'next/image';

interface VideoCardProps {
 video: Video;
 isHovered?: boolean;
 onClick?: () => void;
 className?: string;
}

export default function VideoCard({
 video,
 isHovered = false,
 onClick,
 className = ''
}: VideoCardProps) {
 const [imageError, setImageError] = useState(false);
 const [imageLoading, setImageLoading] = useState(true);

 const formatDuration = (seconds: number): string => {
 const minutes = Math.floor(seconds / 60);
 const remainingSeconds = seconds % 60;
 return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
 };

 const formatViewCount = (count: number): string => {
 if (count >= 1000000) {
 return `${(count / 1000000).toFixed(1)}M`;
 } else if (count >= 1000) {
 return `${(count / 1000).toFixed(1)}K`;
 }
 return count.toString();
 };

 const formatTimeAgo = (date: Date | string): string => {
 const now = new Date();
 const targetDate = typeof date === 'string' ? new Date(date) : date;

 if (isNaN(targetDate.getTime())) {
 return 'Unknown';
 }
 
 const diffInHours = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60 * 60));
 
 if (diffInHours < 1) return 'Just now';
 if (diffInHours < 24) return `${diffInHours}h ago`;
 
 const diffInDays = Math.floor(diffInHours / 24);
 if (diffInDays < 7) return `${diffInDays}d ago`;
 
 const diffInWeeks = Math.floor(diffInDays / 7);
 if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
 
 const diffInMonths = Math.floor(diffInDays / 30);
 return `${diffInMonths}mo ago`;
 };

 return (
 <motion.div
 className={`bg-white rounded-lg shadow-sm border border-neutral-light-gray overflow-hidden cursor-pointer group ${className}`}
 whileHover={{ 
 y: -2,
 boxShadow: "0 8px 20px -5px rgba(0, 0, 0, 0.1), 0 6px 8px -5px rgba(0, 0, 0, 0.04)"
 }}
 whileTap={{ scale: 0.98 }}
 transition={{ duration: 0.2, ease: "easeOut" }}
 onClick={onClick}
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 }}
 >
 {}
 <div className="aspect-video relative overflow-hidden bg-neutral-light-gray">
 {!imageError ? (
 <>
 <Image
 src={video.thumbnailUrl}
 alt={video.title}
 fill
 className={`object-cover transition-all duration-300 ${
 isHovered ? 'scale-105' : 'scale-100'
 } ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
 onLoad={() => setImageLoading(false)}
 onError={() => {
 setImageError(true);
 setImageLoading(false);
 }}
 sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
 />
 
 {}
 {imageLoading && (
 <div className="absolute inset-0 bg-neutral-light-gray animate-pulse" />
 )}
 </>
 ) : (

 <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/20 via-accent-teal/20 to-primary-neon-yellow/20" />
 )}

 {}
 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
 <motion.div
 className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.95 }}
 >
 <svg 
 className="w-8 h-8 text-primary-navy ml-1" 
 fill="currentColor" 
 viewBox="0 0 24 24"
 >
 <path d="M8 5v14l11-7z" />
 </svg>
 </motion.div>
 </div>

 {}
 <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
 <motion.div
 className="bg-purple-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg flex items-center gap-1"
 whileHover={{ scale: 1.05 }}
 >
 <span role="img" aria-label="coins">🪙</span>
 <span>{video.coinPrice || video.creditCost || 0}</span>
 </motion.div>
 </div>

 {}
 <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3">
 <div className="bg-black/70 text-white px-2 py-1 rounded text-xs sm:text-sm font-medium">
 {formatDuration(video.duration)}
 </div>
 </div>

 {}
 <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
 <div className="bg-accent-teal/90 text-white px-2 py-1 rounded text-xs font-medium capitalize">
 {video.category}
 </div>
 </div>
 </div>

 {}
 <div className="p-3 sm:p-4">
 {}
 <h3 className="font-semibold text-primary-navy mb-2 line-clamp-2 group-hover:text-accent-pink transition-colors duration-200 leading-tight text-sm sm:text-base">
 {video.title}
 </h3>

 {}
 <div className="flex items-center space-x-2 mb-2 sm:mb-3">
 <div className="relative">
 {video.creator?.avatar ? (
 <Image
 src={video.creator.avatar}
 alt={video.creator.displayName || video.creator.username}
 width={20}
 height={20}
 className="rounded-full object-cover sm:w-6 sm:h-6"
 />
 ) : (
 <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-accent-pink to-accent-teal rounded-full flex items-center justify-center">
 <span className="text-white text-xs font-semibold">
 {(video.creator?.displayName || video.creator?.username || 'U')[0].toUpperCase()}
 </span>
 </div>
 )}
 </div>
 <span className="text-xs sm:text-sm text-neutral-dark-gray font-medium truncate">
 {video.creator?.displayName || video.creator?.username || 'Unknown Creator'}
 </span>
 </div>

 {}
 <div className="flex items-center justify-between text-xs text-neutral-dark-gray">
 <div className="flex items-center space-x-1">
 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
 <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
 <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
 </svg>
 <span className="text-xs">{formatViewCount(video.viewCount)} views</span>
 </div>
 <span className="text-xs">{formatTimeAgo(video.createdAt)}</span>
 </div>

 {}
 {video.tags && video.tags.length > 0 && (
 <div className="hidden sm:flex flex-wrap gap-1 mt-2">
 {video.tags.slice(0, 2).map((tag, index) => (
 <span
 key={index}
 className="text-xs bg-neutral-light-gray text-neutral-dark-gray px-2 py-1 rounded-full"
 >
 #{tag}
 </span>
 ))}
 {video.tags.length > 2 && (
 <span className="text-xs text-neutral-dark-gray">
 +{video.tags.length - 2} more
 </span>
 )}
 </div>
 )}
 </div>

 {}
 <motion.div
 className="absolute inset-0 bg-gradient-to-t from-primary-navy/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
 initial={false}
 animate={{ opacity: isHovered ? 1 : 0 }}
 />
 </motion.div>
 );
}