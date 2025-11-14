'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { AdminStats } from '@/lib/services/adminService';
import { AdminDashboard } from '@/components';

export default function AdminPage() {
 const { user, isLoaded } = useUser();
 const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 if (isLoaded && (!user || !user.publicMetadata?.role || user.publicMetadata.role !== 'admin')) {
 redirect('/');
 }
 }, [user, isLoaded]);

 useEffect(() => {
 const fetchAdminStats = async () => {
 try {
 const response = await fetch('/api/admin/stats');
 if (!response.ok) {
 throw new Error('Failed to fetch admin stats');
 }
 const stats = await response.json();
 setAdminStats(stats);
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Failed to load admin stats');
 } finally {
 setLoading(false);
 }
 };

 if (user && user.publicMetadata?.role === 'admin') {
 fetchAdminStats();
 }
 }, [user]);

 if (!isLoaded || loading) {
 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center">
 <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
 </div>
 );
 }

 if (error) {
 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center">
 <div className="text-center">
 <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
 <p className="text-gray-600">{error}</p>
 </div>
 </div>
 );
 }

 if (!user || user.publicMetadata?.role !== 'admin') {
 return null;
 }

 return (
 <div className="min-h-screen bg-gray-50">
 <AdminDashboard stats={adminStats} />
 </div>
 );
}