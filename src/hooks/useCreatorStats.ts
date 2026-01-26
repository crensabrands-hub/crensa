import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

interface CreatorStats {
    totalVideos: number;
    publishedVideos: number;
    draftVideos: number;
    totalSeries: number;
    activeSeries: number;
    totalViews: number;
    totalEarnings: number;
    seriesEarnings: number;
    lastUpdated: string;
}

interface UseCreatorStatsReturn {
    stats: CreatorStats | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useCreatorStats(): UseCreatorStatsReturn {
    const [stats, setStats] = useState<CreatorStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { userProfile } = useAuthContext();

    const fetchStats = useCallback(async () => {
        if (!userProfile || userProfile.role !== 'creator') {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/creator/stats');
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch creator stats');
            }

            if (result.success) {
                setStats(result.data);
            } else {
                throw new Error('Failed to load creator stats');
            }
        } catch (err) {
            console.error('Error fetching creator stats:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, [userProfile]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const refetch = () => {
        fetchStats();
    };

    return {
        stats,
        loading,
        error,
        refetch,
    };
}