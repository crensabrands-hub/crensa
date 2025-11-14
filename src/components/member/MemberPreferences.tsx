"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";

interface NotificationPreferences {
 email: boolean;
 push: boolean;
 earnings: boolean;
 newFollowers: boolean;
 videoComments: boolean;
}

interface PrivacyPreferences {
 profileVisibility: "public" | "private";
 showEarnings: boolean;
 showViewCount: boolean;
}

interface PlaybackPreferences {
 autoplay: boolean;
 quality: "auto" | "high" | "medium" | "low";
 volume: number;
}

interface UserPreferences {
 notifications: NotificationPreferences;
 privacy: PrivacyPreferences;
 playback: PlaybackPreferences;
}

interface MemberPreferencesProps {
 className?: string;
}

export function MemberPreferences({ className = "" }: MemberPreferencesProps) {
 const { userProfile } = useAuthContext();
 const [preferences, setPreferences] = useState<UserPreferences | null>(null);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [successMessage, setSuccessMessage] = useState<string | null>(null);
 const [activeTab, setActiveTab] = useState<string>("notifications");

 useEffect(() => {
 const fetchPreferences = async () => {
 try {
 setLoading(true);
 setError(null);
 
 const response = await fetch('/api/member/preferences');
 const result = await response.json();
 
 if (!response.ok) {
 throw new Error(result.error || 'Failed to fetch preferences');
 }
 
 if (result.success) {
 setPreferences(result.data);
 } else {
 throw new Error('Failed to load preferences');
 }
 } catch (err) {
 console.error('Error fetching preferences:', err);
 setError(err instanceof Error ? err.message : 'Unknown error occurred');
 } finally {
 setLoading(false);
 }
 };

 if (userProfile) {
 fetchPreferences();
 }
 }, [userProfile]);

 const handleSavePreferences = async (updatedPreferences: Partial<UserPreferences>) => {
 try {
 setSaving(true);
 setError(null);
 setSuccessMessage(null);
 
 const response = await fetch('/api/member/preferences', {
 method: 'PUT',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(updatedPreferences),
 });
 
 const result = await response.json();
 
 if (!response.ok) {
 throw new Error(result.error || 'Failed to save preferences');
 }
 
 if (result.success) {
 setPreferences(result.data);
 setSuccessMessage('Preferences saved successfully!');
 setTimeout(() => setSuccessMessage(null), 3000);
 } else {
 throw new Error('Failed to save preferences');
 }
 } catch (err) {
 console.error('Error saving preferences:', err);
 setError(err instanceof Error ? err.message : 'Unknown error occurred');
 } finally {
 setSaving(false);
 }
 };

 const handleNotificationChange = (key: keyof NotificationPreferences, value: boolean) => {
 if (!preferences) return;
 
 const updatedNotifications = {
 ...preferences.notifications,
 [key]: value
 };
 
 const updatedPreferences = {
 ...preferences,
 notifications: updatedNotifications
 };
 
 setPreferences(updatedPreferences);
 handleSavePreferences({ notifications: updatedNotifications });
 };

 const handlePrivacyChange = (key: keyof PrivacyPreferences, value: any) => {
 if (!preferences) return;
 
 const updatedPrivacy = {
 ...preferences.privacy,
 [key]: value
 };
 
 const updatedPreferences = {
 ...preferences,
 privacy: updatedPrivacy
 };
 
 setPreferences(updatedPreferences);
 handleSavePreferences({ privacy: updatedPrivacy });
 };

 const handlePlaybackChange = (key: keyof PlaybackPreferences, value: any) => {
 if (!preferences) return;
 
 const updatedPlayback = {
 ...preferences.playback,
 [key]: value
 };
 
 const updatedPreferences = {
 ...preferences,
 playback: updatedPlayback
 };
 
 setPreferences(updatedPreferences);
 handleSavePreferences({ playback: updatedPlayback });
 };

 if (loading) {
 return (
 <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray min-h-[600px]">
 <div className={`p-6 space-y-6 ${className}`}>
 <div className="animate-pulse">
 <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
 <div className="space-y-4">
 {[...Array(5)].map((_, i) => (
 <div key={i} className="card">
 <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
 <div className="h-3 bg-gray-200 rounded w-3/4"></div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
 }

 if (error) {
 return (
 <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray min-h-[600px]">
 <div className={`p-6 ${className}`}>
 <div className="card bg-red-50 border-red-200">
 <div className="flex items-center space-x-3">
 <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
 <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 <div>
 <h3 className="text-lg font-semibold text-red-800">Error Loading Preferences</h3>
 <p className="text-red-600">{error}</p>
 <button 
 onClick={() => window.location.reload()} 
 className="mt-2 text-sm text-red-700 underline hover:text-red-800"
 >
 Try again
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
 }

 if (!preferences) {
 return (
 <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray min-h-[600px]">
 <div className={`p-6 ${className}`}>
 <div className="card">
 <p className="text-center text-neutral-dark-gray">No preferences data available.</p>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray min-h-[600px]">
 <div className={`p-6 space-y-6 ${className}`}>
 {}
 <div>
 <h2 className="text-2xl font-bold text-primary-navy">Preferences</h2>
 <p className="text-neutral-dark-gray">Manage your notification, privacy, and content preferences</p>
 </div>

 {}
 {successMessage && (
 <div className="bg-green-50 border border-green-200 rounded-lg p-4">
 <div className="flex items-center space-x-3">
 <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
 <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
 </svg>
 </div>
 <p className="text-green-800 font-medium">{successMessage}</p>
 </div>
 </div>
 )}

 {}
 <div className="border-b border-gray-200">
 <nav className="-mb-px flex space-x-8">
 {[
 { id: 'notifications', label: 'Notifications', icon: '🔔' },
 { id: 'privacy', label: 'Privacy', icon: '🔒' },
 { id: 'playback', label: 'Playback', icon: '▶️' }
 ].map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
 activeTab === tab.id
 ? 'border-primary-blue text-primary-blue'
 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
 }`}
 >
 <span>{tab.icon}</span>
 <span>{tab.label}</span>
 </button>
 ))}
 </nav>
 </div>

 {}
 {activeTab === 'notifications' && (
 <div className="space-y-6">
 <div className="card">
 <h3 className="text-lg font-semibold text-primary-navy mb-4">Notification Settings</h3>
 <div className="space-y-4">
 {}
 <div className="flex items-center justify-between">
 <div>
 <h4 className="font-medium text-primary-navy">Email Notifications</h4>
 <p className="text-sm text-neutral-dark-gray">Receive notifications via email</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input
 type="checkbox"
 checked={preferences.notifications.email}
 onChange={(e) => handleNotificationChange('email', e.target.checked)}
 disabled={saving}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
 </label>
 </div>

 {}
 <div className="flex items-center justify-between">
 <div>
 <h4 className="font-medium text-primary-navy">Push Notifications</h4>
 <p className="text-sm text-neutral-dark-gray">Receive browser push notifications</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input
 type="checkbox"
 checked={preferences.notifications.push}
 onChange={(e) => handleNotificationChange('push', e.target.checked)}
 disabled={saving}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
 </label>
 </div>

 {}
 <div className="flex items-center justify-between">
 <div>
 <h4 className="font-medium text-primary-navy">Earnings Updates</h4>
 <p className="text-sm text-neutral-dark-gray">Get notified about earnings and payments</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input
 type="checkbox"
 checked={preferences.notifications.earnings}
 onChange={(e) => handleNotificationChange('earnings', e.target.checked)}
 disabled={saving}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
 </label>
 </div>

 {}
 <div className="flex items-center justify-between">
 <div>
 <h4 className="font-medium text-primary-navy">New Followers</h4>
 <p className="text-sm text-neutral-dark-gray">Get notified when someone follows you</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input
 type="checkbox"
 checked={preferences.notifications.newFollowers}
 onChange={(e) => handleNotificationChange('newFollowers', e.target.checked)}
 disabled={saving}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
 </label>
 </div>

 {}
 <div className="flex items-center justify-between">
 <div>
 <h4 className="font-medium text-primary-navy">Video Comments</h4>
 <p className="text-sm text-neutral-dark-gray">Get notified about comments on your videos</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input
 type="checkbox"
 checked={preferences.notifications.videoComments}
 onChange={(e) => handleNotificationChange('videoComments', e.target.checked)}
 disabled={saving}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
 </label>
 </div>
 </div>
 </div>
 </div>
 )}

 {activeTab === 'privacy' && (
 <div className="space-y-6">
 <div className="card">
 <h3 className="text-lg font-semibold text-primary-navy mb-4">Privacy Settings</h3>
 <div className="space-y-4">
 {}
 <div>
 <h4 className="font-medium text-primary-navy mb-2">Profile Visibility</h4>
 <p className="text-sm text-neutral-dark-gray mb-3">Control who can see your profile</p>
 <div className="space-y-2">
 <label className="flex items-center">
 <input
 type="radio"
 name="profileVisibility"
 value="public"
 checked={preferences.privacy.profileVisibility === 'public'}
 onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
 disabled={saving}
 className="mr-3 text-primary-blue focus:ring-primary-blue"
 />
 <div>
 <span className="font-medium text-primary-navy">Public</span>
 <p className="text-sm text-neutral-dark-gray">Anyone can see your profile</p>
 </div>
 </label>
 <label className="flex items-center">
 <input
 type="radio"
 name="profileVisibility"
 value="private"
 checked={preferences.privacy.profileVisibility === 'private'}
 onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
 disabled={saving}
 className="mr-3 text-primary-blue focus:ring-primary-blue"
 />
 <div>
 <span className="font-medium text-primary-navy">Private</span>
 <p className="text-sm text-neutral-dark-gray">Only you can see your profile</p>
 </div>
 </label>
 </div>
 </div>

 {}
 <div className="flex items-center justify-between">
 <div>
 <h4 className="font-medium text-primary-navy">Show Earnings</h4>
 <p className="text-sm text-neutral-dark-gray">Display earnings information on your profile</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input
 type="checkbox"
 checked={preferences.privacy.showEarnings}
 onChange={(e) => handlePrivacyChange('showEarnings', e.target.checked)}
 disabled={saving}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
 </label>
 </div>

 {}
 <div className="flex items-center justify-between">
 <div>
 <h4 className="font-medium text-primary-navy">Show View Count</h4>
 <p className="text-sm text-neutral-dark-gray">Display video view counts publicly</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input
 type="checkbox"
 checked={preferences.privacy.showViewCount}
 onChange={(e) => handlePrivacyChange('showViewCount', e.target.checked)}
 disabled={saving}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
 </label>
 </div>
 </div>
 </div>
 </div>
 )}

 {activeTab === 'playback' && (
 <div className="space-y-6">
 <div className="card">
 <h3 className="text-lg font-semibold text-primary-navy mb-4">Playback Settings</h3>
 <div className="space-y-4">
 {}
 <div className="flex items-center justify-between">
 <div>
 <h4 className="font-medium text-primary-navy">Autoplay</h4>
 <p className="text-sm text-neutral-dark-gray">Automatically play videos when loaded</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input
 type="checkbox"
 checked={preferences.playback.autoplay}
 onChange={(e) => handlePlaybackChange('autoplay', e.target.checked)}
 disabled={saving}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
 </label>
 </div>

 {}
 <div>
 <h4 className="font-medium text-primary-navy mb-2">Default Video Quality</h4>
 <p className="text-sm text-neutral-dark-gray mb-3">Choose your preferred video quality</p>
 <select
 value={preferences.playback.quality}
 onChange={(e) => handlePlaybackChange('quality', e.target.value)}
 disabled={saving}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
 >
 <option value="auto">Auto (Recommended)</option>
 <option value="high">High Quality</option>
 <option value="medium">Medium Quality</option>
 <option value="low">Low Quality</option>
 </select>
 </div>

 {}
 <div>
 <h4 className="font-medium text-primary-navy mb-2">Default Volume</h4>
 <p className="text-sm text-neutral-dark-gray mb-3">Set your preferred volume level</p>
 <div className="flex items-center space-x-4">
 <span className="text-sm text-neutral-dark-gray">0%</span>
 <input
 type="range"
 min="0"
 max="100"
 value={preferences.playback.volume}
 onChange={(e) => handlePlaybackChange('volume', parseInt(e.target.value))}
 disabled={saving}
 className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
 />
 <span className="text-sm text-neutral-dark-gray">100%</span>
 <span className="text-sm font-medium text-primary-navy min-w-[3rem]">
 {preferences.playback.volume}%
 </span>
 </div>
 </div>
 </div>
 </div>
 </div>
 )}

 {}
 {saving && (
 <div className="fixed bottom-4 right-4 bg-primary-blue text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
 <span>Saving...</span>
 </div>
 )}
 </div>
 </div>
 );
}