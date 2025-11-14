import { Metadata } from 'next';
import DiscoverPageClient from './DiscoverPageClient';

export const metadata: Metadata = {
 title: 'Discover Videos - Crensa',
 description: 'Discover amazing short videos from talented creators. Browse trending content, explore categories, and find videos that match your interests on Crensa.',
 keywords: 'discover videos, trending content, video discovery, short videos, creators, entertainment',
 openGraph: {
 title: 'Discover Videos - Crensa',
 description: 'Discover amazing short videos from talented creators. Browse trending content and explore categories.',
 type: 'website',
 },
 twitter: {
 card: 'summary_large_image',
 title: 'Discover Videos - Crensa',
 description: 'Discover amazing short videos from talented creators. Browse trending content and explore categories.',
 },
};

export default function DiscoverPage() {
 return <DiscoverPageClient />;
}

