'use client';

import React from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import UserSettings from '@/components/profile/UserSettings';

export default function SettingsPage() {
 const { userProfile, isLoading } = useAuthContext();

 if (isLoading) {
 return (
 <div className="min-h-screen bg-neutral-gray/5 flex items-center justify-center">
 <div className="w-8 h-8 animate-spin rounded-full border-2 border-accent-pink/20 border-t-accent-pink"></div>
 </div>
 );
 }

 if (!userProfile) {
 return (
 <div className="min-h-screen bg-neutral-gray/5 flex items-center justify-center">
 <div className="text-center">
 <h1 className="text-2xl font-bold text-primary-navy mb-4">Access Denied</h1>
 <p className="text-neutral-gray">Please sign in to access settings.</p>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-neutral-gray/5">
 <div className="container mx-auto px-4 py-8">
 <div className="max-w-4xl mx-auto">
 <UserSettings />
 </div>
 </div>
 </div>
 );
}