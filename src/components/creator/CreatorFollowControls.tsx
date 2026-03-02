'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { Eye, IndianRupee, Users, Video } from 'lucide-react';

interface CreatorFollowContextValue {
    isFollowing: boolean;
    followerCount: number;
    isLoading: boolean;
    pulse: boolean;
    toggleFollow: () => Promise<void>;
}

const CreatorFollowContext = createContext<CreatorFollowContextValue | null>(null);

interface CreatorFollowProviderProps {
    creatorId: string;
    creatorUsername: string;
    initialIsFollowing: boolean;
    initialFollowerCount: number;
    children: React.ReactNode;
}

export function CreatorFollowProvider({
    creatorId,
    creatorUsername,
    initialIsFollowing,
    initialFollowerCount,
    children,
}: CreatorFollowProviderProps) {
    const router = useRouter();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [followerCount, setFollowerCount] = useState(initialFollowerCount);
    const [isLoading, setIsLoading] = useState(false);
    const [pulse, setPulse] = useState(false);
    const pulseTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (pulseTimeoutRef.current) {
                window.clearTimeout(pulseTimeoutRef.current);
            }
        };
    }, []);

    const triggerPulse = useCallback(() => {
        setPulse(true);
        if (pulseTimeoutRef.current) {
            window.clearTimeout(pulseTimeoutRef.current);
        }
        pulseTimeoutRef.current = window.setTimeout(() => {
            setPulse(false);
        }, 450);
    }, []);

    const toggleFollow = useCallback(async () => {
        if (isLoading) {
            return;
        }

        setIsLoading(true);
        let didToggle = false;

        try {
            const response = await fetch('/api/interactions/follow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ creatorId }),
            });

            if (response.status === 401) {
                router.push(`/sign-in?redirect_url=/creator/${creatorUsername}`);
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.error || 'Failed to follow creator');
            }

            const data = await response.json();
            const nextIsFollowing = Boolean(data?.data?.isFollowing);

            if (nextIsFollowing !== isFollowing) {
                const delta = nextIsFollowing ? 1 : -1;
                setFollowerCount((prev) => Math.max(0, prev + delta));
                setIsFollowing(nextIsFollowing);
                didToggle = true;
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        } finally {
            setIsLoading(false);
            if (didToggle) {
                triggerPulse();
            }
        }
    }, [creatorId, creatorUsername, isFollowing, isLoading, router, triggerPulse]);

    const value = useMemo(
        () => ({
            isFollowing,
            followerCount,
            isLoading,
            pulse,
            toggleFollow,
        }),
        [isFollowing, followerCount, isLoading, pulse, toggleFollow]
    );

    return (
        <CreatorFollowContext.Provider value={value}>
            {children}
        </CreatorFollowContext.Provider>
    );
}

function useCreatorFollow() {
    const context = useContext(CreatorFollowContext);
    if (!context) {
        throw new Error('CreatorFollow components must be used within CreatorFollowProvider');
    }
    return context;
}

export function CreatorFollowButton() {
    const { isFollowing, isLoading, pulse, toggleFollow } = useCreatorFollow();

    return (
        <button
            type="button"
            onClick={toggleFollow}
            disabled={isLoading}
            aria-pressed={isFollowing}
            className={`relative flex w-full items-center justify-center gap-3 bg-primary-neon-yellow hover:bg-primary-light-yellow text-primary-navy font-bold text-lg py-5 px-10 rounded-2xl transition-all duration-300 transform shadow-2xl shadow-primary-neon-yellow/50 ${pulse ? 'scale-105 ring-2 ring-primary-neon-yellow/70 animate-pulse' : 'scale-100'
                } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-navy border-t-transparent rounded-full animate-spin" />
            ) : isFollowing ? (
                <>
                    <CheckIcon className="w-6 h-6" />
                    Followed
                </>
            ) : (
                <>
                    <UserPlusIcon className="w-6 h-6" />
                    Follow Creator
                </>
            )}
        </button>
    );
}

interface CreatorStatsGridProps {
    videoCount: number;
    totalViews: number;
    totalEarnings: string;
}

export function CreatorStatsGrid({ videoCount, totalViews, totalEarnings }: CreatorStatsGridProps) {
    const { followerCount } = useCreatorFollow();

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const stats = [
        { label: 'Followers', value: formatNumber(followerCount), icon: <Users size={20} /> },
        { label: 'Total Content', value: formatNumber(videoCount), icon: <Video size={20} /> },
        { label: 'Community Reach', value: formatNumber(totalViews), icon: <Eye size={20} /> },
        { label: 'Est. Earnings', value: `₹${totalEarnings}`, icon: <IndianRupee size={20} /> },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
                <div
                    key={i}
                    className="group relative p-10 rounded-[2.25rem] bg-white border border-neutral-light-gray hover:border-primary-neon-yellow/60 hover:shadow-[0_26px_52px_-18px_rgba(0,0,0,0.08)] transition-all duration-500"
                >
                    <div className="absolute top-6 right-6 p-3 bg-neutral-gray rounded-2xl text-neutral-dark-gray group-hover:bg-primary-neon-yellow group-hover:text-primary-navy transition-all duration-300">
                        {stat.icon}
                    </div>
                    <p className="text-neutral-dark-gray font-bold uppercase tracking-[0.22em] text-[10px] mb-3">
                        {stat.label}
                    </p>
                    <h3
                        className={`text-4xl font-bold text-primary-navy ${stat.label === 'Est. Earnings' ? 'blur-md select-none' : ''}`}
                        aria-label={stat.label === 'Est. Earnings' ? 'Estimated earnings hidden' : undefined}
                    >
                        {stat.value}
                    </h3>
                </div>
            ))}
        </div>
    );
}
