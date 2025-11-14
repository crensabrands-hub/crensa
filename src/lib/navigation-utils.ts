

import type { UserRole } from "@/contexts/AuthContext";

export function getHomeUrl(
 isSignedIn: boolean,
 userRole?: UserRole | null
): string {
 if (
 isSignedIn &&
 userRole &&
 (userRole === "creator" || userRole === "member")
 ) {
 return userRole === "creator" ? "/creator/dashboard" : "/dashboard";
 }
 return "/";
}

export function getDashboardUrl(userRole: UserRole): string {
 return userRole === "creator" ? "/creator/dashboard" : "/dashboard";
}

export function isDashboardRoute(pathname: string): boolean {
 return pathname === "/dashboard" || pathname.startsWith("/creator/");
}

export function isLandingPage(pathname: string): boolean {
 return pathname === "/";
}

export function shouldHideLandingPage(
 isSignedIn: boolean,
 pathname: string
): boolean {
 return isSignedIn && isLandingPage(pathname);
}

export function getMemberNavigationItems(unreadCount: number = 0, coinBalance?: number) {
 return [
 {
 name: "Home",
 href: "/dashboard",
 icon: "home",
 description: "View your personalized dashboard and activity overview",
 },
 {
 name: "Browse",
 href: "/discover",
 icon: "search",
 description: "Explore new videos and creators",
 },
 {
 name: "My Library",
 href: "/history",
 icon: "play",
 description: "View your watch history and recently viewed content",
 },
 {
 name: "My Series",
 href: "/member/series",
 icon: "collection",
 description: "View your purchased series and continue watching",
 },
 {
 name: "Coin Balance",
 href: "/wallet",
 icon: "wallet",
 description: "View your coin balance and transaction history",
 badge: coinBalance,
 showBadgeAsCoins: true,
 },
 {
 name: "Settings",
 href: "/preferences",
 icon: "settings",
 description:
 "Configure your notification, privacy, and playback preferences",
 },
 ];
}

export function isMemberAccessibleRoute(pathname: string): boolean {
 const memberRoutes = [
 "/dashboard",
 "/discover",
 "/history",
 "/member/series",
 "/wallet",
 "/preferences",
 "/watch",
 "/payment",
 ];

 return memberRoutes.some((route) => pathname.startsWith(route));
}

export function getNavigationContext(
 pathname: string,
 userRole?: UserRole | null
) {
 const context = {
 section: "general",
 title: "Dashboard",
 showBackButton: false,
 breadcrumbs: [] as Array<{ label: string; href: string; active: boolean }>,
 };

 if (userRole === "member") {
 if (pathname === "/dashboard") {
 context.section = "dashboard";
 context.title = "Dashboard";
 } else if (pathname.startsWith("/discover")) {
 context.section = "content";
 context.title = "Discover";
 context.breadcrumbs = [
 { label: "Dashboard", href: "/dashboard", active: false },
 { label: "Discover", href: "/discover", active: true },
 ];
 } else if (pathname.startsWith("/reels")) {
 context.section = "content";
 context.title = "Reels";
 context.breadcrumbs = [
 { label: "Dashboard", href: "/dashboard", active: false },
 { label: "Reels", href: "/reels", active: true },
 ];
 } else if (pathname.startsWith("/member/series")) {
 context.section = "content";
 context.title = "My Series";
 context.breadcrumbs = [
 { label: "Dashboard", href: "/dashboard", active: false },
 { label: "My Series", href: "/member/series", active: true },
 ];
 } else if (pathname.startsWith("/wallet")) {
 context.section = "account";
 context.title = "Wallet";
 context.breadcrumbs = [
 { label: "Dashboard", href: "/dashboard", active: false },
 { label: "Wallet", href: "/wallet", active: true },
 ];
 } else if (pathname.startsWith("/membership")) {
 context.section = "account";
 context.title = "Membership";
 context.breadcrumbs = [
 { label: "Dashboard", href: "/dashboard", active: false },
 { label: "Membership", href: "/membership", active: true },
 ];
 } else if (pathname.startsWith("/profile")) {
 context.section = "account";
 context.title = "Profile";
 context.breadcrumbs = [
 { label: "Dashboard", href: "/dashboard", active: false },
 { label: "Profile", href: "/profile", active: true },
 ];
 } else if (pathname.startsWith("/settings")) {
 context.section = "account";
 context.title = "Settings";
 context.breadcrumbs = [
 { label: "Dashboard", href: "/dashboard", active: false },
 { label: "Settings", href: "/settings", active: true },
 ];
 } else if (pathname.startsWith("/help")) {
 context.section = "support";
 context.title = "Help & Support";
 context.breadcrumbs = [
 { label: "Dashboard", href: "/dashboard", active: false },
 { label: "Help", href: "/help", active: true },
 ];
 }
 }

 return context;
}
