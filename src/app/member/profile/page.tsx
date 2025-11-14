"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { MemberProtectedRoute } from "@/components/layout/ProtectedRoute";
import { useState } from "react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

function ProfileContent() {
 const { userProfile, updateUserProfile, isLoading } = useAuthContext();
 const [isEditing, setIsEditing] = useState(false);
 const [formData, setFormData] = useState({
 username: userProfile?.username || '',
 email: userProfile?.email || '',
 });

 const handleSave = async () => {
 try {
 await updateUserProfile(formData);
 setIsEditing(false);
 alert('Profile updated successfully!');
 } catch (error) {
 console.error('Error updating profile:', error);
 alert('Failed to update profile. Please try again.');
 }
 };

 if (isLoading) {
 return <LoadingScreen message="Loading profile..." variant="dashboard" fullScreen={false} />;
 }

 if (!userProfile) {
 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-3xl font-bold text-primary-navy mb-2">Profile</h1>
 <p className="text-neutral-dark-gray">Manage your profile information</p>
 </div>
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <p className="text-center text-gray-500">Profile not found</p>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {}
 <div>
 <h1 className="text-3xl font-bold text-primary-navy mb-2">Profile</h1>
 <p className="text-neutral-dark-gray">Manage your profile information</p>
 </div>

 {}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-semibold text-primary-navy">Profile Information</h2>
 <button
 onClick={() => setIsEditing(!isEditing)}
 className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
 >
 {isEditing ? 'Cancel' : 'Edit Profile'}
 </button>
 </div>

 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
 {isEditing ? (
 <input
 type="text"
 value={formData.username}
 onChange={(e) => setFormData({ ...formData, username: e.target.value })}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 />
 ) : (
 <p className="text-gray-900">{userProfile.username}</p>
 )}
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
 <p className="text-gray-900">{userProfile.email}</p>
 <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
 <p className="text-gray-900 capitalize">{userProfile.role}</p>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
 <p className="text-gray-900">
 {new Date(userProfile.createdAt).toLocaleDateString()}
 </p>
 </div>

 {isEditing && (
 <div className="flex space-x-3 pt-4">
 <button
 onClick={handleSave}
 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
 >
 Save Changes
 </button>
 <button
 onClick={() => setIsEditing(false)}
 className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
 >
 Cancel
 </button>
 </div>
 )}
 </div>
 </div>

 {}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <h2 className="text-xl font-semibold text-primary-navy mb-4">Member Statistics</h2>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="text-center p-4 bg-blue-50 rounded-lg">
 <p className="text-2xl font-bold text-blue-600">0</p>
 <p className="text-sm text-gray-600">Videos Watched</p>
 </div>
 <div className="text-center p-4 bg-green-50 rounded-lg">
 <p className="text-2xl font-bold text-green-600">₹0.00</p>
 <p className="text-sm text-gray-600">Total Spent</p>
 </div>
 <div className="text-center p-4 bg-purple-50 rounded-lg">
 <p className="text-2xl font-bold text-purple-600">0</p>
 <p className="text-sm text-gray-600">Creators Followed</p>
 </div>
 </div>
 </div>
 </div>
 );
}

export default function ProfilePage() {
 return (
 <MemberProtectedRoute>
 <ProfileContent />
 </MemberProtectedRoute>
 );
}