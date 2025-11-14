'use client';

import { ExclamationTriangleIcon, ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface InvalidLinkErrorProps {
 onGoHome: () => void;
 onGoDiscover: () => void;
 identifier?: string;
}

export default function InvalidLinkError({ 
 onGoHome, 
 onGoDiscover,
 identifier 
}: InvalidLinkErrorProps) {
 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center">
 <div className="text-center max-w-md mx-auto p-6">
 {}
 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
 </div>

 {}
 <h1 className="text-2xl font-bold text-gray-900 mb-2">
 Invalid Link
 </h1>

 {}
 <p className="text-gray-600 mb-6">
 The video link appears to be invalid or malformed. Please check the URL and try again.
 </p>

 {}
 {identifier && process.env.NODE_ENV === 'development' && (
 <div className="mb-6 p-3 bg-gray-100 rounded-lg">
 <p className="text-xs text-gray-500 mb-1">Identifier (dev mode):</p>
 <code className="text-xs text-gray-700 break-all">{identifier}</code>
 </div>
 )}

 {}
 <div className="space-y-3">
 {}
 <button
 onClick={onGoDiscover}
 className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
 >
 <MagnifyingGlassIcon className="w-5 h-5" />
 Discover Videos
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
 <p className="text-sm text-blue-700 font-medium mb-2">Common Issues:</p>
 <ul className="text-sm text-blue-600 text-left space-y-1">
 <li>• Link was copied incorrectly</li>
 <li>• Link contains extra characters</li>
 <li>• Link is from an old version of the site</li>
 <li>• Link was shortened and may have expired</li>
 </ul>
 </div>

 {}
 <div className="mt-4">
 <p className="text-sm text-gray-500">
 Still having trouble? <button className="text-purple-600 hover:text-purple-700 underline">Contact Support</button>
 </p>
 </div>
 </div>
 </div>
 );
}