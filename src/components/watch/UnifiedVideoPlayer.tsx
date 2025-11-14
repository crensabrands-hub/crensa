

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
 PlayIcon,
 PauseIcon,
 SpeakerWaveIcon,
 SpeakerXMarkIcon,
 ArrowsPointingOutIcon,
 CurrencyDollarIcon,
 UserIcon,
 EyeIcon,
 ShareIcon,
 HeartIcon,
 ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

interface VideoData {
 id: string;
 title: string;
 description?: string;
 videoUrl: string;
 thumbnailUrl: string;
 duration: number;
 creditCost: number;
 coinPrice?: number;
 category: string;
 tags: string[];
 viewCount: number;
 creator: {
 id: string;
 username: string;
 displayName: string;
 avatar?: string;
 };
}

interface AccessInfo {
 hasAccess: boolean;
 accessType:
 | "owned"
 | "token_preview"
 | "requires_purchase"
 | "creator_self_access";
 shareToken?: string;
 requiresPurchase: boolean;
}

interface UnifiedVideoPlayerProps {
 video: VideoData;
 access: AccessInfo;
 identifierType: "video_id" | "share_token";
 onAccessGranted?: () => void;
 onError?: (error: string) => void;
}

interface VideoPlayerState {
 isPlaying: boolean;
 isMuted: boolean;
 volume: number;
 currentTime: number;
 duration: number;
 isFullscreen: boolean;
 showControls: boolean;
}

