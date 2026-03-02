"use client";

import NewHeader from "@/components/layout/NewHeader";
import { Footer } from "@/components/layout";
import AllCreatorsPage from "@/components/landing/AllCreatorsPage";
import { getLandingPageContent } from "@/lib/content-config";
import { ContentErrorBoundary } from "@/components/ContentErrorBoundary";

export default function CreatorsPage() {
    const landingPageContent = getLandingPageContent();

    return (
        <div className="min-h-screen bg-white">
            <ContentErrorBoundary sectionName="header">
                <NewHeader alwaysVisible />
            </ContentErrorBoundary>

            <main className="min-h-screen pt-16 md:pt-20 px-4 md:px-6 lg:px-8">
                <div className="container mx-auto max-w-7xl">
                    <AllCreatorsPage limit={50} />
                </div>
            </main>

            <ContentErrorBoundary sectionName="footer">
                <Footer content={landingPageContent.footer} />
            </ContentErrorBoundary>
        </div>
    );
}
