'use client'

import { formatRupees, coinsToRupees } from '@/lib/utils/coin-utils'

export interface CoinPriceProps {
 coins: number
 size?: 'small' | 'medium' | 'large'
 showRupeeEquivalent?: boolean
 className?: string
 variant?: 'default' | 'badge' | 'inline'
}

export default function CoinPrice({
 coins,
 size = 'medium',
 showRupeeEquivalent = false,
 className = '',
 variant = 'default'
}: CoinPriceProps) {

 const sizeStyles = {
 small: {
 icon: 'text-sm',
 amount: 'text-sm font-semibold',
 label: 'text-xs',
 equivalent: 'text-xs'
 },
 medium: {
 icon: 'text-base',
 amount: 'text-base font-bold',
 label: 'text-sm',
 equivalent: 'text-sm'
 },
 large: {
 icon: 'text-xl',
 amount: 'text-xl font-bold',
 label: 'text-base',
 equivalent: 'text-base'
 }
 }

 const variantStyles = {
 default: 'inline-flex items-center gap-1',
 badge: 'inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full',
 inline: 'inline-flex items-baseline gap-0.5'
 }

 const styles = sizeStyles[size]
 const variantClass = variantStyles[variant]

 return (
 <div className={`${variantClass} ${className}`}>
 {}
 <span className={`${styles.icon}`} role="img" aria-label="coins">
 🪙
 </span>

 {}
 <span className={`${styles.amount}`}>
 {coins.toLocaleString('en-IN')}
 </span>

 {}
 {variant !== 'badge' && (
 <span className={`${styles.label} text-gray-600`}>
 {variant === 'inline' ? '' : 'coins'}
 </span>
 )}

 {}
 {showRupeeEquivalent && (
 <span className={`${styles.equivalent} text-gray-500 ml-1`}>
 ({formatRupees(coinsToRupees(coins))})
 </span>
 )}
 </div>
 )
}

export { CoinPrice }
