'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { paymentService, RazorpaySuccessResponse, RazorpayErrorResponse } from '@/lib/services/paymentService'
import { useAuthContext } from '@/contexts/AuthContext'
import { formatRupees } from '@/lib/utils/coin-utils'
import CoinBalance from './CoinBalance'

export interface CoinPackage {
 id: string
 name: string
 coinAmount: number
 rupeePrice: number
 bonusCoins: number
 isPopular: boolean
 totalCoins: number
}

export interface CoinPurchaseModalProps {
 isOpen: boolean
 onClose: () => void
 onPurchaseComplete: (coins: number) => void
 currentBalance: number
}

type PurchaseState = 'idle' | 'loading' | 'selecting' | 'processing' | 'success' | 'error'

export default function CoinPurchaseModal({
 isOpen,
 onClose,
 onPurchaseComplete,
 currentBalance
}: CoinPurchaseModalProps) {
 const { user } = useAuthContext()
 const [packages, setPackages] = useState<CoinPackage[]>([])
 const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null)
 const [purchaseState, setPurchaseState] = useState<PurchaseState>('idle')
 const [error, setError] = useState<string | null>(null)
 const [sdkLoaded, setSdkLoaded] = useState(false)
 const [purchasedCoins, setPurchasedCoins] = useState(0)

 useEffect(() => {
 if (isOpen) {
 loadPackages()
 loadRazorpaySDK()
 }
 }, [isOpen])

 const loadPackages = async () => {
 setPurchaseState('loading')
 setError(null)

 try {
 const response = await fetch('/api/coins/packages')
 
 if (!response.ok) {
 throw new Error('Failed to load coin packages')
 }

 const data = await response.json()
 setPackages(data.packages || [])
 setPurchaseState('selecting')
 } catch (err) {
 console.error('Error loading packages:', err)
 setError(err instanceof Error ? err.message : 'Failed to load packages')
 setPurchaseState('error')
 }
 }

 const loadRazorpaySDK = async () => {
 try {
 await paymentService.loadRazorpaySDK()
 setSdkLoaded(true)
 } catch (err) {
 console.error('Error loading Razorpay SDK:', err)
 setError('Failed to load payment system')
 }
 }

 const handlePackageSelect = (pkg: CoinPackage) => {
 setSelectedPackage(pkg)
 }

 const handlePurchase = async () => {
 if (!selectedPackage || !sdkLoaded || !user) {
 return
 }

 setPurchaseState('processing')
 setError(null)

 try {
 await paymentService.initiatePayment({
 amount: selectedPackage.rupeePrice,
 coins: selectedPackage.totalCoins,
 userDetails: {
 name: user.fullName || user.firstName || 'User',
 email: user.primaryEmailAddress?.emailAddress || '',
 contact: user.primaryPhoneNumber?.phoneNumber || ''
 },
 onSuccess: async (response: RazorpaySuccessResponse) => {
 setPurchasedCoins(selectedPackage.totalCoins)
 setPurchaseState('success')

 onPurchaseComplete(selectedPackage.totalCoins)

 setTimeout(() => {
 handleClose()
 }, 2500)
 },
 onFailure: (error: RazorpayErrorResponse) => {
 setPurchaseState('error')
 setError(error.description || 'Payment failed')
 }
 })
 } catch (err) {
 console.error('Error initiating payment:', err)
 setPurchaseState('error')
 setError(err instanceof Error ? err.message : 'Payment failed')
 }
 }

 const handleClose = () => {
 if (purchaseState !== 'processing') {
 onClose()

 setTimeout(() => {
 setPurchaseState('idle')
 setSelectedPackage(null)
 setError(null)
 setPurchasedCoins(0)
 }, 300)
 }
 }

 const handleRetry = () => {
 setPurchaseState('selecting')
 setError(null)
 }

 if (!isOpen) return null

 return (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 transition={{ duration: 0.2 }}
 className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
 >
 {}
 <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 relative">
 {purchaseState !== 'processing' && (
 <button
 onClick={handleClose}
 className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
 aria-label="Close modal"
 >
 <X className="w-6 h-6" />
 </button>
 )}
 
 <div className="text-center text-white">
 <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
 <span className="text-3xl">🪙</span>
 </div>
 <h2 className="text-2xl font-bold mb-2">Purchase Coins</h2>
 <p className="text-purple-100">Choose a package to add coins to your wallet</p>
 </div>
 </div>

 {}
 <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
 {}
 <div className="bg-gray-50 rounded-lg p-4 mb-6">
 <p className="text-sm text-gray-600 mb-2">Current Balance</p>
 <CoinBalance balance={currentBalance} size="large" showRupeeEquivalent />
 </div>

 {}
 {purchaseState === 'loading' && (
 <div className="text-center py-12">
 <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
 <p className="text-gray-600">Loading coin packages...</p>
 </div>
 )}

 {}
 {purchaseState === 'selecting' && (
 <div className="space-y-4">
 <h3 className="text-lg font-semibold text-gray-900 mb-4">Select a Package</h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {packages.map((pkg) => (
 <motion.button
 key={pkg.id}
 onClick={() => handlePackageSelect(pkg)}
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 className={`
 relative p-5 rounded-lg border-2 text-left transition-all
 ${selectedPackage?.id === pkg.id
 ? 'border-purple-600 bg-purple-50 shadow-lg'
 : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
 }
 ${pkg.isPopular ? 'ring-2 ring-purple-400 ring-offset-2' : ''}
 `}
 >
 {}
 {pkg.isPopular && (
 <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
 <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
 <Sparkles className="w-3 h-3" />
 POPULAR
 </div>
 </div>
 )}

 {}
 <div className="mb-3">
 <h4 className="text-lg font-bold text-gray-900">{pkg.name}</h4>
 </div>

 {}
 <div className="mb-2">
 <div className="flex items-baseline gap-2">
 <span className="text-3xl font-bold text-gray-900">
 {pkg.coinAmount.toLocaleString()}
 </span>
 <span className="text-lg text-gray-600">coins</span>
 </div>
 
 {}
 {pkg.bonusCoins > 0 && (
 <div className="mt-1 flex items-center gap-1 text-green-600">
 <Sparkles className="w-4 h-4" />
 <span className="text-sm font-semibold">
 +{pkg.bonusCoins} bonus coins
 </span>
 </div>
 )}
 </div>

 {}
 <div className="mt-4 pt-4 border-t border-gray-200">
 <div className="flex items-baseline justify-between">
 <span className="text-2xl font-bold text-purple-600">
 {formatRupees(pkg.rupeePrice)}
 </span>
 {pkg.bonusCoins > 0 && (
 <span className="text-xs text-gray-500">
 Total: {pkg.totalCoins.toLocaleString()} coins
 </span>
 )}
 </div>
 </div>

 {}
 {selectedPackage?.id === pkg.id && (
 <div className="absolute top-3 right-3">
 <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
 <CheckCircle className="w-4 h-4 text-white" />
 </div>
 </div>
 )}
 </motion.button>
 ))}
 </div>

 {}
 {selectedPackage && (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="mt-6 pt-6 border-t border-gray-200"
 >
 <button
 onClick={handlePurchase}
 disabled={!sdkLoaded}
 className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
 >
 {sdkLoaded 
 ? `Pay ${formatRupees(selectedPackage.rupeePrice)}`
 : 'Loading payment system...'
 }
 </button>
 
 <p className="text-xs text-gray-500 text-center mt-3">
 Secure payment powered by Razorpay
 </p>
 </motion.div>
 )}
 </div>
 )}

 {}
 {purchaseState === 'processing' && (
 <div className="text-center py-12">
 <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
 <h3 className="text-xl font-semibold mb-2">Processing Payment</h3>
 <p className="text-gray-600">Please complete the payment in the popup window</p>
 <p className="text-sm text-gray-500 mt-2">Do not close this window</p>
 </div>
 )}

 {}
 {purchaseState === 'success' && (
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="text-center py-12"
 >
 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <CheckCircle className="w-12 h-12 text-green-600" />
 </div>
 <h3 className="text-2xl font-bold text-green-600 mb-2">Purchase Successful!</h3>
 <p className="text-gray-600 mb-4">
 {purchasedCoins.toLocaleString()} coins have been added to your wallet
 </p>
 <div className="bg-green-50 rounded-lg p-4 inline-block">
 <p className="text-sm text-gray-600 mb-2">New Balance</p>
 <CoinBalance 
 balance={currentBalance + purchasedCoins} 
 size="large" 
 showRupeeEquivalent 
 />
 </div>
 </motion.div>
 )}

 {}
 {purchaseState === 'error' && (
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="text-center py-12"
 >
 <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <AlertCircle className="w-12 h-12 text-red-600" />
 </div>
 <h3 className="text-2xl font-bold text-red-600 mb-2">Purchase Failed</h3>
 <p className="text-gray-600 mb-6">{error || 'An unexpected error occurred'}</p>
 <button
 onClick={handleRetry}
 className="bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
 >
 Try Again
 </button>
 </motion.div>
 )}
 </div>
 </motion.div>
 </div>
 )
}
