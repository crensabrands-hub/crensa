# SEO Implementation Guide for Crensa

This document outlines the SEO setup implemented for Crensa to improve indexing and ranking in Google Search.

## ✅ Completed SEO Setup

### 1. Metadata Configuration
- **File**: `src/lib/seo/metadata.ts`
- Created centralized metadata configuration with:
  - Base metadata with OpenGraph and Twitter Card support
  - Page-specific metadata helper function
  - Consistent keywords and descriptions
  - Proper canonical URLs
  - Mobile and PWA optimizations

### 2. JSON-LD Structured Data
- **File**: `src/lib/seo/schema.ts`
- Implemented schema.org schemas for:
  - Organization schema (company information)
  - Website schema (with search action)
  - Video platform schema
  - Local business schema (skeleton - update with your details)
  - Breadcrumb navigation
  - FAQ pages
  - Articles/blog posts
  - Video objects
  - Product schemas
  - Person schemas (for creator profiles)
  - Aggregate ratings

### 3. Schema Renderer Component
- **File**: `src/components/schema/SchemaRenderer.tsx`
- Renders JSON-LD scripts in page head
- Safely handles structured data injection

### 4. Sitemap Generation
- **File**: `src/app/sitemap.ts`
- Auto-generated XML sitemap at `/sitemap.xml`
- Includes:
  - Home, browse, discover pages (high priority)
  - Creator and member landing pages
  - About, contact, help pages
  - Legal pages (privacy, terms, community guidelines)
  - Proper change frequency and priority settings

### 5. Robots.txt Configuration
- **File**: `src/app/robots.ts`
- Allows Google crawlers full access to public pages
- Blocks private/admin pages from indexing
- Specifies sitemap location
- Sets proper user-agent rules

### 6. Enhanced Page Metadata
Updated key pages with SEO metadata:
- ✅ Home page (layout)
- ✅ About page (`/about`)
- ✅ Creator landing page (`/creator-landing`)
- ✅ Browse page (`/browse`)
- ✅ Discover page (`/discover`)
- ✅ Contact page (`/contact`)
- ✅ Help page (`/help`)
- ✅ Privacy policy (`/privacy`)
- ✅ Terms of service (`/terms`)
- ✅ Community guidelines (`/community-guidelines`)

## 🔧 Configuration TODO

### 1. Replace Placeholder Values
In `src/lib/seo/metadata.ts`, update:

```typescript
// Update this with your actual domain
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://crensa.com";

// Update social media handles
export const TWITTER_HANDLE = "@CrensaPlatform";

// Create and add OG images
// Reference in metadata: `${SITE_URL}/og-image.png`
```

### 2. Add Verification Tags to Layout
In `src/app/layout.tsx`, replace:
```html
<meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE" />
<meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_CODE" />
```

**Actions:**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property and get the verification code
3. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
4. Add your property and get the verification code

### 3. Generate Open Graph Images
Create OG images and place in `public/` folder:
- `og-image.png` (1200x630px) - General OG image
- `og-image-square.png` (800x800px) - Alternative format
- `twitter-image.png` (1200x675px) - Twitter specific
- `og-image-about.png` - For about page
- `og-image-creator.png` - For creator landing
- `og-image-discover.png` - For discover page
- `og-image-browse.png` - For browse page
- Additional images for contact, help, privacy, terms, guidelines

### 4. Update Local Business Schema
If you have physical offices, update in `src/lib/seo/schema.ts`:
```typescript
export function getLocalBusinessSchema(): JsonLdSchema {
  return {
    // ... update with your actual address and coordinates
    address: {
      streetAddress: "Your Street Address",
      addressLocality: "Your City",
      addressRegion: "YR",
      postalCode: "12345",
      addressCountry: "US",
    },
    geo: {
      latitude: "40.7128",
      longitude: "-74.0060",
    },
  };
}
```

### 5. Environment Variables
Ensure you have in `.env.local`:
```
NEXT_PUBLIC_SITE_URL=https://crensa.com
```

## 📊 SEO Checklist

### Technical SEO
- ✅ XML Sitemap generated
- ✅ Robots.txt configured
- ✅ Canonical URLs implemented
- ✅ Mobile-responsive design
- ✅ Fast page load optimization (preload, dns-prefetch)
- ✅ PWA configuration
- ✅ Proper heading hierarchy (H1, H2, etc.)
- ✅ Meta descriptions optimized
- ✅ Open Graph tags
- ✅ Twitter Card tags

### On-Page SEO
- ✅ Page titles (with templates)
- ✅ Meta descriptions
- ✅ Keywords optimization
- ✅ Internal linking structure
- ✅ Schema markup (multiple schema types)
- ⚠️ Image alt text (needs implementation on images)
- ⚠️ Structured data for creator profiles (dynamic)
- ⚠️ Video schema for video content (dynamic)

### Off-Page SEO
- ⚠️ Backlink profile (external)
- ⚠️ Social media signals (external)
- ⚠️ Brand mentions (external)

## 🚀 Implementation for Dynamic Pages

### Creator Profile Pages
For creator profile pages (e.g., `/profile/[username]`), use `generateMetadata`:

```typescript
import { generateMetadata } from 'next';
import { getPersonSchema } from '@/lib/seo/schema';
import { SchemaRenderer } from '@/components/schema/SchemaRenderer';

export async function generateMetadata({ params }) {
  const creator = await getCreatorData(params.username);
  return createPageMetadata(
    `${creator.name} - Creator on Crensa`,
    `Watch videos from ${creator.name} on Crensa. ${creator.bio}`,
    [creator.name, 'creator', 'videos'],
    `/profile/${params.username}`,
    creator.avatarUrl
  );
}

export default function ProfilePage() {
  return (
    <>
      <SchemaRenderer schema={getPersonSchema(
        creator.name,
        creator.bio,
        `${SITE_URL}/profile/${creator.username}`,
        creator.avatarUrl
      )} />
      {/* Page content */}
    </>
  );
}
```

### Video Pages
For individual video pages (e.g., `/watch/[videoId]`), use `generateMetadata`:

```typescript
export async function generateMetadata({ params }) {
  const video = await getVideoData(params.videoId);
  return createPageMetadata(
    video.title,
    video.description,
    video.tags,
    `/watch/${params.videoId}`,
    video.thumbnailUrl
  );
}

export default function WatchPage() {
  return (
    <>
      <SchemaRenderer schema={getVideoSchema(
        video.title,
        video.description,
        video.videoUrl,
        video.thumbnailUrl,
        video.uploadDate,
        video.duration
      )} />
      {/* Video player */}
    </>
  );
}
```

## 🔍 Testing & Monitoring

### On-Page Testing
1. **Google Search Console**
   - Submit sitemap: Search Console > Sitemaps > Add new sitemap
   - Monitor indexing status
   - Check for crawl errors
   - Review Core Web Vitals

2. **Rich Results Testing**
   - [Google Rich Results Test](https://search.google.com/test/rich-results)
   - Test individual page URLs
   - Verify schema markup validation

3. **Mobile Testing**
   - [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
   - Ensure responsive design
   - Check mobile usability issues

### Tools to Use
- [SEMrush](https://semrush.com) - Keyword research, competitor analysis
- [Ahrefs](https://ahrefs.com) - Backlink analysis
- [Moz](https://moz.com) - SEO insights
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance audit

## 📝 Content Recommendations

### Blog/Content Strategy
1. Create blog posts targeting long-tail keywords related to video creation
2. Write guides on monetization, best practices, platform features
3. Create FAQ content (already structured with schema)
4. Produce video content showcasing success stories

### Keyword Targets
Primary keywords:
- video monetization
- short video platform
- creator economy
- pay-per-view videos
- content creator earning

Long-tail keywords:
- how to monetize short videos
- best platform for video creators
- earn money from video content
- creator payment platform
- short video monetization platform

## ⚙️ Performance Optimization

Current optimizations in place:
- DNS prefetch for Google Fonts
- Preconnect to critical resources
- Image optimization (Next.js Image component)
- Font optimization (next/font)
- Preload critical assets

Additional recommendations:
1. Enable Gzip compression
2. Implement proper caching headers
3. Use a CDN for static assets
4. Optimize JavaScript bundle
5. Lazy-load below-fold content

## 📞 Support & Maintenance

### Regular Tasks
- Monthly: Review Google Search Console data
- Monthly: Monitor keyword rankings
- Quarterly: Audit internal links
- Quarterly: Update stale content
- Quarterly: Check for broken links
- Annually: Comprehensive SEO audit

### When Adding New Pages
1. Create metadata using `createPageMetadata` helper
2. Add to sitemap.ts if main navigation page
3. Add JSON-LD schema if applicable
4. Implement proper heading structure
5. Optimize images with alt text
6. Create quality content (500+ words)
7. Add to internal linking strategy

### When Updating Content
1. Update meta descriptions if changed
2. Update keywords if targeting new terms
3. Update OG images if visual changed
4. Verify schema still applies
5. Check for broken internal links

## 🎯 Quick Reference

### Files to Update
| File | Purpose |
|------|---------|
| `src/lib/seo/metadata.ts` | Site-wide metadata config |
| `src/lib/seo/schema.ts` | Schema definitions |
| `src/components/schema/SchemaRenderer.tsx` | Schema rendering |
| `src/app/layout.tsx` | Global head tags + root schema |
| `src/app/sitemap.ts` | Sitemap configuration |
| `src/app/robots.ts` | Robots.txt rules |
| Individual page files | Page-specific metadata |

### Metadata Helper Usage
```typescript
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata(
  'Page Title',
  'Page description',
  ['keyword1', 'keyword2'],
  '/page-path',
  'https://crensa.com/og-image.png'
);
```

### Schema Renderer Usage
```typescript
import { SchemaRenderer } from '@/components/schema/SchemaRenderer';
import { getOrganizationSchema } from '@/lib/seo/schema';

export default function Page() {
  return (
    <>
      <SchemaRenderer schema={getOrganizationSchema()} />
      {/* Page content */}
    </>
  );
}
```

---

**Last Updated**: February 2026
**Next Review Date**: May 2026
