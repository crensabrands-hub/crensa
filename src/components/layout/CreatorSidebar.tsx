"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useResponsive, useSidebarTouch } from "@/hooks/useResponsive";
import { useCreatorStats } from "@/hooks/useCreatorStats";
import {
 getSidebarWidth,
 getTouchOptimizedSpacing,
 getOptimizedAnimationClasses,
 prefersReducedMotion,
} from "@/lib/mobile-optimization";

const DashboardIcon = () => (
 <svg
 className="w-5 h-5"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
 />
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
 />
 </svg>
);

const UploadIcon = () => (
 <svg
 className="w-5 h-5"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
 />
 </svg>
);

const AnalyticsIcon = () => (
 <svg
 className="w-5 h-5"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
 />
 </svg>
);

const VideosIcon = () => (
 <svg
 className="w-5 h-5"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
 />
 </svg>
);

const SeriesIcon = () => (
 <svg
 className="w-5 h-5"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
 />
 </svg>
);

const SettingsIcon = () => (
 <svg
 className="w-5 h-5"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
 />
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
 />
 </svg>
);

interface NavigationItem {
 name: string;
 href: string;
 icon: React.ComponentType;
 badge?: number;
 getBadge?: (stats: any) => number | undefined;
}

const getNavigationItems = (stats: any): NavigationItem[] => [
 {
 name: "Dashboard",
 href: "/creator/dashboard",
 icon: DashboardIcon,
 },
 {
 name: "Upload Video",
 href: "/creator/upload",
 icon: UploadIcon,
 badge: stats?.draftVideos || undefined,
 },
 {
 name: "Manage Series",
 href: "/creator/series",
 icon: SeriesIcon,
 badge: stats?.totalSeries || undefined,
 },
 {
 name: "Analytics",
 href: "/creator/analytics",
 icon: AnalyticsIcon,
 },
 {
 name: "Manage Videos",
 href: "/creator/videos",
 icon: VideosIcon,
 badge: stats?.totalVideos || undefined,
 },
 {
 name: "Settings",
 href: "/creator/settings",
 icon: SettingsIcon,
 },
];

interface CreatorSidebarProps {
 isOpen: boolean;
 onClose: () => void;
 isCollapsed?: boolean;
 onToggleCollapse?: () => void;
}

