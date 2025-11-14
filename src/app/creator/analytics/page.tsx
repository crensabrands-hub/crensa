"use client";

import { useSearchParams } from "next/navigation";
import { CreatorProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AnalyticsErrorBoundary } from "@/components/creator/AnalyticsErrorBoundary";
import dynamic from "next/dynamic";
import { CreatorAnalytics } from "@/components";

function CreatorAnalyticsContent() {
 const searchParams = useSearchParams();
 const videoId = searchParams.get('videoId');

 return (
 <div className="space-y-6">
 <AnalyticsErrorBoundary>
 <CreatorAnalytics videoId={videoId || undefined} />
 </AnalyticsErrorBoundary>
 </div>
 );
}

function CreatorAnalyticsPage() {
 return (
 <CreatorProtectedRoute>
 <CreatorAnalyticsContent />
 </CreatorProtectedRoute>
 );
}

export default CreatorAnalyticsPage;