import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

interface NotificationCount {
 unreadCount: number;
 lastUpdated: string;
}

interface UseNotificationCountReturn {
 unreadCount: number;
 loading: boolean;
 error: string | null;
 refetch: () => void;
}

export function useNotificationCount(): UseNotificationCountReturn {
 const [data, setData] = useState<NotificationCount | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const { userProfile } = useAuthContext();

 const fetchCount = useCallback(async () => {
 if (!userProfile) {
 setLoading(false);
 return;
 }

 try {
 setLoading(true);
 setError(null);

 const response = await fetch('/api/notifications/unread-count');
 const result = await response.json();

 if (!response.ok) {
 throw new Error(result.error || 'Failed to fetch notification count');
 }

 if (result.success) {
 setData(result.data);
 } else {
 throw new Error('Failed to load notification count');
 }
 } catch (err) {
 console.error('Error fetching notification count:', err);
 setError(err instanceof Error ? err.message : 'Unknown error occurred');
 } finally {
 setLoading(false);
 }
 }, [userProfile]);

 useEffect(() => {
 fetchCount();

 const interval = setInterval(fetchCount, 30000);
 
 return () => clearInterval(interval);
 }, [fetchCount]);

 const refetch = () => {
 fetchCount();
 };

 return {
 unreadCount: data?.unreadCount || 0,
 loading,
 error,
 refetch,
 };
}
