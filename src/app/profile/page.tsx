'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import CreatorProfileView from '@/components/profile/CreatorProfileView';
import MemberProfileView from '@/components/profile/MemberProfileView';
import ProfileForm from '@/components/profile/ProfileForm';
import { ProfileErrorBoundary, ProfileComponentErrorBoundary } from '@/components/profile/ProfileErrorBoundary';
import { ArrowLeftIcon, ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
 const { userProfile, isLoading, retry } = useAuthContext();
 const [isEditing, setIsEditing] = useState(false);
 const [profileError, setProfileError] = useState<string | null>(null);
 const [isRetrying, setIsRetrying] = useState(false);
 const router = useRouter();

 const handleRetryProfile = async () => {
 setIsRetrying(true);
 setProfileError(null);
 
 try {
 await retry();
 } catch (error) {
 console.error('Failed to refresh profile:', error);
 setProfileError('Failed to refresh profile. Please try reloading the page.');
 } finally {
 setIsRetrying(false);
 }
 };

 const handleBackToDashboard = () => {
 router.push('/dashboard');
 };

 if (isLoading || isRetrying) {
 return (
 <div className="min-h-screen bg-neutral-gray/5 flex items-center justify-center">
 <div className="text-center">
 <div className="w-8 h-8 animate-spin rounded-full border-2 border-accent-pink/20 border-t-accent-pink mx-auto mb-4"></div>
 <p className="text-neutral-gray">
 {isRetrying ? 'Refreshing your profile...' : 'Loading your profile...'}
 </p>
 </div>
 </div>
 );
 }

 if (!userProfile) {
 return (
 <div className="min-h-screen bg-neutral-gray/5 flex items-center justify-center p-4">
 <div className="max-w-md w-full bg-neutral-white rounded-lg shadow-lg p-6 text-center">
 <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-amber-500 mb-4" />
 
 <h1 className="text-xl font-bold text-primary-navy mb-2">
 Profile Not Available
 </h1>
 
 <p className="text-neutral-gray mb-6">
 We couldn&apos;t load your profile information. This might be because you&apos;re not signed in or there&apos;s a temporary issue.
 </p>

 {profileError && (
 <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
 {profileError}
 </div>
 )}

 <div className="space-y-3">
 <button
 onClick={handleRetryProfile}
 disabled={isRetrying}
 className="w-full flex items-center justify-center space-x-2 bg-accent-pink text-neutral-white px-4 py-3 rounded-lg hover:bg-accent-pink/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent-pink focus:ring-offset-2"
 >
 <ArrowPathIcon className="w-4 h-4" />
 <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
 </button>
 
 <button
 onClick={handleBackToDashboard}
 className="w-full flex items-center justify-center space-x-2 border border-primary-navy text-primary-navy px-4 py-3 rounded-lg hover:bg-primary-navy hover:text-neutral-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-navy focus:ring-offset-2"
 >
 <HomeIcon className="w-4 h-4" />
 <span>Go to Dashboard</span>
 </button>
 
 <Link
 href="/sign-in"
 className="block w-full text-center text-accent-pink hover:text-accent-pink/80 font-medium transition-colors duration-200 focus:outline-none focus:underline"
 >
 Sign In
 </Link>
 </div>

 <div className="mt-6 pt-4 border-t border-neutral-gray/20">
 <Link
 href="/help"
 className="text-sm text-neutral-gray hover:text-primary-navy transition-colors duration-200 focus:outline-none focus:underline"
 >
 Need help? Contact Support
 </Link>
 </div>
 </div>
 </div>
 );
 }

 const handleEditComplete = () => {
 setIsEditing(false);
 };

 return (
 <ProfileErrorBoundary>
 <div className="min-h-screen bg-neutral-gray/5">
 <div className="container mx-auto px-4 py-8">
 {}
 <div className="flex items-center justify-between mb-8">
 <div className="flex items-center space-x-4">
 {isEditing && (
 <button
 onClick={() => setIsEditing(false)}
 className="p-2 rounded-lg hover:bg-neutral-white transition-colors duration-200"
 aria-label="Back to profile"
 >
 <ArrowLeftIcon className="w-5 h-5 text-primary-navy" />
 </button>
 )}
 <h1 className="text-3xl font-bold text-primary-navy">
 {isEditing ? 'Edit Profile' : 'My Profile'}
 </h1>
 </div>
 </div>

 {}
 <div className="max-w-4xl mx-auto">
 {isEditing ? (
 <div className="bg-neutral-white rounded-lg shadow-lg p-6">
 <ProfileComponentErrorBoundary componentName="Profile Editor">
 <ProfileForm
 onSave={handleEditComplete}
 onCancel={() => setIsEditing(false)}
 />
 </ProfileComponentErrorBoundary>
 </div>
 ) : (
 <ProfileComponentErrorBoundary componentName="Profile View">
 {userProfile.role === 'creator' ? (
 <CreatorProfileView
 profile={userProfile as any}
 onEdit={() => setIsEditing(true)}
 />
 ) : (
 <MemberProfileView
 profile={userProfile as any}
 onEdit={() => setIsEditing(true)}
 />
 )}
 </ProfileComponentErrorBoundary>
 )}
 </div>
 </div>
 </div>
 </ProfileErrorBoundary>
 );
}