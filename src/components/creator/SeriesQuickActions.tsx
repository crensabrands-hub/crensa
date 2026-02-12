"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusIcon, ChartBarIcon, EyeIcon } from "@heroicons/react/24/outline";
import { SeriesCreationModal } from "@/components/creator/series";
import { Series } from "@/types";

interface SeriesQuickActionsProps {
    onSeriesCreated?: (series: Series) => void;
}

export default function SeriesQuickActions({ onSeriesCreated }: SeriesQuickActionsProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const handleSeriesCreated = (series: Series) => {
        setShowCreateModal(false);
        onSeriesCreated?.(series);
    };

    return (
        <>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Series Management</h3>
                        <p className="text-sm text-gray-600">
                            Organize your videos into series to increase earnings
                        </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                        <ChartBarIcon className="w-6 h-6 text-purple-600" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Create Series
                    </button>

                    <Link
                        href="/creator/series"
                        className="flex items-center gap-2 px-4 py-3 bg-white text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
                    >
                        <EyeIcon className="w-4 h-4" />
                        Manage Series
                    </Link>

                    <Link
                        href="/creator/analytics"
                        className="flex items-center gap-2 px-4 py-3 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        <ChartBarIcon className="w-4 h-4" />
                        View Analytics
                    </Link>
                </div>
            </div>

            { }
            <SeriesCreationModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSeriesCreated={handleSeriesCreated}
            />
        </>
    );
}