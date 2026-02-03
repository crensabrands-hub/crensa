"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Video } from "@/types";
import VideoGrid from "./VideoGrid";
import SearchFilters, {
    SearchFilters as SearchFiltersType,
} from "./SearchFilters";
import PopularSeries from "./PopularSeries";
import { useResponsive, useTouch } from "@/hooks/useResponsive";
import { debounce, throttle } from "@/lib/mobile-optimization";

interface DiscoverPageProps {
    userId: string;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}

export default function DiscoverPage({ userId }: DiscoverPageProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [videos, setVideos] = useState<Video[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<SearchFiltersType>({});
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasMore: false,
    });
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isCategoryLoading, setIsCategoryLoading] = useState(false);

    const { isMobile, isTablet, isTouchDevice } = useResponsive();
    const { touchHandlers, getSwipeDirection } = useTouch();

    const containerRef = useRef<HTMLDivElement>(null);
    const scrollPositionRef = useRef(0);

    const fetchVideos = useCallback(
        async (page: number = 1, resetVideos: boolean = true) => {
            try {
                if (resetVideos) {
                    setIsLoading(true);
                    setError(null);
                } else {
                    setIsLoadingMore(true);
                }

                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: pagination.limit.toString(),
                });

                if (searchQuery) {
                    params.append("search", searchQuery);
                }

                if (filters.category && filters.category !== "all") {
                    params.append("category", filters.category);
                }

                if (filters.sortBy) {
                    params.append("sortBy", filters.sortBy);
                }

                if (filters.duration) {
                    params.append("duration", filters.duration);
                }

                if (filters.creditRange) {
                    params.append("minCredits", filters.creditRange[0].toString());
                    params.append("maxCredits", filters.creditRange[1].toString());
                }

                console.log('Fetching videos with params:', {
                    page,
                    resetVideos,
                    searchQuery,
                    category: filters.category,
                    sortBy: filters.sortBy,
                    duration: filters.duration,
                    creditRange: filters.creditRange
                });

                const response = await fetch(
                    `/api/discover/videos?${params.toString()}`
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch videos: ${response.statusText}`);
                }

                const data = await response.json();

                console.log('Discover API response:', {
                    success: data.success,
                    videoCount: data.videos?.length || 0,
                    firstVideo: data.videos?.[0] || null,
                    pagination: data.pagination,
                    filters: data.filters
                });

                if (!data.success) {
                    throw new Error(data.error || 'Failed to fetch videos');
                }

                if (resetVideos) {
                    setVideos(data.videos || []);
                } else {
                    setVideos((prev) => [...prev, ...(data.videos || [])]);
                }

                setPagination(data.pagination || {
                    page: 1,
                    limit: 12,
                    total: 0,
                    totalPages: 0,
                    hasMore: false,
                });
            } catch (err) {
                console.error("Error fetching videos:", err);
                const errorMessage = err instanceof Error ? err.message : "Failed to load videos";
                setError(errorMessage);

                if (errorMessage.includes('category') || filters.category) {
                    setError(`No videos found in the ${filters.category || 'selected'} category. Try selecting a different category or clearing filters.`);
                }
            } finally {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        },
        [searchQuery, filters, pagination.limit]
    );

    useEffect(() => {
        fetchVideos(1, true);
    }, [fetchVideos]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {

            if (filters.category !== undefined) {
                setIsCategoryLoading(true);
            }

            fetchVideos(1, true).finally(() => {
                setIsCategoryLoading(false);
            });
        }, 300); // Debounce API calls

        return () => clearTimeout(timeoutId);
    }, [searchQuery, filters, fetchVideos]);

    const handleVideoClick = (video: Video) => {
        try {
            console.log('Navigating to video:', video.id, video.title);

            if (!video.id || video.id.trim() === '') {
                console.error('Invalid video ID:', video);
                setError('Invalid video selected');
                return;
            }

            router.push(`/watch/${video.id}`);
        } catch (error) {
            console.error('Error navigating to video:', error);
            setError('Failed to navigate to video');
        }
    };

    const handleLoadMore = useCallback(() => {
        if (!pagination.hasMore || isLoadingMore) return;
        fetchVideos(pagination.page + 1, false);
    }, [pagination.hasMore, pagination.page, isLoadingMore, fetchVideos]);

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
    };

    const handleFiltersChange = (
        newFilters: SearchFiltersType & { searchQuery: string }
    ) => {
        const { searchQuery: query, ...filterData } = newFilters;
        setSearchQuery(query);
        setFilters(filterData);
    };

    const handlePullToRefresh = useCallback(async () => {
        if (!isMobile || isRefreshing || isLoading) return;

        setIsRefreshing(true);
        try {
            await fetchVideos(1, true);
        } finally {
            setIsRefreshing(false);
        }
    }, [isMobile, isRefreshing, isLoading, fetchVideos]);

    const handleTouchEnd = useCallback(() => {
        const swipeData = getSwipeDirection();
        if (swipeData?.isDownSwipe && scrollPositionRef.current <= 0) {
            handlePullToRefresh();
        }
    }, [getSwipeDirection, handlePullToRefresh]);

    const scrollToTop = () => {
        if (containerRef.current) {
            containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleScroll = useCallback(() => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        scrollPositionRef.current = scrollY;
        setShowScrollTop(scrollY > 400);

        if (isMobile && pagination.hasMore && !isLoadingMore) {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY;

            if (scrollTop + windowHeight >= documentHeight - 200) {
                handleLoadMore();
            }
        }
    }, [isMobile, pagination.hasMore, isLoadingMore, handleLoadMore]);

    // Throttled scroll handler using ref
    const scrollTimeoutRef = useRef<number | null>(null);
    
    const throttledHandleScroll = useCallback(() => {
        if (scrollTimeoutRef.current !== null) return;
        
        scrollTimeoutRef.current = window.setTimeout(() => {
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            scrollPositionRef.current = scrollY;
            setShowScrollTop(scrollY > 400);

            if (isMobile && pagination.hasMore && !isLoadingMore) {
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;
                const scrollTop = window.scrollY;

                if (scrollTop + windowHeight >= documentHeight - 200) {
                    handleLoadMore();
                }
            }
            
            scrollTimeoutRef.current = null;
        }, 100);
    }, [isMobile, pagination.hasMore, isLoadingMore, handleLoadMore]);

    useEffect(() => {
        if (isMobile) {
            window.addEventListener('scroll', throttledHandleScroll, { passive: true });
            return () => window.removeEventListener('scroll', throttledHandleScroll);
        }
    }, [isMobile, throttledHandleScroll]);

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    { }
                    <div className="mb-8">
                        <div className="h-8 bg-neutral-light-gray rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-neutral-light-gray rounded w-2/3"></div>
                    </div>

                    { }
                    <div className="mb-8 space-y-6">
                        { }
                        <div className="h-16 bg-neutral-light-gray rounded-xl"></div>

                        { }
                        <div className="flex gap-3">
                            <div className="h-10 bg-neutral-light-gray rounded-lg w-32"></div>
                            <div className="h-10 bg-neutral-light-gray rounded-lg w-24"></div>
                            <div className="h-10 bg-neutral-light-gray rounded-lg w-20"></div>
                        </div>

                        { }
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-10 bg-neutral-light-gray rounded-full w-24"
                                ></div>
                            ))}
                        </div>
                    </div>

                    { }
                    <VideoGrid videos={[]} isLoading={true} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-primary-navy mb-2">
                        Oops! Something went wrong
                    </h2>
                    <p className="text-neutral-dark-gray mb-6">{error}</p>
                    <button
                        onClick={() => fetchVideos(1, true)}
                        className="px-6 py-3 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-3 sm:p-4 md:p-6 relative"
            {...(isMobile && isTouchDevice ? {
                ...touchHandlers,
                onTouchEnd: handleTouchEnd
            } : {})}
            style={{
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
            }}
        >
            { }
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-navy mb-2">
                    Discover Amazing Content
                </h1>
                <p className="text-sm sm:text-base text-neutral-dark-gray">
                    Explore trending videos, discover new creators, and find content that
                    matches your interests
                </p>
            </div>

            { }
            <div className="mb-6 sm:mb-8">
                <SearchFilters
                    onFiltersChange={handleFiltersChange}
                    onSearchChange={handleSearchChange}
                    initialFilters={filters}
                    initialSearchQuery={searchQuery}
                    isLoading={isLoading || isCategoryLoading}
                />
            </div>

            { }
            {!searchQuery && !filters.category && !filters.sortBy && !filters.duration && !filters.creditRange && (
                <PopularSeries />
            )}

            { }
            {!isLoading && videos.length > 0 && (
                <div className="mb-4 sm:mb-6">
                    <p className="text-sm sm:text-base text-neutral-dark-gray">
                        Showing {videos.length} of {pagination.total} videos
                        {searchQuery && ` for "${searchQuery}"`}
                        {filters.category &&
                            filters.category !== "all" &&
                            ` in ${filters.category}`}
                    </p>
                </div>
            )}

            { }
            {!isLoading && videos.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                    <div className="text-neutral-dark-gray text-4xl sm:text-6xl mb-4">🔍</div>
                    <h3 className="text-lg sm:text-xl font-semibold text-primary-navy mb-2">
                        No videos found
                    </h3>
                    <p className="text-sm sm:text-base text-neutral-dark-gray mb-6 px-4">
                        Try adjusting your search terms or filters to find more content.
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setFilters({});
                        }}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-primary-neon-yellow text-primary-navy font-semibold rounded-lg hover:bg-primary-light-yellow transition-colors text-sm sm:text-base min-h-[44px] min-w-[120px]"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            { }
            {isRefreshing && isMobile && (
                <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-primary-navy text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-sm font-medium">Refreshing...</span>
                </div>
            )}

            { }
            {isCategoryLoading && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-primary-navy text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-sm font-medium">Filtering videos...</span>
                </div>
            )}

            { }
            {videos.length > 0 && (
                <VideoGrid
                    videos={videos}
                    isLoading={isCategoryLoading}
                    onVideoClick={handleVideoClick}
                    onLoadMore={!isMobile ? handleLoadMore : undefined} // Disable manual load more on mobile (use infinite scroll)
                    hasMore={pagination.hasMore}
                    isLoadingMore={isLoadingMore}
                />
            )}

            { }
            {showScrollTop && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-50 bg-primary-navy text-white p-3 rounded-full shadow-lg hover:bg-primary-navy/90 transition-colors touch-target"
                    style={{
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation',
                    }}
                    aria-label="Scroll to top"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                </motion.button>
            )}

            { }
            {isMobile && isLoadingMore && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-primary-neon-yellow text-primary-navy px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-navy"></div>
                    <span className="text-sm font-semibold">Loading more...</span>
                </div>
            )}
        </motion.div>
    );
}
