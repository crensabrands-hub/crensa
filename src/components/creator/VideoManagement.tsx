"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
 PlayIcon,
 PencilIcon,
 TrashIcon,
 EyeIcon,
 EyeSlashIcon,
 ShareIcon,
 ChartBarIcon,
 CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";
import { Video } from "@/types";
import VideoEditModal from "./VideoEditModal";
import VideoDeleteModal from "./VideoDeleteModal";
import VideoShareModal from "./VideoShareModal";

interface VideoManagementProps {
 videos: Video[];
 onVideoUpdate: (video: Video) => void;
 onVideoDelete: (videoId: string) => void;
 onVideoStatusToggle: (videoId: string, isActive: boolean) => void;
 isLoading?: boolean;
 onAnalyticsError?: (error: string) => void;
}

export default function VideoManagement({
 videos,
 onVideoUpdate,
 onVideoDelete,
 onVideoStatusToggle,
 isLoading = false,
 onAnalyticsError,
}: VideoManagementProps) {
 const router = useRouter();
 const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
 const [editModalOpen, setEditModalOpen] = useState(false);
 const [deleteModalOpen, setDeleteModalOpen] = useState(false);
 const [shareModalOpen, setShareModalOpen] = useState(false);
 const [analyticsLoading, setAnalyticsLoading] = useState<string | null>(null);
 const [sortBy, setSortBy] = useState<
 "newest" | "oldest" | "views" | "earnings"
 >("newest");
 const [filterBy, setFilterBy] = useState<"all" | "active" | "inactive">(
 "all"
 );

 const sortedAndFilteredVideos = videos
 .filter((video) => {
 if (filterBy === "active") return video.isActive;
 if (filterBy === "inactive") return !video.isActive;
 return true;
 })
 .sort((a, b) => {
 switch (sortBy) {
 case "newest":
 return (
 new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
 );
 case "oldest":
 return (
 new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
 );
 case "views":
 return b.viewCount - a.viewCount;
 case "earnings":
 return b.totalEarnings - a.totalEarnings;
 default:
 return 0;
 }
 });

 const handleEditVideo = (video: Video) => {
 setSelectedVideo(video);
 setEditModalOpen(true);
 };

 const handleDeleteVideo = (video: Video) => {
 setSelectedVideo(video);
 setDeleteModalOpen(true);
 };

 const handleShareVideo = (video: Video) => {
 setSelectedVideo(video);
 setShareModalOpen(true);
 };

 const handleStatusToggle = async (video: Video) => {
 try {
 await onVideoStatusToggle(video.id, !video.isActive);
 } catch (error) {
 console.error("Failed to toggle video status:", error);
 }
 };

 const handleViewAnalytics = (video: Video) => {
 try {
 setAnalyticsLoading(video.id);

 router.push(`/creator/analytics?videoId=${video.id}`);

 setTimeout(() => setAnalyticsLoading(null), 500);
 } catch (error) {
 console.error("Failed to navigate to analytics:", error);
 const errorMessage = error instanceof Error ? error.message : "Failed to load analytics";
 setAnalyticsLoading(null);
 onAnalyticsError?.(errorMessage);
 }
 };

 const formatDuration = (seconds: number) => {
 const minutes = Math.floor(seconds / 60);
 const remainingSeconds = seconds % 60;
 return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
 };

 const formatDate = (date: Date) => {
 return new Intl.DateTimeFormat("en-IN", {
 year: "numeric",
 month: "short",
 day: "numeric",
 }).format(new Date(date));
 };

 if (isLoading) {
 return (
 <div className="space-y-4">
 {[...Array(3)].map((_, i) => (
 <div
 key={i}
 className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
 >
 <div className="animate-pulse">
 <div className="flex space-x-4">
 <div className="bg-gray-300 rounded-lg w-32 h-20"></div>
 <div className="flex-1 space-y-2">
 <div className="h-4 bg-gray-300 rounded w-3/4"></div>
 <div className="h-3 bg-gray-300 rounded w-1/2"></div>
 <div className="h-3 bg-gray-300 rounded w-1/4"></div>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h2 className="text-2xl font-bold text-gray-900">Video Management</h2>
 <p className="text-gray-600 mt-1">
 Manage your uploaded videos, pricing, and settings
 </p>
 </div>

 <div className="flex flex-col sm:flex-row gap-3">
 {}
 <select
 value={filterBy}
 onChange={(e) => setFilterBy(e.target.value as any)}
 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
 >
 <option value="all">All Videos</option>
 <option value="active">Active</option>
 <option value="inactive">Inactive</option>
 </select>

 {}
 <select
 value={sortBy}
 onChange={(e) => setSortBy(e.target.value as any)}
 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
 >
 <option value="newest">Newest First</option>
 <option value="oldest">Oldest First</option>
 <option value="views">Most Views</option>
 <option value="earnings">Highest Earnings</option>
 </select>
 </div>
 </div>

 {}
 {sortedAndFilteredVideos.length === 0 ? (
 <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
 <PlayIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 {videos.length === 0
 ? "No videos uploaded yet"
 : "No videos match your filters"}
 </h3>
 <p className="text-gray-600">
 {videos.length === 0
 ? "Upload your first video to start earning"
 : "Try adjusting your filters to see more videos"}
 </p>
 </div>
 ) : (
 <div className="space-y-4">
 <AnimatePresence>
 {sortedAndFilteredVideos.map((video) => (
 <motion.div
 key={video.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
 >
 <div className="p-6">
 <div className="flex flex-col lg:flex-row gap-6">
 {}
 <div className="relative flex-shrink-0">
 <Image
 src={video.thumbnailUrl}
 alt={video.title}
 width={192}
 height={128}
 className="w-full lg:w-48 h-32 object-cover rounded-lg"
 />
 <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
 {formatDuration(video.duration)}
 </div>
 {!video.isActive && (
 <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
 <span className="text-white font-semibold">
 INACTIVE
 </span>
 </div>
 )}
 </div>

 {}
 <div className="flex-1 min-w-0">
 <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
 <div className="flex-1 min-w-0">
 <h3 className="text-lg font-semibold text-gray-900 truncate">
 {video.title}
 </h3>
 {video.description && (
 <p className="text-gray-600 mt-1 line-clamp-2">
 {video.description}
 </p>
 )}

 <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
 <span className="flex items-center gap-1">
 <EyeIcon className="w-4 h-4" />
 {video.viewCount} views
 </span>
 <span className="flex items-center gap-1">
 <span role="img" aria-label="coins">🪙</span>
 {Math.floor(parseFloat(video.totalEarnings.toString()) * 20)} coins earned
 </span>
 <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
 {video.category}
 </span>
 <span className="text-xs">
 {formatDate(video.createdAt)}
 </span>
 </div>

 {video.tags.length > 0 && (
 <div className="flex flex-wrap gap-1 mt-2">
 {video.tags.slice(0, 3).map((tag) => (
 <span
 key={tag}
 className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
 >
 #{tag}
 </span>
 ))}
 {video.tags.length > 3 && (
 <span className="text-gray-500 text-xs">
 +{video.tags.length - 3} more
 </span>
 )}
 </div>
 )}
 </div>

 {}
 <div className="text-right">
 <div className="flex items-center justify-end gap-1">
 <span className="text-xl" role="img" aria-label="coins">🪙</span>
 <div className="text-2xl font-bold text-purple-600">
 {video.coinPrice || video.creditCost}
 </div>
 </div>
 <div className="text-sm text-gray-500">coins per view</div>
 </div>
 </div>

 {}
 <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
 <button
 onClick={() => handleEditVideo(video)}
 className="inline-flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
 >
 <PencilIcon className="w-4 h-4" />
 Edit
 </button>

 <button
 onClick={() => handleStatusToggle(video)}
 className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
 video.isActive
 ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
 : "text-green-600 hover:text-green-700 hover:bg-green-50"
 }`}
 >
 {video.isActive ? (
 <>
 <EyeSlashIcon className="w-4 h-4" />
 Deactivate
 </>
 ) : (
 <>
 <EyeIcon className="w-4 h-4" />
 Activate
 </>
 )}
 </button>

 <button
 onClick={() => handleShareVideo(video)}
 className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
 >
 <ShareIcon className="w-4 h-4" />
 Share
 </button>

 <button 
 onClick={() => handleViewAnalytics(video)}
 disabled={analyticsLoading === video.id}
 className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {analyticsLoading === video.id ? (
 <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
 ) : (
 <ChartBarIcon className="w-4 h-4" />
 )}
 {analyticsLoading === video.id ? "Loading..." : "Analytics"}
 </button>

 <button
 onClick={() => handleDeleteVideo(video)}
 className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
 >
 <TrashIcon className="w-4 h-4" />
 Delete
 </button>
 </div>
 </div>
 </div>
 </div>
 </motion.div>
 ))}
 </AnimatePresence>
 </div>
 )}

 {}
 <VideoEditModal
 video={selectedVideo}
 isOpen={editModalOpen}
 onClose={() => {
 setEditModalOpen(false);
 setSelectedVideo(null);
 }}
 onSave={onVideoUpdate}
 />

 <VideoDeleteModal
 video={selectedVideo}
 isOpen={deleteModalOpen}
 onClose={() => {
 setDeleteModalOpen(false);
 setSelectedVideo(null);
 }}
 onConfirm={(videoId) => {
 onVideoDelete(videoId);
 setDeleteModalOpen(false);
 setSelectedVideo(null);
 }}
 />

 <VideoShareModal
 video={selectedVideo}
 isOpen={shareModalOpen}
 onClose={() => {
 setShareModalOpen(false);
 setSelectedVideo(null);
 }}
 />
 </div>
 );
}
