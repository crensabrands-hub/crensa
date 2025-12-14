'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
 GiftIcon,
 SparklesIcon,
 CalendarIcon,
 UserGroupIcon,
 PlayIcon,
 ShareIcon,
 CheckCircleIcon,
 ClockIcon,
 StarIcon
} from '@heroicons/react/24/outline'
import { useAuthContext } from '@/contexts/AuthContext'

interface RewardTask {
 id: string
 title: string
 description: string
 reward: number
 type: 'daily' | 'weekly' | 'achievement' | 'referral'
 icon: any
 completed: boolean
 progress?: {
 current: number
 target: number
 }
 expiresAt?: Date
 completedAt?: Date
}

interface RewardStats {
 totalEarned: number
 availableToday: number
 streakDays: number
 completedTasks: number
}

const rewardTasks: RewardTask[] = [
 {
 id: 'daily-login',
 title: 'Daily Login',
 description: 'Log in to the app every day',
 reward: 5,
 type: 'daily',
 icon: CalendarIcon,
 completed: true,
 completedAt: new Date()
 },
 {
 id: 'watch-videos',
 title: 'Watch 3 Videos',
 description: 'Watch at least 3 videos today',
 reward: 10,
 type: 'daily',
 icon: PlayIcon,
 completed: false,
 progress: {
 current: 1,
 target: 3
 }
 },
 {
 id: 'share-video',
 title: 'Share a Video',
 description: 'Share any video with friends',
 reward: 8,
 type: 'daily',
 icon: ShareIcon,
 completed: false
 },
 {
 id: 'weekly-streak',
 title: '7-Day Login Streak',
 description: 'Log in for 7 consecutive days',
 reward: 50,
 type: 'weekly',
 icon: StarIcon,
 completed: false,
 progress: {
 current: 3,
 target: 7
 }
 },
 {
 id: 'first-purchase',
 title: 'First Purchase',
 description: 'Make your first coin purchase',
 reward: 25,
 type: 'achievement',
 icon: GiftIcon,
 completed: false
 },
 {
 id: 'refer-friend',
 title: 'Refer a Friend',
 description: 'Invite a friend to join Crensa',
 reward: 100,
 type: 'referral',
 icon: UserGroupIcon,
 completed: false
 }
]

