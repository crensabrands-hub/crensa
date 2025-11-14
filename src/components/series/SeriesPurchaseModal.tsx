'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Series, WalletBalance } from '@/types';
import Image from 'next/image';
import CoinBalance from '@/components/wallet/CoinBalance'
import CoinPrice from '@/components/wallet/CoinPrice';
import { coinsToRupees } from '@/lib/utils/coin-utils';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface SeriesPurchaseModalProps {
 series: Series;
 walletBalance: WalletBalance;
 onClose: () => void;
 onPurchase: () => Promise<void>;
 onPurchaseCoins?: () => void;
 isLoading?: boolean;
}

export default function SeriesPurchaseModal({
 series,
 walletBalance,
 onClose,
 onPurchase,
 onPurchaseCoins,
 isLoading = false
}: SeriesPurchaseModalProps) {
 const router = useRouter()
 const [step, setStep] = useState<'details' | 'payment' | 'processing' | 'success' | 'error'>('details');
 const [error, setError] = useState<string | null>(null);

 const coinsCost = series.totalPrice // This will be renamed to coinPrice in migration
 const hasInsufficientCoins = walletBalance.balance < coinsCost
 const remainingBalance = walletBalance.balance - coinsCost

 const formatDuration = (seconds: number): string => {
 const hours = Math.floor(seconds / 3600);
 const minutes = Math.floor((seconds % 3600) / 60);
 
 if (hours > 0) {
 return `${hours}h ${minutes}m`;
 }
 return `${minutes}m`;
 };

 const handlePurchase = async () => {
 if (hasInsufficientCoins) {
 handlePurchaseCoins()
 return
 }

 setStep('processing');
 setError(null);
 
 try {
 await onPurchase();
 setStep('success');

 setTimeout(() => {
 onClose();
 }, 2000);
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Purchase failed. Please try again.');
 setStep('error');
 }
 };

 const handleRetry = () => {
 setStep('details');
 setError(null);
 };

 const handlePurchaseCoins = () => {
 if (onPurchaseCoins) {
 onPurchaseCoins()
 } else {
 router.push('/member/wallet?action=purchase')
 }
 };

 return (
 <AnimatePresence>
 <motion.div
 className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 >
 <motion.div
 className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
 initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.9, opacity: 0 }}
 onClick={(e) => e.stopPropagation()}
 >
 {}
 <div className="flex items-center justify-between p-6 border-b border-neutral-light-gray">
 <h2 className="text-xl font-bold text-primary-navy">
 {step === 'details' && 'Purchase Series'}
 {step === 'payment' && 'Payment Details'}
 {step === 'processing' && 'Processing...'}
 {step === 'success' && 'Purchase Successful!'}
 {step === 'error' && 'Purchase Failed'}
 </h2>
 
 {step !== 'processing' && (
 <button
 onClick={onClose}
 className="p-2 hover:bg-neutral-light-gray rounded-lg transition-colors"
 >
 <svg className="w-5 h-5 text-neutral-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 )}
 </div>

 {}
 <div className="p-6">
 {}
 {step === 'details' && (
 <div className="space-y-6">
 {}
 <div className="flex space-x-4">
 <div className="w-24 h-16 bg-neutral-light-gray rounded-lg overflow-hidden flex-shrink-0">
 {series.thumbnailUrl ? (
 <Image
 src={series.thumbnailUrl}
 alt={series.title}
 width={96}
 height={64}
 className="w-full h-full object-cover"
 />
 ) : (
 <div className="w-full h-full bg-gradient-to-br from-accent-pink/20 via-accent-teal/20 to-primary-neon-yellow/20 flex items-center justify-center">
 <svg className="w-6 h-6 text-neutral-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
 </svg>
 </div>
 )}
 </div>
 
 <div className="flex-1 min-w-0">
 <h3 className="font-semibold text-primary-navy line-clamp-2 mb-1">
 {series.title}
 </h3>
 <p className="text-sm text-neutral-dark-gray">
 by {series.creator?.displayName || series.creator?.username || 'Unknown Creator'}
 </p>
 </div>
 </div>

 {}
 <div className="grid grid-cols-3 gap-4 p-4 bg-neutral-light-gray/50 rounded-lg">
 <div className="text-center">
 <div className="text-lg font-semibold text-primary-navy">
 {series.videoCount}
 </div>
 <div className="text-xs text-neutral-dark-gray">Videos</div>
 </div>
 
 <div className="text-center">
 <div className="text-lg font-semibold text-primary-navy">
 {formatDuration(series.totalDuration)}
 </div>
 <div className="text-xs text-neutral-dark-gray">Duration</div>
 </div>
 
 <div className="text-center">
 <div className="text-lg font-semibold text-primary-navy capitalize">
 {series.category}
 </div>
 <div className="text-xs text-neutral-dark-gray">Category</div>
 </div>
 </div>

 {}
 <div>
 <h4 className="font-semibold text-primary-navy mb-3">What&apos;s included:</h4>
 <div className="space-y-2">
 <div className="flex items-center space-x-2">
 <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
 </svg>
 <span className="text-sm text-neutral-dark-gray">
 Lifetime access to all {series.videoCount} videos
 </span>
 </div>
 
 <div className="flex items-center space-x-2">
 <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
 </svg>
 <span className="text-sm text-neutral-dark-gray">
 Watch on any device
 </span>
 </div>
 
 <div className="flex items-center space-x-2">
 <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
 </svg>
 <span className="text-sm text-neutral-dark-gray">
 Progress tracking
 </span>
 </div>
 
 <div className="flex items-center space-x-2">
 <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
 </svg>
 <span className="text-sm text-neutral-dark-gray">
 No additional fees
 </span>
 </div>
 </div>
 </div>

 {}
 <div className="border-t border-neutral-light-gray pt-6">
 <div className="bg-purple-50 rounded-lg p-4 mb-4">
 <div className="flex items-center justify-between mb-3">
 <span className="font-semibold text-gray-900">Series Price:</span>
 <div className="text-right">
 <CoinPrice coins={coinsCost} size="large" />
 <div className="text-xs text-gray-500 mt-1">
 ≈ ₹{coinsToRupees(coinsCost).toFixed(2)}
 </div>
 </div>
 </div>

 <div className="flex items-center justify-between text-sm border-t border-purple-100 pt-3">
 <span className="text-gray-600">Your Balance:</span>
 <CoinBalance 
 balance={walletBalance.balance} 
 size="small" 
 className={hasInsufficientCoins ? 'text-red-600' : 'text-green-600'}
 />
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
 
 {hasInsufficientCoins ? (
 <div className="flex gap-3">
 <button
 onClick={onClose}
 className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
 >
 Cancel
 </button>
 <button
 onClick={handlePurchaseCoins}
 className="flex-1 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
 >
 Purchase Coins
 </button>
 </div>
 ) : (
 <button
 onClick={handlePurchase}
 disabled={isLoading}
 className="w-full px-6 py-3 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {isLoading ? 'Processing...' : 'Purchase Series'}
 </button>
 )}
 
 <p className="text-xs text-neutral-dark-gray text-center mt-2">
 Lifetime access • Watch on any device
 </p>
 </div>
 </div>
 )}

 {}
 {step === 'processing' && (
 <div className="text-center py-8">
 <div className="w-16 h-16 bg-primary-neon-yellow rounded-full flex items-center justify-center mx-auto mb-4">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-navy"></div>
 </div>
 <h3 className="text-lg font-semibold text-primary-navy mb-2">
 Processing your purchase...
 </h3>
 <p className="text-neutral-dark-gray">
 Please wait while we process your payment
 </p>
 </div>
 )}

 {}
 {step === 'success' && (
 <div className="text-center py-8">
 <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
 <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
 </svg>
 </div>
 <h3 className="text-lg font-semibold text-primary-navy mb-2">
 Purchase Successful!
 </h3>
 <p className="text-neutral-dark-gray mb-2">
 You now have lifetime access to this series
 </p>
 <div className="text-sm text-gray-500 mb-4">
 Remaining balance: <CoinBalance balance={remainingBalance} size="small" inline />
 </div>
 <button
 onClick={onClose}
 className="px-6 py-2 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors"
 >
 Start Watching
 </button>
 </div>
 )}

 {}
 {step === 'error' && (
 <div className="text-center py-8">
 <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
 <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </div>
 <h3 className="text-lg font-semibold text-primary-navy mb-2">
 Purchase Failed
 </h3>
 <p className="text-neutral-dark-gray mb-4">
 {error || 'Something went wrong. Please try again.'}
 </p>
 <div className="flex space-x-3 justify-center">
 <button
 onClick={handleRetry}
 className="px-6 py-2 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors"
 >
 Try Again
 </button>
 <button
 onClick={onClose}
 className="px-6 py-2 border border-neutral-light-gray text-neutral-dark-gray rounded-lg hover:bg-neutral-light-gray transition-colors"
 >
 Cancel
 </button>
 </div>
 </div>
 )}
 </div>
 </motion.div>
 </motion.div>
 </AnimatePresence>
 );
}