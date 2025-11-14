'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
 XMarkIcon, 
 PlayIcon,
 ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'
import CoinBalance from '@/components/wallet/CoinBalance'
import CoinPrice from '@/components/wallet/CoinPrice'
import { coinsToRupees } from '@/lib/utils/coin-utils'
import type { Video, WalletBalance, InsufficientCreditsError } from '@/types'

interface CreditConfirmationModalProps {
 isOpen: boolean
 video: Video
 walletBalance: WalletBalance
 onConfirm: () => Promise<void>
 onCancel: () => void
 onPurchaseCoins?: () => void
 isProcessing?: boolean
 error?: string | InsufficientCreditsError
}

export default function CreditConfirmationModal({
 isOpen,
 video,
 walletBalance,
 onConfirm,
 onCancel,
 onPurchaseCoins,
 isProcessing = false,
 error
}: CreditConfirmationModalProps) {
 const router = useRouter()
 const [isConfirming, setIsConfirming] = useState(false)
 const [purchaseSuccess, setPurchaseSuccess] = useState(false)
 
 const coinsCost = video.coinPrice
 const hasInsufficientCoins = walletBalance.balance < coinsCost
 const isInsufficientCoinsError = error && typeof error === 'object' && 'shortfall' in error
 const remainingBalance = walletBalance.balance - coinsCost

 const handleConfirm = async () => {
 if (hasInsufficientCoins) {
 handlePurchaseCoins()
 return
 }

 setIsConfirming(true)
 try {
 await onConfirm()
 setPurchaseSuccess(true)

 setTimeout(() => {
 onCancel()
 setPurchaseSuccess(false)
 }, 2000)
 } finally {
 setIsConfirming(false)
 }
 }

 const handlePurchaseCoins = () => {
 if (onPurchaseCoins) {
 onPurchaseCoins()
 } else {
 router.push('/member/wallet?action=purchase')
 }
 }

 const formatTime = (seconds: number) => {
 const minutes = Math.floor(seconds / 60)
 const remainingSeconds = seconds % 60
 return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
 }

 return (
 <AnimatePresence>
 {isOpen && (
 <motion.div
 className="fixed inset-0 z-50 flex items-center justify-center p-4"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 >
 {}
 <motion.div
 className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onCancel}
 />

 {}
 <motion.div
 className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
 initial={{ opacity: 0, scale: 0.9, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.9, y: 20 }}
 transition={{ type: 'spring', damping: 25, stiffness: 300 }}
 >
 {}
 <button
 onClick={onCancel}
 className="absolute top-4 right-4 z-10 w-8 h-8 bg-black bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-40 transition-all"
 >
 <XMarkIcon className="w-5 h-5" />
 </button>

 {}
 <div className="relative h-48 bg-gray-900">
 <Image
 src={video.thumbnailUrl}
 alt={video.title}
 fill
 className="object-cover"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
 
 {}
 <div className="absolute inset-0 flex items-center justify-center">
 <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
 <PlayIcon className="w-6 h-6 text-white ml-1" />
 </div>
 </div>

 {}
 <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
 {formatTime(video.duration)}
 </div>
 </div>

 {}
 <div className="p-6">
 {}
 {purchaseSuccess && (
 <div className="text-center py-8">
 <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
 <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
 </svg>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 Purchase Successful!
 </h3>
 <p className="text-gray-600 mb-2">
 Enjoy your video
 </p>
 <div className="text-sm text-gray-500">
 Remaining balance: <CoinBalance balance={remainingBalance} size="small" inline />
 </div>
 </div>
 )}

 {}
 {!purchaseSuccess && (
 <>
 {}
 <div className="mb-6">
 <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
 {video.title}
 </h3>
 <p className="text-gray-600 text-sm">
 by {video.creator?.displayName || video.creator?.username || 'Unknown Creator'}
 </p>
 </div>

 {}
 <div className="bg-purple-50 rounded-xl p-4 mb-6">
 <div className="flex items-center justify-between mb-3">
 <span className="font-semibold text-gray-900">Cost to Watch</span>
 <div className="text-right">
 <CoinPrice coins={coinsCost} size="large" />
 <div className="text-xs text-gray-500 mt-1">
 ≈ ₹{coinsToRupees(coinsCost).toFixed(2)}
 </div>
 </div>
 </div>

 {}
 <div className="flex items-center justify-between text-sm border-t border-purple-100 pt-3">
 <span className="text-gray-600">Your Balance:</span>
 <div className="text-right">
 <CoinBalance 
 balance={walletBalance.balance} 
 size="small" 
 className={hasInsufficientCoins ? 'text-red-600' : 'text-green-600'}
 />
 </div>
 </div>

 {!hasInsufficientCoins && (
 <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-purple-100">
 <span className="text-gray-600">After Purchase:</span>
 <CoinBalance 
 balance={remainingBalance} 
 size="small" 
 className="text-gray-900 font-semibold"
 />
 </div>
 )}

 {hasInsufficientCoins && (
 <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
 <div className="flex items-start gap-2">
 <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
 <div className="text-sm text-red-700">
 <p className="font-medium">Insufficient Coins</p>
 <p>You need <CoinBalance balance={coinsCost - walletBalance.balance} size="small" inline /> more coins.</p>
 </div>
 </div>
 </div>
 )}
 </div>
 </>
 )}

 {}
 {!purchaseSuccess && error && !hasInsufficientCoins && (
 <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
 <div className="flex items-start gap-2">
 <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
 <div className="text-sm text-red-700">
 {typeof error === 'string' ? error : (
 <div>
 <p className="font-medium">Insufficient Coins</p>
 <p>Required: <CoinBalance balance={error.required} size="small" inline /></p>
 <p>Available: <CoinBalance balance={error.available} size="small" inline /></p>
 <p>Shortfall: <CoinBalance balance={error.shortfall} size="small" inline /></p>
 </div>
 )}
 </div>
 </div>
 </div>
 )}

 {}
 {!purchaseSuccess && (
 <div className="flex gap-3">
 {hasInsufficientCoins || isInsufficientCoinsError ? (
 <>
 <button
 onClick={onCancel}
 className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
 >
 Cancel
 </button>
 <button
 onClick={handlePurchaseCoins}
 className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
 >
 Purchase Coins
 </button>
 </>
 ) : (
 <>
 <button
 onClick={onCancel}
 disabled={isConfirming || isProcessing}
 className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 Cancel
 </button>
 <button
 onClick={handleConfirm}
 disabled={isConfirming || isProcessing}
 className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {isConfirming || isProcessing ? (
 <>
 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
 Processing...
 </>
 ) : (
 'Watch Now'
 )}
 </button>
 </>
 )}
 </div>
 )}

 {}
 {!purchaseSuccess && walletBalance.pendingTransactions > 0 && (
 <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
 <p className="text-sm text-yellow-700">
 You have {walletBalance.pendingTransactions} pending transaction(s). 
 Your balance may update once they are processed.
 </p>
 </div>
 )}
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 )
}