'use client';

import React from 'react';
import Link from 'next/link';
import { useLayout } from '@/contexts/LayoutContext';
import { useResponsive } from '@/hooks/useResponsive';
import { getHomeUrl } from '@/lib/navigation-utils';

interface BreadcrumbItem {
 label: string;
 href: string;
 active: boolean;
}

interface BreadcrumbsProps {
 items?: BreadcrumbItem[];
 className?: string;
 showHome?: boolean;
 maxItems?: number;
}

export default function Breadcrumbs({ 
 items, 
 className = '', 
 showHome = true,
 maxItems = 4 
}: BreadcrumbsProps) {
 const { navigation } = useLayout();
 const { isMobile, isSmallMobile } = useResponsive();

 const breadcrumbItems = items || navigation.breadcrumbs;

 if (!breadcrumbItems || breadcrumbItems.length === 0) {
 return null;
 }

 let displayItems = breadcrumbItems;
 if (!showHome && displayItems[0]?.label === 'Home') {
 displayItems = displayItems.slice(1);
 }

 if (isMobile && displayItems.length > maxItems) {
 const activeItem = displayItems[displayItems.length - 1];
 const firstItem = displayItems[0];
 
 if (displayItems.length > 2) {
 displayItems = [
 firstItem,
 { label: '...', href: '#', active: false },
 activeItem
 ];
 }
 }

 return (
 <nav 
 className={`flex ${className}`} 
 aria-label="Breadcrumb"
 role="navigation"
 >
 <ol className="flex items-center space-x-1 md:space-x-2">
 {displayItems.map((item, index) => (
 <li key={`${item.href}-${index}`} className="flex items-center">
 {}
 {index > 0 && (
 <svg
 className="w-3 h-3 md:w-4 md:h-4 text-neutral-dark-gray mx-1 md:mx-2 flex-shrink-0"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 aria-hidden="true"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M9 5l7 7-7 7"
 />
 </svg>
 )}
 
 {}
 {item.active ? (
 <span 
 className={`font-medium text-primary-navy ${
 isSmallMobile ? 'text-sm' : 'text-sm md:text-base'
 } truncate max-w-[120px] md:max-w-none`}
 aria-current="page"
 title={item.label}
 >
 {item.label}
 </span>
 ) : item.label === '...' ? (
 <span 
 className={`text-neutral-dark-gray ${
 isSmallMobile ? 'text-sm' : 'text-sm md:text-base'
 }`}
 aria-hidden="true"
 >
 {item.label}
 </span>
 ) : (
 <Link
 href={item.href}
 className={`text-neutral-dark-gray hover:text-primary-navy transition-colors duration-200 ${
 isSmallMobile ? 'text-sm' : 'text-sm md:text-base'
 } truncate max-w-[120px] md:max-w-none focus:outline-none focus:ring-2 focus:ring-accent-pink focus:ring-offset-1 rounded`}
 title={item.label}
 >
 {item.label}
 </Link>
 )}
 </li>
 ))}
 </ol>
 </nav>
 );
}

export function useBreadcrumbs() {
 const { setBreadcrumbs, navigation } = useLayout();
 
 const updateBreadcrumbs = React.useCallback((items: BreadcrumbItem[]) => {
 setBreadcrumbs(items);
 }, [setBreadcrumbs]);

 const addBreadcrumb = React.useCallback((item: Omit<BreadcrumbItem, 'active'>) => {
 const updatedBreadcrumbs = [
 ...navigation.breadcrumbs.map((p: BreadcrumbItem) => ({ ...p, active: false })),
 { ...item, active: true }
 ];
 setBreadcrumbs(updatedBreadcrumbs);
 }, [setBreadcrumbs, navigation.breadcrumbs]);

 const clearBreadcrumbs = React.useCallback(() => {
 setBreadcrumbs([]);
 }, [setBreadcrumbs]);

 return {
 updateBreadcrumbs,
 addBreadcrumb,
 clearBreadcrumbs,
 };
}

export const generateCreatorBreadcrumbs = (pathname: string, userRole?: 'creator' | 'member'): BreadcrumbItem[] => {
 const segments = pathname.split('/').filter(Boolean);
 const breadcrumbs: BreadcrumbItem[] = [];

 if (pathname === '/') {
 return [{
 label: 'Home',
 href: '/',
 active: true,
 }];
 }

 const homeUrl = getHomeUrl(!!userRole, userRole);

 breadcrumbs.push({
 label: 'Home',
 href: homeUrl,
 active: false,
 });

 let currentPath = '';
 segments.forEach((segment, index) => {
 currentPath += `/${segment}`;
 const isLast = index === segments.length - 1;
 
 let label = segment.charAt(0).toUpperCase() + segment.slice(1);

 switch (segment) {
 case 'creator':
 label = 'Creator Studio';
 break;
 case 'dashboard':
 label = 'Dashboard';
 break;
 case 'upload':
 label = 'Upload Video';
 break;
 case 'videos':
 label = 'Manage Videos';
 break;
 case 'analytics':
 label = 'Analytics';
 break;
 case 'earnings':
 label = 'Earnings';
 break;
 case 'settings':
 label = 'Settings';
 break;
 }

 breadcrumbs.push({
 label,
 href: currentPath,
 active: isLast,
 });
 });

 return breadcrumbs;
};