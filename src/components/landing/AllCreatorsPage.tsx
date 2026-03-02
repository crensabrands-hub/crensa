'use client';

import { useState, useEffect } from 'react';
import { TrendingCreator } from '@/types';
import TrendingCreatorCard from './TrendingCreatorCard';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface AllCreatorsPageProps {
    limit?: number;
}

export default function AllCreatorsPage({ limit = 50 }: AllCreatorsPageProps) {
    const [creators, setCreators] = useState<TrendingCreator[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCreators = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/landing/trending-creators?limit=${limit}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch creators: ${response.status}`);
                }

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || 'Failed to fetch creators');
                }

                setCreators(data.data || []);
            } catch (err) {
                console.error('Error fetching creators:', err);
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
                setCreators([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCreators();
    }, [limit]);

    const handleRetry = () => {
        // Trigger refetch by resetting state
        setLoading(true);
        setError(null);
        setCreators([]);
    };

    if (loading) {
        return <AllCreatorsSkeleton />;
    }

    if (error) {
        return (
            <div className="bg-gradient-to-br from-white to-neutral-gray rounded-3xl p-12 text-center shadow-md border border-neutral-light-gray">
                <div className="text-primary-navy mb-6">
                    <p className="text-xl font-bold mb-3">Unable to load creators</p>
                    <p className="text-base text-neutral-dark-gray">{error}</p>
                </div>
                <button
                    onClick={handleRetry}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-accent-pink to-accent-bright-pink text-white font-bold rounded-2xl hover:from-accent-bright-pink hover:to-accent-pink transition-all duration-300 transform hover:scale-105"
                >
                    <ArrowPathIcon className="w-5 h-5" />
                    Try Again
                </button>
            </div>
        );
    }

    if (!creators || creators.length === 0) {
        return (
            <div className="bg-gradient-to-br from-white to-neutral-gray rounded-3xl p-12 text-center shadow-md border border-neutral-light-gray">
                <p className="text-xl font-bold text-primary-navy mb-3">No creators found</p>
                <p className="text-base text-neutral-dark-gray">
                    Check back later for more creators
                </p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-primary-navy mb-2 mt-4">
                    Discover All Creators
                </h1>
                <p className="text-lg text-neutral-dark-gray">
                    Explore amazing content from {creators.length} talented creators
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {creators.map((creator) => (
                    <TrendingCreatorCard
                        key={creator.id}
                        creator={creator}
                    />
                ))}
            </div>
        </div>
    );
}

function AllCreatorsSkeleton() {
    return (
        <div className="w-full">
            <div className="mb-8">
                <div className="h-10 bg-gradient-to-r from-neutral-gray to-neutral-light-gray rounded-xl w-64 mb-3 animate-pulse" />
                <div className="h-6 bg-gradient-to-r from-neutral-gray to-neutral-light-gray rounded-lg w-96 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="bg-gradient-to-br from-white to-neutral-gray rounded-3xl shadow-md p-8 animate-pulse border border-neutral-light-gray">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-neutral-gray to-neutral-light-gray rounded-full mb-5" />

                            <div className="mb-4">
                                <div className="h-6 bg-gradient-to-r from-neutral-gray to-neutral-light-gray rounded-xl w-28 mb-3 mx-auto" />
                                <div className="h-4 bg-gradient-to-r from-neutral-gray to-neutral-light-gray rounded-lg w-20 mx-auto" />
                            </div>

                            <div className="h-7 bg-gradient-to-r from-neutral-gray to-neutral-light-gray rounded-full w-24 mb-5" />

                            <div className="flex justify-between items-center w-full mb-5">
                                <div className="text-center flex-1">
                                    <div className="h-6 bg-gradient-to-r from-neutral-gray to-neutral-light-gray rounded-lg w-10 mb-2 mx-auto" />
                                    <div className="h-4 bg-gradient-to-r from-neutral-gray to-neutral-light-gray rounded w-14 mx-auto" />
                                </div>
                                <div className="w-px h-10 bg-neutral-light-gray"></div>
                                <div className="text-center flex-1">
                                    <div className="h-6 bg-gradient-to-r from-neutral-gray to-neutral-light-gray rounded-lg w-10 mb-2 mx-auto" />
                                    <div className="h-4 bg-gradient-to-r from-neutral-gray to-neutral-light-gray rounded w-12 mx-auto" />
                                </div>
                            </div>

                            <div className="h-10 bg-gradient-to-r from-neutral-gray to-neutral-light-gray rounded-2xl w-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
