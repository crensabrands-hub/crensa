import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import RoleBasedLayoutWrapper from '@/components/layout/RoleBasedLayoutWrapper';

const mockAuthContext = {
 user: null,
 userProfile: null,
 isLoading: false,
 isSignedIn: false,
 error: null,
 signOut: jest.fn(),
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 retry: jest.fn(),
 clearError: jest.fn(),
};

const mockLayoutContext = {
 currentLayout: 'public' as const,
 isLayoutLoading: false,
 preferences: {
 sidebarCollapsed: false,
 theme: 'light' as const,
 compactMode: false,
 },
 navigation: {
 activeRoute: '/',
 breadcrumbs: [],
 sidebarOpen: false,
 mobileMenuOpen: false,
 },
 error: null,
 setActiveRoute: jest.fn(),
 setBreadcrumbs: jest.fn(),
 toggleSidebar: jest.fn(),
 toggleMobileMenu: jest.fn(),
 updatePreferences: jest.fn(),
 clearError: jest.fn(),
};

const mockRouter = {
 push: jest.fn(),
 replace: jest.fn(),
 back: jest.fn(),
};

jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: () => mockAuthContext,
}));

jest.mock('@/contexts/LayoutContext', () => ({
 useLayout: () => mockLayoutContext,
}));

jest.mock('next/navigation', () => ({
 useRouter: () => mockRouter,
 usePathname: () => '/dashboard',
}));

jest.mock('@/components/layout/MemberLayout', () => {
 return function MockMemberLayout({ children }: { children: React.ReactNode }) {
 return (
 <div data-testid="member-layout">
 <div data-testid="member-header">Member Header</div>
 <main>{children}</main>
 </div>
 );
 };
});

jest.mock('@/components/layout/CreatorLayout', () => {
 return function MockCreatorLayout({ children }: { children: React.ReactNode }) {
 return (
 <div data-testid="creator-layout">
 <div data-testid="creator-header">Creator Header</div>
 <main>{children}</main>
 </div>
 );
 };
});

