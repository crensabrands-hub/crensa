'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext, UserRole } from '@/contexts/AuthContext';
import { AuthLoading } from '@/components/auth/AuthLoading';
import { AuthError } from '@/components/auth/AuthError';

interface ProtectedRouteProps {
 children: ReactNode;
 requiredRole?: UserRole;
 redirectTo?: string;
 fallback?: ReactNode;
 requireProfile?: boolean;
 allowedRoles?: UserRole[];
}

export default function ProtectedRoute({
 children,
 requiredRole,
 redirectTo = '/sign-in',
 fallback,
 requireProfile = true,
 allowedRoles,
}: ProtectedRouteProps) {
 const router = useRouter();
 const {
 isLoading,
 isSignedIn,
 userProfile,
 hasRole,
 error,
 retry,
 clearError,
 } = useAuthContext();

 const hasRequiredAccess = React.useMemo(() => {
 if (!isSignedIn || !userProfile) return false;
 
 if (requiredRole && !hasRole(requiredRole)) return false;
 
 if (allowedRoles && !allowedRoles.some(role => hasRole(role))) return false;
 
 return true;
 }, [isSignedIn, userProfile, requiredRole, allowedRoles, hasRole]);

 useEffect(() => {
 if (isLoading) return;

 if (!isSignedIn) {
 const currentPath = window.location.pathname;
 const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
 router.push(redirectUrl);
 return;
 }

 if (requireProfile && !userProfile) {
 if (typeof window !== 'undefined' && window.location.pathname !== '/onboarding') {
 router.push('/onboarding');
 }
 return;
 }

 if (!hasRequiredAccess && userProfile) {

 if (userProfile?.role === 'creator') {
 router.push('/creator/dashboard');
 } else {
 router.push('/dashboard');
 }
 return;
 }
 }, [
 isLoading,
 isSignedIn,
 userProfile,
 hasRequiredAccess,
 requireProfile,
 router,
 redirectTo,
 ]);

 if (isLoading) {
 return <AuthLoading />;
 }

 if (error) {
 return (
 <AuthError
 error={error}
 onRetry={error.retryable ? retry : undefined}
 onDismiss={clearError}
 />
 );
 }

 if (!isSignedIn) {
 return fallback || <AuthLoading />;
 }

 if (requireProfile && !userProfile) {
 return fallback || <AuthLoading />;
 }

 if (!hasRequiredAccess) {
 return (
 fallback || (
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
 You don&apos;t have permission to access this page.
 {requiredRole && ` This page requires ${requiredRole} access.`}
 {allowedRoles && ` This page requires one of: ${allowedRoles.join(', ')}.`}
 </p>
 <div className="space-y-2">
 <button
 onClick={() => router.back()}
 className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
 >
 Go Back
 </button>
 <button
 onClick={() => router.push('/')}
 className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
 >
 Go Home
 </button>
 </div>
 </div>
 </div>
 </div>
 )
 );
 }

 return <>{children}</>;
}

export const CreatorProtectedRoute = ({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) => (
 <ProtectedRoute requiredRole="creator" {...props}>
 {children}
 </ProtectedRoute>
);

export const MemberProtectedRoute = ({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) => (
 <ProtectedRoute requiredRole="member" {...props}>
 {children}
 </ProtectedRoute>
);

export function useRouteAccess(requiredRole?: UserRole, allowedRoles?: UserRole[]) {
 const { isLoading, isSignedIn, userProfile, hasRole } = useAuthContext();

 const canAccess = React.useMemo(() => {
 if (isLoading || !isSignedIn || !userProfile) return false;
 
 if (requiredRole && !hasRole(requiredRole)) return false;
 
 if (allowedRoles && !allowedRoles.some(role => hasRole(role))) return false;
 
 return true;
 }, [isLoading, isSignedIn, userProfile, requiredRole, allowedRoles, hasRole]);

 return {
 canAccess,
 isLoading,
 isSignedIn,
 userProfile,
 hasRole,
 };
}