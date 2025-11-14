"use client";

import { useRouter } from "next/navigation";

export function MemberQuickActions() {
 const router = useRouter();

 const handleNavigation = (path: string) => {
 router.push(path);
 };

 return (
 <div className="card">
 <h3 className="text-xl font-semibold text-primary-navy mb-4">
 Quick Actions
 </h3>
 <div className="space-y-3">
 <button 
 onClick={() => handleNavigation('/')}
 className="w-full btn-primary flex items-center justify-center"
 >
 <svg
 className="w-5 h-5 mr-2"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
 />
 </svg>
 Discover Content
 </button>
 
 <button 
 onClick={() => handleNavigation('/member/wallet')}
 className="w-full btn-secondary flex items-center justify-center"
 >
 <svg
 className="w-5 h-5 mr-2"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
 />
 </svg>
 Manage Wallet
 </button>
 
 <button 
 onClick={() => handleNavigation('/member/profile')}
 className="w-full btn-outline flex items-center justify-center"
 >
 <svg
 className="w-5 h-5 mr-2"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
 />
 </svg>
 View Profile
 </button>
 
 <button 
 onClick={() => handleNavigation('/member/settings')}
 className="w-full btn-outline flex items-center justify-center"
 >
 <svg
 className="w-5 h-5 mr-2"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
 />
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
 />
 </svg>
 Settings
 </button>
 </div>
 </div>
 );
}