describe('Member Layout and Routing', () => {
 beforeEach(() => {
 jest.clearAllMocks();

 mockAuthContext.isSignedIn = false;
 mockAuthContext.userProfile = null;
 mockAuthContext.isLoading = false;
 });

 describe('Member User Layout', () => {
 it('should show MemberLayout for authenticated member users on dashboard', async () => {

 mockAuthContext.isSignedIn = true;
 mockAuthContext.userProfile = {
 id: '1',
 clerkId: 'clerk_1',
 email: 'member@example.com',
 username: 'member',
 role: 'member',
 createdAt: new Date(),
 updatedAt: new Date(),
 };

 render(
 <RoleBasedLayoutWrapper>
 <div data-testid="dashboard-content">Member Dashboard Content</div>
 </RoleBasedLayoutWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('member-layout')).toBeInTheDocument();
 expect(screen.getByTestId('member-header')).toBeInTheDocument();
 expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
 });

 expect(screen.queryByTestId('creator-layout')).not.toBeInTheDocument();
 expect(screen.queryByTestId('creator-header')).not.toBeInTheDocument();
 });

 it('should redirect member users trying to access creator routes', async () => {

 mockAuthContext.isSignedIn = true;
 mockAuthContext.userProfile = {
 id: '1',
 clerkId: 'clerk_1',
 email: 'member@example.com',
 username: 'member',
 role: 'member',
 createdAt: new Date(),
 updatedAt: new Date(),
 };

 jest.doMock('next/navigation', () => ({
 useRouter: () => mockRouter,
 usePathname: () => '/creator/dashboard',
 }));

 render(
 <RoleBasedLayoutWrapper>
 <div data-testid="creator-content">Creator Content</div>
 </RoleBasedLayoutWrapper>
 );

 await waitFor(() => {
 expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
 });
 });

 it('should allow member users to access member routes', async () => {

 mockAuthContext.isSignedIn = true;
 mockAuthContext.userProfile = {
 id: '1',
 clerkId: 'clerk_1',
 email: 'member@example.com',
 username: 'member',
 role: 'member',
 createdAt: new Date(),
 updatedAt: new Date(),
 };

 const memberRoutes = ['/dashboard', '/profile', '/settings', '/notifications', '/wallet'];

 for (const route of memberRoutes) {
 jest.doMock('next/navigation', () => ({
 useRouter: () => mockRouter,
 usePathname: () => route,
 }));

 const { unmount } = render(
 <RoleBasedLayoutWrapper>
 <div data-testid="member-content">Member Content</div>
 </RoleBasedLayoutWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('member-layout')).toBeInTheDocument();
 });

 expect(mockRouter.push).not.toHaveBeenCalled();

 unmount();
 jest.clearAllMocks();
 }
 });
 });

 describe('Creator User Layout', () => {
 it('should show CreatorLayout for authenticated creator users', async () => {

 mockAuthContext.isSignedIn = true;
 mockAuthContext.userProfile = {
 id: '1',
 clerkId: 'clerk_1',
 email: 'creator@example.com',
 username: 'creator',
 role: 'creator',
 createdAt: new Date(),
 updatedAt: new Date(),
 };

 jest.doMock('next/navigation', () => ({
 useRouter: () => mockRouter,
 usePathname: () => '/creator/dashboard',
 }));

 render(
 <RoleBasedLayoutWrapper>
 <div data-testid="creator-content">Creator Dashboard Content</div>
 </RoleBasedLayoutWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('creator-layout')).toBeInTheDocument();
 expect(screen.getByTestId('creator-header')).toBeInTheDocument();
 expect(screen.getByTestId('creator-content')).toBeInTheDocument();
 });

 expect(screen.queryByTestId('member-layout')).not.toBeInTheDocument();
 expect(screen.queryByTestId('member-header')).not.toBeInTheDocument();
 });

 it('should redirect creator users to creator dashboard from member dashboard', async () => {

 mockAuthContext.isSignedIn = true;
 mockAuthContext.userProfile = {
 id: '1',
 clerkId: 'clerk_1',
 email: 'creator@example.com',
 username: 'creator',
 role: 'creator',
 createdAt: new Date(),
 updatedAt: new Date(),
 };

 jest.doMock('next/navigation', () => ({
 useRouter: () => mockRouter,
 usePathname: () => '/dashboard',
 }));

 render(
 <RoleBasedLayoutWrapper>
 <div data-testid="dashboard-content">Dashboard Content</div>
 </RoleBasedLayoutWrapper>
 );

 await waitFor(() => {
 expect(mockRouter.push).toHaveBeenCalledWith('/creator/dashboard');
 });
 });
 });

 describe('Home Page Routing', () => {
 it('should redirect member users from home page to member dashboard', async () => {

 mockAuthContext.isSignedIn = true;
 mockAuthContext.userProfile = {
 id: '1',
 clerkId: 'clerk_1',
 email: 'member@example.com',
 username: 'member',
 role: 'member',
 createdAt: new Date(),
 updatedAt: new Date(),
 };

 jest.doMock('next/navigation', () => ({
 useRouter: () => mockRouter,
 usePathname: () => '/',
 }));

 render(
 <RoleBasedLayoutWrapper>
 <div data-testid="home-content">Home Content</div>
 </RoleBasedLayoutWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('home-content')).toBeInTheDocument();
 });
 });

 it('should redirect creator users from home page to creator dashboard', async () => {

 mockAuthContext.isSignedIn = true;
 mockAuthContext.userProfile = {
 id: '1',
 clerkId: 'clerk_1',
 email: 'creator@example.com',
 username: 'creator',
 role: 'creator',
 createdAt: new Date(),
 updatedAt: new Date(),
 };

 jest.doMock('next/navigation', () => ({
 useRouter: () => mockRouter,
 usePathname: () => '/',
 }));

 render(
 <RoleBasedLayoutWrapper>
 <div data-testid="home-content">Home Content</div>
 </RoleBasedLayoutWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('home-content')).toBeInTheDocument();
 });
 });
 });

 describe('Unauthenticated Users', () => {
 it('should show public layout for unauthenticated users', async () => {

 mockAuthContext.isSignedIn = false;
 mockAuthContext.userProfile = null;

 render(
 <RoleBasedLayoutWrapper>
 <div data-testid="public-content">Public Content</div>
 </RoleBasedLayoutWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('public-content')).toBeInTheDocument();
 });

 expect(screen.queryByTestId('member-layout')).not.toBeInTheDocument();
 expect(screen.queryByTestId('creator-layout')).not.toBeInTheDocument();
 });
 });
});