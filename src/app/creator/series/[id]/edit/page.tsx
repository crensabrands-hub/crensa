"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { CreatorProtectedRoute } from "@/components/layout/ProtectedRoute";
import { SeriesEditForm } from "@/components/creator/series";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Series } from "@/types";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

function EditSeriesContent() {
 const params = useParams();
 const router = useRouter();
 const { userProfile } = useAuthContext();
 const [series, setSeries] = useState<Series | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 const seriesId = params.id as string;

 useEffect(() => {
 const loadSeries = async () => {
 if (!seriesId || !userProfile) return;

 setLoading(true);
 try {
 const response = await fetch(`/api/series/${seriesId}`);
 if (!response.ok) {
 throw new Error("Series not found");
 }
 const data = await response.json();

 if (data.series.creatorId !== userProfile.id) {
 throw new Error("You don't have permission to edit this series");
 }
 
 setSeries(data.series);
 } catch (error) {
 console.error("Failed to load series:", error);
 setError(error instanceof Error ? error.message : "Failed to load series");
 } finally {
 setLoading(false);
 }
 };

 loadSeries();
 }, [seriesId, userProfile]);

 const handleSeriesSaved = (updatedSeries: Series) => {
 setSeries(updatedSeries);

 setTimeout(() => {
 router.push("/creator/series");
 }, 1500);
 };

 const handleCancel = () => {
 router.push("/creator/series");
 };

 if (loading) {
 return <LoadingScreen message="Loading series..." variant="dashboard" fullScreen={false} />;
 }

 if (error || !series) {
 return (
 <div className="container mx-auto px-4 py-6">
 <div className="max-w-4xl mx-auto">
 <div className="text-center py-12">
 <p className="text-red-600 mb-4">{error || "Series not found"}</p>
 <button
 onClick={() => router.push("/creator/series")}
 className="btn-primary"
 >
 Back to Series
 </button>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="container mx-auto px-4 py-6">
 <div className="max-w-4xl mx-auto space-y-6">
 {}
 <div className="flex items-center gap-4">
 <button
 onClick={() => router.push("/creator/series")}
 className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
 >
 <ArrowLeftIcon className="w-5 h-5" />
 </button>
 <div>
 <h1 className="text-2xl font-bold text-gray-900">Edit Series</h1>
 <p className="text-gray-600">{series.title}</p>
 </div>
 </div>

 {}
 <SeriesEditForm
 series={series}
 onSave={handleSeriesSaved}
 onCancel={handleCancel}
 />
 </div>
 </div>
 );
}

export default function EditSeriesPage() {
 return (
 <CreatorProtectedRoute>
 <EditSeriesContent />
 </CreatorProtectedRoute>
 );
}
