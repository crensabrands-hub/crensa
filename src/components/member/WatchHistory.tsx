"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface WatchHistoryItem {
    id: string;
    videoId: string;
    title: string;
    creator: string;
    thumbnail: string;
    watchedAt: string;
    duration: number;
    watchProgress: number; // percentage watched
    category: string;
}

interface WatchHistoryComponentProps {
    className?: string;
}

export function WatchHistoryComponent({
    className = "",
}: WatchHistoryComponentProps) {
    const [history, setHistory] = useState<WatchHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");

    useEffect(() => {
        fetchWatchHistory();
    }, []);

    const fetchWatchHistory = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/member/watch-history", {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error("Failed to fetch watch history");
            }

            const data = await response.json();
            setHistory(data.history || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60 * 60)
        );

        if (diffInHours < 1) return "Just now";
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return `${Math.floor(diffInHours / 168)}w ago`;
    };

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    const filteredHistory = history.filter((item) => {
        const matchesSearch =
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.creator.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            filterCategory === "all" || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = [
        "all",
        ...Array.from(new Set(history.map((item) => item.category))),
    ];

    const clearHistory = async () => {
        if (
            confirm(
                "Are you sure you want to clear your watch history? This action cannot be undone."
            )
        ) {
            try {
                const response = await fetch("/api/member/watch-history", {
                    method: "DELETE",
                });

                if (response.ok) {
                    setHistory([]);
                }
            } catch (err) {
                console.error("Failed to clear history:", err);
            }
        }
    };

    if (loading) {
        return (
            <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray h-full">
                <div className={`p-6 space-y-6 ${className}`}>
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex space-x-4">
                                    <div className="w-32 h-20 bg-gray-200 rounded"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && history.length === 0) {
        return (
            <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray h-full">
                <div className={`p-6 ${className}`}>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-red-800 mb-2">
                            Error Loading History
                        </h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button onClick={fetchWatchHistory} className="btn-primary">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray h-full">
            <div className={`p-6 space-y-6 ${className}`}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-navy mb-2">
                            Watch History
                        </h1>
                        <p className="text-neutral-dark-gray">
                            View and manage your recently watched content
                        </p>
                    </div>

                    {history.length > 0 && (
                        <button
                            onClick={clearHistory}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                            Clear All History
                        </button>
                    )}
                </div>

                {/* Filters */}
                {history.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search your history..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-neutral-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                            />
                        </div>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2 border border-neutral-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                        >
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category === "all" ? "All Categories" : category}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* List */}
                {filteredHistory.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-neutral-light-gray rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-neutral-dark-gray"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-dark-gray mb-2">
                            {searchTerm || filterCategory !== "all"
                                ? "No matching videos found"
                                : "No watch history yet"}
                        </h3>
                        <p className="text-neutral-dark-gray mb-4">
                            {searchTerm || filterCategory !== "all"
                                ? "Try adjusting your search or filter criteria"
                                : "Start watching videos to build your history"}
                        </p>
                        {!searchTerm && filterCategory === "all" && (
                            <Link href="/discover" className="btn-primary">
                                Discover Videos
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredHistory.map((item) => (
                            <div
                                key={item.id}
                                className="flex space-x-4 p-4 border border-neutral-light-gray rounded-lg hover:bg-neutral-light-gray/50 transition-colors"
                            >
                                {/* Thumbnail */}
                                <div className="relative flex-shrink-0">
                                    <Image
                                        src={item.thumbnail}
                                        alt={item.title}
                                        width={128}
                                        height={80}
                                        className="w-32 h-20 object-cover rounded-lg"
                                        unoptimized
                                    />
                                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                                        {formatDuration(item.duration)}
                                    </div>
                                    {/* Watch Progress */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-25 rounded-b-lg">
                                        <div
                                            className="h-full bg-primary-blue rounded-b-lg"
                                            style={{ width: `${item.watchProgress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Content Info */}
                                <div className="flex-1 min-w-0">
                                    <Link
                                        href={`/watch/${item.videoId}`}
                                        className="block hover:text-primary-blue transition-colors"
                                    >
                                        <h3 className="font-semibold text-primary-navy line-clamp-2 mb-1">
                                            {item.title}
                                        </h3>
                                    </Link>
                                    <p className="text-sm text-neutral-dark-gray mb-1">
                                        {item.creator}
                                    </p>
                                    <div className="flex items-center space-x-2 text-xs text-neutral-dark-gray">
                                        <span>{formatTimeAgo(item.watchedAt)}</span>
                                        <span>•</span>
                                        <span>{item.category}</span>
                                        <span>•</span>
                                        <span>{item.watchProgress}% watched</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex-shrink-0">
                                    <button
                                        onClick={() => {
                                            setHistory((prev) =>
                                                prev.filter((h) => h.id !== item.id)
                                            );
                                        }}
                                        className="p-2 text-neutral-dark-gray hover:text-red-600 transition-colors"
                                        title="Remove from history"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
