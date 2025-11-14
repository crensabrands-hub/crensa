'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { useAuthContext } from './AuthContext';
import { layoutPersistence, LayoutSyncEvent } from '@/lib/layout-persistence';

export interface LayoutPreferences {
 sidebarCollapsed: boolean;
 theme: 'light' | 'dark' | 'auto';
 compactMode: boolean;
}

export interface NavigationState {
 activeRoute: string;
 breadcrumbs: BreadcrumbItem[];
 sidebarOpen: boolean;
 mobileMenuOpen: boolean;
 sidebarVisible: boolean; // Controls whether sidebar should be shown on current page
}

export interface BreadcrumbItem {
 label: string;
 href: string;
 active: boolean;
}

export interface LayoutState {
 currentLayout: 'creator' | 'member' | 'public';
 isLayoutLoading: boolean;
 error: string | null;
 preferences: LayoutPreferences;
 navigation: NavigationState;
}

export interface LayoutContextType extends LayoutState {
 setSidebarOpen: (open: boolean) => void;
 setMobileMenuOpen: (open: boolean) => void;
 setSidebarVisible: (visible: boolean) => void;
 updateLayoutPreferences: (prefs: Partial<LayoutPreferences>) => void;
 setActiveRoute: (route: string) => void;
 setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
 clearError: () => void;
 resetLayoutState: () => void;
 getStorageInfo: () => { preferences: number; navigation: number; available: boolean };
}

type LayoutAction =
 | { type: 'SET_LAYOUT'; payload: 'creator' | 'member' | 'public' }
 | { type: 'SET_LOADING'; payload: boolean }
 | { type: 'SET_ERROR'; payload: string | null }
 | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
 | { type: 'SET_MOBILE_MENU_OPEN'; payload: boolean }
 | { type: 'SET_SIDEBAR_VISIBLE'; payload: boolean }
 | { type: 'UPDATE_PREFERENCES'; payload: Partial<LayoutPreferences> }
 | { type: 'SET_ACTIVE_ROUTE'; payload: string }
 | { type: 'SET_BREADCRUMBS'; payload: BreadcrumbItem[] }
 | { type: 'RESTORE_STATE'; payload: Partial<LayoutState> }
 | { type: 'RESTORE_PREFERENCES'; payload: LayoutPreferences }
 | { type: 'RESTORE_NAVIGATION'; payload: NavigationState }
 | { type: 'RESET_STATE' };

const getInitialState = (): LayoutState => {
 const preferences = layoutPersistence.loadPreferences();
 const navigation = layoutPersistence.loadNavigation();
 
 return {
 currentLayout: 'public',
 isLayoutLoading: true,
 error: null,
 preferences,
 navigation: {
 ...navigation,
 sidebarVisible: true, // Default to visible for member/creator layouts
 },
 };
};

