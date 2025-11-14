'use client';

import React from 'react';
import { useAuthContext, UserRole } from '@/contexts/AuthContext';
import { AuthLoading } from './AuthLoading';
import { AuthError } from './AuthError';

interface WithAuthOptions {
 requiredRole?: UserRole;
 redirectTo?: string;
 loadingComponent?: React.ComponentType;
 errorComponent?: React.ComponentType<{ error: any; onRetry?: () => void; onDismiss?: () => void }>;
 requireProfile?: boolean;
}

export function withAuth<P extends object>(
 WrappedComponent: React.ComponentType<P>,
 options: WithAuthOptions = {}
) {
 const {
 requiredRole,
 redirectTo = '/sign-in',
 loadingComponent: LoadingComponent = AuthLoading,
 errorComponent: ErrorComponent = AuthError,
 requireProfile = true,
 } = options;

 return function AuthenticatedComponent(props: P) {
 const {
 isLoading,
 isSignedIn,
 userProfile,
 hasRole,
 error,
 retry,
 clearError,
 isOptimistic,
 } = useAuthContext();

 if (isLoading) {
 return <LoadingComponent />;
 }

 if (error) {
 return (
 <ErrorComponent
 error={error}
 onRetry={error.retryable ? retry : undefined}
 onDismiss={clearError}
 />
 );
 }

 if (!isSignedIn) {
 if (typeof window !== 'undefined') {
 window.location.href = `${redirectTo}?redirect=${encodeURIComponent(
 window.location.pathname
 )}`;
 }
 return <LoadingComponent />;
 }

 if (requireProfile && !userProfile) {
 if (typeof window !== 'undefined') {
 window.location.href = '/onboarding';
 }
 return <LoadingComponent />;
 }

 if (requiredRole && !hasRole(requiredRole)) {
 return (
 <div className="min-h-screen flex items-center justify-center p-4">
 <div className="max-w-md w-full text-center">
 <div className="bg-red-50 border border-red-200 rounded-lg p-6">
 <div className="flex justify-center mb-4">
 <svg
 className="w-12 h-12 text-red-400"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
 />
 </svg>
 </div>
 <h3 className="text-lg font-medium text-red-800 mb-2">
 Access Denied
 </h3>
 <p className="text-red-600 mb-4">
 You don&apos;t have permission to access this page. This page
 requires {requiredRole} access.
 </p>
 <button
 onClick={() => window.history.back()}
 className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
 >
 Go Back
 </button>
 </div>
 </div>
 </div>
 );
 }

 const componentProps = {
 ...props,
 isOptimistic,
 } as P;

 return <WrappedComponent {...componentProps} />;
 };
}

export const withCreatorAuth = <P extends object>(
 WrappedComponent: React.ComponentType<P>
) => withAuth(WrappedComponent, { requiredRole: 'creator' });

export const withMemberAuth = <P extends object>(
 WrappedComponent: React.ComponentType<P>
) => withAuth(WrappedComponent, { requiredRole: 'member' });

export function useAuthGuard(requiredRole?: UserRole) {
 const { isLoading, isSignedIn, userProfile, hasRole, error } =
 useAuthContext();

 const canAccess = React.useMemo(() => {
 if (isLoading || error) return false;
 if (!isSignedIn || !userProfile) return false;
 if (requiredRole && !hasRole(requiredRole)) return false;
 return true;
 }, [isLoading, isSignedIn, userProfile, hasRole, requiredRole, error]);

 return {
 canAccess,
 isLoading,
 error,
 isSignedIn,
 userProfile,
 hasRole,
 };
}