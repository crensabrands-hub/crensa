'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
 CurrencyDollarIcon, 
 ClockIcon, 
 ArrowUpIcon,
 ArrowDownIcon,
 GiftIcon,
 Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { useAuthContext } from '@/contexts/AuthContext'
import WalletBalance from '@/components/wallet/WalletBalance'
import TopUpInterface from '@/components/wallet/TopUpInterface'
import TransactionHistory from '@/components/wallet/TransactionHistory'
import RewardCoins from '@/components/wallet/RewardCoins'
import { withAuth } from '@/components/auth/withAuth'

function WalletPage() {
 const { userProfile } = useAuthContext()
 const [activeTab, setActiveTab] = useState<'overview' | 'topup' | 'history' | 'rewards'>('overview')

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

 const tabs = [
 { id: 'overview', label: 'Overview', icon: CurrencyDollarIcon },
 { id: 'topup', label: 'Top Up', icon: ArrowUpIcon },
 { id: 'history', label: 'History', icon: ClockIcon },
 { id: 'rewards', label: 'Rewards', icon: GiftIcon },
 ] as const

 return (
 <div className="min-h-screen bg-gray-50">
 <div className="max-w-6xl mx-auto px-4 py-8">
 {}
 <div className="mb-8">
 <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet</h1>
 <p className="text-gray-600">
 Manage your coins, view transaction history, and earn rewards
 </p>
 </div>

 {}
 <div className="mb-8">
 <div className="border-b border-gray-200">
 <nav className="-mb-px flex space-x-8">
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
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {}
 <div className="lg:col-span-1">
 <WalletBalance size="lg" />
 </div>

 {}
 <div className="lg:col-span-2">
 <div className="bg-white rounded-xl border border-gray-200 p-6">
 <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <button
 onClick={() => setActiveTab('topup')}
 className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
 >
 <ArrowUpIcon className="w-6 h-6 text-purple-600 mb-2" />
 <h3 className="font-medium text-gray-900">Add Coins</h3>
 <p className="text-sm text-gray-600">Top up your wallet balance</p>
 </button>
 
 <button
 onClick={() => setActiveTab('history')}
 className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
 >
 <ClockIcon className="w-6 h-6 text-purple-600 mb-2" />
 <h3 className="font-medium text-gray-900">View History</h3>
 <p className="text-sm text-gray-600">Check your transactions</p>
 </button>
 
 <button
 onClick={() => setActiveTab('rewards')}
 className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
 >
 <GiftIcon className="w-6 h-6 text-purple-600 mb-2" />
 <h3 className="font-medium text-gray-900">Earn Rewards</h3>
 <p className="text-sm text-gray-600">Get bonus coins</p>
 </button>
 
 <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
 <Cog6ToothIcon className="w-6 h-6 text-gray-400 mb-2" />
 <h3 className="font-medium text-gray-500">More Features</h3>
 <p className="text-sm text-gray-400">Coming soon</p>
 </div>
 </div>
 </div>
 </div>
 </div>
 )}

 {activeTab === 'topup' && <TopUpInterface />}
 {activeTab === 'history' && <TransactionHistory />}
 {activeTab === 'rewards' && <RewardCoins />}
 </motion.div>
 </div>
 </div>
 )
}

export default withAuth(WalletPage, { requiredRole: 'member' })