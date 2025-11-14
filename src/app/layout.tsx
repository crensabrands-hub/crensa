import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { ErrorBoundaryLayout } from "@/components/layout/ErrorBoundaryLayout";
import { ErrorReportingDashboard } from "@/components/debug/ErrorReportingDashboard";

import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";
import { AppPreloader } from "@/components";

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
 <html lang="en" className={inter.variable}>
 <head>

 <link rel="preload" href="/images/hero-fallback.svg" as="image" />
 <link
 rel="preload"
 href="/videos/hero-background.mp4"
 as="video"
 type="video/mp4"
 />

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
 <PerformanceMonitor />
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
 <ErrorReportingDashboard />
 </body>
 </html>
 );
}
