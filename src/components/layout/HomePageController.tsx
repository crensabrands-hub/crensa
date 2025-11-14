'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { getDashboardUrl, shouldHideLandingPage } from '@/lib/navigation-utils';

interface HomePageControllerProps {
 children: React.ReactNode;
}

export default function HomePageController({ children }: HomePageControllerProps) {
 const router = useRouter();
 const pathname = usePathname();
 const { isSignedIn, userProfile, isLoading } = useAuthContext();

 useEffect(() => {

 if (isLoading) {
 return;
 }

 if (!shouldHideLandingPage(isSignedIn, pathname)) {
 return;
 }

 if (userProfile) {
 const redirectPath = getDashboardUrl(userProfile.role);

 router.replace(redirectPath);
 }
 }, [isSignedIn, userProfile, isLoading, router, pathname]);

 if (isLoading && !isSignedIn) {

 return <>{children}</>;
 }

 if (isLoading && isSignedIn) {
 return (
 <div className="fixed top-0 left-0 right-0 z-50 bg-primary-navy text-white px-4 py-2 text-center text-sm">
 <div className="flex items-center justify-center space-x-2">
 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 <span>Checking authentication...</span>
 </div>
 </div>
 );
 }

 if (isSignedIn && userProfile && pathname === '/') {
 return (
 <div className="fixed top-0 left-0 right-0 z-50 bg-primary-navy text-white px-4 py-2 text-center text-sm">
 <div className="flex items-center justify-center space-x-2">
 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 <span>Redirecting to dashboard...</span>
 </div>
 </div>
 );
 }

 return <>{children}</>;
}