'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';

interface Props {
 children: ReactNode;
 fallback?: ReactNode;
 onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
 hasError: boolean;
 error?: Error;
 errorId?: string;
}

export class ProfileErrorBoundary extends Component<Props, State> {
 constructor(props: Props) {
 super(props);
 this.state = { hasError: false };
 }

 static getDerivedStateFromError(error: Error): State {

 const errorId = `profile_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
 return { 
 hasError: true, 
 error,
 errorId
 };
 }

 componentDidCatch(error: Error, errorInfo: ErrorInfo) {
 console.error('Profile Error Boundary caught an error:', error, errorInfo);

 console.error('Error ID:', this.state.errorId);
 console.error('Component Stack:', errorInfo.componentStack);

 if (this.props.onError) {
 this.props.onError(error, errorInfo);
 }
 }

 handleRetry = () => {
 this.setState({ hasError: false, error: undefined, errorId: undefined });
 };

 handleReload = () => {
 window.location.reload();
 };

 render() {
 if (this.state.hasError) {

 if (this.props.fallback) {
 return this.props.fallback;
 }

 return (
 <div className="min-h-screen bg-neutral-gray/5 flex items-center justify-center p-4">
 <div className="max-w-md w-full bg-neutral-white rounded-lg shadow-lg p-6 text-center">
 <div className="mb-4">
 <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-amber-500" />
 </div>
 
 <h2 className="text-xl font-semibold text-primary-navy mb-2">
 Profile Temporarily Unavailable
 </h2>
 
 <p className="text-neutral-gray mb-6">
 We&apos;re having trouble loading your profile right now. This is usually temporary and can be resolved by trying again.
 </p>

 <div className="space-y-3">
 <button
 onClick={this.handleRetry}
 className="w-full flex items-center justify-center space-x-2 bg-accent-pink text-neutral-white px-4 py-3 rounded-lg hover:bg-accent-pink/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-pink focus:ring-offset-2"
 >
 <ArrowPathIcon className="w-4 h-4" />
 <span>Try Again</span>
 </button>
 
 <button
 onClick={this.handleReload}
 className="w-full bg-neutral-gray/10 text-primary-navy px-4 py-3 rounded-lg hover:bg-neutral-gray/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-navy focus:ring-offset-2"
 >
 Reload Page
 </button>
 
 <Link
 href="/dashboard"
 className="w-full flex items-center justify-center space-x-2 border border-primary-navy text-primary-navy px-4 py-3 rounded-lg hover:bg-primary-navy hover:text-neutral-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-navy focus:ring-offset-2"
 >
 <HomeIcon className="w-4 h-4" />
 <span>Go to Dashboard</span>
 </Link>
 </div>

 {}
 <div className="mt-6 pt-4 border-t border-neutral-gray/20">
 <p className="text-sm text-neutral-gray mb-2">
 Still having trouble?
 </p>
 <Link
 href="/help"
 className="text-sm text-accent-pink hover:text-accent-pink/80 font-medium transition-colors duration-200 focus:outline-none focus:underline"
 >
 Contact Support
 </Link>
 </div>

 {}
 {process.env.NODE_ENV === 'development' && this.state.error && (
 <details className="mt-4 text-left">
 <summary className="cursor-pointer text-sm text-neutral-gray hover:text-primary-navy">
 Error Details (Development Only)
 </summary>
 <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-xs">
 <p className="font-medium text-red-800 mb-1">Error ID: {this.state.errorId}</p>
 <p className="font-medium text-red-800 mb-1">Message: {this.state.error.message}</p>
 <pre className="text-red-600 overflow-auto whitespace-pre-wrap">
 {this.state.error.stack}
 </pre>
 </div>
 </details>
 )}
 </div>
 </div>
 );
 }

 return this.props.children;
 }
}

export function withProfileErrorBoundary<P extends object>(
 Component: React.ComponentType<P>,
 fallback?: ReactNode
) {
 const WrappedComponent = (props: P) => (
 <ProfileErrorBoundary fallback={fallback}>
 <Component {...props} />
 </ProfileErrorBoundary>
 );

 WrappedComponent.displayName = `withProfileErrorBoundary(${Component.displayName || Component.name})`;
 
 return WrappedComponent;
}

export function ProfileComponentErrorBoundary({ 
 children, 
 componentName,
 showRetry = true 
}: { 
 children: ReactNode; 
 componentName: string;
 showRetry?: boolean;
}) {
 const fallback = (
 <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
 <div className="flex items-start space-x-3">
 <div className="flex-shrink-0">
 <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
 </div>
 <div className="flex-1">
 <h3 className="text-sm font-medium text-amber-800">
 {componentName} Unavailable
 </h3>
 <p className="text-sm text-amber-700 mt-1">
 This section of your profile couldn&apos;t load. {showRetry ? 'Please try refreshing the page.' : 'Please contact support if this continues.'}
 </p>
 {showRetry && (
 <button
 onClick={() => window.location.reload()}
 className="mt-2 text-sm text-amber-800 hover:text-amber-900 font-medium underline focus:outline-none"
 >
 Refresh Page
 </button>
 )}
 </div>
 </div>
 </div>
 );

 return (
 <ProfileErrorBoundary fallback={fallback}>
 {children}
 </ProfileErrorBoundary>
 );
}