'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserManagementData } from '@/lib/services/adminService';

export default function UserManagement() {
 const [users, setUsers] = useState<UserManagementData[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [currentPage, setCurrentPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [searchTerm, setSearchTerm] = useState('');
 const [roleFilter, setRoleFilter] = useState('all');
 const [statusFilter, setStatusFilter] = useState('all');

 const fetchUsers = useCallback(async () => {
 try {
 setLoading(true);
 const params = new URLSearchParams({
 page: currentPage.toString(),
 search: searchTerm,
 role: roleFilter,
 status: statusFilter,
 });

 const response = await fetch(`/api/admin/users?${params}`);
 if (!response.ok) {
 throw new Error('Failed to fetch users');
 }

 const data = await response.json();
 setUsers(data.users);
 setTotalPages(Math.ceil(data.total / 20));
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Failed to load users');
 } finally {
 setLoading(false);
 }
 }, [currentPage, searchTerm, roleFilter, statusFilter]);

 useEffect(() => {
 fetchUsers();
 }, [fetchUsers]);

 const handleSuspendUser = async (userId: string, reason: string) => {
 try {
 const response = await fetch(`/api/admin/users/${userId}/suspend`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ reason }),
 });

 if (!response.ok) {
 throw new Error('Failed to suspend user');
 }

 fetchUsers(); // Refresh the list
 } catch (err) {
 alert(err instanceof Error ? err.message : 'Failed to suspend user');
 }
 };

 const handleUnsuspendUser = async (userId: string) => {
 try {
 const response = await fetch(`/api/admin/users/${userId}/unsuspend`, {
 method: 'POST',
 });

 if (!response.ok) {
 throw new Error('Failed to unsuspend user');
 }

 fetchUsers(); // Refresh the list
 } catch (err) {
 alert(err instanceof Error ? err.message : 'Failed to unsuspend user');
 }
 };

 if (loading && users.length === 0) {
 return (
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
 <div className="animate-pulse space-y-4">
 <div className="h-4 bg-gray-200 rounded w-1/4"></div>
 <div className="space-y-3">
 {[...Array(5)].map((_, i) => (
 <div key={i} className="h-12 bg-gray-200 rounded"></div>
 ))}
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {}
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Search Users
 </label>
 <input
 type="text"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 placeholder="Search by username or email..."
 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Role
 </label>
 <select
 value={roleFilter}
 onChange={(e) => setRoleFilter(e.target.value)}
 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
 >
 <option value="all">All Roles</option>
 <option value="creator">Creators</option>
 <option value="member">Members</option>
 <option value="admin">Admins</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Status
 </label>
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
 >
 <option value="all">All Status</option>
 <option value="active">Active</option>
 <option value="suspended">Suspended</option>
 </select>
 </div>
 <div className="flex items-end">
 <button
 onClick={fetchUsers}
 className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
 >
 Refresh
 </button>
 </div>
 </div>
 </div>

 {}
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
 <div className="px-6 py-4 border-b border-gray-200">
 <h3 className="text-lg font-medium text-gray-900">Users</h3>
 </div>
 
 {error ? (
 <div className="p-6 text-center text-red-600">{error}</div>
 ) : (
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-gray-50">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 User
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Role
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Status
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Joined
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Actions
 </th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200">
 {users.map((user) => (
 <tr key={user.id} className="hover:bg-gray-50">
 <td className="px-6 py-4 whitespace-nowrap">
 <div>
 <div className="text-sm font-medium text-gray-900">
 {user.username}
 </div>
 <div className="text-sm text-gray-500">{user.email}</div>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
 user.role === 'admin' 
 ? 'bg-purple-100 text-purple-800'
 : user.role === 'creator'
 ? 'bg-green-100 text-green-800'
 : 'bg-blue-100 text-blue-800'
 }`}>
 {user.role}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
 user.isSuspended
 ? 'bg-red-100 text-red-800'
 : user.isActive
 ? 'bg-green-100 text-green-800'
 : 'bg-gray-100 text-gray-800'
 }`}>
 {user.isSuspended ? 'Suspended' : user.isActive ? 'Active' : 'Inactive'}
 </span>
 {user.isSuspended && user.suspensionReason && (
 <div className="text-xs text-gray-500 mt-1">
 {user.suspensionReason}
 </div>
 )}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
 {new Date(user.createdAt).toLocaleDateString()}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
 {user.isSuspended ? (
 <button
 onClick={() => handleUnsuspendUser(user.id)}
 className="text-green-600 hover:text-green-900"
 >
 Unsuspend
 </button>
 ) : (
 <button
 onClick={() => {
 const reason = prompt('Enter suspension reason:');
 if (reason) {
 handleSuspendUser(user.id, reason);
 }
 }}
 className="text-red-600 hover:text-red-900"
 >
 Suspend
 </button>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {}
 {totalPages > 1 && (
 <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
 <div className="text-sm text-gray-700">
 Page {currentPage} of {totalPages}
 </div>
 <div className="flex space-x-2">
 <button
 onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
 disabled={currentPage === 1}
 className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
 >
 Previous
 </button>
 <button
 onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
 disabled={currentPage === totalPages}
 className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
 >
 Next
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}