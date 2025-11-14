'use client'

import { motion } from 'framer-motion'
import { 
 BoltIcon,
 StarIcon,
 ShieldCheckIcon,
 HeartIcon,
 ClockIcon,
 CheckIcon
} from '@heroicons/react/24/outline'
import type { MembershipBenefit } from '@/types'

interface MembershipBenefitsProps {
 benefits: MembershipBenefit[]
}

const iconMap = {
 crown: StarIcon, // Using StarIcon instead of CrownIcon
 bolt: BoltIcon,
 star: StarIcon,
 shield: ShieldCheckIcon,
 heart: HeartIcon,
 clock: ClockIcon,
}

export default function MembershipBenefits({ benefits }: MembershipBenefitsProps) {
 return (
 <div className="bg-white rounded-2xl border border-gray-200 p-8">
 <div className="text-center mb-8">
 <h2 className="text-2xl font-bold text-gray-900 mb-2">
 Membership Benefits
 </h2>
 <p className="text-gray-600">
 Discover what you get with Crensa Premium
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {benefits.map((benefit, index) => {
 const Icon = iconMap[benefit.icon as keyof typeof iconMap] || CheckIcon
 
 return (
 <motion.div
 key={benefit.title}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, delay: index * 0.1 }}
 className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
 benefit.isPremiumOnly
 ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-300'
 : 'border-gray-200 bg-gray-50 hover:border-gray-300'
 }`}
 >
 <div className="flex items-start space-x-4">
 <div className={`p-3 rounded-lg ${
 benefit.isPremiumOnly
 ? 'bg-gradient-to-r from-purple-500 to-pink-500'
 : 'bg-gray-400'
 }`}>
 <Icon className="w-6 h-6 text-white" />
 </div>
 
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-2">
 <h3 className="font-semibold text-gray-900">
 {benefit.title}
 </h3>
 {benefit.isPremiumOnly && (
 <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-full">
 Premium
 </span>
 )}
 </div>
 <p className="text-sm text-gray-600">
 {benefit.description}
 </p>
 </div>
 </div>
 </motion.div>
 )
 })}
 </div>

 {}
 <div className="mt-8 text-center">
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.5, delay: 0.6 }}
 className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white"
 >
 <h3 className="text-xl font-bold mb-2">
 Ready to upgrade your experience?
 </h3>
 <p className="mb-4 opacity-90">
 Join thousands of members enjoying premium content and exclusive features
 </p>
 <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
 View Premium Plans
 </button>
 </motion.div>
 </div>
 </div>
 )
}