"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import MemberLayout from "@/components/layout/MemberLayout";

import { MemberPreferences } from "@/components/member/MemberPreferences";

function PreferencesPage() {
 const { userProfile, isLoading, hasRole } = useAuthContext();
 const router = useRouter();

 useEffect(() => {
 if (!isLoading && userProfile) {

 if (hasRole("creator")) {
 router.push("/creator/preferences");
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
 You need to be a member to access preferences
 </p>
 </div>
 </div>
 </MemberLayout>
 );
 }

 return (
 <MemberLayout showSidebar={true}>
 <MemberPreferences />
 </MemberLayout>
 );
}

export default PreferencesPage;