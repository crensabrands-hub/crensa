'use client';

import React from 'react';
import { AuthError as AuthErrorType } from '@/contexts/AuthContext';

interface AuthErrorProps {
 error: AuthErrorType;
 onRetry?: () => void;
 onDismiss?: () => void;
 className?: string;
}

export function AuthError({ error, onRetry, onDismiss, className = '' }: AuthErrorProps) {
 const getErrorIcon = () => {
 switch (error.type) {
 case 'network':
 return (
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
 </svg>
 );
 case 'unauthorized':
 case 'session_expired':
 return (
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
 </svg>
 );
 case 'profile_not_found':
 return (
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
 </svg>
 );
 default:
 return (
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 );
 }
 };

 const getErrorColor = () => {
 switch (error.type) {
 case 'network':
 return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200';
 case 'unauthorized':
 case 'session_expired':
 return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';
 case 'profile_not_found':
 return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200';
 default:
 return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-200';
 }
 };

 return (
 <div className={`border rounded-lg p-4 ${getErrorColor()} ${className}`}>
 <div className="flex items-start space-x-3">
 <div className="flex-shrink-0 mt-0.5">
 {getErrorIcon()}
 </div>
 
 <div className="flex-1 min-w-0">
 <h3 className="text-sm font-medium">
 {error.type === 'network' && 'Connection Error'}
 {error.type === 'unauthorized' && 'Authentication Required'}
 {error.type === 'session_expired' && 'Session Expired'}
 {error.type === 'profile_not_found' && 'Profile Setup Required'}
 {error.type === 'unknown' && 'Something went wrong'}
 </h3>
 
 <p className="mt-1 text-sm opacity-90">
 {error.message}
 </p>
 
 <div className="mt-3 flex items-center space-x-3">
 {error.retryable && onRetry && (
 <button
 onClick={onRetry}
 className="text-sm font-medium hover:underline focus:outline-none focus:underline"
 >
 Try again
 </button>
 )}
 
 {onDismiss && (
 <button
 onClick={onDismiss}
 className="text-sm font-medium opacity-70 hover:opacity-100 hover:underline focus:outline-none focus:underline"
 >
 Dismiss
 </button>
 )}
 </div>
 </div>
 
 {onDismiss && (
 <button
 onClick={onDismiss}
 className="flex-shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
 aria-label="Dismiss error"
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 )}
 </div>
 </div>
 );
}

export function AuthErrorBoundary({ 
 children, 
 fallback 
}: { 
 children: React.ReactNode;
 fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}) {
 const [error, setError] = React.useState<Error | null>(null);

 React.useEffect(() => {
 const handleError = (event: ErrorEvent) => {
 if (event.error?.name === 'AuthError') {
 setError(event.error);
 }
 };

 const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
 if (event.reason?.name === 'AuthError') {
 setError(event.reason);
 }
 };

 window.addEventListener('error', handleError);
 window.addEventListener('unhandledrejection', handleUnhandledRejection);

 return () => {
 window.removeEventListener('error', handleError);
 window.removeEventListener('unhandledrejection', handleUnhandledRejection);
 };
 }, []);

 const retry = () => {
 setError(null);
 };

 if (error) {
 if (fallback) {
 const FallbackComponent = fallback;
 return <FallbackComponent error={error} retry={retry} />;
 }

 return (
 <div className="min-h-screen flex items-center justify-center p-4">
 <div className="max-w-md w-full">
 <AuthError
 error={{
 type: 'unknown',
 message: error.message || 'An unexpected authentication error occurred',
 retryable: true,
 }}
 onRetry={retry}
 />
 </div>
 </div>
 );
 }

 return <>{children}</>;
}