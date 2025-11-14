'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
 ClockIcon, 
 EyeIcon, 
 CurrencyDollarIcon,
 ChevronLeftIcon,
 ChevronRightIcon,
 PlayIcon
} from '@heroicons/react/24/outline'
import type { ViewingHistoryEntry } from '@/types'

interface ViewingHistoryProps {
 className?: string
}

export default function ViewingHistory({ className = '' }: ViewingHistoryProps) {
 const [history, setHistory] = useState<ViewingHistoryEntry[]>([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)
 const [currentPage, setCurrentPage] = useState(1)
 const [totalPages, setTotalPages] = useState(1)
 const [total, setTotal] = useState(0)

 const limit = 10

 const fetchHistory = async (page: number = 1) => {
 setLoading(true)
 setError(null)

 try {
 const response = await fetch(`/api/user/viewing-history?page=${page}&limit=${limit}`)
 
 if (!response.ok) {
 throw new Error(`HTTP ${response.status}: ${response.statusText}`)
 }

 const data = await response.json()
 setHistory(data.history)
 setTotal(data.total)
 setTotalPages(data.totalPages)
 setCurrentPage(data.page)
 } catch (err) {
 console.error('Error fetching viewing history:', err)
 setError(err instanceof Error ? err.message : 'Failed to load viewing history')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchHistory()
 }, [])

 const handlePageChange = (page: number) => {
 if (page >= 1 && page <= totalPages && page !== currentPage) {
 fetchHistory(page)
 }
 }

 const formatTime = (seconds: number) => {
 const minutes = Math.floor(seconds / 60)
 const remainingSeconds = seconds % 60
 return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
 }

 const formatDate = (date: Date) => {
 return new Intl.DateTimeFormat('en-US', {
 month: 'short',
 day: 'numeric',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit'
 }).format(new Date(date))
 }

 if (loading && history.length === 0) {
 return (
 <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
 <div className="animate-pulse space-y-4">
 <div className="h-6 bg-gray-200 rounded w-48"></div>
 {[...Array(3)].map((_, i) => (
 <div key={i} className="flex gap-4">
 <div className="w-24 h-16 bg-gray-200 rounded"></div>
 <div className="flex-1 space-y-2">
 <div className="h-4 bg-gray-200 rounded w-3/4"></div>
 <div className="h-3 bg-gray-200 rounded w-1/2"></div>
 <div className="h-3 bg-gray-200 rounded w-1/4"></div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )
 }

 if (error) {
 return (
 <div className={`bg-red-50 border border-red-200 rounded-xl p-6 ${className}`}>
 <div className="text-center">
 <p className="text-red-600 mb-4">{error}</p>
 <button
 onClick={() => fetchHistory(currentPage)}
 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
 >
 Try Again
 </button>
 </div>
 </div>
 )
 }

 return (
 <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
 {}
 <div className="p-6 border-b border-gray-200">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <ClockIcon className="w-5 h-5 text-purple-600" />
 <h2 className="text-xl font-semibold text-gray-900">Viewing History</h2>
 </div>
 <span className="text-sm text-gray-500">
 {total} video{total !== 1 ? 's' : ''} watched
 </span>
 </div>
 </div>

 {}
 <div className="p-6">
 {history.length === 0 ? (
 <div className="text-center py-12">
 <EyeIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
 <h3 className="text-lg font-medium text-gray-900 mb-2">No viewing history</h3>
 <p className="text-gray-500 mb-6">
 Start watching videos to see your viewing history here.
 </p>
 <Link
 href="/reels"
 className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
 >
 <PlayIcon className="w-4 h-4" />
 Watch Videos
 </Link>
 </div>
 ) : (
 <div className="space-y-4">
 <AnimatePresence mode="wait">
 {history.map((entry, index) => (
 <motion.div
 key={entry.id}
 className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 transition={{ delay: index * 0.1 }}
 >
 {}
 <div className="relative w-24 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
 <Image
 src={entry.video.thumbnailUrl}
 alt={entry.video.title}
 fill
 className="object-cover"
 />
 <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white px-1 py-0.5 rounded text-xs">
 {formatTime(entry.video.duration)}
 </div>
 </div>

 {}
 <div className="flex-1 min-w-0">
 <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
 {entry.video.title}
 </h3>
 <p className="text-sm text-gray-600 mb-2">
 by {entry.video.creator.displayName}
 </p>
 <div className="flex items-center gap-4 text-xs text-gray-500">
 <span>Watched {formatDate(entry.watchedAt)}</span>
 <div className="flex items-center gap-1">
 <CurrencyDollarIcon className="w-3 h-3" />
 <span>{entry.creditsCost} credits</span>
 </div>
 </div>
 </div>

 {}
 <div className="flex items-center">
 <Link
 href={`/watch/${entry.videoId}`}
 className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
 title="Watch again"
 >
 <PlayIcon className="w-5 h-5" />
 </Link>
 </div>
 </motion.div>
 ))}
 </AnimatePresence>
 </div>
 )}

 {}
 {totalPages > 1 && (
 <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
 <div className="text-sm text-gray-500">
 Page {currentPage} of {totalPages}
 </div>
 
 <div className="flex items-center gap-2">
 <button
 onClick={() => handlePageChange(currentPage - 1)}
 disabled={currentPage === 1}
 className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 <ChevronLeftIcon className="w-5 h-5" />
 </button>
 
 {}
 <div className="flex items-center gap-1">
 {[...Array(Math.min(5, totalPages))].map((_, i) => {
 const pageNum = Math.max(1, currentPage - 2) + i
 if (pageNum > totalPages) return null
 
 return (
 <button
 key={pageNum}
 onClick={() => handlePageChange(pageNum)}
 className={`w-8 h-8 text-sm rounded transition-colors ${
 pageNum === currentPage
 ? 'bg-purple-600 text-white'
 : 'text-gray-600 hover:bg-gray-100'
 }`}
 >
 {pageNum}
 </button>
 )
 })}
 </div>
 
 <button
 onClick={() => handlePageChange(currentPage + 1)}
 disabled={currentPage === totalPages}
 className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 <ChevronRightIcon className="w-5 h-5" />
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 )
}