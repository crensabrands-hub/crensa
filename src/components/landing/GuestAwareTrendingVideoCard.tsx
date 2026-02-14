'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import GuestFreeGate from '@/components/auth/GuestFreeGate';
import TrendingVideoCard from './TrendingVideoCard';

interface GuestAwareTrendingVideoCardProps {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: number;
  creatorName: string;
  creatorAvatar: string;
  price: number;
  category: string;
  href: string;
}

/**
 * GuestAwareTrendingVideoCard
 * 
 * Wraps TrendingVideoCard with guest free watch logic.
 * Only applies to landing page - enforces 2 free video limit for guests.
 */
export default function GuestAwareTrendingVideoCard({
  id,
  title,
  thumbnailUrl,
  duration,
  creatorName,
  creatorAvatar,
  price,
  category,
  href,
}: GuestAwareTrendingVideoCardProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleProceed = () => {
    router.push(href);
  };

  return (
    <GuestFreeGate
      isAuthenticated={!!isSignedIn}
      coinPrice={price}
      videoId={id}
      videoTitle={title}
      onProceed={handleProceed}
    >
      <TrendingVideoCard
        id={id}
        title={title}
        thumbnailUrl={thumbnailUrl}
        duration={duration}
        creatorName={creatorName}
        creatorAvatar={creatorAvatar}
        price={price}
        category={category}
        href={href}
      />
    </GuestFreeGate>
  );
}
