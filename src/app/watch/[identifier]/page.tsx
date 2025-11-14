

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import UnifiedWatchClient from "./UnifiedWatchClient";

interface WatchPageProps {
 params: Promise<{
 identifier: string;
 }>;
}

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
 try {
 const { identifier } = await params;

 const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/watch/${identifier}`, {
 cache: 'no-store' // Don't cache metadata requests
 });

 if (response.ok) {
 const data = await response.json();
 const video = data.video;
 
 return {
 title: `${video.title} | Crensa`,
 description: video.description || `Watch ${video.title} on Crensa`,
 openGraph: {
 title: video.title,
 description: video.description || `Watch ${video.title} on Crensa`,
 images: video.thumbnailUrl ? [video.thumbnailUrl] : [],
 type: 'video.other',
 },
 twitter: {
 card: 'summary_large_image',
 title: video.title,
 description: video.description || `Watch ${video.title} on Crensa`,
 images: video.thumbnailUrl ? [video.thumbnailUrl] : [],
 }
 };
 }
 } catch (error) {
 console.error('Error generating metadata:', error);
 }

 return {
 title: `Watch Video | Crensa`,
 description: "Watch video content on Crensa",
 };
}

export default async function WatchPage({ params }: WatchPageProps) {
 const { identifier } = await params;

 if (!identifier) {
 notFound();
 }

 return (
 <Suspense fallback={<WatchPageSkeleton />}>
 <UnifiedWatchClient identifier={identifier} />
 </Suspense>
 );
}

function WatchPageSkeleton() {
 return (
 <div className="min-h-screen bg-black">
 {}
 <div className="relative w-full aspect-video bg-gray-900">
 <div className="absolute inset-0 flex items-center justify-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
 </div>
 </div>

 {}
 <div className="max-w-6xl mx-auto p-6">
 <div className="animate-pulse">
 {}
 <div className="h-8 bg-gray-700 rounded mb-4 w-3/4"></div>
 
 {}
 <div className="flex space-x-4 mb-6">
 <div className="h-4 bg-gray-700 rounded w-20"></div>
 <div className="h-4 bg-gray-700 rounded w-16"></div>
 <div className="h-4 bg-gray-700 rounded w-24"></div>
 </div>

 {}
 <div className="flex items-center space-x-4 mb-6">
 <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
 <div>
 <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
 <div className="h-3 bg-gray-700 rounded w-24"></div>
 </div>
 </div>

 {}
 <div className="bg-gray-900 rounded-lg p-4">
 <div className="h-4 bg-gray-700 rounded mb-2"></div>
 <div className="h-4 bg-gray-700 rounded mb-2 w-5/6"></div>
 <div className="h-4 bg-gray-700 rounded w-3/4"></div>
 </div>
 </div>
 </div>
 </div>
 );
}