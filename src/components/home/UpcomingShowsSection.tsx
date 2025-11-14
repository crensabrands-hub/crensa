'use client';

import { Video } from '@/types';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Calendar, Clock, Bell, Star } from 'lucide-react';

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

interface UpcomingShowsSectionProps {
 shows: UpcomingShow[];
 onNotifyToggle: (showId: string) => void;
 onShowClick: (show: UpcomingShow) => void;
}

export default function UpcomingShowsSection({ 
 shows, 
 onNotifyToggle, 
 onShowClick 
}: UpcomingShowsSectionProps) {
 const formatReleaseDate = (date: Date) => {
 const now = new Date();
 const diffTime = date.getTime() - now.getTime();
 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
 
 if (diffDays === 0) return 'Today';
 if (diffDays === 1) return 'Tomorrow';
 if (diffDays < 7) return `In ${diffDays} days`;
 
 return date.toLocaleDateString('en-US', { 
 month: 'short', 
 day: 'numeric',
 year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
 });
 };

 const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 staggerChildren: 0.1
 }
 }
 };

 const itemVariants = {
 hidden: { opacity: 0, y: 20 },
 visible: { opacity: 1, y: 0 }
 };

 return (
 <section className="py-12">
 <div className="container mx-auto px-4">
 <motion.div
 initial="hidden"
 animate="visible"
 variants={containerVariants}
 >
 <motion.h2 
 variants={itemVariants}
 className="text-3xl md:text-4xl font-bold text-primary-navy mb-8 text-center flex items-center justify-center gap-3"
 >
 <Calendar className="w-8 h-8 text-accent-teal" />
 Upcoming New Shows
 </motion.h2>
 
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
 {shows.map((show, index) => (
 <motion.div
 key={show.id}
 variants={itemVariants}
 className="group cursor-pointer"
 onClick={() => onShowClick(show)}
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 >
 <div className="bg-neutral-white rounded-2xl overflow-hidden border border-neutral-light-gray hover:border-accent-teal hover:shadow-lg transition-all duration-300 relative">
 {}
 <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-accent-green to-primary-neon-yellow text-primary-navy px-3 py-1 rounded-full text-sm font-medium">
 Coming Soon
 </div>
 
 <div className="relative aspect-video">
 <Image
 src={show.thumbnailUrl}
 alt={show.title}
 fill
 className="object-cover"
 />
 <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-300" />
 
 {}
 <div className="absolute bottom-4 right-4 bg-primary-navy/80 backdrop-blur-sm rounded-lg px-3 py-2">
 <div className="flex items-center gap-2 text-neutral-white text-sm font-medium">
 <Calendar className="w-4 h-4" />
 {formatReleaseDate(show.releaseDate)}
 </div>
 </div>
 </div>
 
 <div className="p-6">
 <div className="flex items-start justify-between mb-3">
 <h3 className="text-xl font-semibold text-primary-navy line-clamp-2 flex-1">
 {show.title}
 </h3>
 <button
 onClick={(e) => {
 e.stopPropagation();
 onNotifyToggle(show.id);
 }}
 className={`ml-3 p-2 rounded-full transition-all duration-300 ${
 show.isNotified
 ? 'bg-accent-teal text-neutral-white'
 : 'bg-neutral-light-gray text-neutral-dark-gray hover:bg-accent-teal hover:text-neutral-white'
 }`}
 title={show.isNotified ? 'Notifications enabled' : 'Get notified when available'}
 >
 <Bell className={`w-4 h-4 ${show.isNotified ? 'fill-current' : ''}`} />
 </button>
 </div>
 
 {show.description && (
 <p className="text-neutral-dark-gray text-sm mb-4 line-clamp-2">
 {show.description}
 </p>
 )}
 
 {}
 <div className="flex items-center gap-3 mb-4">
 <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-accent-pink to-accent-teal">
 {show.creator.avatar ? (
 <Image
 src={show.creator.avatar}
 alt={show.creator.displayName}
 width={32}
 height={32}
 className="w-full h-full object-cover"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-neutral-white font-bold text-sm">
 {show.creator.displayName.charAt(0).toUpperCase()}
 </div>
 )}
 </div>
 <div>
 <p className="text-primary-navy text-sm font-medium">
 {show.creator.displayName}
 </p>
 <p className="text-neutral-dark-gray text-xs">
 @{show.creator.username}
 </p>
 </div>
 </div>
 
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4 text-sm text-neutral-dark-gray">
 <div className="flex items-center gap-1">
 <Clock className="w-4 h-4" />
 {Math.floor(show.duration / 60)}:{(show.duration % 60).toString().padStart(2, '0')}
 </div>
 <span className="bg-gradient-to-r from-accent-pink to-accent-teal text-neutral-white px-2 py-1 rounded-lg text-xs font-medium">
 {show.category}
 </span>
 </div>
 <div className="flex items-center gap-1 text-purple-600 font-semibold">
 <span role="img" aria-label="coins">🪙</span>
 <span>{(show.coinPrice || show.creditCost || 0).toLocaleString('en-IN')}</span>
 </div>
 </div>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 
 {shows.length === 0 && (
 <motion.div 
 variants={itemVariants}
 className="text-center py-12"
 >
 <Star className="w-16 h-16 text-neutral-dark-gray mx-auto mb-4" />
 <h3 className="text-xl font-semibold text-primary-navy mb-2">
 No upcoming shows yet
 </h3>
 <p className="text-neutral-dark-gray">
 Check back soon for exciting new content from your favorite creators!
 </p>
 </motion.div>
 )}
 </motion.div>
 </div>
 </section>
 );
}