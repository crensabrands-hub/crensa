'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Clock, Video as VideoIcon, Calendar, TrendingUp } from 'lucide-react';

interface SeriesCreator {
 id: string;
 username: string;
 creatorProfile: {
 displayName: string;
 bio: string | null;
 } | null;
}

interface PurchasedSeries {
 id: string;
 title: string;
 description: string | null;
 thumbnailUrl: string | null;
 coinPrice: number;
 videoCount: number;
 totalDuration: number;
 category: string;
 viewCount: number;
 creator: SeriesCreator;
}

interface SeriesProgress {
 videosWatched: number;
 totalVideos: number;
 percentage: number;
 lastWatchedAt: Date | null;
}

interface PurchasedSeriesItem {
 series: PurchasedSeries;
 purchaseDate: Date;
 progress: SeriesProgress;
}

interface MemberSeriesLibraryClientProps {
 purchasedSeries: PurchasedSeriesItem[];
 userId: string;
}

export default function MemberSeriesLibraryClient({
 purchasedSeries,
 userId,
}: MemberSeriesLibraryClientProps) {

 const formatDuration = (seconds: number): string => {
 const hours = Math.floor(seconds / 3600);
 const minutes = Math.floor((seconds % 3600) / 60);

 if (hours > 0) {
 return `${hours}h ${minutes}m`;
 }
 return `${minutes}m`;
 };

 const formatDate = (date: Date): string => {
 return new Date(date).toLocaleDateString('en-US', {
 year: 'numeric',
 month: 'short',
 day: 'numeric',
 });
 };

 const getButtonText = (progress: SeriesProgress): string => {
 if (progress.videosWatched === 0) {
 return 'Start Watching';
 } else if (progress.videosWatched >= progress.totalVideos) {
 return 'Watch Again';
 } else {
 return 'Continue Watching';
 }
 };

 return (
 <div className="min-h-screen bg-white">
 <div className="max-w-7xl mx-auto px-4 py-8">
 {}
 <div className="mb-8">
 <h1 className="text-3xl lg:text-4xl font-bold text-primary-navy mb-2">
 My Series
 </h1>
 <p className="text-neutral-dark-gray">
 Your purchased series collection
 </p>
 </div>

 {}
 {purchasedSeries.length === 0 ? (

 <motion.div
 className="bg-neutral-light-gray/30 rounded-xl p-12 text-center"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 >
 <div className="max-w-md mx-auto">
 <div className="w-24 h-24 bg-gradient-to-br from-accent-pink/20 via-accent-teal/20 to-primary-neon-yellow/20 rounded-full flex items-center justify-center mx-auto mb-6">
 <VideoIcon className="w-12 h-12 text-neutral-dark-gray" />
 </div>

 <h2 className="text-2xl font-bold text-primary-navy mb-3">
 No Series Yet
 </h2>

 <p className="text-neutral-dark-gray mb-6">
 You haven&apos;t purchased any series yet. Explore our collection and find series that interest you!
 </p>

 <Link
 href="/discover"
 className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors"
 >
 <TrendingUp className="w-5 h-5" />
 <span>Browse Series</span>
 </Link>
 </div>
 </motion.div>
 ) : (

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {purchasedSeries.map((item, index) => {
 const { series, purchaseDate, progress } = item;
 const progressPercentage = progress.percentage;
 const buttonText = getButtonText(progress);

 return (
 <motion.div
 key={series.id}
 className="bg-white border border-neutral-light-gray rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3, delay: index * 0.05 }}
 >
 {}
 <Link href={`/series/${series.id}`} className="block relative">
 <div className="aspect-video bg-neutral-light-gray relative overflow-hidden group">
 {series.thumbnailUrl ? (
 <Image
 src={series.thumbnailUrl}
 alt={series.title}
 fill
 className="object-cover group-hover:scale-105 transition-transform duration-300"
 />
 ) : (
 <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/20 via-accent-teal/20 to-primary-neon-yellow/20" />
 )}

 {}
 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
 <motion.div
 className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
 whileHover={{ scale: 1.1 }}
 >
 <Play className="w-8 h-8 text-primary-navy ml-1" fill="currentColor" />
 </motion.div>
 </div>

 {}
 {progress.videosWatched > 0 && (
 <div className="absolute top-3 right-3 bg-primary-navy/90 text-white px-3 py-1 rounded-full text-xs font-semibold">
 {progress.videosWatched}/{progress.totalVideos} watched
 </div>
 )}
 </div>
 </Link>

 {}
 <div className="p-4 space-y-3">
 {}
 <Link href={`/series/${series.id}`}>
 <h3 className="font-semibold text-lg text-primary-navy line-clamp-2 hover:text-accent-teal transition-colors">
 {series.title}
 </h3>
 </Link>

 {}
 <p className="text-sm text-neutral-dark-gray">
 by {series.creator.creatorProfile?.displayName || series.creator.username}
 </p>

 {}
 <div className="flex items-center space-x-4 text-xs text-neutral-dark-gray">
 <div className="flex items-center space-x-1">
 <VideoIcon className="w-4 h-4" />
 <span>{series.videoCount} videos</span>
 </div>
 <div className="flex items-center space-x-1">
 <Clock className="w-4 h-4" />
 <span>{formatDuration(series.totalDuration)}</span>
 </div>
 </div>

 {}
 <div className="flex items-center space-x-2 text-xs text-neutral-dark-gray pt-2 border-t border-neutral-light-gray">
 <Calendar className="w-4 h-4" />
 <span>Purchased {formatDate(purchaseDate)}</span>
 </div>

 {}
 <div className="space-y-2">
 <div className="flex items-center justify-between text-xs">
 <span className="text-neutral-dark-gray">Progress</span>
 <span className="font-semibold text-primary-navy">
 {Math.round(progressPercentage)}%
 </span>
 </div>
 <div className="w-full bg-neutral-light-gray rounded-full h-2 overflow-hidden">
 <motion.div
 className="h-full bg-gradient-to-r from-accent-teal to-accent-pink rounded-full"
 initial={{ width: 0 }}
 animate={{ width: `${progressPercentage}%` }}
 transition={{ duration: 0.8, delay: index * 0.05 + 0.3 }}
 />
 </div>
 </div>

 {}
 <Link
 href={`/series/${series.id}`}
 className="block w-full"
 >
 <motion.button
 className="w-full px-4 py-2.5 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors flex items-center justify-center space-x-2"
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 >
 <Play className="w-4 h-4" fill="currentColor" />
 <span>{buttonText}</span>
 </motion.button>
 </Link>
 </div>
 </motion.div>
 );
 })}
 </div>
 )}

 {}
 {purchasedSeries.length > 0 && (
 <motion.div
 className="mt-12 bg-gradient-to-r from-accent-teal/10 via-accent-pink/10 to-primary-neon-yellow/10 rounded-xl p-6"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, delay: 0.3 }}
 >
 <h3 className="font-semibold text-primary-navy mb-4">Your Collection Stats</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-white rounded-lg p-4 text-center">
 <div className="text-3xl font-bold text-accent-teal mb-1">
 {purchasedSeries.length}
 </div>
 <div className="text-sm text-neutral-dark-gray">
 Series Owned
 </div>
 </div>

 <div className="bg-white rounded-lg p-4 text-center">
 <div className="text-3xl font-bold text-accent-pink mb-1">
 {purchasedSeries.reduce((sum, item) => sum + item.series.videoCount, 0)}
 </div>
 <div className="text-sm text-neutral-dark-gray">
 Total Videos
 </div>
 </div>

 <div className="bg-white rounded-lg p-4 text-center">
 <div className="text-3xl font-bold text-primary-neon-yellow mb-1">
 {Math.round(
 purchasedSeries.reduce((sum, item) => sum + item.progress.percentage, 0) /
 purchasedSeries.length
 )}%
 </div>
 <div className="text-sm text-neutral-dark-gray">
 Average Progress
 </div>
 </div>
 </div>
 </motion.div>
 )}
 </div>
 </div>
 );
}
