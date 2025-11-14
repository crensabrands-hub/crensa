'use client';

import { Video } from '@/types';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Play, Clock, Eye } from 'lucide-react';

interface FeaturedShowsSectionProps {
 videos: Video[];
 onVideoClick: (video: Video) => void;
}

export default function FeaturedShowsSection({ videos, onVideoClick }: FeaturedShowsSectionProps) {
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
 className="text-3xl md:text-4xl font-bold text-primary-navy mb-8 text-center"
 >
 Featured Shows
 </motion.h2>
 
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
 {videos.map((video, index) => (
 <motion.div
 key={video.id}
 variants={itemVariants}
 className="group cursor-pointer"
 onClick={() => onVideoClick(video)}
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 >
 <div className="bg-neutral-white rounded-2xl overflow-hidden border border-neutral-light-gray hover:border-accent-pink hover:shadow-lg transition-all duration-300">
 <div className="relative aspect-video">
 <Image
 src={video.thumbnailUrl}
 alt={video.title}
 fill
 className="object-cover"
 />
 <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
 <div className="absolute inset-0 flex items-center justify-center">
 <div className="bg-accent-pink/80 backdrop-blur-sm rounded-full p-4 group-hover:bg-accent-pink transition-colors duration-300">
 <Play className="w-8 h-8 text-neutral-white" fill="white" />
 </div>
 </div>
 <div className="absolute top-4 right-4 bg-primary-navy/80 backdrop-blur-sm rounded-lg px-2 py-1">
 <div className="flex items-center gap-1 text-neutral-white text-sm">
 <Clock className="w-4 h-4" />
 {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
 </div>
 </div>
 </div>
 
 <div className="p-6">
 <h3 className="text-xl font-semibold text-primary-navy mb-2 line-clamp-2">
 {video.title}
 </h3>
 {video.description && (
 <p className="text-neutral-dark-gray text-sm mb-4 line-clamp-2">
 {video.description}
 </p>
 )}
 
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4 text-sm text-neutral-dark-gray">
 <div className="flex items-center gap-1">
 <Eye className="w-4 h-4" />
 {video.viewCount.toLocaleString()}
 </div>
 <span className="bg-gradient-to-r from-accent-pink to-accent-teal text-neutral-white px-2 py-1 rounded-lg text-xs font-medium">
 {video.category}
 </span>
 </div>
 <div className="flex items-center gap-1 text-purple-600 font-semibold">
 <span role="img" aria-label="coins">🪙</span>
 <span>{(video.coinPrice || video.creditCost || 0).toLocaleString('en-IN')}</span>
 </div>
 </div>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 </motion.div>
 </div>
 </section>
 );
}