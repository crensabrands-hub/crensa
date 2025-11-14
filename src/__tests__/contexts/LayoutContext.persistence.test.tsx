

import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { LayoutProvider, useLayout } from '@/contexts/LayoutContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ClerkProvider } from '@clerk/nextjs';

jest.mock('@/lib/layout-persistence', () => ({
 layoutPersistence: {
 loadPreferences: jest.fn(() => ({
 sidebarCollapsed: true,
 theme: 'dark',
 compactMode: false,
 })),
 loadNavigation: jest.fn(() => ({
 activeRoute: '/test',
 breadcrumbs: [],
 sidebarOpen: false,
 mobileMenuOpen: false,
 })),
 savePreferences: jest.fn(() => true),
 saveNavigation: jest.fn(() => true),
 isStorageAvailable: jest.fn(() => true),
 addSyncListener: jest.fn(() => () => {}),
 getStorageInfo: jest.fn(() => ({
 preferences: 100,
 navigation: 50,
 available: true,
 })),
 clearAll: jest.fn(),
 },
}));

jest.mock('@clerk/nextjs', () => ({
 ClerkProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
 useAuth: () => ({
 isLoaded: true,
 isSignedIn: false,
 userId: null,
 }),
 useUser: () => ({
 isLoaded: true,
 user: null,
 }),
}));

function TestComponent() {
 const layout = useLayout();
 
 return (
 <div>
 <div data-testid="current-layout">{layout.currentLayout}</div>
 <div data-testid="sidebar-open">{layout.navigation.sidebarOpen.toString()}</div>
 <div data-testid="theme">{layout.preferences.theme}</div>
 <div data-testid="sidebar-collapsed">{layout.preferences.sidebarCollapsed.toString()}</div>
 <div data-testid="active-route">{layout.navigation.activeRoute}</div>
 <div data-testid="loading">{layout.isLayoutLoading.toString()}</div>
 <button 
 data-testid="toggle-sidebar" 
 onClick={() => layout.setSidebarOpen(!layout.navigation.sidebarOpen)}
 >
 Toggle Sidebar
 </button>
 <button 
 data-testid="update-theme" 
 onClick={() => layout.updateLayoutPreferences({ theme: 'light' })}
 >
 Update Theme
 </button>
 <button 
 data-testid="reset-state" 
 onClick={() => layout.resetLayoutState()}
 >
 Reset State
 </button>
 </div>
 );
}

function TestWrapper({ children }: { children: React.ReactNode }) {
 return (
 <ClerkProvider publishableKey="test">
 <AuthProvider>
 <LayoutProvider>
 {children}
 </LayoutProvider>
 </AuthProvider>
 </ClerkProvider>
 );
}

describe('LayoutContext Persistence Integration', () => {
 const mockPersistence = require('@/lib/layout-persistence').layoutPersistence;

 beforeEach(() => {
 jest.clearAllMocks();
 });

 it('should load initial state from persistence on mount', async () => {
 const { getByTestId } = render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(getByTestId('loading')).toHaveTextContent('false');
 });

 expect(getByTestId('theme')).toHaveTextContent('dark');
 expect(getByTestId('sidebar-collapsed')).toHaveTextContent('true');

 expect(getByTestId('sidebar-open')).toHaveTextContent('false');
 expect(getByTestId('active-route')).toHaveTextContent('/test');

 expect(mockPersistence.loadPreferences).toHaveBeenCalled();
 expect(mockPersistence.loadNavigation).toHaveBeenCalled();
 expect(mockPersistence.addSyncListener).toHaveBeenCalled();
 });

 it('should persist preferences when updated', async () => {
 const { getByTestId } = render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(getByTestId('loading')).toHaveTextContent('false');
 });

 act(() => {
 getByTestId('update-theme').click();
 });

 await waitFor(() => {
 expect(getByTestId('theme')).toHaveTextContent('light');
 });

 expect(mockPersistence.savePreferences).toHaveBeenCalledWith(
 expect.objectContaining({
 theme: 'light',
 })
 );
 });

 it('should persist navigation state when updated', async () => {
 const { getByTestId } = render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(getByTestId('loading')).toHaveTextContent('false');
 });

 act(() => {
 getByTestId('toggle-sidebar').click();
 });

 await waitFor(() => {
 expect(getByTestId('sidebar-open')).toHaveTextContent('true');
 });

 expect(mockPersistence.saveNavigation).toHaveBeenCalledWith(
 expect.objectContaining({
 sidebarOpen: true,
 })
 );
 });

 it('should handle reset state functionality', async () => {
 const { getByTestId } = render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(getByTestId('loading')).toHaveTextContent('false');
 });

 act(() => {
 getByTestId('reset-state').click();
 });

 expect(mockPersistence.clearAll).toHaveBeenCalled();
 });

 it('should provide storage info through context', async () => {
 function StorageInfoComponent() {
 const layout = useLayout();
 const info = layout.getStorageInfo();
 
 return (
 <div>
 <div data-testid="storage-available">{info.available.toString()}</div>
 <div data-testid="preferences-size">{info.preferences}</div>
 <div data-testid="navigation-size">{info.navigation}</div>
 </div>
 );
 }

 const { getByTestId } = render(
 <TestWrapper>
 <StorageInfoComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(getByTestId('storage-available')).toHaveTextContent('true');
 expect(getByTestId('preferences-size')).toHaveTextContent('100');
 expect(getByTestId('navigation-size')).toHaveTextContent('50');
 });

 expect(mockPersistence.getStorageInfo).toHaveBeenCalled();
 });

 it('should handle sync events from other tabs', async () => {
 let syncListener: (event: any) => void;
 
 mockPersistence.addSyncListener.mockImplementation((listener: any) => {
 syncListener = listener;
 return () => {};
 });

 const { getByTestId } = render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(getByTestId('loading')).toHaveTextContent('false');
 });

 act(() => {
 syncListener({
 type: 'preferences',
 data: { theme: 'auto', sidebarCollapsed: false },
 timestamp: Date.now(),
 });
 });

 await waitFor(() => {
 expect(getByTestId('theme')).toHaveTextContent('auto');
 expect(getByTestId('sidebar-collapsed')).toHaveTextContent('false');
 });
 });
});