# SEO Quick Reference Guide

## For Developers Adding New Pages

### 1. Adding Metadata to a New Page

For a new page `/feature-page`:

```typescript
// src/app/feature-page/page.tsx
import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = createPageMetadata(
  'Feature Page Title - Crensa',
  'Write a compelling description that appears in search results (155 chars max)',
  [
    'keyword1',
    'keyword2',
    'keyword3',
  ],
  '/feature-page',
  'https://crensa.com/og-image-feature.png'
);

export default function FeaturePage() {
  return (
    <>
      {/* Your page content */}
    </>
  );
}
```

### 2. Adding Schema to a Dynamic Page

For dynamic routes like `/profile/[username]`:

```typescript
// src/app/profile/[username]/page.tsx
import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';
import { SchemaRenderer } from '@/components/schema/SchemaRenderer';
import { getPersonSchema } from '@/lib/seo/schema';
import { SITE_URL } from '@/lib/seo/metadata';

export async function generateMetadata({
  params,
}): Promise<Metadata> {
  const creator = await getCreatorData(params.username);

  return createPageMetadata(
    `${creator.name} - Creator on Crensa`,
    `Watch and support ${creator.name}'s videos. ${creator.bio}`,
    [creator.name, 'creator', 'videos'],
    `/profile/${params.username}`,
    creator.avatarUrl
  );
}

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const creator = await getCreatorData(params.username);

  return (
    <>
      <SchemaRenderer
        schema={getPersonSchema(
          creator.name,
          creator.bio,
          `${SITE_URL}/profile/${creator.username}`,
          creator.avatarUrl
        )}
      />
      {/* Profile content */}
    </>
  );
}
```

### 3. Adding Video Schema

For video watch pages:

```typescript
import { SchemaRenderer } from '@/components/schema/SchemaRenderer';
import { getVideoSchema } from '@/lib/seo/schema';
import { getDateFormatted } from '@/lib/utils/date';

export default function WatchPage() {
  const video = useVideoData();

  return (
    <>
      <SchemaRenderer
        schema={getVideoSchema(
          video.title,
          video.description,
          video.playbackUrl,
          video.thumbnailUrl,
          getDateFormatted(video.uploadedAt),
          calculateDuration(video) // PT5M format
        )}
      />
      {/* Video player */}
    </>
  );
}
```

### 4. Adding FAQ Schema

For help/FAQ pages:

```typescript
import { SchemaRenderer } from '@/components/schema/SchemaRenderer';
import { getFaqSchema } from '@/lib/seo/schema';

const faqs = [
  {
    question: 'How do I monetize my videos?',
    answer: 'You can monetize your videos by uploading them and setting a price. Viewers pay credits to watch.',
  },
  // ... more FAQs
];

export default function HelpPage() {
  return (
    <>
      <SchemaRenderer schema={getFaqSchema(faqs)} />
      {/* FAQ content */}
    </>
  );
}
```

### 5. Adding Breadcrumb Schema

For multi-level navigation:

```typescript
import { SchemaRenderer } from '@/components/schema/SchemaRenderer';
import { getBreadcrumbSchema } from '@/lib/seo/schema';
import { SITE_URL } from '@/lib/seo/metadata';

