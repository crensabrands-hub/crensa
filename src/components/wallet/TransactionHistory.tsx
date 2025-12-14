'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
 ArrowUpIcon,
 ArrowDownIcon,
 FunnelIcon,
 CalendarIcon,
 MagnifyingGlassIcon,
 ChevronDownIcon,
 ExclamationTriangleIcon,
 ClockIcon
} from '@heroicons/react/24/outline'
import { useAuthContext } from '@/contexts/AuthContext'

interface Transaction {
 id: string
 type: 'credit_purchase' | 'video_view' | 'creator_earning'
 amount: number
 status: 'pending' | 'completed' | 'failed'
 createdAt: string
 videoId?: string
 video?: {
 id: string
 title: string
 }
 razorpayPaymentId?: string
 metadata?: any
}

interface TransactionFilters {
 type?: 'all' | 'credit_purchase' | 'video_view'
 status?: 'all' | 'pending' | 'completed' | 'failed'
 dateRange?: 'all' | 'today' | 'week' | 'month' | 'custom'
 startDate?: string
 endDate?: string
}

const transactionTypes = [
 { value: 'all', label: 'All Transactions' },
 { value: 'credit_purchase', label: 'Coin Purchases' },
 { value: 'video_view', label: 'Video Views' }
]

const statusOptions = [
 { value: 'all', label: 'All Status' },
 { value: 'completed', label: 'Completed' },
 { value: 'pending', label: 'Pending' },
 { value: 'failed', label: 'Failed' }
]

const dateRanges = [
 { value: 'all', label: 'All Time' },
 { value: 'today', label: 'Today' },
 { value: 'week', label: 'This Week' },
 { value: 'month', label: 'This Month' },
 { value: 'custom', label: 'Custom Range' }
]

