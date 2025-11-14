

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { useLayoutContext, useSimpleLayout } from '@/hooks/useLayoutContext';
import { LayoutProvider } from '@/contexts/LayoutContext';
import { AuthProvider } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext', () => ({
 AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
 useAuthContext: () => ({
 user: null,
 isLoading: false,
 hasRole: jest.fn(() => false),
 userProfile: null,
 isSignedIn: false,
 error: null,
 retry: jest.fn(),
 clearError: jest.fn(),
 isOptimistic: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 lastFetch: null,
 }),
}));

jest.mock('@/lib/layout-persistence', () => ({
 layoutPersistence: {
 loadPreferences: () => ({
 sidebarCollapsed: false,
 theme: 'light',
 compactMode: false,
 }),
 loadNavigation: () => ({
 activeRoute: '/',
 breadcrumbs: [],
 sidebarOpen: true,
 mobileMenuOpen: false,
 }),
 savePreferences: () => true,
 saveNavigation: () => true,
 isStorageAvailable: () => true,
 addSyncListener: () => () => {},
 clearAll: () => {},
 getStorageInfo: () => ({
 preferences: 100,
 navigation: 50,
 available: true,
 }),
 },
}));

function TestComponent() {
 const context = useLayoutContext();
 
 return (
 <div>
 <div data-testid="layout-type">{context.layout.isCreator ? 'creator' : context.layout.isMember ? 'member' : 'public'}</div>
 <div data-testid="is-loading">{context.layout.isAnyLoading.toString()}</div>
 <div data-testid="sidebar-open">{context.navigation.sidebarOpen.toString()}</div>
 <div data-testid="theme">{context.preferences.preferences.theme}</div>
 <div data-testid="storage-available">{context.persistence.isStorageAvailable.toString()}</div>
 <div data-testid="debug-mode">{context.debug.isDebugMode.toString()}</div>
 </div>
 );
}

function SimpleTestComponent() {
 const simple = useSimpleLayout();
 
 return (
 <div>
 <div data-testid="current-layout">{simple.currentLayout}</div>
 <div data-testid="is-loading">{simple.isLoading.toString()}</div>
 <div data-testid="sidebar-open">{simple.sidebarOpen.toString()}</div>
 <div data-testid="theme">{simple.theme}</div>
 </div>
 );
}

function TestWrapper({ children }: { children: React.ReactNode }) {
 return (
 <AuthProvider>
 <LayoutProvider>
 {children}
 </LayoutProvider>
 </AuthProvider>
 );
}

describe('useLayoutContext', () => {
 beforeEach(() => {

 localStorage.clear();
 sessionStorage.clear();
 });

 it('should provide comprehensive layout context', () => {
 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 expect(screen.getByTestId('layout-type')).toHaveTextContent('public');
 expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
 expect(screen.getByTestId('sidebar-open')).toHaveTextContent('true');
 expect(screen.getByTestId('theme')).toHaveTextContent('light');
 expect(screen.getByTestId('storage-available')).toHaveTextContent('true');
 expect(screen.getByTestId('debug-mode')).toHaveTextContent('true'); // In test environment
 });

 it('should provide simple layout interface', () => {
 render(
 <TestWrapper>
 <SimpleTestComponent />
 </TestWrapper>
 );

 expect(screen.getByTestId('current-layout')).toHaveTextContent('public');
 expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
 expect(screen.getByTestId('sidebar-open')).toHaveTextContent('true');
 expect(screen.getByTestId('theme')).toHaveTextContent('light');
 });

 it('should handle layout state changes', () => {
 function InteractiveTestComponent() {
 const context = useLayoutContext();
 
 return (
 <div>
 <div data-testid="sidebar-open">{context.navigation.sidebarOpen.toString()}</div>
 <button 
 data-testid="toggle-sidebar"
 onClick={context.navigation.toggleSidebar}
 >
 Toggle Sidebar
 </button>
 <div data-testid="theme">{context.preferences.preferences.theme}</div>
 <button 
 data-testid="toggle-theme"
 onClick={context.preferences.toggleTheme}
 >
 Toggle Theme
 </button>
 </div>
 );
 }

 render(
 <TestWrapper>
 <InteractiveTestComponent />
 </TestWrapper>
 );

 expect(screen.getByTestId('sidebar-open')).toHaveTextContent('true');
 expect(screen.getByTestId('theme')).toHaveTextContent('light');

 act(() => {
 screen.getByTestId('toggle-sidebar').click();
 });
 expect(screen.getByTestId('sidebar-open')).toHaveTextContent('false');

 act(() => {
 screen.getByTestId('toggle-theme').click();
 });
 expect(screen.getByTestId('theme')).toHaveTextContent('dark');
 });

 it('should provide health status', () => {
 function HealthTestComponent() {
 const context = useLayoutContext();
 const health = context.utils.getHealthStatus();
 
 return (
 <div>
 <div data-testid="health-overall">{health.overall.toString()}</div>
 <div data-testid="health-layout">{health.layout.toString()}</div>
 <div data-testid="health-auth">{health.auth.toString()}</div>
 <div data-testid="health-storage">{health.storage.toString()}</div>
 </div>
 );
 }

 render(
 <TestWrapper>
 <HealthTestComponent />
 </TestWrapper>
 );

 expect(screen.getByTestId('health-overall')).toHaveTextContent('false'); // Auth user is null
 expect(screen.getByTestId('health-layout')).toHaveTextContent('true');
 expect(screen.getByTestId('health-auth')).toHaveTextContent('false'); // No user
 expect(screen.getByTestId('health-storage')).toHaveTextContent('true');
 });
});

describe('Layout Context Integration', () => {
 it('should integrate all layout functionality', () => {
 function IntegrationTestComponent() {
 const context = useLayoutContext();
 
 return (
 <div>
 {}
 <div data-testid="layout-state">
 {context.layout.isCreator ? 'creator' : 
 context.layout.isMember ? 'member' : 'public'}
 </div>
 
 {}
 <div data-testid="navigation-routes">
 {context.navigation.availableRoutes.length}
 </div>
 
 {}
 <div data-testid="preferences-custom">
 {context.preferences.hasCustomPreferences.toString()}
 </div>
 
 {}
 <div data-testid="persistence-available">
 {context.persistence.isStorageAvailable.toString()}
 </div>
 
 {}
 <div data-testid="data-loading">
 {context.data.isLoading.toString()}
 </div>
 
 {}
 <div data-testid="debug-available">
 {context.debug.isDebugMode.toString()}
 </div>
 </div>
 );
 }

 render(
 <TestWrapper>
 <IntegrationTestComponent />
 </TestWrapper>
 );

 expect(screen.getByTestId('layout-state')).toHaveTextContent('public');
 expect(screen.getByTestId('navigation-routes')).toHaveTextContent('0'); // Public layout has no routes
 expect(screen.getByTestId('preferences-custom')).toHaveTextContent('false');
 expect(screen.getByTestId('persistence-available')).toHaveTextContent('true');
 expect(screen.getByTestId('data-loading')).toHaveTextContent('false');
 expect(screen.getByTestId('debug-available')).toHaveTextContent('true'); // Test environment
 });
});