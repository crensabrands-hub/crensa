"use client";

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface FollowedCreator {
 id: string;
 username: string;
 displayName?: string;
 avatar?: string;
 videoCount: number;
 totalViews: number;
 followedAt: Date;
 isFollowing: boolean;
}

interface FollowedCreatorsSectionProps {
 className?: string;
 showAll?: boolean;
 limit?: number;
}

export function FollowedCreatorsSection({ 
 className = '', 
 showAll = false, 
 limit = 6 
}: FollowedCreatorsSectionProps) {
 const { userProfile } = useAuthContext();
 const router = useRouter();
 const [creators, setCreators] = useState<FollowedCreator[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [unfollowingId, setUnfollowingId] = useState<string | null>(null);
 const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);

 useEffect(() => {
 const fetchFollowedCreators = async () => {
 if (!userProfile) return;

 try {
 setLoading(true);
 setError(null);

 const response = await fetch('/api/member/dashboard');
 const result = await response.json();

 if (!response.ok) {
 throw new Error(result.error || 'Failed to fetch followed creators');
 }

 if (result.success && result.data.followedCreators) {
 const processedCreators = result.data.followedCreators.map((creator: any) => ({
 ...creator,
 followedAt: new Date(creator.followedAt),
 isFollowing: true
 }));
 
 setCreators(showAll ? processedCreators : processedCreators.slice(0, limit));
 }
 } catch (err) {
 console.error('Error fetching followed creators:', err);
 setError(err instanceof Error ? err.message : 'Failed to load followed creators');
 } finally {
 setLoading(false);
 }
 };

 fetchFollowedCreators();
 }, [userProfile, showAll, limit]);

 const handleUnfollow = async (creatorId: string) => {
 if (!userProfile) return;

 try {
 setUnfollowingId(creatorId);
 setError(null);

 const response = await fetch('/api/interactions/follow', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({ creatorId }),
 });

 const result = await response.json();

 if (!response.ok) {
 throw new Error(result.error || 'Failed to unfollow creator');
 }

 if (result.success && !result.data.isFollowing) {

 setCreators(prev => prev.filter(creator => creator.id !== creatorId));
 setShowConfirmDialog(null);
 } else {
 throw new Error('Unexpected response from server');
 }
 } catch (err) {
 console.error('Error unfollowing creator:', err);
 setError(err instanceof Error ? err.message : 'Failed to unfollow creator');
 } finally {
 setUnfollowingId(null);
 }
 };

 const handleCreatorClick = (creatorId: string, username: string) => {

 trackProfileVisit(creatorId);

 router.push(`/creator/${username}`);
 };

 const trackProfileVisit = async (creatorId: string) => {
 try {
 await fetch('/api/member/profile-visits', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({ 
 creatorId,
 source: 'followed_creators'
 }),
 });
 } catch (err) {
 console.error('Error tracking profile visit:', err);

 }
 };

 const formatFollowDate = (date: Date) => {
 const now = new Date();
 const diffTime = Math.abs(now.getTime() - date.getTime());
 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

 if (diffDays === 1) return 'Yesterday';
 if (diffDays < 7) return `${diffDays} days ago`;
 if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
 if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
 return `${Math.ceil(diffDays / 365)} years ago`;
 };

 if (loading) {
 return (
 <div className={`card ${className}`}>
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold text-primary-navy">
 Followed Creators
 </h3>
 <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
 </div>
 <div className="space-y-3">
 {[...Array(3)].map((_, i) => (
 <div key={i} className="flex items-center space-x-3 animate-pulse">
 <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
 <div className="flex-1">
 <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
 <div className="h-3 bg-gray-200 rounded w-1/3"></div>
 </div>
 <div className="w-16 h-6 bg-gray-200 rounded"></div>
 </div>
 ))}
 </div>
 </div>
 );
 }

 if (error) {
 return (
 <div className={`card ${className}`}>
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold text-primary-navy">
 Followed Creators
 </h3>
 </div>
 <div className="text-center py-6">
 <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
 <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 <p className="text-sm text-red-600 mb-2">{error}</p>
 <button 
 onClick={() => window.location.reload()} 
 className="text-sm text-red-700 underline hover:text-red-800"
 >
 Try again
 </button>
 </div>
 </div>
 );
 }

 if (creators.length === 0) {
 return (
 <div className={`card ${className}`}>
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold text-primary-navy">
 Followed Creators
 </h3>
 </div>
 <div className="text-center py-8">
 <div className="w-16 h-16 bg-neutral-light-gray rounded-full flex items-center justify-center mx-auto mb-4">
 <svg className="w-8 h-8 text-neutral-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
 </svg>
 </div>
 <h4 className="text-lg font-medium text-primary-navy mb-2">
 No Followed Creators
 </h4>
 <p className="text-neutral-dark-gray mb-4">
 Start following creators to see them here and get personalized content recommendations.
 </p>
 <button
 onClick={() => router.push('/discover')}
 className="btn btn-primary"
 >
 Discover Creators
 </button>
 </div>
 </div>
 );
 }

 return (
 <>
 <div className={`card ${className}`}>
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold text-primary-navy">
 Followed Creators
 </h3>
 {!showAll && creators.length > 0 && (
 <button
 onClick={() => router.push('/dashboard?tab=following')}
 className="text-sm text-accent-teal hover:text-accent-teal/80 font-medium"
 >
 View All
 </button>
 )}
 </div>

 <div className="space-y-3">
 {creators.map((creator) => (
 <div key={creator.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-light-gray/50 transition-colors">
 {}
 <button
 onClick={() => handleCreatorClick(creator.id, creator.username)}
 className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-accent-teal rounded-full"
 >
 <div className="w-12 h-12 bg-gradient-to-br from-accent-teal to-accent-pink rounded-full flex items-center justify-center text-white font-semibold">
 {creator.avatar ? (
 <img
 src={creator.avatar}
 alt={creator.displayName || creator.username}
 className="w-12 h-12 rounded-full object-cover"
 />
 ) : (
 <span className="text-sm">
 {(creator.displayName || creator.username).charAt(0).toUpperCase()}
 </span>
 )}
 </div>
 </button>

 {}
 <div className="flex-1 min-w-0">
 <button
 onClick={() => handleCreatorClick(creator.id, creator.username)}
 className="text-left focus:outline-none focus:ring-2 focus:ring-accent-teal rounded"
 >
 <h4 className="font-medium text-primary-navy truncate">
 {creator.displayName || creator.username}
 </h4>
 <p className="text-sm text-neutral-dark-gray">
 @{creator.username} • {creator.videoCount} videos
 </p>
 </button>
 <p className="text-xs text-neutral-dark-gray mt-1">
 Followed {formatFollowDate(creator.followedAt)}
 </p>
 </div>

 {}
 <button
 onClick={() => setShowConfirmDialog(creator.id)}
 disabled={unfollowingId === creator.id}
 className="px-3 py-1 text-sm border border-neutral-dark-gray text-neutral-dark-gray rounded-full hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {unfollowingId === creator.id ? (
 <div className="flex items-center space-x-1">
 <div className="w-3 h-3 border border-neutral-dark-gray border-t-transparent rounded-full animate-spin"></div>
 <span>...</span>
 </div>
 ) : (
 'Unfollow'
 )}
 </button>
 </div>
 ))}
 </div>

 {!showAll && creators.length >= limit && (
 <div className="mt-4 pt-4 border-t border-neutral-light-gray">
 <button
 onClick={() => router.push('/dashboard?tab=following')}
 className="w-full text-center text-sm text-accent-teal hover:text-accent-teal/80 font-medium py-2"
 >
 View All Followed Creators
 </button>
 </div>
 )}
 </div>

 {}
 {showConfirmDialog && (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
 <div className="bg-white rounded-lg max-w-md w-full p-6">
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
 <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 <div>
 <h3 className="text-lg font-semibold text-primary-navy">
 Unfollow Creator
 </h3>
 <p className="text-sm text-neutral-dark-gray">
 Are you sure you want to unfollow this creator?
 </p>
 </div>
 </div>

 <div className="flex space-x-3">
 <button
 onClick={() => setShowConfirmDialog(null)}
 className="flex-1 px-4 py-2 border border-neutral-dark-gray text-neutral-dark-gray rounded-lg hover:bg-neutral-light-gray transition-colors"
 >
 Cancel
 </button>
 <button
 onClick={() => showConfirmDialog && handleUnfollow(showConfirmDialog)}
 disabled={unfollowingId === showConfirmDialog}
 className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {unfollowingId === showConfirmDialog ? (
 <div className="flex items-center justify-center space-x-2">
 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 <span>Unfollowing...</span>
 </div>
 ) : (
 'Unfollow'
 )}
 </button>
 </div>
 </div>
 </div>
 )}
 </>
 );
}