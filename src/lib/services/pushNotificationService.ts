

export interface PushNotificationPayload {
 title: string;
 body: string;
 icon?: string;
 badge?: string;
 image?: string;
 data?: Record<string, any>;
 actions?: Array<{
 action: string;
 title: string;
 icon?: string;
 }>;
 tag?: string;
 requireInteraction?: boolean;
}

export class PushNotificationService {
 private registration: ServiceWorkerRegistration | null = null;
 private vapidPublicKey: string | null = null;

 constructor() {
 this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
 }

 async initialize(): Promise<boolean> {
 try {

 if (!('serviceWorker' in navigator)) {
 console.warn('Service workers are not supported');
 return false;
 }

 if (!('PushManager' in window)) {
 console.warn('Push notifications are not supported');
 return false;
 }

 this.registration = await navigator.serviceWorker.register('/sw.js');
 console.log('Service worker registered successfully');

 return true;
 } catch (error) {
 console.error('Failed to initialize push notifications:', error);
 return false;
 }
 }

 async requestPermission(): Promise<NotificationPermission> {
 try {
 if (!('Notification' in window)) {
 throw new Error('Notifications are not supported');
 }

 let permission = Notification.permission;

 if (permission === 'default') {
 permission = await Notification.requestPermission();
 }

 return permission;
 } catch (error) {
 console.error('Failed to request notification permission:', error);
 return 'denied';
 }
 }

 isSupported(): boolean {
 return (
 'serviceWorker' in navigator &&
 'PushManager' in window &&
 'Notification' in window
 );
 }

 getPermissionStatus(): NotificationPermission {
 if (!('Notification' in window)) {
 return 'denied';
 }
 return Notification.permission;
 }

 async subscribe(): Promise<PushSubscription | null> {
 try {
 if (!this.registration) {
 await this.initialize();
 }

 if (!this.registration || !this.vapidPublicKey) {
 throw new Error('Service worker not registered or VAPID key missing');
 }

 const permission = await this.requestPermission();
 if (permission !== 'granted') {
 throw new Error('Push notification permission denied');
 }

 const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey) as BufferSource;

 const subscription = await this.registration.pushManager.subscribe({
 userVisibleOnly: true,
 applicationServerKey,
 });

 await this.sendSubscriptionToServer(subscription);

 return subscription;
 } catch (error) {
 console.error('Failed to subscribe to push notifications:', error);
 return null;
 }
 }

 async unsubscribe(): Promise<boolean> {
 try {
 if (!this.registration) {
 return true;
 }

 const subscription = await this.registration.pushManager.getSubscription();
 if (!subscription) {
 return true;
 }

 await this.removeSubscriptionFromServer(subscription);

 const success = await subscription.unsubscribe();
 return success;
 } catch (error) {
 console.error('Failed to unsubscribe from push notifications:', error);
 return false;
 }
 }

 async getSubscription(): Promise<PushSubscription | null> {
 try {
 if (!this.registration) {
 await this.initialize();
 }

 if (!this.registration) {
 return null;
 }

 return await this.registration.pushManager.getSubscription();
 } catch (error) {
 console.error('Failed to get push subscription:', error);
 return null;
 }
 }

 async showLocalNotification(payload: PushNotificationPayload): Promise<void> {
 try {
 const permission = this.getPermissionStatus();
 if (permission !== 'granted') {
 console.warn('Notification permission not granted');
 return;
 }

 if (!this.registration) {

 const notificationOptions: NotificationOptions & { image?: string } = {
 body: payload.body,
 icon: payload.icon || '/icons/icon-192x192.png',
 badge: payload.badge || '/icons/badge-72x72.png',
 data: payload.data,
 tag: payload.tag,
 requireInteraction: payload.requireInteraction,
 image: payload.image,
 };
 
 new Notification(payload.title, notificationOptions);
 } else {

 const notificationOptions: any = {
 body: payload.body,
 icon: payload.icon || '/icons/icon-192x192.png',
 badge: payload.badge || '/icons/badge-72x72.png',
 data: payload.data,
 actions: payload.actions,
 tag: payload.tag,
 requireInteraction: payload.requireInteraction,
 };
 
 if (payload.image) {
 notificationOptions.image = payload.image;
 }
 
 await this.registration.showNotification(payload.title, notificationOptions);
 }
 } catch (error) {
 console.error('Failed to show local notification:', error);
 }
 }

 private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
 try {
 const response = await fetch('/api/push/subscribe', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 subscription: subscription.toJSON(),
 }),
 });

 if (!response.ok) {
 throw new Error('Failed to send subscription to server');
 }
 } catch (error) {
 console.error('Failed to send subscription to server:', error);
 throw error;
 }
 }

 private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
 try {
 const response = await fetch('/api/push/unsubscribe', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 subscription: subscription.toJSON(),
 }),
 });

 if (!response.ok) {
 throw new Error('Failed to remove subscription from server');
 }
 } catch (error) {
 console.error('Failed to remove subscription from server:', error);

 }
 }

 private urlBase64ToUint8Array(base64String: string): Uint8Array {
 const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
 const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

 const rawData = window.atob(base64);
 const outputArray = new Uint8Array(rawData.length);

 for (let i = 0; i < rawData.length; ++i) {
 outputArray[i] = rawData.charCodeAt(i);
 }
 return outputArray;
 }

 async testNotification(): Promise<void> {
 await this.showLocalNotification({
 title: 'Test Notification',
 body: 'This is a test notification from Crensa!',
 icon: '/icons/icon-192x192.png',
 data: { test: true },
 tag: 'test-notification',
 });
 }
}

export const pushNotificationService = new PushNotificationService();