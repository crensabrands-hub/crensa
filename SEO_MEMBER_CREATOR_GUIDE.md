# SEO Implementation for Members & Creators

This guide shows how to implement SEO for both user types on Crensa.

## Overview

| Page Type | URL Pattern | Schema Types | Purpose |
|-----------|-------------|--------------|---------|
| Creator Profile | `/profile/[username]` | Person, AggregateRating, Video | Public creator presence |
| Member Profile | `/member/[userId]` | Person, FollowAction | Private member profile |
| Creator Dashboard | `/dashboard/creator` | Not indexed | Creator admin area |
| Member Dashboard | `/dashboard/member` | Not indexed | Member admin area |
| Creator Claims | `/creator-apply` | CreativeWork | Onboarding page |
| Member Signup | `/join` | CreativeWork | Onboarding page |

---

## CREATOR PROFILE - Public SEO Page

### File: `src/app/profile/[username]/page.tsx`

```typescript
// filepath: src/app/profile/[username]/page.tsx
import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';
import { SchemaRenderer } from '@/components/schema/SchemaRenderer';
import {
  getPersonSchema,
  getAggregateRatingSchema,
  getVideoSchema,
} from '@/lib/seo/schema';
import { SITE_URL } from '@/lib/seo/metadata';

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const creator = await getCreatorByUsername(params.username);

  if (!creator) {
    return {
      title: 'Creator Not Found',
      description: 'The creator profile you are looking for does not exist.',
      robots: 'noindex',
    };
  }

  const description =
    creator.bio ||
    `Watch ${creator.name}'s exclusive videos on Crensa. Follow for updates.`;

  return createPageMetadata(
    `${creator.name} - Creator | Crensa`,
    description,
    [
      creator.name,
      'creator',
      'profile',
      ...(creator.categories || []),
      creator.verified ? 'verified creator' : '',
    ].filter(Boolean),
    `/profile/${creator.username}`,
    creator.avatarUrl || `${SITE_URL}/default-creator-avatar.png`
  );
}

export default async function CreatorProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const creator = await getCreatorByUsername(params.username);
  const stats = await getCreatorStats(creator.id);
  const recentVideos = await getCreatorVideos(creator.id, { limit: 5 });

  const schemas: any[] = [
    getPersonSchema(
      creator.name,
      creator.bio,
      `${SITE_URL}/profile/${creator.username}`,
      creator.avatarUrl,
      {
        sameAs: creator.socialLinks || [],
        location: creator.location,
        jobTitle: creator.category,
      }
    ),
  ];

  // Add aggregate rating if creator has reviews
  if (stats.avgRating && stats.ratingCount > 0) {
    schemas.push(
      getAggregateRatingSchema(
        stats.avgRating,
        stats.ratingCount,
        creator.name
      )
    );
  }

  // Add video schemas for featured videos
  if (recentVideos.length > 0) {
    recentVideos.forEach((video) => {
      const duration = `PT${Math.floor(video.duration / 60)}M${video.duration % 60}S`;
      schemas.push(
        getVideoSchema(
          video.title,
          video.description,
          `${SITE_URL}/watch/${video.id}`,
          video.thumbnailUrl,
          video.uploadedAt.toISOString(),
          duration,
          {
            channelName: creator.name,
            viewCount: video.views,
          }
        )
      );
    });
  }

  return (
    <>
      <SchemaRenderer schema={schemas} />

      {/* Your creator profile JSX */}
      <div className="creator-profile">
        {/* Profile content */}
      </div>
    </>
  );
}
```

---

## MEMBER PROFILE - Private/Semi-Public Page

### File: `src/app/member/[userId]/page.tsx`

```typescript
// filepath: src/app/member/[userId]/page.tsx
import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';
import { SchemaRenderer } from '@/components/schema/SchemaRenderer';
import { getPersonSchema } from '@/lib/seo/schema';
import { SITE_URL } from '@/lib/seo/metadata';

export async function generateMetadata({
  params,
}: {
  params: { userId: string };
}): Promise<Metadata> {
  const member = await getMemberById(params.userId);
  const isPublicProfile = member?.profileVisibility === 'public';

  if (!member || !isPublicProfile) {
    return {
      title: 'This profile is private',
      description: 'This member profile is not publicly visible.',
      robots: 'noindex', // Don't index private profiles
    };
  }

  return createPageMetadata(
    `${member.displayName} - Member | Crensa`,
    member.bio || `${member.displayName}'s profile on Crensa`,
    ['member', 'profile', 'crensa'],
    `/member/${member.id}`,
    member.profilePicture || `${SITE_URL}/default-member-avatar.png`
  );
}

