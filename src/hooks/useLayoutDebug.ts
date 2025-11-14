

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useLayout } from '@/contexts/LayoutContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useLayoutPersistence } from './useLayoutPersistence';
import { useLayoutIntegration } from './useLayoutData';

export interface LayoutDebugInfo {

 layoutState: ReturnType<typeof useLayout>;
 authState: {
 user: any;
 isLoading: boolean;
 hasRole: (role: any) => boolean;
 };

 performance: {
 renderCount: number;
 lastRenderTime: number;
 averageRenderTime: number;
 slowRenders: number;
 };

 storage: {
 available: boolean;
 usage: {
 preferences: number;
 navigation: number;
 total: number;
 };
 quota: {
 used: number;
 available: number;
 total: number;
 };
 };

 errors: Array<{
 id: string;
 timestamp: number;
 type: 'context' | 'storage' | 'render' | 'data';
 message: string;
 stack?: string;
 }>;

 routing: {
 currentPath: string;
 expectedLayout: string;
 actualLayout: string;
 mismatch: boolean;
 history: Array<{
 path: string;
 layout: string;
 timestamp: number;
 }>;
 };
}

export function useLayoutDebug() {
 const layout = useLayout();
 const auth = useAuthContext();
 const persistence = useLayoutPersistence();
 const integration = useLayoutIntegration();

 const [renderCount, setRenderCount] = useState(0);
 const [renderTimes, setRenderTimes] = useState<number[]>([]);
 const [errors, setErrors] = useState<LayoutDebugInfo['errors']>([]);
 const [routeHistory, setRouteHistory] = useState<LayoutDebugInfo['routing']['history']>([]);

 useEffect(() => {
 const startTime = performance.now();
 setRenderCount(prev => prev + 1);
 
 return () => {
 const endTime = performance.now();
 const renderTime = endTime - startTime;
 setRenderTimes(prev => [...prev.slice(-19), renderTime]); // Keep last 20 render times
 };
 }, []); // Empty dependency array to run only once

 useEffect(() => {
 if (typeof window !== 'undefined') {
 const currentPath = window.location.pathname;
 setRouteHistory(prev => [
 ...prev.slice(-9), // Keep last 10 route changes
 {
 path: currentPath,
 layout: layout.currentLayout,
 timestamp: Date.now(),
 }
 ]);
 }
 }, [layout.currentLayout]);

 const addError = useCallback((type: LayoutDebugInfo['errors'][0]['type'], message: string, stack?: string) => {
 const error = {
 id: Math.random().toString(36).substr(2, 9),
 timestamp: Date.now(),
 type,
 message,
 stack,
 };
 
 setErrors(prev => [...prev.slice(-19), error]); // Keep last 20 errors
 console.error(`[Layout Debug] ${type.toUpperCase()}: ${message}`, stack);
 }, []);

 useEffect(() => {
 if (layout.error) {
 addError('context', layout.error);
 }
 }, [layout.error, addError]);

 const getStorageQuota = useCallback(async () => {
 if ('storage' in navigator && 'estimate' in navigator.storage) {
 try {
 const estimate = await navigator.storage.estimate();
 return {
 used: estimate.usage || 0,
 available: (estimate.quota || 0) - (estimate.usage || 0),
 total: estimate.quota || 0,
 };
 } catch (error) {
 addError('storage', 'Failed to get storage quota');
 return { used: 0, available: 0, total: 0 };
 }
 }
 return { used: 0, available: 0, total: 0 };
 }, [addError]);

 const performanceMetrics = useMemo(() => {
 const avgRenderTime = renderTimes.length > 0 
 ? renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length 
 : 0;
 
 const slowRenders = renderTimes.filter(time => time > 16).length; // > 16ms is slow
 
 return {
 renderCount,
 lastRenderTime: renderTimes[renderTimes.length - 1] || 0,
 averageRenderTime: avgRenderTime,
 slowRenders,
 };
 }, [renderCount, renderTimes]);

 const routingInfo = useMemo(() => {
 const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

 let expectedLayout = 'public';
 if (currentPath.startsWith('/creator')) {
 expectedLayout = 'creator';
 } else if (['/dashboard', '/profile', '/settings', '/notifications'].some(path => currentPath.startsWith(path))) {
 expectedLayout = 'member';
 }
 
 return {
 currentPath,
 expectedLayout,
 actualLayout: layout.currentLayout,
 mismatch: expectedLayout !== layout.currentLayout,
 history: routeHistory,
 };
 }, [layout.currentLayout, routeHistory]);

 const debugActions = useMemo(() => ({

 clearErrors: () => setErrors([]),

 clearRouteHistory: () => setRouteHistory([]),

 resetPerformanceMetrics: () => {
 setRenderCount(0);
 setRenderTimes([]);
 },

 forceLayoutRefresh: () => {
 layout.resetLayoutState();
 },

 simulateError: (type: LayoutDebugInfo['errors'][0]['type'], message: string) => {
 addError(type, `[SIMULATED] ${message}`);
 },

 exportDebugData: async () => {
 const quota = await getStorageQuota();
 const debugData = {
 timestamp: new Date().toISOString(),
 layout: layout,
 auth: {
 user: auth.user,
 isLoading: auth.isLoading,
 },
 performance: performanceMetrics,
 storage: {
 available: persistence.isStorageAvailable,
 usage: persistence.storageInfo,
 quota,
 },
 errors,
 routing: routingInfo,
 };
 
 const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.download = `crensa-layout-debug-${Date.now()}.json`;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 URL.revokeObjectURL(url);
 },

 logCurrentState: () => {
 console.group('🔍 Layout Debug State');
 console.log('Layout:', layout);
 console.log('Auth:', auth);
 console.log('Performance:', performanceMetrics);
 console.log('Storage:', persistence.storageInfo);
 console.log('Errors:', errors);
 console.log('Routing:', routingInfo);
 console.groupEnd();
 },
 }), [layout, auth, performanceMetrics, persistence, errors, routingInfo, addError, getStorageQuota]);

 const debugInfo: LayoutDebugInfo = useMemo(() => ({
 layoutState: layout,
 authState: {
 user: auth.user,
 isLoading: auth.isLoading,
 hasRole: auth.hasRole,
 },
 performance: performanceMetrics,
 storage: {
 available: persistence.isStorageAvailable,
 usage: {
 preferences: persistence.storageInfo.preferencesSize,
 navigation: persistence.storageInfo.navigationSize,
 total: persistence.storageInfo.totalSize,
 },
 quota: { used: 0, available: 0, total: 0 }, // Will be populated async
 },
 errors,
 routing: routingInfo,
 }), [layout, auth, performanceMetrics, persistence, errors, routingInfo]);

 useEffect(() => {
 getStorageQuota().then(quota => {

 });
 }, [getStorageQuota]);

 return {
 debugInfo,
 actions: debugActions,

 hasErrors: errors.length > 0,
 hasRouteErrors: routingInfo.mismatch,
 hasPerformanceIssues: performanceMetrics.slowRenders > 5,
 hasStorageIssues: !persistence.isStorageAvailable,

 recentErrors: errors.slice(-5),
 recentRoutes: routeHistory.slice(-5),
 currentPerformance: performanceMetrics,
 };
}

export function useLayoutDebugDev() {
 const debug = useLayoutDebug();

 if (process.env.NODE_ENV !== 'development') {
 return {
 debugInfo: null,
 actions: {},
 hasErrors: false,
 hasRouteErrors: false,
 hasPerformanceIssues: false,
 hasStorageIssues: false,
 recentErrors: [],
 recentRoutes: [],
 currentPerformance: null,
 };
 }
 
 return debug;
}

export default useLayoutDebug;