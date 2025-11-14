"use client";

import React from "react";
import { LayoutState } from "@/contexts/LayoutContext";

export function LayoutSkeleton() {
 return (
 <div className="min-h-screen bg-gray-50 animate-pulse">
 <div className="flex">
 {}
 <div className="w-64 bg-white shadow-sm">
 <div className="p-4">
 <div className="h-8 bg-gray-200 rounded mb-4"></div>
 <div className="space-y-2">
 {[...Array(6)].map((_, i) => (
 <div key={i} className="h-10 bg-gray-200 rounded"></div>
 ))}
 </div>
 </div>
 </div>

 {}
 <div className="flex-1">
 {}
 <div className="h-16 bg-white shadow-sm border-b">
 <div className="flex items-center justify-between h-full px-6">
 <div className="h-6 bg-gray-200 rounded w-48"></div>
 <div className="h-8 bg-gray-200 rounded w-32"></div>
 </div>
 </div>

 {}
 <div className="p-6">
 <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {[...Array(6)].map((_, i) => (
 <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
 <div className="h-4 bg-gray-200 rounded mb-2"></div>
 <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
 <div className="h-4 bg-gray-200 rounded w-1/2"></div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

export function LayoutLoading({
 message = "Loading...",
 layoutType = "public",
 showMinimal = false,
 isInitialLoad = false,
}: {
 message?: string;
 layoutType?: "creator" | "member" | "public";
 showMinimal?: boolean;
 isInitialLoad?: boolean;
}) {

 if (isInitialLoad && layoutType === "public" && showMinimal) {
 return null;
 }

 const AnimatedTextLoader = React.lazy(() =>
 import("@/components/ui/AnimatedTextLoader").then((mod) => ({
 default: mod.AnimatedTextLoader,
 }))
 );

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
 <div className="w-full max-w-md px-8">
 <React.Suspense
 fallback={
 <div className="text-center">
 <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
 <p className="text-gray-600">{message}</p>
 </div>
 }
 >
 <AnimatedTextLoader text="CRENSA" />
 </React.Suspense>
 </div>
 </div>
 );
}

export function LayoutTransition({
 children,
 currentLayout,
 expectedLayout,
}: {
 children: React.ReactNode;
 currentLayout: "creator" | "member" | "public";
 expectedLayout: "creator" | "member" | "public";
}) {
 const [isTransitioning, setIsTransitioning] = React.useState(false);
 const [displayLayout, setDisplayLayout] = React.useState(currentLayout);

 React.useEffect(() => {
 if (currentLayout !== expectedLayout) {
 setIsTransitioning(true);

 const timer = setTimeout(() => {
 setDisplayLayout(expectedLayout);
 setIsTransitioning(false);
 }, 150);

 return () => clearTimeout(timer);
 } else {
 setDisplayLayout(currentLayout);
 setIsTransitioning(false);
 }
 }, [currentLayout, expectedLayout]);

 return (
 <div
 className={`transition-opacity duration-300 ease-in-out ${
 isTransitioning ? "opacity-0" : "opacity-100"
 }`}
 >
 {children}
 </div>
 );
}

export function validateLayoutState(state: Partial<LayoutState>): boolean {
 try {

 if (
 state.currentLayout &&
 !["creator", "member", "public"].includes(state.currentLayout)
 ) {
 return false;
 }

 if (state.preferences) {
 const { sidebarCollapsed, theme, compactMode } = state.preferences;
 if (
 typeof sidebarCollapsed !== "boolean" ||
 !["light", "dark", "auto"].includes(theme) ||
 typeof compactMode !== "boolean"
 ) {
 return false;
 }
 }

 if (state.navigation) {
 const { activeRoute, breadcrumbs, sidebarOpen, mobileMenuOpen } =
 state.navigation;
 if (
 typeof activeRoute !== "string" ||
 !Array.isArray(breadcrumbs) ||
 typeof sidebarOpen !== "boolean" ||
 typeof mobileMenuOpen !== "boolean"
 ) {
 return false;
 }
 }

 return true;
 } catch (error) {
 console.error("Layout state validation error:", error);
 return false;
 }
}

export const layoutStorage = {
 get: (key: string): any => {
 try {
 const item = localStorage.getItem(key);
 return item ? JSON.parse(item) : null;
 } catch (error) {
 console.error(`Failed to get ${key} from localStorage:`, error);
 return null;
 }
 },

 set: (key: string, value: any): boolean => {
 try {
 localStorage.setItem(key, JSON.stringify(value));
 return true;
 } catch (error) {
 console.error(`Failed to set ${key} in localStorage:`, error);
 return false;
 }
 },

 remove: (key: string): boolean => {
 try {
 localStorage.removeItem(key);
 return true;
 } catch (error) {
 console.error(`Failed to remove ${key} from localStorage:`, error);
 return false;
 }
 },

 getSession: (key: string): any => {
 try {
 const item = sessionStorage.getItem(key);
 return item ? JSON.parse(item) : null;
 } catch (error) {
 console.error(`Failed to get ${key} from sessionStorage:`, error);
 return null;
 }
 },

 setSession: (key: string, value: any): boolean => {
 try {
 sessionStorage.setItem(key, JSON.stringify(value));
 return true;
 } catch (error) {
 console.error(`Failed to set ${key} in sessionStorage:`, error);
 return false;
 }
 },
};

export function getLayoutFromPath(
 pathname: string
): "creator" | "member" | "public" {
 if (pathname.startsWith("/creator")) {
 return "creator";
 }

 if (
 pathname.startsWith("/dashboard") ||
 pathname.startsWith("/profile") ||
 pathname.startsWith("/settings") ||
 pathname.startsWith("/notifications")
 ) {
 return "member";
 }

 return "public";
}

export function generateBreadcrumbs(
 pathname: string
): Array<{ label: string; href: string; active: boolean }> {
 const segments = pathname.split("/").filter(Boolean);
 const breadcrumbs = [];

 let currentPath = "";

 for (let i = 0; i < segments.length; i++) {
 currentPath += `/${segments[i]}`;
 const isLast = i === segments.length - 1;

 breadcrumbs.push({
 label: formatBreadcrumbLabel(segments[i]),
 href: currentPath,
 active: isLast,
 });
 }

 return breadcrumbs;
}

function formatBreadcrumbLabel(segment: string): string {

 return segment.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function ProgressiveLayoutLoader({
 layoutType,
 children,
 isAuthenticated = false,
 userRole = null,
}: {
 layoutType: "creator" | "member" | "public";
 children: React.ReactNode;
 isAuthenticated?: boolean;
 userRole?: "creator" | "member" | null;
}) {
 const [loadingStage, setLoadingStage] = React.useState<
 "initial" | "layout" | "content" | "complete"
 >("initial");
 const [showSkeleton, setShowSkeleton] = React.useState(true);

 React.useEffect(() => {
 if (!isAuthenticated) {

 setLoadingStage("complete");
 setShowSkeleton(false);
 return;
 }

 const timer1 = setTimeout(() => setLoadingStage("layout"), 50); // Reduced from 100ms
 const timer2 = setTimeout(() => setLoadingStage("content"), 150); // Reduced from 300ms
 const timer3 = setTimeout(() => {
 setLoadingStage("complete");
 setShowSkeleton(false);
 }, 300); // Reduced from 600ms

 return () => {
 clearTimeout(timer1);
 clearTimeout(timer2);
 clearTimeout(timer3);
 };
 }, [isAuthenticated]);

 if (showSkeleton && isAuthenticated) {
 return (
 <div className="relative">
 {}
 <div
 className={`absolute inset-0 z-10 transition-opacity duration-200 ${
 loadingStage === "complete"
 ? "opacity-0 pointer-events-none"
 : "opacity-100"
 }`}
 >
 {layoutType === "creator" && <OptimizedCreatorSkeleton />}
 {layoutType === "member" && <OptimizedMemberSkeleton />}
 </div>

 {}
 <div
 className={`transition-opacity duration-200 ${
 loadingStage === "complete" ? "opacity-100" : "opacity-0"
 }`}
 >
 {children}
 </div>
 </div>
 );
 }

 return <>{children}</>;
}

export function CreatorLayoutSkeleton() {
 return (
 <div className="min-h-screen bg-neutral-gray animate-pulse">
 <div className="flex">
 {}
 <div className="w-64 bg-white shadow-sm">
 <div className="p-4">
 <div className="h-8 bg-gray-200 rounded mb-6"></div>
 <div className="space-y-3">
 {[...Array(5)].map((_, i) => (
 <div key={i} className="flex items-center space-x-3">
 <div className="w-5 h-5 bg-gray-200 rounded"></div>
 <div className="h-4 bg-gray-200 rounded flex-1"></div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {}
 <div className="flex-1">
 <div className="h-16 bg-white shadow-sm border-b">
 <div className="flex items-center justify-between h-full px-6">
 <div className="h-6 bg-gray-200 rounded w-48"></div>
 <div className="flex items-center space-x-4">
 <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
 <div className="h-6 bg-gray-200 rounded w-24"></div>
 </div>
 </div>
 </div>
 <div className="p-6">
 <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
 <div className="h-4 bg-gray-200 rounded mb-2"></div>
 <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
 <div className="h-3 bg-gray-200 rounded w-1/2"></div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

export function MemberLayoutSkeleton() {
 return (
 <div className="min-h-screen bg-neutral-gray animate-pulse">
 {}
 <div className="h-16 bg-white shadow-sm border-b">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between h-full">
 <div className="h-6 bg-gray-200 rounded w-32"></div>
 <div className="flex items-center space-x-6">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="h-4 bg-gray-200 rounded w-16"></div>
 ))}
 </div>
 <div className="flex items-center space-x-4">
 <div className="h-8 bg-gray-200 rounded w-48"></div>
 <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
 </div>
 </div>
 </div>
 </div>

 {}
 <div className="pt-16">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
 <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {[...Array(6)].map((_, i) => (
 <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
 <div className="h-4 bg-gray-200 rounded mb-2"></div>
 <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
 <div className="h-4 bg-gray-200 rounded w-1/2"></div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}

export function FastLoadingIndicator({
 message = "Loading...",
}: {
 message?: string;
}) {
 return (
 <div className="fixed top-0 left-0 right-0 z-50 bg-primary-navy text-white px-3 py-1.5 text-center text-xs sm:text-sm">
 <div className="flex items-center justify-center space-x-2">
 <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 <span className="truncate">{message}</span>
 </div>
 </div>
 );
}

export function OptimizedCreatorSkeleton() {
 return (
 <div className="min-h-screen bg-neutral-gray">
 <div className="flex">
 {}
 <div className="w-64 bg-white shadow-sm">
 <div className="p-4">
 <div className="h-6 bg-gray-200 rounded mb-4"></div>
 <div className="space-y-2">
 {[...Array(5)].map((_, i) => (
 <div key={i} className="flex items-center space-x-3">
 <div className="w-4 h-4 bg-gray-200 rounded"></div>
 <div className="h-3 bg-gray-200 rounded flex-1"></div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {}
 <div className="flex-1">
 <div className="h-14 bg-white shadow-sm border-b">
 <div className="flex items-center justify-between h-full px-4">
 <div className="h-4 bg-gray-200 rounded w-32"></div>
 <div className="flex items-center space-x-3">
 <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
 <div className="h-4 bg-gray-200 rounded w-20"></div>
 </div>
 </div>
 </div>
 <div className="p-4">
 <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="bg-white p-3 rounded-lg shadow-sm">
 <div className="h-3 bg-gray-200 rounded mb-2"></div>
 <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
 <div className="h-2 bg-gray-200 rounded w-1/2"></div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

export function OptimizedMemberSkeleton() {
 return (
 <div className="min-h-screen bg-neutral-gray">
 {}
 <div className="h-14 bg-white shadow-sm border-b">
 <div className="max-w-7xl mx-auto px-4">
 <div className="flex items-center justify-between h-full">
 <div className="h-4 bg-gray-200 rounded w-24"></div>
 <div className="hidden md:flex items-center space-x-4">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="h-3 bg-gray-200 rounded w-12"></div>
 ))}
 </div>
 <div className="flex items-center space-x-3">
 <div className="h-6 bg-gray-200 rounded w-32"></div>
 <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
 </div>
 </div>
 </div>
 </div>

 {}
 <div className="pt-14">
 <div className="max-w-7xl mx-auto px-4 py-4">
 <div className="h-5 bg-gray-200 rounded w-36 mb-4"></div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {[...Array(6)].map((_, i) => (
 <div key={i} className="bg-white p-3 rounded-lg shadow-sm">
 <div className="h-3 bg-gray-200 rounded mb-2"></div>
 <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
 <div className="h-3 bg-gray-200 rounded w-1/2"></div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}
