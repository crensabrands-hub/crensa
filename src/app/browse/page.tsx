"use client";

import { Metadata } from "next";
import NewHeader from "@/components/layout/NewHeader";
import { Footer } from "@/components/layout";
import BrowsePage from "@/components/landing/BrowsePage";
import { getLandingPageContent } from "@/lib/content-config";
import { ContentErrorBoundary } from "@/components/ContentErrorBoundary";
import { createPageMetadata } from "@/lib/seo/metadata";

// Note: export metadata separately for server component
// This would be in a parent layout or done via generateMetadata for dynamic routes
// export const metadata: Metadata = createPageMetadata(
//   'Browse Videos - Explore Content | Crensa',
//   'Browse and watch short videos from creators on Crensa. Search by category, creator, or trending content. Become a member to watch exclusive content.',
//   [
//     'browse videos',
//     'watch videos',
//     'video search',
//     'video categories',
//     'short video platform',
//     'video entertainment',
//   ],
//   '/browse',
//   'https://crensa.com/og-image-browse.png'
// );

export default function Browse() {
 const landingPageContent = getLandingPageContent();

 return (
 <div className="min-h-screen bg-white">
 <ContentErrorBoundary sectionName="header">
 <NewHeader alwaysVisible />
 </ContentErrorBoundary>

 <main className="min-h-screen pt-16 md:pt-20">
 <BrowsePage />
 </main>

 <ContentErrorBoundary sectionName="footer">
 <Footer content={landingPageContent.footer} />
 </ContentErrorBoundary>
 </div>
 );
}
