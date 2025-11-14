

import { useCallback, useMemo } from 'react';
import { useLayout } from '@/contexts/LayoutContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useLayoutPersistence } from './useLayoutPersistence';
import { useLayoutIntegration } from './useLayoutData';
import { useLayoutDebugDev } from './useLayoutDebug';

export function useLayoutContext() {
 const layout = useLayout();
 const auth = useAuthContext();
 const persistence = useLayoutPersistence();
 const integration = useLayoutIntegration();
 const debug = useLayoutDebugDev();

 const layoutHelpers = useMemo(() => ({

 isCreator: layout.currentLayout === 'creator',
 isMember: layout.currentLayout === 'member',
 isPublic: layout.currentLayout === 'public',

 isLayoutLoading: layout.isLayoutLoading,
 isAuthLoading: auth.isLoading,
 isDataLoading: integration.layoutData.loading,
 isAnyLoading: layout.isLayoutLoading || auth.isLoading || integration.layoutData.loading,

 hasLayoutError: !!layout.error,
 hasDataError: !!integration.layoutData.error,
 hasAnyError: !!layout.error || !!integration.layoutData.error,

 isDataStale: integration.layoutData.isStale,
 hasData: !!integration.layoutData.data,
 }), [layout, auth, integration]);

 const navigationHelpers = useMemo(() => ({

 activeRoute: layout.navigation.activeRoute,
 breadcrumbs: layout.navigation.breadcrumbs,
 sidebarOpen: layout.navigation.sidebarOpen,
 mobileMenuOpen: layout.navigation.mobileMenuOpen,

 setActiveRoute: layout.setActiveRoute,
 setBreadcrumbs: layout.setBreadcrumbs,
 toggleSidebar: () => layout.setSidebarOpen(!layout.navigation.sidebarOpen),
 toggleMobileMenu: () => layout.setMobileMenuOpen(!layout.navigation.mobileMenuOpen),

 availableRoutes: integration.navigation.layoutRoutes,
 }), [layout, integration]);

 const preferencesHelpers = useMemo(() => ({

 preferences: layout.preferences,

 updatePreferences: layout.updateLayoutPreferences,
 toggleTheme: integration.preferences.toggleTheme,
 toggleCompactMode: integration.preferences.toggleCompactMode,
 resetToDefaults: integration.preferences.resetToLayoutDefaults,

 hasCustomPreferences: persistence.hasCustomPreferences,
 layoutDefaults: integration.preferences.layoutDefaults,
 }), [layout, integration, persistence]);

 const dataHelpers = useMemo(() => ({

 layoutData: integration.layoutData.data,

 refreshData: integration.layoutData.refresh,

 isLoading: integration.layoutData.loading,
 error: integration.layoutData.error,
 isStale: integration.layoutData.isStale,
 lastFetched: integration.layoutData.lastFetched,
 }), [integration]);

 const persistenceHelpers = useMemo(() => ({

 isStorageAvailable: persistence.isStorageAvailable,
 storageInfo: persistence.storageInfo,

 clearAllData: persistence.clearLayoutData,
 exportPreferences: persistence.exportPreferences,
 importPreferences: persistence.importPreferences,

 updateStorageInfo: persistence.updateStorageInfo,
 }), [persistence]);

 const debugHelpers = useMemo(() => {
 if (process.env.NODE_ENV !== 'development') {
 return {
 isDebugMode: false,
 debugInfo: null,
 debugActions: {},
 hasIssues: false,
 };
 }

 return {
 isDebugMode: true,
 debugInfo: debug.debugInfo,
 debugActions: debug.actions,
 hasIssues: debug.hasErrors || debug.hasRouteErrors || debug.hasPerformanceIssues || debug.hasStorageIssues,
 issues: {
 errors: debug.hasErrors,
 routes: debug.hasRouteErrors,
 performance: debug.hasPerformanceIssues,
 storage: debug.hasStorageIssues,
 },
 };
 }, [debug]);

 const utilities = useMemo(() => ({

 canAccessCreatorLayout: auth.hasRole('creator'),
 canAccessMemberLayout: !!auth.user,

 clearAllErrors: () => {
 layout.clearError();
 if (process.env.NODE_ENV === 'development' && debug.actions && 'clearErrors' in debug.actions) {
 (debug.actions as any).clearErrors();
 }
 },

 resetAllState: () => {
 layout.resetLayoutState();
 persistence.clearLayoutData();
 },

 getHealthStatus: () => ({
 layout: !layout.error && !layout.isLayoutLoading,
 auth: !auth.isLoading && !!auth.user,
 data: !integration.layoutData.error && !integration.layoutData.loading,
 storage: persistence.isStorageAvailable,
 overall: !layoutHelpers.hasAnyError && !layoutHelpers.isAnyLoading && persistence.isStorageAvailable,
 }),
 }), [layout, auth, integration, persistence, debug, layoutHelpers]);

 return {

 layout: layoutHelpers,

 navigation: navigationHelpers,

 preferences: preferencesHelpers,

 data: dataHelpers,

 persistence: persistenceHelpers,

 debug: debugHelpers,

 utils: utilities,

 raw: {
 layout,
 auth,
 persistence,
 integration,
 debug: process.env.NODE_ENV === 'development' ? debug : null,
 },
 };
}

export function useSimpleLayout() {
 const { layout, navigation, preferences } = useLayoutContext();
 
 return {

 currentLayout: layout.isCreator ? 'creator' : layout.isMember ? 'member' : 'public',
 isLoading: layout.isAnyLoading,
 hasError: layout.hasAnyError,

 sidebarOpen: navigation.sidebarOpen,
 toggleSidebar: navigation.toggleSidebar,
 activeRoute: navigation.activeRoute,

 theme: preferences.preferences.theme,
 compactMode: preferences.preferences.compactMode,
 toggleTheme: preferences.toggleTheme,
 toggleCompactMode: preferences.toggleCompactMode,
 };
}

export function useLayoutData() {
 const { data, layout } = useLayoutContext();
 
 return {

 data: data.layoutData,
 isLoading: data.isLoading,
 error: data.error,
 isStale: data.isStale,

 refresh: data.refreshData,

 layoutType: layout.isCreator ? 'creator' : layout.isMember ? 'member' : 'public',
 hasData: layout.hasData,
 };
}

export function useLayoutDebugging() {
 const { debug, utils } = useLayoutContext();
 
 if (process.env.NODE_ENV !== 'development') {
 return {
 isDebugMode: false,
 debugInfo: null,
 actions: {},
 healthStatus: utils.getHealthStatus(),
 };
 }
 
 return {
 isDebugMode: debug.isDebugMode,
 debugInfo: debug.debugInfo,
 actions: debug.debugActions,
 hasIssues: debug.hasIssues,
 issues: debug.issues,
 healthStatus: utils.getHealthStatus(),
 };
}

export default useLayoutContext;