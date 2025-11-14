"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
 PlusIcon,
 TrashIcon,
 EyeIcon,
 Bars3Icon,
 XMarkIcon,
 ExclamationTriangleIcon,
 CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { SeriesVideo, Video } from "@/types";

interface SeriesVideoManagerProps {
 seriesId: string;
 videos: SeriesVideo[];
 onVideoAdded: (videoId: string) => void;
 onVideoRemoved: (videoId: string) => void;
 onOrderChanged: (videoId: string, newOrder: number) => void;
}

interface VideoWithDetails extends SeriesVideo {
 video: Video;
}

export default function SeriesVideoManager({
 seriesId,
 videos,
 onVideoAdded,
 onVideoRemoved,
 onOrderChanged,
}: SeriesVideoManagerProps) {
 const [videosWithDetails, setVideosWithDetails] = useState<VideoWithDetails[]>([]);
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState<string | null>(null);
 const [draggedItem, setDraggedItem] = useState<string | null>(null);
 const [showAddModal, setShowAddModal] = useState(false);

 useEffect(() => {
 const loadVideoDetails = async () => {
 if (videos.length === 0) {
 setVideosWithDetails([]);
 return;
 }

 setIsLoading(true);
 try {
 const videoDetails = await Promise.all(
 videos.map(async (seriesVideo) => {
 const response = await fetch(`/api/videos/${seriesVideo.videoId}`);
 if (response.ok) {
 const data = await response.json();
 return {
 ...seriesVideo,
 video: data.video,
 };
 }
 throw new Error(`Failed to load video ${seriesVideo.videoId}`);
 })
 );

 videoDetails.sort((a, b) => a.orderIndex - b.orderIndex);
 setVideosWithDetails(videoDetails);
 } catch (error) {
 console.error("Failed to load video details:", error);
 setError("Failed to load video details");
 } finally {
 setIsLoading(false);
 }
 };

 loadVideoDetails();
 }, [videos]);

 const handleRemoveVideo = async (videoId: string) => {
 if (!confirm("Are you sure you want to remove this video from the series?")) {
 return;
 }

 setIsLoading(true);
 setError(null);

 try {
 const response = await fetch(`/api/series/${seriesId}/videos/${videoId}`, {
 method: "DELETE",
 });

 if (!response.ok) {
 const data = await response.json();
 throw new Error(data.error || "Failed to remove video");
 }

 onVideoRemoved(videoId);
 setSuccess("Video removed from series");
 setTimeout(() => setSuccess(null), 3000);
 } catch (error) {
 console.error("Failed to remove video:", error);
 setError(error instanceof Error ? error.message : "Failed to remove video");
 } finally {
 setIsLoading(false);
 }
 };

 const handleDragStart = (e: any, videoId: string) => {
 setDraggedItem(videoId);
 e.dataTransfer.effectAllowed = "move";
 };

 const handleDragOver = (e: any) => {
 e.preventDefault();
 e.dataTransfer.dropEffect = "move";
 };

 const handleDrop = async (e: any, targetVideoId: string) => {
 e.preventDefault();
 
 if (!draggedItem || draggedItem === targetVideoId) {
 setDraggedItem(null);
 return;
 }

 const draggedVideo = videosWithDetails.find(v => v.videoId === draggedItem);
 const targetVideo = videosWithDetails.find(v => v.videoId === targetVideoId);

 if (!draggedVideo || !targetVideo) {
 setDraggedItem(null);
 return;
 }

 setIsLoading(true);
 setError(null);

 try {
 const response = await fetch(`/api/series/${seriesId}/videos/reorder`, {
 method: "PUT",
 headers: {
 "Content-Type": "application/json",
 },
 body: JSON.stringify({
 videoId: draggedItem,
 newOrderIndex: targetVideo.orderIndex,
 }),
 });

 if (!response.ok) {
 const data = await response.json();
 throw new Error(data.error || "Failed to reorder videos");
 }

 onOrderChanged(draggedItem, targetVideo.orderIndex);
 setSuccess("Video order updated");
 setTimeout(() => setSuccess(null), 3000);
 } catch (error) {
 console.error("Failed to reorder videos:", error);
 setError(error instanceof Error ? error.message : "Failed to reorder videos");
 } finally {
 setIsLoading(false);
 setDraggedItem(null);
 }
 };

 const formatDuration = (seconds: number) => {
 const minutes = Math.floor(seconds / 60);
 const remainingSeconds = seconds % 60;
 return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
 };

 return (
 <div className="space-y-6">
 {}
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-lg font-semibold text-gray-900">
 Series Videos ({videosWithDetails.length})
 </h3>
 <p className="text-sm text-gray-500">
 Manage videos in this series. Drag to reorder.
 </p>
 </div>
 <button
 onClick={() => setShowAddModal(true)}
 className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
 >
 <PlusIcon className="w-4 h-4" />
 Add Videos
 </button>
 </div>

 {}
 <AnimatePresence>
 {success && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"
 >
 <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
 <p className="text-green-700">{success}</p>
 </motion.div>
 )}
 </AnimatePresence>

 {}
 <AnimatePresence>
 {error && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
 >
 <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
 <div className="flex-1">
 <p className="text-red-700">{error}</p>
 <button
 onClick={() => setError(null)}
 className="text-sm text-red-600 hover:text-red-800 underline mt-1"
 >
 Dismiss
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {}
 {isLoading && videosWithDetails.length === 0 ? (
 <div className="flex items-center justify-center py-12">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
 </div>
 ) : videosWithDetails.length === 0 ? (
 <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
 <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
 <PlusIcon className="w-6 h-6 text-gray-400" />
 </div>
 <h3 className="text-lg font-medium text-gray-900 mb-2">No videos in series</h3>
 <p className="text-gray-500 mb-4">
 Add videos to your series to get started
 </p>
 <button
 onClick={() => setShowAddModal(true)}
 className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
 >
 <PlusIcon className="w-4 h-4" />
 Add Videos
 </button>
 </div>
 ) : (
 <div className="space-y-3">
 {videosWithDetails.map((seriesVideo, index) => (
 <motion.div
 key={seriesVideo.videoId}
 layout
 className={`flex items-center gap-4 p-4 bg-white border rounded-lg transition-all ${
 draggedItem === seriesVideo.videoId
 ? "opacity-50 scale-95"
 : "hover:shadow-md"
 }`}
 draggable
 onDragStart={(e) => handleDragStart(e, seriesVideo.videoId)}
 onDragOver={handleDragOver}
 onDrop={(e) => handleDrop(e, seriesVideo.videoId)}
 >
 {}
 <div className="cursor-move text-gray-400 hover:text-gray-600">
 <Bars3Icon className="w-5 h-5" />
 </div>

 {}
 <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-medium">
 {index + 1}
 </div>

 {}
 <div className="flex-shrink-0">
 <Image
 src={seriesVideo.video.thumbnailUrl}
 alt={seriesVideo.video.title}
 width={80}
 height={48}
 className="w-20 h-12 object-cover rounded"
 />
 </div>

 {}
 <div className="flex-1 min-w-0">
 <h4 className="font-medium text-gray-900 truncate">
 {seriesVideo.video.title}
 </h4>
 <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
 <span>{formatDuration(seriesVideo.video.duration)}</span>
 <span>₹{seriesVideo.video.creditCost} credits</span>
 <span>{seriesVideo.video.viewCount} views</span>
 </div>
 </div>

 {}
 <div className="flex items-center gap-2">
 <VideoPreviewButton video={seriesVideo.video} />
 <button
 onClick={() => handleRemoveVideo(seriesVideo.videoId)}
 disabled={isLoading}
 className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
 title="Remove from series"
 >
 <TrashIcon className="w-4 h-4" />
 </button>
 </div>
 </motion.div>
 ))}
 </div>
 )}

 {}
 {showAddModal && (
 <VideoSelectionModal
 seriesId={seriesId}
 existingVideoIds={videosWithDetails.map(v => v.videoId)}
 onClose={() => setShowAddModal(false)}
 onVideoAdded={onVideoAdded}
 />
 )}
 </div>
 );
}

