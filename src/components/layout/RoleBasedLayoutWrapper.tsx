"use client";

import React, { ReactNode, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLayout } from "@/contexts/LayoutContext";
import CreatorLayout from "./CreatorLayout";
import MemberLayout from "./MemberLayout";
import {
    LayoutLoading,
    LayoutTransition,
    ProgressiveLayoutLoader,
    FastLoadingIndicator,
} from "./LayoutUtils";
import { LayoutErrorBoundary } from "./LayoutErrorBoundary";
import { AnimatedTextLoader } from "../ui/AnimatedTextLoader";

export type LayoutType = "creator" | "member" | "public";

export interface LayoutConfig {
    header?: React.ComponentType<any>;
    sidebar?: React.ComponentType<any>;
    footer?: React.ComponentType<any>;
    defaultRoute: string;
    showSidebar: boolean;
    requiresAuth: boolean;
}

interface RoleBasedLayoutWrapperProps {
    children: ReactNode;
}

const CREATOR_STUDIO_SEGMENTS = new Set([
    "dashboard",
    "upload",
    "videos",
    "series",
    "analytics",
    "earnings",
    "settings",
    "help",
    "support",
    "resources",
    "guidelines",
]);

const ROUTE_PATTERNS = {
    creator: [
        "/creator/dashboard",
        "/creator/upload",
        "/creator/videos",
        "/creator/series",
        "/creator/analytics",
        "/creator/earnings",
        "/creator/settings",
        "/creator/help",
        "/creator/support",
        "/creator/resources",
        "/creator/guidelines",
    ],
    member: [
        "/dashboard",
        "/profile",
        "/settings",
        "/notifications",
        "/watch",
        "/discover",
        "/wallet",
        "/membership",
        "/reels",
    ],
    public: [
        "/",
        "/sign-in",
        "/sign-up",
        "/onboarding",
        "/about",
        "/contact",
        "/privacy",
        "/terms",
        "/payment",
        "/creator-landing",
        "/member-landing",
    ],
} as const;

const LAYOUT_CONFIGS: Record<LayoutType, LayoutConfig> = {
    creator: {
        header: React.lazy(() => import("./CreatorHeader")),
        sidebar: React.lazy(() => import("./CreatorSidebar")),
        defaultRoute: "/creator/dashboard",
        showSidebar: true,
        requiresAuth: true,
    },
    member: {
        header: React.lazy(() => import("./MemberHeader")),
        sidebar: React.lazy(() => import("./MemberSidebar")),
        defaultRoute: "/dashboard",
        showSidebar: true,
        requiresAuth: true,
    },
    public: {
        defaultRoute: "/",
        showSidebar: false,
        requiresAuth: false,
    },
};

function getLayoutFromPath(pathname: string): LayoutType {

    const landingPages = ["/", "/creator-landing", "/member-landing"];
    if (landingPages.includes(pathname)) {
        return "public";
    }

    if (pathname === "/creator") {
        return "public";
    }

    if (pathname.startsWith("/creator/")) {
        const segment = pathname.split("/")[2] || "";
        return CREATOR_STUDIO_SEGMENTS.has(segment) ? "creator" : "public";
    }

    if (ROUTE_PATTERNS.creator.some((pattern) => pathname.startsWith(pattern))) {
        return "creator";
    }

    if (ROUTE_PATTERNS.member.some((pattern) => pathname.startsWith(pattern))) {
        return "member";
    }

    if (ROUTE_PATTERNS.public.some((pattern) => pathname.startsWith(pattern))) {
        return "public";
    }

    return "public";
}

function determineLayout(
    userRole: "creator" | "member" | null,
    pathname: string,
    isAuthenticated: boolean
): LayoutType {
    const routeBasedLayout = getLayoutFromPath(pathname);

    if (!isAuthenticated) {
        return "public";
    }

    if (routeBasedLayout === "creator" && userRole === "creator") {
        return "creator";
    }

    if (routeBasedLayout === "member" && userRole === "member") {
        return "member";
    }

    if (routeBasedLayout === "public") {
        return "public";
    }

    return routeBasedLayout;
}

