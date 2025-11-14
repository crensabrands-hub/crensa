'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
 children: ReactNode;
 layoutType: 'creator' | 'member' | 'public';
 fallback?: ReactNode;
 onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
 hasError: boolean;
 error?: Error;
 errorInfo?: ErrorInfo;
}

export class RouteErrorBoundary extends Component<Props, State> {
 constructor(props: Props) {
 super(props);
 this.state = { hasError: false };
 }

 static getDerivedStateFromError(error: Error): State {
 return { hasError: true, error };
 }

 componentDidCatch(error: Error, errorInfo: ErrorInfo) {
 console.error('Route Layout Error Boundary caught an error:', error, errorInfo);
 
 this.setState({ errorInfo });

 if (this.props.onError) {
 this.props.onError(error, errorInfo);
 }

 console.error('Error details:', {
 error: error.message,
 stack: error.stack,
 componentStack: errorInfo.componentStack,
 layoutType: this.props.layoutType
 });
 }

 handleRetry = () => {
 this.setState({ hasError: false, error: undefined, errorInfo: undefined });
 };

 handleGoHome = () => {
 window.location.href = '/';
 };

 handleGoBack = () => {
 window.history.back();
 };

 getLayoutSpecificFallback = () => {
 const { layoutType } = this.props;
 const { error } = this.state;

 const commonActions = (
 <div className="space-y-3">
 <button
 onClick={this.handleRetry}
 className="w-full bg-primary-navy text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
 >
 Try Again
 </button>
 <div className="grid grid-cols-2 gap-2">
 <button
 onClick={this.handleGoBack}
 className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
 >
 Go Back
 </button>
 <button
 onClick={this.handleGoHome}
 className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
 >
 Go Home
 </button>
 </div>
 </div>
 );

 switch (layoutType) {
 case 'creator':
 return (
 <div className="min-h-screen bg-neutral-gray flex items-center justify-center">
 <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
 <div className="mb-4">
 <svg
 className="mx-auto h-12 w-12 text-red-500"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
 />
 </svg>
 </div>
 <h2 className="text-lg font-semibold text-gray-900 mb-2">
 Creator Dashboard Error
 </h2>
 <p className="text-gray-600 mb-4">
 We encountered an error while loading your creator dashboard. This might be a temporary issue.
 </p>
 {commonActions}
 <div className="mt-4 pt-4 border-t border-gray-200">
 <button
 onClick={() => window.location.href = '/dashboard'}
 className="text-sm text-primary-navy hover:underline"
 >
 Switch to Member Dashboard
 </button>
 </div>
 </div>
 </div>
 );

 case 'member':
 return (
 <div className="min-h-screen bg-neutral-gray flex items-center justify-center">
 <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
 <div className="mb-4">
 <svg
 className="mx-auto h-12 w-12 text-red-500"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
 />
 </svg>
 </div>
 <h2 className="text-lg font-semibold text-gray-900 mb-2">
 Dashboard Error
 </h2>
 <p className="text-gray-600 mb-4">
 We encountered an error while loading your dashboard. Please try again or contact support if the problem persists.
 </p>
 {commonActions}
 </div>
 </div>
 );

 case 'public':
 default:
 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center">
 <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
 <div className="mb-4">
 <svg
 className="mx-auto h-12 w-12 text-red-500"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
 />
 </svg>
 </div>
 <h2 className="text-lg font-semibold text-gray-900 mb-2">
 Something went wrong
 </h2>
 <p className="text-gray-600 mb-4">
 We encountered an error while loading this page. Please try again.
 </p>
 {commonActions}
 </div>
 </div>
 );
 }
 };

 render() {
 if (this.state.hasError) {

 if (this.props.fallback) {
 return this.props.fallback;
 }

 return this.getLayoutSpecificFallback();
 }

 return this.props.children;
 }
}

export function withRouteErrorBoundary<P extends object>(
 Component: React.ComponentType<P>,
 layoutType: 'creator' | 'member' | 'public',
 fallback?: ReactNode
) {
 const WrappedComponent = (props: P) => (
 <RouteErrorBoundary layoutType={layoutType} fallback={fallback}>
 <Component {...props} />
 </RouteErrorBoundary>
 );

 WrappedComponent.displayName = `withRouteErrorBoundary(${Component.displayName || Component.name})`;
 
 return WrappedComponent;
}

export function useRouteErrorBoundary(layoutType: 'creator' | 'member' | 'public') {
 return React.useCallback((error: Error, errorInfo: ErrorInfo) => {
 console.error(`Route error in ${layoutType} layout:`, error, errorInfo);
 }, [layoutType]);
}