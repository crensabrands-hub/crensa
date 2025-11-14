

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useLayout } from '@/contexts/LayoutContext';
import { useAuthContext } from '@/contexts/AuthContext';

export interface CreatorLayoutData {
 stats: {
 totalEarnings: number;
 totalViews: number;
 videoCount: number;
 monthlyGrowth: number;
 };
 notifications: Array<{
 id: string;
 type: 'info' | 'warning' | 'success' | 'error';
 message: string;
 timestamp: number;
 read: boolean;
 }>;
 quickActions: Array<{
 id: string;
 label: string;
 icon: string;
 href: string;
 badge?: number;
 }>;
}

export interface MemberLayoutData {
 watchHistory: Array<{
 id: string;
 title: string;
 thumbnail: string;
 watchedAt: number;
 progress: number;
 }>;
 recommendations: Array<{
 id: string;
 title: string;
 thumbnail: string;
 creator: string;
 views: number;
 }>;
 credits: {
 balance: number;
 spent: number;
 earned: number;
 };
}

export interface LayoutDataState<T> {
 data: T | null;
 loading: boolean;
 error: string | null;
 lastFetched: number | null;
}

export function useCreatorLayoutData() {
 const { currentLayout } = useLayout();
 const { user } = useAuthContext();
 const [state, setState] = useState<LayoutDataState<CreatorLayoutData>>({
 data: null,
 loading: false,
 error: null,
 lastFetched: null,
 });

 const fetchCreatorData = useCallback(async () => {
 if (currentLayout !== 'creator' || !user) return;

 setState(prev => ({ ...prev, loading: true, error: null }));

 try {

 const [statsResponse, notificationsResponse] = await Promise.all([
 fetch('/api/creator/stats').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch stats')),
 fetch('/api/notifications').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch notifications')),
 ]);

 const data: CreatorLayoutData = {
 stats: statsResponse || {
 totalEarnings: 0,
 totalViews: 0,
 videoCount: 0,
 monthlyGrowth: 0,
 },
 notifications: notificationsResponse || [],
 quickActions: [
 { id: 'upload', label: 'Upload Video', icon: 'upload', href: '/creator/upload' },
 { id: 'analytics', label: 'Analytics', icon: 'chart', href: '/creator/analytics' },
 { id: 'earnings', label: 'Earnings', icon: 'dollar', href: '/creator/earnings' },
 { id: 'settings', label: 'Settings', icon: 'settings', href: '/creator/settings' },
 ],
 };

 setState({
 data,
 loading: false,
 error: null,
 lastFetched: Date.now(),
 });
 } catch (error) {
 setState(prev => ({
 ...prev,
 loading: false,
 error: error instanceof Error ? error.message : 'Failed to fetch creator data',
 }));
 }
 }, [currentLayout, user]);

 const refreshData = useCallback(() => {
 fetchCreatorData();
 }, [fetchCreatorData]);

 useEffect(() => {
 if (currentLayout === 'creator') {
 fetchCreatorData();
 }
 }, [currentLayout, fetchCreatorData]);

 useEffect(() => {
 if (currentLayout !== 'creator') return;

 const interval = setInterval(() => {

 if (state.lastFetched && Date.now() - state.lastFetched > 5 * 60 * 1000) {
 fetchCreatorData();
 }
 }, 60000); // Check every minute

 return () => clearInterval(interval);
 }, [currentLayout, state.lastFetched, fetchCreatorData]);

 return {
 ...state,
 refresh: refreshData,
 isStale: state.lastFetched ? Date.now() - state.lastFetched > 5 * 60 * 1000 : true,
 };
}

export function useMemberLayoutData() {
 const { currentLayout } = useLayout();
 const { user } = useAuthContext();
 const [state, setState] = useState<LayoutDataState<MemberLayoutData>>({
 data: null,
 loading: false,
 error: null,
 lastFetched: null,
 });

 const fetchMemberData = useCallback(async () => {
 if (currentLayout !== 'member' || !user) return;

 setState(prev => ({ ...prev, loading: true, error: null }));

 try {

 const [watchHistoryResponse, recommendationsResponse, creditsResponse] = await Promise.all([
 fetch('/api/member/watch-history').then(res => res.ok ? res.json() : []),
 fetch('/api/member/recommendations').then(res => res.ok ? res.json() : []),
 fetch('/api/member/credits').then(res => res.ok ? res.json() : { balance: 0, spent: 0, earned: 0 }),
 ]);

 const data: MemberLayoutData = {
 watchHistory: watchHistoryResponse,
 recommendations: recommendationsResponse,
 credits: creditsResponse,
 };

 setState({
 data,
 loading: false,
 error: null,
 lastFetched: Date.now(),
 });
 } catch (error) {
 setState(prev => ({
 ...prev,
 loading: false,
 error: error instanceof Error ? error.message : 'Failed to fetch member data',
 }));
 }
 }, [currentLayout, user]);

 const refreshData = useCallback(() => {
 fetchMemberData();
 }, [fetchMemberData]);

 useEffect(() => {
 if (currentLayout === 'member') {
 fetchMemberData();
 }
 }, [currentLayout, fetchMemberData]);

 return {
 ...state,
 refresh: refreshData,
 isStale: state.lastFetched ? Date.now() - state.lastFetched > 5 * 60 * 1000 : true,
 };
}

