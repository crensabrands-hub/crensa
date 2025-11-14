'use client';

import { useState, useEffect, useCallback } from 'react';
import { pushNotificationService } from '@/lib/services/pushNotificationService';
import { useNotifications } from '@/contexts/NotificationContext';

export interface PushNotificationState {
 isSupported: boolean;
 permission: NotificationPermission;
 isSubscribed: boolean;
 isLoading: boolean;
 error: string | null;
}

export function usePushNotifications() {
 const [state, setState] = useState<PushNotificationState>({
 isSupported: false,
 permission: 'default',
 isSubscribed: false,
 isLoading: true,
 error: null,
 });

 const { preferences } = useNotifications();

 useEffect(() => {
 const initializePushNotifications = async () => {
 try {
 setState(prev => ({ ...prev, isLoading: true, error: null }));

 const isSupported = pushNotificationService.isSupported();
 const permission = pushNotificationService.getPermissionStatus();

 if (isSupported) {
 await pushNotificationService.initialize();
 const subscription = await pushNotificationService.getSubscription();
 
 setState({
 isSupported,
 permission,
 isSubscribed: !!subscription,
 isLoading: false,
 error: null,
 });
 } else {
 setState({
 isSupported: false,
 permission: 'denied',
 isSubscribed: false,
 isLoading: false,
 error: 'Push notifications are not supported in this browser',
 });
 }
 } catch (error) {
 console.error('Failed to initialize push notifications:', error);
 setState(prev => ({
 ...prev,
 isLoading: false,
 error: 'Failed to initialize push notifications',
 }));
 }
 };

 initializePushNotifications();
 }, []);

 const subscribe = useCallback(async (): Promise<boolean> => {
 try {
 setState(prev => ({ ...prev, isLoading: true, error: null }));

 const subscription = await pushNotificationService.subscribe();
 
 if (subscription) {
 setState(prev => ({
 ...prev,
 isSubscribed: true,
 permission: 'granted',
 isLoading: false,
 }));
 return true;
 } else {
 setState(prev => ({
 ...prev,
 isSubscribed: false,
 isLoading: false,
 error: 'Failed to subscribe to push notifications',
 }));
 return false;
 }
 } catch (error) {
 console.error('Failed to subscribe to push notifications:', error);
 setState(prev => ({
 ...prev,
 isLoading: false,
 error: 'Failed to subscribe to push notifications',
 }));
 return false;
 }
 }, []);

 const unsubscribe = useCallback(async (): Promise<boolean> => {
 try {
 setState(prev => ({ ...prev, isLoading: true, error: null }));

 const success = await pushNotificationService.unsubscribe();
 
 if (success) {
 setState(prev => ({
 ...prev,
 isSubscribed: false,
 isLoading: false,
 }));
 return true;
 } else {
 setState(prev => ({
 ...prev,
 isLoading: false,
 error: 'Failed to unsubscribe from push notifications',
 }));
 return false;
 }
 } catch (error) {
 console.error('Failed to unsubscribe from push notifications:', error);
 setState(prev => ({
 ...prev,
 isLoading: false,
 error: 'Failed to unsubscribe from push notifications',
 }));
 return false;
 }
 }, []);

 const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
 try {
 setState(prev => ({ ...prev, isLoading: true, error: null }));

 const permission = await pushNotificationService.requestPermission();
 
 setState(prev => ({
 ...prev,
 permission,
 isLoading: false,
 error: permission === 'denied' ? 'Push notification permission was denied' : null,
 }));

 return permission;
 } catch (error) {
 console.error('Failed to request push notification permission:', error);
 setState(prev => ({
 ...prev,
 isLoading: false,
 error: 'Failed to request push notification permission',
 }));
 return 'denied';
 }
 }, []);

 const testNotification = useCallback(async (): Promise<void> => {
 try {
 await pushNotificationService.testNotification();
 } catch (error) {
 console.error('Failed to send test notification:', error);
 setState(prev => ({
 ...prev,
 error: 'Failed to send test notification',
 }));
 }
 }, []);

 const clearError = useCallback(() => {
 setState(prev => ({ ...prev, error: null }));
 }, []);

 useEffect(() => {
 if (
 state.isSupported &&
 state.permission === 'granted' &&
 !state.isSubscribed &&
 !state.isLoading &&
 preferences.push
 ) {
 subscribe();
 }
 }, [state.isSupported, state.permission, state.isSubscribed, state.isLoading, preferences.push, subscribe]);

 useEffect(() => {
 if (
 state.isSubscribed &&
 !state.isLoading &&
 !preferences.push
 ) {
 unsubscribe();
 }
 }, [state.isSubscribed, state.isLoading, preferences.push, unsubscribe]);

 return {
 ...state,
 subscribe,
 unsubscribe,
 requestPermission,
 testNotification,
 clearError,
 };
}