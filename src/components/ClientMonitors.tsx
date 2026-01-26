'use client';

import dynamic from 'next/dynamic';

const PerformanceMonitor = dynamic(
    () => import("@/components/PerformanceMonitor").then((mod) => mod.PerformanceMonitor),
    { ssr: false }
);

const ErrorReportingDashboard = dynamic(
    () => import("@/components/debug/ErrorReportingDashboard").then((mod) => mod.ErrorReportingDashboard),
    { ssr: false }
);

export function ClientMonitors() {
    return (
        <>
            <PerformanceMonitor />
            <ErrorReportingDashboard />
        </>
    );
}
