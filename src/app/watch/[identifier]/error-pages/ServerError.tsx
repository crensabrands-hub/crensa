'use client';

import { ServerIcon, ArrowPathIcon, ArrowLeftIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';

interface ServerErrorProps {
 onRetry: () => void;
 onGoHome: () => void;
 onContactSupport?: () => void;
 errorCode?: string;
 showDetails?: boolean;
}

export default function ServerError({ 
 onRetry, 
 onGoHome, 
 onContactSupport,
 errorCode,
 showDetails = false
}: ServerErrorProps) {
 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center">
 <div className="text-center max-w-md mx-auto p-6">
 {}
 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <ServerIcon className="w-8 h-8 text-red-600" />
 </div>

 {}
 <h1 className="text-2xl font-bold text-gray-900 mb-2">
 Server Error
 </h1>

 {}
 <p className="text-gray-600 mb-6">
 We&apos;re experiencing technical difficulties on our end. Our team has been notified and is working to fix this issue.
 </p>

 {}
 {errorCode && showDetails && (
 <div className="mb-6 p-3 bg-gray-100 rounded-lg">
 <p className="text-xs text-gray-500 mb-1">Error Code:</p>
 <code className="text-sm text-gray-700">{errorCode}</code>
 </div>
 )}

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
 {onContactSupport && (
 <button
 onClick={onContactSupport}
 className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
 >
 <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
 Contact Support
 </button>
 )}

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
 <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
 <p className="text-sm text-orange-700 font-medium mb-2">What&apos;s happening?</p>
 <ul className="text-sm text-orange-600 text-left space-y-1">
 <li>• Our servers are experiencing high load</li>
 <li>• We&apos;re working to resolve this quickly</li>
 <li>• Your data and account are safe</li>
 <li>• Try again in a few minutes</li>
 </ul>
 </div>

 {}
 <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
 Service Temporarily Unavailable
 </div>
 </div>
 </div>
 );
}