export default function RewardCoins() {
 const { userProfile } = useAuthContext()
 const [tasks, setTasks] = useState<RewardTask[]>(rewardTasks)
 const [stats, setStats] = useState<RewardStats>({
 totalEarned: 125,
 availableToday: 23,
 streakDays: 3,
 completedTasks: 8
 })
 const [selectedTask, setSelectedTask] = useState<RewardTask | null>(null)
 const [isClaimingReward, setIsClaimingReward] = useState(false)

 const handleClaimReward = async (taskId: string) => {
 setIsClaimingReward(true)

 await new Promise(resolve => setTimeout(resolve, 1000))
 
 setTasks(prev => prev.map(task => 
 task.id === taskId 
 ? { ...task, completed: true, completedAt: new Date() }
 : task
 ))
 
 const task = tasks.find(t => t.id === taskId)
 if (task) {
 setStats(prev => ({
 ...prev,
 totalEarned: prev.totalEarned + task.reward,
 completedTasks: prev.completedTasks + 1
 }))
 }
 
 setIsClaimingReward(false)
 setSelectedTask(null)
 }

 const getTaskTypeColor = (type: string) => {
 const colors = {
 daily: 'bg-blue-100 text-blue-800',
 weekly: 'bg-purple-100 text-purple-800',
 achievement: 'bg-yellow-100 text-yellow-800',
 referral: 'bg-green-100 text-green-800'
 }
 return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
 }

 const getTaskTypeLabel = (type: string) => {
 const labels = {
 daily: 'Daily',
 weekly: 'Weekly',
 achievement: 'Achievement',
 referral: 'Referral'
 }
 return labels[type as keyof typeof labels] || type
 }

 const dailyTasks = tasks.filter(task => task.type === 'daily')
 const weeklyTasks = tasks.filter(task => task.type === 'weekly')
 const achievementTasks = tasks.filter(task => task.type === 'achievement')
 const referralTasks = tasks.filter(task => task.type === 'referral')

 return (
 <div className="space-y-8">
 {}
 <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
 <SparklesIcon className="w-6 h-6" />
 </div>
 <div>
 <h2 className="text-2xl font-bold">Reward Center</h2>
 <p className="text-purple-100">Complete tasks to earn bonus coins</p>
 </div>
 </div>

 {}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="bg-white bg-opacity-10 rounded-lg p-4">
 <div className="text-2xl font-bold">{stats.totalEarned}</div>
 <div className="text-sm text-purple-100">Total Earned</div>
 </div>
 <div className="bg-white bg-opacity-10 rounded-lg p-4">
 <div className="text-2xl font-bold">{stats.availableToday}</div>
 <div className="text-sm text-purple-100">Available Today</div>
 </div>
 <div className="bg-white bg-opacity-10 rounded-lg p-4">
 <div className="text-2xl font-bold">{stats.streakDays}</div>
 <div className="text-sm text-purple-100">Day Streak</div>
 </div>
 <div className="bg-white bg-opacity-10 rounded-lg p-4">
 <div className="text-2xl font-bold">{stats.completedTasks}</div>
 <div className="text-sm text-purple-100">Tasks Done</div>
 </div>
 </div>
 </div>

 {}
 <div className="bg-white rounded-xl border border-gray-200 p-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
 <CalendarIcon className="w-5 h-5 text-blue-600" />
 Daily Tasks
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {dailyTasks.map((task) => (
 <TaskCard
 key={task.id}
 task={task}
 onClaim={() => handleClaimReward(task.id)}
 onSelect={() => setSelectedTask(task)}
 isClaimingReward={isClaimingReward}
 />
 ))}
 </div>
 </div>

 {}
 <div className="bg-white rounded-xl border border-gray-200 p-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
 <StarIcon className="w-5 h-5 text-purple-600" />
 Weekly Challenges
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {weeklyTasks.map((task) => (
 <TaskCard
 key={task.id}
 task={task}
 onClaim={() => handleClaimReward(task.id)}
 onSelect={() => setSelectedTask(task)}
 isClaimingReward={isClaimingReward}
 />
 ))}
 </div>
 </div>

 {}
 <div className="bg-white rounded-xl border border-gray-200 p-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
 <GiftIcon className="w-5 h-5 text-yellow-600" />
 Achievements
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {achievementTasks.map((task) => (
 <TaskCard
 key={task.id}
 task={task}
 onClaim={() => handleClaimReward(task.id)}
 onSelect={() => setSelectedTask(task)}
 isClaimingReward={isClaimingReward}
 />
 ))}
 </div>
 </div>

 {}
 <div className="bg-white rounded-xl border border-gray-200 p-6">
 <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
 <UserGroupIcon className="w-5 h-5 text-green-600" />
 Referral Program
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {referralTasks.map((task) => (
 <TaskCard
 key={task.id}
 task={task}
 onClaim={() => handleClaimReward(task.id)}
 onSelect={() => setSelectedTask(task)}
 isClaimingReward={isClaimingReward}
 />
 ))}
 </div>
 
 <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
 <h4 className="font-medium text-green-900 mb-2">How Referrals Work</h4>
 <ul className="text-sm text-green-700 space-y-1">
 <li>• Share your unique referral code with friends</li>
 <li>• They sign up and make their first purchase</li>
 <li>• You both get 100 bonus coins!</li>
 </ul>
 <div className="mt-3">
 <div className="flex items-center gap-2">
 <span className="text-sm font-medium text-green-900">Your referral code:</span>
 <code className="px-2 py-1 bg-green-100 rounded text-green-800 font-mono text-sm">
 CRENSA{userProfile?.username?.toUpperCase().slice(0, 4) || 'USER'}
 </code>
 <button className="text-green-600 hover:text-green-700 text-sm font-medium">
 Copy
 </button>
 </div>
 </div>
 </div>
 </div>

 {}
 <AnimatePresence>
 {selectedTask && (
 <motion.div
 className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 >
 <motion.div
 className="bg-white rounded-xl max-w-md w-full p-6"
 initial={{ scale: 0.95, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.95, opacity: 0 }}
 >
 <div className="flex items-center gap-3 mb-4">
 <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
 <selectedTask.icon className="w-6 h-6 text-purple-600" />
 </div>
 <div>
 <h3 className="text-lg font-semibold text-gray-900">{selectedTask.title}</h3>
 <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTaskTypeColor(selectedTask.type)}`}>
 {getTaskTypeLabel(selectedTask.type)}
 </span>
 </div>
 </div>

 <p className="text-gray-600 mb-4">{selectedTask.description}</p>

 {selectedTask.progress && (
 <div className="mb-4">
 <div className="flex justify-between text-sm text-gray-600 mb-2">
 <span>Progress</span>
 <span>{selectedTask.progress.current}/{selectedTask.progress.target}</span>
 </div>
 <div className="w-full bg-gray-200 rounded-full h-2">
 <div 
 className="bg-purple-600 h-2 rounded-full transition-all duration-300"
 style={{ width: `${(selectedTask.progress.current / selectedTask.progress.target) * 100}%` }}
 />
 </div>
 </div>
 )}

 <div className="flex items-center justify-between mb-6">
 <span className="text-gray-600">Reward</span>
 <span className="text-lg font-semibold text-purple-600">+{selectedTask.reward} coins</span>
 </div>

 <div className="flex gap-3">
 <button
 onClick={() => setSelectedTask(null)}
 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
 >
 Close
 </button>
 {selectedTask.completed ? (
 <div className="flex-1 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-center font-medium">
 Completed
 </div>
 ) : (
 <button
 onClick={() => handleClaimReward(selectedTask.id)}
 disabled={isClaimingReward}
 className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
 >
 {isClaimingReward ? 'Claiming...' : 'Claim Reward'}
 </button>
 )}
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )
}

interface TaskCardProps {
 task: RewardTask
 onClaim: () => void
 onSelect: () => void
 isClaimingReward: boolean
}

function TaskCard({ task, onClaim, onSelect, isClaimingReward }: TaskCardProps) {
 const Icon = task.icon

 return (
 <motion.div
 className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
 task.completed 
 ? 'border-green-200 bg-green-50' 
 : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
 }`}
 onClick={onSelect}
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 >
 <div className="flex items-start justify-between mb-3">
 <div className="flex items-center gap-3">
 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
 task.completed ? 'bg-green-100' : 'bg-purple-100'
 }`}>
 {task.completed ? (
 <CheckCircleIcon className="w-5 h-5 text-green-600" />
 ) : (
 <Icon className="w-5 h-5 text-purple-600" />
 )}
 </div>
 <div>
 <h4 className="font-medium text-gray-900">{task.title}</h4>
 <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTaskTypeColor(task.type)}`}>
 {getTaskTypeLabel(task.type)}
 </span>
 </div>
 </div>
 
 <div className="text-right">
 <div className="text-lg font-semibold text-purple-600">+{task.reward}</div>
 <div className="text-xs text-gray-500">coins</div>
 </div>
 </div>

 <p className="text-sm text-gray-600 mb-3">{task.description}</p>

 {task.progress && (
 <div className="mb-3">
 <div className="flex justify-between text-xs text-gray-600 mb-1">
 <span>Progress</span>
 <span>{task.progress.current}/{task.progress.target}</span>
 </div>
 <div className="w-full bg-gray-200 rounded-full h-1.5">
 <div 
 className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
 style={{ width: `${(task.progress.current / task.progress.target) * 100}%` }}
 />
 </div>
 </div>
 )}

 {task.completed ? (
 <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
 <CheckCircleIcon className="w-4 h-4" />
 Completed {task.completedAt && new Date(task.completedAt).toLocaleDateString()}
 </div>
 ) : (
 <div className="flex items-center gap-2 text-gray-500 text-sm">
 <ClockIcon className="w-4 h-4" />
 Click to view details
 </div>
 )}
 </motion.div>
 )
}

function getTaskTypeColor(type: string) {
 const colors = {
 daily: 'bg-blue-100 text-blue-800',
 weekly: 'bg-purple-100 text-purple-800',
 achievement: 'bg-yellow-100 text-yellow-800',
 referral: 'bg-green-100 text-green-800'
 }
 return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

function getTaskTypeLabel(type: string) {
 const labels = {
 daily: 'Daily',
 weekly: 'Weekly',
 achievement: 'Achievement',
 referral: 'Referral'
 }
 return labels[type as keyof typeof labels] || type
}