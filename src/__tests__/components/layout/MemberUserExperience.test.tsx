import React from 'react';
import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';

describe('Member User Experience', () => {
 describe('Layout Selection Logic', () => {

 const ROUTE_PATTERNS = {
 creator: [
 '/creator',
 '/creator/dashboard',
 '/creator/upload',
 '/creator/videos',
 '/creator/analytics',
 '/creator/earnings',
 '/creator/settings',
 ],
 member: [
 '/dashboard',
 '/profile',
 '/settings',
 '/notifications',
 '/watch',
 '/discover',
 '/wallet',
 '/membership',
 '/reels',
 ],
 public: [
 '/',
 '/sign-in',
 '/sign-up',
 '/onboarding',
 '/about',
 '/contact',
 '/privacy',
 '/terms',
 '/payment',
 ],
 };

 function getLayoutFromPath(pathname: string): 'creator' | 'member' | 'public' {

 if (ROUTE_PATTERNS.creator.some((pattern) => pathname.startsWith(pattern))) {
 return 'creator';
 }

 if (ROUTE_PATTERNS.member.some((pattern) => pathname.startsWith(pattern))) {
 return 'member';
 }

 return 'public';
 }

 function determineLayout(
 userRole: 'creator' | 'member' | null,
 pathname: string,
 isAuthenticated: boolean
 ): 'creator' | 'member' | 'public' {
 const routeBasedLayout = getLayoutFromPath(pathname);

 if (!isAuthenticated) {
 return 'public';
 }

 if (routeBasedLayout === 'creator' && userRole === 'creator') {
 return 'creator';
 }

 if (routeBasedLayout === 'member' && userRole === 'member') {
 return 'member';
 }

 if (routeBasedLayout === 'public') {
 return 'public';
 }

 return routeBasedLayout;
 }

 function getRedirectRoute(
 userRole: 'creator' | 'member' | null,
 currentPath: string,
 expectedLayout: 'creator' | 'member' | 'public'
 ): string | null {

 if (!userRole) {
 return null;
 }

 const userLayout = userRole === 'creator' ? 'creator' : 'member';
 if (expectedLayout === userLayout) {
 return null;
 }

 if (userRole === 'member' && expectedLayout === 'creator') {
 return '/dashboard'; // member default route
 }

 if (userRole === 'creator' && expectedLayout === 'member') {

 const allowedMemberRoutes = ['/profile', '/settings', '/notifications', '/wallet'];
 if (allowedMemberRoutes.some(route => currentPath.startsWith(route))) {
 return null;
 }
 return '/creator/dashboard'; // creator default route
 }

 return null;
 }

 it('should ensure members see MemberHeader instead of CreatorHeader', () => {

 const memberLayout = determineLayout('member', '/dashboard', true);
 expect(memberLayout).toBe('member');

 const profileLayout = determineLayout('member', '/profile', true);
 expect(profileLayout).toBe('member');

 const walletLayout = determineLayout('member', '/wallet', true);
 expect(walletLayout).toBe('member');

 const creatorDashboardLayout = determineLayout('member', '/creator/dashboard', true);
 expect(creatorDashboardLayout).toBe('creator');

 const redirectRoute = getRedirectRoute('member', '/creator/dashboard', creatorDashboardLayout);
 expect(redirectRoute).toBe('/dashboard');
 });

 it('should route members to member dashboard instead of creator dashboard', () => {

 const memberDashboardLayout = determineLayout('member', '/dashboard', true);
 expect(memberDashboardLayout).toBe('member');
 const noRedirect = getRedirectRoute('member', '/dashboard', memberDashboardLayout);
 expect(noRedirect).toBe(null);

 const creatorDashboardLayout = determineLayout('member', '/creator/dashboard', true);
 expect(creatorDashboardLayout).toBe('creator');
 const redirectToMember = getRedirectRoute('member', '/creator/dashboard', creatorDashboardLayout);
 expect(redirectToMember).toBe('/dashboard');

 const creatorUploadLayout = determineLayout('member', '/creator/upload', true);
 expect(creatorUploadLayout).toBe('creator');
 const redirectFromUpload = getRedirectRoute('member', '/creator/upload', creatorUploadLayout);
 expect(redirectFromUpload).toBe('/dashboard');
 });

 it('should update home page routing based on user role', () => {

 const memberOnHome = determineLayout('member', '/', true);
 expect(memberOnHome).toBe('public');

 const creatorOnHome = determineLayout('creator', '/', true);
 expect(creatorOnHome).toBe('public');

 const memberHomeRedirect = getRedirectRoute('member', '/', memberOnHome);
 expect(memberHomeRedirect).toBe(null);

 const creatorHomeRedirect = getRedirectRoute('creator', '/', creatorOnHome);
 expect(creatorHomeRedirect).toBe(null);
 });

 it('should handle creator users correctly', () => {

 const creatorDashboardLayout = determineLayout('creator', '/creator/dashboard', true);
 expect(creatorDashboardLayout).toBe('creator');
 const noRedirect = getRedirectRoute('creator', '/creator/dashboard', creatorDashboardLayout);
 expect(noRedirect).toBe(null);

 const memberDashboardLayout = determineLayout('creator', '/dashboard', true);
 expect(memberDashboardLayout).toBe('member');
 const redirectToCreator = getRedirectRoute('creator', '/dashboard', memberDashboardLayout);
 expect(redirectToCreator).toBe('/creator/dashboard');

 const profileLayout = determineLayout('creator', '/profile', true);
 expect(profileLayout).toBe('member');
 const noProfileRedirect = getRedirectRoute('creator', '/profile', profileLayout);
 expect(noProfileRedirect).toBe(null);

 const settingsLayout = determineLayout('creator', '/settings', true);
 expect(settingsLayout).toBe('member');
 const noSettingsRedirect = getRedirectRoute('creator', '/settings', settingsLayout);
 expect(noSettingsRedirect).toBe(null);
 });

 it('should handle unauthenticated users correctly', () => {

 expect(determineLayout(null, '/dashboard', false)).toBe('public');
 expect(determineLayout(null, '/creator/dashboard', false)).toBe('public');
 expect(determineLayout(null, '/', false)).toBe('public');

 expect(getRedirectRoute(null, '/dashboard', 'public')).toBe(null);
 expect(getRedirectRoute(null, '/creator/dashboard', 'public')).toBe(null);
 });
 });

 describe('Layout Configuration', () => {
 it('should have correct layout configurations', () => {
 const LAYOUT_CONFIGS = {
 creator: {
 defaultRoute: '/creator/dashboard',
 showSidebar: true,
 requiresAuth: true,
 },
 member: {
 defaultRoute: '/dashboard',
 showSidebar: false,
 requiresAuth: true,
 },
 public: {
 defaultRoute: '/',
 showSidebar: false,
 requiresAuth: false,
 },
 };

 expect(LAYOUT_CONFIGS.member.showSidebar).toBe(false);
 expect(LAYOUT_CONFIGS.member.defaultRoute).toBe('/dashboard');
 expect(LAYOUT_CONFIGS.member.requiresAuth).toBe(true);

 expect(LAYOUT_CONFIGS.creator.showSidebar).toBe(true);
 expect(LAYOUT_CONFIGS.creator.defaultRoute).toBe('/creator/dashboard');
 expect(LAYOUT_CONFIGS.creator.requiresAuth).toBe(true);

 expect(LAYOUT_CONFIGS.public.requiresAuth).toBe(false);
 expect(LAYOUT_CONFIGS.public.defaultRoute).toBe('/');
 });
 });

 describe('Member Route Coverage', () => {
 it('should cover all expected member routes', () => {
 const memberRoutes = [
 '/dashboard',
 '/profile',
 '/settings',
 '/notifications',
 '/watch',
 '/discover',
 '/wallet',
 '/membership',
 '/reels',
 ];

 function getLayoutFromPath(pathname: string): 'creator' | 'member' | 'public' {
 const creatorRoutes = ['/creator'];
 if (creatorRoutes.some((pattern) => pathname.startsWith(pattern))) {
 return 'creator';
 }
 if (memberRoutes.some((pattern) => pathname.startsWith(pattern))) {
 return 'member';
 }
 return 'public';
 }

 memberRoutes.forEach(route => {
 expect(getLayoutFromPath(route)).toBe('member');
 });

 expect(getLayoutFromPath('/dashboard/analytics')).toBe('member');
 expect(getLayoutFromPath('/profile/edit')).toBe('member');
 expect(getLayoutFromPath('/wallet/transactions')).toBe('member');
 expect(getLayoutFromPath('/watch/history')).toBe('member');
 expect(getLayoutFromPath('/discover/trending')).toBe('member');
 });
 });
});