import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';
import DiscoverPageClient from './DiscoverPageClient';

export const metadata: Metadata = createPageMetadata(
  'Watch Short Web Series & Premium Creator Content | Crensa',
  'Watch exclusive short web series and premium creator videos on Crensa – India’s creator-first pay-per-view platform. Discover trending content across various categories and support your favourite creators directly.',
  [
    'discover videos',
    'trending content',
    'video discovery',
    'short videos',
    'video categories',
    'entertainment videos',
    'creator content',
  ],
  '/discover',
  'https://crensa.com/og-image-discover.png'
);

export default function DiscoverPage() {
 return <DiscoverPageClient />;
}