export default function CreatorSidebar({
 isOpen,
 onClose,
 isCollapsed = false,
 onToggleCollapse,
}: CreatorSidebarProps) {
 const pathname = usePathname();
 const { userProfile } = useAuthContext();
 const { isMobile, isTablet, isTouchDevice, isSmallMobile } = useResponsive();
 const { sidebarTouchHandlers } = useSidebarTouch(onClose, isOpen);
 const { stats, loading: statsLoading } = useCreatorStats();

 const isActiveRoute = (href: string) => {
 return pathname === href || pathname.startsWith(href + "/");
 };

 const navigationItems = getNavigationItems(stats);

 const sidebarWidthClass = getSidebarWidth(isCollapsed, isMobile, isTablet);
 const touchSpacing = getTouchOptimizedSpacing(isTouchDevice);
 const animationClasses = getOptimizedAnimationClasses(
 prefersReducedMotion(),
 isMobile
 );

 return (
 <>
 {}
 <aside
 className={`fixed top-0 left-0 h-full bg-neutral-white shadow-xl border-r border-neutral-gray ${animationClasses} ${
 isOpen ? "translate-x-0" : "-translate-x-full"
 } ${sidebarWidthClass} ${isSmallMobile ? "w-full" : ""} ${
 isMobile ? "z-50" : "z-40"
 }`}
 {...sidebarTouchHandlers}
 role="navigation"
 aria-label="Creator navigation"
 aria-hidden={!isOpen}
 style={{
 position: "fixed",
 top: 0,
 left: 0,
 height: "100vh",
 zIndex: isMobile ? 50 : 40,
 }}
 >
 <div className="flex flex-col h-full">
 {}
 <div
 className={`${
 isCollapsed && !isMobile
 ? "flex justify-center p-4"
 : "flex items-center justify-between p-6"
 } border-b border-neutral-gray`}
 >
 <Link
 href="/creator/dashboard"
 className={`flex items-center group ${
 isCollapsed && !isMobile ? "justify-center" : "space-x-3"
 }`}
 onClick={isMobile ? onClose : undefined}
 >
 <div
 className={`${
 isCollapsed && !isMobile ? "w-12 h-12" : "w-10 h-10"
 } bg-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
 >
 <span
 className={`text-primary-navy font-bold ${
 isCollapsed && !isMobile ? "text-2xl" : "text-xl"
 }`}
 >
 C
 </span>
 </div>
 {(!isCollapsed || isMobile) && (
 <div>
 <span className="font-bold text-xl text-primary-navy">
 Crensa
 </span>
 <p className="text-sm text-neutral-dark-gray">
 Creator Studio
 </p>
 </div>
 )}
 </Link>

 {}
 {isMobile && (
 <button
 onClick={onClose}
 className="p-2 rounded-lg hover:bg-neutral-gray focus:outline-none focus:ring-2 focus:ring-primary-neon-yellow transition-colors duration-200"
 aria-label="Close sidebar"
 >
 <svg
 className="w-5 h-5 text-neutral-dark-gray"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M6 18L18 6M6 6l12 12"
 />
 </svg>
 </button>
 )}
 </div>

 {}
 {(!isCollapsed || isMobile) && (
 <div className="p-6 border-b border-neutral-gray">
 <div className="flex items-center space-x-3">
 <div className="w-14 h-14 bg-gradient-to-br from-accent-pink to-accent-teal rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/20 aspect-square">
 <span className="text-neutral-white font-bold text-xl leading-none select-none">
 {userProfile?.username?.charAt(0).toUpperCase() || "C"}
 </span>
 </div>
 <div className="flex-1 min-w-0">
 <p className="font-bold text-primary-navy truncate text-lg">
 {userProfile?.username || "Creator"}
 </p>
 <p className="text-sm text-neutral-dark-gray font-medium">
 Creator Account
 </p>
 </div>
 </div>
 </div>
 )}

 {}
 {isCollapsed && !isMobile && (
 <div className="p-4 border-b border-neutral-gray flex justify-center">
 <div
 className="w-12 h-12 bg-gradient-to-br from-accent-pink to-accent-teal rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 shadow-lg ring-2 ring-white/20 aspect-square"
 title={userProfile?.username || "Creator"}
 >
 <span className="text-neutral-white font-bold text-lg leading-none select-none">
 {userProfile?.username?.charAt(0).toUpperCase() || "C"}
 </span>
 </div>
 </div>
 )}

 {}
 <nav
 className={`flex-1 overflow-y-auto ${
 isCollapsed && !isMobile ? "p-2" : "p-4"
 }`}
 >
 <ul className="space-y-2">
 {navigationItems.map((item) => {
 const Icon = item.icon;
 const isActive = isActiveRoute(item.href);

 return (
 <li key={item.name}>
 <Link
 href={item.href}
 onClick={isMobile ? onClose : undefined}
 className={`flex items-center rounded-lg ${animationClasses} group relative transition-all duration-200 ${
 isCollapsed && !isMobile
 ? "justify-center w-12 h-12 mx-auto"
 : `${touchSpacing.listItemPadding} ${touchSpacing.minTouchTarget} space-x-3`
 } ${
 isActive
 ? "bg-primary-neon-yellow text-primary-navy shadow-sm"
 : "text-neutral-dark-gray hover:bg-neutral-gray hover:text-primary-navy"
 }`}
 style={{
 WebkitTapHighlightColor: "transparent",
 touchAction: "manipulation",
 }}
 title={isCollapsed && !isMobile ? item.name : undefined}
 role="menuitem"
 tabIndex={isOpen ? 0 : -1}
 >
 <div
 className={`${
 isCollapsed && !isMobile
 ? "flex items-center justify-center w-full h-full"
 : ""
 }`}
 >
 <Icon />
 </div>
 {(!isCollapsed || isMobile) && (
 <>
 <span className="font-medium">{item.name}</span>
 {item.badge !== undefined && item.badge > 0 && (
 <span className="ml-auto bg-accent-pink text-neutral-white text-xs font-semibold px-2 py-1 rounded-full">
 {statsLoading ? "..." : item.badge}
 </span>
 )}
 </>
 )}

 {}
 {isCollapsed && !isMobile && (
 <div
 className="absolute left-full ml-4 px-3 py-2 bg-primary-navy text-neutral-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none"
 style={{ zIndex: 9999 }}
 >
 {item.name}
 {item.badge !== undefined && item.badge > 0 && (
 <span className="ml-2 bg-accent-pink text-neutral-white text-xs font-semibold px-2 py-1 rounded-full">
 {statsLoading ? "..." : item.badge}
 </span>
 )}
 <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-primary-navy rotate-45"></div>
 </div>
 )}
 </Link>
 </li>
 );
 })}
 </ul>
 </nav>

 {}
 {(!isCollapsed || isMobile) && (
 <div className="p-4 border-t border-neutral-gray">
 <div className="bg-gradient-to-r from-accent-pink/10 to-accent-teal/10 rounded-lg p-4">
 <h4 className="font-semibold text-primary-navy text-sm mb-2">
 Need Help?
 </h4>
 <p className="text-xs text-neutral-dark-gray mb-3">
 Check out our creator resources and support center.
 </p>
 <Link
 href="/creator/help"
 className="text-xs font-medium text-accent-pink hover:text-accent-bright-pink transition-colors duration-200"
 onClick={isMobile ? onClose : undefined}
 >
 Get Support →
 </Link>
 </div>
 </div>
 )}

 {}
 {isCollapsed && !isMobile && (
 <div className="p-2 border-t border-neutral-gray flex justify-center">
 <Link
 href="/creator/help"
 className="w-12 h-12 rounded-lg hover:bg-neutral-gray transition-colors duration-200 group relative flex items-center justify-center"
 title="Get Support"
 >
 <svg
 className="w-5 h-5 text-neutral-dark-gray"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
 />
 </svg>

 {}
 <div
 className="absolute left-full ml-4 px-3 py-2 bg-primary-navy text-neutral-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none"
 style={{ zIndex: 9999 }}
 >
 Get Support
 <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-primary-navy rotate-45"></div>
 </div>
 </Link>
 </div>
 )}
 </div>
 </aside>
 </>
 );
}
