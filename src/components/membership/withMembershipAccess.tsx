

import { ComponentType, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { LockClosedIcon, StarIcon } from '@heroicons/react/24/outline'
import { useMembershipAccess } from '@/hooks/useMembershipAccess'

interface MembershipAccessOptions {
 requirePremium?: boolean
 fallbackComponent?: ComponentType
 showUpgradePrompt?: boolean
}

interface MembershipGateProps {
 children: ReactNode
 requirePremium?: boolean
 fallbackComponent?: ComponentType
 showUpgradePrompt?: boolean
}

export function MembershipGate({
 children,
 requirePremium = true,
 fallbackComponent: FallbackComponent,
 showUpgradePrompt = true
}: MembershipGateProps) {
 const { hasAccess, isPremium, isLoading, isExpired, isExpiringSoon } = useMembershipAccess()

 if (isLoading) {
 return (
 <div className="flex items-center justify-center p-8">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
 </div>
 )
 }

 if (requirePremium && !hasAccess) {
 if (FallbackComponent) {
 return <FallbackComponent />
 }

 if (showUpgradePrompt) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="bg-white rounded-2xl border border-gray-200 p-8 text-center"
 >
 <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
 {isExpired ? (
 <LockClosedIcon className="w-10 h-10 text-white" />
 ) : (
 <StarIcon className="w-10 h-10 text-white" />
 )}
 </div>
 
 <h3 className="text-2xl font-bold text-gray-900 mb-4">
 {isExpired ? 'Membership Expired' : 'Premium Content'}
 </h3>
 
 <p className="text-gray-600 mb-6 max-w-md mx-auto">
 {isExpired
 ? 'Your premium membership has expired. Renew now to continue accessing exclusive content.'
 : 'This content is exclusively available to premium members. Upgrade now to unlock all premium features.'
 }
 </p>

 <div className="space-y-3">
 <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors">
 {isExpired ? 'Renew Membership' : 'Upgrade to Premium'}
 </button>
 
 <button className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
 View Plans & Pricing
 </button>
 </div>

 {isExpiringSoon && (
 <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
 <p className="text-sm text-yellow-700">
 Your membership expires soon. Renew now to avoid interruption.
 </p>
 </div>
 )}
 </motion.div>
 )
 }

 return null
 }

 return <>{children}</>
}

export function withMembershipAccess<P extends object>(
 WrappedComponent: ComponentType<P>,
 options: MembershipAccessOptions = {}
) {
 const {
 requirePremium = true,
 fallbackComponent,
 showUpgradePrompt = true
 } = options

 const MembershipProtectedComponent = (props: P) => {
 return (
 <MembershipGate
 requirePremium={requirePremium}
 fallbackComponent={fallbackComponent}
 showUpgradePrompt={showUpgradePrompt}
 >
 <WrappedComponent {...props} />
 </MembershipGate>
 )
 }

 MembershipProtectedComponent.displayName = `withMembershipAccess(${WrappedComponent.displayName || WrappedComponent.name})`

 return MembershipProtectedComponent
}

export function MembershipBadge({ className = '' }: { className?: string }) {
 const { isPremium, isExpired, isExpiringSoon, daysRemaining } = useMembershipAccess()

 if (!isPremium) {
 return (
 <span className={`px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium ${className}`}>
 Free
 </span>
 )
 }

 if (isExpired) {
 return (
 <span className={`px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium ${className}`}>
 Expired
 </span>
 )
 }

 if (isExpiringSoon) {
 return (
 <span className={`px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium ${className}`}>
 Expires in {daysRemaining} days
 </span>
 )
 }

 return (
 <span className={`px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-medium ${className}`}>
 Premium
 </span>
 )
}