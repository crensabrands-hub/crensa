'use client';

import { motion } from 'framer-motion';
import { Gift, Zap, Crown, Star, Clock, ArrowRight } from 'lucide-react';

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

interface HighlightedOffersSectionProps {
 offers: Offer[];
 onOfferClick: (offer: Offer) => void;
}

const getOfferIcon = (type: Offer['type']) => {
 switch (type) {
 case 'credit_bonus':
 return <Zap className="w-6 h-6" />;
 case 'membership_discount':
 return <Crown className="w-6 h-6" />;
 case 'free_content':
 return <Gift className="w-6 h-6" />;
 case 'early_access':
 return <Star className="w-6 h-6" />;
 default:
 return <Gift className="w-6 h-6" />;
 }
};

const getOfferGradient = (type: Offer['type']) => {
 switch (type) {
 case 'credit_bonus':
 return 'from-primary-neon-yellow to-accent-green';
 case 'membership_discount':
 return 'from-accent-pink to-accent-bright-pink';
 case 'free_content':
 return 'from-accent-green to-accent-teal';
 case 'early_access':
 return 'from-accent-teal to-accent-pink';
 default:
 return 'from-accent-pink to-accent-teal';
 }
};

export default function HighlightedOffersSection({ offers, onOfferClick }: HighlightedOffersSectionProps) {
 const formatTimeRemaining = (date: Date) => {
 const now = new Date();
 const diffTime = date.getTime() - now.getTime();
 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
 const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
 
 if (diffDays > 1) return `${diffDays} days left`;
 if (diffHours > 1) return `${diffHours} hours left`;
 return 'Ending soon';
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

 if (offers.length === 0) {
 return null;
 }

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
 <Gift className="w-8 h-8 text-primary-neon-yellow" />
 Special Offers
 </motion.h2>
 
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
 {offers.map((offer, index) => (
 <motion.div
 key={offer.id}
 variants={itemVariants}
 className="group cursor-pointer"
 onClick={() => onOfferClick(offer)}
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 >
 <div className={`bg-gradient-to-br ${getOfferGradient(offer.type)} p-[2px] rounded-2xl`}>
 <div className="bg-neutral-white rounded-2xl p-6 h-full hover:shadow-lg transition-all duration-300">
 {}
 <div className="flex items-start justify-between mb-4">
 <div className={`bg-gradient-to-r ${getOfferGradient(offer.type)} p-3 rounded-xl text-neutral-white`}>
 {getOfferIcon(offer.type)}
 </div>
 
 {offer.isLimited && offer.remainingCount && (
 <div className="bg-accent-pink/20 text-accent-pink px-2 py-1 rounded-lg text-xs font-medium">
 Only {offer.remainingCount} left
 </div>
 )}
 </div>

 {}
 <h3 className="text-xl font-bold text-primary-navy mb-2">
 {offer.title}
 </h3>
 
 <p className="text-neutral-dark-gray text-sm mb-4 line-clamp-2">
 {offer.description}
 </p>

 {}
 <div className="mb-4">
 <div className={`text-2xl font-bold bg-gradient-to-r ${getOfferGradient(offer.type)} bg-clip-text text-transparent`}>
 {offer.value}
 </div>
 
 {offer.originalPrice && offer.discountedPrice && (
 <div className="flex items-center gap-2 mt-1">
 <span className="text-neutral-dark-gray line-through text-sm">
 ₹{offer.originalPrice}
 </span>
 <span className="text-primary-navy font-semibold">
 ₹{offer.discountedPrice}
 </span>
 </div>
 )}
 </div>

 {}
 <div className="flex items-center gap-2 text-primary-neon-yellow text-sm mb-4">
 <Clock className="w-4 h-4" />
 {formatTimeRemaining(offer.validUntil)}
 </div>

 {}
 <button className={`w-full bg-gradient-to-r ${getOfferGradient(offer.type)} hover:opacity-90 text-neutral-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-3`}>
 {offer.ctaText}
 <ArrowRight className="w-4 h-4" />
 </button>
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