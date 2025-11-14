'use client';

import { PlayIcon, ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface VideoNotFoundErrorProps {
 onGoHome: () => void;
 onGoDiscover: () => void;
 isShareToken?: boolean;
}

export default function VideoNotFoundError({ 
 onGoHome, 
 onGoDiscover, 
 isShareToken = false 
}: VideoNotFoundErrorProps) {
 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center">
 <div className="text-center max-w-md mx-auto p-6">
 {}
 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <PlayIcon className="w-8 h-8 text-red-600" />
 </div>

 {}
 <h1 className="text-2xl font-bold text-gray-900 mb-2">
 {isShareToken ? 'Link Not Found' : 'Video Not Found'}
 </h1>

 {}
 <p className="text-gray-600 mb-6">
 {isShareToken 
 ? 'This share link may have expired or been removed. Please ask the creator for a new link.'
 : 'The video you\'re looking for might have been removed or is no longer available.'
 }
 </p>

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
 <p className="text-sm text-blue-700">
 <strong>Looking for something specific?</strong> Try browsing our featured content or use the search feature to find similar videos.
 </p>
 </div>
 </div>
 </div>
 );
}