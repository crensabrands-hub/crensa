"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Series, Video } from "@/types";
import { AspectRatioVideoPlayer } from "@/components/watch";

interface SeriesVideoPlayerProps {
 video: Video;
 series: Series;
 onNext?: () => void;
 onPrevious?: () => void;
 hasNext?: boolean;
 hasPrevious?: boolean;
 currentIndex: number;
 totalVideos: number;
 onProgress?: (progress: number) => void;
 onComplete?: () => void;
 className?: string;
}

export default function SeriesVideoPlayer({
 video,
 series,
 onNext,
 onPrevious,
 hasNext = false,
 hasPrevious = false,
 currentIndex,
 totalVideos,
 onProgress,
 onComplete,
 className = "",
}: SeriesVideoPlayerProps) {
 const [showControls, setShowControls] = useState(true);
 const [isPlaying, setIsPlaying] = useState(false);
 const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

 useEffect(() => {
 if (showControls && isPlaying) {
 if (controlsTimeoutRef.current) {
 clearTimeout(controlsTimeoutRef.current);
 }

 controlsTimeoutRef.current = setTimeout(() => {
 setShowControls(false);
 }, 3000);
 }

 return () => {
 if (controlsTimeoutRef.current) {
 clearTimeout(controlsTimeoutRef.current);
 }
 };
 }, [showControls, isPlaying]);

 const handleMouseMove = () => {
 setShowControls(true);
 };

 useEffect(() => {
 const handleKeyPress = (e: KeyboardEvent) => {
 switch (e.key) {
 case "ArrowLeft":
 if (hasPrevious) {
 onPrevious?.();
 }
 break;
 case "ArrowRight":
 if (hasNext) {
 onNext?.();
 }
 break;
 case " ":
 e.preventDefault();

 break;
 }
 };

 window.addEventListener("keydown", handleKeyPress);
 return () => window.removeEventListener("keydown", handleKeyPress);
 }, [hasNext, hasPrevious, onNext, onPrevious]);

 return (
 <div
 className={`relative bg-black rounded-lg overflow-hidden ${className}`}
 onMouseMove={handleMouseMove}
 onMouseLeave={() => setShowControls(false)}
 >
 {}
 <AspectRatioVideoPlayer
 videoUrl={video.videoUrl}
 aspectRatio={video.aspectRatio}
 thumbnailUrl={video.thumbnailUrl}
 autoplay={false}
 controls={true}
 onPlay={() => setIsPlaying(true)}
 onPause={() => setIsPlaying(false)}
 onTimeUpdate={onProgress}
 onEnded={() => {
 onComplete?.();

 if (hasNext) {
 setTimeout(() => {
 onNext?.();
 }, 3000);
 }
 }}
 className="w-full"
 />

 {}
 <motion.div
 className="absolute inset-0 pointer-events-none"
 initial={{ opacity: 0 }}
 animate={{ opacity: showControls ? 1 : 0 }}
 transition={{ duration: 0.2 }}
 >
 {}
 <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 pointer-events-auto">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-white font-semibold text-lg line-clamp-1">
 {series.title}
 </h3>
 <p className="text-white/80 text-sm">
 Video {currentIndex + 1} of {totalVideos}
 </p>
 </div>

 {}
 <div className="flex items-center space-x-2">
 <div className="w-32 bg-white/20 rounded-full h-1">
 <div
 className="bg-white h-1 rounded-full transition-all duration-300"
 style={{
 width: `${((currentIndex + 1) / totalVideos) * 100}%`,
 }}
 />
 </div>
 <span className="text-white/80 text-sm">
 {Math.round(((currentIndex + 1) / totalVideos) * 100)}%
 </span>
 </div>
 </div>
 </div>

 {}
 <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-auto">
 {}
 {hasPrevious && (
 <motion.button
 onClick={onPrevious}
 className="w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.95 }}
 >
 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
 <path
 fillRule="evenodd"
 d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
 clipRule="evenodd"
 />
 </svg>
 </motion.button>
 )}

 <div className="flex-1" />

 {}
 {hasNext && (
 <motion.button
 onClick={onNext}
 className="w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.95 }}
 >
 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
 <path
 fillRule="evenodd"
 d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
 clipRule="evenodd"
 />
 </svg>
 </motion.button>
 )}
 </div>

 {}
 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pointer-events-auto">
 <div className="flex items-center justify-between">
 <div className="flex-1 min-w-0">
 <h4 className="text-white font-medium text-base line-clamp-1">
 {video.title}
 </h4>
 {video.description && (
 <p className="text-white/80 text-sm line-clamp-2 mt-1">
 {video.description}
 </p>
 )}
 </div>

 {}
 <div className="flex items-center space-x-2 ml-4">
 {}
 <button className="text-white/80 hover:text-white transition-colors">
 <svg
 className="w-5 h-5"
 fill="currentColor"
 viewBox="0 0 20 20"
 >
 <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.413V13H5.5z" />
 </svg>
 </button>

 {}
 <button className="text-white/80 hover:text-white transition-colors">
 <svg
 className="w-5 h-5"
 fill="currentColor"
 viewBox="0 0 20 20"
 >
 <path
 fillRule="evenodd"
 d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
 clipRule="evenodd"
 />
 </svg>
 </button>
 </div>
 </div>
 </div>
 </motion.div>

 {}
 {hasNext && (
 <motion.div
 className="absolute bottom-20 right-4 bg-black/80 text-white p-3 rounded-lg backdrop-blur-sm pointer-events-auto"
 initial={{ opacity: 0, x: 100 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 100 }}
 >
 <div className="flex items-center space-x-3">
 <div>
 <p className="text-sm font-medium">Up Next</p>
 <p className="text-xs text-white/80 line-clamp-1">
 {series.videos?.[currentIndex + 1]?.video?.title}
 </p>
 </div>
 <button
 onClick={onNext}
 className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
 >
 Play Now
 </button>
 </div>
 </motion.div>
 )}

 {}
 <div className="absolute top-4 right-4 opacity-0 hover:opacity-100 transition-opacity pointer-events-auto">
 <div className="bg-black/80 text-white p-2 rounded text-xs backdrop-blur-sm">
 <p>← Previous • → Next • Space Play/Pause</p>
 </div>
 </div>
 </div>
 );
}
