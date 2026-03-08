'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Play, Lock, Clock, Eye, Video as VideoIcon, Tag } from 'lucide-react';
import type { PriceCalculation } from '@/lib/services/seriesAccessService';

interface SeriesVideo {
 id: string;
 seriesId: string;
 videoId: string;
 orderIndex: number;
 accessType: 'free' | 'paid' | 'series-only';
 individualCoinPrice: number;
 createdAt: Date;
 video: {
 id: string;
 title: string;
 description?: string;
 videoUrl: string;
 thumbnailUrl: string;
 duration: number;
 coinPrice: number;
 category: string;
 tags: string[];
 viewCount: number;
 isActive: boolean;
 createdAt: Date;
 };
}

interface Series {
 id: string;
 creatorId: string;
 title: string;
 description?: string;
 thumbnailUrl?: string;
 totalPrice: number;
 coinPrice: number;
 videoCount: number;
 totalDuration: number;
 category: string;
 tags: string[];
 viewCount: number;
 totalEarnings: number;
 isActive: boolean;
 moderationStatus: string;
 moderationReason?: string;
 moderatedAt?: Date;
 moderatedBy?: string;
 createdAt: Date;
 updatedAt: Date;
 creator: {
 id: string;
 username: string;
 displayName: string;
 avatar?: string;
 };
 videos: SeriesVideo[];
}

interface SeriesDetailClientProps {
 series: Series;
 hasAccess: boolean;
 accessType?: 'series_purchase' | 'creator_access' | 'video_purchase';
 priceCalculation: PriceCalculation | null;
 userId?: string;
 isAuthenticated: boolean;
}

