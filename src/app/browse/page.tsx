"use client";

import NewHeader from "@/components/layout/NewHeader";
import { Footer } from "@/components/layout";
import BrowsePage from "@/components/landing/BrowsePage";
import { getLandingPageContent } from "@/lib/content-config";
import { ContentErrorBoundary } from "@/components/ContentErrorBoundary";

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
