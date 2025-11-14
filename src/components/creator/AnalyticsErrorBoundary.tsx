"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
 children: ReactNode;
 fallback?: ReactNode;
}

interface State {
 hasError: boolean;
 error?: Error;
 errorInfo?: ErrorInfo;
}

export class AnalyticsErrorBoundary extends Component<Props, State> {
 constructor(props: Props) {
 super(props);
 this.state = { hasError: false };
 }

 static getDerivedStateFromError(error: Error): State {

 return { hasError: true, error };
 }

 componentDidCatch(error: Error, errorInfo: ErrorInfo) {

 console.error('Analytics Error Boundary caught an error:', error, errorInfo);
 
 this.setState({
 error,
 errorInfo
 });

 }

 handleRetry = () => {
 this.setState({ hasError: false, error: undefined, errorInfo: undefined });
 };

 render() {
 if (this.state.hasError) {

 if (this.props.fallback) {
 return this.props.fallback;
 }

 return (
 <div className="text-center py-12 bg-white rounded-lg border border-neutral-light-gray">
 <div className="text-red-500 mb-4">
 <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
 </svg>
 <h3 className="text-xl font-semibold text-primary-navy mb-2">Analytics Error</h3>
 <p className="text-sm text-neutral-dark-gray mb-4 max-w-md mx-auto">
 Something went wrong while loading the analytics dashboard. This might be due to a data processing error.
 </p>
 
 {process.env.NODE_ENV === 'development' && this.state.error && (
 <details className="text-left bg-red-50 p-4 rounded-lg mb-4 max-w-2xl mx-auto">
 <summary className="cursor-pointer font-medium text-red-700 mb-2">
 Error Details (Development Only)
 </summary>
 <div className="text-xs text-red-600 font-mono">
 <p className="mb-2"><strong>Error:</strong> {this.state.error.message}</p>
 <p className="mb-2"><strong>Stack:</strong></p>
 <pre className="whitespace-pre-wrap bg-red-100 p-2 rounded text-xs overflow-auto max-h-40">
 {this.state.error.stack}
 </pre>
 {this.state.errorInfo && (
 <>
 <p className="mb-2 mt-4"><strong>Component Stack:</strong></p>
 <pre className="whitespace-pre-wrap bg-red-100 p-2 rounded text-xs overflow-auto max-h-40">
 {this.state.errorInfo.componentStack}
 </pre>
 </>
 )}
 </div>
 </details>
 )}
 </div>
 
 <div className="space-x-4">
 <button
 onClick={this.handleRetry}
 className="btn-primary"
 >
 Retry Loading Analytics
 </button>
 <button
 onClick={() => window.location.reload()}
 className="btn-outline"
 >
 Refresh Page
 </button>
 </div>
 
 <div className="mt-6 text-xs text-neutral-dark-gray">
 <p>If this problem persists, please contact support.</p>
 </div>
 </div>
 );
 }

 return this.props.children;
 }
}

export function withAnalyticsErrorBoundary<P extends object>(
 Component: React.ComponentType<P>,
 fallback?: ReactNode
) {
 return function WrappedComponent(props: P) {
 return (
 <AnalyticsErrorBoundary fallback={fallback}>
 <Component {...props} />
 </AnalyticsErrorBoundary>
 );
 };
}