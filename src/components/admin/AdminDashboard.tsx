'use client';

import { useState } from 'react';
import { AdminStats } from '@/lib/services/adminService';
import AuditLogs from './AuditLogs';
import AdminStatsCards from './AdminStatsCards';
import UserManagement from './UserManagement';
import VideoModeration from './VideoModeration';
import ReportsManagement from './ReportsManagement';
import ContentFilters from './ContentFilters';

interface AdminDashboardProps {
 stats: AdminStats | null;
}

type TabType = 'overview' | 'users' | 'videos' | 'reports' | 'audit' | 'filters';

export default function AdminDashboard({ stats }: AdminDashboardProps) {
 const [activeTab, setActiveTab] = useState<TabType>('overview');

 const tabs = [
 { id: 'overview', label: 'Overview', icon: '📊' },
 { id: 'users', label: 'User Management', icon: '👥' },
 { id: 'videos', label: 'Video Moderation', icon: '🎥' },
 { id: 'reports', label: 'Reports', icon: '🚨' },
 { id: 'audit', label: 'Audit Logs', icon: '📋' },
 { id: 'filters', label: 'Content Filters', icon: '🛡️' },
 ];

 return (
 <div className="min-h-screen bg-gray-50">
 {}
 <div className="bg-white shadow-sm border-b">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex justify-between items-center py-6">
 <div>
 <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
 <p className="mt-1 text-sm text-gray-500">
 Manage users, content, and platform settings
 </p>
 </div>
 </div>
 </div>
 </div>

 {}
 <div className="bg-white shadow-sm">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <nav className="flex space-x-8" aria-label="Tabs">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id as TabType)}
 className={`${
 activeTab === tab.id
 ? 'border-blue-500 text-blue-600'
 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
 } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
 >
 <span>{tab.icon}</span>
 <span>{tab.label}</span>
 </button>
 ))}
 </nav>
 </div>
 </div>

 {}
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 {activeTab === 'overview' && <AdminStatsCards stats={stats} />}
 {activeTab === 'users' && <UserManagement />}
 {activeTab === 'videos' && <VideoModeration />}
 {activeTab === 'reports' && <ReportsManagement />}
 {activeTab === 'audit' && <AuditLogs />}
 {activeTab === 'filters' && <ContentFilters />}
 </div>
 </div>
 );
}