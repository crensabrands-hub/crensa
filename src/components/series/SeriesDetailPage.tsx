'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Series, Video, WalletBalance } from '@/types';
import Image from 'next/image';
import SeriesVideoPlayer from './SeriesVideoPlayer';
import SeriesPurchaseModal from './SeriesPurchaseModal';

interface SeriesDetailPageProps {
 series: Series;
 currentVideo?: Video;
 isPurchased?: boolean;
 userProgress?: {
 completedVideos: string[];
 currentVideoId?: string;
 watchTime?: number;
 };
 onVideoSelect?: (video: Video) => void;
 onPurchase?: (seriesId: string) => Promise<boolean>;
 className?: string;
}

export default function SeriesDetailPage({
 series,
 currentVideo,
 isPurchased = false,
 userProgress,
 onVideoSelect,
 onPurchase,
 className = ''
}: SeriesDetailPageProps) {
 const [showPurchaseModal, setShowPurchaseModal] = useState(false);
 const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
 const [isLoading, setIsLoading] = useState(false);
 const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);

 useEffect(() => {
 const fetchWalletBalance = async () => {
 try {
 const response = await fetch('/api/wallet/balance');
 if (response.ok) {
 const data = await response.json();
 setWalletBalance(data);
 }
 } catch (error) {
 console.error('Error fetching wallet balance:', error);
 }
 };

 fetchWalletBalance();
 }, []);

 const formatDuration = (seconds: number): string => {
 const hours = Math.floor(seconds / 3600);
 const minutes = Math.floor((seconds % 3600) / 60);
 
 if (hours > 0) {
 return `${hours}h ${minutes}m`;
 }
 return `${minutes}m`;
 };

 const formatViewCount = (count: number): string => {
 if (count >= 1000000) {
 return `${(count / 1000000).toFixed(1)}M`;
 } else if (count >= 1000) {
 return `${(count / 1000).toFixed(1)}K`;
 }
 return count.toString();
 };

 const formatCoinPrice = (coins: number): string => {
 return `🪙 ${coins.toLocaleString('en-IN')}`;
 };

 const progressPercentage = userProgress?.completedVideos 
 ? (userProgress.completedVideos.length / series.videoCount) * 100 
 : 0;

 const handleVideoSelect = (video: Video, index: number) => {
 if (!isPurchased) {
 setShowPurchaseModal(true);
 return;
 }
 
 setSelectedVideoIndex(index);
 onVideoSelect?.(video);
 };

 const handlePurchase = async () => {
 if (!onPurchase) return;
 
 setIsLoading(true);
 try {
 const success = await onPurchase(series.id);
 if (success) {
 setShowPurchaseModal(false);
 }
 } catch (error) {
 console.error('Purchase failed:', error);
 } finally {
 setIsLoading(false);
 }
 };

 const handleNextVideo = () => {
 if (!series.videos || selectedVideoIndex >= series.videos.length - 1) return;
 const nextIndex = selectedVideoIndex + 1;
 const nextVideo = series.videos[nextIndex];
 if (nextVideo?.video) {
 handleVideoSelect(nextVideo.video, nextIndex);
 }
 };

 const handlePreviousVideo = () => {
 if (!series.videos || selectedVideoIndex <= 0) return;
 const prevIndex = selectedVideoIndex - 1;
 const prevVideo = series.videos[prevIndex];
 if (prevVideo?.video) {
 handleVideoSelect(prevVideo.video, prevIndex);
 }
 };

 return (
 <div className={`max-w-7xl mx-auto ${className}`}>
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
 {}
 <div className="lg:col-span-2 space-y-6">
 {}
 {currentVideo && isPurchased ? (
 <SeriesVideoPlayer
 video={currentVideo}
 series={series}
 onNext={handleNextVideo}
 onPrevious={handlePreviousVideo}
 hasNext={selectedVideoIndex < (series.videos?.length || 0) - 1}
 hasPrevious={selectedVideoIndex > 0}
 currentIndex={selectedVideoIndex}
 totalVideos={series.videoCount}
 />
 ) : (
 
 <div className="aspect-video bg-neutral-light-gray rounded-lg relative overflow-hidden">
 {series.thumbnailUrl ? (
 <Image
 src={series.thumbnailUrl}
 alt={series.title}
 fill
 className="object-cover"
 />
 ) : (
 <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/20 via-accent-teal/20 to-primary-neon-yellow/20" />
 )}
 
 {}
 <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
 <div className="text-center text-white">
 <motion.div
 className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4"
 whileHover={{ scale: 1.05 }}
 >
 <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
 </svg>
 </motion.div>
 <h3 className="text-xl font-semibold mb-2">Series Locked</h3>
 <p className="text-white/80 mb-4">Purchase this series to watch all videos</p>
 <button
 onClick={() => setShowPurchaseModal(true)}
 className="px-6 py-3 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors"
 >
 Purchase for {formatCoinPrice(series.coinPrice || series.totalPrice || 0)}
 </button>
 </div>
 </div>
 </div>
 )}

 {}
 <div className="space-y-4">
 <div>
 <h1 className="text-2xl lg:text-3xl font-bold text-primary-navy mb-2">
 {series.title}
 </h1>
 
 {}
 <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-dark-gray mb-4">
 <div className="flex items-center space-x-1">
 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
 <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
 <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
 </svg>
 <span>{formatViewCount(series.viewCount)} views</span>
 </div>
 
 <div className="flex items-center space-x-1">
 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
 <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
 </svg>
 <span>{series.videoCount} videos</span>
 </div>
 
 <div className="flex items-center space-x-1">
 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
 </svg>
 <span>{formatDuration(series.totalDuration)}</span>
 </div>
 
 <div className="bg-accent-teal/10 text-accent-teal px-2 py-1 rounded text-xs font-medium capitalize">
 {series.category}
 </div>
 </div>
 </div>

 {}
 <div className="flex items-center space-x-3 p-4 bg-neutral-light-gray/50 rounded-lg">
 <div className="relative">
 {series.creator?.avatar ? (
 <Image
 src={series.creator.avatar}
 alt={series.creator.displayName || series.creator.username}
 width={48}
 height={48}
 className="rounded-full object-cover"
 />
 ) : (
 <div className="w-12 h-12 bg-gradient-to-br from-accent-pink to-accent-teal rounded-full flex items-center justify-center">
 <span className="text-white text-lg font-semibold">
 {(series.creator?.displayName || series.creator?.username || 'U')[0].toUpperCase()}
 </span>
 </div>
 )}
 </div>
 <div>
 <h3 className="font-semibold text-primary-navy">
 {series.creator?.displayName || series.creator?.username || 'Unknown Creator'}
 </h3>
 <p className="text-sm text-neutral-dark-gray">Creator</p>
 </div>
 </div>

 {}
 {series.description && (
 <div>
 <h3 className="font-semibold text-primary-navy mb-2">About this series</h3>
 <p className="text-neutral-dark-gray leading-relaxed">
 {series.description}
 </p>
 </div>
 )}

 {}
 {series.tags && series.tags.length > 0 && (
 <div>
 <h3 className="font-semibold text-primary-navy mb-2">Tags</h3>
 <div className="flex flex-wrap gap-2">
 {series.tags.map((tag, index) => (
 <span
 key={index}
 className="bg-neutral-light-gray text-neutral-dark-gray px-3 py-1 rounded-full text-sm"
 >
 #{tag}
 </span>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>

 {}
 <div className="space-y-6">
 {}
 <div className="bg-white border border-neutral-light-gray rounded-lg p-6">
 {isPurchased ? (
 <div>
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-semibold text-primary-navy">Your Progress</h3>
 <span className="text-sm text-accent-teal font-medium">
 {Math.round(progressPercentage)}% Complete
 </span>
 </div>
 
 <div className="w-full bg-neutral-light-gray rounded-full h-2 mb-4">
 <motion.div
 className="bg-accent-teal h-2 rounded-full"
 initial={{ width: 0 }}
 animate={{ width: `${progressPercentage}%` }}
 transition={{ duration: 0.5, ease: "easeOut" }}
 />
 </div>
 
 <p className="text-sm text-neutral-dark-gray">
 {userProgress?.completedVideos?.length || 0} of {series.videoCount} videos completed
 </p>
 </div>
 ) : (
 <div>
 <h3 className="font-semibold text-primary-navy mb-2">Purchase Series</h3>
 <div className="text-3xl font-bold text-purple-600 mb-4">
 {formatCoinPrice(series.coinPrice || series.totalPrice || 0)}
 </div>
 <button
 onClick={() => setShowPurchaseModal(true)}
 className="w-full px-6 py-3 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors"
 >
 Purchase Series
 </button>
 <p className="text-xs text-neutral-dark-gray mt-2 text-center">
 One-time purchase • Lifetime access
 </p>
 </div>
 )}
 </div>

 {}
 <div className="bg-white border border-neutral-light-gray rounded-lg">
 <div className="p-4 border-b border-neutral-light-gray">
 <h3 className="font-semibold text-primary-navy">Series Videos</h3>
 </div>
 
 <div className="max-h-96 overflow-y-auto">
 {series.videos?.map((seriesVideo, index) => {
 const video = seriesVideo.video;
 if (!video) return null;
 
 const isCompleted = userProgress?.completedVideos?.includes(video.id);
 const isCurrent = currentVideo?.id === video.id;
 const isLocked = !isPurchased && index > 0; // First video might be preview
 
 return (
 <motion.div
 key={video.id}
 className={`p-4 border-b border-neutral-light-gray last:border-b-0 cursor-pointer hover:bg-neutral-light-gray/50 transition-colors ${
 isCurrent ? 'bg-accent-teal/10 border-l-4 border-l-accent-teal' : ''
 } ${isLocked ? 'opacity-60' : ''}`}
 onClick={() => handleVideoSelect(video, index)}
 whileHover={{ x: isLocked ? 0 : 4 }}
 transition={{ duration: 0.2 }}
 >
 <div className="flex items-start space-x-3">
 <div className="relative flex-shrink-0">
 <div className="w-16 h-12 bg-neutral-light-gray rounded overflow-hidden">
 <Image
 src={video.thumbnailUrl}
 alt={video.title}
 width={64}
 height={48}
 className="w-full h-full object-cover"
 />
 </div>
 
 {}
 <div className="absolute -top-1 -left-1 w-5 h-5 bg-primary-navy text-white text-xs rounded-full flex items-center justify-center font-semibold">
 {index + 1}
 </div>
 
 {}
 {isCompleted && (
 <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center">
 <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
 </svg>
 </div>
 )}
 
 {isLocked && (
 <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
 <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
 </svg>
 </div>
 )}
 </div>
 
 <div className="flex-1 min-w-0">
 <h4 className={`font-medium text-sm line-clamp-2 ${
 isCurrent ? 'text-accent-teal' : 'text-primary-navy'
 }`}>
 {video.title}
 </h4>
 <p className="text-xs text-neutral-dark-gray mt-1">
 {formatDuration(video.duration)}
 </p>
 </div>
 </div>
 </motion.div>
 );
 })}
 </div>
 </div>
 </div>
 </div>

 {}
 <AnimatePresence>
 {showPurchaseModal && walletBalance && (
 <SeriesPurchaseModal
 series={series}
 walletBalance={walletBalance}
 onClose={() => setShowPurchaseModal(false)}
 onPurchase={handlePurchase}
 isLoading={isLoading}
 />
 )}
 </AnimatePresence>
 </div>
 );
}