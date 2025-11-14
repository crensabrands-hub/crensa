

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseProfileVisitTrackingOptions {
 autoTrack?: boolean;
 trackDuration?: boolean;
}

interface VisitTrackingState {
 isTracking: boolean;
 visitId?: string;
 error?: string;
}

export function useProfileVisitTracking(options: UseProfileVisitTrackingOptions = {}) {
 const { autoTrack = false, trackDuration = true } = options;
 const [state, setState] = useState<VisitTrackingState>({
 isTracking: false
 });
 
 const visitStartTime = useRef<number | undefined>(undefined);
 const currentVisitId = useRef<string | undefined>(undefined);

 const trackVisit = useCallback(async (
 creatorId: string, 
 source: 'dashboard' | 'search' | 'recommendation' | 'direct' | 'trending' = 'direct'
 ) => {
 setState(prev => ({ ...prev, isTracking: true, error: undefined }));
 
 try {
 const response = await fetch('/api/member/profile-visits', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 creatorId,
 source
 })
 });

 const data = await response.json();

 if (!response.ok) {
 throw new Error(data.error || 'Failed to track visit');
 }

 const visitId = data.data?.visitId;
 currentVisitId.current = visitId;
 
 if (trackDuration) {
 visitStartTime.current = Date.now();
 }

 setState(prev => ({
 ...prev,
 isTracking: false,
 visitId,
 error: undefined
 }));

 return { success: true, visitId };
 } catch (error) {
 const errorMessage = error instanceof Error ? error.message : 'Failed to track visit';
 setState(prev => ({
 ...prev,
 isTracking: false,
 error: errorMessage
 }));

 return { success: false, error: errorMessage };
 }
 }, [trackDuration]);

 const endVisit = useCallback(async () => {
 if (!currentVisitId.current || !visitStartTime.current || !trackDuration) {
 return;
 }

 const duration = Math.floor((Date.now() - visitStartTime.current) / 1000);

 if (duration < 5) {
 return;
 }

 try {
 await fetch('/api/member/profile-visits', {
 method: 'PATCH',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 visitId: currentVisitId.current,
 duration
 })
 });
 } catch (error) {
 console.error('Failed to update visit duration:', error);
 }

 visitStartTime.current = undefined;
 currentVisitId.current = undefined;
 }, [trackDuration]);

 useEffect(() => {
 if (autoTrack) {

 }

 return () => {
 if (trackDuration) {
 endVisit();
 }
 };
 }, [autoTrack, trackDuration, endVisit]);

 useEffect(() => {
 if (!trackDuration) return;

 const handleVisibilityChange = () => {
 if (document.hidden) {
 endVisit();
 }
 };

 document.addEventListener('visibilitychange', handleVisibilityChange);
 
 return () => {
 document.removeEventListener('visibilitychange', handleVisibilityChange);
 };
 }, [trackDuration, endVisit]);

 return {
 ...state,
 trackVisit,
 endVisit
 };
}

export function useVisitHistory(options: {
 limit?: number;
 offset?: number;
 creatorId?: string;
} = {}) {
 const [data, setData] = useState<{
 visits: any[];
 total: number;
 loading: boolean;
 error?: string;
 retryable?: boolean;
 hasMore?: boolean;
 }>({
 visits: [],
 total: 0,
 loading: true,
 retryable: false,
 hasMore: false
 });

 const [retryCount, setRetryCount] = useState(0);
 const maxRetries = 3;
 const retryDelay = 1000; // Start with 1 second

 const fetchVisitHistory = useCallback(async (isRetry = false) => {
 if (!isRetry) {
 setRetryCount(0);
 }
 
 setData(prev => ({ ...prev, loading: true, error: undefined, retryable: false }));

 try {
 const params = new URLSearchParams();
 if (options.limit) params.set('limit', options.limit.toString());
 if (options.offset) params.set('offset', options.offset.toString());
 if (options.creatorId) params.set('creatorId', options.creatorId);

 const controller = new AbortController();
 const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

 const response = await fetch(`/api/member/profile-visits?${params}`, {
 signal: controller.signal,
 headers: {
 'Content-Type': 'application/json',
 }
 });

 clearTimeout(timeoutId);

 const result = await response.json();

 if (!response.ok) {
 const errorMessage = result.message || result.error || 'Failed to fetch visit history';
 const isRetryable = result.retryable || response.status >= 500 || response.status === 503;
 
 throw new Error(JSON.stringify({
 message: errorMessage,
 retryable: isRetryable,
 status: response.status
 }));
 }

 setRetryCount(0);
 setData({
 visits: result.data.visits || [],
 total: result.data.total || 0,
 hasMore: result.data.hasMore || false,
 loading: false,
 error: undefined,
 retryable: false
 });

 console.log(`Visit history fetched successfully: ${result.data.visits?.length || 0} visits`);
 } catch (error) {
 console.error('Error fetching visit history:', error);

 let errorMessage = 'Failed to fetch visit history';
 let isRetryable = false;
 let status = 0;

 if (error instanceof Error) {
 if (error.name === 'AbortError') {
 errorMessage = 'Request timed out. Please check your connection and try again.';
 isRetryable = true;
 } else {
 try {
 const errorData = JSON.parse(error.message);
 errorMessage = errorData.message;
 isRetryable = errorData.retryable;
 status = errorData.status;
 } catch {
 errorMessage = error.message;

 isRetryable = error.message.includes('fetch') || 
 error.message.includes('network') ||
 error.message.includes('connection');
 }
 }
 }

 if (isRetryable && retryCount < maxRetries) {
 const delay = retryDelay * Math.pow(2, retryCount); // Exponential backoff
 console.log(`Retrying visit history fetch in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
 
 setTimeout(() => {
 setRetryCount(prev => prev + 1);
 fetchVisitHistory(true);
 }, delay);
 
 return;
 }

 setData(prev => ({
 ...prev,
 loading: false,
 error: errorMessage,
 retryable: isRetryable && retryCount >= maxRetries
 }));
 }
 }, [options.limit, options.offset, options.creatorId, retryCount]);

 const retry = useCallback(() => {
 setRetryCount(0);
 fetchVisitHistory(false);
 }, [fetchVisitHistory]);

 useEffect(() => {
 fetchVisitHistory();
 }, [fetchVisitHistory]);

 return {
 ...data,
 refetch: fetchVisitHistory,
 retry,
 isRetrying: retryCount > 0 && data.loading
 };
}