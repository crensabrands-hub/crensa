"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { MemberDashboardPage } from "@/components/member/MemberDashboardPage";

function DashboardPage() {
    const { userProfile, isLoading, hasRole, error } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;
        if (userProfile && hasRole("creator")) {
            router.push("/creator/dashboard");
        }
    }, [userProfile, isLoading, hasRole, router]);

    if (isLoading || (!userProfile && !error)) {
        return <LoadingScreen message="Setting up your dashboard..." variant="dashboard" />;
    }

    if (error && !userProfile) {
        return (
            <div className="min-h-screen bg-neutral-gray flex items-center justify-center">
                <div className="text-center">
                    <p className="text-neutral-dark-gray mb-4">Having trouble loading your profile. Please refresh the page.</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary-navy text-white rounded-lg">
                        Refresh
                    </button>
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
                        Welcome back, {userProfile?.username}!
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
