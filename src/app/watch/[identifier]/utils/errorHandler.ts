export interface ErrorInfo {
 type: 'network' | 'not_found' | 'access_denied' | 'invalid_link' | 'server_error' | 'unknown';
 message: string;
 isRetryable: boolean;
 requiresAuth?: boolean;
 requiresCredits?: boolean;
 requiresMembership?: boolean;
 creditCost?: number;
 statusCode?: number;
 isOffline?: boolean;
}

export class WatchErrorHandler {
 static analyzeError(error: any, statusCode?: number): ErrorInfo {

 if (this.isNetworkError(error)) {
 return {
 type: 'network',
 message: 'Network connection failed',
 isRetryable: true,
 isOffline: !navigator.onLine,
 statusCode: 0
 };
 }

 if (statusCode) {
 return this.analyzeStatusCode(statusCode, error);
 }

 if (typeof error === 'string') {
 return this.analyzeErrorMessage(error);
 }

 if (error instanceof Error) {
 return this.analyzeErrorMessage(error.message);
 }

 if (error && typeof error === 'object' && error.error) {
 return this.analyzeErrorMessage(error.error);
 }

 return {
 type: 'unknown',
 message: 'An unexpected error occurred',
 isRetryable: true
 };
 }

 private static isNetworkError(error: any): boolean {
 if (!error) return false;

 const networkErrorIndicators = [
 'fetch',
 'network',
 'connection',
 'timeout',
 'offline',
 'ERR_NETWORK',
 'ERR_INTERNET_DISCONNECTED',
 'NetworkError'
 ];

 const errorString = error.toString().toLowerCase();
 return networkErrorIndicators.some(indicator => 
 errorString.includes(indicator.toLowerCase())
 );
 }

 private static analyzeStatusCode(statusCode: number, error?: any): ErrorInfo {
 const errorMessage = error?.error || error?.message || error || '';

 switch (statusCode) {
 case 400:
 return {
 type: 'invalid_link',
 message: 'Invalid video identifier',
 isRetryable: false,
 statusCode
 };

 case 401:
 return {
 type: 'access_denied',
 message: 'Authentication required',
 isRetryable: false,
 requiresAuth: true,
 statusCode
 };

 case 403:

 const requiresCredits = errorMessage.toLowerCase().includes('credit');
 const requiresMembership = errorMessage.toLowerCase().includes('membership');
 
 return {
 type: 'access_denied',
 message: requiresCredits ? 'Insufficient credits' : 
 requiresMembership ? 'Membership required' : 'Access denied',
 isRetryable: false,
 requiresCredits,
 requiresMembership,
 statusCode
 };

 case 404:
 return {
 type: 'not_found',
 message: 'Video not found or link expired',
 isRetryable: false,
 statusCode
 };

 case 410:
 return {
 type: 'not_found',
 message: 'Share link has expired',
 isRetryable: false,
 statusCode
 };

 case 429:
 return {
 type: 'server_error',
 message: 'Too many requests. Please try again later.',
 isRetryable: true,
 statusCode
 };

 case 500:
 case 502:
 case 503:
 case 504:
 return {
 type: 'server_error',
 message: 'Server temporarily unavailable',
 isRetryable: true,
 statusCode
 };

 default:
 return {
 type: 'unknown',
 message: `HTTP ${statusCode}: ${errorMessage || 'Unknown error'}`,
 isRetryable: statusCode >= 500,
 statusCode
 };
 }
 }

 private static analyzeErrorMessage(message: string): ErrorInfo {
 const lowerMessage = message.toLowerCase();

 if (lowerMessage.includes('not found') || 
 lowerMessage.includes('does not exist') ||
 lowerMessage.includes('video not found')) {
 return {
 type: 'not_found',
 message: 'Video not found',
 isRetryable: false
 };
 }

 if (lowerMessage.includes('expired') || 
 lowerMessage.includes('token not found')) {
 return {
 type: 'not_found',
 message: 'Share link has expired',
 isRetryable: false
 };
 }

 if (lowerMessage.includes('invalid') || 
 lowerMessage.includes('malformed') ||
 lowerMessage.includes('empty identifier')) {
 return {
 type: 'invalid_link',
 message: 'Invalid video link',
 isRetryable: false
 };
 }

 if (lowerMessage.includes('access denied') || 
 lowerMessage.includes('unauthorized') ||
 lowerMessage.includes('forbidden')) {
 return {
 type: 'access_denied',
 message: 'Access denied',
 isRetryable: false,
 requiresAuth: lowerMessage.includes('unauthorized')
 };
 }

 if (lowerMessage.includes('credit') || 
 lowerMessage.includes('insufficient funds')) {
 return {
 type: 'access_denied',
 message: 'Insufficient credits',
 isRetryable: false,
 requiresCredits: true
 };
 }

 if (lowerMessage.includes('membership') || 
 lowerMessage.includes('premium') ||
 lowerMessage.includes('subscription')) {
 return {
 type: 'access_denied',
 message: 'Membership required',
 isRetryable: false,
 requiresMembership: true
 };
 }

 if (lowerMessage.includes('server error') || 
 lowerMessage.includes('internal server error') ||
 lowerMessage.includes('internal error') ||
 lowerMessage.includes('service unavailable') ||
 lowerMessage.includes('server temporarily unavailable')) {
 return {
 type: 'server_error',
 message: 'Server error',
 isRetryable: true
 };
 }

 if (lowerMessage.includes('network') || 
 lowerMessage.includes('connection') ||
 lowerMessage.includes('timeout')) {
 return {
 type: 'network',
 message: 'Network error',
 isRetryable: true,
 isOffline: !navigator.onLine
 };
 }

 return {
 type: 'unknown',
 message: message || 'Unknown error',
 isRetryable: true
 };
 }

 static extractCreditCost(message: string): number | undefined {
 const creditMatch = message.match(/(\d+)\s*credit/i);
 return creditMatch ? parseInt(creditMatch[1], 10) : undefined;
 }

 static isOnline(): boolean {
 return typeof navigator !== 'undefined' ? navigator.onLine : true;
 }

 static addNetworkListeners(
 onOnline: () => void, 
 onOffline: () => void
 ): () => void {
 if (typeof window === 'undefined') {
 return () => {}; // No-op for SSR
 }

 window.addEventListener('online', onOnline);
 window.addEventListener('offline', onOffline);

 return () => {
 window.removeEventListener('online', onOnline);
 window.removeEventListener('offline', onOffline);
 };
 }
}