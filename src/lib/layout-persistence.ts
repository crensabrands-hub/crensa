

import { LayoutPreferences, NavigationState, LayoutState } from '@/contexts/LayoutContext';

export const STORAGE_KEYS = {
 PREFERENCES: 'crensa_layout_preferences',
 NAVIGATION: 'crensa_layout_navigation',
 SYNC_EVENT: 'crensa_layout_sync',
} as const;

export interface LayoutSyncEvent {
 type: 'preferences' | 'navigation' | 'full_state';
 data: any;
 timestamp: number;
}

export const DEFAULT_PREFERENCES: LayoutPreferences = {
 sidebarCollapsed: false,
 theme: 'light',
 compactMode: false,
};

export const DEFAULT_NAVIGATION: NavigationState = {
 activeRoute: '',
 breadcrumbs: [],
 sidebarOpen: true,
 mobileMenuOpen: false,
 sidebarVisible: true,
};

function validatePreferences(data: any): LayoutPreferences {
 if (!data || typeof data !== 'object') {
 return DEFAULT_PREFERENCES;
 }

 return {
 sidebarCollapsed: typeof data.sidebarCollapsed === 'boolean' 
 ? data.sidebarCollapsed 
 : DEFAULT_PREFERENCES.sidebarCollapsed,
 theme: ['light', 'dark', 'auto'].includes(data.theme) 
 ? data.theme 
 : DEFAULT_PREFERENCES.theme,
 compactMode: typeof data.compactMode === 'boolean' 
 ? data.compactMode 
 : DEFAULT_PREFERENCES.compactMode,
 };
}

function validateNavigation(data: any): NavigationState {
 if (!data || typeof data !== 'object') {
 return DEFAULT_NAVIGATION;
 }

 return {
 activeRoute: typeof data.activeRoute === 'string' 
 ? data.activeRoute 
 : DEFAULT_NAVIGATION.activeRoute,
 breadcrumbs: Array.isArray(data.breadcrumbs) 
 ? data.breadcrumbs.filter((item: any) => 
 item && 
 typeof item.label === 'string' && 
 typeof item.href === 'string' &&
 typeof item.active === 'boolean'
 )
 : DEFAULT_NAVIGATION.breadcrumbs,
 sidebarOpen: typeof data.sidebarOpen === 'boolean' 
 ? data.sidebarOpen 
 : DEFAULT_NAVIGATION.sidebarOpen,
 mobileMenuOpen: typeof data.mobileMenuOpen === 'boolean' 
 ? data.mobileMenuOpen 
 : DEFAULT_NAVIGATION.mobileMenuOpen,
 sidebarVisible: typeof data.sidebarVisible === 'boolean' 
 ? data.sidebarVisible 
 : DEFAULT_NAVIGATION.sidebarVisible,
 };
}

export class LayoutPersistence {
 private static instance: LayoutPersistence;
 private syncListeners: Set<(event: LayoutSyncEvent) => void> = new Set();

 private constructor() {

 if (typeof window !== 'undefined') {
 window.addEventListener('storage', this.handleStorageEvent.bind(this));
 window.addEventListener('beforeunload', this.cleanup.bind(this));
 }
 }

 static getInstance(): LayoutPersistence {
 if (!LayoutPersistence.instance) {
 LayoutPersistence.instance = new LayoutPersistence();
 }
 return LayoutPersistence.instance;
 }

 savePreferences(preferences: LayoutPreferences): boolean {
 try {
 if (typeof window === 'undefined') {
 return false;
 }
 
 const data = JSON.stringify(preferences);
 localStorage.setItem(STORAGE_KEYS.PREFERENCES, data);

 this.broadcastSync({
 type: 'preferences',
 data: preferences,
 timestamp: Date.now(),
 });
 
 return true;
 } catch (error) {
 console.error('Failed to save layout preferences:', error);
 return false;
 }
 }

 loadPreferences(): LayoutPreferences {
 try {
 if (typeof window === 'undefined') {
 return DEFAULT_PREFERENCES;
 }
 
 const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
 if (!stored) {
 return DEFAULT_PREFERENCES;
 }

 const parsed = JSON.parse(stored);
 return validatePreferences(parsed);
 } catch (error) {
 console.error('Failed to load layout preferences:', error);
 return DEFAULT_PREFERENCES;
 }
 }

 saveNavigation(navigation: NavigationState): boolean {
 try {
 if (typeof window === 'undefined') {
 return false;
 }
 
 const data = JSON.stringify(navigation);
 sessionStorage.setItem(STORAGE_KEYS.NAVIGATION, data);

 return true;
 } catch (error) {
 console.error('Failed to save navigation state:', error);
 return false;
 }
 }

 loadNavigation(): NavigationState {
 try {
 if (typeof window === 'undefined') {
 return DEFAULT_NAVIGATION;
 }
 
 const stored = sessionStorage.getItem(STORAGE_KEYS.NAVIGATION);
 if (!stored) {
 return DEFAULT_NAVIGATION;
 }

 const parsed = JSON.parse(stored);
 return validateNavigation(parsed);
 } catch (error) {
 console.error('Failed to load navigation state:', error);
 return DEFAULT_NAVIGATION;
 }
 }

 clearAll(): void {
 try {
 if (typeof window === 'undefined') {
 return;
 }
 
 localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
 sessionStorage.removeItem(STORAGE_KEYS.NAVIGATION);
 } catch (error) {
 console.error('Failed to clear layout data:', error);
 }
 }

 isStorageAvailable(): boolean {
 try {
 if (typeof window === 'undefined') {
 return false;
 }
 
 const testKey = '__storage_test__';
 localStorage.setItem(testKey, 'test');
 localStorage.removeItem(testKey);
 return true;
 } catch {
 return false;
 }
 }

 addSyncListener(listener: (event: LayoutSyncEvent) => void): () => void {
 this.syncListeners.add(listener);

 return () => {
 this.syncListeners.delete(listener);
 };
 }

 private broadcastSync(event: LayoutSyncEvent): void {
 try {
 if (typeof window === 'undefined') {
 return;
 }

 const syncData = JSON.stringify(event);
 localStorage.setItem(STORAGE_KEYS.SYNC_EVENT, syncData);

 localStorage.removeItem(STORAGE_KEYS.SYNC_EVENT);
 } catch (error) {
 console.error('Failed to broadcast sync event:', error);
 }
 }

 private handleStorageEvent(event: StorageEvent): void {
 if (event.key === STORAGE_KEYS.SYNC_EVENT && event.newValue) {
 try {
 const syncEvent: LayoutSyncEvent = JSON.parse(event.newValue);

 this.syncListeners.forEach(listener => {
 try {
 listener(syncEvent);
 } catch (error) {
 console.error('Sync listener error:', error);
 }
 });
 } catch (error) {
 console.error('Failed to handle sync event:', error);
 }
 }
 }

 private cleanup(): void {
 this.syncListeners.clear();
 }

 getStorageInfo(): { preferences: number; navigation: number; available: boolean } {
 try {
 if (typeof window === 'undefined') {
 return {
 preferences: 0,
 navigation: 0,
 available: false,
 };
 }
 
 const prefsData = localStorage.getItem(STORAGE_KEYS.PREFERENCES) || '';
 const navData = sessionStorage.getItem(STORAGE_KEYS.NAVIGATION) || '';
 
 return {
 preferences: new Blob([prefsData]).size,
 navigation: new Blob([navData]).size,
 available: this.isStorageAvailable(),
 };
 } catch {
 return {
 preferences: 0,
 navigation: 0,
 available: false,
 };
 }
 }
}

export const layoutPersistence = LayoutPersistence.getInstance();