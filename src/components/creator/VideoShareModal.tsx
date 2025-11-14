'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
 XMarkIcon,
 ShareIcon,
 ClipboardDocumentIcon,
 CheckIcon,
 QrCodeIcon,
 ChartBarIcon,
 EyeIcon,
 CursorArrowRaysIcon
} from '@heroicons/react/24/outline'
import { Video } from '@/types'

interface VideoShareModalProps {
 video: Video | null
 isOpen: boolean
 onClose: () => void
}

interface ShareData {
 shareUrl: string
 shareToken: string
 analytics: {
 clickCount: number
 viewCount: number
 conversionCount: number
 }
}

interface ShareAnalytics {
 totalAnalytics: {
 clickCount: number
 viewCount: number
 conversionCount: number
 }
 platformAnalytics: Record<string, {
 clickCount: number
 viewCount: number
 conversionCount: number
 }>
}

export default function VideoShareModal({
 video,
 isOpen,
 onClose
}: VideoShareModalProps) {
 const [shareData, setShareData] = useState<ShareData | null>(null)
 const [analytics, setAnalytics] = useState<ShareAnalytics | null>(null)
 const [copied, setCopied] = useState(false)
 const [qrCodeUrl, setQrCodeUrl] = useState('')
 const [loading, setLoading] = useState(false)
 const [showAnalytics, setShowAnalytics] = useState(false)

 const generateShareLink = useCallback(async (platform: string = 'direct') => {
 if (!video) return

 try {
 setLoading(true)
 const response = await fetch(`/api/videos/${video.id}/share`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({ platform })
 })

 if (!response.ok) {
 throw new Error('Failed to generate share link')
 }

 const data = await response.json()
 setShareData(data)

 const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.shareUrl)}`
 setQrCodeUrl(qrUrl)

 } catch (error) {
 console.error('Error generating share link:', error)
 } finally {
 setLoading(false)
 }
 }, [video])

 const fetchAnalytics = useCallback(async () => {
 if (!video) return

 try {
 const response = await fetch(`/api/videos/${video.id}/share`)
 
 if (response.ok) {
 const data = await response.json()
 setAnalytics(data)
 }
 } catch (error) {
 console.error('Error fetching analytics:', error)
 }
 }, [video])

 useEffect(() => {
 if (video && isOpen) {
 generateShareLink()
 fetchAnalytics()
 }
 }, [video, isOpen, generateShareLink, fetchAnalytics])

 const copyToClipboard = async () => {
 if (!shareData) return

 try {
 await navigator.clipboard.writeText(shareData.shareUrl)
 setCopied(true)
 setTimeout(() => setCopied(false), 2000)
 } catch (error) {
 console.error('Failed to copy to clipboard:', error)
 }
 }

 const shareVia = async (platform: string) => {
 if (!video) return

 await generateShareLink(platform)

 const text = `Check out "${video.title}" on Crensa!`
 const url = shareData?.shareUrl || ''

 const shareUrls = {
 twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
 facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
 whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
 telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
 linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
 }

 const platformUrl = shareUrls[platform as keyof typeof shareUrls]
 if (platformUrl) {
 window.open(platformUrl, '_blank', 'width=600,height=400')
 }
 }

 const formatAnalytics = (count: number) => {
 if (count >= 1000) {
 return `${(count / 1000).toFixed(1)}k`
 }
 return count.toString()
 }

 if (!isOpen || !video) return null

 return (
 <AnimatePresence>
 <div className="fixed inset-0 z-50 overflow-y-auto">
 <div className="flex min-h-screen items-center justify-center p-4">
 {}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-black bg-opacity-50"
 onClick={onClose}
 />

 {}
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="relative bg-white rounded-xl shadow-xl max-w-lg w-full"
 >
 {}
 <div className="flex items-center justify-between p-6 border-b border-gray-200">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
 <ShareIcon className="w-5 h-5 text-blue-600" />
 </div>
 <div>
 <h2 className="text-xl font-semibold text-gray-900">
 Share Video
 </h2>
 {analytics && (
 <p className="text-sm text-gray-500">
 {formatAnalytics(analytics.totalAnalytics.clickCount)} clicks • {formatAnalytics(analytics.totalAnalytics.viewCount)} views
 </p>
 )}
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={() => setShowAnalytics(!showAnalytics)}
 className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
 title="Toggle Analytics"
 >
 <ChartBarIcon className="w-5 h-5" />
 </button>
 <button
 onClick={onClose}
 className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
 >
 <XMarkIcon className="w-6 h-6" />
 </button>
 </div>
 </div>

 {}
 <div className="p-6 space-y-6">
 {}
 <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
 <Image
 src={video.thumbnailUrl}
 alt={video.title}
 width={80}
 height={48}
 className="w-20 h-12 object-cover rounded"
 />
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-gray-900 truncate">
 {video.title}
 </p>
 <p className="text-xs text-gray-500">
 {video.viewCount} views • {video.creditCost} credits
 </p>
 </div>
 </div>

 {}
 {showAnalytics && analytics && (
 <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
 <h3 className="text-sm font-medium text-purple-900 mb-3">Share Analytics</h3>
 <div className="grid grid-cols-3 gap-4">
 <div className="text-center">
 <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
 <CursorArrowRaysIcon className="w-4 h-4" />
 <span className="text-lg font-semibold">
 {formatAnalytics(analytics.totalAnalytics.clickCount)}
 </span>
 </div>
 <p className="text-xs text-purple-700">Clicks</p>
 </div>
 <div className="text-center">
 <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
 <EyeIcon className="w-4 h-4" />
 <span className="text-lg font-semibold">
 {formatAnalytics(analytics.totalAnalytics.viewCount)}
 </span>
 </div>
 <p className="text-xs text-purple-700">Views</p>
 </div>
 <div className="text-center">
 <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
 <span className="text-lg font-semibold">
 {analytics.totalAnalytics.clickCount > 0 
 ? Math.round((analytics.totalAnalytics.conversionCount / analytics.totalAnalytics.clickCount) * 100)
 : 0}%
 </span>
 </div>
 <p className="text-xs text-purple-700">Conversion</p>
 </div>
 </div>
 </div>
 )}

 {}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Share Link
 </label>
 {loading ? (
 <div className="flex items-center justify-center py-8">
 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
 </div>
 ) : shareData ? (
 <>
 <div className="flex gap-2">
 <input
 type="text"
 value={shareData.shareUrl}
 readOnly
 className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
 />
 <button
 onClick={copyToClipboard}
 className={`px-4 py-3 rounded-lg font-medium transition-colors ${
 copied
 ? 'bg-green-100 text-green-700'
 : 'bg-purple-600 text-white hover:bg-purple-700'
 }`}
 >
 {copied ? (
 <CheckIcon className="w-5 h-5" />
 ) : (
 <ClipboardDocumentIcon className="w-5 h-5" />
 )}
 </button>
 </div>
 {copied && (
 <p className="text-sm text-green-600 mt-1">
 Link copied to clipboard!
 </p>
 )}
 </>
 ) : (
 <button
 onClick={() => generateShareLink()}
 className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
 >
 Generate Share Link
 </button>
 )}
 </div>

 {}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-3">
 Share on Social Media
 </label>
 <div className="grid grid-cols-2 gap-3">
 <button
 onClick={() => shareVia('twitter')}
 className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
 >
 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
 </svg>
 Twitter
 </button>

 <button
 onClick={() => shareVia('facebook')}
 className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
 >
 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
 </svg>
 Facebook
 </button>

 <button
 onClick={() => shareVia('whatsapp')}
 className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
 >
 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
 </svg>
 WhatsApp
 </button>

 <button
 onClick={() => shareVia('telegram')}
 className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
 >
 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
 </svg>
 Telegram
 </button>
 </div>
 </div>

 {}
 {shareData && (
 <div className="text-center">
 <label className="block text-sm font-medium text-gray-700 mb-3">
 QR Code
 </label>
 <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
 {qrCodeUrl ? (
 <Image
 src={qrCodeUrl}
 alt="QR Code"
 width={128}
 height={128}
 className="w-32 h-32"
 />
 ) : (
 <div className="w-32 h-32 bg-gray-100 rounded flex items-center justify-center">
 <QrCodeIcon className="w-8 h-8 text-gray-400" />
 </div>
 )}
 </div>
 <p className="text-xs text-gray-500 mt-2">
 Scan to open video on mobile
 </p>
 </div>
 )}

 {}
 <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
 <p className="text-sm text-purple-700">
 <strong>Attribution & Revenue:</strong> When viewers access this video through your shared link, 
 they&apos;ll need to pay {video.creditCost} credits to watch it. You&apos;ll earn revenue 
 from each view with proper attribution tracking.
 </p>
 </div>
 </div>

 {}
 <div className="flex justify-end p-6 border-t border-gray-200">
 <button
 onClick={onClose}
 className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
 >
 Close
 </button>
 </div>
 </motion.div>
 </div>
 </div>
 </AnimatePresence>
 )
}