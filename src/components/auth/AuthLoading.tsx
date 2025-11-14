"use client";

import React from "react";
import {
 LayoutSkeleton,
 ProfileSkeleton,
 DashboardSkeleton,
} from "@/components/ui/Skeleton";

interface AuthLoadingProps {
 variant?: "layout" | "profile" | "dashboard" | "minimal";
 message?: string;
 className?: string;
}

export function AuthLoading({
 variant = "minimal",
 message = "Loading...",
 className = "",
}: AuthLoadingProps) {
 if (variant === "layout") {
 return <LayoutSkeleton />;
 }

 if (variant === "dashboard") {
 return (
 <div className={`p-6 ${className}`}>
 <DashboardSkeleton />
 </div>
 );
 }

 if (variant === "profile") {
 return (
 <div className={`p-4 ${className}`}>
 <ProfileSkeleton />
 </div>
 );
 }

 return (
 <div className={`flex items-center justify-center p-8 ${className}`}>
 <div className="flex items-center space-x-3">
 <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-navy border-t-transparent"></div>
 <span className="text-sm text-gray-600 dark:text-gray-400">
 {message}
 </span>
 </div>
 </div>
 );
}

export function AuthLoadingOverlay({
 isVisible,
 message = "Authenticating...",
 className = "",
}: {
 isVisible: boolean;
 message?: string;
 className?: string;
}) {
 if (!isVisible) return null;

 return (
 <div
 className={`fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center ${className}`}
 >
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
 <div className="flex items-center space-x-3">
 <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-navy border-t-transparent"></div>
 <div>
 <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
 {message}
 </h3>
 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
 Please wait while we verify your session
 </p>
 </div>
 </div>
 </div>
 </div>
 );
}

export function OptimisticLoadingIndicator({
 isOptimistic,
 className = "",
}: {
 isOptimistic: boolean;
 className?: string;
}) {
 if (!isOptimistic) return null;

 return (
 <div
 className={`inline-flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 ${className}`}
 >
 <div className="animate-pulse w-2 h-2 bg-primary-neon-yellow rounded-full"></div>
 <span>Updating...</span>
 </div>
 );
}
