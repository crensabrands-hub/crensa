"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { CreatorProtectedRoute } from "@/components/layout/ProtectedRoute";
import { SeriesDashboard } from "@/components/creator/series";

function CreatorSeriesContent() {
 const { userProfile } = useAuthContext();

 if (!userProfile) {
 return null;
 }

 return (
 <div className="container mx-auto px-4 py-6">
 <SeriesDashboard creatorId={userProfile.id} />
 </div>
 );
}

export default function CreatorSeriesPage() {
 return (
 <CreatorProtectedRoute>
 <CreatorSeriesContent />
 </CreatorProtectedRoute>
 );
}