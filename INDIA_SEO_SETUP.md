# India-Specific SEO Implementation for Crensa

## Overview

Comprehensive SEO optimization for both **Creators** and **Viewers** in India market with dual-targeting strategy.

---

## 🎯 Dual Targeting Strategy

### For Creators (Monetisation Focus)
**Target Audience**: Digital creators looking to monetise video content in India

**Primary Keywords**:
- `monetise video content`
- `pay per view platform for creators`
- `creator monetisation India`
- `video IP ownership`

**Landing Page**: `/creator-landing`  
**Expected Search Visibility**: ✅ When users search creator monetisation keywords

### For Viewers (Premium Content Focus)
**Target Audience**: Viewers looking for premium short films and web series in India

**Primary Keywords**:
- `short OTT platform`
- `watch mini web series`
- `pay per view streaming app`
- `exclusive short films India`

**Landing Page**: `/member-landing`  
**Expected Search Visibility**: ✅ When users search viewer/OTT keywords

### Brand Search
**Target Keyword**: `Crensa`

**Landing Page**: `/` (Homepage)  
**Expected Search Visibility**: ✅ Direct match, shows homepage and all pages

---

## 📋 SEO Files & Configuration

### Created/Updated Files

#### 1. **src/lib/seo/india-keywords.ts** (NEW)
Contains all India-specific keyword configurations:
- Creator keyword tiers (primary, secondary, tertiary)
- Viewer keyword tiers
- India location keywords
- SEO metadata for each landing page
- Hindi transliteration keywords

#### 2. **src/lib/seo/metadata.ts** (UPDATED)
- Changed default site description to India-focused
- Updated keywords to include both creator and viewer focus
- Changed OG locale from `en_US` to `en_IN`
- Added India-specific base metadata

#### 3. **src/lib/seo/schema.ts** (UPDATED)
New schema functions added:
- `getCreatorPlatformSchema()` - SoftwareApplication schema for creator platform
- `getOTTPlatformSchema()` - MovieRentalService schema for OTT content
- Updated existing schemas with:
  - `areaServed: "IN"`
  - `inLanguage: "en-IN"`
  - `priceCurrency: "INR"`
  - `addressCountry: "IN"`

#### 4. **src/app/layout.tsx** (UPDATED)
Root layout now renders 5 JSON-LD schemas:
```typescript
<SchemaRenderer schema={[
    getOrganizationSchema(),           // Organization
    getWebsiteSchema(),                // Website  
    getVideoPlatformSchema(),          // Video Sharing Platform
    getCreatorPlatformSchema(),        // For creator searches
    getOTTPlatformSchema()             // For viewer searches
]} />
```

#### 5. **src/app/page.tsx** (UPDATED)
Homepage metadata now uses `HOMEPAGE_SEO_INDIA` from india-keywords.ts

#### 6. **src/app/creator-landing/page.tsx** (UPDATED)
- New optimized title including all primary keywords
- India-specific description
- Keywords array covers creator monetisation domain
- Uses `getCreatorPlatformSchema()`

#### 7. **src/app/member-landing/page.tsx** (UPDATED)
- New optimized title including all viewer keywords
- India-specific OTT/streaming focused description
- Keywords array covers short OTT and premium content domain
- Uses `getOTTPlatformSchema()`

#### 8. **scripts/verify-india-seo.ts** (NEW)
Comprehensive verification script showing:
- Keyword matching in titles and descriptions
- Schema validation
- Expected search behavior scenarios
- Next steps for Google Search Console
- Google Search Console checklist

---

## 🔍 SEO Structure & Indexing

### Homepage (/)

**Meta Title**:  
`Crensa - Monetise Video Content & Watch Premium OTT | Pay Per View Platform India`

**Meta Description**:  
`Crensa: India's pay-per-view platform connecting creators and viewers. Monetise videos, keep IP ownership. Watch premium short films and web series.`

**Keywords**: 
- Primary: monetise, video, creators, OTT, India
- Secondary: pay per view, platform, short films, monetisation

