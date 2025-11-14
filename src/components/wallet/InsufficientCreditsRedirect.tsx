'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
 ExclamationTriangleIcon, 
 CurrencyDollarIcon,
 ArrowRightIcon 
} from '@heroicons/react/24/outline'
import type { InsufficientCreditsError } from '@/types'

interface InsufficientCreditsRedirectProps {
 error: InsufficientCreditsError
 videoTitle?: string
 autoRedirect?: boolean
 redirectDelay?: number
 onRecharge?: () => void
 className?: string
}

export default function InsufficientCreditsRedirect({
 error,
 videoTitle,
 autoRedirect = false,
 redirectDelay = 5000,
 onRecharge,
 className = ''
}: InsufficientCreditsRedirectProps) {
 const router = useRouter()

 useEffect(() => {
 if (autoRedirect) {
 const timer = setTimeout(() => {
 if (onRecharge) {
 onRecharge()
 } else {
 router.push('/wallet/recharge')
 }
 }, redirectDelay)

 return () => clearTimeout(timer)
 }
 }, [autoRedirect, redirectDelay, onRecharge, router])

 const handleRecharge = () => {
 if (onRecharge) {
 onRecharge()
 } else {
 router.push('/wallet/recharge')
 }
 }

 const handleGoBack = () => {
 router.back()
 }

 return (
 <div className={`min-h-screen bg-gray-50 flex items-center justify-center p-4 ${className}`}>
 <motion.div
 className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center"
 initial={{ opacity: 0, scale: 0.9, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 transition={{ type: 'spring', damping: 25, stiffness: 300 }}
 >
 {}
 <motion.div
 className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6"
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ delay: 0.2, type: 'spring', damping: 20, stiffness: 300 }}
 >
 <ExclamationTriangleIcon className="w-10 h-10 text-orange-600" />
 </motion.div>

 {}
 <motion.h1
 className="text-2xl font-bold text-gray-900 mb-4"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.3 }}
 >
 Insufficient Credits
 </motion.h1>

 {}
 <motion.div
 className="text-gray-600 mb-6 space-y-2"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.4 }}
 >
 {videoTitle && (
 <p className="font-medium">
 To watch &quot;{videoTitle}&quot;
 </p>
 )}
 <p>You need more credits to continue.</p>
 </motion.div>

 {}
 <motion.div
 className="bg-gray-50 rounded-xl p-4 mb-6"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.5 }}
 >
 <div className="flex items-center justify-between mb-2">
 <span className="text-gray-600">Required:</span>
 <div className="flex items-center gap-1">
 <CurrencyDollarIcon className="w-4 h-4 text-purple-600" />
 <span className="font-semibold text-gray-900">
 {error.required} credits
 </span>
 </div>
 </div>
 
 <div className="flex items-center justify-between mb-2">
 <span className="text-gray-600">Available:</span>
 <div className="flex items-center gap-1">
 <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
 <span className="font-semibold text-gray-900">
 {error.available} credits
 </span>
 </div>
 </div>
 
 <div className="border-t border-gray-200 pt-2 mt-2">
 <div className="flex items-center justify-between">
 <span className="text-gray-600">Need:</span>
 <div className="flex items-center gap-1">
 <CurrencyDollarIcon className="w-4 h-4 text-red-500" />
 <span className="font-bold text-red-600">
 {error.shortfall} more credits
 </span>
 </div>
 </div>
 </div>
 </motion.div>

 {}
 <motion.div
 className="space-y-3"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.6 }}
 >
 <button
 onClick={handleRecharge}
 className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
 >
 <CurrencyDollarIcon className="w-5 h-5" />
 Recharge Wallet
 <ArrowRightIcon className="w-4 h-4" />
 </button>
 
 <button
 onClick={handleGoBack}
 className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-50 transition-colors"
 >
 Go Back
 </button>
 </motion.div>

 {}
 {autoRedirect && (
 <motion.p
 className="text-sm text-gray-500 mt-4"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 1 }}
 >
 Redirecting to recharge page in {Math.ceil(redirectDelay / 1000)} seconds...
 </motion.p>
 )}
 </motion.div>
 </div>
 )
}