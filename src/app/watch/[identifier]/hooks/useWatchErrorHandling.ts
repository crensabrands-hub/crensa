'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { WatchErrorHandler, type ErrorInfo } from '../utils/errorHandler';

interface UseWatchErrorHandlingOptions {
 identifier?: string;
 onRetry?: () => void;
 enableNetworkMonitoring?: boolean;
}

interface WatchErrorState {
 error: string | null;
 errorInfo: ErrorInfo | null;
 statusCode: number | undefined;
 isOnline: boolean;
 retryCount: number;
}

export function useWatchErrorHandling({
 identifier,
 onRetry,
 enableNetworkMonitoring = true
}: UseWatchErrorHandlingOptions = {}) {
 const router = useRouter();
 
 const [errorState, setErrorState] = useState<WatchErrorState>({
 error: null,
 errorInfo: null,
 statusCode: undefined,
 isOnline: true,
 retryCount: 0
 });

 useEffect(() => {
 if (!enableNetworkMonitoring) return;

 const updateOnlineStatus = () => {
 setErrorState(prev => ({ ...prev, isOnline: navigator.onLine }));
 };

 updateOnlineStatus(); // Set initial status

 const cleanup = WatchErrorHandler.addNetworkListeners(
 updateOnlineStatus,
 updateOnlineStatus
 );

 return cleanup;
 }, [enableNetworkMonitoring]);

 const setError = useCallback((error: string | Error | any, statusCode?: number) => {
 const errorMessage = error instanceof Error ? error.message : 
 typeof error === 'string' ? error : 
 error?.error || 'Unknown error';

 const errorInfo = WatchErrorHandler.analyzeError(errorMessage, statusCode);

 const creditCost = WatchErrorHandler.extractCreditCost(errorMessage);
 if (creditCost) {
 errorInfo.creditCost = creditCost;
 }

 setErrorState(prev => ({
 ...prev,
 error: errorMessage,
 errorInfo,
 statusCode
 }));
 }, []);

 const clearError = useCallback(() => {
 setErrorState(prev => ({
 ...prev,
 error: null,
 errorInfo: null,
 statusCode: undefined
 }));
 }, []);

 const handleRetry = useCallback(() => {
 setErrorState(prev => ({
 ...prev,
 retryCount: prev.retryCount + 1
 }));
 clearError();
 onRetry?.();
 }, [onRetry, clearError]);

 const navigationHelpers = {
 goHome: () => router.push('/'),
 goDiscover: () => router.push('/discover'),
 goMembership: () => router.push('/membership'),
 goWallet: () => router.push('/wallet'),
 contactSupport: () => {
 const subject = 'Video Error Report';
 const body = `Error: ${errorState.error}\nIdentifier: ${identifier}\nStatus: ${errorState.statusCode}\nRetry Count: ${errorState.retryCount}`;
 window.open(`mailto:support@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
 }
 };

 const isRetryable = errorState.errorInfo?.isRetryable && errorState.retryCount < 3;

 const getUserFriendlyMessage = useCallback(() => {
 if (!errorState.errorInfo) return errorState.error;

 const { type, message } = errorState.errorInfo;
 
 switch (type) {
 case 'network':
 return errorState.isOnline 
 ? 'Connection problem. Please check your internet and try again.'
 : 'You appear to be offline. Please check your internet connection.';
 
 case 'not_found':
 return identifier && identifier.length > 20 
 ? 'This share link has expired or is no longer valid.'
 : 'The video you\'re looking for could not be found.';
 
 case 'access_denied':
 if (errorState.errorInfo.requiresCredits) {
 return `You need ${errorState.errorInfo.creditCost || ''} credits to watch this video.`.trim();
 }
 if (errorState.errorInfo.requiresMembership) {
 return 'This content requires a premium membership to access.';
 }
 return 'You don\'t have permission to access this content.';
 
 case 'invalid_link':
 return 'The video link appears to be invalid or malformed.';
 
 case 'server_error':
 return 'Our servers are experiencing issues. Please try again in a few minutes.';
 
 default:
 return message || 'An unexpected error occurred.';
 }
 }, [errorState.errorInfo, errorState.error, errorState.isOnline, identifier]);

 return {

 error: errorState.error,
 errorInfo: errorState.errorInfo,
 statusCode: errorState.statusCode,
 isOnline: errorState.isOnline,
 retryCount: errorState.retryCount,

 setError,
 clearError,
 handleRetry,
 isRetryable,

 getUserFriendlyMessage,
 navigationHelpers,

 hasError: !!errorState.error,
 errorType: errorState.errorInfo?.type,
 requiresCredits: errorState.errorInfo?.requiresCredits,
 requiresMembership: errorState.errorInfo?.requiresMembership,
 creditCost: errorState.errorInfo?.creditCost
 };
}