**Schema Markup**:
1. Organization (Crensa, IN headquarters)
2. WebSite (Search action, en-IN language)
3. VideoSharingPlatform (Dual purpose)
4. CreatorPlatformSchema (SoftwareApplication)
5. OTTPlatformSchema (MovieRentalService)

### Creator Landing Page (/creator-landing)

**Meta Title**:  
`Monetise Video Content | Pay Per View Platform For Creators | Creator Monetisation India | Crensa`

**Meta Description**:  
`Join India's top pay-per-view creator platform. Monetise your video content and earn money directly from viewers. Retain full video IP ownership. Zero performance fees.`

**Keywords**:
- Monetise video content ✅
- Pay per view platform for creators ✅
- Creator monetisation India ✅
- Video IP ownership ✅
- Earn money from videos India
- Creator earnings platform
- Video monetisation

**Schema Markup**:
- CreatorPlatformSchema (SoftwareApplication)
  - Description: India-focused creator monetisation
  - Offer: `Monetise video content with pay-per-view platform. Keep your video IP ownership.`
  - areaServed: `IN`
  - priceCurrency: `INR`

### Viewer/Member Landing Page (/member-landing)

**Meta Title**:  
`Watch Short OTT Platform | Mini Web Series | Pay Per View Streaming App India | Crensa`

**Meta Description**:  
`Watch exclusive mini web series, short films and OTT content in India. Pay-per-view streaming platform with premium short content. Support creators directly.`

**Keywords**:
- Short OTT platform ✅
- Watch mini web series ✅
- Pay per view streaming app ✅
- Exclusive short films India ✅
- Premium short content
- Web series streaming
- Mini series platform

**Schema Markup**:
- OTTPlatformSchema (MovieRentalService)
  - Description: India's premium short content platform
  - Offer: `Pay-per-view streaming of exclusive mini web series and short films`
  - areaServed: `IN`
  - priceCurrency: `INR`

---

## 📊 Expected Google Search Results

### Creator Searches

| User Searches | Expected Result | Why |
|---|---|---|
| `monetise video content` | Creator landing shows prominently | Primary keyword in title |
| `pay per view platform for creators` | Creator landing shows | Exact phrase in title + schema |
| `creator monetisation India` | Creator landing shows | Primary keyword + India focus |
| `video IP ownership` | Creator landing shows | USP in title and description |
| `earn money from videos India` | Creator landing in top 5 | Secondary keyword in description |
| `content creator platform India` | Creator landing shows | Creator platform schema matches |

### Viewer/OTT Searches

| User Searches | Expected Result | Why |
|---|---|---|
| `short OTT platform` | Member landing shows | Primary keyword in title |
| `watch mini web series` | Member landing shows prominently | Exact phrase in title |
| `pay per view streaming app` | Member landing shows | Keyword in title + app context |
| `exclusive short films India` | Member landing shows | Primary keyword + India focus |
| `web series watch online` | Member landing in top 5 | OTT platform schema matches |
| `short films streaming` | Member landing + rich results | Schema markup provides rich results |

### Brand Searches

| User Searches | Expected Result | Why |
|---|---|---|
| `Crensa` | Homepage + all pages | Brand name, direct match |
| `Crensa creator platform` | Creator landing shows | Targeted page for creators |
| `Crensa OTT` | Member landing shows | Targeted page for viewers |
| `Crensa monetise videos` | Creator landing shows | Creator monetisation focus |

---

## 🚀 Setup & Verification

### Current Status

✅ **Implemented**:
- Dual-targeting strategy for creators and viewers
- India-specific keywords and descriptions
- 5 JSON-LD schema types covering both audiences
- Optimized page titles and meta descriptions
- Location-based schema (areaServed: "IN")
- Language specification (en-IN)
- INR currency in pricing schema

⚠️ **Required Actions**:

### Step 1: Complete Google Search Console Setup

```
1. Go to Google Search Console (https://search.google.com/search-console)
2. Add your property
3. Get verification code
4. Add to src/app/layout.tsx:
   <meta name="google-site-verification" content="YOUR_CODE" />
5. Verify ownership
```