export function useLayoutNavigation() {
 const { currentLayout, navigation, setActiveRoute, setBreadcrumbs } = useLayout();

 const navigateWithBreadcrumbs = useCallback((path: string, breadcrumbs?: Array<{ label: string; href: string }>) => {
 setActiveRoute(path);
 
 if (breadcrumbs) {
 const breadcrumbItems = breadcrumbs.map((crumb, index) => ({
 ...crumb,
 active: index === breadcrumbs.length - 1,
 }));
 setBreadcrumbs(breadcrumbItems);
 }

 window.history.pushState(null, '', path);
 }, [setActiveRoute, setBreadcrumbs]);

 const getLayoutSpecificRoutes = useMemo(() => {
 switch (currentLayout) {
 case 'creator':
 return [
 { label: 'Dashboard', href: '/creator/dashboard', icon: 'dashboard' },
 { label: 'Upload Video', href: '/creator/upload', icon: 'upload' },
 { label: 'Manage Videos', href: '/creator/videos', icon: 'video' },
 { label: 'Analytics', href: '/creator/analytics', icon: 'chart' },
 { label: 'Earnings', href: '/creator/earnings', icon: 'dollar' },
 { label: 'Settings', href: '/creator/settings', icon: 'settings' },
 ];
 case 'member':
 return [
 { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
 { label: 'Discover', href: '/discover', icon: 'search' },
 { label: 'Watch History', href: '/history', icon: 'history' },
 { label: 'Profile', href: '/profile', icon: 'user' },
 { label: 'Settings', href: '/settings', icon: 'settings' },
 ];
 default:
 return [];
 }
 }, [currentLayout]);

 return {
 currentRoute: navigation.activeRoute,
 breadcrumbs: navigation.breadcrumbs,
 navigateWithBreadcrumbs,
 layoutRoutes: getLayoutSpecificRoutes,
 };
}

export function useLayoutPreferences() {
 const { preferences, updateLayoutPreferences, currentLayout } = useLayout();

 const getLayoutDefaults = useCallback(() => {
 switch (currentLayout) {
 case 'creator':
 return {
 sidebarCollapsed: false,
 theme: 'light' as const,
 compactMode: false,
 };
 case 'member':
 return {
 sidebarCollapsed: true,
 theme: 'light' as const,
 compactMode: true,
 };
 default:
 return {
 sidebarCollapsed: false,
 theme: 'light' as const,
 compactMode: false,
 };
 }
 }, [currentLayout]);

 const resetToLayoutDefaults = useCallback(() => {
 const defaults = getLayoutDefaults();
 updateLayoutPreferences(defaults);
 }, [getLayoutDefaults, updateLayoutPreferences]);

 const toggleSidebar = useCallback(() => {
 updateLayoutPreferences({ sidebarCollapsed: !preferences.sidebarCollapsed });
 }, [preferences.sidebarCollapsed, updateLayoutPreferences]);

 const toggleTheme = useCallback(() => {
 const newTheme = preferences.theme === 'light' ? 'dark' : 'light';
 updateLayoutPreferences({ theme: newTheme });
 }, [preferences.theme, updateLayoutPreferences]);

 const toggleCompactMode = useCallback(() => {
 updateLayoutPreferences({ compactMode: !preferences.compactMode });
 }, [preferences.compactMode, updateLayoutPreferences]);

 return {
 preferences,
 layoutDefaults: getLayoutDefaults(),
 resetToLayoutDefaults,
 toggleSidebar,
 toggleTheme,
 toggleCompactMode,
 updatePreferences: updateLayoutPreferences,
 };
}

export function useLayoutIntegration() {
 const layout = useLayout();
 const creatorData = useCreatorLayoutData();
 const memberData = useMemberLayoutData();
 const navigation = useLayoutNavigation();
 const preferences = useLayoutPreferences();

 const currentLayoutData = useMemo(() => {
 switch (layout.currentLayout) {
 case 'creator':
 return creatorData;
 case 'member':
 return memberData;
 default:
 return { data: null, loading: false, error: null, lastFetched: null, refresh: () => {}, isStale: false };
 }
 }, [layout.currentLayout, creatorData, memberData]);

 return {

 layout,

 layoutData: currentLayoutData,

 navigation,

 preferences,

 isCreatorLayout: layout.currentLayout === 'creator',
 isMemberLayout: layout.currentLayout === 'member',
 isPublicLayout: layout.currentLayout === 'public',
 };
}

export default useLayoutIntegration;