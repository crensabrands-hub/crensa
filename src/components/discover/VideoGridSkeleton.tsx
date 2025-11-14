'use client';

import { Skeleton } from '@/components/ui/Skeleton';

interface VideoGridSkeletonProps {
 count?: number;
 className?: string;
}

export default function VideoGridSkeleton({ 
 count = 12, 
 className = '' 
}: VideoGridSkeletonProps) {
 return (
 <div className={`space-y-8 ${className}`}>
 {}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
 {Array.from({ length: count }).map((_, index) => (
 <VideoCardSkeleton key={index} />
 ))}
 </div>
 </div>
 );
}

function VideoCardSkeleton() {
 return (
 <div className="bg-white rounded-lg shadow-sm border border-neutral-light-gray overflow-hidden">
 {}
 <div className="aspect-video relative">
 <Skeleton className="absolute inset-0" />
 
 {}
 <div className="absolute top-3 right-3">
 <Skeleton width={60} height={24} className="rounded-full" />
 </div>
 <div className="absolute bottom-3 right-3">
 <Skeleton width={40} height={20} className="rounded" />
 </div>
 <div className="absolute top-3 left-3">
 <Skeleton width={50} height={20} className="rounded" />
 </div>
 </div>

 {}
 <div className="p-4 space-y-3">
 {}
 <div className="space-y-2">
 <Skeleton height={16} width="90%" />
 <Skeleton height={16} width="70%" />
 </div>

 {}
 <div className="flex items-center space-x-2">
 <Skeleton width={24} height={24} rounded />
 <Skeleton height={14} width="60%" />
 </div>

 {}
 <div className="flex items-center justify-between">
 <Skeleton height={12} width="40%" />
 <Skeleton height={12} width="30%" />
 </div>

 {}
 <div className="flex space-x-1">
 <Skeleton height={20} width={40} className="rounded-full" />
 <Skeleton height={20} width={35} className="rounded-full" />
 </div>
 </div>
 </div>
 );
}

export { VideoCardSkeleton };