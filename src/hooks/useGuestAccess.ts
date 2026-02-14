'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  getGuestWatchCount,
  canGuestWatchFreeVideo,
  getRemainingFreeWatches,
  hasExhaustedFreeWatches,
} from '@/lib/utils/guestAccess';

/**
 * useGuestAccess Hook
 * 
 * Provides reactive access to guest watch state
 * Automatically updates when localStorage changes
 */
export function useGuestAccess() {
  const { isSignedIn } = useAuth();
  const [watchCount, setWatchCount] = useState(0);
  const [remainingWatches, setRemainingWatches] = useState(2);
  const [exhausted, setExhausted] = useState(false);

  useEffect(() => {
    // Initial load
    updateState();

    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'crensa_guest_free_watch_count') {
        updateState();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isSignedIn]);

  const updateState = () => {
    const count = getGuestWatchCount();
    const remaining = getRemainingFreeWatches();
    const isExhausted = hasExhaustedFreeWatches();

    setWatchCount(count);
    setRemainingWatches(remaining);
    setExhausted(isExhausted);
  };

  const canWatch = (coinPrice: number) => {
    return canGuestWatchFreeVideo(!!isSignedIn, coinPrice);
  };

  return {
    isAuthenticated: !!isSignedIn,
    watchCount,
    remainingWatches,
    exhausted,
    canWatch,
  };
}