function VideoPreviewButton({ video }: { video: Video }) {
 const [showPreview, setShowPreview] = useState(false);

 return (
 <>
 <button
 onClick={() => setShowPreview(true)}
 className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
 title="Preview video"
 >
 <EyeIcon className="w-4 h-4" />
 </button>

 {showPreview && (
 <VideoPreviewModal
 video={video}
 onClose={() => setShowPreview(false)}
 />
 )}
 </>
 );
}

function VideoPreviewModal({ 
 video, 
 onClose 
}: { 
 video: Video; 
 onClose: () => void; 
}) {
 return (
 <AnimatePresence>
 <div className="fixed inset-0 z-50 overflow-y-auto">
 <div className="flex min-h-screen items-center justify-center p-4">
 {}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-black bg-opacity-75"
 onClick={onClose}
 />

 {}
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
 >
 {}
 <div className="flex items-center justify-between p-4 border-b border-gray-200">
 <h3 className="text-lg font-semibold text-gray-900 truncate">
 {video.title}
 </h3>
 <button
 onClick={onClose}
 className="text-gray-400 hover:text-gray-600 transition-colors"
 >
 <XMarkIcon className="w-6 h-6" />
 </button>
 </div>

 {}
 <div className="aspect-video bg-black">
 <video
 src={video.videoUrl}
 poster={video.thumbnailUrl}
 controls
 className="w-full h-full"
 >
 Your browser does not support the video tag.
 </video>
 </div>

 {}
 <div className="p-4 space-y-2">
 <div className="flex items-center gap-4 text-sm text-gray-500">
 <span>{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}</span>
 <span>₹{video.creditCost} credits</span>
 <span>{video.viewCount} views</span>
 <span className="capitalize">{video.category}</span>
 </div>
 {video.description && (
 <p className="text-gray-700 text-sm">{video.description}</p>
 )}
 {video.tags.length > 0 && (
 <div className="flex flex-wrap gap-1">
 {video.tags.map((tag) => (
 <span
 key={tag}
 className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
 >
 #{tag}
 </span>
 ))}
 </div>
 )}
 </div>
 </motion.div>
 </div>
 </div>
 </AnimatePresence>
 );
}

