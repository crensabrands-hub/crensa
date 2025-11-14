'use client'

import { motion } from 'framer-motion'
import { formatCoins, formatRupees, coinsToRupees } from '@/lib/utils/coin-utils'

export interface CoinBalanceProps {
 balance: number
 size?: 'small' | 'medium' | 'large'
 showRupeeEquivalent?: boolean
 onClick?: () => void
 className?: string
 animated?: boolean
 inline?: boolean
}

export default function CoinBalance({
 balance,
 size = 'medium',
 showRupeeEquivalent = false,
 onClick,
 className = '',
 animated = true,
 inline = false
}: CoinBalanceProps) {

 const sizeStyles = {
 small: {
 container: 'gap-1',
 icon: 'text-base',
 amount: 'text-sm font-semibold',
 label: 'text-xs',
 equivalent: 'text-xs'
 },
 medium: {
 container: 'gap-1.5',
 icon: 'text-xl',
 amount: 'text-lg font-bold',
 label: 'text-sm',
 equivalent: 'text-sm'
 },
 large: {
 container: 'gap-2',
 icon: 'text-2xl',
 amount: 'text-2xl font-bold',
 label: 'text-base',
 equivalent: 'text-base'
 }
 }

 const styles = sizeStyles[size]
 const isClickable = !!onClick

 const content = inline ? (

 <span
 className={`
 inline-flex items-baseline gap-0.5
 ${isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
 ${className}
 `}
 onClick={onClick}
 role={isClickable ? 'button' : undefined}
 tabIndex={isClickable ? 0 : undefined}
 onKeyDown={isClickable ? (e) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault()
 onClick?.()
 }
 } : undefined}
 >
 <span className={`${styles.icon}`} role="img" aria-label="coins">
 🪙
 </span>
 <span className={`${styles.amount} text-gray-900`}>
 {balance.toLocaleString('en-IN')}
 </span>
 {showRupeeEquivalent && (
 <span className={`${styles.equivalent} text-gray-500 ml-1`}>
 ({formatRupees(coinsToRupees(balance))})
 </span>
 )}
 </span>
 ) : (

 <div
 className={`
 inline-flex items-center ${styles.container}
 ${isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
 ${className}
 `}
 onClick={onClick}
 role={isClickable ? 'button' : undefined}
 tabIndex={isClickable ? 0 : undefined}
 onKeyDown={isClickable ? (e) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault()
 onClick?.()
 }
 } : undefined}
 >
 {}
 <span className={`${styles.icon}`} role="img" aria-label="coins">
 🪙
 </span>

 {}
 <div className="flex flex-col">
 <div className="flex items-baseline gap-1">
 <span className={`${styles.amount} text-gray-900`}>
 {balance.toLocaleString('en-IN')}
 </span>
 <span className={`${styles.label} text-gray-600`}>
 coins
 </span>
 </div>

 {}
 {showRupeeEquivalent && (
 <span className={`${styles.equivalent} text-gray-500`}>
 {formatRupees(coinsToRupees(balance))}
 </span>
 )}
 </div>
 </div>
 )

 if (animated) {
 return (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.2 }}
 >
 {content}
 </motion.div>
 )
 }

 return content
}

export { CoinBalance }
