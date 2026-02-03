'use client';

import { useState, useEffect, useCallback } from 'react';
import { FeaturedContent } from '@/types';

interface UseFeaturedContentResult {
 featuredContent: FeaturedContent[];
 loading: boolean;
 error: string | null;
 refetch: () => void;
}

export function useFeaturedContent(limit: number = 5): UseFeaturedContentResult {
 const [featuredContent, setFeaturedContent] = useState<FeaturedContent[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 const fetchFeaturedContent = useCallback(async () => {
 try {
 setLoading(true);
 setError(null);

 const response = await fetch(`/api/landing/featured?limit=${limit}`);
 
 if (!response.ok) {
 throw new Error(`Failed to fetch featured content: ${response.status}`);
 }

 const data = await response.json();
 
 if (!data.success) {
 throw new Error(data.error || 'Failed to fetch featured content');
 }

 setFeaturedContent(data.data || []);
 } catch (err) {
 console.error('Error fetching featured content:', err);
 setError(err instanceof Error ? err.message : 'An unknown error occurred');
 setFeaturedContent([]);
 } finally {
 setLoading(false);
 }
 }, [limit]);

 useEffect(() => {
 fetchFeaturedContent();
 }, [fetchFeaturedContent]);

 const refetch = () => {
 fetchFeaturedContent();
 };

 return {
 featuredContent,
 loading,
 error,
 refetch
 };
}
