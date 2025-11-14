import { pushNotificationService } from '@/lib/services/pushNotificationService';

const mockServiceWorkerRegistration = {
 pushManager: {
 subscribe: jest.fn(),
 getSubscription: jest.fn(),
 },
 showNotification: jest.fn(),
};

const mockSubscription = {
 endpoint: 'https://fcm.googleapis.com/fcm/send/test',
 keys: {
 p256dh: 'test-p256dh-key',
 auth: 'test-auth-key',
 },
 toJSON: jest.fn().mockReturnValue({
 endpoint: 'https://fcm.googleapis.com/fcm/send/test',
 keys: {
 p256dh: 'test-p256dh-key',
 auth: 'test-auth-key',
 },
 }),
 unsubscribe: jest.fn(),
};

global.fetch = jest.fn();

process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'test-vapid-key';

describe('PushNotificationService', () => {
 beforeEach(() => {
 jest.clearAllMocks();

 Object.defineProperty(navigator, 'serviceWorker', {
 value: {
 register: jest.fn().mockResolvedValue(mockServiceWorkerRegistration),
 },
 writable: true,
 });

 Object.defineProperty(window, 'PushManager', {
 value: jest.fn(),
 writable: true,
 });

 Object.defineProperty(window, 'Notification', {
 value: {
 permission: 'default',
 requestPermission: jest.fn().mockResolvedValue('granted'),
 },
 writable: true,
 });

 Object.defineProperty(window, 'atob', {
 value: jest.fn().mockReturnValue('test-decoded-key'),
 writable: true,
 });
 });

 describe('initialize', () => {
 it('should initialize successfully when supported', async () => {
 const result = await pushNotificationService.initialize();

 expect(result).toBe(true);
 expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
 });

 it('should return false when service workers are not supported', async () => {

 Object.defineProperty(navigator, 'serviceWorker', {
 value: undefined,
 writable: true,
 });

 const result = await pushNotificationService.initialize();

 expect(result).toBe(false);
 });

 it('should return false when PushManager is not supported', async () => {

 Object.defineProperty(window, 'PushManager', {
 value: undefined,
 writable: true,
 });

 const result = await pushNotificationService.initialize();

 expect(result).toBe(false);
 });

 it('should handle service worker registration errors', async () => {
 (navigator.serviceWorker.register as jest.Mock).mockRejectedValue(
 new Error('Registration failed')
 );

 const result = await pushNotificationService.initialize();

 expect(result).toBe(false);
 });
 });

 describe('requestPermission', () => {
 it('should request and return granted permission', async () => {
 const permission = await pushNotificationService.requestPermission();

 expect(permission).toBe('granted');
 expect(Notification.requestPermission).toHaveBeenCalled();
 });

 it('should return existing permission if already granted', async () => {
 Object.defineProperty(Notification, 'permission', {
 value: 'granted',
 writable: true,
 });

 const permission = await pushNotificationService.requestPermission();

 expect(permission).toBe('granted');
 expect(Notification.requestPermission).not.toHaveBeenCalled();
 });

 it('should return denied when Notification is not supported', async () => {
 Object.defineProperty(window, 'Notification', {
 value: undefined,
 writable: true,
 });

 const permission = await pushNotificationService.requestPermission();

 expect(permission).toBe('denied');
 });
 });

 describe('isSupported', () => {
 it('should return true when all features are supported', () => {
 const result = pushNotificationService.isSupported();

 expect(result).toBe(true);
 });

 it('should return false when service workers are not supported', () => {
 Object.defineProperty(navigator, 'serviceWorker', {
 value: undefined,
 writable: true,
 });

 const result = pushNotificationService.isSupported();

 expect(result).toBe(false);
 });
 });

 describe('subscribe', () => {
 beforeEach(() => {

 jest.spyOn(pushNotificationService, 'initialize').mockResolvedValue(true);
 mockServiceWorkerRegistration.pushManager.subscribe.mockResolvedValue(mockSubscription);
 (fetch as jest.Mock).mockResolvedValue({
 ok: true,
 json: () => Promise.resolve({ success: true }),
 });
 });

 it('should subscribe successfully', async () => {
 const subscription = await pushNotificationService.subscribe();

 expect(subscription).toBe(mockSubscription);
 expect(mockServiceWorkerRegistration.pushManager.subscribe).toHaveBeenCalledWith({
 userVisibleOnly: true,
 applicationServerKey: expect.any(Uint8Array),
 });
 expect(fetch).toHaveBeenCalledWith('/api/push/subscribe', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 subscription: mockSubscription.toJSON(),
 }),
 });
 });

 it('should return null when permission is denied', async () => {
 jest.spyOn(pushNotificationService, 'requestPermission').mockResolvedValue('denied');

 const subscription = await pushNotificationService.subscribe();

 expect(subscription).toBe(null);
 });

 it('should return null when VAPID key is missing', async () => {

 delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

 const subscription = await pushNotificationService.subscribe();

 expect(subscription).toBe(null);
 });

 it('should handle subscription errors', async () => {
 mockServiceWorkerRegistration.pushManager.subscribe.mockRejectedValue(
 new Error('Subscription failed')
 );

 const subscription = await pushNotificationService.subscribe();

 expect(subscription).toBe(null);
 });
 });

 describe('unsubscribe', () => {
 beforeEach(() => {
 mockServiceWorkerRegistration.pushManager.getSubscription.mockResolvedValue(mockSubscription);
 mockSubscription.unsubscribe.mockResolvedValue(true);
 (fetch as jest.Mock).mockResolvedValue({
 ok: true,
 json: () => Promise.resolve({ success: true }),
 });
 });

 it('should unsubscribe successfully', async () => {
 const result = await pushNotificationService.unsubscribe();

 expect(result).toBe(true);
 expect(fetch).toHaveBeenCalledWith('/api/push/unsubscribe', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 subscription: mockSubscription.toJSON(),
 }),
 });
 expect(mockSubscription.unsubscribe).toHaveBeenCalled();
 });

 it('should return true when no subscription exists', async () => {
 mockServiceWorkerRegistration.pushManager.getSubscription.mockResolvedValue(null);

 const result = await pushNotificationService.unsubscribe();

 expect(result).toBe(true);
 expect(mockSubscription.unsubscribe).not.toHaveBeenCalled();
 });

 it('should handle unsubscribe errors', async () => {
 mockSubscription.unsubscribe.mockRejectedValue(new Error('Unsubscribe failed'));

 const result = await pushNotificationService.unsubscribe();

 expect(result).toBe(false);
 });
 });

 describe('getSubscription', () => {
 it('should return existing subscription', async () => {
 jest.spyOn(pushNotificationService, 'initialize').mockResolvedValue(true);
 mockServiceWorkerRegistration.pushManager.getSubscription.mockResolvedValue(mockSubscription);

 const subscription = await pushNotificationService.getSubscription();

 expect(subscription).toBe(mockSubscription);
 });

 it('should return null when no subscription exists', async () => {
 jest.spyOn(pushNotificationService, 'initialize').mockResolvedValue(true);
 mockServiceWorkerRegistration.pushManager.getSubscription.mockResolvedValue(null);

 const subscription = await pushNotificationService.getSubscription();

 expect(subscription).toBe(null);
 });
 });

 describe('showLocalNotification', () => {
 beforeEach(() => {
 Object.defineProperty(Notification, 'permission', {
 value: 'granted',
 writable: true,
 });
 });

 it('should show notification through service worker', async () => {

 (pushNotificationService as any).registration = mockServiceWorkerRegistration;

 const payload = {
 title: 'Test Notification',
 body: 'Test message',
 icon: '/test-icon.png',
 };

 await pushNotificationService.showLocalNotification(payload);

 expect(mockServiceWorkerRegistration.showNotification).toHaveBeenCalledWith(
 payload.title,
 expect.objectContaining({
 body: payload.body,
 icon: payload.icon,
 })
 );
 });

 it('should show browser notification when service worker is not available', async () => {

 const mockNotificationConstructor = jest.fn();
 Object.defineProperty(window, 'Notification', {
 value: mockNotificationConstructor,
 writable: true,
 });
 Object.defineProperty(mockNotificationConstructor, 'permission', {
 value: 'granted',
 writable: true,
 });

 const payload = {
 title: 'Test Notification',
 body: 'Test message',
 };

 await pushNotificationService.showLocalNotification(payload);

 expect(mockNotificationConstructor).toHaveBeenCalledWith(
 payload.title,
 expect.objectContaining({
 body: payload.body,
 })
 );
 });

 it('should not show notification when permission is not granted', async () => {
 Object.defineProperty(Notification, 'permission', {
 value: 'denied',
 writable: true,
 });

 const payload = {
 title: 'Test Notification',
 body: 'Test message',
 };

 await pushNotificationService.showLocalNotification(payload);

 expect(mockServiceWorkerRegistration.showNotification).not.toHaveBeenCalled();
 });
 });

 describe('testNotification', () => {
 it('should show test notification', async () => {
 const showLocalNotificationSpy = jest.spyOn(pushNotificationService, 'showLocalNotification');

 await pushNotificationService.testNotification();

 expect(showLocalNotificationSpy).toHaveBeenCalledWith({
 title: 'Test Notification',
 body: 'This is a test notification from Crensa!',
 icon: '/icons/icon-192x192.png',
 data: { test: true },
 tag: 'test-notification',
 });
 });
 });
});