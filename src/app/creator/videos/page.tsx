"use client";

import { useState } from "react";
import { useVideoManagement } from "@/hooks/useVideoManagement";
import VideoManagement from "@/components/creator/VideoManagement";
import VideoManagementErrorBoundary from "@/components/creator/VideoManagementErrorBoundary";
import { CreatorProtectedRoute } from "@/components/layout/ProtectedRoute";
import dynamic from "next/dynamic";

function CreatorVideosContent() {
 const [analyticsError, setAnalyticsError] = useState<string | null>(null);
 
 const {
 videos,
 isLoading,
 error,
 updateVideo,
 deleteVideo,
 toggleVideoStatus,
 refetch
 } = useVideoManagement();

 const handleVideoUpdate = async (video: any) => {
 try {
 await updateVideo(video);

 } catch (error) {
 console.error('Failed to update video:', error);

 }
 };

 const handleVideoDelete = async (videoId: string) => {
 try {
 await deleteVideo(videoId);

 } catch (error) {
 console.error('Failed to delete video:', error);

 }
 };

 const handleVideoStatusToggle = async (videoId: string, isActive: boolean) => {
 try {
 await toggleVideoStatus(videoId, isActive);

 } catch (error) {
 console.error('Failed to toggle video status:', error);

 }
 };

 const handleAnalyticsError = (error: string) => {
 setAnalyticsError(error);

 setTimeout(() => setAnalyticsError(null), 5000);
 };

 if (error) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="text-center">
 <h2 className="text-2xl font-bold text-gray-900 mb-4">
 Failed to load videos
 </h2>
 <p className="text-gray-600 mb-6">{error}</p>
 <button
 onClick={refetch}
 className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
 >
 Try Again
 </button>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {}
 {analyticsError && (
 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
 <div className="flex items-center">
 <div className="w-5 h-5 text-red-600 mr-3">
 <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 <div>
 <h3 className="text-sm font-medium text-red-800">Analytics Error</h3>
 <p className="text-sm text-red-600 mt-1">{analyticsError}</p>
 </div>
 <button
 onClick={() => setAnalyticsError(null)}
 className="ml-auto text-red-600 hover:text-red-800"
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>
 </div>
 )}

 <VideoManagementErrorBoundary>
 <VideoManagement
 videos={videos}
 onVideoUpdate={handleVideoUpdate}
 onVideoDelete={handleVideoDelete}
 onVideoStatusToggle={handleVideoStatusToggle}
 onAnalyticsError={handleAnalyticsError}
 isLoading={isLoading}
 />
 </VideoManagementErrorBoundary>
 </div>
 );
}

function CreatorVideosPage() {
 return (
 <CreatorProtectedRoute>
 <CreatorVideosContent />
 </CreatorProtectedRoute>
 );
}

export default CreatorVideosPage;