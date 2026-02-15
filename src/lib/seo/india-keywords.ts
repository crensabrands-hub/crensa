/**
 * India-Specific SEO Configuration
 * Keywords and metadata optimized for Indian creator and viewer audiences
 */

export const CREATOR_KEYWORDS_INDIA = {
  primary: [
    "monetise video content",
    "pay per view platform for creators",
    "creator monetisation India",
    "video IP ownership",
  ],
  secondary: [
    "earn money from videos India",
    "creator platform pay per view",
    "video monetisation platform",
    "content creator platform India",
    "creator earnings platform",
    "short video monetisation",
  ],
  tertiary: [
    "how to monetise videos in India",
    "best creator platform India",
    "video creator payment app",
    "creator monetization tools",
    "digital creator platform",
    "video content creator earnings",
    "independent creator platform",
    "creator fund alternative",
  ],
};

export const VIEWER_KEYWORDS_INDIA = {
  primary: [
    "short OTT platform",
    "watch mini web series",
    "pay per view streaming app",
    "exclusive short films India",
  ],
  secondary: [
    "short content streaming",
    "mini web series platform",
    "OTT platform India",
    "web series watch online",
    "short films streaming",
    "premium short content",
  ],
  tertiary: [
    "best OTT platform for web series",
    "watch original web series India",
    "premium short films app",
    "episodic content platform",
    "independent web series platform",
    "creator-focused OTT",
    "short film streaming service",
    "watch new web series online",
  ],
};

export const LOCATION_KEYWORDS_INDIA = [
  "India",
  "Indian creators",
  "made in India",
  "Indian platform",
];

export const HINDI_TRANSLITERATION_KEYWORDS = {
  creator: ["creator", "creator platform", "content creator"],
  monetise: [
    "monetise",
    "monetize",
    "earning from videos",
    "video earnings",
  ],
  india: ["India", "Indian", "India based", "India payment", "India creators"],
};

/**
 * SEO Configuration for Creator Landing Page
 */
export const CREATOR_LANDING_SEO_INDIA = {
  title:
    "Monetise Video Content | Pay Per View Creator Platform India | Crensa",
  description:
    "Join India's top pay-per-view creator platform. Monetise your video content and earn money directly from viewers. Retain full video IP ownership. Zero performance fees.",
  keywords: [...CREATOR_KEYWORDS_INDIA.primary, ...CREATOR_KEYWORDS_INDIA.secondary],
  ogTitle: "Monetise Video Content with Pay Per View Platform | Crensa India",
  ogDescription:
    "Earn money from your videos. Creator platform with pay-per-view model. Keep your video IP ownership in India.",
  ogImage: "https://crensa.com/og-image.png",
};

/**
 * SEO Configuration for Viewer/Member Landing Page
 */
export const VIEWER_LANDING_SEO_INDIA = {
  title: "Watch Premium Short Films & OTT Content India | Pay Per View Streaming | Crensa",
  description:
    "Watch exclusive mini web series, short films and OTT content in India. Pay-per-view streaming platform with premium short content. Support creators directly.",
  keywords: [...VIEWER_KEYWORDS_INDIA.primary, ...VIEWER_KEYWORDS_INDIA.secondary],
  ogTitle: "Premium Short OTT & Web Series | Watch Pay Per View | Crensa India",
  ogDescription:
    "Exclusive mini web series and short films. Premium OTT content. Support creators directly.",
  ogImage: "https://crensa.com/og-image.png",
};

/**
 * SEO Configuration for Homepage
 */
export const HOMEPAGE_SEO_INDIA = {
  title:
    "Crensa - Monetise Video Content & Watch Premium OTT | Pay Per View Platform India",
  description:
    "Crensa: India's pay-per-view platform connecting creators and viewers. Monetise videos, keep IP ownership. Watch premium short films and web series.",
  keywords: [
    ...CREATOR_KEYWORDS_INDIA.primary,
    ...VIEWER_KEYWORDS_INDIA.primary,
    "Crensa",
    "pay per view India",
  ],
  ogTitle: "Crensa - Creator Platform & Premium OTT Streaming India",
  ogDescription:
    "Monetise your videos as a creator. Watch premium short content as viewer. Pay-per-view platform for India.",
  ogImage: "https://crensa.com/og-image.png",
};

/**
 * Long-form SEO content topics for blog/resources
 */
export const CONTENT_TOPICS_INDIA = [
  "How to monetise short videos as an independent creator in India",
  "Best creator platforms in India 2026 for earning money",
  "Understanding video IP ownership on creator platforms",
  "Top pay-per-view platforms for content monetisation in India",
  "Guide to becoming a digital creator and earning money in India",
  "Web series production and distribution for Indian creators",
  "How to watch and support creators on OTT platforms",
  "Exclusive short films and web series platforms in India",
  "Creator economy in India - trends and platforms",
  "How to start earning from video content in India",
];

/**
 * Local Business Information for India
 */
export const INDIA_LOCAL_INFO = {
  country: "IN",
  language: "en-IN",
  currency: "INR",
  defaultCity: "India",
  timezone: "IST",
  supportPhone: "+91-XXX-XXXX-XXXX",
  supportEmail: "support@crensa.com",
  headquartersRegion: "India",
};

/**
 * Get India-specific metadata for dynamic pages
 */
export function getIndiaMetadata(
  pageType: "creator" | "viewer" | "home"
): {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
} {
  switch (pageType) {
    case "creator":
      return CREATOR_LANDING_SEO_INDIA;
    case "viewer":
      return VIEWER_LANDING_SEO_INDIA;
    case "home":
      return HOMEPAGE_SEO_INDIA;
    default:
      return HOMEPAGE_SEO_INDIA;
  }
}

/**
 * Generate schema markup text for India market
 */
export const INDIA_SCHEMA_CONTEXT = {
  areaServed: "IN",
  inLanguage: "en-IN",
  priceCurrency: "INR",
  country: {
    "@type": "Country",
    name: "India",
  },
};

export default {
  CREATOR_KEYWORDS_INDIA,
  VIEWER_KEYWORDS_INDIA,
  CREATOR_LANDING_SEO_INDIA,
  VIEWER_LANDING_SEO_INDIA,
  HOMEPAGE_SEO_INDIA,
  INDIA_LOCAL_INFO,
  getIndiaMetadata,
};
