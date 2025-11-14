"use client";

import { useState } from "react";
import VideoUpload from "@/components/creator/VideoUpload";
import { Video } from "@/types";
import { useRouter } from "next/navigation";

export default function UploadPage() {
 const router = useRouter();
 const [uploadedVideos, setUploadedVideos] = useState<Video[]>([]);

 const handleUploadComplete = (video: Video) => {
 setUploadedVideos((prev) => [video, ...prev]);

 setTimeout(() => {
 router.push("/creator/videos");
 }, 100);
 };

 return (
 <div className="min-h-screen bg-gray-50 py-8">
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="mb-8">
 <h1 className="text-3xl font-bold text-gray-900">Upload Video</h1>
 <p className="text-gray-600 mt-2">
 Share your content and start earning from your creativity
 </p>
 </div>

 <VideoUpload onUploadComplete={handleUploadComplete} />

 {}
 {uploadedVideos.length > 0 && (
 <div className="mt-12">
 <h2 className="text-2xl font-bold text-gray-900 mb-6">
 Recently Uploaded
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {uploadedVideos.map((video) => (
 <div
 key={video.id}
 className="bg-white rounded-lg shadow-md overflow-hidden"
 >
 <div className="aspect-video bg-gray-200 relative">
 <img
 src={video.thumbnailUrl}
 alt={video.title}
 className="w-full h-full object-cover"
 />
 <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
 {Math.floor(video.duration / 60)}:
 {(video.duration % 60).toString().padStart(2, "0")}
 </div>
 </div>
 <div className="p-4">
 <h3 className="font-semibold text-gray-900 truncate">
 {video.title}
 </h3>
 <p className="text-sm text-gray-600 mt-1">
 {video.category}
 </p>
 <div className="flex justify-between items-center mt-3">
 <span className="text-sm font-medium text-purple-600 flex items-center gap-1">
 <span role="img" aria-label="coins">🪙</span>
 {video.coinPrice || Math.round(parseFloat(video.creditCost.toString()) * 20)} coins
 </span>
 <span className="text-xs text-gray-500">
 {new Date(video.createdAt).toLocaleDateString()}
 </span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
