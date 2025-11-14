'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { useAuthContext } from './AuthContext';
import { cachedFetch, cacheInvalidation } from '@/lib/api-cache';
import { backgroundRefresh, refreshHelpers } from '@/lib/background-refresh';
import type { Notification } from '@/lib/database/schema';

export interface NotificationPreferences {
 email: boolean;
 push: boolean;
 earnings: boolean;
 newFollowers: boolean;
 videoComments: boolean;
 videoLikes: boolean;
 paymentUpdates: boolean;
 systemUpdates: boolean;
}

export interface NotificationState {
 notifications: Notification[];
 unreadCount: number;
 isLoading: boolean;
 error: string | null;
 preferences: NotificationPreferences;
 isPreferencesLoading: boolean;
 lastFetch: number | null;
}

export interface NotificationContextType extends NotificationState {
 fetchNotifications: (force?: boolean) => Promise<void>;
 markAsRead: (notificationId: string) => Promise<void>;
 markAllAsRead: () => Promise<void>;
 deleteNotification: (notificationId: string) => Promise<void>;
 updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
 clearError: () => void;
 subscribeToRealTimeUpdates: () => void;
 unsubscribeFromRealTimeUpdates: () => void;
}

type NotificationAction =
 | { type: 'SET_LOADING'; payload: boolean }
 | { type: 'SET_ERROR'; payload: string | null }
 | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
 | { type: 'ADD_NOTIFICATION'; payload: Notification }
 | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<Notification> } }
 | { type: 'REMOVE_NOTIFICATION'; payload: string }
 | { type: 'SET_UNREAD_COUNT'; payload: number }
 | { type: 'SET_PREFERENCES'; payload: NotificationPreferences }
 | { type: 'SET_PREFERENCES_LOADING'; payload: boolean }
 | { type: 'SET_LAST_FETCH'; payload: number }
 | { type: 'RESET_STATE' };

const defaultPreferences: NotificationPreferences = {
 email: true,
 push: true,
 earnings: true,
 newFollowers: true,
 videoComments: true,
 videoLikes: true,
 paymentUpdates: true,
 systemUpdates: true,
};