function layoutReducer(state: LayoutState, action: LayoutAction): LayoutState {
 switch (action.type) {
 case 'SET_LAYOUT':
 return { ...state, currentLayout: action.payload };
 case 'SET_LOADING':
 return { ...state, isLayoutLoading: action.payload };
 case 'SET_ERROR':
 return { ...state, error: action.payload };
 case 'SET_SIDEBAR_OPEN':
 return {
 ...state,
 navigation: { ...state.navigation, sidebarOpen: action.payload },
 };
 case 'SET_MOBILE_MENU_OPEN':
 return {
 ...state,
 navigation: { ...state.navigation, mobileMenuOpen: action.payload },
 };
 case 'SET_SIDEBAR_VISIBLE':
 return {
 ...state,
 navigation: { ...state.navigation, sidebarVisible: action.payload },
 };
 case 'UPDATE_PREFERENCES':
 return {
 ...state,
 preferences: { ...state.preferences, ...action.payload },
 };
 case 'SET_ACTIVE_ROUTE':
 return {
 ...state,
 navigation: { ...state.navigation, activeRoute: action.payload },
 };
 case 'SET_BREADCRUMBS':
 return {
 ...state,
 navigation: { ...state.navigation, breadcrumbs: action.payload },
 };
 case 'RESTORE_STATE':
 return { ...state, ...action.payload };
 case 'RESTORE_PREFERENCES':
 return { ...state, preferences: action.payload };
 case 'RESTORE_NAVIGATION':
 return { ...state, navigation: action.payload };
 case 'RESET_STATE':
 return getInitialState();
 default:
 return state;
 }
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
 const [state, dispatch] = useReducer(layoutReducer, getInitialState());
 const { user, isLoading: authLoading } = useAuthContext();

 useEffect(() => {
 if (authLoading) {
 dispatch({ type: 'SET_LOADING', payload: true });
 return;
 }

 try {
 if (!user) {
 dispatch({ type: 'SET_LAYOUT', payload: 'public' });
 dispatch({ type: 'SET_LOADING', payload: false });
 return;
 }

 dispatch({ type: 'SET_LOADING', payload: false });
 dispatch({ type: 'SET_ERROR', payload: null });
 } catch (error) {
 console.error('Layout detection error:', error);
 dispatch({ type: 'SET_ERROR', payload: 'Failed to determine layout' });
 dispatch({ type: 'SET_LOADING', payload: false });
 }
 }, [user, authLoading]);

 useEffect(() => {
 const handleSyncEvent = (event: LayoutSyncEvent) => {
 try {
 switch (event.type) {
 case 'preferences':
 dispatch({ type: 'RESTORE_PREFERENCES', payload: event.data });
 break;
 case 'navigation':

 break;
 case 'full_state':
 dispatch({ type: 'RESTORE_STATE', payload: event.data });
 break;
 }
 } catch (error) {
 console.error('Failed to handle sync event:', error);
 }
 };

 const unsubscribe = layoutPersistence.addSyncListener(handleSyncEvent);
 return unsubscribe;
 }, []);

 useEffect(() => {
 const success = layoutPersistence.savePreferences(state.preferences);
 if (!success) {
 console.warn('Failed to persist layout preferences');

 }
 }, [state.preferences]);

 useEffect(() => {
 const success = layoutPersistence.saveNavigation(state.navigation);
 if (!success) {
 console.warn('Failed to persist navigation state');

 }
 }, [state.navigation]);

 useEffect(() => {
 const checkStorageAvailability = () => {
 if (!layoutPersistence.isStorageAvailable()) {
 console.warn('Browser storage is not available, layout state will not persist');
 dispatch({ type: 'SET_ERROR', payload: 'Storage unavailable - settings will not be saved' });
 }
 };

 checkStorageAvailability();

 const interval = setInterval(checkStorageAvailability, 30000);
 return () => clearInterval(interval);
 }, []);

 const setSidebarOpen = useCallback((open: boolean) => {
 dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open });
 }, []);

 const setMobileMenuOpen = useCallback((open: boolean) => {
 dispatch({ type: 'SET_MOBILE_MENU_OPEN', payload: open });
 }, []);

 const setSidebarVisible = useCallback((visible: boolean) => {
 dispatch({ type: 'SET_SIDEBAR_VISIBLE', payload: visible });
 }, []);

 const updateLayoutPreferences = useCallback((prefs: Partial<LayoutPreferences>) => {
 dispatch({ type: 'UPDATE_PREFERENCES', payload: prefs });
 }, []);

 const setActiveRoute = useCallback((route: string) => {
 dispatch({ type: 'SET_ACTIVE_ROUTE', payload: route });
 }, []);

 const setBreadcrumbs = useCallback((breadcrumbs: BreadcrumbItem[]) => {
 dispatch({ type: 'SET_BREADCRUMBS', payload: breadcrumbs });
 }, []);

 const clearError = useCallback(() => {
 dispatch({ type: 'SET_ERROR', payload: null });
 }, []);

 const resetLayoutState = useCallback(() => {
 layoutPersistence.clearAll();
 dispatch({ type: 'RESET_STATE' });
 }, []);

 const getStorageInfo = useCallback(() => {
 return layoutPersistence.getStorageInfo();
 }, []);

 const contextValue: LayoutContextType = {
 ...state,
 setSidebarOpen,
 setMobileMenuOpen,
 setSidebarVisible,
 updateLayoutPreferences,
 setActiveRoute,
 setBreadcrumbs,
 clearError,
 resetLayoutState,
 getStorageInfo,
 };

 return (
 <LayoutContext.Provider value={contextValue}>
 {children}
 </LayoutContext.Provider>
 );
}

export function useLayout() {
 const context = useContext(LayoutContext);
 if (context === undefined) {
 throw new Error('useLayout must be used within a LayoutProvider');
 }
 return context;
}