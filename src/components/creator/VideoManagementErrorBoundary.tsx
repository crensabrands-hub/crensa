"use client";

import React, { Component, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
 children: ReactNode;
 fallback?: ReactNode;
 onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
 hasError: boolean;
 error: Error | null;
 errorInfo: React.ErrorInfo | null;
}

export class VideoManagementErrorBoundary extends Component<Props, State> {
 constructor(props: Props) {
 super(props);
 this.state = {
 hasError: false,
 error: null,
 errorInfo: null,
 };
 }

 static getDerivedStateFromError(error: Error): State {
 return {
 hasError: true,
 error,
 errorInfo: null,
 };
 }

 componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
 console.error('VideoManagementErrorBoundary caught an error:', error, errorInfo);
 
 this.setState({
 error,
 errorInfo,
 });

 this.props.onError?.(error, errorInfo);
 }

 handleRetry = () => {
 this.setState({
 hasError: false,
 error: null,
 errorInfo: null,
 });
 };

 render() {
 if (this.state.hasError) {

 if (this.props.fallback) {
 return this.props.fallback;
 }

 return (
 <div className="min-h-[400px] flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200">
 <div className="text-center max-w-md mx-auto p-6">
 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
 </div>
 
 <h3 className="text-lg font-semibold text-gray-900 mb-2">
 Video Management Error
 </h3>
 
 <p className="text-gray-600 mb-4">
 {this.state.error?.message || 'Something went wrong while loading your videos.'}
 </p>
 
 <div className="space-y-3">
 <button
 onClick={this.handleRetry}
 className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
 >
 <ArrowPathIcon className="w-4 h-4" />
 Try Again
 </button>
 
 <button
 onClick={() => window.location.reload()}
 className="block w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
 >
 Refresh Page
 </button>
 </div>

 {process.env.NODE_ENV === 'development' && this.state.error && (
 <details className="mt-4 text-left">
 <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
 Error Details (Development)
 </summary>
 <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto max-h-32">
 {this.state.error.stack}
 </pre>
 {this.state.errorInfo && (
 <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto max-h-32">
 {this.state.errorInfo.componentStack}
 </pre>
 )}
 </details>
 )}
 </div>
 </div>
 );
 }

 return this.props.children;
 }
}

export default VideoManagementErrorBoundary;