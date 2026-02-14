'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import type { UserResource } from '@clerk/types';
import { resetGuestWatchCount } from '@/lib/utils/guestAccess';

export type UserRole = 'creator' | 'member';

export interface UserProfile {
 id: string;
 clerkId: string;
 email: string;
 username: string;
 role: UserRole;
 avatar?: string;
 createdAt: Date;
 updatedAt: Date;
}

export interface CreatorProfile extends UserProfile {
 role: 'creator';
 displayName: string;
 bio?: string;
 totalEarnings: number;
 totalViews: number;
 videoCount: number;
 socialLinks?: Array<{
 platform: string;
 url: string;
 }>;
}

export interface MemberProfile extends UserProfile {
 role: 'member';
 walletBalance: number;
 membershipStatus: 'free' | 'premium';
 membershipExpiry?: Date;
 autoRenew: boolean;
 watchHistory: string[];
 favoriteCreators: string[];
}

export interface AuthError {
 type: 'network' | 'unauthorized' | 'profile_not_found' | 'session_expired' | 'unknown';
 message: string;
 retryable: boolean;
}

export interface AuthState {
 user: UserResource | null;
 userProfile: UserProfile | null;
 isLoading: boolean;
 isSignedIn: boolean;
 error: AuthError | null;
 lastFetch: number | null;
 isOptimistic: boolean;
}

interface AuthContextType extends AuthState {
 signOut: () => Promise<void>;
 updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
 hasRole: (role: UserRole) => boolean;
 retry: () => Promise<void>;
 clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const SESSION_STORAGE_KEY = 'auth_state';
const PROFILE_CACHE_KEY = 'user_profile_cache';

export function AuthProvider({ children }: { children: React.ReactNode }) {
 const { user, isLoaded } = useUser();
 const { isSignedIn, signOut: clerkSignOut } = useAuth();
 
 const [authState, setAuthState] = useState<AuthState>(() => {

 if (typeof window !== 'undefined') {
 try {
 const cached = sessionStorage.getItem(SESSION_STORAGE_KEY);
 if (cached) {
 const parsedState = JSON.parse(cached);

 if (parsedState.lastFetch && Date.now() - parsedState.lastFetch < CACHE_DURATION) {
 return {
 ...parsedState,
 user: null, // User will be set by Clerk
 isLoading: false, // Start with false for faster initial render
 isOptimistic: true, // Mark as optimistic until verified
 };
 }
 }
 } catch (error) {
 console.warn('Failed to parse cached auth state:', error);
 }
 }
 
 return {
 user: null,
 userProfile: null,
 isLoading: false, // Start with false for faster initial render
 isSignedIn: false,
 error: null,
 lastFetch: null,
 isOptimistic: false,
 };
 });

 const fetchAttemptRef = useRef<number>(0);
 const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

 const cacheUserProfile = useCallback((profile: UserProfile | null) => {
 if (typeof window !== 'undefined') {
 try {
 if (profile) {
 localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({
 profile,
 timestamp: Date.now(),
 }));
 } else {
 localStorage.removeItem(PROFILE_CACHE_KEY);
 }
 } catch (error) {
 console.warn('Failed to cache user profile:', error);
 }
 }
 }, []);

 const getCachedUserProfile = useCallback((): UserProfile | null => {
 if (typeof window !== 'undefined') {
 try {
 const cached = localStorage.getItem(PROFILE_CACHE_KEY);
 if (cached) {
 const { profile, timestamp } = JSON.parse(cached);

 if (Date.now() - timestamp < CACHE_DURATION) {
 return profile;
 }
 }
 } catch (error) {
 console.warn('Failed to get cached user profile:', error);
 }
 }
 return null;
 }, []);

