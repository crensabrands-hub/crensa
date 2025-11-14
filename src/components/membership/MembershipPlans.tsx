'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
 CheckIcon,
 XMarkIcon,
 StarIcon,
 BoltIcon
} from '@heroicons/react/24/outline'
import { useAuthContext, type MemberProfile } from '@/contexts/AuthContext'
import PaymentModal from '@/components/payments/PaymentModal'
import type { MembershipPlan } from '@/types'
import type { RazorpaySuccessResponse, RazorpayErrorResponse } from '@/lib/services/paymentService'

interface MembershipPlansProps {
 showComparison?: boolean
}

export default function MembershipPlans({ showComparison = false }: MembershipPlansProps) {
 const { userProfile } = useAuthContext()
 const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null)
 const [showPaymentModal, setShowPaymentModal] = useState(false)

 const membershipPlans: MembershipPlan[] = [
 {
 id: 'monthly',
 name: 'Monthly Premium',
 description: 'Perfect for trying out premium features',
 price: 299,
 duration: 30,
 features: [
 'Access to all exclusive content',
 'Ad-free viewing experience',
 'Priority customer support',
 'Early access to new shows',
 'Direct creator messaging',
 'Unlimited viewing history'
 ]
 },
 {
 id: 'quarterly',
 name: 'Quarterly Premium',
 description: 'Best value for regular users',
 price: 799,
 originalPrice: 897,
 discountPercentage: 11,
 duration: 90,
 isPopular: true,
 features: [
 'All Monthly Premium features',
 'Exclusive quarterly content drops',
 'Priority access to live events',
 'Advanced analytics dashboard',
 'Custom profile themes',
 'Download for offline viewing'
 ]
 },
 {
 id: 'yearly',
 name: 'Yearly Premium',
 description: 'Maximum savings for committed users',
 price: 2999,
 originalPrice: 3588,
 discountPercentage: 16,
 duration: 365,
 features: [
 'All Quarterly Premium features',
 'Annual exclusive content library',
 'VIP creator meet & greet access',
 'Custom badges and recognition',
 'Advanced content recommendations',
 'Priority feature requests'
 ]
 }
 ]

 const freePlanFeatures = [
 'Basic content access',
 'Standard video quality',
 'Community support',
 'Limited viewing history'
 ]

 const handlePlanSelect = (plan: MembershipPlan) => {
 setSelectedPlan(plan)
 setShowPaymentModal(true)
 }

 const handlePaymentSuccess = async (response: RazorpaySuccessResponse) => {
 try {
 if (!selectedPlan || !userProfile) return

 const activationResponse = await fetch('/api/membership/activate', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 userId: userProfile.id,
 planId: selectedPlan.id,
 paymentId: response.razorpay_payment_id,
 orderId: response.razorpay_order_id || 'order_' + Date.now()
 }),
 })

 if (!activationResponse.ok) {
 throw new Error('Failed to activate membership')
 }

 const result = await activationResponse.json()
 console.log('Membership activated:', result)

 setTimeout(() => {
 window.location.reload()
 }, 1000)
 
 setShowPaymentModal(false)
 setSelectedPlan(null)

 alert('Membership activated successfully!')
 } catch (error) {
 console.error('Error activating membership:', error)
 alert('Failed to activate membership. Please contact support.')
 }
 }

 const handlePaymentFailure = (error: RazorpayErrorResponse) => {
 console.error('Payment failed:', error)
 alert(`Payment failed: ${error.description || 'Unknown error'}. Please try again.`)
 setShowPaymentModal(false)
 setSelectedPlan(null)
 }

 const currentMembershipStatus = userProfile?.role === 'member' ? (userProfile as MemberProfile).membershipStatus : 'free'
 const isCurrentlyPremium = currentMembershipStatus === 'premium'

 if (showComparison) {
 return (
 <div className="bg-white rounded-2xl border border-gray-200 p-8">
 <div className="text-center mb-8">
 <h2 className="text-2xl font-bold text-gray-900 mb-2">
 Choose Your Plan
 </h2>
 <p className="text-gray-600">
 Compare features and find the perfect plan for you
 </p>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-gray-200">
 <th className="text-left py-4 px-6 font-semibold text-gray-900">Features</th>
 <th className="text-center py-4 px-6">
 <div className="flex flex-col items-center">
 <span className="font-semibold text-gray-900">Free</span>
 <span className="text-sm text-gray-500">₹0/month</span>
 </div>
 </th>
 {membershipPlans.map((plan) => (
 <th key={plan.id} className="text-center py-4 px-6 relative">
 {plan.isPopular && (
 <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
 <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium">
 Most Popular
 </span>
 </div>
 )}
 <div className="flex flex-col items-center">
 <span className="font-semibold text-gray-900">{plan.name}</span>
 <div className="flex items-center gap-2">
 {plan.originalPrice && (
 <span className="text-sm text-gray-400 line-through">
 ₹{plan.originalPrice}
 </span>
 )}
 <span className="text-sm text-gray-500">₹{plan.price}</span>
 </div>
 </div>
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {}
 {[
 'Access to exclusive content',
 'Ad-free viewing',
 'Priority support',
 'Early access to shows',
 'Creator messaging',
 'Offline downloads',
 'Custom themes',
 'Advanced analytics'
 ].map((feature, index) => (
 <tr key={feature} className="border-b border-gray-100">
 <td className="py-3 px-6 text-gray-700">{feature}</td>
 <td className="py-3 px-6 text-center">
 {index < 1 ? (
 <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
 ) : (
 <XMarkIcon className="w-5 h-5 text-gray-300 mx-auto" />
 )}
 </td>
 {membershipPlans.map((plan) => (
 <td key={plan.id} className="py-3 px-6 text-center">
 <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
 </td>
 ))}
 </tr>
 ))}
 <tr>
 <td className="py-6 px-6"></td>
 <td className="py-6 px-6 text-center">
 <span className="text-sm text-gray-500">Current Plan</span>
 </td>
 {membershipPlans.map((plan) => (
 <td key={plan.id} className="py-6 px-6 text-center">
 <button
 onClick={() => handlePlanSelect(plan)}
 disabled={isCurrentlyPremium}
 className={`px-4 py-2 rounded-lg font-medium transition-colors ${
 plan.isPopular
 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
 : 'bg-purple-600 text-white hover:bg-purple-700'
 } disabled:opacity-50 disabled:cursor-not-allowed`}
 >
 {isCurrentlyPremium ? 'Current' : 'Upgrade'}
 </button>
 </td>
 ))}
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 )
 }

 return (
 <>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {membershipPlans.map((plan, index) => (
 <motion.div
 key={plan.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, delay: index * 0.1 }}
 className={`relative bg-white rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-xl ${
 plan.isPopular
 ? 'border-purple-300 shadow-lg scale-105'
 : 'border-gray-200 hover:border-purple-200'
 }`}
 >
 {plan.isPopular && (
 <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
 <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
 <StarIcon className="w-4 h-4" />
 Most Popular
 </span>
 </div>
 )}

 <div className="text-center mb-6">
 <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
 plan.isPopular
 ? 'bg-gradient-to-r from-purple-500 to-pink-500'
 : 'bg-purple-100'
 }`}>
 {plan.isPopular ? (
 <StarIcon className="w-8 h-8 text-white" />
 ) : (
 <BoltIcon className="w-8 h-8 text-purple-600" />
 )}
 </div>
 
 <h3 className="text-xl font-bold text-gray-900 mb-2">
 {plan.name}
 </h3>
 <p className="text-gray-600 text-sm mb-4">
 {plan.description}
 </p>

 <div className="flex items-center justify-center gap-2 mb-2">
 {plan.originalPrice && (
 <span className="text-lg text-gray-400 line-through">
 ₹{plan.originalPrice}
 </span>
 )}
 <span className="text-3xl font-bold text-gray-900">
 ₹{plan.price}
 </span>
 </div>
 
 {plan.discountPercentage && (
 <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
 Save {plan.discountPercentage}%
 </span>
 )}
 
 <p className="text-sm text-gray-500 mt-2">
 For {plan.duration} days
 </p>
 </div>

 <ul className="space-y-3 mb-8">
 {plan.features.map((feature) => (
 <li key={feature} className="flex items-start gap-3">
 <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
 <span className="text-sm text-gray-700">{feature}</span>
 </li>
 ))}
 </ul>

 <button
 onClick={() => handlePlanSelect(plan)}
 disabled={isCurrentlyPremium}
 className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
 plan.isPopular
 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
 : 'bg-purple-600 text-white hover:bg-purple-700'
 } disabled:opacity-50 disabled:cursor-not-allowed`}
 >
 {isCurrentlyPremium ? 'Current Plan' : `Choose ${plan.name}`}
 </button>
 </motion.div>
 ))}
 </div>

 {}
 {showPaymentModal && selectedPlan && userProfile && (
 <PaymentModal
 isOpen={showPaymentModal}
 onClose={() => {
 setShowPaymentModal(false)
 setSelectedPlan(null)
 }}
 amount={selectedPlan.price}
 coins={0} // Membership doesn't add coins
 userDetails={{
 name: userProfile.username,
 email: userProfile.email,
 contact: userProfile.email // Using email as contact for now
 }}
 onPaymentSuccess={handlePaymentSuccess}
 onPaymentFailure={handlePaymentFailure}
 />
 )}
 </>
 )
}