import { Metadata } from "next";

export const SITE_NAME = "Crensa";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://crensa.com";
export const SITE_DESCRIPTION =
  "Crensa is India's premier pay-per-view platform for creators to monetise video content and viewers to watch premium short films, web series and OTT content. Retain full video IP ownership.";
export const DEFAULT_KEYWORDS = [
  "video monetization",
  "pay per view platform",
  "creator monetisation India",
  "short OTT platform",
  "creator earnings",
  "video IP ownership",
  "web series streaming",
  "short films India",
  "content creator platform",
  "pay per view streaming",
];

export const TWITTER_HANDLE = "@CrensaPlatform";
export const BRAND_COLOR = "#000000";

export const baseMetadata: Metadata = {
  title: {
    default: `${SITE_NAME} - Monetise Video Content & Watch Premium OTT`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  authors: [{ name: "Crensa Team" }],
  creator: "Crensa",
  publisher: "Crensa",
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  },
  manifest: "/manifest.json",
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_NAME,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    title: `${SITE_NAME} - Monetise Video Content & Premium OTT Streaming India`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
        type: "image/png",
      },
      // {
      //   url: `${SITE_URL}/og-image-square.png`,
      //   width: 800,
      //   height: 800,
      //   alt: SITE_NAME,
      //   type: "image/png",
      // },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Monetize Your Short Videos`,
    description: SITE_DESCRIPTION,
    creator: TWITTER_HANDLE,
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-US": `${SITE_URL}/en-US`,
    },
  },
};

export function createPageMetadata(
  title: string,
  description: string,
  keywords?: string[],
  path?: string,
  imageUrl?: string
): Metadata {
  const fullUrl = path ? `${SITE_URL}${path}` : SITE_URL;

  return {
    ...baseMetadata,
    title,
    description,
    keywords: keywords ? keywords : DEFAULT_KEYWORDS,
    openGraph: {
      ...baseMetadata.openGraph,
      title,
      description,
      url: fullUrl,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: title,
              type: "image/png",
            },
          ]
        : baseMetadata.openGraph?.images,
    },
    twitter: {
      ...baseMetadata.twitter,
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}
