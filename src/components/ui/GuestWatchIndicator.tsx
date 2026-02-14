'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { useGuestAccess } from '@/hooks/useGuestAccess';
import Link from 'next/link';

interface GuestWatchIndicatorProps {
  className?: string;
  showOnlyWhenLimited?: boolean;
}

/**
 * GuestWatchIndicator
 * 
 * Shows remaining free watches for guest users
 * Can be placed in header or as a floating indicator
 */
export default function GuestWatchIndicator({
  className = '',
  showOnlyWhenLimited = true,
}: GuestWatchIndicatorProps) {
  const { isAuthenticated, remainingWatches, watchCount } = useGuestAccess();

  // Don't show for authenticated users
  if (isAuthenticated) {
    return null;
  }

  // Don't show if user hasn't watched any videos yet (optional)
  if (showOnlyWhenLimited && watchCount === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center gap-2 ${className}`}
      >
        {remainingWatches > 0 ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-accent-teal/10 to-accent-green/10 rounded-full border border-accent-teal/20">
            <EyeIcon className="w-4 h-4 text-accent-teal" />
            <span className="text-sm font-medium text-accent-teal">
              {remainingWatches} free {remainingWatches === 1 ? 'video' : 'videos'} left
            </span>
          </div>
        ) : (
          <Link
            href="/sign-up"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-pink to-accent-bright-pink text-white rounded-full hover:from-accent-bright-pink hover:to-accent-pink transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            <UserPlusIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">Sign up for more</span>
          </Link>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
