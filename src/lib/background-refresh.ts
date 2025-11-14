

import { apiCache, cacheInvalidation } from './api-cache';

export interface RefreshStrategy {
 interval: number; // Refresh interval in milliseconds
 maxAge: number; // Maximum age before forcing refresh
 priority: 'high' | 'medium' | 'low';
 condition?: () => boolean; // Optional condition to check before refresh
}

export interface RefreshConfig {
 url: string;
 strategy: RefreshStrategy;
 onSuccess?: (data: any) => void;
 onError?: (error: Error) => void;
}

class BackgroundRefreshManager {
 private refreshTimers = new Map<string, NodeJS.Timeout>();
 private refreshConfigs = new Map<string, RefreshConfig>();
 private isVisible = true;
 private isOnline = true;

 constructor() {
 if (typeof window !== 'undefined') {

 document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

 window.addEventListener('online', this.handleOnline.bind(this));
 window.addEventListener('offline', this.handleOffline.bind(this));

 this.isVisible = !document.hidden;
 this.isOnline = navigator.onLine;
 }
 }

 register(config: RefreshConfig): void {
 const key = this.getKey(config.url);

 this.refreshConfigs.set(key, config);

 this.startRefresh(key, config);
 }

 unregister(url: string): void {
 const key = this.getKey(url);

 const timer = this.refreshTimers.get(key);
 if (timer) {
 clearInterval(timer);
 this.refreshTimers.delete(key);
 }

 this.refreshConfigs.delete(key);
 }

 pauseAll(): void {
 for (const [key, timer] of this.refreshTimers.entries()) {
 clearInterval(timer);
 this.refreshTimers.delete(key);
 }
 }

 resumeAll(): void {
 for (const [key, config] of this.refreshConfigs.entries()) {
 this.startRefresh(key, config);
 }
 }

 async forceRefresh(url: string): Promise<void> {
 const key = this.getKey(url);
 const config = this.refreshConfigs.get(key);
 
 if (config) {
 await this.performRefresh(config);
 }
 }

 async forceRefreshAll(): Promise<void> {
 const refreshPromises = Array.from(this.refreshConfigs.values()).map(
 config => this.performRefresh(config)
 );
 
 await Promise.allSettled(refreshPromises);
 }

 getStats() {
 return {
 registeredUrls: this.refreshConfigs.size,
 activeTimers: this.refreshTimers.size,
 isVisible: this.isVisible,
 isOnline: this.isOnline,
 configs: Array.from(this.refreshConfigs.entries()).map(([key, config]) => ({
 key,
 url: config.url,
 interval: config.strategy.interval,
 priority: config.strategy.priority,
 hasTimer: this.refreshTimers.has(key),
 })),
 };
 }

 private getKey(url: string): string {
 return url;
 }

 private startRefresh(key: string, config: RefreshConfig): void {

 if (this.refreshTimers.has(key)) {
 return;
 }

 const interval = this.getAdjustedInterval(config.strategy);
 
 const timer = setInterval(async () => {

 if (this.shouldRefresh(config)) {
 await this.performRefresh(config);
 }
 }, interval);

 this.refreshTimers.set(key, timer);
 }

 private getAdjustedInterval(strategy: RefreshStrategy): number {
 let interval = strategy.interval;

 if (!this.isVisible) {
 interval *= 3; // 3x slower when not visible
 }

 switch (strategy.priority) {
 case 'high':

 break;
 case 'medium':
 interval *= 1.5;
 break;
 case 'low':
 interval *= 2;
 break;
 }

 return interval;
 }

 private shouldRefresh(config: RefreshConfig): boolean {

 if (!this.isOnline) {
 return false;
 }

 if (config.strategy.condition && !config.strategy.condition()) {
 return false;
 }

 const cachedData = apiCache.get(config.url);
 if (cachedData) {

 return true;
 }

 return true;
 }

