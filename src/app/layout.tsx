import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ErrorBoundaryLayout } from "@/components/layout/ErrorBoundaryLayout";
import { ClientMonitors } from "@/components/ClientMonitors";
import { PWARegister } from "@/components/PWARegister";
import { SchemaRenderer } from "@/components/schema/SchemaRenderer";
import { getOrganizationSchema, getWebsiteSchema, getVideoPlatformSchema, getCreatorPlatformSchema, getOTTPlatformSchema } from "@/lib/seo/schema";
import { baseMetadata, SITE_URL } from "@/lib/seo/metadata";

import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";


const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
};

export const metadata: Metadata = baseMetadata;

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable} suppressHydrationWarning>
            <head>
                {/* JSON-LD Structured Data - Multiple schemas for both creator and viewer indexing */}
                <SchemaRenderer schema={[
                    getOrganizationSchema(), 
                    getWebsiteSchema(), 
                    getVideoPlatformSchema(),
                    getCreatorPlatformSchema(), // For India creator searches
                    getOTTPlatformSchema() // For India viewer searches
                ]} />

                {/* Canonical URL */}
                <link rel="canonical" href={SITE_URL} />

                {/* Verification Tags - Replace with your actual verification tokens */}
                <meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE" />
                <meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_CODE" />

                {/* PWA Meta Tags */}
                <meta name="theme-color" content="#000000" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="Crensa" />
                <link rel="apple-touch-icon" href="/icons/icon-192.png" />
                <link rel="icon" type="image/png" href="/icons/icon-192.png" />
                <link rel="shortcut icon" href="/icons/icon-192.png" />
                
                {/* Translation Prevention */}
                <meta name="google" content="notranslate" />
                <meta name="robots" content="notranslate" />
                <meta httpEquiv="Content-Language" content="en" />

                {/* Preload critical assets */}
                <link rel="preload" href="/images/hero-fallback.svg" as="image" />
                <link
                    rel="preload"
                    href="/videos/hero-background.mp4"
                    as="video"
                    type="video/mp4"
                />

                {/* DNS and preconnect */}
                <link rel="dns-prefetch" href="//fonts.googleapis.com" />

                <link
                    rel="preconnect"
                    href="https://fonts.googleapis.com"
                    crossOrigin="anonymous"
                />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
            </head>
            <body className="font-sans antialiased">
                <ClientMonitors />
                <PWARegister />
                <ErrorBoundaryLayout
                    level="page"
                    sectionName="root-layout"
                    enableApiErrorBoundary={true}
                    enableContentErrorBoundary={true}
                >
                    <ClientProviders>
                        {children}
                    </ClientProviders>
                </ErrorBoundaryLayout>
            </body>
        </html>
    );
}