### Step 2: Submit Sitemaps

```
1. In Google Search Console
2. Go to Sitemaps section
3. Submit: https://crensa.com/sitemap.xml
```

### Step 3: Test Rich Results

for each URL:
```
https://search.google.com/test/rich-results

Paste URLs:
- https://crensa.com
- https://crensa.com/creator-landing
- https://crensa.com/member-landing
```

Expected results:
- ✅ Organization schema (all pages)
- ✅ Creator Platform schema (creator-landing)
- ✅ OTT Platform schema (member-landing)

### Step 4: Monitor in Search Console

After 24-48 hours:
```
1. Coverage tab → Check indexing status
2. Performance tab → Monitor keyword rankings
3. Mobile Usability → Ensure responsive
4. Core Web Vitals → Monitor performance
```

---

## 📈 Keyword Tracking

Monitor these keywords in Google Search Console Performance tab:

### Creator Keywords (Track Target: Top 5 positions)
- monetise video content
- pay per view platform for creators
- creator monetisation India
- video IP ownership
- earn money from videos India

### Viewer Keywords (Track Target: Top 5 positions)
- short OTT platform
- watch mini web series
- pay per view streaming app
- exclusive short films India
- short films streaming

### Brand Keywords (Track Target: Position 1)
- Crensa
- Crensa creator platform
- Crensa OTT

---

## 🎯 SEO Strategy Summary

### Approach
**Dual-landing page strategy** targeting two distinct audiences:
1. **Creators**: Focus on monetisation, earnings, IP ownership
2. **Viewers**: Focus on premium content, exclusive access, short films

### Implementation
- Each landing page optimized for specific keyword cluster
- India-specific language, currency, location in all schemas
- Root layout includes both platform schemas for maximum crawl efficiency
- Homepage bridges both audiences

### Expected Impact (Timeline)

**Week 1-2**: 
- Google crawls and indexes new pages
- Monitor in Search Console for errors

**Week 2-4**:
- Pages start appearing in search results
- Begin tracking positions in Performance tab
- Expect initial rankings for high-volume keywords

**Month 1-3**:
- Improve rankings with content updates
- Monitor which keywords get impressions
- Optimize descriptions based on CTR data

**Month 3+**:
- Target top 5 positions for primary keywords
- Build quality backlinks to support rankings
- Create content hub for long-tail keywords

---

## 📝 Continuous Optimization

### Monthly Tasks
- [ ] Check Google Search Console Performance tab
- [ ] Monitor CTR for each keyword
- [ ] Check page indexing status
- [ ] Review Core Web Vitals

### Quarterly Tasks
- [ ] Optimize descriptions based on CTR data
- [ ] Add fresh content targeting long-tail keywords
- [ ] Build internal linking strategy
- [ ] Research competitor rankings

### Annually
- [ ] Comprehensive SEO audit
- [ ] Update keyword strategy based on performance
- [ ] Refresh old content
- [ ] Review and update schema markup

---

## 🔗 Related Files

- **Keyword Configuration**: [src/lib/seo/india-keywords.ts](../src/lib/seo/india-keywords.ts)
- **Schema Definitions**: [src/lib/seo/schema.ts](../src/lib/seo/schema.ts)
- **Metadata Config**: [src/lib/seo/metadata.ts](../src/lib/seo/metadata.ts)
- **Verification Script**: [scripts/verify-india-seo.ts](verify-india-seo.ts)
- **SEO Implementation Guide**: [SEO_IMPLEMENTATION.md](../SEO_IMPLEMENTATION.md)

---

## ✅ Verification

Run the verification script to confirm all settings:

```bash
npx tsx scripts/verify-india-seo.ts
```

Expected output shows:
- ✅ Creator keywords matched in titles/descriptions
- ✅ Viewer keywords matched in titles/descriptions
- ✅ All 5 schema types present
- ✅ India location settings (IN, en-IN, INR)
- ✅ Search scenarios with expected results

---

**Implementation Date**: February 14, 2026  
**Next Review**: May 14, 2026  
**Last Updated**: February 14, 2026
