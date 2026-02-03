

import { useCallback, useEffect, useRef } from 'react';
import { useApiCache } from './useApiCache';
import { backgroundRefresh, refreshHelpers } from '@/lib/background-refresh';
import { cacheInvalidation } from '@/lib/api-cache';
import { useAuthContext } from '@/contexts/AuthContext';

export interface CreatorDashboardData {
 totalVideos: number;
 totalViews: number;
 totalEarnings: number;
 recentUploads: any[];
 analytics: {
 viewsThisWeek: number;
 earningsThisWeek: number;
 engagementRate: number;
 };
}

export interface CreatorAnalyticsData {
 summary: {
 totalEarnings: number;
 totalViews: number;
 totalVideos: number;
 avgEarningsPerVideo: number;
 avgViewsPerVideo: number;
 };
 charts: {
 earnings: Array<{ date: string; value: number }>;
 views: Array<{ date: string; value: number }>;
 };
 videoPerformance: Array<{
 id: string;
 title: string;
 views: number;
 earnings: number;
 engagement: number;
 }>;
}

export function useOptimizedCreatorDashboard() {
 const { userProfile } = useAuthContext();
 const isRegisteredRef = useRef(false);

 const result = useApiCache<CreatorDashboardData>('/api/creator/dashboard', {
 enabled: !!userProfile && userProfile.role === 'creator',
 cacheConfig: {
 maxAge: 3 * 60 * 1000, // 3 minutes
 staleWhileRevalidate: true,
 dedupe: true,
 },
 refetchOnWindowFocus: true,
 onSuccess: (data) => {

 preloadRelatedData();
 },
 });

 useEffect(() => {
 if (userProfile?.role === 'creator' && !isRegisteredRef.current) {
 refreshHelpers.dashboard(
 (data: CreatorDashboardData) => {
 result.mutate(data);
 },
 (error: Error) => {
 console.warn('Background dashboard refresh failed:', error);
 }
 );
 isRegisteredRef.current = true;
 }

 return () => {
 if (isRegisteredRef.current) {
 backgroundRefresh.unregister('/api/creator/dashboard');
 isRegisteredRef.current = false;
 }
 };
 }, [userProfile?.role, result]);

 const preloadRelatedData = useCallback(() => {

 backgroundRefresh.forceRefresh('/api/creator/analytics').catch(console.warn);

 backgroundRefresh.forceRefresh('/api/creator/earnings').catch(console.warn);
 }, []);

 const invalidateRelatedCache = useCallback(() => {
 cacheInvalidation.creator();
 cacheInvalidation.analytics();
 }, []);

 return {
 ...result,
 invalidateRelatedCache,
 preloadRelatedData,
 };
}

export function useOptimizedCreatorAnalytics(timeRange: string = '7d') {
 const { userProfile } = useAuthContext();
 const isRegisteredRef = useRef(false);
 const timeRangeRef = useRef(timeRange);

 const url = `/api/creator/analytics?timeRange=${timeRange}`;

 const result = useApiCache<CreatorAnalyticsData>(url, {
 enabled: !!userProfile && userProfile.role === 'creator',
 cacheConfig: {
 maxAge: 5 * 60 * 1000, // 5 minutes
 staleWhileRevalidate: true,
 dedupe: true,
 },
 refetchOnWindowFocus: false, // Analytics don't need immediate refresh on focus
 });

 useEffect(() => {
 if (userProfile?.role === 'creator') {

 if (isRegisteredRef.current && timeRangeRef.current !== timeRange) {
 const oldUrl = `/api/creator/analytics?timeRange=${timeRangeRef.current}`;
 backgroundRefresh.unregister(oldUrl);
 }

 refreshHelpers.analytics(
 timeRange,
 (data: CreatorAnalyticsData) => {
 result.mutate(data);
 },
 (error: Error) => {
 console.warn('Background analytics refresh failed:', error);
 }
 );

 isRegisteredRef.current = true;
 timeRangeRef.current = timeRange;
 }

 return () => {
 if (isRegisteredRef.current) {
 backgroundRefresh.unregister(url);
 isRegisteredRef.current = false;
 }
 };
 }, [userProfile?.role, timeRange, result, url]);

 const refreshTimeRange = useCallback(async (newTimeRange: string) => {
 const newUrl = `/api/creator/analytics?timeRange=${newTimeRange}`;
 await backgroundRefresh.forceRefresh(newUrl);
 }, []);

 return {
 ...result,
 refreshTimeRange,
 };
}

export function useOptimizedCreatorEarnings() {
 const { userProfile } = useAuthContext();

 return useApiCache('/api/creator/earnings', {
 enabled: !!userProfile && userProfile.role === 'creator',
 cacheConfig: {
 maxAge: 5 * 60 * 1000, // 5 minutes
 staleWhileRevalidate: true,
 dedupe: true,
 },
 refetchOnWindowFocus: false,
 });
}

export function useCreatorDataManager() {
 const { userProfile } = useAuthContext();
 
 const dashboard = useOptimizedCreatorDashboard();
 const analytics = useOptimizedCreatorAnalytics();
 const earnings = useOptimizedCreatorEarnings();

 const refreshAllData = useCallback(async () => {
 if (userProfile?.role !== 'creator') return;

 const refreshPromises = [
 dashboard.refetch(),
 analytics.refetch(),
 earnings.refetch(),
 ];

 await Promise.allSettled(refreshPromises);
 }, [userProfile?.role, dashboard, analytics, earnings]);

 const invalidateAllCache = useCallback(() => {
 cacheInvalidation.creator();
 cacheInvalidation.analytics();
 dashboard.invalidateRelatedCache();
 }, [dashboard]);

 const isAnyLoading = dashboard.isLoading || analytics.isLoading || earnings.isLoading;

 const hasAnyError = !!(dashboard.error || analytics.error || earnings.error);

 const errors = [dashboard.error, analytics.error, earnings.error].filter(Boolean);

 return {
 dashboard,
 analytics,
 earnings,
 refreshAllData,
 invalidateAllCache,
 isAnyLoading,
 hasAnyError,
 errors,
 };
}

export function useDataPrefetching() {
 const { userProfile } = useAuthContext();

 const prefetchForRole = useCallback((role: string) => {
 switch (role) {
 case 'creator':

 backgroundRefresh.forceRefresh('/api/creator/dashboard').catch(console.warn);
 backgroundRefresh.forceRefresh('/api/creator/analytics').catch(console.warn);
 break;
 case 'member':

 backgroundRefresh.forceRefresh('/api/user/preferences').catch(console.warn);
 backgroundRefresh.forceRefresh('/api/notifications').catch(console.warn);
 break;
 }
 }, []);

 useEffect(() => {
 if (userProfile?.role) {
 prefetchForRole(userProfile.role);
 }
 }, [userProfile?.role, prefetchForRole]);

 const prefetchOnHover = useCallback((path: string) => {
 const prefetchMap: Record<string, string[]> = {
 '/creator/dashboard': ['/api/creator/dashboard'],
 '/creator/analytics': ['/api/creator/analytics'],
 '/creator/earnings': ['/api/creator/earnings'],
 '/notifications': ['/api/notifications'],
 '/settings': ['/api/user/preferences'],
 };

 const urls = prefetchMap[path];
 if (urls) {
 urls.forEach(url => {
 backgroundRefresh.forceRefresh(url).catch(console.warn);
 });
 }
 }, []);

 return {
 prefetchForRole,
 prefetchOnHover,
 };
}