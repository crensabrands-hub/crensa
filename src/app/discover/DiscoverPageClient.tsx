'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useLayout } from '@/contexts/LayoutContext';

const DynamicDiscoverContent = dynamic(
 () => import('@/components/discover/DiscoverPage'),
 {
 ssr: false,
 loading: () => (
 <div className="min-h-[600px] flex items-center justify-center">
 <div className="text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy mx-auto mb-4"></div>
 <p className="text-neutral-dark-gray">Loading discover content...</p>
 </div>
 </div>
 ),
 }
);

export default function DiscoverPageClient() {
 const { userProfile, isLoading, hasRole } = useAuthContext();
 const { setBreadcrumbs, setActiveRoute } = useLayout();
 const router = useRouter();

 useEffect(() => {
 setActiveRoute('/discover');
 setBreadcrumbs([
 { label: 'Dashboard', href: '/dashboard', active: false },
 { label: 'Discover', href: '/discover', active: true }
 ]);
 }, [setActiveRoute, setBreadcrumbs]);

 useEffect(() => {
 if (!isLoading && !userProfile) {
 router.push('/sign-in?redirect=/discover');
 return;
 }

 if (!isLoading && userProfile && !hasRole('member')) {

 if (hasRole('creator')) {
 router.push('/creator/dashboard');
 } else {
 router.push('/onboarding');
 }
 return;
 }
 }, [userProfile, isLoading, hasRole, router]);

 if (isLoading) {
 return (
 <div className="min-h-[600px] flex items-center justify-center">
 <div className="text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy mx-auto mb-4"></div>
 <p className="text-neutral-dark-gray">Loading...</p>
 </div>
 </div>
 );
 }

 if (!userProfile) {
 return (
 <div className="min-h-[600px] flex items-center justify-center">
 <div className="text-center">
 <h2 className="text-2xl font-bold text-primary-navy mb-4">
 Authentication Required
 </h2>
 <p className="text-neutral-dark-gray mb-6">
 Please sign in to access the discover page
 </p>
 <button
 onClick={() => router.push('/sign-in?redirect=/discover')}
 className="px-6 py-3 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors"
 >
 Sign In
 </button>
 </div>
 </div>
 );
 }

 if (!hasRole('member')) {
 return (
 <div className="min-h-[600px] flex items-center justify-center">
 <div className="text-center">
 <h2 className="text-2xl font-bold text-primary-navy mb-4">
 Member Access Required
 </h2>
 <p className="text-neutral-dark-gray mb-6">
 The discover page is available for members only
 </p>
 <button
 onClick={() => router.push('/membership')}
 className="px-6 py-3 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors"
 >
 View Membership Plans
 </button>
 </div>
 </div>
 );
 }

 return <DynamicDiscoverContent userId={userProfile.id} />;
}