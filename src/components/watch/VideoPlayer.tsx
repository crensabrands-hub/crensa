

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AspectRatioVideoPlayer } from "./AspectRatioVideoPlayer";
import { AspectRatio } from "@/types";

interface VideoPlayerProps {
 videoId: string;
 initialData?: {
 video: VideoData;
 hasAccess: boolean;
 };
}

interface VideoData {
 id: string;
 title: string;
 description: string;
 videoUrl: string;
 thumbnailUrl: string;
 duration: number;
 creditCost: number;
 coinPrice?: number;
 category: string;
 viewCount: number;
 aspectRatio: AspectRatio;
 creator: {
 id: string;
 username: string;
 displayName: string;
 avatar: string | null;
 };
}

export function VideoPlayer({ videoId, initialData }: VideoPlayerProps) {
 const [video, setVideo] = useState<VideoData | null>(initialData?.video || null);
 const [loading, setLoading] = useState(!initialData);
 const [error, setError] = useState<string | null>(null);
 const [hasAccess, setHasAccess] = useState(initialData?.hasAccess || false);

 useEffect(() => {
 if (!initialData) {
 fetchVideoData();
 }
 }, [videoId, initialData]);

 const fetchVideoData = async () => {
 try {
 setLoading(true);
 const response = await fetch(`/api/videos/${videoId}`);
 
 if (!response.ok) {
 throw new Error("Failed to fetch video");
 }
 
 const data = await response.json();
 setVideo(data.video);
 setHasAccess(data.hasAccess || false);
 } catch (err) {
 setError(err instanceof Error ? err.message : "An error occurred");
 } finally {
 setLoading(false);
 }
 };

 const handlePurchaseAccess = async () => {
 try {
 const response = await fetch(`/api/videos/${videoId}/purchase`, {
 method: "POST",
 });
 
 if (response.ok) {
 setHasAccess(true);

 fetchVideoData();
 }
 } catch (err) {
 console.error("Failed to purchase access:", err);
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-screen bg-black">
 <div className="text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
 <p className="text-white">Loading video...</p>
 </div>
 </div>
 );
 }

 if (error || !video) {
 return (
 <div className="flex items-center justify-center min-h-screen bg-black">
 <div className="text-center">
 <div className="text-red-500 text-6xl mb-4">⚠️</div>
 <h2 className="text-2xl font-bold text-white mb-2">
 Video Not Found
 </h2>
 <p className="text-gray-400 mb-6">{error || "This video doesn't exist or has been removed."}</p>
 <Link
 href="/discover"
 className="px-6 py-3 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors"
 >
 Back to Discover
 </Link>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-black text-white">
 {}
 <div className="flex justify-center">
 {hasAccess ? (
 <AspectRatioVideoPlayer
 videoUrl={video.videoUrl}
 thumbnailUrl={video.thumbnailUrl}
 aspectRatio={video.aspectRatio}
 autoplay={false}
 controls={true}
 className="w-full max-w-4xl"
 />
 ) : (
 <div 
 className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden"
 style={{ 
 paddingBottom: video.aspectRatio === '9:16' ? '177.78%' : 
 video.aspectRatio === '1:1' ? '100%' : '56.25%',
 maxWidth: video.aspectRatio === '9:16' || video.aspectRatio === '4:5' || video.aspectRatio === '2:3' 
 ? '400px' : undefined
 }}
 >
 <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
 <div className="text-center max-w-md mx-auto p-6">
 <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
 <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
 </svg>
 </div>
 <h3 className="text-xl font-semibold mb-2">Premium Content</h3>
 <p className="text-gray-400 mb-4 flex items-center justify-center gap-1">
 This video requires <span role="img" aria-label="coins">🪙</span> {(video.coinPrice || video.creditCost || 0).toLocaleString('en-IN')} coins to watch
 </p>
 <button
 onClick={handlePurchaseAccess}
 className="px-6 py-3 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors flex items-center gap-2 mx-auto"
 >
 <span role="img" aria-label="coins">🪙</span>
 Watch for {(video.coinPrice || video.creditCost || 0).toLocaleString('en-IN')} Coins
 </button>
 </div>
 </div>
 
 {}
 <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
 {video.aspectRatio}
 {['9:16', '4:5', '2:3'].includes(video.aspectRatio) && (
 <span className="ml-1 text-purple-300">📱</span>
 )}
 </div>
 </div>
 )}
 </div>

 {}
 <div className="max-w-6xl mx-auto p-6">
 <div className="flex flex-col lg:flex-row gap-6">
 {}
 <div className="flex-1">
 <h1 className="text-2xl lg:text-3xl font-bold mb-4">{video.title}</h1>
 
 {}
 <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
 <span>{video.viewCount.toLocaleString()} views</span>
 <span>•</span>
 <span className="capitalize">{video.category}</span>
 <span>•</span>
 <span>{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>
 </div>

 {}
 <div className="flex items-center space-x-4 mb-6">
 <div className="w-12 h-12 bg-gradient-to-br from-accent-pink to-accent-teal rounded-full flex items-center justify-center">
 {video.creator.avatar ? (
 <img
 src={video.creator.avatar}
 alt={video.creator.displayName}
 className="w-12 h-12 rounded-full object-cover"
 />
 ) : (
 <span className="text-white font-semibold">
 {video.creator.displayName.charAt(0).toUpperCase()}
 </span>
 )}
 </div>
 <div>
 <h3 className="font-semibold">{video.creator.displayName}</h3>
 <p className="text-sm text-gray-400">@{video.creator.username}</p>
 </div>
 </div>

 {}
 {video.description && (
 <div className="bg-gray-900 rounded-lg p-4">
 <h4 className="font-semibold mb-2">Description</h4>
 <p className="text-gray-300 whitespace-pre-wrap">{video.description}</p>
 </div>
 )}
 </div>

 {}
 <div className="lg:w-80">
 <div className="bg-gray-900 rounded-lg p-4">
 <h4 className="font-semibold mb-4">Related Videos</h4>
 <p className="text-gray-400 text-sm">Coming soon...</p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}