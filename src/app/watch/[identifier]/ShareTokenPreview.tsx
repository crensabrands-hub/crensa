'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
 PlayIcon,
 UserIcon,
 EyeIcon,
 ShareIcon,
 ArrowLeftIcon
} from '@heroicons/react/24/outline';
import CoinPrice from '@/components/wallet/CoinPrice';
import { coinsToRupees } from '@/lib/utils/coin-utils';

interface VideoData {
 id: string;
 title: string;
 description?: string;
 thumbnailUrl: string;
 duration: number;
 creditCost: number; // Deprecated
 coinPrice: number;
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
 accessType: 'owned' | 'token_preview' | 'requires_purchase' | 'creator_self_access';
 shareToken?: string;
 requiresPurchase: boolean;
}

interface ShareTokenPreviewProps {
 video: VideoData;
 access: AccessInfo;
 onWatchSuccess: () => void;
}

export default function ShareTokenPreview({ video, access, onWatchSuccess }: ShareTokenPreviewProps) {
 const router = useRouter();
 const { isSignedIn } = useAuth();
 const [watching, setWatching] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const handleWatchVideo = async () => {
 if (!video) return;

 if (!isSignedIn) {

 router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`);
 return;
 }

 try {
 setWatching(true);
 setError(null);
 
 const response = await fetch(`/api/watch/${access.shareToken}/view`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 }
 });

 if (!response.ok) {
 const errorData = await response.json();
 if (response.status === 402) {

 router.push('/member/wallet?action=purchase&reason=insufficient_coins');
 return;
 }
 throw new Error(errorData.error || 'Failed to start video');
 }

 const data = await response.json();
 
 if (data.success) {

 onWatchSuccess();
 } else {
 throw new Error(data.error || 'Failed to start video');
 }
 
 } catch (error) {
 console.error('Error starting video:', error);
 setError(error instanceof Error ? error.message : 'Failed to start video');
 } finally {
 setWatching(false);
 }
 };

 const handleShare = async () => {
 if (navigator.share && video) {
 try {
 await navigator.share({
 title: video.title,
 text: `Check out "${video.title}" on Crensa!`,
 url: window.location.href
 });
 } catch (error) {

 handleCopyToClipboard();
 }
 } else {
 handleCopyToClipboard();
 }
 };

 const handleCopyToClipboard = async () => {
 try {
 await navigator.clipboard.writeText(window.location.href);

 } catch (error) {
 console.error('Failed to copy to clipboard:', error);
 }
 };

 const formatDuration = (seconds: number) => {
 const minutes = Math.floor(seconds / 60);
 const remainingSeconds = seconds % 60;
 return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
 };

 return (
 <div className="min-h-screen bg-gray-50">
 {}
 <header className="bg-white border-b border-gray-200">
 <div className="max-w-4xl mx-auto px-4 py-4">
 <div className="flex items-center justify-between">
 <button
 onClick={() => router.push('/')}
 className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
 >
 <ArrowLeftIcon className="w-5 h-5" />
 Back to Crensa
 </button>
 <button
 onClick={handleShare}
 className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
 >
 <ShareIcon className="w-5 h-5" />
 Share
 </button>
 </div>
 </div>
 </header>

 {}
 <main className="max-w-4xl mx-auto px-4 py-8">
 <div className="bg-white rounded-xl shadow-sm overflow-hidden">
 {}
 <div className="relative aspect-video bg-black">
 <Image
 src={video.thumbnailUrl}
 alt={video.title}
 fill
 className="object-cover"
 priority
 />
 
 {}
 <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
 <motion.button
 onClick={handleWatchVideo}
 disabled={watching}
 className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all disabled:opacity-50"
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.95 }}
 >
 {watching ? (
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
 ) : (
 <PlayIcon className="w-8 h-8 text-purple-600 ml-1" />
 )}
 </motion.button>
 </div>

 {}
 <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
 {formatDuration(video.duration)}
 </div>
 </div>

 {}
 <div className="p-6">
 <div className="flex items-start justify-between mb-4">
 <div className="flex-1">
 <h1 className="text-2xl font-bold text-gray-900 mb-2">
 {video.title}
 </h1>
 {video.description && (
 <p className="text-gray-600 mb-4">
 {video.description}
 </p>
 )}
 </div>
 
 <div className="flex flex-col items-end gap-1">
 <CoinPrice coins={video.coinPrice} size="medium" />
 <span className="text-xs text-gray-500">
 ≈ ₹{coinsToRupees(video.coinPrice).toFixed(2)}
 </span>
 </div>
 </div>

 {}
 <div className="flex items-center gap-4 mb-6">
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
 <p className="font-medium text-gray-900">
 {video.creator.displayName}
 </p>
 <p className="text-sm text-gray-500">
 @{video.creator.username}
 </p>
 </div>
 </div>

 {}
 <div className="flex items-center gap-6 mb-6">
 <div className="flex items-center gap-2 text-gray-600">
 <EyeIcon className="w-5 h-5" />
 <span>{video.viewCount.toLocaleString()} views</span>
 </div>
 <div className="text-gray-600">
 Category: <span className="font-medium">{video.category}</span>
 </div>
 </div>

 {}
 {video.tags.length > 0 && (
 <div className="flex flex-wrap gap-2 mb-6">
 {video.tags.map((tag, index) => (
 <span
 key={index}
 className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
 >
 #{tag}
 </span>
 ))}
 </div>
 )}

 {}
 {error && (
 <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
 <p className="text-red-700 text-sm">{error}</p>
 </div>
 )}

 {}
 <div className="border-t border-gray-200 pt-6">
 <motion.button
 onClick={handleWatchVideo}
 disabled={watching}
 className="w-full bg-purple-600 text-white py-4 rounded-lg font-medium text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 >
 {watching ? (
 <span className="flex items-center justify-center gap-2">
 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
 Starting Video...
 </span>
 ) : (
 <span className="flex items-center justify-center gap-2">
 <PlayIcon className="w-6 h-6" />
 Watch for <CoinPrice coins={video.coinPrice} size="small" variant="inline" className="ml-1" />
 </span>
 )}
 </motion.button>
 
 {!isSignedIn && (
 <p className="text-center text-gray-600 mt-3">
 <button
 onClick={() => router.push('/sign-up')}
 className="text-purple-600 hover:text-purple-700 font-medium"
 >
 Sign up
 </button>
 {' '}or{' '}
 <button
 onClick={() => router.push('/sign-in')}
 className="text-purple-600 hover:text-purple-700 font-medium"
 >
 sign in
 </button>
 {' '}to watch this video
 </p>
 )}
 </div>

 {}
 <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
 <p className="text-sm text-purple-700">
 <strong>Shared by {video.creator.displayName}</strong> - 
 When you watch this video, the creator earns revenue with proper attribution. 
 Join Crensa to discover more amazing content!
 </p>
 </div>
 </div>
 </div>
 </main>
 </div>
 );
}