'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
 CurrencyDollarIcon, 
 CheckIcon,
 SparklesIcon,
 ArrowRightIcon
} from '@heroicons/react/24/outline'
import { useAuthContext, type MemberProfile } from '@/contexts/AuthContext'
import PaymentModal from '@/components/payments/PaymentModal'
import type { RazorpaySuccessResponse, RazorpayErrorResponse } from '@/lib/services/paymentService'

interface TopUpOption {
 id: string
 credits: number
 amount: number
 bonus?: number
 popular?: boolean
 savings?: string
}

const topUpOptions: TopUpOption[] = [
 {
 id: 'basic',
 credits: 100,
 amount: 99,
 bonus: 0
 },
 {
 id: 'popular',
 credits: 500,
 amount: 449,
 bonus: 50,
 popular: true,
 savings: '10% off'
 },
 {
 id: 'premium',
 credits: 1000,
 amount: 799,
 bonus: 200,
 savings: '20% off'
 },
 {
 id: 'ultimate',
 credits: 2500,
 amount: 1799,
 bonus: 750,
 savings: '30% off'
 }
]

export default function TopUpInterface() {
 const { userProfile } = useAuthContext()
 const [selectedOption, setSelectedOption] = useState<TopUpOption | null>(null)
 const [customAmount, setCustomAmount] = useState('')
 const [customCredits, setCustomCredits] = useState('')
 const [showPaymentModal, setShowPaymentModal] = useState(false)
 const [isCustom, setIsCustom] = useState(false)
 const [paymentSuccess, setPaymentSuccess] = useState(false)

 useEffect(() => {
 if (customAmount && !isNaN(Number(customAmount))) {
 const amount = Number(customAmount)
 const credits = Math.floor(amount) // 1:1 ratio
 setCustomCredits(credits.toString())
 } else {
 setCustomCredits('')
 }
 }, [customAmount])

 const handleOptionSelect = (option: TopUpOption) => {
 setSelectedOption(option)
 setIsCustom(false)
 setCustomAmount('')
 setCustomCredits('')
 }

 const handleCustomSelect = () => {
 setIsCustom(true)
 setSelectedOption(null)
 }

 const handleProceedToPayment = () => {
 if (!userProfile) return
 
 if (isCustom && (!customAmount || Number(customAmount) < 10)) {
 alert('Minimum top-up amount is ₹10')
 return
 }
 
 if (!isCustom && !selectedOption) {
 alert('Please select a top-up option')
 return
 }

 setShowPaymentModal(true)
 }

 const handlePaymentSuccess = (response: RazorpaySuccessResponse) => {
 console.log('Payment successful:', response)
 setPaymentSuccess(true)
 setShowPaymentModal(false)

 setTimeout(() => {
 setPaymentSuccess(false)
 setSelectedOption(null)
 setIsCustom(false)
 setCustomAmount('')
 setCustomCredits('')
 }, 3000)
 }

 const handlePaymentFailure = (error: RazorpayErrorResponse) => {
 console.error('Payment failed:', error)
 setShowPaymentModal(false)
 }

 const getPaymentDetails = () => {
 if (isCustom) {
 return {
 amount: Number(customAmount),
 credits: Number(customCredits)
 }
 } else if (selectedOption) {
 return {
 amount: selectedOption.amount,
 credits: selectedOption.credits + (selectedOption.bonus || 0)
 }
 }
 return { amount: 0, credits: 0 }
 }

 const paymentDetails = getPaymentDetails()

 if (paymentSuccess) {
 return (
 <motion.div
 className="bg-white rounded-xl border border-gray-200 p-8 text-center"
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.3 }}
 >
 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <CheckIcon className="w-8 h-8 text-green-600" />
 </div>
 <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
 <p className="text-gray-600">
 {paymentDetails.credits} coins have been added to your wallet
 </p>
 <div className="text-sm text-gray-500">
 Redirecting you back to wallet overview...
 </div>
 </motion.div>
 )
 }

 return (
 <div className="space-y-8">
 {/* Header */}
 <div className="bg-white rounded-xl border border-gray-200 p-6">
 <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Coins to Your Wallet</h2>
 <p className="text-gray-600">
 Choose from our popular packages or enter a custom amount. All payments are secure and processed instantly.
 </p>
 </div>

 {/* Top-up Options */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 {topUpOptions.map((option) => (
 <motion.div
 key={option.id}
 className={`relative bg-white rounded-xl border-2 p-6 cursor-pointer transition-all ${
 selectedOption?.id === option.id
 ? 'border-purple-500 bg-purple-50'
 : 'border-gray-200 hover:border-purple-300'
 } ${option.popular ? 'ring-2 ring-purple-200' : ''}`}
 onClick={() => handleOptionSelect(option)}
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 >
 {/* Popular Tag */}
 {option.popular && (
 <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
 <span className="bg-purple-600 text-white text-xs font-medium px-3 py-1 rounded-full">
 Most Popular
 </span>
 </div>
 )}

 {/* Savings Tag */}
 {option.savings && (
 <div className="absolute -top-2 -right-2">
 <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
 {option.savings}
 </span>
 </div>
 )}

 <div className="text-center">
 <div className="text-3xl font-bold text-gray-900 mb-1">
 {option.credits.toLocaleString()}
 </div>
 <div className="text-sm text-gray-600 mb-2">Coins</div>
 
 {option.bonus && option.bonus > 0 && (
 <div className="flex items-center justify-center gap-1 mb-3">
 <SparklesIcon className="w-4 h-4 text-yellow-500" />
 <span className="text-sm font-medium text-yellow-600">
 +{option.bonus} bonus
 </span>
 </div>
 )}

 <div className="text-2xl font-bold text-purple-600">
 ₹{option.amount}
 </div>
 
 <div className="text-xs text-gray-500 mt-1">
 ₹{(option.amount / (option.credits + (option.bonus || 0))).toFixed(2)} per coin
 </div>
 </div>

 {/* Selected Checkmark */}
 <AnimatePresence>
 {selectedOption?.id === option.id && (
 <motion.div
 className="absolute top-4 right-4"
 initial={{ opacity: 0, scale: 0 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0 }}
 >
 <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
 <CheckIcon className="w-4 h-4 text-white" />
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </motion.div>
 ))}
 </div>

 {/* Custom Amount */}
 <div className="bg-white rounded-xl border border-gray-200 p-6">
 <div className="flex items-center gap-3 mb-4">
 <input
 type="radio"
 id="custom"
 name="topup-option"
 checked={isCustom}
 onChange={handleCustomSelect}
 className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
 />
 <label htmlFor="custom" className="text-lg font-medium text-gray-900">
 Custom Amount
 </label>
 </div>

 <AnimatePresence>
 {isCustom && (
 <motion.div
 className="grid grid-cols-1 md:grid-cols-2 gap-4"
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 >
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Amount (₹)
 </label>
 <div className="relative">
 <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
 <input
 type="number"
 value={customAmount}
 onChange={(e) => setCustomAmount(e.target.value)}
 placeholder="Enter amount"
 min="10"
 max="10000"
 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
 />
 </div>
 <p className="text-xs text-gray-500 mt-1">Minimum: ₹10, Maximum: ₹10,000</p>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Coins You&apos;ll Get
 </label>
 <div className="py-3 px-4 bg-gray-50 border border-gray-200 rounded-lg">
 <div className="text-lg font-semibold text-gray-900">
 {customCredits ? Number(customCredits).toLocaleString() : '0'} coins
 </div>
 <div className="text-xs text-gray-500">1 coin = ₹1</div>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* Payment Summary & Button */}
 <div className="bg-white rounded-xl border border-gray-200 p-6">
 <div className="flex items-center justify-between mb-4">
 <div>
 <h3 className="text-lg font-medium text-gray-900">Payment Summary</h3>
 {(selectedOption || (isCustom && customAmount)) && (
 <div className="text-sm text-gray-600 mt-1">
 {paymentDetails.credits.toLocaleString()} coins for ₹{paymentDetails.amount}
 </div>
 )}
 </div>
 
 <button
 onClick={handleProceedToPayment}
 disabled={!selectedOption && (!isCustom || !customAmount)}
 className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
 >
 Proceed to Payment
 <ArrowRightIcon className="w-4 h-4" />
 </button>
 </div>

 <div className="text-xs text-gray-500">
 Payments are processed securely by Razorpay. Coins will be added to your wallet instantly after successful payment.
 </div>
 </div>

 {/* Payment Modal */}
 {showPaymentModal && userProfile && (
 <PaymentModal
 isOpen={showPaymentModal}
 onClose={() => setShowPaymentModal(false)}
 amount={paymentDetails.amount}
 coins={paymentDetails.credits}
 userDetails={{
 name: userProfile.username,
 email: userProfile.email,
 contact: userProfile.email
 }}
 onPaymentSuccess={handlePaymentSuccess}
 onPaymentFailure={handlePaymentFailure}
 />
 )}
 </div>
 )
}