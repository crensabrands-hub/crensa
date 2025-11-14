

export interface CacheEntry<T = any> {
 data: T;
 timestamp: number;
 etag?: string;
 maxAge?: number;
}

export interface CacheConfig {
 maxAge?: number; // Cache duration in milliseconds
 staleWhileRevalidate?: boolean; // Return stale data while fetching fresh data
 revalidateOnFocus?: boolean; // Revalidate when window gains focus
 dedupe?: boolean; // Enable request deduplication
}

export interface RequestOptions extends RequestInit {
 cacheConfig?: CacheConfig;
}

class APICache {
 private cache = new Map<string, CacheEntry>();
 private pendingRequests = new Map<string, Promise<any>>();
 private defaultConfig: CacheConfig = {
 maxAge: 5 * 60 * 1000, // 5 minutes
 staleWhileRevalidate: true,
 revalidateOnFocus: true,
 dedupe: true,
 };

 constructor() {

 if (typeof window !== "undefined") {
 window.addEventListener("focus", this.handleWindowFocus.bind(this));
 window.addEventListener("online", this.handleOnline.bind(this));
 }
 }

 private getCacheKey(url: string, options?: RequestOptions): string {
 const method = options?.method || "GET";
 const body = options?.body ? JSON.stringify(options.body) : "";
 const headers = options?.headers ? JSON.stringify(options.headers) : "";

 return `${method}:${url}:${body}:${headers}`;
 }

 private isCacheValid(entry: CacheEntry, maxAge: number): boolean {
 return Date.now() - entry.timestamp < maxAge;
 }

 private isCacheStale(entry: CacheEntry, maxAge: number): boolean {
 const staleTime = maxAge * 2; // Allow stale data for 2x the max age
 return Date.now() - entry.timestamp < staleTime;
 }

 private handleWindowFocus() {

 for (const [key, entry] of this.cache.entries()) {
 if (entry.maxAge && this.isCacheStale(entry, entry.maxAge)) {
 this.cache.delete(key);
 }
 }
 }

 private handleOnline() {
 this.clearCache();
 }

 async fetch<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
 const config = { ...this.defaultConfig, ...options.cacheConfig };
 const cacheKey = this.getCacheKey(url, options);

 const cachedEntry = this.cache.get(cacheKey);
 const maxAge = config.maxAge || this.defaultConfig.maxAge!;

 if (cachedEntry && this.isCacheValid(cachedEntry, maxAge)) {
 return cachedEntry.data;
 }

 if (
 config.staleWhileRevalidate &&
 cachedEntry &&
 this.isCacheStale(cachedEntry, maxAge)
 ) {

 this.fetchFresh(url, options, cacheKey, config).catch(console.error);
 return cachedEntry.data;
 }

 if (config.dedupe && this.pendingRequests.has(cacheKey)) {
 return this.pendingRequests.get(cacheKey)!;
 }

 const promise = this.fetchFresh(url, options, cacheKey, config);

 if (config.dedupe) {
 this.pendingRequests.set(cacheKey, promise);
 }

