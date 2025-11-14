"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoadingScreen } from "@/components/ui/LoadingScreen";

import { MemberDashboardPage } from "@/components/member/MemberDashboardPage";

function DashboardPage() {
 const { userProfile, isLoading, hasRole } = useAuthContext();
 const router = useRouter();

 useEffect(() => {
 if (!isLoading && userProfile) {

 if (hasRole("creator")) {
 router.push("/creator/dashboard");
 return;
 }
 }
 }, [userProfile, isLoading, hasRole, router]);

 if (isLoading) {
 return <LoadingScreen message="Setting up your dashboard..." variant="dashboard" />;
 }

 if (!userProfile) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-neutral-gray">
 <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray p-8 text-center">
 <div className="text-primary-navy text-xl font-semibold mb-4">
 Profile Setup Required
 </div>
 <p className="text-neutral-dark-gray">
 Please complete your profile setup to continue
 </p>
 </div>
 </div>
 );
 }

 if (hasRole("member")) {
 return <MemberDashboardPage />;
 }

 return (
 <div className="min-h-screen bg-neutral-gray">
 <div className="container mx-auto px-4 py-8">
 <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray p-8">
 <h1 className="text-3xl font-bold text-primary-navy mb-6">
 Welcome back, {userProfile.username}!
 </h1>

 <div className="text-center">
 <p className="text-neutral-dark-gray mb-4">
 Setting up your personalized experience...
 </p>
 </div>
 </div>
 </div>
 </div>
 );
}
export default DashboardPage;
