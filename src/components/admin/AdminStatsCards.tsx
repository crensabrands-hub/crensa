'use client';

import { AdminStats } from '@/lib/services/adminService';

interface AdminStatsCardsProps {
 stats: AdminStats | null;
}

export default function AdminStatsCards({ stats }: AdminStatsCardsProps) {
 if (!stats) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {[...Array(8)].map((_, i) => (
 <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
 <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
 <div className="h-8 bg-gray-200 rounded w-1/2"></div>
 </div>
 ))}
 </div>
 );
 }

 const statCards = [
 {
 title: 'Total Users',
 value: stats.totalUsers.toLocaleString(),
 icon: '👥',
 color: 'bg-blue-500',
 },
 {
 title: 'Total Creators',
 value: stats.totalCreators.toLocaleString(),
 icon: '🎨',
 color: 'bg-green-500',
 },
 {
 title: 'Total Members',
 value: stats.totalMembers.toLocaleString(),
 icon: '👤',
 color: 'bg-purple-500',
 },
 {
 title: 'Total Videos',
 value: stats.totalVideos.toLocaleString(),
 icon: '🎥',
 color: 'bg-yellow-500',
 },
 {
 title: 'Pending Reports',
 value: stats.pendingReports.toLocaleString(),
 icon: '🚨',
 color: 'bg-red-500',
 },
 {
 title: 'Suspended Users',
 value: stats.suspendedUsers.toLocaleString(),
 icon: '🚫',
 color: 'bg-orange-500',
 },
 {
 title: 'Flagged Videos',
 value: stats.flaggedVideos.toLocaleString(),
 icon: '⚠️',
 color: 'bg-pink-500',
 },
 {
 title: 'Monthly Active Users',
 value: stats.monthlyActiveUsers.toLocaleString(),
 icon: '📈',
 color: 'bg-indigo-500',
 },
 ];

 return (
 <div className="space-y-8">
 {}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {statCards.map((stat, index) => (
 <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
 <div className="flex items-center">
 <div className={`${stat.color} rounded-lg p-3 mr-4`}>
 <span className="text-white text-xl">{stat.icon}</span>
 </div>
 <div>
 <p className="text-sm font-medium text-gray-600">{stat.title}</p>
 <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
 </div>
 </div>
 </div>
 ))}
 </div>

 {}
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
 <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
 <span className="mr-2">📊</span>
 Generate Report
 </button>
 <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
 <span className="mr-2">🛡️</span>
 Add Content Filter
 </button>
 <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
 <span className="mr-2">📢</span>
 Send Announcement
 </button>
 </div>
 </div>

 {}
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
 <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Health</h3>
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <span className="text-sm text-gray-600">System Status</span>
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
 Operational
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-sm text-gray-600">Content Moderation Queue</span>
 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
 stats.pendingReports > 10 
 ? 'bg-red-100 text-red-800' 
 : stats.pendingReports > 5 
 ? 'bg-yellow-100 text-yellow-800' 
 : 'bg-green-100 text-green-800'
 }`}>
 {stats.pendingReports > 10 ? 'High' : stats.pendingReports > 5 ? 'Medium' : 'Low'}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-sm text-gray-600">User Growth</span>
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
 +{Math.round((stats.monthlyActiveUsers / stats.totalUsers) * 100)}% Active
 </span>
 </div>
 </div>
 </div>
 </div>
 );
}