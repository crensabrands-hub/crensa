import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "./metadata";

export interface JsonLdSchema {
  "@context": string;
  "@type": string;
  [key: string]: any;
}

/**
 * Organization Schema for homepage and global SEO
 */
export function getOrganizationSchema(): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: SITE_DESCRIPTION,
    image: `${SITE_URL}/og-image.png`,
    sameAs: [
      "https://www.facebook.com/CrensaPlatform",
      "https://www.twitter.com/CrensaPlatform",
      "https://www.instagram.com/CrensaPlatform",
      "https://www.youtube.com/@CrensaPlatform",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contact_type: "Support",
      email: "support@crensa.com",
      url: `${SITE_URL}/contact`,
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
      addressLocality: "India",
    },
  };
}

/**
 * Website Schema for homepage
 */
export function getWebsiteSchema(): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      query_input: "required name=search_term_string",
    },
  };
}

/**
 * Video Platform Schema
 */
export function getVideoPlatformSchema(): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "VideoSharingPlatform",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: "MediaApplication, UtilitiesApplication",
    areaServed: "IN",
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: "0",
      description: "Free to join and start creating",
    },
  };
}

/**
 * Creator Platform Schema (India-specific)
 */
export function getCreatorPlatformSchema(): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    description: "Monetise your video content on India's pay-per-view creator platform. Earn money from your videos with full IP ownership.",
    applicationCategory: "MediaApplication",
    areaServed: "IN",
    inLanguage: "en-IN",
    operatingSystem: "Web, Android, iOS",
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: "0",
      description: "Free creator account. Monetise video content with pay-per-view platform. Keep your video IP ownership.",
      areaServed: "IN",
    },
    creator: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/**
 * OTT Platform Schema (India-specific)
 */
export function getOTTPlatformSchema(): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "MovieRentalService",
    name: SITE_NAME,
    description: "Watch premium short OTT content, web series and short films in India. Pay-per-view streaming of exclusive short content.",
    areaServed: "IN",
    inLanguage: "en-IN",
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      availability: "https://schema.org/PreOrder",
      description: "Pay-per-view streaming of exclusive mini web series and short films",
      areaServed: "IN",
    },
  };
}

/**
 * Local Business Schema (India-focused)
 */
export function getLocalBusinessSchema(): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    url: SITE_URL,
    telephone: "+91-XXX-XXXX-XXXX",
    email: "contact@crensa.com",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
      addressLocality: "India",
      addressRegion: "Multiple",
    },
    areaServed: "IN",
  };
}

/**
 * Breadcrumb Schema
 */
export function getBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * FAQ Schema
 */
export function getFaqSchema(
  faqs: Array<{ question: string; answer: string }>
): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Article/Blog Post Schema
 */
export function getArticleSchema(
  title: string,
  description: string,
  url: string,
  imageUrl?: string,
  datePublished?: string,
  dateModified?: string,
  author?: string
): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    url: url,
    image: imageUrl
      ? [imageUrl]
      : [`${SITE_URL}/og-image.png`],
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: author || SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
}

/**
 * Video Object Schema
 */
export function getVideoSchema(
  title: string,
  description: string,
  videoUrl: string,
  thumbnailUrl: string,
  uploadDate?: string,
  duration?: string
): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: title,
    description: description,
    videoUrl: videoUrl,
    thumbnailUrl: [thumbnailUrl],
    uploadDate: uploadDate || new Date().toISOString(),
    duration: duration || "PT5M",
  };
}

/**
 * Product Schema (for monetization/premium features)
 */
export function getProductSchema(
  name: string,
  description: string,
  price: string,
  currency: string = "INR"
): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: name,
    description: description,
    image: `${SITE_URL}/og-image.png`,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      url: SITE_URL,
      priceCurrency: currency,
      price: price,
    },
  };
}

/**
 * Person Schema (for creator profiles)
 */
export function getPersonSchema(
  name: string,
  description: string,
  profileUrl: string,
  imageUrl?: string
): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: name,
    description: description,
    url: profileUrl,
    image: imageUrl,
    worksFor: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  };
}

/**
 * Aggregate Rating Schema
 */
export function getAggregateRatingSchema(
  ratingValue: number,
  reviewCount: number,
  name: string
): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    ratingValue: ratingValue,
    reviewCount: reviewCount,
    name: name,
  };
}
