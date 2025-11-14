"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuthContext } from "@/contexts/AuthContext";
import { MemberLayout } from "@/components";

import { MemberAnalytics } from "@/components/member/MemberAnalytics";

function AnalyticsPage() {
 const { userProfile, isLoading, hasRole } = useAuthContext();
 const router = useRouter();

 useEffect(() => {
 if (!isLoading && userProfile) {

 if (hasRole("creator")) {
 router.push("/creator/analytics");
 return;
 }

 if (!hasRole("member")) {
 router.push("/");
 return;
 }
 }
 }, [userProfile, isLoading, hasRole, router]);

 if (isLoading) {
 return (
 <MemberLayout showSidebar={true}>
 <div className="p-6">
 <div className="text-primary-navy text-xl font-semibold">Loading...</div>
 </div>
 </MemberLayout>
 );
 }

 if (!userProfile || !hasRole("member")) {
 return (
 <MemberLayout showSidebar={true}>
 <div className="p-6">
 <div className="text-center">
 <div className="text-primary-navy text-xl font-semibold mb-4">
 Access Denied
 </div>
 <p className="text-neutral-dark-gray">
 You need to be a member to access analytics
 </p>
 </div>
 </div>
 </MemberLayout>
 );
 }

 return (
 <MemberLayout showSidebar={true}>
 <MemberAnalytics />
 </MemberLayout>
 );
}

export default AnalyticsPage;