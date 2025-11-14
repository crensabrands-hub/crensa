'use client'

import { motion } from 'framer-motion'
import { VideoCameraIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

interface LoadingScreenProps {
 message?: string
 fullScreen?: boolean
 variant?: 'default' | 'minimal' | 'dashboard'
 duration?: number // Maximum duration in milliseconds
 onComplete?: () => void
}

export function LoadingScreen({ 
 message = "Loading...", 
 fullScreen = true,
 variant = 'default',
 duration = 2000, // Reduced from default longer duration
 onComplete
}: LoadingScreenProps) {
 const [progress, setProgress] = useState(0)
 const [isComplete, setIsComplete] = useState(false)

 useEffect(() => {
 const interval = setInterval(() => {
 setProgress(prev => {
 const increment = 100 / (duration / 100) // Calculate increment based on duration
 const newProgress = Math.min(prev + increment, 100)
 
 if (newProgress >= 100 && !isComplete) {
 setIsComplete(true)
 onComplete?.()
 clearInterval(interval)
 }
 
 return newProgress
 })
 }, 100)

 return () => clearInterval(interval)
 }, [duration, onComplete, isComplete])

 const containerClass = fullScreen 
 ? "fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50"
 : "flex items-center justify-center p-8"

 if (variant === 'minimal') {
 return (
 <div className={containerClass}>
 <div className="flex items-center space-x-3">
 <motion.div
 animate={{ rotate: 360 }}
 transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} // Faster rotation
 className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full" // Smaller size for mobile
 />
 <span className="text-gray-600 font-medium text-sm">{message}</span>
 </div>
 </div>
 )
 }

 if (variant === 'dashboard') {
 return (
 <div className={containerClass}>
 <div className="text-center">
 <motion.div
 initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ duration: 0.3 }} // Faster initial animation
 className="mb-4" // Reduced margin
 >
 <div className="relative">
 <motion.div
 animate={{ rotate: 360 }}
 transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} // Faster rotation
 className="w-12 h-12 border-3 border-purple-200 border-t-purple-600 rounded-full mx-auto" // Smaller size
 />
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ delay: 0.1, duration: 0.2 }} // Faster appearance
 className="absolute inset-0 flex items-center justify-center"
 >
 <VideoCameraIcon className="w-5 h-5 text-purple-600" />
 </motion.div>
 </div>
 </motion.div>
 
 <motion.div
 initial={{ y: 5, opacity: 0 }}
 animate={{ y: 0, opacity: 1 }}
 transition={{ delay: 0.15, duration: 0.3 }} // Faster and earlier
 >
 <h3 className="text-lg font-semibold text-gray-900 mb-2">{message}</h3>
 <div className="flex justify-center space-x-1">
 {[0, 1, 2].map((i) => (
 <motion.div
 key={i}
 animate={{ opacity: [0.4, 1, 0.4] }}
 transition={{
 duration: 1.0, // Faster animation
 repeat: Infinity,
 delay: i * 0.15, // Shorter delay
 }}
 className="w-1.5 h-1.5 bg-purple-600 rounded-full" // Smaller dots
 />
 ))}
 </div>
 
 {}
 <div className="mt-3 w-32 mx-auto">
 <div className="h-1 bg-purple-100 rounded-full overflow-hidden">
 <motion.div
 initial={{ width: 0 }}
 animate={{ width: `${progress}%` }}
 transition={{ duration: 0.1 }}
 className="h-full bg-purple-600 rounded-full"
 />
 </div>
 </div>
 </motion.div>
 </div>
 </div>
 )
 }

 return (
 <div className={containerClass}>
 <div className="text-center">
 {}
 <motion.div
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ duration: 0.4, ease: "easeOut" }} // Faster animation
 className="mb-6" // Reduced margin
 >
 <div className="relative mx-auto w-16 h-16"> {}
 {}
 <motion.div
 animate={{ rotate: 360 }}
 transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} // Faster rotation
 className="absolute inset-0 border-3 border-purple-200 border-t-purple-600 rounded-full"
 />
 
 {}
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ delay: 0.2, duration: 0.3, ease: "backOut" }} // Faster appearance
 className="absolute inset-0 flex items-center justify-center"
 >
 <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
 <VideoCameraIcon className="w-4 h-4 text-white" />
 </div>
 </motion.div>
 </div>
 </motion.div>

 {}
 <motion.div
 initial={{ y: 10, opacity: 0 }}
 animate={{ y: 0, opacity: 1 }}
 transition={{ delay: 0.25, duration: 0.4 }} // Faster and earlier
 className="mb-4" // Reduced margin
 >
 <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
 Crensa
 </h1>
 </motion.div>

 {}
 <motion.div
 initial={{ y: 5, opacity: 0 }}
 animate={{ y: 0, opacity: 1 }}
 transition={{ delay: 0.35, duration: 0.3 }} // Faster and earlier
 className="mb-6" // Reduced margin
 >
 <p className="text-base text-gray-600 font-medium">{message}</p>
 </motion.div>

 {}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.45, duration: 0.3 }} // Earlier appearance
 className="flex justify-center space-x-1.5 mb-4"
 >
 {[0, 1, 2].map((i) => ( // Reduced from 5 to 3 dots
 <motion.div
 key={i}
 animate={{
 y: [0, -6, 0], // Smaller movement
 opacity: [0.5, 1, 0.5],
 }}
 transition={{
 duration: 0.8, // Faster animation
 repeat: Infinity,
 delay: i * 0.1,
 ease: "easeInOut",
 }}
 className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
 />
 ))}
 </motion.div>

 {}
 <motion.div
 initial={{ width: 0, opacity: 0 }}
 animate={{ width: "100%", opacity: 1 }}
 transition={{ delay: 0.5, duration: 0.3 }} // Faster appearance
 className="mx-auto max-w-xs"
 >
 <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
 <motion.div
 initial={{ width: 0 }}
 animate={{ width: `${progress}%` }}
 transition={{ duration: 0.1 }}
 className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
 />
 </div>
 <div className="text-xs text-gray-500 mt-2">{Math.round(progress)}%</div>
 </motion.div>
 </div>
 </div>
 )
}

