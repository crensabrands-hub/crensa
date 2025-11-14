'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Series, Video } from '@/types';

interface SeriesProgressData {
 seriesId: string;
 completedVideos: string[];
 currentVideoId?: string;
 watchTime: number;
 lastWatchedAt: Date;
}

interface SeriesProgressTrackerProps {
 series: Series;
 currentVideo?: Video;
 onProgressUpdate?: (progress: SeriesProgressData) => void;
 className?: string;
}

export default function SeriesProgressTracker({
 series,
 currentVideo,
 onProgressUpdate,
 className = ''
}: SeriesProgressTrackerProps) {
 const [progress, setProgress] = useState<SeriesProgressData>({
 seriesId: series.id,
 completedVideos: [],
 watchTime: 0,
 lastWatchedAt: new Date()
 });

 useEffect(() => {
 const savedProgress = localStorage.getItem(`series_progress_${series.id}`);
 if (savedProgress) {
 try {
 const parsed = JSON.parse(savedProgress);
 setProgress({
 ...parsed,
 lastWatchedAt: new Date(parsed.lastWatchedAt)
 });
 } catch (error) {
 console.error('Failed to parse saved progress:', error);
 }
 }
 }, [series.id]);

 useEffect(() => {
 localStorage.setItem(`series_progress_${series.id}`, JSON.stringify(progress));
 onProgressUpdate?.(progress);
 }, [progress, series.id, onProgressUpdate]);

 const markVideoCompleted = (videoId: string) => {
 setProgress(prev => ({
 ...prev,
 completedVideos: [...new Set([...prev.completedVideos, videoId])],
 lastWatchedAt: new Date()
 }));
 };

 const updateWatchProgress = (videoId: string, watchTime: number) => {
 setProgress(prev => ({
 ...prev,
 currentVideoId: videoId,
 watchTime,
 lastWatchedAt: new Date()
 }));
 };

 const resetProgress = () => {
 const resetData: SeriesProgressData = {
 seriesId: series.id,
 completedVideos: [],
 watchTime: 0,
 lastWatchedAt: new Date()
 };
 setProgress(resetData);
 localStorage.removeItem(`series_progress_${series.id}`);
 };

 const completionPercentage = series.videoCount > 0 
 ? (progress.completedVideos.length / series.videoCount) * 100 
 : 0;

 const getNextVideo = (): Video | null => {
 if (!series.videos) return null;

 const nextVideo = series.videos.find(sv => 
 sv.video && !progress.completedVideos.includes(sv.video.id)
 );
 
 return nextVideo?.video || null;
 };

 const isVideoCompleted = (videoId: string): boolean => {
 return progress.completedVideos.includes(videoId);
 };

 const formatTime = (seconds: number): string => {
 const hours = Math.floor(seconds / 3600);
 const minutes = Math.floor((seconds % 3600) / 60);
 const secs = seconds % 60;
 
 if (hours > 0) {
 return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
 }
 return `${minutes}:${secs.toString().padStart(2, '0')}`;
 };

 return (
 <div className={`bg-white border border-neutral-light-gray rounded-lg p-4 ${className}`}>
 {}
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-semibold text-primary-navy">Your Progress</h3>
 <div className="flex items-center space-x-2">
 <span className="text-sm text-accent-teal font-medium">
 {Math.round(completionPercentage)}% Complete
 </span>
 <button
 onClick={resetProgress}
 className="text-xs text-neutral-dark-gray hover:text-red-500 transition-colors"
 title="Reset Progress"
 >
 Reset
 </button>
 </div>
 </div>

 {}
 <div className="w-full bg-neutral-light-gray rounded-full h-2 mb-4">
 <motion.div
 className="bg-accent-teal h-2 rounded-full"
 initial={{ width: 0 }}
 animate={{ width: `${completionPercentage}%` }}
 transition={{ duration: 0.5, ease: "easeOut" }}
 />
 </div>

 {}
 <div className="grid grid-cols-2 gap-4 mb-4">
 <div className="text-center p-3 bg-neutral-light-gray/50 rounded-lg">
 <div className="text-lg font-semibold text-primary-navy">
 {progress.completedVideos.length}
 </div>
 <div className="text-xs text-neutral-dark-gray">
 of {series.videoCount} completed
 </div>
 </div>
 
 <div className="text-center p-3 bg-neutral-light-gray/50 rounded-lg">
 <div className="text-lg font-semibold text-primary-navy">
 {formatTime(progress.watchTime)}
 </div>
 <div className="text-xs text-neutral-dark-gray">
 watch time
 </div>
 </div>
 </div>

 {}
 {currentVideo ? (
 <div className="p-3 bg-accent-teal/10 rounded-lg border-l-4 border-accent-teal">
 <div className="flex items-center space-x-2 mb-1">
 <svg className="w-4 h-4 text-accent-teal" fill="currentColor" viewBox="0 0 20 20">
 <path d="M8 5v10l7-5z" />
 </svg>
 <span className="text-sm font-medium text-accent-teal">Currently Watching</span>
 </div>
 <p className="text-sm text-primary-navy font-medium line-clamp-1">
 {currentVideo.title}
 </p>
 </div>
 ) : (
 (() => {
 const nextVideo = getNextVideo();
 return nextVideo ? (
 <div className="p-3 bg-primary-neon-yellow/10 rounded-lg border-l-4 border-primary-neon-yellow">
 <div className="flex items-center space-x-2 mb-1">
 <svg className="w-4 h-4 text-primary-navy" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
 </svg>
 <span className="text-sm font-medium text-primary-navy">Up Next</span>
 </div>
 <p className="text-sm text-primary-navy font-medium line-clamp-1">
 {nextVideo.title}
 </p>
 </div>
 ) : (
 <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
 <div className="flex items-center space-x-2 mb-1">
 <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
 </svg>
 <span className="text-sm font-medium text-green-700">Series Complete!</span>
 </div>
 <p className="text-sm text-green-600">
 You&apos;ve watched all videos in this series
 </p>
 </div>
 );
 })()
 )}

 {}
 <div className="mt-4 pt-4 border-t border-neutral-light-gray">
 <p className="text-xs text-neutral-dark-gray">
 Last watched: {progress.lastWatchedAt.toLocaleDateString()} at {progress.lastWatchedAt.toLocaleTimeString()}
 </p>
 </div>
 </div>
 );
}