function getRedirectRoute(
    userRole: "creator" | "member" | null,
    currentPath: string,
    expectedLayout: LayoutType
): string | null {

    if (!userRole) {
        return null;
    }

    const userLayout = userRole === "creator" ? "creator" : "member";
    if (expectedLayout === userLayout) {
        return null;
    }

    if (userRole === "member" && expectedLayout === "creator") {
        return LAYOUT_CONFIGS.member.defaultRoute;
    }

    if (userRole === "creator" && expectedLayout === "member") {

        const allowedMemberRoutes = [
            "/profile",
            "/settings",
            "/notifications",
            "/wallet",
        ];
        if (allowedMemberRoutes.some((route) => currentPath.startsWith(route))) {
            return null;
        }
        return LAYOUT_CONFIGS.creator.defaultRoute;
    }

    return null;
}

export default function RoleBasedLayoutWrapper({
    children,
}: RoleBasedLayoutWrapperProps) {
    const pathname = usePathname();
    const router = useRouter();
    const {
        user,
        userProfile,
        isLoading: authLoading,
        isSignedIn,
    } = useAuthContext();
    const {
        currentLayout,
        isLayoutLoading,
        setActiveRoute,
        setBreadcrumbs,
        clearError,
    } = useLayout();

    const [isInitialLoad, setIsInitialLoad] = React.useState(true);
    const [showFastLoading, setShowFastLoading] = React.useState(false);

    React.useEffect(() => {

        const timer = setTimeout(() => setIsInitialLoad(false), 100);
        return () => clearTimeout(timer);
    }, []);

    const userRole = useMemo(() => {
        if (!userProfile) return null;
        return userProfile.role;
    }, [userProfile]);

    const expectedLayout = useMemo(() => {
        return determineLayout(userRole, pathname, isSignedIn);
    }, [userRole, pathname, isSignedIn]);

    const redirectRoute = useMemo(() => {
        return getRedirectRoute(userRole, pathname, expectedLayout);
    }, [userRole, pathname, expectedLayout]);

    useEffect(() => {
        if (redirectRoute && !authLoading) {
            setShowFastLoading(true);
            router.push(redirectRoute);

            const timer = setTimeout(() => setShowFastLoading(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [redirectRoute, authLoading, router]);

    useEffect(() => {
        setActiveRoute(pathname);
    }, [pathname, setActiveRoute]);

    useEffect(() => {
        const generateBreadcrumbs = () => {
            const pathSegments = pathname.split("/").filter(Boolean);
            const breadcrumbs: Array<{
                label: string;
                href: string;
                active: boolean;
            }> = [];

            if (expectedLayout === "creator") {

                breadcrumbs.push({
                    label: "Creator Studio",
                    href: "/creator/dashboard",
                    active: pathname === "/creator/dashboard",
                });

                if (pathSegments.length > 1) {
                    const creatorSegments = pathSegments.slice(1); // Skip 'creator'

                    creatorSegments.forEach((segment, index) => {
                        if (segment === "dashboard") return; // Skip dashboard as it's already handled

                        const href = "/creator/" + creatorSegments.slice(0, index + 1).join("/");
                        const isLast = index === creatorSegments.length - 1;

                        let label = segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ");
                        switch (segment) {
                            case "upload":
                                label = "Upload Video";
                                break;
                            case "videos":
                                label = "Manage Videos";
                                break;
                            case "analytics":
                                label = "Analytics";
                                break;
                            case "earnings":
                                label = "Earnings";
                                break;
                            case "settings":
                                label = "Settings";
                                break;
                        }

                        breadcrumbs.push({
                            label,
                            href,
                            active: isLast,
                        });
                    });
                }
            } else if (expectedLayout === "member") {

                if (pathname !== "/dashboard") {
                    breadcrumbs.push({
                        label: "Dashboard",
                        href: "/dashboard",
                        active: false,
                    });

                    pathSegments.forEach((segment, index) => {
                        if (segment === "dashboard") return;

                        const href = "/" + pathSegments.slice(0, index + 1).join("/");
                        const label =
                            segment.charAt(0).toUpperCase() +
                            segment.slice(1).replace("-", " ");
                        breadcrumbs.push({
                            label,
                            href,
                            active: index === pathSegments.length - 1,
                        });
                    });
                }
            }

            setBreadcrumbs(breadcrumbs);
        };

        generateBreadcrumbs();
    }, [pathname, expectedLayout, setBreadcrumbs]);

    useEffect(() => {
        clearError();
    }, [pathname, clearError]);

    if (isLayoutLoading || authLoading) {
        return (
            <>
                {showFastLoading && <FastLoadingIndicator message="Loading..." />}
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-neutral-gray via-white to-neutral-light-gray">
                    <div className="w-full max-w-md px-8">
                        <AnimatedTextLoader text="CRENSA" />
                    </div>
                </div>
            </>
        );
    }

    if (redirectRoute) {
        return (
            <>
                <FastLoadingIndicator message="Redirecting to dashboard..." />
                <LayoutLoading
                    message="Redirecting..."
                    layoutType={expectedLayout}
                    showMinimal={true}
                    isInitialLoad={false}
                />
            </>
        );
    }

    if (LAYOUT_CONFIGS[expectedLayout].requiresAuth && !isSignedIn) {
        return (
            <LayoutErrorBoundary>
                <div className="min-h-screen flex items-center justify-center bg-neutral-gray">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="mb-4">
                            <svg
                                className="mx-auto h-12 w-12 text-amber-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Authentication Required
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Please sign in to access this page.
                        </p>
                        <div className="space-y-2">
                            <button
                                onClick={() => router.push("/sign-in")}
                                className="w-full bg-primary-navy text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => router.push("/")}
                                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            </LayoutErrorBoundary>
        );
    }

    if (
        isSignedIn &&
        userRole &&
        expectedLayout === "creator" &&
        userRole !== "creator"
    ) {
        return (
            <LayoutErrorBoundary>
                <div className="min-h-screen flex items-center justify-center bg-neutral-gray">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="mb-4">
                            <svg
                                className="mx-auto h-12 w-12 text-amber-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Access Restricted
                        </h2>
                        <p className="text-gray-600 mb-4">
                            This area is only available to creators. Please upgrade your
                            account to access creator features.
                        </p>
                        <div className="space-y-2">
                            <button
                                onClick={() => router.push(LAYOUT_CONFIGS.member.defaultRoute)}
                                className="w-full bg-primary-navy text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                            >
                                Go to Dashboard
                            </button>
                            <button
                                onClick={() => router.push("/")}
                                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            </LayoutErrorBoundary>
        );
    }

    return (
        <LayoutErrorBoundary>
            {showFastLoading && <FastLoadingIndicator message="Loading..." />}
            <LayoutTransition
                currentLayout={currentLayout}
                expectedLayout={expectedLayout}
            >
                <ProgressiveLayoutLoader
                    layoutType={expectedLayout}
                    isAuthenticated={isSignedIn}
                    userRole={userRole}
                >
                    {(() => {
                        switch (expectedLayout) {
                            case "creator":
                                return <CreatorLayout>{children}</CreatorLayout>;

                            case "member":
                                return (
                                    <MemberLayout showSidebar={true}>{children}</MemberLayout>
                                );

                            case "public":
                            default:

                                return <>{children}</>;
                        }
                    })()}
                </ProgressiveLayoutLoader>
            </LayoutTransition>
        </LayoutErrorBoundary>
    );
}
