"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNotificationCount } from "@/hooks/useNotificationCount";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { getMemberNavigationItems, getNavigationContext, isMemberAccessibleRoute } from "@/lib/navigation-utils";
import { useCallback, useMemo } from "react";

export interface NavigationItem {
 name: string;
 href: string;
 icon: string;
 description?: string;
 badge?: number;
 showBadgeAsCoins?: boolean;
 isActive?: boolean;
 isAccessible?: boolean;
}

export interface NavigationContext {
 section: string;
 title: string;
 showBackButton: boolean;
 breadcrumbs: Array<{ label: string; href: string; active: boolean }>;
}

export function useMemberNavigation() {
 const pathname = usePathname();
 const router = useRouter();
 const { userProfile, hasRole } = useAuthContext();
 const { unreadCount } = useNotificationCount();
 const { balance } = useWalletBalance(false); // Don't auto-refresh to avoid performance issues

 const navigationItems = useMemo(() => {
 const coinBalance = balance?.balance;
 const items = getMemberNavigationItems(unreadCount, coinBalance);
 
 return items.map(item => ({
 ...item,
 isActive: pathname === item.href || pathname.startsWith(item.href + '/'),
 isAccessible: isMemberAccessibleRoute(item.href)
 }));
 }, [pathname, unreadCount, balance?.balance]);

 const navigationContext = useMemo(() => {
 return getNavigationContext(pathname, userProfile?.role);
 }, [pathname, userProfile?.role]);

 const navigateTo = useCallback((href: string) => {
 router.push(href);
 }, [router]);

 const navigateBack = useCallback(() => {
 router.back();
 }, [router]);

 const navigateToDashboard = useCallback(() => {
 router.push('/dashboard');
 }, [router]);

 const isCurrentRouteAccessible = useMemo(() => {
 return isMemberAccessibleRoute(pathname);
 }, [pathname]);

 const activeNavigationItem = useMemo(() => {
 return navigationItems.find(item => item.isActive);
 }, [navigationItems]);

 const getNavigationItemsBySection = useCallback((section: 'content' | 'account' | 'general') => {
 const sectionMap: Record<string, string[]> = {
 content: ['Home', 'Browse', 'My Library'],
 account: ['Coin Balance', 'Settings'],
 general: []
 };

 return navigationItems.filter(item => 
 sectionMap[section].includes(item.name)
 );
 }, [navigationItems]);

 const hasMemberAccess = useMemo(() => {
 return hasRole('member') || hasRole('creator'); // Creators can also access member features
 }, [hasRole]);

 return {

 navigationItems,
 navigationContext,
 activeNavigationItem,
 isCurrentRouteAccessible,
 hasMemberAccess,

 navigateTo,
 navigateBack,
 navigateToDashboard,
 getNavigationItemsBySection,

 currentPath: pathname,
 unreadNotifications: unreadCount,
 userRole: userProfile?.role
 };
}

export default useMemberNavigation;