"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { CreatorProtectedRoute } from "@/components/layout/ProtectedRoute";
import { SeriesAnalytics } from "@/components/creator/series";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

function CreatorSeriesAnalyticsContent() {
 const params = useParams();
 const router = useRouter();
 const { userProfile } = useAuthContext();

 const seriesId = params.id as string;

 if (!userProfile || !seriesId) {
 return null;
 }

 return (
 <div className="container mx-auto px-4 py-6 space-y-6">
 {}
 <div className="flex items-center gap-4">
 <button
 onClick={() => router.push("/creator/series")}
 className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
 >
 <ArrowLeftIcon className="w-5 h-5" />
 </button>
 <div>
 <h1 className="text-2xl font-bold text-gray-900">Series Analytics</h1>
 <p className="text-gray-600">Detailed performance insights</p>
 </div>
 </div>

 {}
 <SeriesAnalytics seriesId={seriesId} />
 </div>
 );
}

export default function CreatorSeriesAnalyticsPage() {
 return (
 <CreatorProtectedRoute>
 <CreatorSeriesAnalyticsContent />
 </CreatorProtectedRoute>
 );
}