export function UnifiedVideoPlayer({
 video,
 access,
 identifierType,
 onAccessGranted,
 onError,
}: UnifiedVideoPlayerProps) {
 const router = useRouter();
 const { isSignedIn, userId } = useAuth();
 const videoRef = useRef<HTMLVideoElement>(null);
 const containerRef = useRef<HTMLDivElement>(null);

 const [playerState, setPlayerState] = useState<VideoPlayerState>({
 isPlaying: false,
 isMuted: false,
 volume: 1,
 currentTime: 0,
 duration: 0,
 isFullscreen: false,
 showControls: true,
 });

 const [purchasing, setPurchasing] = useState(false);
 const [purchaseError, setPurchaseError] = useState<string | null>(null);
 const [liked, setLiked] = useState(false);
 const [likeCount, setLikeCount] = useState(0);

 const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

 useEffect(() => {

 const video = videoRef.current;
 if (video) {
 const handleLoadedMetadata = () => {
 setPlayerState((prev) => ({
 ...prev,
 duration: video.duration,
 }));
 };

 const handleTimeUpdate = () => {
 setPlayerState((prev) => ({
 ...prev,
 currentTime: video.currentTime,
 }));
 };

 video.addEventListener("loadedmetadata", handleLoadedMetadata);
 video.addEventListener("timeupdate", handleTimeUpdate);

 return () => {
 video.removeEventListener("loadedmetadata", handleLoadedMetadata);
 video.removeEventListener("timeupdate", handleTimeUpdate);
 };
 }
 }, [access.hasAccess]);

 const handlePurchaseAccess = async () => {
 if (!isSignedIn) {
 const returnUrl = encodeURIComponent(window.location.href);
 router.push(`/sign-in?redirect_url=${returnUrl}`);
 return;
 }

 try {
 setPurchasing(true);
 setPurchaseError(null);

 const endpoint = access.shareToken
 ? `/api/watch/${access.shareToken}/view`
 : `/api/videos/${video.id}/purchase`;

 const response = await fetch(endpoint, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 },
 });

 if (!response.ok) {
 const errorData = await response.json();

 if (response.status === 402) {

 router.push("/wallet?reason=insufficient_coins");
 return;
 }

 throw new Error(errorData.error || "Failed to purchase access");
 }

 const data = await response.json();

 if (data.success) {

 onAccessGranted?.();
 } else {
 throw new Error(data.error || "Failed to purchase access");
 }
 } catch (error) {
 console.error("Purchase error:", error);
 const errorMessage =
 error instanceof Error ? error.message : "Failed to purchase access";
 setPurchaseError(errorMessage);
 onError?.(errorMessage);
 } finally {
 setPurchasing(false);
 }
 };

 const togglePlayPause = () => {
 const video = videoRef.current;
 if (!video) return;

 if (playerState.isPlaying) {
 video.pause();
 } else {
 video.play();
 }

 setPlayerState((prev) => ({
 ...prev,
 isPlaying: !prev.isPlaying,
 }));
 };

 const toggleMute = () => {
 const video = videoRef.current;
 if (!video) return;

 video.muted = !playerState.isMuted;
 setPlayerState((prev) => ({
 ...prev,
 isMuted: !prev.isMuted,
 }));
 };

 const handleVolumeChange = (newVolume: number) => {
 const video = videoRef.current;
 if (!video) return;

 video.volume = newVolume;
 setPlayerState((prev) => ({
 ...prev,
 volume: newVolume,
 isMuted: newVolume === 0,
 }));
 };

 const handleSeek = (newTime: number) => {
 const video = videoRef.current;
 if (!video) return;

 video.currentTime = newTime;
 setPlayerState((prev) => ({
 ...prev,
 currentTime: newTime,
 }));
 };

 const toggleFullscreen = () => {
 const container = containerRef.current;
 if (!container) return;

 if (!playerState.isFullscreen) {
 container.requestFullscreen();
 } else {
 document.exitFullscreen();
 }

 setPlayerState((prev) => ({
 ...prev,
 isFullscreen: !prev.isFullscreen,
 }));
 };

 const showControls = () => {
 setPlayerState((prev) => ({ ...prev, showControls: true }));

 if (controlsTimeoutRef.current) {
 clearTimeout(controlsTimeoutRef.current);
 }

 controlsTimeoutRef.current = setTimeout(() => {
 setPlayerState((prev) => ({ ...prev, showControls: false }));
 }, 3000);
 };

 const hideControls = () => {
 if (controlsTimeoutRef.current) {
 clearTimeout(controlsTimeoutRef.current);
 }
 setPlayerState((prev) => ({ ...prev, showControls: false }));
 };

 const handleLike = async () => {
 if (!isSignedIn) return;

 try {
 const response = await fetch(`/api/videos/${video.id}/like`, {
 method: "POST",
 });

 if (response.ok) {
 const data = await response.json();
 setLiked(data.liked);
 setLikeCount(data.likeCount);
 }
 } catch (error) {
 console.error("Failed to like video:", error);
 }
 };

 const handleShare = async () => {
 const shareUrl = access.shareToken
 ? window.location.href
 : `${window.location.origin}/watch/${video.id}`;

 if (navigator.share) {
 try {
 await navigator.share({
 title: video.title,
 text: `Check out "${video.title}" on Crensa!`,
 url: shareUrl,
 });
 } catch (error) {

 handleCopyToClipboard(shareUrl);
 }
 } else {
 handleCopyToClipboard(shareUrl);
 }
 };

 const handleCopyToClipboard = async (url: string) => {
 try {
 await navigator.clipboard.writeText(url);

 } catch (error) {
 console.error("Failed to copy to clipboard:", error);
 }
 };

 const formatTime = (seconds: number) => {
 const minutes = Math.floor(seconds / 60);
 const remainingSeconds = Math.floor(seconds % 60);
 return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
 };

 if (!access.hasAccess && access.requiresPurchase) {
 return (
 <div
 className="relative w-full bg-black"
 style={{ paddingBottom: "56.25%" }}
 >
 <div className="absolute inset-0">
 {}
 <Image
 src={video.thumbnailUrl}
 alt={video.title}
 fill
 className="object-cover opacity-50"
 priority
 />

 {}
 <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
 <div className="text-center max-w-md mx-auto p-6">
 {}
 {identifierType === "share_token" && (
 <div className="mb-6 p-4 bg-purple-900 bg-opacity-80 rounded-lg">
 <div className="flex items-center justify-center gap-3 mb-2">
 <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
 {video.creator.avatar ? (
 <Image
 src={video.creator.avatar}
 alt={video.creator.displayName}
 width={40}
 height={40}
 className="w-full h-full object-cover"
 />
 ) : (
 <UserIcon className="w-5 h-5 text-gray-400" />
 )}
 </div>
 <div className="text-left">
 <p className="text-white font-medium text-sm">
 Shared by {video.creator.displayName}
 </p>
 <p className="text-purple-200 text-xs">
 @{video.creator.username}
 </p>
 </div>
 </div>
 <p className="text-purple-100 text-xs">
 When you watch this video, the creator earns revenue with
 proper attribution.
 </p>
 </div>
 )}

 {}
 <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
 <CurrencyDollarIcon className="w-12 h-12 text-white" />
 </div>

 <h3 className="text-xl font-semibold text-white mb-2">
 Premium Content
 </h3>

 <p className="text-gray-300 mb-6 flex items-center justify-center gap-1">
 This video requires <span role="img" aria-label="coins">🪙</span> {(video.coinPrice || video.creditCost || 0).toLocaleString('en-IN')} coins to watch
 </p>

 {purchaseError && (
 <div className="mb-4 p-3 bg-red-900 bg-opacity-80 border border-red-700 rounded-lg">
 <p className="text-red-200 text-sm">{purchaseError}</p>
 </div>
 )}

 <motion.button
 onClick={handlePurchaseAccess}
 disabled={purchasing}
 className="px-8 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 >
 {purchasing ? (
 <span className="flex items-center gap-2">
 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
 Processing...
 </span>
 ) : (
 <span className="flex items-center gap-2">
 <PlayIcon className="w-5 h-5" />
 <span role="img" aria-label="coins">🪙</span>
 Watch for {(video.coinPrice || video.creditCost || 0).toLocaleString('en-IN')} Coins
 </span>
 )}
 </motion.button>

 {!isSignedIn && (
 <p className="text-gray-400 mt-4 text-sm">
 <Link
 href="/sign-up"
 className="text-purple-400 hover:text-purple-300 font-medium"
 >
 Sign up
 </Link>{" "}
 or{" "}
 <Link
 href="/sign-in"
 className="text-purple-400 hover:text-purple-300 font-medium"
 >
 sign in
 </Link>{" "}
 to watch this video
 </p>
 )}
 </div>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="w-full">
 {}
 <div
 ref={containerRef}
 className="relative w-full bg-black"
 style={{ paddingBottom: "56.25%" }}
 onMouseMove={showControls}
 onMouseLeave={hideControls}
 >
 <video
 ref={videoRef}
 className="absolute inset-0 w-full h-full object-contain"
 poster={video.thumbnailUrl}
 preload="metadata"
 onClick={togglePlayPause}
 >
 <source src={video.videoUrl} type="video/mp4" />
 Your browser does not support the video tag.
 </video>

 {}
 <div
 className={`absolute inset-0 transition-opacity duration-300 ${
 playerState.showControls ? "opacity-100" : "opacity-0"
 }`}
 >
 {}
 <div className="absolute inset-0 flex items-center justify-center">
 <motion.button
 onClick={togglePlayPause}
 className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.9 }}
 >
 {playerState.isPlaying ? (
 <PauseIcon className="w-8 h-8 text-white" />
 ) : (
 <PlayIcon className="w-8 h-8 text-white ml-1" />
 )}
 </motion.button>
 </div>

 {}
 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
 {}
 <div className="mb-4">
 <input
 type="range"
 min="0"
 max={playerState.duration || 100}
 value={playerState.currentTime}
 onChange={(e) => handleSeek(Number(e.target.value))}
 className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
 />
 </div>

 {}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <button
 onClick={togglePlayPause}
 className="text-white hover:text-purple-400 transition-colors"
 >
 {playerState.isPlaying ? (
 <PauseIcon className="w-6 h-6" />
 ) : (
 <PlayIcon className="w-6 h-6" />
 )}
 </button>

 <div className="flex items-center gap-2">
 <button
 onClick={toggleMute}
 className="text-white hover:text-purple-400 transition-colors"
 >
 {playerState.isMuted ? (
 <SpeakerXMarkIcon className="w-6 h-6" />
 ) : (
 <SpeakerWaveIcon className="w-6 h-6" />
 )}
 </button>

 <input
 type="range"
 min="0"
 max="1"
 step="0.1"
 value={playerState.isMuted ? 0 : playerState.volume}
 onChange={(e) => handleVolumeChange(Number(e.target.value))}
 className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
 />
 </div>

 <span className="text-white text-sm">
 {formatTime(playerState.currentTime)} /{" "}
 {formatTime(playerState.duration)}
 </span>
 </div>

 <button
 onClick={toggleFullscreen}
 className="text-white hover:text-purple-400 transition-colors"
 >
 <ArrowsPointingOutIcon className="w-6 h-6" />
 </button>
 </div>
 </div>
 </div>
 </div>

 {}
 <div className="bg-gray-900 p-6">
 <div className="flex flex-col lg:flex-row gap-6">
 {}
 <div className="flex-1">
 <h1 className="text-2xl font-bold text-white mb-2">
 {video.title}
 </h1>

 <div className="flex items-center gap-4 text-gray-400 text-sm mb-4">
 <span className="flex items-center gap-1">
 <EyeIcon className="w-4 h-4" />
 {video.viewCount.toLocaleString()} views
 </span>
 <span>•</span>
 <span className="capitalize">{video.category}</span>
 <span>•</span>
 <span>{formatTime(video.duration)}</span>
 </div>

 {}
 <div className="flex items-center gap-4 mb-4">
 <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
 {video.creator.avatar ? (
 <Image
 src={video.creator.avatar}
 alt={video.creator.displayName}
 width={48}
 height={48}
 className="w-full h-full object-cover"
 />
 ) : (
 <UserIcon className="w-6 h-6 text-gray-400" />
 )}
 </div>
 <div>
 <h3 className="font-semibold text-white">
 {video.creator.displayName}
 </h3>
 <p className="text-sm text-gray-400">
 @{video.creator.username}
 </p>
 </div>
 </div>

 {}
 {video.description && (
 <div className="bg-gray-800 rounded-lg p-4">
 <p className="text-gray-300 whitespace-pre-wrap">
 {video.description}
 </p>
 </div>
 )}
 </div>

 {}
 <div className="lg:w-80">
 <div className="flex flex-col gap-3">
 <button
 onClick={handleLike}
 disabled={!isSignedIn}
 className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
 >
 {liked ? (
 <HeartSolidIcon className="w-5 h-5 text-red-500" />
 ) : (
 <HeartIcon className="w-5 h-5" />
 )}
 <span>{likeCount > 0 ? likeCount : "Like"}</span>
 </button>

 <button
 onClick={handleShare}
 className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
 >
 <ShareIcon className="w-5 h-5" />
 <span>Share</span>
 </button>

 <button
 disabled={!isSignedIn}
 className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
 >
 <ChatBubbleLeftIcon className="w-5 h-5" />
 <span>Comments</span>
 </button>
 </div>

 {}
 {identifierType === "share_token" && (
 <div className="mt-6 p-4 bg-purple-900 bg-opacity-50 border border-purple-700 rounded-lg">
 <p className="text-purple-200 text-sm">
 <strong>Shared Content</strong> - This video was shared by{" "}
 {video.creator.displayName}. The creator receives proper
 attribution and revenue for your view.
 </p>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
