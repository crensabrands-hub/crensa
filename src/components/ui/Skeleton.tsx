'use client';

import React from 'react';

interface SkeletonProps {
 className?: string;
 width?: string | number;
 height?: string | number;
 rounded?: boolean;
 animate?: boolean;
}

export function Skeleton({ 
 className = '', 
 width, 
 height, 
 rounded = false, 
 animate = true 
}: SkeletonProps) {
 const baseClasses = 'bg-gray-200 dark:bg-gray-700';

 const shouldAnimate = animate && typeof window !== 'undefined' && 
 !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
 !(navigator as any).connection?.effectiveType?.includes('2g');
 
 const animationClasses = shouldAnimate ? 'animate-pulse' : '';
 const roundedClasses = rounded ? 'rounded-full' : 'rounded';
 
 const style: React.CSSProperties = {};
 if (width) style.width = typeof width === 'number' ? `${width}px` : width;
 if (height) style.height = typeof height === 'number' ? `${height}px` : height;

 return (
 <div 
 className={`${baseClasses} ${animationClasses} ${roundedClasses} ${className}`}
 style={style}
 aria-hidden="true"
 />
 );
}

export function ProfileSkeleton() {
 return (
 <div className="flex items-center space-x-3">
 <Skeleton width={40} height={40} rounded className="flex-shrink-0" />
 <div className="flex-1 space-y-2">
 <Skeleton height={16} width="60%" />
 <Skeleton height={12} width="40%" />
 </div>
 </div>
 );
}

export function NavigationSkeleton() {
 return (
 <div className="space-y-2">
 {Array.from({ length: 5 }).map((_, i) => (
 <div key={i} className="flex items-center space-x-3 p-2">
 <Skeleton width={20} height={20} />
 <Skeleton height={16} width="70%" />
 </div>
 ))}
 </div>
 );
}

export function DashboardSkeleton() {
 return (
 <div className="space-y-6">
 {}
 <div className="flex items-center justify-between">
 <div className="space-y-2">
 <Skeleton height={24} width={200} />
 <Skeleton height={16} width={150} />
 </div>
 <Skeleton width={120} height={40} />
 </div>
 
 {}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {Array.from({ length: 3 }).map((_, i) => (
 <div key={i} className="p-4 border rounded-lg space-y-3">
 <Skeleton height={16} width="50%" />
 <Skeleton height={32} width="80%" />
 <Skeleton height={12} width="60%" />
 </div>
 ))}
 </div>
 
 {}
 <div className="space-y-4">
 <Skeleton height={20} width={180} />
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {Array.from({ length: 4 }).map((_, i) => (
 <div key={i} className="p-4 border rounded-lg space-y-3">
 <Skeleton height={120} width="100%" />
 <Skeleton height={16} width="80%" />
 <Skeleton height={12} width="60%" />
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}

export function LayoutSkeleton() {
 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
 {}
 <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-4">
 <Skeleton width={32} height={32} />
 <Skeleton height={20} width={120} />
 </div>
 <div className="flex items-center space-x-3">
 <Skeleton width={32} height={32} rounded />
 <Skeleton width={32} height={32} rounded />
 <ProfileSkeleton />
 </div>
 </div>
 </div>
 
 <div className="flex">
 {}
 <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
 <NavigationSkeleton />
 </div>
 
 {}
 <div className="flex-1 p-6">
 <DashboardSkeleton />
 </div>
 </div>
 </div>
 );
}