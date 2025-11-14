'use client';

import { LockClosedIcon, CreditCardIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface AccessDeniedErrorProps {
 onGoMembership: () => void;
 onGoHome: () => void;
 onGoWallet: () => void;
 requiresCredits?: boolean;
 requiresMembership?: boolean;
 creditCost?: number;
}

export default function AccessDeniedError({ 
 onGoMembership, 
 onGoHome, 
 onGoWallet,
 requiresCredits = false,
 requiresMembership = false,
 creditCost 
}: AccessDeniedErrorProps) {
 const getTitle = () => {
 if (requiresMembership) return 'Membership Required';
 if (requiresCredits) return 'Credits Required';
 return 'Access Denied';
 };

 const getMessage = () => {
 if (requiresMembership) {
 return 'This content is exclusive to our members. Upgrade your account to access premium videos.';
 }
 if (requiresCredits) {
 return creditCost 
 ? `You need ${creditCost} credits to watch this video. Top up your wallet to continue.`
 : 'You need credits to watch this video. Top up your wallet to continue.';
 }
 return 'You don\'t have permission to access this content. Please check your account status.';
 };

 const getPrimaryAction = () => {
 if (requiresMembership) {
 return {
 label: 'Upgrade Membership',
 icon: LockClosedIcon,
 onClick: onGoMembership,
 className: 'bg-purple-600 hover:bg-purple-700 text-white'
 };
 }
 if (requiresCredits) {
 return {
 label: 'Top Up Wallet',
 icon: CreditCardIcon,
 onClick: onGoWallet,
 className: 'bg-green-600 hover:bg-green-700 text-white'
 };
 }
 return null;
 };

 const primaryAction = getPrimaryAction();

 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center">
 <div className="text-center max-w-md mx-auto p-6">
 {}
 <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <LockClosedIcon className="w-8 h-8 text-yellow-600" />
 </div>

 {}
 <h1 className="text-2xl font-bold text-gray-900 mb-2">
 {getTitle()}
 </h1>

 {}
 <p className="text-gray-600 mb-6">
 {getMessage()}
 </p>

 {}
 <div className="space-y-3">
 {}
 {primaryAction && (
 <button
 onClick={primaryAction.onClick}
 className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${primaryAction.className}`}
 >
 <primaryAction.icon className="w-5 h-5" />
 {primaryAction.label}
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
 {(requiresMembership || requiresCredits) && (
 <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
 <p className="text-sm font-medium text-purple-800 mb-2">
 {requiresMembership ? 'Membership Benefits:' : 'With Credits You Get:'}
 </p>
 <ul className="text-sm text-purple-700 text-left space-y-1">
 {requiresMembership ? (
 <>
 <li>• Access to exclusive premium content</li>
 <li>• Ad-free viewing experience</li>
 <li>• Early access to new releases</li>
 <li>• Priority customer support</li>
 </>
 ) : (
 <>
 <li>• Watch any video instantly</li>
 <li>• No monthly commitments</li>
 <li>• Credits never expire</li>
 <li>• Support your favorite creators</li>
 </>
 )}
 </ul>
 </div>
 )}
 </div>
 </div>
 );
}