export function LoadingSpinner({ size = 'md', className = '' }: { 
 size?: 'sm' | 'md' | 'lg'
 className?: string 
}) {
 const sizeClasses = {
 sm: 'w-4 h-4 border-2',
 md: 'w-6 h-6 border-2',
 lg: 'w-8 h-8 border-4'
 }

 return (
 <motion.div
 animate={{ rotate: 360 }}
 transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
 className={`${sizeClasses[size]} border-purple-600 border-t-transparent rounded-full ${className}`}
 />
 )
}

export function SectionSkeleton() {
 return (
 <div className="section-padding bg-white">
 <div className="container">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 className="text-center mb-12"
 >
 <motion.div
 animate={{ opacity: [0.3, 0.7, 0.3] }}
 transition={{ duration: 2, repeat: Infinity }}
 className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 mx-auto mb-4"
 />
 <motion.div
 animate={{ opacity: [0.3, 0.7, 0.3] }}
 transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
 className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2 mx-auto"
 />
 </motion.div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {[...Array(3)].map((_, i) => (
 <motion.div
 key={i}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: i * 0.1 }}
 className="text-center"
 >
 <motion.div
 animate={{ opacity: [0.3, 0.7, 0.3] }}
 transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
 className="w-20 h-20 bg-gradient-to-br from-purple-200 to-blue-200 rounded-2xl mx-auto mb-6"
 />
 <motion.div
 animate={{ opacity: [0.3, 0.7, 0.3] }}
 transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 + 0.1 }}
 className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 mx-auto mb-4"
 />
 <motion.div
 animate={{ opacity: [0.3, 0.7, 0.3] }}
 transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 + 0.2 }}
 className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-full mb-2"
 />
 <motion.div
 animate={{ opacity: [0.3, 0.7, 0.3] }}
 transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 + 0.3 }}
 className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-2/3 mx-auto"
 />
 </motion.div>
 ))}
 </div>
 </div>
 </div>
 )
}