export default function TransactionHistory() {
 const { userProfile } = useAuthContext()
 const [transactions, setTransactions] = useState<Transaction[]>([])
 const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)
 const [filters, setFilters] = useState<TransactionFilters>({
 type: 'all',
 status: 'all',
 dateRange: 'all'
 })
 const [showFilters, setShowFilters] = useState(false)
 const [searchQuery, setSearchQuery] = useState('')
 const [currentPage, setCurrentPage] = useState(1)
 const [totalPages, setTotalPages] = useState(1)
 const itemsPerPage = 20

 const fetchTransactions = useCallback(async () => {
 if (!userProfile?.id) return

 setIsLoading(true)
 setError(null)

 try {
 const params = new URLSearchParams({
 page: currentPage.toString(),
 limit: itemsPerPage.toString()
 })

 if (filters.type && filters.type !== 'all') {
 params.append('type', filters.type)
 }
 if (filters.status && filters.status !== 'all') {
 params.append('status', filters.status)
 }
 if (filters.startDate) {
 params.append('startDate', filters.startDate)
 }
 if (filters.endDate) {
 params.append('endDate', filters.endDate)
 }

 const response = await fetch(`/api/wallet/transactions?${params}`)
 
 if (!response.ok) {
 throw new Error(`HTTP ${response.status}: ${response.statusText}`)
 }

 const data = await response.json()
 setTransactions(data.transactions || [])
 setTotalPages(Math.ceil((data.total || 0) / itemsPerPage))
 } catch (err) {
 console.error('Error fetching transactions:', err)
 setError(err instanceof Error ? err.message : 'Failed to load transactions')
 } finally {
 setIsLoading(false)
 }
 }, [userProfile?.id, currentPage, filters])

 useEffect(() => {
 let filtered = transactions

 if (searchQuery.trim()) {
 const query = searchQuery.toLowerCase()
 filtered = transactions.filter(transaction => 
 transaction.id.toLowerCase().includes(query) ||
 transaction.video?.title.toLowerCase().includes(query) ||
 transaction.razorpayPaymentId?.toLowerCase().includes(query)
 )
 }

 setFilteredTransactions(filtered)
 }, [transactions, searchQuery])

 useEffect(() => {
 fetchTransactions()
 }, [fetchTransactions])

 const handleDateRangeChange = (range: string) => {
 const now = new Date()
 let startDate = ''
 let endDate = ''

 switch (range) {
 case 'today':
 startDate = now.toISOString().split('T')[0]
 endDate = startDate
 break
 case 'week':
 const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
 startDate = weekStart.toISOString().split('T')[0]
 endDate = new Date().toISOString().split('T')[0]
 break
 case 'month':
 startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
 endDate = new Date().toISOString().split('T')[0]
 break
 default:
 startDate = ''
 endDate = ''
 }

 setFilters(prev => ({
 ...prev,
 dateRange: range as any,
 startDate,
 endDate
 }))
 setCurrentPage(1)
 }

 const getTransactionIcon = (type: string, amount: number) => {
 if (type === 'credit_purchase') {
 return <ArrowUpIcon className="w-5 h-5 text-green-600" />
 } else if (type === 'video_view') {
 return <ArrowDownIcon className="w-5 h-5 text-red-600" />
 }
 return <ClockIcon className="w-5 h-5 text-gray-600" />
 }

 const getStatusBadge = (status: string) => {
 const styles = {
 completed: 'bg-green-100 text-green-800',
 pending: 'bg-yellow-100 text-yellow-800',
 failed: 'bg-red-100 text-red-800'
 }

 return (
 <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
 {status.charAt(0).toUpperCase() + status.slice(1)}
 </span>
 )
 }

 const formatTransactionDescription = (transaction: Transaction) => {
 switch (transaction.type) {
 case 'credit_purchase':
 return 'Coin Purchase'
 case 'video_view':
 return transaction.video?.title ? `Watched: ${transaction.video.title}` : 'Video View'
 default:
 return 'Transaction'
 }
 }

 if (isLoading && transactions.length === 0) {
 return (
 <div className="bg-white rounded-xl border border-gray-200 p-8">
 <div className="animate-pulse space-y-4">
 {[...Array(5)].map((_, i) => (
 <div key={i} className="flex items-center space-x-4">
 <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
 <div className="flex-1 space-y-2">
 <div className="h-4 bg-gray-200 rounded w-3/4"></div>
 <div className="h-3 bg-gray-200 rounded w-1/2"></div>
 </div>
 <div className="h-4 bg-gray-200 rounded w-20"></div>
 </div>
 ))}
 </div>
 </div>
 )
 }

 if (error) {
 return (
 <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
 <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
 <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Transactions</h3>
 <p className="text-gray-600 mb-4">{error}</p>
 <button
 onClick={fetchTransactions}
 className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
 >
 Try Again
 </button>
 </div>
 )
 }

 return (
 <div className="space-y-6">
 {}
 <div className="bg-white rounded-xl border border-gray-200 p-6">
 <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
 <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
 
 <div className="flex gap-2">
 <button
 onClick={() => setShowFilters(!showFilters)}
 className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
 >
 <FunnelIcon className="w-4 h-4" />
 Filters
 <ChevronDownIcon className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
 </button>
 </div>
 </div>

 {}
 <div className="relative mb-4">
 <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search transactions..."
 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
 />
 </div>

 {}
 <AnimatePresence>
 {showFilters && (
 <motion.div
 className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200"
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 >
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
 <select
 value={filters.type}
 onChange={(e) => {
 setFilters(prev => ({ ...prev, type: e.target.value as any }))
 setCurrentPage(1)
 }}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
 >
 {transactionTypes.map(type => (
 <option key={type.value} value={type.value}>{type.label}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
 <select
 value={filters.status}
 onChange={(e) => {
 setFilters(prev => ({ ...prev, status: e.target.value as any }))
 setCurrentPage(1)
 }}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
 >
 {statusOptions.map(status => (
 <option key={status.value} value={status.value}>{status.label}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
 <select
 value={filters.dateRange}
 onChange={(e) => handleDateRangeChange(e.target.value)}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
 >
 {dateRanges.map(range => (
 <option key={range.value} value={range.value}>{range.label}</option>
 ))}
 </select>
 </div>

 {filters.dateRange === 'custom' && (
 <>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
 <input
 type="date"
 value={filters.startDate || ''}
 onChange={(e) => {
 setFilters(prev => ({ ...prev, startDate: e.target.value }))
 setCurrentPage(1)
 }}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
 <input
 type="date"
 value={filters.endDate || ''}
 onChange={(e) => {
 setFilters(prev => ({ ...prev, endDate: e.target.value }))
 setCurrentPage(1)
 }}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
 />
 </div>
 </>
 )}
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {}
 <div className="bg-white rounded-xl border border-gray-200">
 {filteredTransactions.length === 0 ? (
 <div className="p-8 text-center">
 <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
 <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
 <p className="text-gray-600">
 {searchQuery ? 'Try adjusting your search or filters.' : 'You haven\'t made any transactions yet.'}
 </p>
 </div>
 ) : (
 <div className="divide-y divide-gray-200">
 {filteredTransactions.map((transaction) => (
 <motion.div
 key={transaction.id}
 className="p-6 hover:bg-gray-50 transition-colors"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ duration: 0.2 }}
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
 {getTransactionIcon(transaction.type, transaction.amount)}
 </div>
 
 <div>
 <h3 className="font-medium text-gray-900">
 {formatTransactionDescription(transaction)}
 </h3>
 <div className="flex items-center gap-2 mt-1">
 <p className="text-sm text-gray-600">
 {new Date(transaction.createdAt).toLocaleDateString('en-US', {
 year: 'numeric',
 month: 'short',
 day: 'numeric',
 hour: '2-digit',
 minute: '2-digit'
 })}
 </p>
 {getStatusBadge(transaction.status)}
 </div>
 </div>
 </div>

 <div className="text-right">
 <div className={`font-semibold ${
 transaction.type === 'credit_purchase' ? 'text-green-600' : 'text-red-600'
 }`}>
 {transaction.type === 'credit_purchase' ? '+' : '-'}{transaction.amount} coins
 </div>
 {transaction.razorpayPaymentId && (
 <p className="text-xs text-gray-500 mt-1">
 ID: {transaction.razorpayPaymentId.slice(-8)}
 </p>
 )}
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 )}

 {}
 {totalPages > 1 && (
 <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
 <div className="text-sm text-gray-600">
 Page {currentPage} of {totalPages}
 </div>
 
 <div className="flex gap-2">
 <button
 onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
 disabled={currentPage === 1}
 className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 Previous
 </button>
 <button
 onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
 disabled={currentPage === totalPages}
 className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 Next
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 )
}