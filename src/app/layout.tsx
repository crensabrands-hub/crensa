import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ErrorBoundaryLayout } from "@/components/layout/ErrorBoundaryLayout";
import { ClientMonitors } from "@/components/ClientMonitors";

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

export const metadata: Metadata = {
    title: "Crensa - Monetize Your Short Videos",
    description:
        "Join Crensa to upload short video content and monetize it through our pay-per-view credit system.",
    keywords: "video monetization, short videos, content creators, pay-per-view",
    authors: [{ name: "Crensa Team" }],
    robots: "index, follow",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Crensa",
    },
    formatDetection: {
        telephone: false,
    },
    openGraph: {
        title: "Crensa - Monetize Your Short Videos",
        description:
            "Join Crensa to upload short video content and monetize it through our pay-per-view credit system.",
        type: "website",
        locale: "en_US",
    },
    twitter: {
        card: "summary_large_image",
        title: "Crensa - Monetize Your Short Videos",
        description:
            "Join Crensa to upload short video content and monetize it through our pay-per-view credit system.",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable} suppressHydrationWarning>
            <head>
                {/* PWA Meta Tags */}
                <meta name="theme-color" content="#000000" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="Crensa" />
                <link rel="apple-touch-icon" href="/icons/icon-192.png" />
                <link rel="icon" type="image/png" href="/icons/icon-192.png" />

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
