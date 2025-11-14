'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface Category {
 id: string;
 name: string;
 icon: string;
 videoCount: number;
 color: string;
}

interface CategoryCarouselProps {
 categories: Category[];
 selectedCategory?: string;
 onCategorySelect: (categoryId: string) => void;
}

export default function CategoryCarousel({ 
 categories, 
 selectedCategory, 
 onCategorySelect 
}: CategoryCarouselProps) {
 const [currentIndex, setCurrentIndex] = useState(0);
 const scrollRef = useRef<HTMLDivElement>(null);

 const itemsPerView = 6;
 const maxIndex = Math.max(0, categories.length - itemsPerView);

 const scrollToIndex = (index: number) => {
 if (scrollRef.current) {
 const itemWidth = scrollRef.current.scrollWidth / categories.length;
 scrollRef.current.scrollTo({
 left: index * itemWidth,
 behavior: 'smooth'
 });
 }
 setCurrentIndex(index);
 };

 const nextSlide = () => {
 const newIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
 scrollToIndex(newIndex);
 };

 const prevSlide = () => {
 const newIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
 scrollToIndex(newIndex);
 };

 return (
 <section className="py-12">
 <div className="container mx-auto px-4">
 <div className="flex items-center justify-between mb-8">
 <motion.h2 
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 className="text-3xl md:text-4xl font-bold text-primary-navy flex items-center gap-3"
 >
 <Filter className="w-8 h-8 text-accent-green" />
 Browse by Category
 </motion.h2>
 
 <div className="flex gap-2">
 <button
 onClick={prevSlide}
 className="bg-neutral-white hover:bg-accent-green hover:text-neutral-white border border-neutral-light-gray rounded-full p-2 transition-colors duration-300"
 disabled={categories.length <= itemsPerView}
 >
 <ChevronLeft className="w-6 h-6 text-primary-navy" />
 </button>
 <button
 onClick={nextSlide}
 className="bg-neutral-white hover:bg-accent-green hover:text-neutral-white border border-neutral-light-gray rounded-full p-2 transition-colors duration-300"
 disabled={categories.length <= itemsPerView}
 >
 <ChevronRight className="w-6 h-6 text-primary-navy" />
 </button>
 </div>
 </div>

 <div className="relative overflow-hidden">
 <motion.div
 ref={scrollRef}
 className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
 style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
 >
 {}
 <motion.button
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 onClick={() => onCategorySelect('all')}
 className={`flex-shrink-0 group ${
 selectedCategory === 'all' || !selectedCategory
 ? 'bg-gradient-to-r from-accent-pink to-accent-teal'
 : 'bg-neutral-white hover:bg-neutral-light-gray'
 } rounded-2xl p-6 border border-neutral-light-gray hover:border-accent-pink hover:shadow-lg transition-all duration-300 min-w-[160px]`}
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 >
 <div className="text-center">
 <div className="text-3xl mb-3">🎬</div>
 <h3 className={`font-semibold mb-1 ${
 selectedCategory === 'all' || !selectedCategory
 ? 'text-neutral-white'
 : 'text-primary-navy'
 }`}>All</h3>
 <p className={`text-sm ${
 selectedCategory === 'all' || !selectedCategory
 ? 'text-neutral-white/90'
 : 'text-neutral-dark-gray'
 }`}>
 {categories.reduce((sum, cat) => sum + cat.videoCount, 0)} videos
 </p>
 </div>
 </motion.button>

 {categories.map((category, index) => (
 <motion.button
 key={category.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: (index + 1) * 0.1 }}
 onClick={() => onCategorySelect(category.id)}
 className={`flex-shrink-0 group ${
 selectedCategory === category.id
 ? `bg-gradient-to-r ${category.color}`
 : 'bg-neutral-white hover:bg-neutral-light-gray'
 } rounded-2xl p-6 border border-neutral-light-gray hover:border-accent-pink hover:shadow-lg transition-all duration-300 min-w-[160px]`}
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 >
 <div className="text-center">
 <div className="text-3xl mb-3">{category.icon}</div>
 <h3 className={`font-semibold mb-1 ${
 selectedCategory === category.id
 ? 'text-neutral-white'
 : 'text-primary-navy'
 }`}>{category.name}</h3>
 <p className={`text-sm ${
 selectedCategory === category.id
 ? 'text-neutral-white/90'
 : 'text-neutral-dark-gray'
 }`}>
 {category.videoCount} videos
 </p>
 </div>
 </motion.button>
 ))}
 </motion.div>
 </div>

 {}
 {categories.length > itemsPerView && (
 <div className="flex justify-center gap-2 mt-6">
 {Array.from({ length: maxIndex + 1 }).map((_, index) => (
 <button
 key={index}
 onClick={() => scrollToIndex(index)}
 className={`w-2 h-2 rounded-full transition-all duration-300 ${
 index === currentIndex ? 'bg-accent-green' : 'bg-neutral-light-gray'
 }`}
 />
 ))}
 </div>
 )}
 </div>
 </section>
 );
}