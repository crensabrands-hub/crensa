import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ClerkProvider } from '@clerk/nextjs';
import { AuthProvider } from '../AuthContext';
import { LayoutProvider, useLayout } from '../LayoutContext';

jest.mock('@clerk/nextjs', () => ({
 ClerkProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
 useUser: () => ({
 user: null,
 isLoaded: true,
 isSignedIn: false,
 }),
 useAuth: () => ({
 isLoaded: true,
 isSignedIn: false,
 signOut: jest.fn(),
 }),
}));

jest.mock('../AuthContext', () => ({
 AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
 useAuthContext: () => ({
 user: null,
 userProfile: null,
 isLoading: false,
 isSignedIn: false,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(() => false),
 }),
}));

function TestComponent() {
 const {
 currentLayout,
 isLayoutLoading,
 setSidebarOpen,
 navigation,
 updateLayoutPreferences,
 } = useLayout();

 return (
 <div>
 <div data-testid="current-layout">{currentLayout}</div>
 <div data-testid="is-loading">{isLayoutLoading.toString()}</div>
 <div data-testid="sidebar-open">{navigation.sidebarOpen.toString()}</div>
 <button
 data-testid="toggle-sidebar"
 onClick={() => setSidebarOpen(!navigation.sidebarOpen)}
 >
 Toggle Sidebar
 </button>
 <button
 data-testid="update-preferences"
 onClick={() => updateLayoutPreferences({ compactMode: true })}
 >
 Update Preferences
 </button>
 </div>
 );
}

function TestWrapper({ children }: { children: React.ReactNode }) {
 return (
 <ClerkProvider>
 <AuthProvider>
 <LayoutProvider>
 {children}
 </LayoutProvider>
 </AuthProvider>
 </ClerkProvider>
 );
}

describe('LayoutContext', () => {
 beforeEach(() => {

 localStorage.clear();
 sessionStorage.clear();
 });

 it('should provide default layout state', async () => {
 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('current-layout')).toHaveTextContent('public');
 expect(screen.getByTestId('sidebar-open')).toHaveTextContent('true');
 });
 });

 it('should update sidebar state', async () => {
 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 const toggleButton = screen.getByTestId('toggle-sidebar');
 
 await waitFor(() => {
 expect(screen.getByTestId('sidebar-open')).toHaveTextContent('true');
 });

 act(() => {
 toggleButton.click();
 });

 await waitFor(() => {
 expect(screen.getByTestId('sidebar-open')).toHaveTextContent('false');
 });
 });

 it('should throw error when used outside provider', () => {

 const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

 expect(() => {
 render(<TestComponent />);
 }).toThrow('useLayout must be used within a LayoutProvider');

 consoleSpy.mockRestore();
 });

 it('should persist preferences to localStorage', async () => {
 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 const updateButton = screen.getByTestId('update-preferences');
 
 act(() => {
 updateButton.click();
 });

 await waitFor(() => {
 const storedPreferences = localStorage.getItem('layout_preferences');
 expect(storedPreferences).toBeTruthy();
 
 if (storedPreferences) {
 const preferences = JSON.parse(storedPreferences);
 expect(preferences.compactMode).toBe(true);
 }
 });
 });
});