 try {
 const result = await promise;
 return result;
 } finally {
 if (config.dedupe) {
 this.pendingRequests.delete(cacheKey);
 }
 }
 }

 private async fetchFresh<T = any>(
 url: string,
 options: RequestOptions,
 cacheKey: string,
 config: CacheConfig
 ): Promise<T> {
 const cachedEntry = this.cache.get(cacheKey);
 const requestOptions: RequestInit = { ...options };

 if (cachedEntry?.etag) {
 requestOptions.headers = {
 ...requestOptions.headers,
 "If-None-Match": cachedEntry.etag,
 };
 }

 try {
 const response = await fetch(url, requestOptions);

 if (response.status === 304 && cachedEntry) {

 const updatedEntry: CacheEntry<T> = {
 ...cachedEntry,
 timestamp: Date.now(),
 };
 this.cache.set(cacheKey, updatedEntry);
 return cachedEntry.data;
 }

 if (!response.ok) {
 throw new Error(`HTTP ${response.status}: ${response.statusText}`);
 }

 const data = await response.json();
 const etag = response.headers.get("etag") || undefined;

 const cacheEntry: CacheEntry<T> = {
 data,
 timestamp: Date.now(),
 etag,
 maxAge: config.maxAge,
 };

 this.cache.set(cacheKey, cacheEntry);
 return data;
 } catch (error) {

 if (cachedEntry && config.staleWhileRevalidate) {
 console.warn("API request failed, returning stale data:", error);
 return cachedEntry.data;
 }
 throw error;
 }
 }

 invalidate(pattern: string | RegExp): void {
 const keys = Array.from(this.cache.keys());

 for (const key of keys) {
 if (typeof pattern === "string") {
 if (key.includes(pattern)) {
 this.cache.delete(key);
 }
 } else {
 if (pattern.test(key)) {
 this.cache.delete(key);
 }
 }
 }
 }

 invalidateKey(url: string, options?: RequestOptions): void {
 const cacheKey = this.getCacheKey(url, options);
 this.cache.delete(cacheKey);
 }

 clearCache(): void {
 this.cache.clear();
 this.pendingRequests.clear();
 }

 getStats() {
 return {
 cacheSize: this.cache.size,
 pendingRequests: this.pendingRequests.size,
 entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
 key,
 age: Date.now() - entry.timestamp,
 hasEtag: !!entry.etag,
 })),
 };
 }

 async preload<T = any>(
 url: string,
 options: RequestOptions = {}
 ): Promise<void> {
 try {
 await this.fetch<T>(url, options);
 } catch (error) {
 console.warn("Failed to preload data:", error);
 }
 }

 set<T = any>(url: string, data: T, options: RequestOptions = {}): void {
 const cacheKey = this.getCacheKey(url, options);
 const config = { ...this.defaultConfig, ...options.cacheConfig };

 const cacheEntry: CacheEntry<T> = {
 data,
 timestamp: Date.now(),
 maxAge: config.maxAge,
 };

 this.cache.set(cacheKey, cacheEntry);
 }

 get<T = any>(url: string, options: RequestOptions = {}): T | null {
 const cacheKey = this.getCacheKey(url, options);
 const cachedEntry = this.cache.get(cacheKey);

 if (!cachedEntry) {
 return null;
 }

 const config = { ...this.defaultConfig, ...options.cacheConfig };
 const maxAge = config.maxAge || this.defaultConfig.maxAge!;

 if (this.isCacheValid(cachedEntry, maxAge)) {
 return cachedEntry.data;
 }

 return null;
 }
}

export const apiCache = new APICache();

export async function cachedFetch<T = any>(
 url: string,
 options: RequestOptions = {}
): Promise<T> {
 return apiCache.fetch<T>(url, options);
}

export const cacheInvalidation = {

 user: (userId?: string) => {
 const pattern = userId ? `/api/user/${userId}` : "/api/user";
 apiCache.invalidate(pattern);
 },

 notifications: (userId?: string) => {
 apiCache.invalidate("/api/notifications");
 if (userId) {
 apiCache.invalidate(`/api/user/${userId}/notifications`);
 }
 },

 preferences: (userId?: string) => {
 apiCache.invalidate("/api/user/preferences");
 if (userId) {
 apiCache.invalidate(`/api/user/${userId}/preferences`);
 }
 },

 creator: (creatorId?: string) => {
 const pattern = creatorId ? `/api/creator/${creatorId}` : "/api/creator";
 apiCache.invalidate(pattern);
 },

 analytics: (creatorId?: string) => {
 apiCache.invalidate("/api/creator/analytics");
 if (creatorId) {
 apiCache.invalidate(`/api/creator/${creatorId}/analytics`);
 }
 },

 all: () => {
 apiCache.clearCache();
 },
};
