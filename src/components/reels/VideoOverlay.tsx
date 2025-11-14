"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Video, WalletBalance } from "@/types";
import {
 HeartIcon,
 ShareIcon,
 ChatBubbleOvalLeftIcon,
 BookmarkIcon,
 UserIcon,
 CurrencyDollarIcon,
 EyeIcon,
 PlayIcon,
} from "@heroicons/react/24/outline";
import {
 HeartIcon as HeartSolidIcon,
 BookmarkIcon as BookmarkSolidIcon,
} from "@heroicons/react/24/solid";
import { useCreditDeduction } from "@/hooks/useCreditDeduction";
import CreditConfirmationModal from "@/components/modals/CreditConfirmationModal";
import { videoInteractionService } from "@/lib/services/videoInteractionService";
import { useAuthContext } from "@/contexts/AuthContext";

interface VideoOverlayProps {
 video: Video;
 isPlaying: boolean;
 hasWatched: boolean;
 isLoading: boolean;
 onPlayPause: () => void;
 onWatch: () => void;
 onShare: () => void;
 onInsufficientCredits?: () => void;
 className?: string;
}

export default function VideoOverlay({
 video,
 isPlaying,
 hasWatched,
 isLoading,
 onPlayPause,
 onWatch,
 onShare,
 onInsufficientCredits,
 className = "",
}: VideoOverlayProps) {
 const [isLiked, setIsLiked] = useState(false);
 const [isSaved, setIsSaved] = useState(false);
 const [isFollowing, setIsFollowing] = useState(false);
 const [showDescription, setShowDescription] = useState(false);
 const [showConfirmationModal, setShowConfirmationModal] = useState(false);
 const [showCommentModal, setShowCommentModal] = useState(false);
 const [commentText, setCommentText] = useState('');
 const [isSubmittingComment, setIsSubmittingComment] = useState(false);
 const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(
 null
 );
 const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 1000) + 100);

 const {
 deductCredits,
 getWalletBalance,
 isProcessing,
 error: creditError,
 clearError,
 } = useCreditDeduction();

 const { userProfile } = useAuthContext();

 const loadWalletBalance = useCallback(async () => {
 const balance = await getWalletBalance();
 if (balance) {
 setWalletBalance(balance);
 }
 }, [getWalletBalance]);

 const loadInteractionStatus = useCallback(async () => {
 if (!userProfile?.id) return;
 
 try {
 const status = await videoInteractionService.getInteractionStatus(userProfile.id, video.id);
 setIsLiked(status.isLiked);
 setIsSaved(status.isSaved);
 setIsFollowing(status.isFollowingCreator);
 } catch (error) {
 console.error('Error loading interaction status:', error);
 }
 }, [userProfile?.id, video.id]);

 useEffect(() => {
 if (!hasWatched) {
 loadWalletBalance();
 }

 if (userProfile?.id) {
 loadInteractionStatus();
 }
 }, [hasWatched, loadWalletBalance, userProfile?.id, loadInteractionStatus]);

 const handleWatchClick = async () => {
 if (hasWatched) {
 onPlayPause();
 return;
 }

 await loadWalletBalance();

 setShowConfirmationModal(true);
 };

 const handleConfirmWatch = async () => {
 clearError();

 const result = await deductCredits(video.id);

 if (result.success) {
 setShowConfirmationModal(false);
 onWatch();

 await loadWalletBalance();
 } else if (
 result.error &&
 typeof result.error === "object" &&
 "shortfall" in result.error
 ) {

 if (onInsufficientCredits) {
 onInsufficientCredits();
 }
 }
 };

 const handleCancelWatch = () => {
 setShowConfirmationModal(false);
 clearError();
 };

 const handleRecharge = () => {
 setShowConfirmationModal(false);
 if (onInsufficientCredits) {
 onInsufficientCredits();
 } else {
 window.location.href = "/wallet/recharge";
 }
 };

 const handleLike = async () => {
 if (!userProfile?.id) return;
 
 try {
 const result = await videoInteractionService.toggleLike(userProfile.id, video.id);
 setIsLiked(result.isLiked);
 setLikeCount(result.likeCount);
 } catch (error) {
 console.error('Error toggling like:', error);
 }
 };

 const handleSave = async () => {
 if (!userProfile?.id) return;
 
 try {
 const result = await videoInteractionService.toggleSave(userProfile.id, video.id);
 setIsSaved(result.isSaved);
 } catch (error) {
 console.error('Error toggling save:', error);
 }
 };

 const handleComment = () => {
 setShowCommentModal(true);
 };

 const handleSubmitComment = async () => {
 if (!commentText.trim() || !userProfile?.id || isSubmittingComment) return;

 setIsSubmittingComment(true);
 try {
 const result = await videoInteractionService.addComment(
 userProfile.id,
 video.id,
 commentText.trim()
 );

 if (result.success) {
 setCommentText('');
 setShowCommentModal(false);

 }
 } catch (error) {
 console.error('Error submitting comment:', error);

 } finally {
 setIsSubmittingComment(false);
 }
 };

 const handleCreatorClick = () => {

 if (video.creator?.username) {
 window.location.href = `/creator/${video.creator.username}`;
 } else {
 console.log("Creator profile not available");
 }
 };

 const handleFollowClick = async (e: React.MouseEvent) => {
 e.stopPropagation(); // Prevent creator click
 
 if (!userProfile?.id || !video.creatorId) return;
 
 try {
 const result = await videoInteractionService.toggleFollow(userProfile.id, video.creatorId);
 setIsFollowing(result.isFollowing);
 } catch (error) {
 console.error('Error toggling follow:', error);
 }
 };

 return (
 <div className={`relative w-full h-full ${className}`}>
 {}
 <div className="absolute bottom-0 left-0 right-20 p-4 pointer-events-auto">
 {}
 <motion.div
 className="flex items-center gap-3 mb-4"
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.2 }}
 >
 <button
 onClick={handleCreatorClick}
 className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white"
 >
 {video.creator?.avatar ? (
 <Image
 src={video.creator.avatar}
 alt={video.creator.displayName || "Creator"}
 fill
 className="object-cover"
 />
 ) : (
 <div className="w-full h-full bg-gray-600 flex items-center justify-center">
 <UserIcon className="w-6 h-6 text-white" />
 </div>
 )}
 </button>

 <div className="flex-1">
 <button
 onClick={handleCreatorClick}
 className="block text-white font-semibold text-left hover:underline"
 >
 {video.creator?.displayName || "Unknown Creator"}
 </button>
 <p className="text-white text-opacity-80 text-sm">
 @{video.creator?.username || "unknown"}
 </p>
 </div>

 {}
 <button 
 onClick={handleFollowClick}
 className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
 isFollowing 
 ? 'bg-gray-600 text-white hover:bg-gray-700' 
 : 'bg-white text-black hover:bg-gray-200'
 }`}
 >
 {isFollowing ? 'Following' : 'Follow'}
 </button>
 </motion.div>

 {}
 <motion.div
 className="mb-3"
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.3 }}
 >
 <h2 className="text-white font-semibold text-lg leading-tight mb-1">
 {video.title}
 </h2>

 {video.description && (
 <div>
 <p className="text-white text-opacity-90 text-sm leading-relaxed">
 {showDescription
 ? video.description
 : `${video.description.slice(0, 100)}${
 video.description.length > 100 ? "..." : ""
 }`}
 {video.description.length > 100 && (
 <button
 onClick={() => setShowDescription(!showDescription)}
 className="text-white font-medium ml-1 hover:underline"
 >
 {showDescription ? "less" : "more"}
 </button>
 )}
 </p>
 </div>
 )}
 </motion.div>

 {}
 <motion.div
 className="flex items-center gap-4 text-white text-opacity-80 text-sm"
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.4 }}
 >
 <div className="flex items-center gap-1">
 <EyeIcon className="w-4 h-4" />
 <span>{video.viewCount.toLocaleString()}</span>
 </div>

 <div className="flex items-center gap-1">
 <CurrencyDollarIcon className="w-4 h-4" />
 <span>{video.creditCost} credits</span>
 </div>

 <div className="text-white text-opacity-60">{video.category}</div>
 </motion.div>

 {}
 {video.tags && video.tags.length > 0 && (
 <motion.div
 className="flex flex-wrap gap-2 mt-2"
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.5 }}
 >
 {video.tags.slice(0, 3).map((tag, index) => (
 <span key={index} className="text-white text-opacity-80 text-sm">
 #{tag}
 </span>
 ))}
 </motion.div>
 )}
 </div>

 {}
 <motion.div
 className="absolute bottom-0 right-4 flex flex-col gap-4 pb-4 pointer-events-auto"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.3 }}
 >
 {}
 <div className="flex flex-col items-center">
 <button
 onClick={handleLike}
 className="w-12 h-12 bg-black bg-opacity-30 rounded-full flex items-center justify-center text-white hover:bg-opacity-50 transition-all"
 >
 {isLiked ? (
 <HeartSolidIcon className="w-6 h-6 text-red-500" />
 ) : (
 <HeartIcon className="w-6 h-6" />
 )}
 </button>
 <span className="text-white text-xs mt-1">
 {likeCount.toLocaleString()}
 </span>
 </div>

 {}
 <div className="flex flex-col items-center">
 <button
 onClick={handleComment}
 className="w-12 h-12 bg-black bg-opacity-30 rounded-full flex items-center justify-center text-white hover:bg-opacity-50 transition-all"
 >
 <ChatBubbleOvalLeftIcon className="w-6 h-6" />
 </button>
 <span className="text-white text-xs mt-1">
 {Math.floor(Math.random() * 100)}
 </span>
 </div>

 {}
 <div className="flex flex-col items-center">
 <button
 onClick={onShare}
 className="w-12 h-12 bg-black bg-opacity-30 rounded-full flex items-center justify-center text-white hover:bg-opacity-50 transition-all"
 >
 <ShareIcon className="w-6 h-6" />
 </button>
 <span className="text-white text-xs mt-1">Share</span>
 </div>

 {}
 <div className="flex flex-col items-center">
 <button
 onClick={handleSave}
 className="w-12 h-12 bg-black bg-opacity-30 rounded-full flex items-center justify-center text-white hover:bg-opacity-50 transition-all"
 >
 {isSaved ? (
 <BookmarkSolidIcon className="w-6 h-6 text-yellow-500" />
 ) : (
 <BookmarkIcon className="w-6 h-6" />
 )}
 </button>
 <span className="text-white text-xs mt-1">Save</span>
 </div>
 </motion.div>

 {}
 {!hasWatched && (
 <AnimatePresence>
 <motion.div
 className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-auto"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 >
 <div className="text-center text-white max-w-sm mx-4">
 <motion.div
 className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.95 }}
 >
 {isLoading || isProcessing ? (
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
 ) : (
 <PlayIcon className="w-8 h-8 text-white ml-1" />
 )}
 </motion.div>

 <h3 className="text-xl font-semibold mb-2">
 Watch for {video.creditCost} Credits
 </h3>

 <p className="text-white text-opacity-80 mb-6 text-sm">
 Tap to watch this video and support the creator
 </p>

 <motion.button
 onClick={handleWatchClick}
 disabled={isLoading || isProcessing}
 className="px-8 py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 >
 {isLoading || isProcessing ? (
 <span className="flex items-center gap-2">
 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
 Processing...
 </span>
 ) : (
 "Watch Now"
 )}
 </motion.button>
 </div>
 </motion.div>
 </AnimatePresence>
 )}

 {}
 {walletBalance && (
 <CreditConfirmationModal
 isOpen={showConfirmationModal}
 video={video}
 walletBalance={walletBalance}
 onConfirm={handleConfirmWatch}
 onCancel={handleCancelWatch}
 onPurchaseCoins={handleRecharge}
 isProcessing={isProcessing}
 error={creditError || undefined}
 />
 )}

 {}
 {isLoading && hasWatched && (
 <motion.div
 className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-auto"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 >
 <div className="text-center text-white">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
 <p>Loading video...</p>
 </div>
 </motion.div>
 )}
 </div>
 );
}
