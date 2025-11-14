'use client';

import { useState } from 'react';
import { TrendingCreator } from '@/types';
import { useTrendingCreators } from '@/hooks/useTrendingCreators';
import TrendingCreatorCard from './TrendingCreatorCard';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface TrendingCreatorsSectionProps {
 creators?: TrendingCreator[];
 loading?: boolean;
 limit?: number;
}

export default function TrendingCreatorsSection({ 
 creators: propCreators,
 loading: propLoading,
 limit = 8
}: TrendingCreatorsSectionProps) {
 const { 
 creators: fetchedCreators, 
 loading: fetchLoading, 
 error, 
 refetch 
 } = useTrendingCreators(limit);
 
 const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

 const creators = propCreators || fetchedCreators;
 const loading = propLoading !== undefined ? propLoading : fetchLoading;

 const handleFollow = async (creatorId: string) => {

 setFollowingStates(prev => ({
 ...prev,
 [creatorId]: !prev[creatorId]
 }));

 await new Promise(resolve => setTimeout(resolve, 500));
 };

 const handleRetry = () => {
 refetch();
 };

 if (loading) {
 return <TrendingCreatorsSkeleton />;
 }

 if (error) {
 return (
 <div className="bg-gradient-to-br from-white to-neutral-gray rounded-3xl p-12 text-center shadow-md border border-neutral-light-gray">
 <div className="text-primary-navy mb-6">
 <p className="text-xl font-bold mb-3">Unable to load trending creators</p>
 <p className="text-base text-neutral-dark-gray">{error}</p>
 </div>
 <button
 onClick={handleRetry}
 className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-accent-pink to-accent-bright-pink text-white font-bold rounded-2xl hover:from-accent-bright-pink hover:to-accent-pink transition-all duration-300 transform hover:scale-105"
 >
 <ArrowPathIcon className="w-5 h-5" />
 Try Again
 </button>
 </div>
 );
 }

 if (!creators || creators.length === 0) {
 return (
 <div className="bg-gradient-to-br from-white to-neutral-gray rounded-3xl p-12 text-center shadow-md border border-neutral-light-gray">
 <p className="text-xl font-bold text-primary-navy mb-3">No trending creators found</p>
 <p className="text-base text-neutral-dark-gray">
 Check back later for the latest trending creators
 </p>
 </div>
 );
 }

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
 {creators.slice(0, 4).map((creator) => (
 <TrendingCreatorCard
 key={creator.id}
 creator={creator}
 onFollow={handleFollow}
 isFollowing={followingStates[creator.id] || false}
 />
 ))}
 </div>
 );
}

function TrendingCreatorsSkeleton() {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
 {Array.from({ length: 4 }).map((_, index) => (
 <div key={index} className="bg-gradient-to-br from-white to-neutral-gray rounded-3xl shadow-md p-8 animate-pulse border border-neutral-light-gray">
 <div className="flex flex-col items-center text-center">
 {}
 <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-neutral-gray to-neutral-light-gray rounded-full mb-5" />
 
 {}
 <div className="mb-4">
 <div className="h-6 bg-gradient-to-r from-neutral-gray to-neutral-light-gray rounded-xl w-28 mb-3 mx-auto" />
 <div className="h-4 bg-gradient-to-r from-neutral-gray to-neutral-light-gray rounded-lg w-20 mx-auto" />
 </div>

 {}
 <div className="h-7 bg-gradient-to-r from-neutral-gray to-neutral-light-gray rounded-full w-24 mb-5" />

 {}
 <div className="flex justify-between items-center w-full mb-5">
 <div className="text-center flex-1">
 <div className="h-6 bg-gradient-to-r from-neutral-gray to-neutral-light-gray rounded-lg w-10 mb-2 mx-auto" />
 <div className="h-4 bg-gradient-to-r from-neutral-gray to-neutral-light-gray rounded w-14 mx-auto" />
 </div>
 <div className="w-px h-10 bg-neutral-light-gray"></div>
 <div className="text-center flex-1">
 <div className="h-6 bg-gradient-to-r from-neutral-gray to-neutral-light-gray rounded-lg w-10 mb-2 mx-auto" />
 <div className="h-4 bg-gradient-to-r from-neutral-gray to-neutral-light-gray rounded w-12 mx-auto" />
 </div>
 </div>

 {}
 <div className="h-10 bg-gradient-to-r from-neutral-gray to-neutral-light-gray rounded-2xl w-full" />
 </div>
 </div>
 ))}
 </div>
 );
}