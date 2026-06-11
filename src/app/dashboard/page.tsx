"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { LoadingScreen } from "@/components/ui/LoadingScreen";

import { MemberDashboardPage } from "@/components/member/MemberDashboardPage";

function DashboardPage() {
    const { userProfile, isLoading, hasRole, retry } = useAuthContext();
    const router = useRouter();
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        if (isLoading) return;

        if (userProfile) {
            if (hasRole("creator")) {
                router.push("/creator/dashboard");
            }
            return;
        }

        // Profile not loaded yet — retry up to 3 times before giving up
        if (retryCount < 3) {
            const timer = setTimeout(() => {
                retry();
                setRetryCount(c => c + 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [userProfile, isLoading, hasRole, router, retry, retryCount]);

    if (isLoading || !userProfile) {
        return <LoadingScreen message="Setting up your dashboard..." variant="dashboard" />;
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
