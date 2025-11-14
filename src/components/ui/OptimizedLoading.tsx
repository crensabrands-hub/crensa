'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoCameraIcon } from '@heroicons/react/24/outline';
import { useProgressiveLoading, useAdaptiveLoading } from '@/hooks/useProgressiveLoading';
import { getMobileOptimizedMotionProps } from '@/lib/mobile-optimization';

interface OptimizedLoadingProps {
 message?: string;
 variant?: 'minimal' | 'standard' | 'detailed';
 onComplete?: () => void;
 duration?: number;
 showProgress?: boolean;
}

export function OptimizedLoading({
 message = 'Loading...',
 variant = 'standard',
 onComplete,
 duration,
 showProgress = true,
}: OptimizedLoadingProps) {
 const { currentStage, progress, isComplete } = useProgressiveLoading({
 stages: ['initial', 'loading', 'complete'],
 duration,
 onComplete,
 });

 const adaptiveConfig = useAdaptiveLoading();

 if (isComplete) return null;

 const containerMotionProps = getMobileOptimizedMotionProps({
 initial: { opacity: 0 },
 animate: { opacity: 1 },
 exit: { opacity: 0 },
 transition: { duration: 0.3 },
 });

 const spinnerMotionProps = getMobileOptimizedMotionProps({
 animate: { rotate: 360 },
 transition: { duration: 1.2, repeat: Infinity, ease: 'linear' },
 });

 if (variant === 'minimal') {
 return (
 <AnimatePresence>
 <motion.div
 {...containerMotionProps}
 className="flex items-center justify-center space-x-2 p-2"
 >
 <motion.div
 {...spinnerMotionProps}
 className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"
 />
 <span className="text-sm text-gray-600">{message}</span>
 </motion.div>
 </AnimatePresence>
 );
 }

 if (variant === 'detailed') {
 return (
 <AnimatePresence>
 <motion.div
 {...containerMotionProps}
 className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50"
 >
 <div className="text-center max-w-sm mx-auto px-4">
 {}
 <motion.div
 initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ duration: 0.3 }}
 className="mb-6"
 >
 <div className="relative mx-auto w-16 h-16">
 <motion.div
 {...spinnerMotionProps}
 className="absolute inset-0 border-3 border-purple-200 border-t-purple-600 rounded-full"
 />
 <div className="absolute inset-0 flex items-center justify-center">
 <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
 <VideoCameraIcon className="w-4 h-4 text-white" />
 </div>
 </div>
 </div>
 </motion.div>

 {}
 <motion.h1
 initial={{ y: 10, opacity: 0 }}
 animate={{ y: 0, opacity: 1 }}
 transition={{ delay: 0.1, duration: 0.3 }}
 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4"
 >
 Crensa
 </motion.h1>

 {}
 <motion.p
 initial={{ y: 5, opacity: 0 }}
 animate={{ y: 0, opacity: 1 }}
 transition={{ delay: 0.2, duration: 0.3 }}
 className="text-gray-600 mb-4"
 >
 {message}
 </motion.p>

 {}
 {showProgress && (
 <motion.div
 initial={{ width: 0, opacity: 0 }}
 animate={{ width: '100%', opacity: 1 }}
 transition={{ delay: 0.3, duration: 0.2 }}
 className="w-full max-w-xs mx-auto"
 >
 <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
 <motion.div
 initial={{ width: 0 }}
 animate={{ width: `${progress}%` }}
 transition={{ duration: 0.1 }}
 className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
 />
 </div>
 <div className="text-xs text-gray-500 mt-2 text-center">
 {Math.round(progress)}%
 </div>
 </motion.div>
 )}

 {}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.4, duration: 0.3 }}
 className="mt-4 text-xs text-gray-400"
 >
 {currentStage}
 </motion.div>
 </div>
 </motion.div>
 </AnimatePresence>
 );
 }

 return (
 <AnimatePresence>
 <motion.div
 {...containerMotionProps}
 className="flex flex-col items-center justify-center p-6"
 >
 {}
 <motion.div
 {...spinnerMotionProps}
 className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full mb-4"
 />

 {}
 <p className="text-gray-600 text-center mb-2">{message}</p>

 {}
 {showProgress && (
 <div className="w-32 mx-auto">
 <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
 <motion.div
 initial={{ width: 0 }}
 animate={{ width: `${progress}%` }}
 transition={{ duration: 0.1 }}
 className="h-full bg-purple-600 rounded-full"
 />
 </div>
 </div>
 )}
 </motion.div>
 </AnimatePresence>
 );
}

export function OptimizedSkeleton({ 
 rows = 3, 
 className = '' 
}: { 
 rows?: number; 
 className?: string; 
}) {
 const adaptiveConfig = useAdaptiveLoading();
 
 return (
 <div className={`space-y-3 ${className}`}>
 {Array.from({ length: rows }).map((_, i) => (
 <div key={i} className="space-y-2">
 <div 
 className={`h-4 bg-gray-200 rounded ${
 adaptiveConfig.enableHeavyAnimations ? 'animate-pulse' : ''
 }`} 
 style={{ width: `${Math.random() * 40 + 60}%` }}
 />
 {i % 2 === 0 && (
 <div 
 className={`h-4 bg-gray-200 rounded ${
 adaptiveConfig.enableHeavyAnimations ? 'animate-pulse' : ''
 }`}
 style={{ width: `${Math.random() * 30 + 40}%` }}
 />
 )}
 </div>
 ))}
 </div>
 );
}

export function FastLoadingIndicator({ 
 message = 'Loading...', 
 position = 'top' 
}: { 
 message?: string; 
 position?: 'top' | 'bottom'; 
}) {
 const positionClasses = position === 'top' 
 ? 'top-0' 
 : 'bottom-0';

 return (
 <motion.div
 initial={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
 transition={{ duration: 0.2 }}
 className={`fixed left-0 right-0 ${positionClasses} z-50 bg-purple-600 text-white px-4 py-2 text-center text-sm`}
 >
 <div className="flex items-center justify-center space-x-2">
 <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
 <span className="truncate">{message}</span>
 </div>
 </motion.div>
 );
}

export function LoadingOverlay({ 
 isLoading, 
 children, 
 message = 'Loading...' 
}: {
 isLoading: boolean;
 children: React.ReactNode;
 message?: string;
}) {
 return (
 <div className="relative">
 {children}
 <AnimatePresence>
 {isLoading && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10"
 >
 <OptimizedLoading message={message} variant="minimal" />
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}