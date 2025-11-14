'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AspectRatio } from '@/types';
import {
 PlayIcon,
 PauseIcon,
 SpeakerWaveIcon,
 SpeakerXMarkIcon,
 ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline';

interface AspectRatioVideoPlayerProps {
 videoUrl: string;
 thumbnailUrl: string;
 aspectRatio: AspectRatio;
 autoplay?: boolean;
 controls?: boolean;
 className?: string;
 onPlay?: () => void;
 onPause?: () => void;
 onEnded?: () => void;
 onTimeUpdate?: (currentTime: number) => void;
}

interface PlayerState {
 isPlaying: boolean;
 isMuted: boolean;
 volume: number;
 currentTime: number;
 duration: number;
 isFullscreen: boolean;
 showControls: boolean;
 isLoading: boolean;
}

const getAspectRatioStyles = (ratio: AspectRatio) => {
 const ratioMap: Record<AspectRatio, { paddingBottom: string; maxWidth?: string }> = {
 '16:9': { paddingBottom: '56.25%' }, // Standard widescreen
 '9:16': { paddingBottom: '177.78%', maxWidth: '400px' }, // Vertical/mobile
 '1:1': { paddingBottom: '100%', maxWidth: '600px' }, // Square
 '4:5': { paddingBottom: '125%', maxWidth: '480px' }, // Instagram portrait
 '3:2': { paddingBottom: '66.67%' }, // Photo landscape
 '2:3': { paddingBottom: '150%', maxWidth: '400px' }, // Photo portrait
 '5:4': { paddingBottom: '80%' }, // Classic photo
 };

 return ratioMap[ratio];
};

const isVerticalRatio = (ratio: AspectRatio): boolean => {
 return ['9:16', '4:5', '2:3'].includes(ratio);
};

export const AspectRatioVideoPlayer: React.FC<AspectRatioVideoPlayerProps> = ({
 videoUrl,
 thumbnailUrl,
 aspectRatio,
 autoplay = false,
 controls = true,
 className = '',
 onPlay,
 onPause,
 onEnded,
 onTimeUpdate,
}) => {
 const videoRef = useRef<HTMLVideoElement>(null);
 const containerRef = useRef<HTMLDivElement>(null);
 const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

 const [playerState, setPlayerState] = useState<PlayerState>({
 isPlaying: false,
 isMuted: false,
 volume: 1,
 currentTime: 0,
 duration: 0,
 isFullscreen: false,
 showControls: true,
 isLoading: true,
 });

 const aspectStyles = getAspectRatioStyles(aspectRatio);
 const isVertical = isVerticalRatio(aspectRatio);

 useEffect(() => {
 const video = videoRef.current;
 if (!video) return;

 const handleLoadedMetadata = () => {
 setPlayerState(prev => ({
 ...prev,
 duration: video.duration,
 isLoading: false,
 }));
 };

 const handleTimeUpdate = () => {
 setPlayerState(prev => ({
 ...prev,
 currentTime: video.currentTime,
 }));
 onTimeUpdate?.(video.currentTime);
 };

 const handlePlay = () => {
 setPlayerState(prev => ({ ...prev, isPlaying: true }));
 onPlay?.();
 };

 const handlePause = () => {
 setPlayerState(prev => ({ ...prev, isPlaying: false }));
 onPause?.();
 };

 const handleEnded = () => {
 setPlayerState(prev => ({ ...prev, isPlaying: false }));
 onEnded?.();
 };

 const handleVolumeChange = () => {
 setPlayerState(prev => ({
 ...prev,
 volume: video.volume,
 isMuted: video.muted,
 }));
 };

 video.addEventListener('loadedmetadata', handleLoadedMetadata);
 video.addEventListener('timeupdate', handleTimeUpdate);
 video.addEventListener('play', handlePlay);
 video.addEventListener('pause', handlePause);
 video.addEventListener('ended', handleEnded);
 video.addEventListener('volumechange', handleVolumeChange);

 return () => {
 video.removeEventListener('loadedmetadata', handleLoadedMetadata);
 video.removeEventListener('timeupdate', handleTimeUpdate);
 video.removeEventListener('play', handlePlay);
 video.removeEventListener('pause', handlePause);
 video.removeEventListener('ended', handleEnded);
 video.removeEventListener('volumechange', handleVolumeChange);
 };
 }, [onPlay, onPause, onEnded, onTimeUpdate]);

 useEffect(() => {
 if (playerState.showControls && playerState.isPlaying) {
 if (controlsTimeoutRef.current) {
 clearTimeout(controlsTimeoutRef.current);
 }
 
 controlsTimeoutRef.current = setTimeout(() => {
 setPlayerState(prev => ({ ...prev, showControls: false }));
 }, 3000);
 }

 return () => {
 if (controlsTimeoutRef.current) {
 clearTimeout(controlsTimeoutRef.current);
 }
 };
 }, [playerState.showControls, playerState.isPlaying]);

 const togglePlayPause = () => {
 const video = videoRef.current;
 if (!video) return;

 if (playerState.isPlaying) {
 video.pause();
 } else {
 video.play();
 }
 };

 const toggleMute = () => {
 const video = videoRef.current;
 if (!video) return;

 video.muted = !playerState.isMuted;
 };

 const handleVolumeChange = (newVolume: number) => {
 const video = videoRef.current;
 if (!video) return;

 video.volume = newVolume;
 video.muted = newVolume === 0;
 };

 const handleSeek = (newTime: number) => {
 const video = videoRef.current;
 if (!video) return;

 video.currentTime = newTime;
 };

 const toggleFullscreen = () => {
 const container = containerRef.current;
 if (!container) return;

 if (!playerState.isFullscreen) {
 if (container.requestFullscreen) {
 container.requestFullscreen();
 }
 } else {
 if (document.exitFullscreen) {
 document.exitFullscreen();
 }
 }

 setPlayerState(prev => ({
 ...prev,
 isFullscreen: !prev.isFullscreen,
 }));
 };

 const showControls = () => {
 setPlayerState(prev => ({ ...prev, showControls: true }));
 };

 const formatTime = (seconds: number) => {
 const minutes = Math.floor(seconds / 60);
 const remainingSeconds = Math.floor(seconds % 60);
 return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
 };

 const getContainerClasses = () => {
 const baseClasses = 'relative bg-black rounded-lg overflow-hidden mx-auto';
 const verticalClasses = isVertical 
 ? 'max-w-sm sm:max-w-md' 
 : 'w-full';
 
 return `${baseClasses} ${verticalClasses} ${className}`;
 };

 return (
 <div className={getContainerClasses()}>
 {}
 <div
 ref={containerRef}
 className="relative w-full"
 style={{ 
 paddingBottom: aspectStyles.paddingBottom,
 maxWidth: aspectStyles.maxWidth,
 }}
 onMouseEnter={showControls}
 onMouseMove={showControls}
 >
 {}
 <video
 ref={videoRef}
 className="absolute inset-0 w-full h-full object-cover"
 poster={thumbnailUrl}
 autoPlay={autoplay}
 muted={autoplay} // Autoplay requires muted
 playsInline
 preload="metadata"
 onClick={togglePlayPause}
 >
 <source src={videoUrl} type="video/mp4" />
 Your browser does not support the video tag.
 </video>

 {}
 {playerState.isLoading && (
 <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
 </div>
 )}

 {}
 {controls && (
 <div
 className={`absolute inset-0 transition-opacity duration-300 ${
 playerState.showControls ? 'opacity-100' : 'opacity-0'
 }`}
 >
 {}
 <div className="absolute inset-0 flex items-center justify-center">
 <button
 onClick={togglePlayPause}
 className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all transform hover:scale-110"
 >
 {playerState.isPlaying ? (
 <PauseIcon className="w-8 h-8 text-white" />
 ) : (
 <PlayIcon className="w-8 h-8 text-white ml-1" />
 )}
 </button>
 </div>

 {}
 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-3">
 {}
 <div className="mb-3">
 <input
 type="range"
 min="0"
 max={playerState.duration || 100}
 value={playerState.currentTime}
 onChange={(e) => handleSeek(Number(e.target.value))}
 className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
 style={{
 background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
 (playerState.currentTime / playerState.duration) * 100
 }%, #4b5563 ${
 (playerState.currentTime / playerState.duration) * 100
 }%, #4b5563 100%)`,
 }}
 />
 </div>

 {}
 <div className={`flex items-center ${isVertical ? 'justify-between' : 'justify-between'}`}>
 <div className="flex items-center gap-2">
 <button
 onClick={togglePlayPause}
 className="text-white hover:text-blue-400 transition-colors"
 >
 {playerState.isPlaying ? (
 <PauseIcon className="w-5 h-5" />
 ) : (
 <PlayIcon className="w-5 h-5" />
 )}
 </button>

 {!isVertical && (
 <div className="flex items-center gap-1">
 <button
 onClick={toggleMute}
 className="text-white hover:text-blue-400 transition-colors"
 >
 {playerState.isMuted ? (
 <SpeakerXMarkIcon className="w-5 h-5" />
 ) : (
 <SpeakerWaveIcon className="w-5 h-5" />
 )}
 </button>

 <input
 type="range"
 min="0"
 max="1"
 step="0.1"
 value={playerState.isMuted ? 0 : playerState.volume}
 onChange={(e) => handleVolumeChange(Number(e.target.value))}
 className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
 />
 </div>
 )}

 <span className="text-white text-xs">
 {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
 </span>
 </div>

 <div className="flex items-center gap-2">
 {isVertical && (
 <button
 onClick={toggleMute}
 className="text-white hover:text-blue-400 transition-colors"
 >
 {playerState.isMuted ? (
 <SpeakerXMarkIcon className="w-5 h-5" />
 ) : (
 <SpeakerWaveIcon className="w-5 h-5" />
 )}
 </button>
 )}

 <button
 onClick={toggleFullscreen}
 className="text-white hover:text-blue-400 transition-colors"
 >
 <ArrowsPointingOutIcon className="w-5 h-5" />
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {}
 <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
 {aspectRatio}
 {isVertical && (
 <span className="ml-1 text-purple-300">📱</span>
 )}
 </div>
 </div>

 {}
 {isVertical && (
 <div className="mt-2 text-center">
 <p className="text-xs text-gray-500">
 📱 Optimized for mobile viewing
 </p>
 </div>
 )}
 </div>
 );
};

export default AspectRatioVideoPlayer;