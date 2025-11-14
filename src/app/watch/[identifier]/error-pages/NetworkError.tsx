'use client';

import { WifiIcon, ArrowPathIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface NetworkErrorProps {
 onRetry: () => void;
 onGoHome: () => void;
 isOffline?: boolean;
}

export default function NetworkError({ 
 onRetry, 
 onGoHome, 
 isOffline = false 
}: NetworkErrorProps) {
 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center">
 <div className="text-center max-w-md mx-auto p-6">
 {}
 <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <WifiIcon className="w-8 h-8 text-orange-600" />
 </div>

 {}
 <h1 className="text-2xl font-bold text-gray-900 mb-2">
 {isOffline ? 'No Internet Connection' : 'Connection Problem'}
 </h1>

 {}
 <p className="text-gray-600 mb-6">
 {isOffline 
 ? 'Please check your internet connection and try again.'
 : 'We\'re having trouble connecting to our servers. This might be a temporary issue.'
 }
 </p>

 {}
 <div className="space-y-3">
 {}
 <button
 onClick={onRetry}
 className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
 >
 <ArrowPathIcon className="w-5 h-5" />
 Try Again
 </button>

 {}
 <button
 onClick={onGoHome}
 className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
 >
 <ArrowLeftIcon className="w-5 h-5" />
 Go to Home
 </button>
 </div>

 {}
 <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
 <p className="text-sm text-blue-700 font-medium mb-2">Troubleshooting Tips:</p>
 <ul className="text-sm text-blue-600 text-left space-y-1">
 <li>• Check your internet connection</li>
 <li>• Try refreshing the page</li>
 <li>• Disable any VPN or proxy</li>
 <li>• Clear your browser cache</li>
 </ul>
 </div>

 {}
 <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
 <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-orange-500'}`}></div>
 {isOffline ? 'Offline' : 'Connection Issues'}
 </div>
 </div>
 </div>
 );
}