 const persistAuthState = useCallback((state: AuthState) => {
 if (typeof window !== 'undefined') {
 try {
 const stateToCache = {
 userProfile: state.userProfile,
 isSignedIn: state.isSignedIn,
 lastFetch: state.lastFetch,
 error: state.error,
 };
 sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToCache));
 } catch (error) {
 console.warn('Failed to persist auth state:', error);
 }
 }
 }, []);

 const createAuthError = useCallback((error: any, type: AuthError['type'] = 'unknown'): AuthError => {
 let message = 'An unexpected error occurred';
 let retryable = true;

 if (error instanceof Error) {
 message = error.message;
 } else if (typeof error === 'string') {
 message = error;
 }

 switch (type) {
 case 'network':
 message = 'Network error. Please check your connection and try again.';
 retryable = true;
 break;
 case 'unauthorized':
 message = 'Your session has expired. Please sign in again.';
 retryable = false;
 break;
 case 'profile_not_found':
 message = 'Profile not found. Redirecting to setup...';
 retryable = false;
 break;
 case 'session_expired':
 message = 'Your session has expired. Please sign in again.';
 retryable = false;
 break;
 }

 return { type, message, retryable };
 }, []);

 const loadUserProfile = useCallback(async (forceRefresh = false) => {
 if (!isLoaded || !user) {
 setAuthState(prev => ({ ...prev, isLoading: false }));
 return;
 }

 if (typeof window !== 'undefined' && window.location.pathname === '/onboarding') {
 setAuthState(prev => ({ ...prev, isLoading: false }));
 return;
 }

 if (!forceRefresh) {
 const cachedProfile = getCachedUserProfile();
 if (cachedProfile) {
 setAuthState(prev => ({
 ...prev,
 userProfile: cachedProfile,
 isLoading: false,
 error: null,
 lastFetch: Date.now(),
 isOptimistic: false,
 }));
 return;
 }
 }

 setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

 try {
 fetchAttemptRef.current += 1;
 const currentAttempt = fetchAttemptRef.current;

 const controller = new AbortController();
 const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

 const response = await fetch('/api/auth/profile', {
 headers: {
 'Cache-Control': forceRefresh ? 'no-cache' : 'max-age=300',
 },
 signal: controller.signal,
 });

 clearTimeout(timeoutId);

 if (currentAttempt !== fetchAttemptRef.current) {
 return;
 }

 if (response.ok) {
 const data = await response.json();
 const profile = data.user;
 
 cacheUserProfile(profile);
 
 setAuthState(prev => ({
 ...prev,
 userProfile: profile,
 isLoading: false,
 error: null,
 lastFetch: Date.now(),
 isOptimistic: false,
 }));
 } else if (response.status === 404) {

 const error = createAuthError('Profile not found', 'profile_not_found');
 setAuthState(prev => ({
 ...prev,
 userProfile: null,
 isLoading: false,
 error,
 isOptimistic: false,
 }));
 
 if (typeof window !== 'undefined' && window.location.pathname !== '/onboarding') {
 window.location.href = '/onboarding';
 }
 } else if (response.status === 401) {
 const error = createAuthError('Unauthorized', 'unauthorized');
 setAuthState(prev => ({
 ...prev,
 userProfile: null,
 isLoading: false,
 error,
 isOptimistic: false,
 }));
 } else {
 throw new Error(`HTTP ${response.status}: ${response.statusText}`);
 }
 } catch (error) {

 if (fetchAttemptRef.current !== fetchAttemptRef.current) {
 return;
 }

 console.error('Failed to load user profile:', error);
 
 const authError = createAuthError(error, 'network');
 setAuthState(prev => ({
 ...prev,
 isLoading: false,
 error: authError,
 isOptimistic: false,
 }));

 if (authError.retryable) {
 retryTimeoutRef.current = setTimeout(() => {
 loadUserProfile(forceRefresh);
 }, Math.min(1000 * Math.pow(2, fetchAttemptRef.current - 1), 10000));
 }
 }
 }, [isLoaded, user, getCachedUserProfile, cacheUserProfile, createAuthError]);

 useEffect(() => {
 if (isLoaded) {
 setAuthState(prev => ({
 ...prev,
 user: user || null,
 isSignedIn: !!isSignedIn,
 isLoading: !user && !!isSignedIn, // Only loading if signed in but no user yet
 }));

 if (isSignedIn && user) {
 // Reset guest watch counter on successful login
 resetGuestWatchCount();
 loadUserProfile();
 } else if (!isSignedIn) {

 setAuthState(prev => ({
 ...prev,
 userProfile: null,
 error: null,
 lastFetch: null,
 isOptimistic: false,
 }));
 cacheUserProfile(null);
 }
 }
 }, [isLoaded, user, isSignedIn, loadUserProfile, cacheUserProfile]);

 useEffect(() => {
 persistAuthState(authState);
 }, [authState, persistAuthState]);

 useEffect(() => {
 return () => {
 if (retryTimeoutRef.current) {
 clearTimeout(retryTimeoutRef.current);
 }
 };
 }, []);

 const signOut = useCallback(async () => {
 try {
 await clerkSignOut();
 setAuthState(prev => ({
 ...prev,
 userProfile: null,
 error: null,
 lastFetch: null,
 isOptimistic: false,
 }));
 cacheUserProfile(null);

 if (typeof window !== 'undefined') {
 sessionStorage.removeItem(SESSION_STORAGE_KEY);
 }
 } catch (error) {
 console.error('Failed to sign out:', error);
 }
 }, [clerkSignOut, cacheUserProfile]);

 const updateUserProfile = useCallback(async (profileUpdate: Partial<UserProfile>) => {
 if (!authState.userProfile) return;

 const optimisticProfile = { ...authState.userProfile, ...profileUpdate };
 setAuthState(prev => ({
 ...prev,
 userProfile: optimisticProfile,
 isOptimistic: true,
 }));

 try {
 const response = await fetch('/api/auth/profile', {
 method: 'PATCH',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(profileUpdate),
 });

 if (response.ok) {
 const updatedProfile = await response.json();
 cacheUserProfile(updatedProfile);
 setAuthState(prev => ({
 ...prev,
 userProfile: updatedProfile,
 error: null,
 lastFetch: Date.now(),
 isOptimistic: false,
 }));
 } else {
 throw new Error(`Failed to update profile: ${response.statusText}`);
 }
 } catch (error) {
 console.error('Failed to update user profile:', error);

 setAuthState(prev => ({
 ...prev,
 userProfile: authState.userProfile,
 error: createAuthError(error, 'network'),
 isOptimistic: false,
 }));
 }
 }, [authState.userProfile, cacheUserProfile, createAuthError]);

 const hasRole = useCallback((role: UserRole): boolean => {
 return authState.userProfile?.role === role;
 }, [authState.userProfile]);

 const retry = useCallback(async () => {
 setAuthState(prev => ({ ...prev, error: null, isLoading: true }));
 fetchAttemptRef.current = 0;
 await loadUserProfile(true);
 }, [loadUserProfile]);

 const clearError = useCallback(() => {
 setAuthState(prev => ({ ...prev, error: null }));
 }, []);

 const value: AuthContextType = {
 ...authState,
 signOut,
 updateUserProfile,
 hasRole,
 retry,
 clearError,
 };

 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
 const context = useContext(AuthContext);
 if (context === undefined) {
 throw new Error('useAuthContext must be used within an AuthProvider');
 }
 return context;
}