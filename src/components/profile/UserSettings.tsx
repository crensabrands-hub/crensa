'use client';

import React, { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

interface UserSettingsProps {
 onSave?: () => void;
 className?: string;
}

export default function UserSettings({ onSave, className = '' }: UserSettingsProps) {
 const { userProfile } = useAuthContext();
 const {
 preferences,
 isLoading: preferencesLoading,
 error,
 updateNotificationPreferences,
 updatePrivacyPreferences,
 updatePlaybackPreferences,
 clearError,
 } = useUserPreferences();
 const [isSaved, setIsSaved] = useState(false);

 const handleNotificationChange = async (key: keyof typeof preferences.notifications, value: boolean) => {
 try {
 clearError();
 await updateNotificationPreferences({ [key]: value });
 setIsSaved(true);
 onSave?.();

 setTimeout(() => setIsSaved(false), 3000);
 } catch (error) {
 console.error('Failed to update notification preferences:', error);
 }
 };

 const handlePrivacyChange = async (key: keyof typeof preferences.privacy, value: any) => {
 try {
 clearError();
 await updatePrivacyPreferences({ [key]: value });
 setIsSaved(true);
 onSave?.();

 setTimeout(() => setIsSaved(false), 3000);
 } catch (error) {
 console.error('Failed to update privacy preferences:', error);
 }
 };

 const handlePlaybackChange = async (key: keyof typeof preferences.playback, value: any) => {
 try {
 clearError();
 await updatePlaybackPreferences({ [key]: value });
 setIsSaved(true);
 onSave?.();

 setTimeout(() => setIsSaved(false), 3000);
 } catch (error) {
 console.error('Failed to update playback preferences:', error);
 }
 };

 if (!userProfile || preferencesLoading) {
 return (
 <div className="flex justify-center items-center py-8">
 <div className="w-8 h-8 animate-spin rounded-full border-2 border-accent-pink/20 border-t-accent-pink"></div>
 </div>
 );
 }

 return (
 <div className={`bg-neutral-white rounded-lg shadow-lg p-6 space-y-8 ${className}`}>
 <div className="flex justify-between items-center">
 <h1 className="text-2xl font-bold text-primary-navy">Settings</h1>
 <div className="flex items-center space-x-2">
 {error && (
 <span className="text-red-600 text-sm font-medium">{error}</span>
 )}
 {isSaved && (
 <span className="text-green-600 text-sm font-medium">Settings saved!</span>
 )}
 </div>
 </div>

 {}
 <div>
 <h2 className="text-lg font-semibold text-primary-navy mb-4">Notifications</h2>
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium text-primary-navy">Email Notifications</p>
 <p className="text-sm text-neutral-gray">Receive notifications via email</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input
 type="checkbox"
 checked={preferences.notifications.email}
 onChange={(e) => handleNotificationChange('email', e.target.checked)}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-neutral-gray peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-pink/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-pink"></div>
 </label>
 </div>

 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium text-primary-navy">Push Notifications</p>
 <p className="text-sm text-neutral-gray">Receive push notifications in browser</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input
 type="checkbox"
 checked={preferences.notifications.push}
 onChange={(e) => handleNotificationChange('push', e.target.checked)}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-neutral-gray peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-pink/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-pink"></div>
 </label>
 </div>

 {userProfile.role === 'creator' && (
 <>
 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium text-primary-navy">Earnings Notifications</p>
 <p className="text-sm text-neutral-gray">Get notified when you earn from videos</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input
 type="checkbox"
 checked={preferences.notifications.earnings}
 onChange={(e) => handleNotificationChange('earnings', e.target.checked)}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-neutral-gray peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-pink/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-pink"></div>
 </label>
 </div>

 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium text-primary-navy">New Followers</p>
 <p className="text-sm text-neutral-gray">Get notified when someone follows you</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input
 type="checkbox"
 checked={preferences.notifications.newFollowers}
 onChange={(e) => handleNotificationChange('newFollowers', e.target.checked)}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-neutral-gray peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-pink/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-pink"></div>
 </label>
 </div>
 </>
 )}
 </div>
 </div>

 {}
 <div>
 <h2 className="text-lg font-semibold text-primary-navy mb-4">Privacy</h2>
 <div className="space-y-4">
 <div>
 <label className="block font-medium text-primary-navy mb-2">
 Profile Visibility
 </label>
 <select
 value={preferences.privacy.profileVisibility}
 onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
 className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:ring-2 focus:ring-accent-pink focus:border-accent-pink transition-colors duration-200"
 >
 <option value="public">Public - Anyone can view your profile</option>
 <option value="private">Private - Only you can view your profile</option>
 </select>
 </div>

 {userProfile.role === 'creator' && (
 <>
 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium text-primary-navy">Show Earnings</p>
 <p className="text-sm text-neutral-gray">Display your earnings on your profile</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input
 type="checkbox"
 checked={preferences.privacy.showEarnings}
 onChange={(e) => handlePrivacyChange('showEarnings', e.target.checked)}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-neutral-gray peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-pink/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-pink"></div>
 </label>
 </div>

 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium text-primary-navy">Show View Count</p>
 <p className="text-sm text-neutral-gray">Display view counts on your videos</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input
 type="checkbox"
 checked={preferences.privacy.showViewCount}
 onChange={(e) => handlePrivacyChange('showViewCount', e.target.checked)}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-neutral-gray peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-pink/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-pink"></div>
 </label>
 </div>
 </>
 )}
 </div>
 </div>

 {}
 <div>
 <h2 className="text-lg font-semibold text-primary-navy mb-4">Playback</h2>
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium text-primary-navy">Autoplay Videos</p>
 <p className="text-sm text-neutral-gray">Automatically play videos when scrolling</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input
 type="checkbox"
 checked={preferences.playback.autoplay}
 onChange={(e) => handlePlaybackChange('autoplay', e.target.checked)}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-neutral-gray peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-pink/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-pink"></div>
 </label>
 </div>

 <div>
 <label className="block font-medium text-primary-navy mb-2">
 Video Quality
 </label>
 <select
 value={preferences.playback.quality}
 onChange={(e) => handlePlaybackChange('quality', e.target.value)}
 className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:ring-2 focus:ring-accent-pink focus:border-accent-pink transition-colors duration-200"
 >
 <option value="auto">Auto - Adjust based on connection</option>
 <option value="high">High - Best quality</option>
 <option value="medium">Medium - Balanced</option>
 <option value="low">Low - Data saver</option>
 </select>
 </div>

 <div>
 <label className="block font-medium text-primary-navy mb-2">
 Default Volume: {preferences.playback.volume}%
 </label>
 <input
 type="range"
 min="0"
 max="100"
 value={preferences.playback.volume}
 onChange={(e) => handlePlaybackChange('volume', parseInt(e.target.value))}
 className="w-full h-2 bg-neutral-gray rounded-lg appearance-none cursor-pointer slider"
 />
 </div>
 </div>
 </div>

 {}
 <div className="pt-6 border-t border-neutral-gray/20">
 <p className="text-sm text-neutral-gray text-center">
 Settings are automatically saved when you make changes.
 </p>
 </div>
 </div>
 );
}