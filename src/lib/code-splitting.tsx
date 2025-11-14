

import dynamic from 'next/dynamic';
import { ComponentType, ReactNode, useState, useEffect, useMemo } from 'react';

const DynamicLoadingComponent = ({ message = 'Loading...' }: { message?: string }) => (
 <div className="flex items-center justify-center p-4">
 <div className="flex items-center space-x-2">
 <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
 <span className="text-sm text-gray-600">{message}</span>
 </div>
 </div>
);

const DynamicErrorComponent = ({ error, retry }: { error?: Error; retry?: () => void }) => (
 <div className="flex flex-col items-center justify-center p-4 text-center">
 <div className="text-red-500 mb-2">
 <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
 </svg>
 </div>
 <p className="text-sm text-gray-600 mb-2">Failed to load component</p>
 {retry && (
 <button
 onClick={retry}
 className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors"
 >
 Retry
 </button>
 )}
 </div>
);

export const createDynamicComponent = <T extends ComponentType<any>>(
 importFn: () => Promise<{ default: T }>,
 options: {
 loading?: () => ReactNode;
 error?: ComponentType<{ error?: Error; retry?: () => void }>;
 ssr?: boolean;
 loadingMessage?: string;
 } = {}
) => {
 const {
 loading,
 error = DynamicErrorComponent,
 ssr = false,
 } = options;

 return dynamic(importFn, {
 loading: loading ? loading : () => <DynamicLoadingComponent message={options.loadingMessage} />,
 ssr,
 });
};

export const DynamicComponents = {

 MemberSidebar: createDynamicComponent(
 () => import('@/components/layout/MemberSidebar'),
 { loadingMessage: 'Loading sidebar...', ssr: false }
 ),
 
 CreatorSidebar: createDynamicComponent(
 () => import('@/components/layout/CreatorSidebar'),
 { loadingMessage: 'Loading sidebar...', ssr: false }
 ),

 MemberDashboard: createDynamicComponent(
 () => import('@/components/member/MemberDashboardPage').then(mod => ({ default: mod.MemberDashboardPage })),
 { loadingMessage: 'Loading dashboard...', ssr: false }
 ),

 CreatorAnalytics: createDynamicComponent(
 () => import('@/components/creator/CreatorAnalytics').then(mod => ({ default: mod.CreatorAnalytics })),
 { loadingMessage: 'Loading analytics...', ssr: false }
 ),

 VideoPlayer: createDynamicComponent(
 () => import('@/components/watch/VideoPlayer').then(mod => ({ default: mod.VideoPlayer })),
 { loadingMessage: 'Loading video player...', ssr: false }
 ),

 VideoUpload: createDynamicComponent(
 () => import('@/components/creator/VideoUpload'),
 { loadingMessage: 'Loading upload interface...', ssr: false }
 ),

 ProfileForm: createDynamicComponent(
 () => import('@/components/profile/ProfileForm'),
 { loadingMessage: 'Loading profile...', ssr: false }
 ),

 NotificationBell: createDynamicComponent(
 () => import('@/components/notifications/NotificationBell'),
 { loadingMessage: 'Loading notifications...', ssr: false }
 ),

 PaymentModal: createDynamicComponent(
 () => import('@/components/payments/PaymentModal'),
 { loadingMessage: 'Loading payment interface...', ssr: false }
 ),

 SearchResults: createDynamicComponent(
 () => import('@/components/search/SearchResults'),
 { loadingMessage: 'Loading search results...', ssr: false }
 ),

 HelpContactForm: createDynamicComponent(
 () => import('@/components/help/HelpContactForm').then(mod => ({ default: mod.default })),
 { loadingMessage: 'Loading help form...', ssr: false }
 ),
};

export const createRouteComponent = (
 importFn: () => Promise<{ default: ComponentType<any> }>,
 routeName: string
) => {
 return createDynamicComponent(importFn, {
 loadingMessage: `Loading ${routeName}...`,
 ssr: false,
 });
};

export const createLazyComponent = <T extends ComponentType<any>>(
 importFn: () => Promise<{ default: T }>,
 options: {
 threshold?: number;
 rootMargin?: string;
 fallback?: ReactNode;
 } = {}
) => {
 const { threshold = 0.1, rootMargin = '50px', fallback } = options;

 const LazyWrapper = (props: any) => {
 const [shouldLoad, setShouldLoad] = useState(false);
 const [ref, setRef] = useState<Element | null>(null);

 useEffect(() => {
 if (!ref) return;

 const observer = new IntersectionObserver(
 ([entry]) => {
 if (entry.isIntersecting) {
 setShouldLoad(true);
 observer.disconnect();
 }
 },
 { threshold, rootMargin }
 );

 observer.observe(ref);
 return () => observer.disconnect();
 }, [ref]);

 const DynamicComponent = useMemo(() => {
 if (!shouldLoad) return null;
 return createDynamicComponent(importFn);
 }, [shouldLoad]);

 return (
 <div ref={setRef}>
 {shouldLoad && DynamicComponent ? (
 <DynamicComponent {...props} />
 ) : (
 fallback || <DynamicLoadingComponent />
 )}
 </div>
 );
 };

 return LazyWrapper;
};

export const getBundleInfo = () => {
 if (typeof window === 'undefined') return null;

 return {
 userAgent: navigator.userAgent,
 connection: (navigator as any).connection,
 memory: (performance as any).memory,
 timing: performance.timing,
 };
};

export const preloadRouteComponent = (routePath: string) => {
 const routeMap: Record<string, () => Promise<any>> = {
 '/dashboard': () => import('@/app/dashboard/page'),
 '/profile': () => import('@/app/profile/page'),
 '/discover': () => import('@/app/discover/page'),
 '/notifications': () => import('@/app/notifications/page'),
 '/wallet': () => import('@/app/wallet/page'),
 '/creator/dashboard': () => import('@/app/creator/dashboard/page'),
 '/creator/upload': () => import('@/app/creator/upload/page'),
 '/creator/analytics': () => import('@/app/creator/analytics/page'),
 };

 const importFn = routeMap[routePath];
 if (importFn) {
 importFn().catch(console.error);
 }
};

export const useSmartPreloading = () => {
 useEffect(() => {

 const currentPath = window.location.pathname;
 
 const preloadMap: Record<string, string[]> = {
 '/dashboard': ['/profile', '/discover', '/notifications'],
 '/discover': ['/watch', '/profile'],
 '/creator/dashboard': ['/creator/upload', '/creator/analytics'],
 '/profile': ['/settings', '/dashboard'],
 };

 const routesToPreload = preloadMap[currentPath] || [];

 const timer = setTimeout(() => {
 routesToPreload.forEach(preloadRouteComponent);
 }, 2000);

 return () => clearTimeout(timer);
 }, []);
};

export const createRetryableComponent = <T extends ComponentType<any>>(
 importFn: () => Promise<{ default: T }>,
 maxRetries: number = 3
) => {
 let retryCount = 0;

 const retryableImport = (): Promise<{ default: T }> => {
 return importFn().catch((error) => {
 if (retryCount < maxRetries) {
 retryCount++;
 console.warn(`Component import failed, retrying (${retryCount}/${maxRetries})...`);
 return new Promise((resolve) => {
 setTimeout(() => resolve(retryableImport()), 1000 * retryCount);
 });
 }
 throw error;
 });
 };

 return createDynamicComponent(retryableImport);
};