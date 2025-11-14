

import { 
 LayoutPersistence, 
 DEFAULT_PREFERENCES, 
 DEFAULT_NAVIGATION,
 STORAGE_KEYS 
} from '@/lib/layout-persistence';

const mockStorage = () => {
 let store: Record<string, string> = {};
 
 return {
 getItem: jest.fn((key: string) => store[key] || null),
 setItem: jest.fn((key: string, value: string) => {
 store[key] = value;
 }),
 removeItem: jest.fn((key: string) => {
 delete store[key];
 }),
 clear: jest.fn(() => {
 store = {};
 }),
 };
};

const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty(window, 'localStorage', {
 value: mockStorage(),
});

Object.defineProperty(window, 'sessionStorage', {
 value: mockStorage(),
});

Object.defineProperty(window, 'addEventListener', {
 value: mockAddEventListener,
});

Object.defineProperty(window, 'removeEventListener', {
 value: mockRemoveEventListener,
});

describe('LayoutPersistence', () => {
 let persistence: LayoutPersistence;

 beforeEach(() => {

 jest.clearAllMocks();
 (window.localStorage as any).clear();
 (window.sessionStorage as any).clear();

 persistence = LayoutPersistence.getInstance();
 });

 describe('Preferences Management', () => {
 it('should save preferences to localStorage', () => {
 const preferences = {
 sidebarCollapsed: true,
 theme: 'dark' as const,
 compactMode: true,
 };

 const result = persistence.savePreferences(preferences);

 expect(result).toBe(true);
 expect(window.localStorage.setItem).toHaveBeenCalledWith(
 STORAGE_KEYS.PREFERENCES,
 JSON.stringify(preferences)
 );
 });

 it('should load preferences from localStorage', () => {
 const preferences = {
 sidebarCollapsed: true,
 theme: 'dark' as const,
 compactMode: true,
 };

 (window.localStorage.getItem as jest.Mock).mockReturnValue(
 JSON.stringify(preferences)
 );

 const result = persistence.loadPreferences();

 expect(result).toEqual(preferences);
 expect(window.localStorage.getItem).toHaveBeenCalledWith(
 STORAGE_KEYS.PREFERENCES
 );
 });

 it('should return default preferences when none stored', () => {
 (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

 const result = persistence.loadPreferences();

 expect(result).toEqual(DEFAULT_PREFERENCES);
 });

 it('should return default preferences when stored data is invalid', () => {
 (window.localStorage.getItem as jest.Mock).mockReturnValue('invalid json');

 const result = persistence.loadPreferences();

 expect(result).toEqual(DEFAULT_PREFERENCES);
 });

 it('should validate and sanitize preferences', () => {
 const invalidPreferences = {
 sidebarCollapsed: 'not a boolean',
 theme: 'invalid-theme',
 compactMode: null,
 extraProperty: 'should be ignored',
 };

 (window.localStorage.getItem as jest.Mock).mockReturnValue(
 JSON.stringify(invalidPreferences)
 );

 const result = persistence.loadPreferences();

 expect(result).toEqual({
 sidebarCollapsed: DEFAULT_PREFERENCES.sidebarCollapsed,
 theme: DEFAULT_PREFERENCES.theme,
 compactMode: DEFAULT_PREFERENCES.compactMode,
 });
 });
 });

 describe('Navigation State Management', () => {
 it('should save navigation state to sessionStorage', () => {
 const navigation = {
 activeRoute: '/dashboard',
 breadcrumbs: [{ label: 'Home', href: '/', active: false }],
 sidebarOpen: false,
 mobileMenuOpen: true,
 };

 const result = persistence.saveNavigation(navigation);

 expect(result).toBe(true);
 expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
 STORAGE_KEYS.NAVIGATION,
 JSON.stringify(navigation)
 );
 });

 it('should load navigation state from sessionStorage', () => {
 const navigation = {
 activeRoute: '/dashboard',
 breadcrumbs: [{ label: 'Home', href: '/', active: false }],
 sidebarOpen: false,
 mobileMenuOpen: true,
 };

 (window.sessionStorage.getItem as jest.Mock).mockReturnValue(
 JSON.stringify(navigation)
 );

 const result = persistence.loadNavigation();

 expect(result).toEqual(navigation);
 });

 it('should return default navigation when none stored', () => {
 (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);

 const result = persistence.loadNavigation();

 expect(result).toEqual(DEFAULT_NAVIGATION);
 });

 it('should validate and sanitize navigation state', () => {
 const invalidNavigation = {
 activeRoute: 123, // should be string
 breadcrumbs: 'not an array',
 sidebarOpen: 'not a boolean',
 mobileMenuOpen: null,
 };

 (window.sessionStorage.getItem as jest.Mock).mockReturnValue(
 JSON.stringify(invalidNavigation)
 );

 const result = persistence.loadNavigation();

 expect(result).toEqual({
 activeRoute: DEFAULT_NAVIGATION.activeRoute,
 breadcrumbs: DEFAULT_NAVIGATION.breadcrumbs,
 sidebarOpen: DEFAULT_NAVIGATION.sidebarOpen,
 mobileMenuOpen: DEFAULT_NAVIGATION.mobileMenuOpen,
 });
 });
 });

 describe('Storage Availability', () => {
 it('should detect when storage is available', () => {
 const result = persistence.isStorageAvailable();
 expect(result).toBe(true);
 });

 it('should handle storage errors gracefully', () => {
 (window.localStorage.setItem as jest.Mock).mockImplementation(() => {
 throw new Error('Storage quota exceeded');
 });

 const result = persistence.isStorageAvailable();
 expect(result).toBe(false);
 });
 });

 describe('Cross-tab Synchronization', () => {
 it('should add and remove sync listeners', () => {
 const listener = jest.fn();
 
 const unsubscribe = persistence.addSyncListener(listener);
 expect(typeof unsubscribe).toBe('function');

 unsubscribe();
 });

 it('should handle sync events', () => {
 const listener = jest.fn();
 persistence.addSyncListener(listener);

 const storageEvent = new StorageEvent('storage', {
 key: STORAGE_KEYS.SYNC_EVENT,
 newValue: JSON.stringify({
 type: 'preferences',
 data: { theme: 'dark' },
 timestamp: Date.now(),
 }),
 });

 const storageHandler = mockAddEventListener.mock.calls.find(
 call => call[0] === 'storage'
 )?.[1];

 if (storageHandler) {
 storageHandler(storageEvent);
 expect(listener).toHaveBeenCalled();
 }
 });
 });

 describe('Data Management', () => {
 it('should clear all stored data', () => {
 persistence.clearAll();

 expect(window.localStorage.removeItem).toHaveBeenCalledWith(
 STORAGE_KEYS.PREFERENCES
 );
 expect(window.sessionStorage.removeItem).toHaveBeenCalledWith(
 STORAGE_KEYS.NAVIGATION
 );
 });

 it('should get storage info', () => {
 const info = persistence.getStorageInfo();

 expect(info).toHaveProperty('preferences');
 expect(info).toHaveProperty('navigation');
 expect(info).toHaveProperty('available');
 expect(typeof info.preferences).toBe('number');
 expect(typeof info.navigation).toBe('number');
 expect(typeof info.available).toBe('boolean');
 });
 });

 describe('Error Handling', () => {
 it('should handle localStorage errors when saving preferences', () => {
 (window.localStorage.setItem as jest.Mock).mockImplementation(() => {
 throw new Error('Storage error');
 });

 const result = persistence.savePreferences(DEFAULT_PREFERENCES);
 expect(result).toBe(false);
 });

 it('should handle sessionStorage errors when saving navigation', () => {
 (window.sessionStorage.setItem as jest.Mock).mockImplementation(() => {
 throw new Error('Storage error');
 });

 const result = persistence.saveNavigation(DEFAULT_NAVIGATION);
 expect(result).toBe(false);
 });

 it('should handle JSON parsing errors gracefully', () => {
 (window.localStorage.getItem as jest.Mock).mockReturnValue('invalid json');

 const result = persistence.loadPreferences();
 expect(result).toEqual(DEFAULT_PREFERENCES);
 });
 });
});