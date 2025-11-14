'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TrendingCreator } from '@/types';
import { UserPlusIcon, CheckIcon } from '@heroicons/react/24/outline';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';

interface TrendingCreatorCardProps {
 creator: TrendingCreator;
 onFollow?: (creatorId: string) => void;
 isFollowing?: boolean;
}

export default function TrendingCreatorCard({ 
 creator, 
 onFollow,
 isFollowing = false 
}: TrendingCreatorCardProps) {
 const [isFollowingState, setIsFollowingState] = useState(isFollowing);
 const [isLoading, setIsLoading] = useState(false);

 const handleFollow = async (e: React.MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 
 if (isLoading) return;
 
 setIsLoading(true);
 try {
 if (onFollow) {
 await onFollow(creator.id);
 setIsFollowingState(!isFollowingState);
 }
 } catch (error) {
 console.error('Error following creator:', error);
 } finally {
 setIsLoading(false);
 }
 };

 const formatNumber = (num: number): string => {
 if (num >= 1000000) {
 return `${(num / 1000000).toFixed(1)}M`;
 } else if (num >= 1000) {
 return `${(num / 1000).toFixed(1)}K`;
 }
 return num.toString();
 };

 return (
 <Link 
 href={`/creator/${creator.username}`}
 className="group block bg-gradient-to-br from-white to-neutral-gray rounded-3xl shadow-md transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-neutral-light-gray hover:border-accent-pink/30"
 >
 <div className="p-8">
 {}
 <div className="flex flex-col items-center text-center mb-5">
 <div className="relative mb-5">
 <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden ring-4 ring-accent-pink/30 group-hover:ring-accent-pink/60 transition-all duration-300 group-hover:scale-110">
 <Image
 src={creator.avatar || '/images/default-avatar.png'}
 alt={`${creator.displayName}'s avatar`}
 width={112}
 height={112}
 className="w-full h-full object-cover"
 onError={(e) => {
 const target = e.target as HTMLImageElement;
 target.src = '/images/default-avatar.png';
 }}
 />
 </div>
 {creator.isVerified && (
 <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-accent-pink to-accent-bright-pink rounded-full p-1.5" data-testid="verified-badge">
 <ShieldCheckIcon className="w-5 h-5 text-white" />
 </div>
 )}
 </div>

 <div className="mb-4">
 <h3 className="text-xl font-bold text-primary-navy group-hover:text-accent-pink transition-colors duration-300 mb-1">
 {creator.displayName}
 </h3>
 <p className="text-sm font-medium text-neutral-dark-gray">
 @{creator.username}
 </p>
 </div>

 {}
 <div className="mb-5">
 <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-primary-navy/10 to-accent-teal/10 text-primary-navy text-xs font-bold rounded-full">
 {creator.category}
 </span>
 </div>
 </div>

 {}
 <div className="flex justify-between items-center mb-5 text-sm bg-neutral-gray/50 rounded-2xl p-4">
 <div className="text-center flex-1">
 <div className="font-bold text-primary-navy text-lg mb-1">
 {formatNumber(creator.followerCount)}
 </div>
 <div className="text-neutral-dark-gray font-medium text-xs">
 Followers
 </div>
 </div>
 <div className="w-px h-10 bg-neutral-light-gray"></div>
 <div className="text-center flex-1">
 <div className="font-bold text-primary-navy text-lg mb-1">
 {formatNumber(creator.videoCount)}
 </div>
 <div className="text-neutral-dark-gray font-medium text-xs">
 Videos
 </div>
 </div>
 </div>

 {}
 <button
 onClick={handleFollow}
 disabled={isLoading}
 className={`w-full py-3 px-5 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
 isFollowingState
 ? 'bg-neutral-gray text-primary-navy hover:bg-neutral-light-gray'
 : 'bg-gradient-to-r from-accent-pink to-accent-bright-pink text-white hover:from-accent-bright-pink hover:to-accent-pink transform hover:scale-105'
 } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
 >
 {isLoading ? (
 <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
 ) : isFollowingState ? (
 <>
 <CheckIcon className="w-5 h-5" />
 Following
 </>
 ) : (
 <>
 <UserPlusIcon className="w-5 h-5" />
 Follow
 </>
 )}
 </button>
 </div>
 </Link>
 );
}