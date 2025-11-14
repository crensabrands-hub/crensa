'use client'

import { useState, useEffect } from 'react'
import {
 coinsToRupees,
 formatRupees,
 validateCoinPrice,
 getCoinPriceErrorMessage,
 MIN_COIN_PRICE,
 MAX_COIN_PRICE
} from '@/lib/utils/coin-utils'

export interface CoinInputProps {
 value: number
 onChange: (value: number) => void
 min?: number
 max?: number
 showRupeeEquivalent?: boolean
 error?: string
 disabled?: boolean
 placeholder?: string
 className?: string
 label?: string
 required?: boolean
}

export default function CoinInput({
 value,
 onChange,
 min = MIN_COIN_PRICE,
 max = MAX_COIN_PRICE,
 showRupeeEquivalent = true,
 error,
 disabled = false,
 placeholder = 'Enter coin amount',
 className = '',
 label = 'Coin Price',
 required = false
}: CoinInputProps) {
 const [inputValue, setInputValue] = useState(value.toString())
 const [internalError, setInternalError] = useState<string>('')

 useEffect(() => {
 setInputValue(value.toString())
 }, [value])

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const rawValue = e.target.value

 if (rawValue === '') {
 setInputValue('')
 setInternalError('')
 return
 }

 if (!/^\d+$/.test(rawValue)) {
 return
 }

 const numValue = parseInt(rawValue, 10)

 setInputValue(rawValue)

 if (isNaN(numValue)) {
 setInternalError('Please enter a valid number')
 return
 }

 if (numValue < min) {
 setInternalError(`Minimum is ${min} coin${min > 1 ? 's' : ''} (${formatRupees(coinsToRupees(min))})`)
 } else if (numValue > max) {
 setInternalError(`Maximum is ${max.toLocaleString('en-IN')} coins (${formatRupees(coinsToRupees(max))})`)
 } else {
 setInternalError('')
 onChange(numValue)
 }
 }

 const handleBlur = () => {

 if (inputValue === '') {
 setInputValue('0')
 onChange(0)
 return
 }

 const numValue = parseInt(inputValue, 10)

 if (numValue < min) {
 setInputValue(min.toString())
 onChange(min)
 setInternalError('')
 } else if (numValue > max) {
 setInputValue(max.toString())
 onChange(max)
 setInternalError('')
 }
 }

 const displayError = error || internalError
 const hasError = !!displayError
 const numericValue = parseInt(inputValue, 10) || 0
 const rupeeEquivalent = coinsToRupees(numericValue)

 return (
 <div className={`w-full ${className}`}>
 {}
 {label && (
 <label className="block text-sm font-medium text-gray-700 mb-1">
 {label}
 {required && <span className="text-red-500 ml-1">*</span>}
 </label>
 )}

 {}
 <div className="relative">
 {}
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <span className="text-xl" role="img" aria-label="coins">
 🪙
 </span>
 </div>

 {}
 <input
 type="text"
 inputMode="numeric"
 value={inputValue}
 onChange={handleInputChange}
 onBlur={handleBlur}
 disabled={disabled}
 placeholder={placeholder}
 className={`
 block w-full pl-12 pr-20 py-2.5 
 border rounded-lg
 text-base font-medium
 transition-colors
 ${hasError 
 ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
 : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
 }
 ${disabled 
 ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
 : 'bg-white text-gray-900'
 }
 focus:outline-none focus:ring-2 focus:ring-opacity-50
 `}
 aria-invalid={hasError}
 aria-describedby={hasError ? 'coin-input-error' : showRupeeEquivalent ? 'coin-input-equivalent' : undefined}
 />

 {}
 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
 <span className="text-sm text-gray-500 font-medium">
 coins
 </span>
 </div>
 </div>

 {}
 {showRupeeEquivalent && !hasError && inputValue !== '' && numericValue > 0 && (
 <div 
 id="coin-input-equivalent"
 className="mt-1.5 text-sm text-gray-600 flex items-center gap-1"
 >
 <span className="font-medium">Rupee equivalent:</span>
 <span className="font-semibold text-gray-900">
 {formatRupees(rupeeEquivalent)}
 </span>
 </div>
 )}

 {}
 {hasError && (
 <div 
 id="coin-input-error"
 className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
 role="alert"
 >
 <svg 
 className="w-4 h-4 flex-shrink-0" 
 fill="currentColor" 
 viewBox="0 0 20 20"
 aria-hidden="true"
 >
 <path 
 fillRule="evenodd" 
 d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
 clipRule="evenodd" 
 />
 </svg>
 <span>{displayError}</span>
 </div>
 )}

 {}
 {!hasError && !showRupeeEquivalent && (
 <div className="mt-1.5 text-xs text-gray-500">
 Valid range: {min.toLocaleString('en-IN')} - {max.toLocaleString('en-IN')} coins
 </div>
 )}
 </div>
 )
}