function VideoSelectionModal({
 seriesId,
 existingVideoIds,
 onClose,
 onVideoAdded,
}: {
 seriesId: string;
 existingVideoIds: string[];
 onClose: () => void;
 onVideoAdded: (videoId: string) => void;
}) {
 const [availableVideos, setAvailableVideos] = useState<Video[]>([]);
 const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
 const [isLoading, setIsLoading] = useState(false);
 const [isAdding, setIsAdding] = useState(false);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 const loadVideos = async () => {
 setIsLoading(true);
 try {
 const response = await fetch("/api/videos?creator=me");
 if (response.ok) {
 const data = await response.json();

 const available = data.videos.filter(
 (video: Video) => !existingVideoIds.includes(video.id)
 );
 setAvailableVideos(available);
 } else {
 throw new Error("Failed to load videos");
 }
 } catch (error) {
 console.error("Failed to load videos:", error);
 setError("Failed to load your videos");
 } finally {
 setIsLoading(false);
 }
 };

 loadVideos();
 }, [existingVideoIds]);

 const handleAddVideos = async () => {
 if (selectedVideos.length === 0) return;

 setIsAdding(true);
 setError(null);

 try {
 const response = await fetch(`/api/series/${seriesId}/videos`, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 },
 body: JSON.stringify({
 videoIds: selectedVideos,
 }),
 });

 if (!response.ok) {
 const data = await response.json();
 throw new Error(data.error || "Failed to add videos");
 }

 selectedVideos.forEach(videoId => onVideoAdded(videoId));
 onClose();
 } catch (error) {
 console.error("Failed to add videos:", error);
 setError(error instanceof Error ? error.message : "Failed to add videos");
 } finally {
 setIsAdding(false);
 }
 };

 const toggleVideoSelection = (videoId: string) => {
 setSelectedVideos(prev =>
 prev.includes(videoId)
 ? prev.filter(id => id !== videoId)
 : [...prev, videoId]
 );
 };

 return (
 <AnimatePresence>
 <div className="fixed inset-0 z-50 overflow-y-auto">
 <div className="flex min-h-screen items-center justify-center p-4">
 {}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-black bg-opacity-50"
 onClick={onClose}
 />

 {}
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
 >
 {}
 <div className="flex items-center justify-between p-6 border-b border-gray-200">
 <div>
 <h3 className="text-lg font-semibold text-gray-900">
 Add Videos to Series
 </h3>
 <p className="text-sm text-gray-500 mt-1">
 Select videos from your library to add to this series
 </p>
 </div>
 <button
 onClick={onClose}
 className="text-gray-400 hover:text-gray-600 transition-colors"
 >
 <XMarkIcon className="w-6 h-6" />
 </button>
 </div>

 {}
 {error && (
 <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
 <div className="flex items-start gap-3">
 <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
 <p className="text-red-700">{error}</p>
 </div>
 </div>
 )}

 {}
 <div className="p-6 max-h-96 overflow-y-auto">
 {isLoading ? (
 <div className="flex items-center justify-center py-12">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
 </div>
 ) : availableVideos.length === 0 ? (
 <div className="text-center py-12">
 <p className="text-gray-500">No available videos to add</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {availableVideos.map((video) => (
 <div
 key={video.id}
 className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
 selectedVideos.includes(video.id)
 ? "border-purple-500 bg-purple-50"
 : "border-gray-200 hover:border-gray-300"
 }`}
 onClick={() => toggleVideoSelection(video.id)}
 >
 <input
 type="checkbox"
 checked={selectedVideos.includes(video.id)}
 onChange={() => toggleVideoSelection(video.id)}
 className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
 />
 <Image
 src={video.thumbnailUrl}
 alt={video.title}
 width={60}
 height={36}
 className="w-15 h-9 object-cover rounded"
 />
 <div className="flex-1 min-w-0">
 <p className="font-medium text-gray-900 truncate text-sm">
 {video.title}
 </p>
 <p className="text-xs text-gray-500">
 {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")} • {video.viewCount} views
 </p>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 {}
 <div className="flex items-center justify-between p-6 border-t border-gray-200">
 <p className="text-sm text-gray-500">
 {selectedVideos.length} video{selectedVideos.length !== 1 ? 's' : ''} selected
 </p>
 <div className="flex gap-3">
 <button
 onClick={onClose}
 disabled={isAdding}
 className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
 >
 Cancel
 </button>
 <button
 onClick={handleAddVideos}
 disabled={selectedVideos.length === 0 || isAdding}
 className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
 >
 {isAdding ? "Adding..." : `Add ${selectedVideos.length} Video${selectedVideos.length !== 1 ? 's' : ''}`}
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 </div>
 </AnimatePresence>
 );
}