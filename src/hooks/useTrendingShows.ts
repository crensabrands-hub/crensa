import { useState, useEffect } from 'react';
import { TrendingShow } from '@/types';

interface UseTrendingShowsResult {
 trendingShows: TrendingShow[];
 loading: boolean;
 error: string | null;
 refetch: () => void;
}

export function useTrendingShows(limit: number = 20): UseTrendingShowsResult {
 const [trendingShows, setTrendingShows] = useState<TrendingShow[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 const fetchTrendingShows = async () => {
 try {
 setLoading(true);
 setError(null);

 const response = await fetch(`/api/landing/trending-shows?limit=${limit}`);
 
 if (!response.ok) {
 throw new Error(`Failed to fetch trending shows: ${response.status}`);
 }

 const result = await response.json();
 
 if (!result.success) {
 throw new Error(result.error || 'Failed to fetch trending shows');
 }

 setTrendingShows(result.data || []);
 } catch (err) {
 console.error('Error fetching trending shows:', err);
 setError(err instanceof Error ? err.message : 'Failed to fetch trending shows');
 setTrendingShows([]);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchTrendingShows();
 }, [limit]);

 return {
 trendingShows,
 loading,
 error,
 refetch: fetchTrendingShows
 };
}