 private async performRefresh(config: RefreshConfig): Promise<void> {
 try {
 const data = await apiCache.fetch(config.url, {
 cacheConfig: {
 maxAge: config.strategy.maxAge,
 staleWhileRevalidate: true,
 dedupe: true,
 },
 });

 config.onSuccess?.(data);
 } catch (error) {
 const err = error instanceof Error ? error : new Error(String(error));
 config.onError?.(err);
 console.warn(`Background refresh failed for ${config.url}:`, err);
 }
 }

 private handleVisibilityChange(): void {
 const wasVisible = this.isVisible;
 this.isVisible = !document.hidden;

 if (!wasVisible && this.isVisible) {

 this.pauseAll();
 this.resumeAll();

 this.forceRefreshHighPriority();
 } else if (wasVisible && !this.isVisible) {

 this.pauseAll();
 this.resumeAll();
 }
 }

 private handleOnline(): void {
 this.isOnline = true;

 this.forceRefreshAll().catch(console.error);
 }

 private handleOffline(): void {
 this.isOnline = false;

 this.pauseAll();
 }

 private async forceRefreshHighPriority(): Promise<void> {
 const highPriorityConfigs = Array.from(this.refreshConfigs.values())
 .filter(config => config.strategy.priority === 'high');

 const refreshPromises = highPriorityConfigs.map(config => 
 this.performRefresh(config)
 );

 await Promise.allSettled(refreshPromises);
 }
}

export const backgroundRefresh = new BackgroundRefreshManager();

export const refreshStrategies = {

 realTime: {
 interval: 30 * 1000, // 30 seconds
 maxAge: 1 * 60 * 1000, // 1 minute
 priority: 'high' as const,
 },

 frequent: {
 interval: 2 * 60 * 1000, // 2 minutes
 maxAge: 5 * 60 * 1000, // 5 minutes
 priority: 'medium' as const,
 },

 periodic: {
 interval: 10 * 60 * 1000, // 10 minutes
 maxAge: 30 * 60 * 1000, // 30 minutes
 priority: 'low' as const,
 },

 notifications: {
 interval: 1 * 60 * 1000, // 1 minute
 maxAge: 2 * 60 * 1000, // 2 minutes
 priority: 'high' as const,
 condition: () => {

 return document.hasFocus() || !document.hidden;
 },
 },

 preferences: {
 interval: 5 * 60 * 1000, // 5 minutes
 maxAge: 10 * 60 * 1000, // 10 minutes
 priority: 'medium' as const,
 },

 analytics: {
 interval: 5 * 60 * 1000, // 5 minutes
 maxAge: 10 * 60 * 1000, // 10 minutes
 priority: 'low' as const,
 condition: () => {

 const hour = new Date().getHours();
 return hour >= 8 && hour <= 20;
 },
 },
} as const;

export const refreshHelpers = {

 notifications: (onSuccess?: (data: any) => void, onError?: (error: Error) => void) => {
 backgroundRefresh.register({
 url: '/api/notifications',
 strategy: refreshStrategies.notifications,
 onSuccess,
 onError,
 });
 },

 preferences: (onSuccess?: (data: any) => void, onError?: (error: Error) => void) => {
 backgroundRefresh.register({
 url: '/api/user/preferences',
 strategy: refreshStrategies.preferences,
 onSuccess,
 onError,
 });
 },

 analytics: (timeRange?: string, onSuccess?: (data: any) => void, onError?: (error: Error) => void) => {
 const url = timeRange 
 ? `/api/creator/analytics?timeRange=${timeRange}`
 : '/api/creator/analytics';
 
 backgroundRefresh.register({
 url,
 strategy: refreshStrategies.analytics,
 onSuccess,
 onError,
 });
 },

 dashboard: (onSuccess?: (data: any) => void, onError?: (error: Error) => void) => {
 backgroundRefresh.register({
 url: '/api/creator/dashboard',
 strategy: refreshStrategies.frequent,
 onSuccess,
 onError,
 });
 },
};