export default function CategoryPage() {
  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    { name: 'Discover', url: `${SITE_URL}/discover` },
    { name: 'Music', url: `${SITE_URL}/discover/music` },
  ];

  return (
    <>
      <SchemaRenderer schema={getBreadcrumbSchema(breadcrumbs)} />
      {/* Page content */}
    </>
  );
}
```

## Image Optimization Tips

### OG Images
Create images with:
- **Dimensions**: 1200x630px (16:9 ratio)
- **Format**: PNG or JPG
- **Colors**: Brand colors + good contrast
- **Text**: Page title + brand name
- **Size**: < 200KB

### Twitter Images
- **Dimensions**: 1200x675px
- **Format**: PNG or JPG
- **Size**: < 150KB

### Tools
- Figma - Design custom OG images
- Canva - Quick OG image templates
- [OG Image Generator](https://www.opengraphicsdesigner.com/)
- Social Media Image Sizes - [Buffer Guide](https://buffer.com/library/social-media-image-sizes/)

## Images to Create

Priority order:

1. **og-image.png** (1200x630) - General/homepage
2. **og-image-creator.png** - Creator landing
3. **og-image-discover.png** - Discover page
4. **og-image-member.png** - Member benefits
5. **twitter-image.png** (1200x675) - General Twitter
6. **og-image-about.png** - About page
7. **og-image-browse.png** - Browse page
8. **og-image-contact.png** - Contact page
9. **og-image-help.png** - Help page
10. **og-image-privacy.png** - Privacy
11. **og-image-terms.png** - Terms
12. **og-image-guidelines.png** - Community guidelines

## Meta Description Best Practices

### Do's
✅ 155 characters or less (Google typically shows 155-160)
✅ Include primary keyword
✅ Write naturally and compelling
✅ Unique per page
✅ Call to action when appropriate

### Examples

**Home Page**
"Join Crensa, the platform where content creators earn money from short videos through our pay-per-view credit system. No performance fees, just earnings."

**Creator Landing**
"Join thousands of creators on Crensa. Upload short videos, build your audience, and earn money through our pay-per-view credit system. No performance fees."

**Discover Page**
"Discover amazing short videos from talented creators on Crensa. Browse trending content, explore categories, and find videos that match your interests."

**About Page**
"Learn about Crensa, our mission to empower content creators, and how we're building the future of video monetization."

## Keyword Strategy

### Primary Keywords (High Volume, High Intent)
- video monetization
- monetize short videos
- content creator platform
- pay-per-view videos
- video platform creators

### Secondary Keywords
- earn money from videos
- short video creator
- get paid for videos
- creator earnings platform
- video monetization platform

### Long-Tail Keywords
- how to monetize short videos on TikTok alternative
- best platform to monetize video content
- earn money from video creation
- free video monetization platform
- video creator payment platform

## Monitoring & Testing

### Before Launch Checklist
- [ ] Meta descriptions (155 chars)
- [ ] Page titles (50-60 chars)
- [ ] OG images created (1200x630)
- [ ] Keywords included naturally
- [ ] Internal links added
- [ ] Schema markup validated
- [ ] Mobile preview tested
- [ ] Lighthouse score > 80

### Testing Tools

1. **Google Rich Results Test**
   - URL: https://search.google.com/test/rich-results
   - Test schema markup

2. **Google Mobile-Friendly Test**
   - URL: https://search.google.com/test/mobile-friendly
   - Check mobile usability

3. **Meta Tags Debugger**
   - URL: https://developers.facebook.com/tools/debug/
   - Preview OG tags

4. **Twitter Card Validator**
   - URL: https://cards-dev.twitter.com/validator
   - Preview Twitter cards

## Common Mistakes to Avoid

❌ Keyword stuffing - Use keywords naturally (2-3% keyword density)
❌ Duplicate content - Each page should be unique
❌ Duplicate meta descriptions - Write unique descriptions
❌ Missing alt text - Always add descriptive alt text to images
❌ Slow page speed - Optimize images and code
❌ Mobile unfriendly - Test on mobile devices
❌ Missing mobile metadata - Ensure mobile-responsive design
❌ Broken internal links - Regular link audits
❌ Not optimizing images - Compress before upload
❌ Missing schema markup - Add schema for rich results

## Commands

```bash
# Verify SEO setup
npm run verify-seo

# Or manually
npx tsx scripts/verify-seo-setup.ts

# Build and start locally
npm run build
npm run start

# Open local site
http://localhost:3000

# Test with Google Search Console
# 1. Add property
# 2. Submit sitemap: /sitemap.xml
# 3. Monitor for 24-48 hours
```

## Resources

### Google Tools
- [Google Search Console](https://search.google.com/search-console) - Monitor indexing
- [Google Rich Results Test](https://search.google.com/test/rich-results) - Test schema
- [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly) - Test mobile
- [Google PageSpeed Insights](https://pagespeed.web.dev/) - Performance metrics

### SEO Tools
- [Ahrefs](https://ahrefs.com/) - Backlink analysis
- [SEMrush](https://www.semrush.com/) - Keyword research
- [Moz](https://moz.com/) - SEO insights
- [Yoast](https://yoast.com/) - Content optimization

### Schema & Structured Data
- [Schema.org](https://schema.org/) - Schema documentation
- [JSON-LD Play](https://json-ld.org/) - JSON-LD tools
- [MDN Structured Data](https://developer.mozilla.org/en-US/docs/Glossary/Metadata) - Metadata guide

### Learning
- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Next.js SEO](https://nextjs.org/learn/seo/introduction-to-seo)
- [Moz SEO Guide](https://moz.com/beginners-guide-to-seo)

## Support

### Questions?
1. Check [SEO_IMPLEMENTATION.md](../SEO_IMPLEMENTATION.md) for detailed setup
2. Run `npx tsx scripts/verify-seo-setup.ts` for diagnostics
3. Review Google Search Console for indexing issues
4. Test with Rich Results Test tool

---

**Last Updated**: February 2026
