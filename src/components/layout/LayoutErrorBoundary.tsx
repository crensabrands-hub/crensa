'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
 children: ReactNode;
 fallback?: ReactNode;
 onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
 hasError: boolean;
 error?: Error;
}

export class LayoutErrorBoundary extends Component<Props, State> {
 constructor(props: Props) {
 super(props);
 this.state = { hasError: false };
 }

 static getDerivedStateFromError(error: Error): State {
 return { hasError: true, error };
 }

 componentDidCatch(error: Error, errorInfo: ErrorInfo) {
 console.error('Layout Error Boundary caught an error:', error, errorInfo);

 if (this.props.onError) {
 this.props.onError(error, errorInfo);
 }
 }

 handleRetry = () => {
 this.setState({ hasError: false, error: undefined });
 };

 render() {
 if (this.state.hasError) {

 if (this.props.fallback) {
 return this.props.fallback;
 }

 return (
 <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
 d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
 />
 </svg>
 </div>
 <h2 className="text-lg font-semibold text-gray-900 mb-2">
 Something went wrong
 </h2>
 <p className="text-gray-600 mb-4">
 We encountered an error while loading the layout. Please try again.
 </p>
 <div className="space-y-2">
 <button
 onClick={this.handleRetry}
 className="w-full bg-primary-navy text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
 >
 Try Again
 </button>
 <button
 onClick={() => window.location.reload()}
 className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
 >
 Reload Page
 </button>
 </div>
 {process.env.NODE_ENV === 'development' && this.state.error && (
 <details className="mt-4 text-left">
 <summary className="cursor-pointer text-sm text-gray-500">
 Error Details (Development)
 </summary>
 <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
 {this.state.error.stack}
 </pre>
 </details>
 )}
 </div>
 </div>
 );
 }

 return this.props.children;
 }
}

export function withLayoutErrorBoundary<P extends object>(
 Component: React.ComponentType<P>,
 fallback?: ReactNode
) {
 const WrappedComponent = (props: P) => (
 <LayoutErrorBoundary fallback={fallback}>
 <Component {...props} />
 </LayoutErrorBoundary>
 );

 WrappedComponent.displayName = `withLayoutErrorBoundary(${Component.displayName || Component.name})`;
 
 return WrappedComponent;
}

export function LayoutComponentErrorBoundary({ 
 children, 
 componentName 
}: { 
 children: ReactNode; 
 componentName: string;
}) {
 const fallback = (
 <div className="p-4 bg-red-50 border border-red-200 rounded-md">
 <div className="flex">
 <div className="flex-shrink-0">
 <svg
 className="h-5 w-5 text-red-400"
 viewBox="0 0 20 20"
 fill="currentColor"
 >
 <path
 fillRule="evenodd"
 d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
 clipRule="evenodd"
 />
 </svg>
 </div>
 <div className="ml-3">
 <h3 className="text-sm font-medium text-red-800">
 {componentName} Error
 </h3>
 <p className="text-sm text-red-700 mt-1">
 This component failed to load. Please refresh the page or contact support if the problem persists.
 </p>
 </div>
 </div>
 </div>
 );

 return (
 <LayoutErrorBoundary fallback={fallback}>
 {children}
 </LayoutErrorBoundary>
 );
}