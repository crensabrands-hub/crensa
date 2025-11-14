'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
 StarIcon,
 ShieldCheckIcon,
 BoltIcon
} from '@heroicons/react/24/outline'
import { useAuthContext } from '@/contexts/AuthContext'
import { withAuth } from '@/components/auth/withAuth'
import type { MembershipBenefit } from '@/types'
import { ExclusiveContentSection, MembershipBenefits, MembershipPlans, MembershipStatus } from '@/components/membership'

function MembershipPage() {
 const { userProfile } = useAuthContext()
 const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'exclusive' | 'status'>('overview')

 if (!userProfile || userProfile.role !== 'member') {
 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center">
 <div className="text-center">
 <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
 <p className="text-gray-600">This page is only available for members.</p>
 </div>
 </div>
 )
 }

 const membershipBenefits: MembershipBenefit[] = [
 {
 icon: 'crown',
 title: 'Exclusive Content Access',
 description: 'Get access to premium shows and creator content not available to free users',
 isPremiumOnly: true
 },
 {
 icon: 'bolt',
 title: 'Priority Support',
 description: 'Get faster response times and dedicated customer support',
 isPremiumOnly: true
 },
 {
 icon: 'star',
 title: 'Early Access',
 description: 'Watch new shows and content before they are released to the public',
 isPremiumOnly: true
 },
 {
 icon: 'shield',
 title: 'Ad-Free Experience',
 description: 'Enjoy uninterrupted viewing without any advertisements',
 isPremiumOnly: true
 },
 {
 icon: 'heart',
 title: 'Creator Interaction',
 description: 'Direct messaging and exclusive interaction opportunities with creators',
 isPremiumOnly: true
 },
 {
 icon: 'clock',
 title: 'Unlimited Viewing History',
 description: 'Keep track of all your watched content with unlimited history storage'
 }
 ]

 const tabs = [
 { id: 'overview', label: 'Overview', icon: StarIcon },
 { id: 'plans', label: 'Plans', icon: StarIcon },
 { id: 'exclusive', label: 'Exclusive Content', icon: BoltIcon },
 { id: 'status', label: 'My Status', icon: ShieldCheckIcon },
 ] as const

 return (
 <div className="min-h-screen bg-gray-50">
 <div className="max-w-6xl mx-auto px-4 py-8">
 {}
 <div className="text-center mb-12">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 >
 <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
 <StarIcon className="w-10 h-10 text-white" />
 </div>
 <h1 className="text-4xl font-bold text-gray-900 mb-4">
 Crensa Premium Membership
 </h1>
 <p className="text-xl text-gray-600 max-w-2xl mx-auto">
 Unlock exclusive content, get priority support, and enjoy an ad-free experience with our premium membership
 </p>
 </motion.div>
 </div>

 {}
 <div className="mb-8">
 <div className="border-b border-gray-200">
 <nav className="-mb-px flex space-x-8 justify-center">
 {tabs.map((tab) => {
 const Icon = tab.icon
 return (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
 activeTab === tab.id
 ? 'border-purple-500 text-purple-600'
 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
 }`}
 >
 <Icon className="w-5 h-5" />
 {tab.label}
 </button>
 )
 })}
 </nav>
 </div>
 </div>

 {}
 <motion.div
 key={activeTab}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 >
 {activeTab === 'overview' && (
 <div className="space-y-12">
 <MembershipBenefits benefits={membershipBenefits} />
 <MembershipPlans showComparison={true} />
 </div>
 )}

 {activeTab === 'plans' && <MembershipPlans showComparison={false} />}
 {activeTab === 'exclusive' && <ExclusiveContentSection />}
 {activeTab === 'status' && <MembershipStatus />}
 </motion.div>
 </div>
 </div>
 )
}

export default withAuth(MembershipPage, { requiredRole: 'member' })