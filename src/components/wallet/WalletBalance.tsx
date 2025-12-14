'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
 CurrencyDollarIcon, 
 ArrowPathIcon,
 ExclamationTriangleIcon,
 PlusIcon
} from '@heroicons/react/24/outline'
import { useAuthContext } from '@/contexts/AuthContext'
import { useWalletBalance } from '@/hooks/useWalletBalance'
import type { WalletBalance } from '@/types'

interface WalletBalanceProps {
 onRecharge?: () => void
 showRechargeButton?: boolean
 className?: string
 size?: 'sm' | 'md' | 'lg'
}

export default function WalletBalance({
 onRecharge,
 showRechargeButton = true,
 className = '',
 size = 'md'
}: WalletBalanceProps) {
 const { userProfile } = useAuthContext()
 const { balance, isLoading, error, refreshBalance } = useWalletBalance(true)

 const sizeClasses = {
 sm: {
 container: 'p-3',
 text: 'text-sm',
 balance: 'text-lg',
 icon: 'w-4 h-4',
 button: 'px-3 py-1.5 text-sm'
 },
 md: {
 container: 'p-4',
 text: 'text-base',
 balance: 'text-xl',
 icon: 'w-5 h-5',
 button: 'px-4 py-2 text-sm'
 },
 lg: {
 container: 'p-6',
 text: 'text-lg',
 balance: 'text-2xl',
 icon: 'w-6 h-6',
 button: 'px-6 py-3 text-base'
 }
 }

 const classes = sizeClasses[size]

 const handleRefresh = () => {
 refreshBalance()
 }

 const handleRecharge = () => {
 if (onRecharge) {
 onRecharge()
 } else {

 window.location.href = '/wallet/recharge'
 }
 }

 if (!userProfile || userProfile.role !== 'member') {
 return null
 }

 if (isLoading && !balance) {
 return (
 <div className={`bg-white rounded-xl border border-gray-200 ${classes.container} ${className}`}>
 <div className="animate-pulse">
 <div className="flex items-center gap-2 mb-2">
 <div className="w-5 h-5 bg-gray-200 rounded"></div>
 <div className="h-4 bg-gray-200 rounded w-20"></div>
 </div>
 <div className="h-6 bg-gray-200 rounded w-24 mb-3"></div>
 <div className="h-8 bg-gray-200 rounded w-full"></div>
 </div>
 </div>
 )
 }

 if (error) {
 return (
 <div className={`bg-red-50 border border-red-200 rounded-xl ${classes.container} ${className}`}>
 <div className="flex items-center gap-2 text-red-600 mb-2">
 <ExclamationTriangleIcon className={classes.icon} />
 <span className={`font-medium ${classes.text}`}>Error</span>
 </div>
 <p className="text-red-700 text-sm mb-3">{error}</p>
 <button
 onClick={handleRefresh}
 className="w-full px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
 >
 Try Again
 </button>
 </div>
 )
 }

 if (!balance) {
 return null
 }

 const isLowBalance = balance.balance < 10
 const hasNoPendingTransactions = balance.pendingTransactions === 0

 return (
 <motion.div
 className={`bg-white rounded-xl border border-gray-200 ${classes.container} ${className}`}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 >
 {}
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center gap-2">
 <CurrencyDollarIcon className={`${classes.icon} text-purple-600`} />
 <span className={`font-medium text-gray-700 ${classes.text}`}>
 Wallet Balance
 </span>
 </div>
 
 <button
 onClick={handleRefresh}
 disabled={isLoading}
 className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
 title="Refresh balance"
 >
 <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
 </button>
 </div>

 {}
 <div className="mb-4">
 <motion.div
 key={balance.balance}
 className={`font-bold text-gray-900 ${classes.balance}`}
 initial={{ scale: 1.1, color: '#10b981' }}
 animate={{ scale: 1, color: '#111827' }}
 transition={{ duration: 0.3 }}
 >
 {balance.balance.toLocaleString()} coins
 </motion.div>
 
 <p className="text-gray-500 text-xs mt-1">
 Last updated: {new Date(balance.lastUpdated).toLocaleTimeString()}
 </p>
 </div>

 {}
 <AnimatePresence>
 {balance.pendingTransactions > 0 && (
 <motion.div
 className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg"
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 >
 <p className="text-yellow-700 text-xs">
 {balance.pendingTransactions} pending transaction(s)
 </p>
 </motion.div>
 )}
 </AnimatePresence>

 {}
 <AnimatePresence>
 {isLowBalance && hasNoPendingTransactions && (
 <motion.div
 className="mb-4 p-2 bg-orange-50 border border-orange-200 rounded-lg"
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 >
 <p className="text-orange-700 text-xs">
 Low balance! Consider recharging to continue watching videos.
 </p>
 </motion.div>
 )}
 </AnimatePresence>

 {}
 {showRechargeButton && (
 <button
 onClick={handleRecharge}
 className={`w-full bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 ${classes.button}`}
 >
 <PlusIcon className="w-4 h-4" />
 Recharge Wallet
 </button>
 )}
 </motion.div>
 )
}