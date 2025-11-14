'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
 XMarkIcon,
 ExclamationTriangleIcon,
 TrashIcon
} from '@heroicons/react/24/outline'
import { Video } from '@/types'

interface VideoDeleteModalProps {
 video: Video | null
 isOpen: boolean
 onClose: () => void
 onConfirm: (videoId: string) => void
}

export default function VideoDeleteModal({
 video,
 isOpen,
 onClose,
 onConfirm
}: VideoDeleteModalProps) {
 const [isDeleting, setIsDeleting] = useState(false)
 const [confirmText, setConfirmText] = useState('')

 const handleDelete = async () => {
 if (!video || confirmText !== 'DELETE') return

 setIsDeleting(true)
 
 try {
 const response = await fetch(`/api/videos/${video.id}`, {
 method: 'DELETE',
 })

 if (!response.ok) {
 const errorData = await response.json()
 throw new Error(errorData.error || 'Failed to delete video')
 }

 onConfirm(video.id)
 } catch (error) {
 console.error('Failed to delete video:', error)

 } finally {
 setIsDeleting(false)
 setConfirmText('')
 }
 }

 const handleClose = () => {
 if (!isDeleting) {
 setConfirmText('')
 onClose()
 }
 }

 if (!isOpen || !video) return null

 const isConfirmValid = confirmText === 'DELETE'

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
 onClick={handleClose}
 />

 {}
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="relative bg-white rounded-xl shadow-xl max-w-md w-full"
 >
 {}
 <div className="flex items-center justify-between p-6 border-b border-gray-200">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
 <TrashIcon className="w-5 h-5 text-red-600" />
 </div>
 <h2 className="text-xl font-semibold text-gray-900">
 Delete Video
 </h2>
 </div>
 <button
 onClick={handleClose}
 disabled={isDeleting}
 className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
 >
 <XMarkIcon className="w-6 h-6" />
 </button>
 </div>

 {}
 <div className="p-6 space-y-4">
 {}
 <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
 <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
 <div className="text-sm text-red-700">
 <p className="font-medium mb-1">This action cannot be undone!</p>
 <p>
 Deleting this video will permanently remove it from your account and make it 
 inaccessible to viewers. All associated data including views and earnings 
 history will be preserved for record-keeping.
 </p>
 </div>
 </div>

 {}
 <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
 <Image
 src={video.thumbnailUrl}
 alt={video.title}
 width={64}
 height={40}
 className="w-16 h-10 object-cover rounded"
 />
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-gray-900 truncate">
 {video.title}
 </p>
 <p className="text-xs text-gray-500">
 {video.viewCount} views • ₹{video.totalEarnings} earned
 </p>
 </div>
 </div>

 {}
 <div>
 <label htmlFor="confirm-delete" className="block text-sm font-medium text-gray-700 mb-2">
 Type <span className="font-mono bg-gray-100 px-1 rounded">DELETE</span> to confirm:
 </label>
 <input
 id="confirm-delete"
 type="text"
 value={confirmText}
 onChange={(e) => setConfirmText(e.target.value)}
 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
 placeholder="Type DELETE to confirm"
 disabled={isDeleting}
 />
 </div>

 {}
 <div className="text-sm text-gray-600 space-y-1">
 <p><strong>What will happen:</strong></p>
 <ul className="list-disc list-inside space-y-1 ml-2">
 <li>Video will be permanently deleted</li>
 <li>Viewers will no longer be able to access it</li>
 <li>Shared links will become invalid</li>
 <li>View and earnings history will be preserved</li>
 </ul>
 </div>
 </div>

 {}
 <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
 <button
 onClick={handleClose}
 disabled={isDeleting}
 className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
 >
 Cancel
 </button>
 <button
 onClick={handleDelete}
 disabled={!isConfirmValid || isDeleting}
 className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
 >
 {isDeleting ? (
 <div className="flex items-center gap-2">
 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 Deleting...
 </div>
 ) : (
 'Delete Video'
 )}
 </button>
 </div>
 </motion.div>
 </div>
 </div>
 </AnimatePresence>
 )
}