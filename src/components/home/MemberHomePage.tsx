'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FeaturedShowsSection from './FeaturedShowsSection';
import TrendingCreatorsCarousel from './TrendingCreatorsCarousel';
import UpcomingShowsSection from './UpcomingShowsSection';
import CategoryCarousel from './CategoryCarousel';
import HighlightedOffersSection from './HighlightedOffersSection';
import { Video } from '@/types';

interface Creator {
 id: string;
 username: string;
 displayName: string;
 avatar?: string;
 videoCount: number;
 totalViews: number;
 category: string;
 isFollowing?: boolean;
}

interface UpcomingShow extends Omit<Video, 'createdAt' | 'updatedAt'> {
 releaseDate: Date;
 isNotified?: boolean;
 creator: {
 id: string;
 username: string;
 displayName: string;
 avatar?: string;
 };
}

interface Category {
 id: string;
 name: string;
 icon: string;
 videoCount: number;
 color: string;
}

interface Offer {
 id: string;
 title: string;
 description: string;
 type: 'credit_bonus' | 'membership_discount' | 'free_content' | 'early_access';
 value: string;
 originalPrice?: number;
 discountedPrice?: number;
 validUntil: Date;
 isLimited?: boolean;
 remainingCount?: number;
 ctaText: string;
 ctaLink: string;
}

interface MemberHomePageProps {
 userId: string;
}

export default function MemberHomePage({ userId }: MemberHomePageProps) {
 const [featuredVideos, setFeaturedVideos] = useState<Video[]>([]);
 const [trendingCreators, setTrendingCreators] = useState<Creator[]>([]);
 const [upcomingShows, setUpcomingShows] = useState<UpcomingShow[]>([]);
 const [categories, setCategories] = useState<Category[]>([]);
 const [offers, setOffers] = useState<Offer[]>([]);
 const [selectedCategory, setSelectedCategory] = useState<string>('all');
 const [isLoading, setIsLoading] = useState(true);
 const [creatorsError, setCreatorsError] = useState<string | null>(null);
 const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

 useEffect(() => {
 const loadHomePageData = async () => {
 try {
 setIsLoading(true);

 const [
 featuredResponse,
 creatorsResponse,
 categoriesResponse,
 offersResponse
 ] = await Promise.all([
 fetch('/api/home/featured-videos?limit=6'),
 fetch('/api/home/trending-creators?limit=6'),
 fetch('/api/home/categories'),
 fetch('/api/home/offers')
 ]);

 const featuredData = featuredResponse.ok ? await featuredResponse.json() : [];
 
 let creatorsData = [];
 if (creatorsResponse.ok) {
 creatorsData = await creatorsResponse.json();
 setCreatorsError(null);
 } else {
 const errorData = await creatorsResponse.json().catch(() => ({}));
 setCreatorsError(errorData.error || 'Failed to load trending creators');
 }
 
 const categoriesData = categoriesResponse.ok ? await categoriesResponse.json() : [];
 const offersData = offersResponse.ok ? await offersResponse.json() : [];

 setFeaturedVideos(featuredData);
 setTrendingCreators(creatorsData);
 setCategories(categoriesData);
 setOffers(offersData);

 setUpcomingShows([]);

 setIsLoading(false);
 } catch (error) {
 console.error('Error loading home page data:', error);
 setIsLoading(false);
 }
 };

 loadHomePageData();
 }, [userId]);

 const handleVideoClick = (video: Video) => {

 console.log('Video clicked:', video);
 };

 const handleCreatorClick = async (creator: Creator) => {
 try {

 await fetch('/api/member/profile-visits', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 creatorId: creator.id,
 source: 'trending_creators'
 }),
 });

 window.location.href = `/creator/${creator.username}`;
 } catch (error) {
 console.error('Error tracking profile visit:', error);

 window.location.href = `/creator/${creator.username}`;
 }
 };

 const handleFollowToggle = async (creatorId: string) => {
 try {

 setFollowingStates(prev => ({ ...prev, [creatorId]: true }));

 setTrendingCreators(prev => 
 prev.map(creator => 
 creator.id === creatorId 
 ? { ...creator, isFollowing: !creator.isFollowing }
 : creator
 )
 );

 const response = await fetch('/api/interactions/follow', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 creatorId
 }),
 });

 const result = await response.json();

 if (!response.ok) {
 throw new Error(result.error || 'Failed to update follow status');
 }

 setTrendingCreators(prev => 
 prev.map(creator => 
 creator.id === creatorId 
 ? { ...creator, isFollowing: result.data.isFollowing }
 : creator
 )
 );

 setFollowingStates(prev => ({ ...prev, [creatorId]: false }));
 } catch (error) {
 console.error('Error toggling follow status:', error);

 setTrendingCreators(prev => 
 prev.map(creator => 
 creator.id === creatorId 
 ? { ...creator, isFollowing: !creator.isFollowing }
 : creator
 )
 );

 setFollowingStates(prev => ({ ...prev, [creatorId]: false }));

 alert('Failed to update follow status. Please try again.');
 }
 };

 const handleNotifyToggle = (showId: string) => {
 setUpcomingShows(prev =>
 prev.map(show =>
 show.id === showId
 ? { ...show, isNotified: !show.isNotified }
 : show
 )
 );
 };

 const handleShowClick = (show: UpcomingShow) => {

 console.log('Upcoming show clicked:', show);
 };

 const handleCategorySelect = (categoryId: string) => {
 setSelectedCategory(categoryId);

 console.log('Category selected:', categoryId);
 };

 const handleOfferClick = (offer: Offer) => {

 console.log('Offer clicked:', offer);
 };

 if (isLoading) {
 return (
 <div className="min-h-screen bg-neutral-gray flex items-center justify-center">
 <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray p-8">
 <div className="text-primary-navy text-xl font-semibold">Loading your personalized content...</div>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-neutral-gray">
 {}
 <motion.section 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="pt-8 pb-4"
 >
 <div className="container mx-auto px-4 text-center">
 <div className="bg-gradient-to-r from-primary-navy to-accent-dark-pink rounded-2xl p-8 mb-8 shadow-lg">
 <h1 className="text-4xl md:text-5xl font-bold text-neutral-white mb-4">
 Welcome to Your Creative Universe
 </h1>
 <p className="text-xl text-neutral-white/90 max-w-2xl mx-auto">
 Discover amazing content from talented creators around the world
 </p>
 </div>
 </div>
 </motion.section>

 {}
 <FeaturedShowsSection 
 videos={featuredVideos}
 onVideoClick={handleVideoClick}
 />

 {}
 <TrendingCreatorsCarousel
 creators={trendingCreators}
 onCreatorClick={handleCreatorClick}
 onFollowToggle={handleFollowToggle}
 loading={isLoading}
 error={creatorsError}
 followingStates={followingStates}
 />

 {}
 <CategoryCarousel
 categories={categories}
 selectedCategory={selectedCategory}
 onCategorySelect={handleCategorySelect}
 />

 {}
 <UpcomingShowsSection
 shows={upcomingShows}
 onNotifyToggle={handleNotifyToggle}
 onShowClick={handleShowClick}
 />

 {}
 <HighlightedOffersSection
 offers={offers}
 onOfferClick={handleOfferClick}
 />
 </div>
 );
}