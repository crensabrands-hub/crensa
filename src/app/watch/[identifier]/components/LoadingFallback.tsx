'use client';

import { useState, useEffect } from 'react';

interface LoadingFallbackProps {
 message?: string;
 showRetry?: boolean;
 onRetry?: () => void;
 timeout?: number; 
}

export default function LoadingFallback({ 
 message = 'Loading video...', 
 showRetry = false,
 onRetry,
 timeout = 10000 // 10 seconds
}: LoadingFallbackProps) {
 const [showRetryButton, setShowRetryButton] = useState(showRetry);
 const [timeoutReached, setTimeoutReached] = useState(false);

 useEffect(() => {
 if (!showRetry && timeout > 0) {
 const timer = setTimeout(() => {
 setTimeoutReached(true);
 setShowRetryButton(true);
 }, timeout);

 return () => clearTimeout(timer);
 }
 }, [showRetry, timeout]);

 return (
 <div className="min-h-screen bg-black flex items-center justify-center">
 <div className="text-center max-w-md mx-auto p-6">
 {}
 <div className="relative mb-6">
 {}
 <div className="w-16 h-16 border-4 border-gray-600 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
 
 {}
 <div className="absolute inset-0 flex items-center justify-center">
 <div className="w-8 h-8 bg-purple-500 rounded-full animate-pulse opacity-60"></div>
 </div>
 </div>

 {}
 <h2 className="text-xl font-semibold text-white mb-2">
 {message}
 </h2>

 {}
 <div className="w-full bg-gray-700 rounded-full h-1 mb-4">
 <div className="bg-purple-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
 </div>

 {}
 <p className="text-gray-400 text-sm mb-6">
 {timeoutReached 
 ? 'This is taking longer than expected...' 
 : 'Please wait while we prepare your video'
 }
 </p>

 {}
 {showRetryButton && onRetry && (
 <button
 onClick={onRetry}
 className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
 >
 Retry Loading
 </button>
 )}

 {}
 <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
 <div className={`w-2 h-2 rounded-full ${
 navigator.onLine ? 'bg-green-500' : 'bg-red-500'
 }`}></div>
 {navigator.onLine ? 'Connected' : 'Offline'}
 </div>

 {}
 {timeoutReached && (
 <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
 <p className="text-sm text-gray-300 font-medium mb-2">Loading slowly?</p>
 <ul className="text-xs text-gray-400 text-left space-y-1">
 <li>• Check your internet connection</li>
 <li>• Try refreshing the page</li>
 <li>• Disable browser extensions</li>
 <li>• Switch to a different network</li>
 </ul>
 </div>
 )}
 </div>
 </div>
 );
}