export default async function MemberProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  const member = await getMemberById(params.userId);
  const isPublicProfile = member?.profileVisibility === 'public';

  if (!member || !isPublicProfile) {
    return <div>This profile is private.</div>;
  }

  const schema = getPersonSchema(
    member.displayName,
    member.bio,
    `${SITE_URL}/member/${member.id}`,
    member.profilePicture,
    {
      sameAs: member.socialLinks || [],
      location: member.location,
    }
  );

  return (
    <>
      <SchemaRenderer schema={schema} />

      {/* Your member profile JSX */}
      <div className="member-profile">
        {/* Profile content */}
      </div>
    </>
  );
}
```

---

## CREATOR DASHBOARD - Not Indexed

### File: `src/app/dashboard/creator/page.tsx`

```typescript
// filepath: src/app/dashboard/creator/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: 'noindex, nofollow', // Don't index dashboard
  title: 'Creator Dashboard - Crensa',
  description: 'Manage your creator account and content',
};

export default function CreatorDashboard() {
  return (
    <div className="creator-dashboard">
      {/* Creator dashboard content */}
    </div>
  );
}
```

---

## MEMBER DASHBOARD - Not Indexed

### File: `src/app/dashboard/member/page.tsx`

```typescript
// filepath: src/app/dashboard/member/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: 'noindex, nofollow', // Don't index dashboard
  title: 'My Dashboard - Crensa',
  description: 'Manage your account and preferences',
};

export default function MemberDashboard() {
  return (
    <div className="member-dashboard">
      {/* Member dashboard content */}
    </div>
  );
}
```

---

## CREATOR ONBOARDING - Creator Apply

### File: `src/app/creator-apply/page.tsx`

```typescript
// filepath: src/app/creator-apply/page.tsx
import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';
import { SchemaRenderer } from '@/components/schema/SchemaRenderer';
import { SITE_URL } from '@/lib/seo/metadata';

export const metadata: Metadata = createPageMetadata(
  'Become a Creator | Crensa',
  'Start earning on Crensa. Apply to become a creator and monetize your videos.',
  [
    'become creator',
    'creator program',
    'monetization',
    'earn money',
    'video creator',
  ],
  '/creator-apply'
);

export default function CreatorApplyPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: 'Crensa Creator Program',
    description: 'Apply to become a creator on Crensa and monetize your videos',
    url: `${SITE_URL}/creator-apply`,
    image: `${SITE_URL}/og-image.png`,
    creator: {
      '@type': 'Organization',
      name: 'Crensa',
      url: SITE_URL,
    },
  };

  return (
    <>
      <SchemaRenderer schema={schema} />

      {/* Creator apply form */}
      <div className="creator-apply">
        {/* Application content */}
      </div>
    </>
  );
}
```

---

## MEMBER ONBOARDING - Join/Sign Up

### File: `src/app/join/page.tsx`

```typescript
// filepath: src/app/join/page.tsx
import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';
import { SchemaRenderer } from '@/components/schema/SchemaRenderer';
import { SITE_URL } from '@/lib/seo/metadata';

export const metadata: Metadata = createPageMetadata(
  'Join Crensa | Watch & Support Creators',
  'Sign up for free to watch, support, and interact with your favorite creators.',
  ['join', 'sign up', 'membership', 'watch videos', 'support creators'],
  '/join'
);

export default function JoinPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: 'Join Crensa',
    description: 'Create a free account on Crensa to watch and support creators',
    url: `${SITE_URL}/join`,
    image: `${SITE_URL}/og-image.png`,
    creator: {
      '@type': 'Organization',
      name: 'Crensa',
      url: SITE_URL,
    },
  };

  return (
    <>
      <SchemaRenderer schema={schema} />

      {/* Join form */}
      <div className="join-page">
        {/* Sign up content */}
      </div>
    </>
  );
}
```

---

## KEY DIFFERENCES

| Aspect | Creator Profile | Member Profile |
|--------|-----------------|-----------------|
| **Visibility** | Public by default | Private by default |
| **SEO Indexing** | ✅ Yes (robots okay) | ❌ No (robots: noindex) |
| **Schema Type** | Person + Video + Rating | Person only |
| **Social Links** | Yes, featured | Optional |
| **Public Stats** | Views, followers, uploads | Not displayed |
| **Monetization Info** | Yes, donations accepted | No |
| **URL Pattern** | `/profile/[username]` | `/member/[userId]` |

---

## Implementation Checklist

- [ ] Set `profileVisibility` in member table (default: 'private')
- [ ] Add `robots: 'noindex'` to all member pages with private profiles
- [ ] Add `robots: 'noindex, nofollow'` to all dashboard pages
- [ ] Creator profiles use username (SEO-friendly, changeable)
- [ ] Member profiles use userId (non-changeable, private)
- [ ] Add social links schema for creators
- [ ] Test with Google Rich Results tester
- [ ] Submit creator pages to sitemap.xml
- [ ] Monitor indexation in Google Search Console

---

## Schema Verification

Run in terminal:
```bash
npx tsx scripts/verify-seo-setup.ts
```

This checks:
✅ Creator profile schemas
✅ Member profile noindex tags  
✅ Dashboard noindex/nofollow
✅ Dynamic metadata generation
✅ Proper URL patterns