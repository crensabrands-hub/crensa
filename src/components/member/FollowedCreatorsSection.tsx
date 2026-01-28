"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";

interface Creator {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    bio: string;
    followerCount: number;
    videoCount: number;
    isFollowed: boolean;
}

interface FollowedCreatorsSectionProps {
    className?: string;
    limit?: number;
    showAll?: boolean;
}

export function FollowedCreatorsSection({
    className = "",
    limit = 5,
    showAll = false,
}: FollowedCreatorsSectionProps) {
    const { userProfile } = useAuthContext();
    const [creators, setCreators] = useState<Creator[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFollowedCreators = async () => {
            try {
                setLoading(true);
                // Only send limit if we're not showing all (when viewing full list)
                const queryParams = new URLSearchParams();
                if (!showAll) {
                    queryParams.append('limit', limit.toString());
                }

                const response = await fetch(`/api/member/following?${queryParams.toString()}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch followed creators");
                }

                const data = await response.json();
                setCreators(data.creators || []);
                setError(null);
            } catch (err) {
                console.error("Error fetching followed creators:", err);
                setError("Failed to load followed creators");
            } finally {
                setLoading(false);
            }
        };

        if (userProfile) {
            fetchFollowedCreators();
        }
    }, [userProfile, showAll, limit]);

    const handleUnfollow = async (creatorId: string) => {
        if (!confirm("Are you sure you want to unfollow this creator?")) return;

        try {
            const response = await fetch(`/api/interactions/follow`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ creatorId }),
            });

            if (!response.ok) {
                throw new Error("Failed to unfollow creator");
            }

            setCreators((prev) => prev.filter((c) => c.id !== creatorId));
        } catch (err) {
            console.error("Error unfollowing creator:", err);
            alert("Failed to unfollow creator. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className={`space-y-4 ${className}`}>
                <div className="flex justify-between items-center mb-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    {!showAll && <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>}
                </div>
                {[...Array(showAll ? 8 : limit)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-neutral-light-gray flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className={`text-center p-4 bg-red-50 rounded-lg text-red-600 ${className}`}>
                <p>{error}</p>
            </div>
        );
    }

    if (creators.length === 0) {
        return (
            <div className={`text-center py-8 text-neutral-dark-gray ${className}`}>
                <p className="mb-4">You haven&apos;t followed any creators yet.</p>
                <Link
                    href="/discover"
                    className="inline-block px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-dark-blue transition-colors"
                >
                    Discover Creators
                </Link>
            </div>
        );
    }

    const displayedCreators = showAll ? creators : creators.slice(0, limit);

    return (
        <div className={className}>
            {!showAll ? (
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-primary-navy">Following</h2>
                    {creators.length > limit && (
                        <Link
                            href="/member/following"
                            className="text-sm text-primary-blue hover:text-primary-dark-blue font-medium"
                        >
                            View All
                        </Link>
                    )}
                </div>
            ) : (
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary-navy">Creators You Follow</h1>
                    <p className="text-neutral-dark-gray">Manage your subscriptions and stay updated.</p>
                </div>
            )}

            <div className={`grid gap-4 ${showAll ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {displayedCreators.map((creator) => (
                    <div
                        key={creator.id}
                        className="bg-white rounded-lg p-4 shadow-sm border border-neutral-light-gray hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <Link href={`/profile/${creator.username}`} className="flex items-center space-x-3 group">
                                <div className="relative w-12 h-12">
                                    <Image
                                        src={creator.avatar}
                                        alt={creator.displayName || creator.username}
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 rounded-full object-cover group-hover:opacity-90 transition-opacity"
                                        unoptimized
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-primary-navy group-hover:text-primary-blue transition-colors line-clamp-1">
                                        {creator.displayName || creator.username}
                                    </h3>
                                    <p className="text-sm text-neutral-dark-gray">@{creator.username}</p>
                                </div>
                            </Link>
                            <button
                                onClick={() => handleUnfollow(creator.id)}
                                className="text-sm text-neutral-gray hover:text-red-600 font-medium px-3 py-1 rounded-full border border-neutral-light-gray hover:border-red-200 hover:bg-red-50 transition-all"
                            >
                                Unfollow
                            </button>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm text-neutral-dark-gray border-t border-neutral-light-gray pt-3">
                            <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span>{creator.followerCount.toLocaleString()} followers</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>{creator.videoCount} videos</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showAll && creators.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-neutral-dark-gray text-lg">You are not following any creators yet.</p>
                </div>
            )}
        </div>
    );
}