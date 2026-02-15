import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';
import { SchemaRenderer } from '@/components/schema/SchemaRenderer';
import { getOTTPlatformSchema } from '@/lib/seo/schema';

export const metadata: Metadata = createPageMetadata(
  "Watch Short OTT Platform | Mini Web Series | Pay Per View Streaming App India | Crensa",
  "Watch exclusive mini web series, short films and OTT content in India. Pay-per-view streaming platform with premium short content. Support creators directly.",
  [
    'short OTT platform',
    'watch mini web series',
    'pay per view streaming app',
    'exclusive short films India',
    'short content streaming',
    'mini web series platform',
    'OTT platform India',
    'web series watch online',
    'short films streaming',
    'premium short content',
    'episodic content platform',
  ],
  '/member-landing',
  'https://crensa.com/og-image-member.png'
);

// Note: Schema will be rendered in head via layout component

import { ContentErrorBoundary } from "@/components/ContentErrorBoundary";
import NewHeader from "@/components/layout/NewHeader";
import { Footer } from "@/components/layout";
import { getLandingPageContent } from "@/lib/content-config";

export default function MemberLanding() {
 const landingPageContent = getLandingPageContent();

 return (
 <div className="min-h-screen bg-gradient-to-br from-accent-pink/10 via-neutral-white to-primary-navy/10">
 <ContentErrorBoundary sectionName="header">
 <NewHeader />
 </ContentErrorBoundary>
 
 <main id="main-content" className="min-h-screen">
 {}
 <ContentErrorBoundary sectionName="member-hero">
 <section className="pt-20 pb-16 px-4">
 <div className="container mx-auto">
 <div className="text-center mb-12">
 <h1 className="text-4xl md:text-6xl font-bold text-primary-navy mb-6">
 Welcome Members
 </h1>
 <p className="text-xl md:text-2xl text-neutral-dark max-w-3xl mx-auto">
 Enjoy exclusive content, premium features, and unlimited access to your favorite creators
 </p>
 </div>
 <div className="bg-gradient-primary rounded-2xl p-8 text-center text-primary-navy">
 <h3 className="text-2xl font-bold mb-4">Member Benefits</h3>
 <div className="grid md:grid-cols-3 gap-6">
 <div className="bg-neutral-white/80 rounded-lg p-4">
 <h4 className="font-semibold mb-2">Unlimited Access</h4>
 <p className="text-sm">Watch all premium content without limits</p>
 </div>
 <div className="bg-neutral-white/80 rounded-lg p-4">
 <h4 className="font-semibold mb-2">Exclusive Series</h4>
 <p className="text-sm">Access member-only series and content</p>
 </div>
 <div className="bg-neutral-white/80 rounded-lg p-4">
 <h4 className="font-semibold mb-2">Early Access</h4>
 <p className="text-sm">Get first access to new releases</p>
 </div>
 </div>
 </div>
 </div>
 </section>
 </ContentErrorBoundary>

 {}
 <ContentErrorBoundary sectionName="member-features">
 <section className="py-16 px-4 bg-neutral-white">
 <div className="container mx-auto">
 <div className="text-center mb-12">
 <h2 className="text-3xl md:text-4xl font-bold text-primary-navy mb-4">
 Member Experience
 </h2>
 <p className="text-lg text-neutral-dark max-w-2xl mx-auto">
 Designed specifically for our valued members
 </p>
 </div>
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
 <div className="text-center p-6 bg-gradient-to-br from-accent-pink/10 to-primary-navy/10 rounded-xl">
 <div className="w-16 h-16 bg-accent-pink rounded-full flex items-center justify-center mx-auto mb-4">
 <span className="text-2xl">🎬</span>
 </div>
 <h3 className="text-xl font-bold text-primary-navy mb-2">Premium Content</h3>
 <p className="text-neutral-dark">Access exclusive videos and series from top creators</p>
 </div>
 <div className="text-center p-6 bg-gradient-to-br from-accent-pink/10 to-primary-navy/10 rounded-xl">
 <div className="w-16 h-16 bg-accent-pink rounded-full flex items-center justify-center mx-auto mb-4">
 <span className="text-2xl">📱</span>
 </div>
 <h3 className="text-xl font-bold text-primary-navy mb-2">Mobile Optimized</h3>
 <p className="text-neutral-dark">Enjoy seamless viewing on any device</p>
 </div>
 <div className="text-center p-6 bg-gradient-to-br from-accent-pink/10 to-primary-navy/10 rounded-xl">
 <div className="w-16 h-16 bg-accent-pink rounded-full flex items-center justify-center mx-auto mb-4">
 <span className="text-2xl">⭐</span>
 </div>
 <h3 className="text-xl font-bold text-primary-navy mb-2">Personalized</h3>
 <p className="text-neutral-dark">Get recommendations based on your preferences</p>
 </div>
 </div>
 </div>
 </section>
 </ContentErrorBoundary>
 </main>
 
 <ContentErrorBoundary sectionName="footer">
 <Footer content={landingPageContent.footer} />
 </ContentErrorBoundary>
 </div>
 );
}