const initialState: NotificationState = {
 notifications: [],
 unreadCount: 0,
 isLoading: false,
 error: null,
 preferences: defaultPreferences,
 isPreferencesLoading: false,
 lastFetch: null,
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
 switch (action.type) {
 case 'SET_LOADING':
 return { ...state, isLoading: action.payload };
 case 'SET_ERROR':
 return { ...state, error: action.payload };
 case 'SET_NOTIFICATIONS':
 return {
 ...state,
 notifications: action.payload,
 unreadCount: action.payload.filter(n => !n.isRead).length,
 };
 case 'ADD_NOTIFICATION':
 const newNotifications = [action.payload, ...state.notifications];
 return {
 ...state,
 notifications: newNotifications,
 unreadCount: newNotifications.filter(n => !n.isRead).length,
 };
 case 'UPDATE_NOTIFICATION':
 const updatedNotifications = state.notifications.map(notification =>
 notification.id === action.payload.id
 ? { ...notification, ...action.payload.updates }
 : notification
 );
 return {
 ...state,
 notifications: updatedNotifications,
 unreadCount: updatedNotifications.filter(n => !n.isRead).length,
 };
 case 'REMOVE_NOTIFICATION':
 const filteredNotifications = state.notifications.filter(n => n.id !== action.payload);
 return {
 ...state,
 notifications: filteredNotifications,
 unreadCount: filteredNotifications.filter(n => !n.isRead).length,
 };
 case 'SET_UNREAD_COUNT':
 return { ...state, unreadCount: action.payload };
 case 'SET_PREFERENCES':
 return { ...state, preferences: action.payload };
 case 'SET_PREFERENCES_LOADING':
 return { ...state, isPreferencesLoading: action.payload };
 case 'SET_LAST_FETCH':
 return { ...state, lastFetch: action.payload };
 case 'RESET_STATE':
 return initialState;
 default:
 return state;
 }
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
const REAL_TIME_POLL_INTERVAL = 30 * 1000; // 30 seconds

export function NotificationProvider({ children }: { children: React.ReactNode }) {
 const [state, dispatch] = useReducer(notificationReducer, initialState);
 const { userProfile, isLoading: authLoading } = useAuthContext();
 const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
 const abortControllerRef = useRef<AbortController | null>(null);

 const fetchNotifications = useCallback(async (force = false) => {
 if (!userProfile || authLoading) return;

 if (abortControllerRef.current) {
 abortControllerRef.current.abort();
 }

 abortControllerRef.current = new AbortController();

 try {
 dispatch({ type: 'SET_LOADING', payload: true });
 dispatch({ type: 'SET_ERROR', payload: null });

 const notifications = await cachedFetch<Notification[]>('/api/notifications', {
 signal: abortControllerRef.current.signal,
 cacheConfig: {
 maxAge: CACHE_DURATION,
 staleWhileRevalidate: true,
 dedupe: true,
 },
 headers: {
 'Cache-Control': force ? 'no-cache' : 'max-age=120',
 },
 });

 dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
 dispatch({ type: 'SET_LAST_FETCH', payload: Date.now() });
 } catch (error: any) {
 if (error.name === 'AbortError') {
 return; // Request was cancelled, ignore
 }
 
 console.error('Failed to fetch notifications:', error);
 dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to load notifications' });
 } finally {
 dispatch({ type: 'SET_LOADING', payload: false });
 }
 }, [userProfile, authLoading]);

 const markAsRead = useCallback(async (notificationId: string) => {
 try {

 dispatch({
 type: 'UPDATE_NOTIFICATION',
 payload: { id: notificationId, updates: { isRead: true } },
 });

 const response = await fetch(`/api/notifications/${notificationId}`, {
 method: 'PATCH',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({ action: 'mark_read' }),
 });

 if (!response.ok) {
 throw new Error('Failed to mark notification as read');
 }

 cacheInvalidation.notifications();
 } catch (error) {
 console.error('Failed to mark notification as read:', error);

 dispatch({
 type: 'UPDATE_NOTIFICATION',
 payload: { id: notificationId, updates: { isRead: false } },
 });
 dispatch({ type: 'SET_ERROR', payload: 'Failed to mark notification as read' });
 }
 }, []);

 const markAllAsRead = useCallback(async () => {
 try {

 const updatedNotifications = state.notifications.map(n => ({ ...n, isRead: true }));
 dispatch({ type: 'SET_NOTIFICATIONS', payload: updatedNotifications });

 const response = await fetch('/api/notifications/mark-all-read', {
 method: 'POST',
 });

 if (!response.ok) {
 throw new Error('Failed to mark all notifications as read');
 }

 cacheInvalidation.notifications();
 } catch (error) {
 console.error('Failed to mark all notifications as read:', error);

 fetchNotifications(true);
 dispatch({ type: 'SET_ERROR', payload: 'Failed to mark all notifications as read' });
 }
 }, [state.notifications, fetchNotifications]);

 const deleteNotification = useCallback(async (notificationId: string) => {
 try {

 dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });

 const response = await fetch(`/api/notifications/${notificationId}`, {
 method: 'DELETE',
 });

 if (!response.ok) {
 throw new Error('Failed to delete notification');
 }

 cacheInvalidation.notifications();
 } catch (error) {
 console.error('Failed to delete notification:', error);

 fetchNotifications(true);
 dispatch({ type: 'SET_ERROR', payload: 'Failed to delete notification' });
 }
 }, [fetchNotifications]);

 const updatePreferences = useCallback(async (preferences: Partial<NotificationPreferences>) => {
 try {
 dispatch({ type: 'SET_PREFERENCES_LOADING', payload: true });

 const newPreferences = { ...state.preferences, ...preferences };
 dispatch({ type: 'SET_PREFERENCES', payload: newPreferences });

 const response = await fetch('/api/user/preferences', {
 method: 'PATCH',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 notifications: newPreferences,
 }),
 });

 if (!response.ok) {
 throw new Error('Failed to update notification preferences');
 }

 const updatedPrefs = await response.json();
 dispatch({ type: 'SET_PREFERENCES', payload: updatedPrefs.notifications });
 } catch (error) {
 console.error('Failed to update notification preferences:', error);

 dispatch({ type: 'SET_PREFERENCES', payload: state.preferences });
 dispatch({ type: 'SET_ERROR', payload: 'Failed to update preferences' });
 } finally {
 dispatch({ type: 'SET_PREFERENCES_LOADING', payload: false });
 }
 }, [state.preferences]);

 const loadPreferences = useCallback(async () => {
 if (!userProfile) return;

 try {
 dispatch({ type: 'SET_PREFERENCES_LOADING', payload: true });

 const data = await cachedFetch('/api/user/preferences', {
 cacheConfig: {
 maxAge: 5 * 60 * 1000, // 5 minutes
 staleWhileRevalidate: true,
 dedupe: true,
 },
 });
 
 dispatch({ type: 'SET_PREFERENCES', payload: data.notifications || defaultPreferences });
 } catch (error) {
 console.error('Failed to load notification preferences:', error);
 } finally {
 dispatch({ type: 'SET_PREFERENCES_LOADING', payload: false });
 }
 }, [userProfile]);

 const clearError = useCallback(() => {
 dispatch({ type: 'SET_ERROR', payload: null });
 }, []);

 const subscribeToRealTimeUpdates = useCallback(() => {
 if (!userProfile) return;

 refreshHelpers.notifications(
 (notifications: Notification[]) => {

 dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
 dispatch({ type: 'SET_LAST_FETCH', payload: Date.now() });
 },
 (error: Error) => {
 console.warn('Background notification refresh failed:', error);

 }
 );
 }, [userProfile]);

 const unsubscribeFromRealTimeUpdates = useCallback(() => {
 backgroundRefresh.unregister('/api/notifications');
 }, []);

 useEffect(() => {
 if (userProfile && !authLoading) {
 fetchNotifications();
 loadPreferences();
 subscribeToRealTimeUpdates();
 } else if (!userProfile) {
 dispatch({ type: 'RESET_STATE' });
 unsubscribeFromRealTimeUpdates();
 }

 return () => {
 unsubscribeFromRealTimeUpdates();
 };
 }, [userProfile, authLoading, fetchNotifications, loadPreferences, subscribeToRealTimeUpdates, unsubscribeFromRealTimeUpdates]);

 useEffect(() => {
 return () => {
 if (abortControllerRef.current) {
 abortControllerRef.current.abort();
 }
 unsubscribeFromRealTimeUpdates();
 };
 }, [unsubscribeFromRealTimeUpdates]);

 const contextValue: NotificationContextType = {
 ...state,
 fetchNotifications,
 markAsRead,
 markAllAsRead,
 deleteNotification,
 updatePreferences,
 clearError,
 subscribeToRealTimeUpdates,
 unsubscribeFromRealTimeUpdates,
 };

 return (
 <NotificationContext.Provider value={contextValue}>
 {children}
 </NotificationContext.Provider>
 );
}

export function useNotifications() {
 const context = useContext(NotificationContext);
 if (context === undefined) {
 throw new Error('useNotifications must be used within a NotificationProvider');
 }
 return context;
}