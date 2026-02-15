import { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo/metadata";
import { SchemaRenderer } from "@/components/schema/SchemaRenderer";
import { getCreatorPlatformSchema } from "@/lib/seo/schema";

export const metadata: Metadata = createPageMetadata(
  "Monetise Video Content | Pay Per View Platform For Creators | Creator Monetisation India | Crensa",
  "Join India's top pay-per-view creator platform. Monetise your video content and earn money directly from viewers. Retain full video IP ownership. Zero performance fees.",
  [
    "monetise video content",
    "pay per view platform for creators",
    "creator monetisation India",
    "video IP ownership",
    "earn money from videos India",
    "creator platform pay per view",
    "video monetisation platform",
    "creator earnings platform",
    "short video monetisation",
    "content creator platform India",
  ],
  "/creator-landing",
  "https://crensa.com/og-image-creator.png"
);


// Note: Schema will be rendered in head via layout component

import NewHeader from "@/components/layout/NewHeader";
import { Footer } from "@/components/layout";
import {
 HeroSection,
 FeatureSection,
 WhyJoinNowSection,
 HowItWorksSection,
 TestimonialsSection,
 FAQSection,
} from "@/components/sections";
import { getLandingPageContent } from "@/lib/content-config";
import { ContentErrorBoundary } from "@/components/ContentErrorBoundary";

export default function CreatorLanding() {
 const landingPageContent = getLandingPageContent();

 return (
 <div className="min-h-screen bg-white">
 <ContentErrorBoundary sectionName="header">
 <NewHeader />
 </ContentErrorBoundary>

 <main id="main-content" className="min-h-screen pt-16 md:pt-20">
 {}
 <ContentErrorBoundary sectionName="hero">
 <HeroSection content={landingPageContent.hero} />
 </ContentErrorBoundary>

 {}
 <div id="why-crensa">
 <ContentErrorBoundary sectionName="why-crensa">
 <FeatureSection
 title={landingPageContent.whyCrensa.title}
 subtitle={landingPageContent.whyCrensa.subtitle}
 features={landingPageContent.whyCrensa.features}
 />
 </ContentErrorBoundary>
 </div>

 {}
 <ContentErrorBoundary sectionName="why-join-now">
 <WhyJoinNowSection
 title={landingPageContent.whyJoinNow.title}
 benefits={landingPageContent.whyJoinNow.benefits}
 ctaText={landingPageContent.whyJoinNow.ctaText}
 ctaLink={landingPageContent.whyJoinNow.ctaLink}
 />
 </ContentErrorBoundary>

 {}
 <div id="how-it-works">
 <ContentErrorBoundary sectionName="how-it-works">
 <HowItWorksSection
 title={landingPageContent.howItWorks.title}
 steps={landingPageContent.howItWorks.steps}
 />
 </ContentErrorBoundary>
 </div>

 {}
 <div id="testimonials">
 <ContentErrorBoundary sectionName="testimonials">
 <TestimonialsSection
 title={landingPageContent.testimonials.title}
 testimonials={landingPageContent.testimonials.items}
 />
 </ContentErrorBoundary>
 </div>

 {}
 <div id="faq">
 <ContentErrorBoundary sectionName="faq">
 <FAQSection
 title={landingPageContent.faq.title}
 faqs={landingPageContent.faq.items}
 />
 </ContentErrorBoundary>
 </div>
 </main>

 <ContentErrorBoundary sectionName="footer">
 <Footer content={landingPageContent.footer} />
 </ContentErrorBoundary>
 </div>
 );
}
