'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import GuestFreeGate from '@/components/auth/GuestFreeGate';
import EpisodeCard from './Episodecard';

interface GuestAwareEpisodeCardProps {
  id: string;
  title: string;
  thumbnail: string;
  href: string;
  coinPrice: number;
}

/**
 * GuestAwareEpisodeCard
 * 
 * Wraps EpisodeCard with guest free watch logic.
 * Only applies to landing page - enforces 2 free video limit for guests.
 */
export default function GuestAwareEpisodeCard({
  id,
  title,
  thumbnail,
  href,
  coinPrice,
}: GuestAwareEpisodeCardProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleProceed = () => {
    router.push(href);
  };

  return (
    <GuestFreeGate
      isAuthenticated={!!isSignedIn}
      coinPrice={coinPrice}
      videoId={id}
      videoTitle={title}
      onProceed={handleProceed}
    >
      <EpisodeCard
        id={id}
        title={title}
        thumbnail={thumbnail}
        href={href}
      />
    </GuestFreeGate>
  );
}
