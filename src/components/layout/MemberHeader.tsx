"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLayout } from "@/contexts/LayoutContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useResponsive } from "@/hooks/useResponsive";
import { useMemberNavigation } from "@/hooks/useMemberNavigation";
import { useSearch } from "@/hooks/useSearch";
import { getHomeUrl } from "@/lib/navigation-utils";
import { ProfileDropdown } from "@/components/profile";
import { SearchResults } from "@/components/search";
import {
 getTouchOptimizedSpacing,
 getOptimizedAnimationClasses,
 prefersReducedMotion,
} from "@/lib/mobile-optimization";

interface MemberHeaderProps {
 onSidebarToggle?: () => void;
 sidebarOpen?: boolean;
}

export default function MemberHeader({
 onSidebarToggle,
 sidebarOpen = false,
}: MemberHeaderProps) {
 const { user, userProfile } = useAuthContext();
 const { navigation } = useLayout();
 const { unreadCount } = useNotifications();
 const { isMobile, isTablet, isTouchDevice, isSmallMobile } = useResponsive();
 const { navigationItems } = useMemberNavigation();

 const {
 query,
 results,
 loading,
 error,
 isOpen: searchOpen,
 selectedIndex,
 setQuery,
 setIsOpen: setSearchOpen,
 clearResults,
 handleKeyboardNavigation,
 handleResultClick,
 } = useSearch({
 debounceMs: 300,
 minQueryLength: 2,
 maxResults: 8,
 });

 const searchInputRef = useRef<HTMLInputElement>(null);
 const searchContainerRef = useRef<HTMLDivElement>(null);

 const touchSpacing = getTouchOptimizedSpacing(isTouchDevice);
 const animationClasses = getOptimizedAnimationClasses(
 prefersReducedMotion(),
 isMobile
 );

 const homeUrl = getHomeUrl(!!user, userProfile?.role)

 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
 setSearchOpen(false);
 }
 };

 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, [setSearchOpen]);

 const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const value = e.target.value;
 setQuery(value);
 };

 const handleSearchInputFocus = () => {
 if (query.length >= 2) {
 setSearchOpen(true);
 }
 };

 const handleSearchInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {

 if (searchContainerRef.current?.contains(e.relatedTarget as Node)) {
 return;
 }

 setTimeout(() => setSearchOpen(false), 150);
 };

 const handleSearchClear = () => {
 clearResults();
 if (searchInputRef.current) {
 searchInputRef.current.focus();
 }

 };

 const getIconSvg = (iconName: string) => {
 const icons = {
 home: (
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
 />
 ),
 search: (
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
 />
 ),
 play: (
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
 />
 ),
 star: (
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
 />
 ),
 wallet: (
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
 />
 ),
 bell: (
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
 />
 ),
 menu: (
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M4 6h16M4 12h16M4 18h16"
 />
 ),
 close: (
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M6 18L18 6M6 6l12 12"
 />
 ),
 };
 return icons[iconName as keyof typeof icons] || icons.search;
 };

 return (
 <header className="sticky top-0 z-40 bg-neutral-white border-b border-neutral-light-gray shadow-sm w-full">
 <div className="px-4 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between h-16">
 {}
 <div className="flex items-center space-x-4">
 {}
 {onSidebarToggle && (
 <button
 onClick={onSidebarToggle}
 className={`${touchSpacing.buttonPadding} ${touchSpacing.minTouchTarget} rounded-lg hover:bg-neutral-light-gray ${animationClasses} focus:outline-none focus:ring-2 focus:ring-accent-pink focus:ring-offset-2`}
 aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
 style={{
 WebkitTapHighlightColor: "transparent",
 touchAction: "manipulation",
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
 )}

 <Link
 href={homeUrl}
 className="flex items-center space-x-2 group focus:outline-none focus:ring-2 focus:ring-primary-neon-yellow focus:ring-offset-2 rounded-lg"
 >
 <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-sm">
 <span className="text-primary-navy font-bold text-lg">C</span>
 </div>
 <span className="text-xl font-bold text-primary-navy group-hover:text-primary-navy/80 transition-colors duration-200">
 Crensa
 </span>
 </Link>
 </div>

 {}
 {onSidebarToggle && !isMobile && (
 <div className="flex-1 text-center">
 <h1 className="text-lg font-semibold text-primary-navy">
 {navigation.breadcrumbs.length > 0 
 ? navigation.breadcrumbs[navigation.breadcrumbs.length - 1].label 
 : 'Member Dashboard'}
 </h1>
 </div>
 )}

 {}
 <div className="flex items-center space-x-4">
 {}
 {!isMobile && (
 <div className="relative" ref={searchContainerRef}>
 <input
 ref={searchInputRef}
 type="text"
 value={query}
 onChange={handleSearchInputChange}
 onFocus={handleSearchInputFocus}
 onBlur={handleSearchInputBlur}
 placeholder="Search videos..."
 className={`${
 isTablet ? "w-48" : "w-64"
 } pl-10 pr-10 py-2 border-2 border-neutral-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy focus:border-primary-navy hover:border-neutral-dark-gray ${animationClasses} text-primary-navy placeholder-neutral-dark-gray`}
 aria-label="Search videos"
 aria-expanded={searchOpen}
 aria-haspopup="listbox"
 aria-controls="search-results"
 role="combobox"
 aria-autocomplete="list"
 aria-describedby="search-results"
 />
 <svg
 className="absolute left-3 top-2.5 w-4 h-4 text-neutral-dark-gray pointer-events-none"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 aria-hidden="true"
 >
 {getIconSvg("search")}
 </svg>
 {query && (
 <button
 onClick={handleSearchClear}
 className="absolute right-3 top-2.5 w-4 h-4 text-neutral-dark-gray hover:text-primary-navy transition-colors duration-150"
 aria-label="Clear search"
 type="button"
 >
 <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
 {getIconSvg("close")}
 </svg>
 </button>
 )}
 
 <div id="search-results">
 <SearchResults
 results={results}
 loading={loading}
 error={error}
 query={query}
 isOpen={searchOpen}
 onClose={() => setSearchOpen(false)}
 onResultClick={handleResultClick}
 selectedIndex={selectedIndex}
 onKeyboardNavigation={handleKeyboardNavigation}
 />
 </div>
 </div>
 )}

 {}
 {user && userProfile && <ProfileDropdown />}

 </div>
 </div>

 </div>
 </header>
 );
}
