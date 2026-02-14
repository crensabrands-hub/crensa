/**
 * Guest Access Utility
 * Manages free video watch counter for non-authenticated users
 * 
 * Features:
 * - Tracks guest watch count in localStorage
 * - Enforces 2 free video limit
 * - Resets on login
 * - Works in PWA and browser
 */

const GUEST_WATCH_COUNT_KEY = 'crensa_guest_free_watch_count';
const MAX_FREE_WATCHES = 2;

/**
 * Get current guest watch count from localStorage
 * @returns number of videos watched by guest (0 if none or error)
 */
export function getGuestWatchCount(): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  try {
    const count = localStorage.getItem(GUEST_WATCH_COUNT_KEY);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.warn('Failed to get guest watch count:', error);
    return 0;
  }
}

/**
 * Increment guest watch counter
 * @returns new count after increment
 */
export function incrementGuestWatchCount(): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  try {
    const currentCount = getGuestWatchCount();
    const newCount = currentCount + 1;
    localStorage.setItem(GUEST_WATCH_COUNT_KEY, newCount.toString());
    return newCount;
  } catch (error) {
    console.error('Failed to increment guest watch count:', error);
    return getGuestWatchCount();
  }
}

/**
 * Check if guest can watch a free video
 * @param isAuthenticated - whether user is logged in
 * @param coinPrice - video coin price (0 = free)
 * @returns true if guest can watch, false otherwise
 */
export function canGuestWatchFreeVideo(
  isAuthenticated: boolean,
  coinPrice: number
): boolean {
  // Authenticated users can always watch (subject to their own rules)
  if (isAuthenticated) {
    return true;
  }

  // Only free videos (coin_price = 0) are eligible
  if (coinPrice !== 0) {
    return false;
  }

  // Check if guest has remaining free watches
  const watchCount = getGuestWatchCount();
  return watchCount < MAX_FREE_WATCHES;
}

/**
 * Reset guest watch counter (called on login)
 */
export function resetGuestWatchCount(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(GUEST_WATCH_COUNT_KEY);
  } catch (error) {
    console.error('Failed to reset guest watch count:', error);
  }
}

/**
 * Get remaining free watches for guest
 * @returns number of free watches remaining
 */
export function getRemainingFreeWatches(): number {
  const watchCount = getGuestWatchCount();
  return Math.max(0, MAX_FREE_WATCHES - watchCount);
}

/**
 * Check if guest has exhausted free watches
 * @returns true if guest has watched max free videos
 */
export function hasExhaustedFreeWatches(): boolean {
  const watchCount = getGuestWatchCount();
  return watchCount >= MAX_FREE_WATCHES;
}
