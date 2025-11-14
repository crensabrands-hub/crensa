'use client';

import { useState, useEffect } from 'react';
import { TrendingCreator } from '@/types';

interface UseTrendingCreatorsResult {
 creators: TrendingCreator[];
 loading: boolean;
 error: string | null;
 refetch: () => void;
}

export function useTrendingCreators(limit: number = 10): UseTrendingCreatorsResult {
 const [creators, setCreators] = useState<TrendingCreator[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 const fetchTrendingCreators = async () => {
 try {
 setLoading(true);
 setError(null);

 const response = await fetch(`/api/landing/trending-creators?limit=${limit}`);
 
 if (!response.ok) {
 throw new Error(`Failed to fetch trending creators: ${response.status}`);
 }

 const data = await response.json();
 
 if (!data.success) {
 throw new Error(data.error || 'Failed to fetch trending creators');
 }

 setCreators(data.data || []);
 } catch (err) {
 console.error('Error fetching trending creators:', err);
 setError(err instanceof Error ? err.message : 'Unknown error occurred');
 setCreators([]);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchTrendingCreators();
 }, [limit]);

 const refetch = () => {
 fetchTrendingCreators();
 };

 return {
 creators,
 loading,
 error,
 refetch
 };
}