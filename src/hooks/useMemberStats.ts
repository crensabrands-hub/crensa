import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

interface MemberStats {
 videosWatched: number;
 creditsSpent: number;
 walletBalance: number;
 memberSince: string;
 lastUpdated: string;
}

interface UseMemberStatsReturn {
 stats: MemberStats | null;
 loading: boolean;
 error: string | null;
 refetch: () => void;
}

export function useMemberStats(): UseMemberStatsReturn {
 const [stats, setStats] = useState<MemberStats | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const { userProfile } = useAuthContext();

 const fetchStats = useCallback(async () => {
  if (!userProfile) {
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    setError(null);

    const response = await fetch('/api/member/stats');
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch member stats');
    }

    if (result.success) {
      setStats(result.data);
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
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
