'use client';

import React, { useState } from 'react';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { 
 BellIcon, 
 EnvelopeIcon, 
 DevicePhoneMobileIcon,
 CurrencyDollarIcon,
 UserPlusIcon,
 ChatBubbleLeftIcon,
 HeartIcon,
 CreditCardIcon,
 ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface PreferenceToggleProps {
 id: string;
 label: string;
 description: string;
 icon: React.ReactNode;
 enabled: boolean;
 onChange: (enabled: boolean) => void;
 disabled?: boolean;
}

function PreferenceToggle({ 
 id, 
 label, 
 description, 
 icon, 
 enabled, 
 onChange, 
 disabled = false 
}: PreferenceToggleProps) {
 return (
 <div className="flex items-start space-x-4 p-4 rounded-lg border border-neutral-gray/20 hover:border-accent-pink/30 transition-colors duration-200">
 <div className="flex-shrink-0 mt-1">
 <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
 enabled ? 'bg-accent-pink text-neutral-white' : 'bg-neutral-gray/10 text-neutral-gray'
 }`}>
 {icon}
 </div>
 </div>
 
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-sm font-semibold text-primary-navy">{label}</h3>
 <p className="text-sm text-neutral-gray mt-1">{description}</p>
 </div>
 
 <div className="ml-4">
 <button
 type="button"
 role="switch"
 aria-checked={enabled}
 aria-labelledby={id}
 disabled={disabled}
 onClick={() => onChange(!enabled)}
 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-pink focus:ring-offset-2 ${
 enabled ? 'bg-accent-pink' : 'bg-neutral-gray/30'
 } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
 >
 <span
 className={`inline-block h-4 w-4 transform rounded-full bg-neutral-white transition-transform duration-200 ${
 enabled ? 'translate-x-6' : 'translate-x-1'
 }`}
 />
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}

export default function NotificationPreferences() {
 const { 
 preferences, 
 updateNotificationPreferences, 
 isLoading: isPreferencesLoading,
 error,
 clearError 
 } = useUserPreferences();
 const { userProfile } = useAuthContext();
 const [isSaving, setIsSaving] = useState(false);
 const [saveMessage, setSaveMessage] = useState<string | null>(null);

 const handlePreferenceChange = async (key: keyof typeof preferences.notifications, value: boolean) => {
 try {
 setIsSaving(true);
 clearError();
 await updateNotificationPreferences({ [key]: value });
 setSaveMessage('Preferences saved successfully!');
 setTimeout(() => setSaveMessage(null), 3000);
 } catch (error) {
 setSaveMessage('Failed to save preferences. Please try again.');
 setTimeout(() => setSaveMessage(null), 3000);
 } finally {
 setIsSaving(false);
 }
 };

 if (isPreferencesLoading) {
 return (
 <div className="bg-neutral-white rounded-lg shadow-lg p-6">
 <div className="animate-pulse">
 <div className="h-6 bg-neutral-gray/20 rounded w-1/3 mb-4"></div>
 <div className="space-y-4">
 {[...Array(6)].map((_, i) => (
 <div key={i} className="h-16 bg-neutral-gray/10 rounded-lg"></div>
 ))}
 </div>
 </div>
 </div>
 );
 }

 const isCreator = userProfile?.role === 'creator';

 return (
 <div className="bg-neutral-white rounded-lg shadow-lg overflow-hidden">
 {}
 <div className="px-6 py-4 border-b border-neutral-gray/20">
 <div className="flex items-center space-x-3">
 <BellIcon className="w-6 h-6 text-accent-pink" />
 <div>
 <h2 className="text-lg font-semibold text-primary-navy">Notification Preferences</h2>
 <p className="text-sm text-neutral-gray">Choose how you want to be notified</p>
 </div>
 </div>
 </div>

 {}
 {(saveMessage || error) && (
 <div className={`px-6 py-3 border-b border-neutral-gray/20 ${
 saveMessage && saveMessage.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
 }`}>
 <p className="text-sm font-medium">{saveMessage || error}</p>
 </div>
 )}

 <div className="p-6 space-y-6">
 {}
 <div>
 <h3 className="text-md font-semibold text-primary-navy mb-4">Delivery Methods</h3>
 <div className="space-y-3">
 <PreferenceToggle
 id="email-notifications"
 label="Email Notifications"
 description="Receive notifications via email"
 icon={<EnvelopeIcon className="w-4 h-4" />}
 enabled={preferences.notifications.email}
 onChange={(enabled) => handlePreferenceChange('email', enabled)}
 disabled={isSaving}
 />
 
 <PreferenceToggle
 id="push-notifications"
 label="Push Notifications"
 description="Receive browser push notifications"
 icon={<DevicePhoneMobileIcon className="w-4 h-4" />}
 enabled={preferences.notifications.push}
 onChange={(enabled) => handlePreferenceChange('push', enabled)}
 disabled={isSaving}
 />
 </div>
 </div>

 {}
 <div>
 <h3 className="text-md font-semibold text-primary-navy mb-4">
 {isCreator ? 'Creator Notifications' : 'Activity Notifications'}
 </h3>
 <div className="space-y-3">
 {isCreator && (
 <>
 <PreferenceToggle
 id="earnings-notifications"
 label="Earnings & Views"
 description="Get notified when you earn from video views"
 icon={<CurrencyDollarIcon className="w-4 h-4" />}
 enabled={preferences.notifications.earnings}
 onChange={(enabled) => handlePreferenceChange('earnings', enabled)}
 disabled={isSaving}
 />
 
 <PreferenceToggle
 id="followers-notifications"
 label="New Followers"
 description="Get notified when someone follows you"
 icon={<UserPlusIcon className="w-4 h-4" />}
 enabled={preferences.notifications.newFollowers}
 onChange={(enabled) => handlePreferenceChange('newFollowers', enabled)}
 disabled={isSaving}
 />
 </>
 )}
 
 <PreferenceToggle
 id="comments-notifications"
 label="Video Comments"
 description={isCreator ? "Get notified when someone comments on your videos" : "Get notified about comment replies"}
 icon={<ChatBubbleLeftIcon className="w-4 h-4" />}
 enabled={preferences.notifications.videoComments}
 onChange={(enabled) => handlePreferenceChange('videoComments', enabled)}
 disabled={isSaving}
 />
 
 <PreferenceToggle
 id="likes-notifications"
 label="Video Likes"
 description={isCreator ? "Get notified when someone likes your videos" : "Get notified about likes on your comments"}
 icon={<HeartIcon className="w-4 h-4" />}
 enabled={preferences.notifications.videoLikes}
 onChange={(enabled) => handlePreferenceChange('videoLikes', enabled)}
 disabled={isSaving}
 />
 </div>
 </div>

 {}
 <div>
 <h3 className="text-md font-semibold text-primary-navy mb-4">System Notifications</h3>
 <div className="space-y-3">
 <PreferenceToggle
 id="payment-notifications"
 label="Payment Updates"
 description="Get notified about payment confirmations and failures"
 icon={<CreditCardIcon className="w-4 h-4" />}
 enabled={preferences.notifications.paymentUpdates}
 onChange={(enabled) => handlePreferenceChange('paymentUpdates', enabled)}
 disabled={isSaving}
 />
 
 <PreferenceToggle
 id="system-notifications"
 label="System Updates"
 description="Get notified about important platform updates and announcements"
 icon={<ExclamationTriangleIcon className="w-4 h-4" />}
 enabled={preferences.notifications.systemUpdates}
 onChange={(enabled) => handlePreferenceChange('systemUpdates', enabled)}
 disabled={isSaving}
 />
 </div>
 </div>

 {}
 <div className="bg-accent-pink/5 border border-accent-pink/20 rounded-lg p-4">
 <div className="flex items-start space-x-3">
 <BellIcon className="w-5 h-5 text-accent-pink flex-shrink-0 mt-0.5" />
 <div>
 <h4 className="text-sm font-semibold text-primary-navy mb-1">About Notifications</h4>
 <p className="text-sm text-neutral-gray">
 You can change these preferences anytime. Critical security and account notifications 
 will always be sent regardless of your preferences.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}