'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
 LockClosedIcon,
 PlayIcon,
 CalendarIcon,
 UserIcon,
 ClockIcon,
 StarIcon,
 EyeIcon
} from '@heroicons/react/24/outline'
import { useAuthContext, type MemberProfile } from '@/contexts/AuthContext'
import type { ExclusiveContent } from '@/types'

export default function ExclusiveContentSection() {
 const { userProfile } = useAuthContext()
 const [exclusiveContent, setExclusiveContent] = useState<ExclusiveContent[]>([])
 const [loading, setLoading] = useState(true)
 const [selectedCategory, setSelectedCategory] = useState<'all' | 'video' | 'series' | 'live_event'>('all')

 const isCurrentlyPremium = userProfile?.role === 'member' && (userProfile as MemberProfile).membershipStatus === 'premium'

 useEffect(() => {
 const fetchExclusiveContent = async () => {
 if (!userProfile) {
 setLoading(false)
 return
 }

 try {
 const response = await fetch(`/api/membership/exclusive-content/${userProfile.id}`)
 if (response.ok) {
 const content = await response.json()
 setExclusiveContent(content.map((item: any) => ({
 ...item,
 releaseDate: new Date(item.releaseDate)
 })))
 } else {
 console.error('Failed to fetch exclusive content')
 setExclusiveContent([])
 }
 } catch (error) {
 console.error('Error fetching exclusive content:', error)
 setExclusiveContent([])
 } finally {
 setLoading(false)
 }
 }

 fetchExclusiveContent()
 }, [userProfile])

 const filteredContent = exclusiveContent.filter(content => 
 selectedCategory === 'all' || content.type === selectedCategory
 )

 const categories = [
 { id: 'all', label: 'All Content', count: exclusiveContent.length },
 { id: 'video', label: 'Videos', count: exclusiveContent.filter(c => c.type === 'video').length },
 { id: 'series', label: 'Series', count: exclusiveContent.filter(c => c.type === 'series').length },
 { id: 'live_event', label: 'Live Events', count: exclusiveContent.filter(c => c.type === 'live_event').length },
 ] as const

 const getTypeIcon = (type: ExclusiveContent['type']) => {
 switch (type) {
 case 'video':
 return PlayIcon
 case 'series':
 return EyeIcon
 case 'live_event':
 return CalendarIcon
 default:
 return PlayIcon
 }
 }

 const getTypeColor = (type: ExclusiveContent['type']) => {
 switch (type) {
 case 'video':
 return 'bg-blue-100 text-blue-800'
 case 'series':
 return 'bg-purple-100 text-purple-800'
 case 'live_event':
 return 'bg-red-100 text-red-800'
 default:
 return 'bg-gray-100 text-gray-800'
 }
 }

 if (loading) {
 return (
 <div className="bg-white rounded-2xl border border-gray-200 p-8">
 <div className="animate-pulse">
 <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
 <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {[...Array(6)].map((_, i) => (
 <div key={i} className="space-y-4">
 <div className="h-48 bg-gray-200 rounded-lg"></div>
 <div className="h-4 bg-gray-200 rounded w-3/4"></div>
 <div className="h-3 bg-gray-200 rounded w-1/2"></div>
 </div>
 ))}
 </div>
 </div>
 </div>
 )
 }

 return (
 <div className="bg-white rounded-2xl border border-gray-200 p-8">
 <div className="text-center mb-8">
 <h2 className="text-2xl font-bold text-gray-900 mb-2">
 Exclusive Premium Content
 </h2>
 <p className="text-gray-600">
 Access premium shows, series, and live events available only to premium members
 </p>
 </div>

 {}
 <div className="flex flex-wrap justify-center gap-2 mb-8">
 {categories.map((category) => (
 <button
 key={category.id}
 onClick={() => setSelectedCategory(category.id)}
 className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
 selectedCategory === category.id
 ? 'bg-purple-600 text-white'
 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
 }`}
 >
 {category.label} ({category.count})
 </button>
 ))}
 </div>

 {}
 {filteredContent.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {filteredContent.map((content, index) => {
 const TypeIcon = getTypeIcon(content.type)
 
 return (
 <motion.div
 key={content.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, delay: index * 0.1 }}
 className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
 >
 {}
 <div className="relative aspect-video bg-gray-200 overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
 
 {}
 {!isCurrentlyPremium && (
 <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
 <div className="text-center text-white">
 <LockClosedIcon className="w-12 h-12 mx-auto mb-2" />
 <p className="text-sm font-medium">Premium Only</p>
 </div>
 </div>
 )}

 {}
 <div className="absolute inset-0 flex items-center justify-center z-15">
 <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
 <PlayIcon className="w-8 h-8 text-white ml-1" />
 </div>
 </div>

 {}
 <div className="absolute top-3 left-3 z-20">
 <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getTypeColor(content.type)}`}>
 <TypeIcon className="w-3 h-3" />
 {content.type.replace('_', ' ')}
 </span>
 </div>

 {}
 {content.isNew && (
 <div className="absolute top-3 right-3 z-20">
 <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium flex items-center gap-1">
 <StarIcon className="w-3 h-3" />
 New
 </span>
 </div>
 )}
 </div>

 {}
 <div className="p-4">
 <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
 {content.title}
 </h3>
 <p className="text-sm text-gray-600 mb-3 line-clamp-2">
 {content.description}
 </p>

 {}
 <div className="flex items-center gap-2 mb-3">
 <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
 <UserIcon className="w-4 h-4 text-gray-600" />
 </div>
 <span className="text-sm text-gray-700">
 {content.creator.displayName}
 </span>
 </div>

 {}
 <div className="flex items-center gap-2 text-xs text-gray-500">
 <ClockIcon className="w-4 h-4" />
 <span>
 Released {content.releaseDate.toLocaleDateString()}
 </span>
 </div>

 {}
 <div className="mt-4">
 {isCurrentlyPremium ? (
 <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors">
 Watch Now
 </button>
 ) : (
 <button className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-lg font-medium cursor-not-allowed">
 Upgrade to Premium
 </button>
 )}
 </div>
 </div>
 </motion.div>
 )
 })}
 </div>
 ) : (
 <div className="text-center py-12">
 <LockClosedIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
 <h3 className="text-lg font-medium text-gray-900 mb-2">
 No exclusive content found
 </h3>
 <p className="text-gray-600">
 Try selecting a different category or check back later for new content.
 </p>
 </div>
 )}

 {}
 {!isCurrentlyPremium && (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, delay: 0.3 }}
 className="mt-8 p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white text-center"
 >
 <LockClosedIcon className="w-12 h-12 mx-auto mb-4" />
 <h3 className="text-xl font-bold mb-2">
 Unlock All Exclusive Content
 </h3>
 <p className="mb-4 opacity-90">
 Upgrade to premium to access all exclusive videos, series, and live events
 </p>
 <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
 Upgrade to Premium
 </button>
 </motion.div>
 )}
 </div>
 )
}