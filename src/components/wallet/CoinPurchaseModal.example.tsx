

'use client'

import { useState } from 'react'
import CoinPurchaseModal from './CoinPurchaseModal'
import CoinBalance from './CoinBalance'

export function BasicCoinPurchaseExample() {
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [balance, setBalance] = useState(500)

 const handlePurchaseComplete = (coins: number) => {
 setBalance(prev => prev + coins)
 console.log(`Successfully purchased ${coins} coins`)
 }

 return (
 <div className="p-6">
 <div className="mb-4">
 <CoinBalance balance={balance} size="large" showRupeeEquivalent />
 </div>
 
 <button
 onClick={() => setIsModalOpen(true)}
 className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
 >
 Purchase Coins
 </button>

 <CoinPurchaseModal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 onPurchaseComplete={handlePurchaseComplete}
 currentBalance={balance}
 />
 </div>
 )
}

export function InsufficientBalanceExample() {
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [balance, setBalance] = useState(50)
 const requiredCoins = 100

 const handlePurchase = () => {
 if (balance < requiredCoins) {
 setIsModalOpen(true)
 } else {

 console.log('Purchasing content...')
 }
 }

 const handlePurchaseComplete = (coins: number) => {
 setBalance(prev => prev + coins)

 if (balance + coins >= requiredCoins) {
 console.log('Now you can purchase the content!')
 }
 }

 return (
 <div className="p-6">
 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
 <p className="text-yellow-800 font-semibold mb-2">Insufficient Balance</p>
 <p className="text-yellow-700 text-sm mb-3">
 You need {requiredCoins} coins but only have {balance} coins
 </p>
 <CoinBalance balance={balance} size="medium" />
 </div>

 <button
 onClick={handlePurchase}
 className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
 >
 Purchase Content (100 coins)
 </button>

 <CoinPurchaseModal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 onPurchaseComplete={handlePurchaseComplete}
 currentBalance={balance}
 />
 </div>
 )
}

export function DashboardIntegrationExample() {
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [balance, setBalance] = useState(1250)
 const [recentPurchases, setRecentPurchases] = useState<number[]>([])

 const handlePurchaseComplete = (coins: number) => {
 setBalance(prev => prev + coins)
 setRecentPurchases(prev => [coins, ...prev.slice(0, 4)])
 }

 return (
 <div className="p-6 max-w-4xl mx-auto">
 <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white mb-6">
 <h2 className="text-2xl font-bold mb-4">My Wallet</h2>
 
 <div className="flex items-center justify-between">
 <div>
 <p className="text-purple-100 text-sm mb-2">Current Balance</p>
 <CoinBalance 
 balance={balance} 
 size="large" 
 showRupeeEquivalent 
 className="text-white"
 />
 </div>
 
 <button
 onClick={() => setIsModalOpen(true)}
 className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
 >
 Add Coins
 </button>
 </div>
 </div>

 {recentPurchases.length > 0 && (
 <div className="bg-white rounded-lg shadow p-6">
 <h3 className="text-lg font-semibold mb-4">Recent Purchases</h3>
 <div className="space-y-2">
 {recentPurchases.map((coins, index) => (
 <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
 <span className="text-gray-600">Coin Purchase</span>
 <span className="font-semibold text-green-600">+{coins} coins</span>
 </div>
 ))}
 </div>
 </div>
 )}

 <CoinPurchaseModal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 onPurchaseComplete={handlePurchaseComplete}
 currentBalance={balance}
 />
 </div>
 )
}

export function APIIntegrationExample() {
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [balance, setBalance] = useState(0)
 const [isLoading, setIsLoading] = useState(false)

 const fetchBalance = async () => {
 setIsLoading(true)
 try {
 const response = await fetch('/api/coins/balance')
 const data = await response.json()
 setBalance(data.balance)
 } catch (error) {
 console.error('Failed to fetch balance:', error)
 } finally {
 setIsLoading(false)
 }
 }

 const handlePurchaseComplete = async (coins: number) => {

 setBalance(prev => prev + coins)

 await fetchBalance()

 console.log(`Successfully added ${coins} coins to your wallet`)
 }

 return (
 <div className="p-6">
 <div className="bg-white rounded-lg shadow p-6 mb-4">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold">Wallet Balance</h3>
 <button
 onClick={fetchBalance}
 disabled={isLoading}
 className="text-purple-600 hover:text-purple-700 text-sm font-medium"
 >
 {isLoading ? 'Refreshing...' : 'Refresh'}
 </button>
 </div>
 
 {isLoading ? (
 <div className="animate-pulse">
 <div className="h-8 bg-gray-200 rounded w-32"></div>
 </div>
 ) : (
 <CoinBalance balance={balance} size="large" showRupeeEquivalent />
 )}
 </div>

 <button
 onClick={() => setIsModalOpen(true)}
 className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
 >
 Purchase Coins
 </button>

 <CoinPurchaseModal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 onPurchaseComplete={handlePurchaseComplete}
 currentBalance={balance}
 />
 </div>
 )
}

export function MobileResponsiveExample() {
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [balance, setBalance] = useState(750)

 const handlePurchaseComplete = (coins: number) => {
 setBalance(prev => prev + coins)
 }

 return (
 <div className="min-h-screen bg-gray-50 p-4">
 {}
 <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-xs text-gray-500 mb-1">Balance</p>
 <CoinBalance balance={balance} size="medium" />
 </div>
 <button
 onClick={() => setIsModalOpen(true)}
 className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 active:scale-95 transition-transform"
 >
 Add Coins
 </button>
 </div>
 </div>

 {}
 <div className="bg-white rounded-lg shadow-sm p-4">
 <h3 className="font-semibold mb-3">Quick Actions</h3>
 <div className="space-y-2">
 <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
 Browse Content
 </button>
 <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
 Transaction History
 </button>
 </div>
 </div>

 <CoinPurchaseModal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 onPurchaseComplete={handlePurchaseComplete}
 currentBalance={balance}
 />
 </div>
 )
}

export function CustomSuccessHandlerExample() {
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [balance, setBalance] = useState(300)
 const [showSuccessToast, setShowSuccessToast] = useState(false)

 const handlePurchaseComplete = (coins: number) => {

 setBalance(prev => prev + coins)

 setShowSuccessToast(true)
 setTimeout(() => setShowSuccessToast(false), 3000)

 console.log('Analytics: Coin purchase completed', { coins, newBalance: balance + coins })

 }

 return (
 <div className="p-6">
 {}
 {showSuccessToast && (
 <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
 <p className="font-semibold">Coins added successfully! 🎉</p>
 </div>
 )}

 <div className="mb-4">
 <CoinBalance balance={balance} size="large" showRupeeEquivalent />
 </div>

 <button
 onClick={() => setIsModalOpen(true)}
 className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
 >
 Purchase Coins
 </button>

 <CoinPurchaseModal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 onPurchaseComplete={handlePurchaseComplete}
 currentBalance={balance}
 />
 </div>
 )
}
