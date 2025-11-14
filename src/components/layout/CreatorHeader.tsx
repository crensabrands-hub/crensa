'use client';

import React from 'react';
import Link from 'next/link';
import { useLayout } from '@/contexts/LayoutContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useResponsive } from '@/hooks/useResponsive';
import ProfileDropdown from '@/components/profile/ProfileDropdown';
import Breadcrumbs from './Breadcrumbs';
import { getTouchOptimizedSpacing, getOptimizedAnimationClasses, prefersReducedMotion } from '@/lib/mobile-optimization';

interface CreatorHeaderProps {
 onSidebarToggle: () => void;
 sidebarOpen: boolean;
}

export default function CreatorHeader({ onSidebarToggle, sidebarOpen }: CreatorHeaderProps) {
 const { navigation } = useLayout();
 const { userProfile } = useAuthContext();
 const { unreadCount } = useNotifications();
 const { isMobile, isTablet, isTouchDevice, isSmallMobile } = useResponsive();

 const touchSpacing = getTouchOptimizedSpacing(isTouchDevice);
 const animationClasses = getOptimizedAnimationClasses(prefersReducedMotion(), isMobile);

 return (
 <header className="bg-neutral-white border-b border-neutral-gray shadow-sm">
 <div className="flex items-center justify-between h-16 px-4 md:px-6">
 {}
 <div className="flex items-center space-x-4">
 {}
 <button
 onClick={onSidebarToggle}
 className={`${touchSpacing.buttonPadding} ${touchSpacing.minTouchTarget} rounded-lg hover:bg-neutral-gray ${animationClasses} focus:outline-none focus:ring-2 focus:ring-accent-pink focus:ring-offset-2`}
 aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 }}
 >
 <svg
 className="w-6 h-6 text-neutral-dark-gray"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M4 6h16M4 12h16M4 18h16"
 />
 </svg>
 </button>

 {}
 <Breadcrumbs className="hidden md:flex" />
 </div>

 {}
 <div className="flex items-center space-x-4">
 {}
 <div className={`${isTablet ? 'hidden lg:flex' : 'hidden md:flex'} items-center space-x-2`}>
 {}
 <Link 
 href="/creator/upload"
 className={`btn-primary ${isSmallMobile ? 'text-xs px-2 py-1' : 'text-sm px-4 py-2'} ${touchSpacing.minTouchTarget} inline-flex items-center`}
 >
 <svg className={`${isSmallMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
 </svg>
 {isSmallMobile ? 'Upload' : 'Upload Video'}
 </Link>
 </div>

 {}
 <button
 className={`relative ${touchSpacing.buttonPadding} ${touchSpacing.minTouchTarget} rounded-lg hover:bg-neutral-gray ${animationClasses} focus:outline-none focus:ring-2 focus:ring-accent-pink focus:ring-offset-2`}
 aria-label="Notifications"
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 }}
 >
 <svg
 className="w-6 h-6 text-neutral-dark-gray"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
 />
 </svg>
 {unreadCount > 0 && (
 <span className="absolute -top-1 -right-1 bg-accent-pink text-neutral-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
 {unreadCount > 9 ? '9+' : unreadCount}
 </span>
 )}
 </button>

 {}
 {isMobile && (
 <Link
 href="/creator/upload"
 className={`${touchSpacing.buttonPadding} ${touchSpacing.minTouchTarget} rounded-lg bg-accent-teal text-white hover:bg-accent-teal/90 ${animationClasses} focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-offset-2 flex items-center`}
 aria-label="Upload Video"
 style={{
 WebkitTapHighlightColor: 'transparent',
 touchAction: 'manipulation',
 }}
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
 </svg>
 </Link>
 )}

 {}
 <ProfileDropdown />
 </div>
 </div>
 </header>
 );
}