export default function SeriesDetailClient({
 series,
 hasAccess,
 accessType,
 priceCalculation,
 userId,
 isAuthenticated,
}: SeriesDetailClientProps) {
 const router = useRouter();
 const [showPurchaseModal, setShowPurchaseModal] = useState(false);
 const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

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
 const rupees = (coins / 20).toFixed(2);
 return `${coins.toLocaleString('en-IN')} coins (₹${rupees})`;
 };

 const handleVideoClick = (videoId: string) => {
 if (!hasAccess) {
 setShowPurchaseModal(true);
 return;
 }

 router.push(`/watch/${videoId}`);
 };

 const handlePurchaseClick = () => {
 if (!isAuthenticated) {
 router.push('/sign-in');
 return;
 }

 // If series is free, don't show purchase modal
 if (series.coinPrice === 0) {
 return;
 }

 setShowPurchaseModal(true);
 };

 const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
 const currentVideo = series.videos[currentVideoIndex]?.video;

 const handleVideoSelect = async (index: number) => {
 const seriesVideo = series.videos[index];
 if (!seriesVideo) return;

 // Check if video is free - anyone can watch
 if (seriesVideo.accessType === 'free') {
 if (!isAuthenticated) {
 router.push('/sign-in');
 return;
 }
 // Free videos can be watched directly
 router.push(`/watch/${seriesVideo.video.id}`);
 return;
 }

 // If user has series access, they can watch any video
 if (hasAccess) {
 setCurrentVideoIndex(index);
 return;
 }

 // For paid or series-only videos without access
 if (seriesVideo.accessType === 'paid') {
 // TODO: Show individual video purchase modal
 // For now, redirect to watch page which will handle the purchase
 router.push(`/watch/${seriesVideo.video.id}`);
 return;
 }

 // Series-only videos require series purchase
 if (series.coinPrice === 0) {
 // Free series - just navigate
 router.push(`/watch/${seriesVideo.video.id}`);
 return;
 }

 setShowPurchaseModal(true);
 };

 return (
 <div className="min-h-screen bg-white">
 <div className="max-w-7xl mx-auto px-4 py-8">
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {}
 <div className="lg:col-span-2 space-y-6">
 {}
 <div className="aspect-video bg-neutral-light-gray rounded-lg relative overflow-hidden">
 {hasAccess && currentVideo ? (
 <video
 key={currentVideo.id}
 controls
 className="w-full h-full"
 poster={currentVideo.thumbnailUrl}
 >
 <source src={currentVideo.videoUrl} type="video/mp4" />
 Your browser does not support the video tag.
 </video>
 ) : series.thumbnailUrl ? (
 <Image
 src={series.thumbnailUrl}
 alt={series.title}
 fill
 className="object-cover"
 priority
 />
 ) : (
 <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/20 via-accent-teal/20 to-primary-neon-yellow/20" />
 )}

 {}
 {!hasAccess && series.coinPrice > 0 && (
 <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
 <div className="text-center text-white">
 <motion.div
 className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4"
 whileHover={{ scale: 1.05 }}
 >
 <Lock className="w-10 h-10" />
 </motion.div>
 <h3 className="text-xl font-semibold mb-2">Series Locked</h3>
 <p className="text-white/80 mb-4">Purchase this series to watch all videos</p>
 <button
 onClick={handlePurchaseClick}
 className="px-6 py-3 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors"
 >
 Purchase Series
 </button>
 </div>
 </div>
 )}

 {}
 {!hasAccess && series.coinPrice === 0 && (
 <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
 <div className="text-center text-white">
 <motion.div
 className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4"
 whileHover={{ scale: 1.05 }}
 >
 <Play className="w-10 h-10" fill="white" />
 </motion.div>
 <h3 className="text-xl font-semibold mb-2">Free Series</h3>
 <p className="text-white/80 mb-4">
 {isAuthenticated ? 'Click any video to start watching' : 'Sign in to watch this free series'}
 </p>
 {!isAuthenticated && (
 <button
 onClick={() => router.push('/sign-in')}
 className="px-6 py-3 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors"
 >
 Sign In to Watch
 </button>
 )}
 </div>
 </div>
 )}

 {}
 {hasAccess && accessType === 'series_purchase' && (
 <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2" style={{ display: 'none' }}>
 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
 <path
 fillRule="evenodd"
 d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
 clipRule="evenodd"
 />
 </svg>
 <span>Purchased</span>
 </div>
 )}
 </div>

 {}
 <div className="space-y-4">
 {}
 <h1 className="text-3xl lg:text-4xl font-bold text-primary-navy">
 {hasAccess && currentVideo ? currentVideo.title : series.title}
 </h1>

 {}
 {hasAccess && currentVideo && (
 <p className="text-neutral-dark-gray">
 Video {currentVideoIndex + 1} of {series.videos.length}
 </p>
 )}

 {}
 <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-dark-gray">
 <div className="flex items-center space-x-2">
 <Eye className="w-4 h-4" />
 <span>{formatViewCount(series.viewCount)} views</span>
 </div>

 <div className="flex items-center space-x-2">
 <VideoIcon className="w-4 h-4" />
 <span>{series.videoCount} {series.videoCount === 1 ? 'video' : 'videos'}</span>
 </div>

 <div className="flex items-center space-x-2">
 <Clock className="w-4 h-4" />
 <span>{formatDuration(series.totalDuration)}</span>
 </div>

 <div className="bg-accent-teal/10 text-accent-teal px-3 py-1 rounded-full text-xs font-medium capitalize">
 {series.category}
 </div>
 </div>

 {}
 <div className="flex items-center space-x-3 p-4 bg-neutral-light-gray/50 rounded-lg">
 <div className="relative">
 {series.creator.avatar ? (
 <Image
 src={series.creator.avatar}
 alt={series.creator.displayName}
 width={48}
 height={48}
 className="rounded-full object-cover"
 />
 ) : (
 <div className="w-12 h-12 bg-gradient-to-br from-accent-pink to-accent-teal rounded-full flex items-center justify-center">
 <span className="text-white text-lg font-semibold">
 {series.creator.displayName[0].toUpperCase()}
 </span>
 </div>
 )}
 </div>
 <div>
 <h3 className="font-semibold text-primary-navy">
 {series.creator.displayName}
 </h3>
 <p className="text-sm text-neutral-dark-gray">Creator</p>
 </div>
 </div>

 {}
 {series.description && (
 <div>
 <h3 className="font-semibold text-primary-navy mb-2">
 {hasAccess && currentVideo ? 'Video Description' : 'About this series'}
 </h3>
 <p className="text-neutral-dark-gray leading-relaxed whitespace-pre-wrap">
 {hasAccess && currentVideo ? currentVideo.description || series.description : series.description}
 </p>
 </div>
 )}

 {}
 {series.tags && series.tags.length > 0 && (
 <div>
 <h3 className="font-semibold text-primary-navy mb-2 flex items-center space-x-2">
 <Tag className="w-4 h-4" />
 <span>Tags</span>
 </h3>
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
 <div className="bg-white border border-neutral-light-gray rounded-lg p-6 sticky top-4">
 {hasAccess ? (
 <div>
 <div className="flex items-center justify-center mb-4">
 <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
 <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
 <path
 fillRule="evenodd"
 d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
 clipRule="evenodd"
 />
 </svg>
 </div>
 </div>
 <h3 className="text-center font-semibold text-primary-navy mb-2">
 {accessType === 'creator_access' ? 'Your Series' : 'Purchased'}
 </h3>
 <p className="text-center text-sm text-neutral-dark-gray">
 You have full access to all videos in this series
 </p>
 </div>
 ) : priceCalculation?.allVideosOwned ? (
 <div>
 <h3 className="font-semibold text-primary-navy mb-2">All Videos Owned</h3>
 <p className="text-sm text-neutral-dark-gray mb-4">
 You already own all videos in this series individually
 </p>
 <div className="bg-green-50 border border-green-200 rounded-lg p-4">
 <p className="text-sm text-green-800">
 No additional purchase needed!
 </p>
 </div>
 </div>
 ) : series.coinPrice === 0 ? (
 <div>
 <div className="flex items-center justify-center mb-4">
 <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
 <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
 <path
 fillRule="evenodd"
 d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
 clipRule="evenodd"
 />
 </svg>
 </div>
 </div>
 <h3 className="text-center font-semibold text-primary-navy mb-2">Free Series</h3>
 <p className="text-center text-sm text-neutral-dark-gray mb-4">
 This series is completely free to watch
 </p>
 <div className="bg-green-50 border border-green-200 rounded-lg p-4">
 <p className="text-sm text-green-800 text-center">
 {isAuthenticated ? 'Click any video to start watching!' : 'Sign in to start watching'}
 </p>
 </div>
 {!isAuthenticated && (
 <button
 onClick={() => router.push('/sign-in')}
 className="w-full mt-4 px-6 py-3 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors"
 >
 Sign In to Watch
 </button>
 )}
 </div>
 ) : (
 <div>
 <h3 className="font-semibold text-primary-navy mb-2">Purchase Series</h3>

 {priceCalculation && priceCalculation.ownedVideos.length > 0 ? (
 <div className="space-y-3 mb-4">
 <div className="text-sm text-neutral-dark-gray">
 <div className="flex justify-between mb-1">
 <span>Original Price:</span>
 <span className="line-through">{priceCalculation.originalPrice} coins</span>
 </div>
 <div className="flex justify-between mb-1 text-green-600">
 <span>Your Videos:</span>
 <span>-{priceCalculation.totalDeduction} coins</span>
 </div>
 <div className="border-t border-neutral-light-gray pt-2 mt-2">
 <div className="flex justify-between font-semibold text-primary-navy">
 <span>You Pay:</span>
 <span>{priceCalculation.adjustedPrice} coins</span>
 </div>
 </div>
 </div>
 <div className="text-xs text-neutral-dark-gray">
 ₹{(priceCalculation.adjustedPrice / 20).toFixed(2)}
 </div>
 </div>
 ) : (
 <div className="mb-4">
 <div className="text-3xl font-bold text-purple-600 mb-1">
 {series.coinPrice} coins
 </div>
 <div className="text-sm text-neutral-dark-gray">
 ₹{(series.coinPrice / 20).toFixed(2)}
 </div>
 </div>
 )}

 <button
 onClick={handlePurchaseClick}
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
 <div className="bg-white border border-neutral-light-gray rounded-lg overflow-hidden">
 <div className="p-4 border-b border-neutral-light-gray bg-neutral-light-gray/30">
 <h3 className="font-semibold text-primary-navy">Series Videos ({series.videos.length})</h3>
 </div>

 <div className="max-h-[600px] overflow-y-auto">
 {series.videos.length === 0 ? (
 <div className="p-8 text-center text-neutral-dark-gray">
 <VideoIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
 <p>No videos in this series yet</p>
 </div>
 ) : (
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
 {series.videos.map((seriesVideo, index) => {
 const video = seriesVideo.video;
 const isFree = seriesVideo.accessType === 'free';
 const isPaid = seriesVideo.accessType === 'paid';
 const isSeriesOnly = seriesVideo.accessType === 'series-only';
 const isLocked = !hasAccess && !isFree;
 const isActive = hasAccess && currentVideoIndex === index;

 return (
 <motion.div
 key={video.id}
 className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
 isActive 
 ? 'border-primary-neon-yellow shadow-lg' 
 : 'border-neutral-light-gray hover:border-accent-teal'
 } ${isLocked ? 'opacity-75' : ''}`}
 onClick={() => handleVideoSelect(index)}
 whileHover={{ scale: isLocked ? 1 : 1.05 }}
 transition={{ duration: 0.2 }}
 >
 <div className="aspect-video bg-neutral-light-gray relative">
 <Image
 src={video.thumbnailUrl}
 alt={video.title}
 fill
 className="object-cover"
 />

 {}
 <div className="absolute top-2 left-2 w-8 h-8 bg-primary-navy text-white text-sm rounded-full flex items-center justify-center font-bold shadow-lg">
 {index + 1}
 </div>

 {/* FREE badge - hidden */}

 {}
 {isPaid && !hasAccess && (
 <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
 {seriesVideo.individualCoinPrice} 🪙
 </div>
 )}

 {}
 {isLocked && (
 <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
 <div className="text-center text-white">
 <Lock className="w-6 h-6 mx-auto mb-1" />
 {isPaid && (
 <p className="text-xs">{seriesVideo.individualCoinPrice} coins</p>
 )}
 </div>
 </div>
 )}

 {}
 {!isLocked && !isActive && (
 <div className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center transition-colors">
 <Play className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" fill="white" />
 </div>
 )}

 {}
 {isActive && (
 <div className="absolute inset-0 border-4 border-primary-neon-yellow pointer-events-none" />
 )}

 {}
 <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
 {formatDuration(video.duration)}
 </div>
 </div>

 {}
 <div className="p-2 bg-white">
 <h4 className="text-xs font-medium text-primary-navy line-clamp-2">
 {video.title}
 </h4>
 </div>
 </motion.div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>

 {}
 <AnimatePresence>
 {showPurchaseModal && (
 <SeriesPurchaseModal
 series={series}
 priceCalculation={priceCalculation}
 onClose={() => setShowPurchaseModal(false)}
 userId={userId}
 />
 )}
 </AnimatePresence>
 </div>
 );
}

function SeriesPurchaseModal({
 series,
 priceCalculation,
 onClose,
 userId,
}: {
 series: Series;
 priceCalculation: PriceCalculation | null;
 onClose: () => void;
 userId?: string;
}) {
 const router = useRouter();
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [coinBalance, setCoinBalance] = useState<number | null>(null);
 const [loadingBalance, setLoadingBalance] = useState(true);

 React.useEffect(() => {
 if (userId) {
 fetch('/api/coins/balance')
 .then((res) => {
 if (!res.ok) {
 throw new Error('Failed to fetch balance');
 }
 return res.json();
 })
 .then((data) => {
 // API returns { balance, totalPurchased, totalSpent, lastUpdated }
 if (typeof data.balance === 'number') {
 setCoinBalance(data.balance);
 }
 })
 .catch((err) => {
 console.error('Failed to fetch coin balance:', err);
 })
 .finally(() => {
 setLoadingBalance(false);
 });
 } else {
 setLoadingBalance(false);
 }
 }, [userId]);

 const finalPrice = priceCalculation?.adjustedPrice ?? series.coinPrice;
 const hasOwnedVideos = priceCalculation && priceCalculation.ownedVideos.length > 0;
 const hasSufficientCoins = coinBalance !== null && coinBalance >= finalPrice;

 const handlePurchase = async () => {
 if (!userId) {
 router.push('/sign-in');
 return;
 }

 if (!hasSufficientCoins) {

 router.push('/member/wallet?action=purchase');
 return;
 }

 setIsLoading(true);
 setError(null);

 try {
 const response = await fetch(`/api/series/${series.id}/purchase`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 });

 const data = await response.json();

 if (!response.ok) {
 throw new Error(data.error || 'Purchase failed');
 }

 if (data.success) {

 router.refresh();
 onClose();
 } else {
 throw new Error(data.error || 'Purchase failed');
 }
 } catch (err) {
 console.error('Purchase error:', err);
 setError(err instanceof Error ? err.message : 'Failed to purchase series. Please try again.');
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <motion.div
 className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 >
 <motion.div
 className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
 initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.9, opacity: 0 }}
 onClick={(e) => e.stopPropagation()}
 >
 {}
 <div className="flex items-start justify-between mb-4">
 <h2 className="text-2xl font-bold text-primary-navy">Purchase Series</h2>
 <button
 onClick={onClose}
 className="text-neutral-dark-gray hover:text-primary-navy transition-colors"
 disabled={isLoading}
 >
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>

 {}
 <div className="mb-6">
 <div className="flex items-start space-x-4">
 {series.thumbnailUrl && (
 <div className="relative w-24 h-16 flex-shrink-0 rounded overflow-hidden">
 <Image
 src={series.thumbnailUrl}
 alt={series.title}
 fill
 className="object-cover"
 />
 </div>
 )}
 <div className="flex-1">
 <h3 className="font-semibold text-primary-navy mb-1">{series.title}</h3>
 <p className="text-sm text-neutral-dark-gray">
 {series.videoCount} videos • {Math.floor(series.totalDuration / 60)} minutes
 </p>
 </div>
 </div>
 </div>

 {}
 <div className="bg-neutral-light-gray/50 rounded-lg p-4 mb-6">
 <h4 className="font-semibold text-primary-navy mb-3">Price Breakdown</h4>

 {hasOwnedVideos && priceCalculation ? (
 <div className="space-y-2">
 <div className="flex justify-between text-sm">
 <span className="text-neutral-dark-gray">Original Price:</span>
 <span className="line-through text-neutral-dark-gray">
 {priceCalculation.originalPrice} coins
 </span>
 </div>

 <div className="border-t border-neutral-light-gray pt-2">
 <p className="text-xs text-neutral-dark-gray mb-2">
 You already own {priceCalculation.ownedVideos.length} video{priceCalculation.ownedVideos.length > 1 ? 's' : ''}:
 </p>
 {priceCalculation.ownedVideos.map((video, index) => (
 <div key={index} className="flex justify-between text-xs text-neutral-dark-gray mb-1 pl-2">
 <span className="truncate mr-2">{video.title}</span>
 <span className="flex-shrink-0">-{video.coinPrice} coins</span>
 </div>
 ))}
 </div>

 <div className="border-t border-neutral-light-gray pt-2 mt-2">
 <div className="flex justify-between font-semibold text-primary-navy">
 <span>You Pay:</span>
 <span>{priceCalculation.adjustedPrice} coins</span>
 </div>
 <div className="text-right text-xs text-neutral-dark-gray mt-1">
 ≈ ₹{(priceCalculation.adjustedPrice / 20).toFixed(2)}
 </div>
 </div>
 </div>
 ) : (
 <div>
 <div className="flex justify-between font-semibold text-primary-navy mb-1">
 <span>Total:</span>
 <span>{series.coinPrice} coins</span>
 </div>
 <div className="text-right text-xs text-neutral-dark-gray">
 ≈ ₹{(series.coinPrice / 20).toFixed(2)}
 </div>
 </div>
 )}
 </div>

 {}
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium text-primary-navy">Your Coin Balance:</span>
 {loadingBalance ? (
 <div className="animate-pulse bg-neutral-light-gray h-6 w-20 rounded" />
 ) : (
 <span className={`text-lg font-bold ${hasSufficientCoins ? 'text-green-600' : 'text-red-600'}`}>
 {coinBalance !== null ? `${coinBalance} coins` : 'N/A'}
 </span>
 )}
 </div>

 {!loadingBalance && coinBalance !== null && !hasSufficientCoins && (
 <div className="mt-2 text-sm text-red-600">
 You need {finalPrice - coinBalance} more coins to purchase this series.
 </div>
 )}
 </div>

 {}
 {error && (
 <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
 <p className="text-sm text-red-600">{error}</p>
 </div>
 )}

 {}
 <div className="space-y-3">
 {hasSufficientCoins ? (
 <button
 onClick={handlePurchase}
 disabled={isLoading || loadingBalance}
 className="w-full px-6 py-3 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {isLoading ? (
 <span className="flex items-center justify-center">
 <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
 </svg>
 Processing...
 </span>
 ) : (
 `Confirm Purchase (${finalPrice} coins)`
 )}
 </button>
 ) : (
 <button
 onClick={() => router.push('/member/wallet?action=purchase')}
 disabled={loadingBalance}
 className="w-full px-6 py-3 bg-accent-teal text-white font-semibold rounded-lg hover:bg-accent-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 Buy More Coins
 </button>
 )}

 <button
 onClick={onClose}
 disabled={isLoading}
 className="w-full px-6 py-3 bg-neutral-light-gray text-primary-navy font-semibold rounded-lg hover:bg-neutral-dark-gray/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 Cancel
 </button>
 </div>

 {}
 <p className="text-xs text-neutral-dark-gray text-center mt-4">
 One-time purchase • Lifetime access to all videos in this series
 </p>
 </motion.div>
 </motion.div>
 );
}
