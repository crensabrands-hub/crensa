'use client';

import { Component, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WatchErrorHandler, type ErrorInfo } from './utils/errorHandler';
import { 
 VideoNotFoundError, 
 NetworkError, 
 AccessDeniedError, 
 InvalidLinkError, 
 ServerError 
} from './error-pages';

interface WatchErrorBoundaryProps {
 error: string;
 onRetry: () => void;
 onGoHome: () => void;
 onGoDiscover: () => void;
 statusCode?: number;
 identifier?: string;
}

interface WatchErrorBoundaryState {
 hasError: boolean;
 error?: Error;
}

export default function WatchErrorBoundary({ 
 error, 
 onRetry, 
 onGoHome, 
 onGoDiscover,
 statusCode,
 identifier
}: WatchErrorBoundaryProps) {
 const router = useRouter();
 const [isOnline, setIsOnline] = useState(true);

 useEffect(() => {
 setIsOnline(WatchErrorHandler.isOnline());

 const cleanup = WatchErrorHandler.addNetworkListeners(
 () => setIsOnline(true),
 () => setIsOnline(false)
 );

 return cleanup;
 }, []);

 const errorInfo: ErrorInfo = WatchErrorHandler.analyzeError(error, statusCode);

 const creditCost = WatchErrorHandler.extractCreditCost(error);
 if (creditCost) {
 errorInfo.creditCost = creditCost;
 }

 const handleGoMembership = () => {
 router.push('/membership');
 };

 const handleGoWallet = () => {
 router.push('/wallet');
 };

 const handleContactSupport = () => {

 window.open('mailto:support@example.com?subject=Video%20Error&body=' + 
 encodeURIComponent(`Error: ${error}\nIdentifier: ${identifier}\nStatus: ${statusCode}`));
 };

 const handleRetryWithNetworkCheck = () => {
 if (!isOnline) {

 return;
 }
 onRetry();
 };

 switch (errorInfo.type) {
 case 'network':
 return (
 <NetworkError
 onRetry={handleRetryWithNetworkCheck}
 onGoHome={onGoHome}
 isOffline={!isOnline}
 />
 );

 case 'not_found':
 return (
 <VideoNotFoundError
 onGoHome={onGoHome}
 onGoDiscover={onGoDiscover}
 isShareToken={identifier ? identifier.length > 20 : false}
 />
 );

 case 'access_denied':
 return (
 <AccessDeniedError
 onGoMembership={handleGoMembership}
 onGoHome={onGoHome}
 onGoWallet={handleGoWallet}
 requiresCredits={errorInfo.requiresCredits}
 requiresMembership={errorInfo.requiresMembership}
 creditCost={errorInfo.creditCost}
 />
 );

 case 'invalid_link':
 return (
 <InvalidLinkError
 onGoHome={onGoHome}
 onGoDiscover={onGoDiscover}
 identifier={identifier}
 />
 );

 case 'server_error':
 return (
 <ServerError
 onRetry={handleRetryWithNetworkCheck}
 onGoHome={onGoHome}
 onContactSupport={handleContactSupport}
 errorCode={statusCode?.toString()}
 showDetails={process.env.NODE_ENV === 'development'}
 />
 );

 default:

 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center">
 <div className="text-center max-w-md mx-auto p-6">
 {}
 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <div className="text-red-500 text-6xl">⚠️</div>
 </div>

 {}
 <h1 className="text-2xl font-bold text-gray-900 mb-2">
 Something Went Wrong
 </h1>

 {}
 <p className="text-gray-600 mb-6">
 {errorInfo.message}
 </p>

 {}
 <div className="space-y-3">
 {errorInfo.isRetryable && (
 <button
 onClick={handleRetryWithNetworkCheck}
 className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
 >
 Try Again
 </button>
 )}

 <button
 onClick={onGoHome}
 className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
 >
 Go to Home
 </button>
 </div>

 {}
 {!isOnline && (
 <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
 <p className="text-sm text-orange-700">
 <strong>Offline:</strong> Check your internet connection and try again.
 </p>
 </div>
 )}
 </div>
 </div>
 );
 }
}

export class WatchErrorBoundaryClass extends Component<
 { children: ReactNode; fallback?: (error: Error) => ReactNode },
 WatchErrorBoundaryState
> {
 constructor(props: { children: ReactNode; fallback?: (error: Error) => ReactNode }) {
 super(props);
 this.state = { hasError: false };
 }

 static getDerivedStateFromError(error: Error): WatchErrorBoundaryState {
 return { hasError: true, error };
 }

 componentDidCatch(error: Error, errorInfo: any) {
 console.error('Watch page error boundary caught an error:', error, errorInfo);
 }

 render() {
 if (this.state.hasError && this.state.error) {
 if (this.props.fallback) {
 return this.props.fallback(this.state.error);
 }

 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center">
 <div className="text-center max-w-md mx-auto p-6">
 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <div className="text-red-500 text-6xl">⚠️</div>
 </div>
 <h1 className="text-2xl font-bold text-gray-900 mb-2">
 Something went wrong
 </h1>
 <p className="text-gray-600 mb-6">
 An unexpected error occurred while loading the video. Please try refreshing the page.
 </p>
 <div className="space-y-3">
 <button
 onClick={() => this.setState({ hasError: false, error: undefined })}
 className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
 >
 Try Again
 </button>
 <button
 onClick={() => window.location.href = '/discover'}
 className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
 >
 Back to Discover
 </button>
 </div>
 </div>
 </div>
 );
 }

 return this.props.children;
 }
}