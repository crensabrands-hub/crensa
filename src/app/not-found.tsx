"use client";

import Link from "next/link";
import { HomeIcon, ArrowLeftIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
 return (
 <div className="min-h-screen flex items-center justify-center bg-neutral-gray/5 p-4">
 <div className="max-w-md w-full bg-neutral-white rounded-lg shadow-lg p-8 text-center">
 {}
 <div className="mb-6">
 <div className="mx-auto w-16 h-16 bg-accent-pink/10 rounded-full flex items-center justify-center">
 <span className="text-2xl font-bold text-accent-pink">404</span>
 </div>
 </div>

 {}
 <h1 className="text-2xl font-bold text-primary-navy mb-2">
 Page Not Found
 </h1>
 
 {}
 <p className="text-neutral-gray mb-8">
 The page you&apos;re looking for doesn&apos;t exist or may have been moved. Let&apos;s get you back on track.
 </p>

 {}
 <div className="space-y-3">
 <Link
 href="/"
 className="w-full flex items-center justify-center space-x-2 bg-accent-pink text-neutral-white px-6 py-3 rounded-lg hover:bg-accent-pink/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-pink focus:ring-offset-2"
 >
 <HomeIcon className="w-4 h-4" />
 <span>Go to Homepage</span>
 </Link>
 
 <button
 onClick={() => window.history.back()}
 className="w-full flex items-center justify-center space-x-2 border border-primary-navy text-primary-navy px-6 py-3 rounded-lg hover:bg-primary-navy hover:text-neutral-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-navy focus:ring-offset-2"
 >
 <ArrowLeftIcon className="w-4 h-4" />
 <span>Go Back</span>
 </button>
 
 <Link
 href="/dashboard"
 className="w-full text-center text-accent-pink hover:text-accent-pink/80 font-medium transition-colors duration-200 focus:outline-none focus:underline"
 >
 Go to Dashboard
 </Link>
 </div>

 {}
 <div className="mt-8 pt-6 border-t border-neutral-gray/20">
 <p className="text-sm text-neutral-gray mb-2">
 Still having trouble finding what you need?
 </p>
 <Link
 href="/help"
 className="inline-flex items-center space-x-1 text-sm text-accent-pink hover:text-accent-pink/80 font-medium transition-colors duration-200 focus:outline-none focus:underline"
 >
 <QuestionMarkCircleIcon className="w-4 h-4" />
 <span>Contact Support</span>
 </Link>
 </div>

 {}
 <div className="mt-6">
 <p className="text-xs text-neutral-gray mb-3">Popular pages:</p>
 <div className="flex flex-wrap justify-center gap-2 text-xs">
 <Link
 href="/discover"
 className="text-neutral-gray hover:text-primary-navy transition-colors duration-200 focus:outline-none focus:underline"
 >
 Discover
 </Link>
 <span className="text-neutral-gray">•</span>
 <Link
 href="/membership"
 className="text-neutral-gray hover:text-primary-navy transition-colors duration-200 focus:outline-none focus:underline"
 >
 Membership
 </Link>
 <span className="text-neutral-gray">•</span>
 <Link
 href="/wallet"
 className="text-neutral-gray hover:text-primary-navy transition-colors duration-200 focus:outline-none focus:underline"
 >
 Wallet
 </Link>
 </div>
 </div>
 </div>
 </div>
 );
}
