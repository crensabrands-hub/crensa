/**
 * Example: Adding SEO to Dynamic Pages
 * 
 * This file shows templates for adding SEO to dynamic routes
 * like /watch/[videoId] and /profile/[username]
 * 
 * Copy these templates to your actual page files and customize
 */

// ============================================================================
// EXAMPLE 1: Video Watch Page
// ============================================================================
// File: src/app/watch/[videoId]/page.tsx

/*
import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';
import { SchemaRenderer } from '@/components/schema/SchemaRenderer';
import { getVideoSchema } from '@/lib/seo/schema';
import { SITE_URL } from '@/lib/seo/metadata';

// For dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: { videoId: string };
}): Promise<Metadata> {
  const video = await getVideoData(params.videoId);

  if (!video) {
    return createPageMetadata(
      'Video Not Found',
      'The video you are looking for does not exist.',
      ['video not found'],
      `/watch/${params.videoId}`
    );
  }

  return createPageMetadata(
    video.title,
    video.description || `Watch ${video.creator.name} on Crensa`,
    [...(video.tags || []), video.creator.name, 'watch video'],
    `/watch/${params.videoId}`,
    video.thumbnailUrl
  );
}

export default async function WatchPage({
  params,
}: {
  params: { videoId: string };
}) {
  const video = await getVideoData(params.videoId);

  // Calculate duration in ISO 8601 format (e.g., "PT5M30S")
  const duration = `PT${Math.floor(video.duration / 60)}M${video.duration % 60}S`;

  return (
    <>
      <SchemaRenderer
        schema={getVideoSchema(
          video.title,
          video.description,
          `${SITE_URL}/watch/${video.id}`, // Direct video URL
          video.thumbnailUrl,
          video.uploadedAt.toISOString(),
          duration
        )}
      />
      
      {/* Your video player component */}
    </>
  );
}
*/

// ============================================================================
// EXAMPLE 2: Creator Profile Page
// ============================================================================
// File: src/app/profile/[username]/page.tsx

/*
import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';
import { SchemaRenderer } from '@/components/schema/SchemaRenderer';
import { getPersonSchema, getAggregateRatingSchema } from '@/lib/seo/schema';
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
    };
  }

  return createPageMetadata(
    `${creator.name} - Creator on Crensa`,
    creator.bio || `Watch and support ${creator.name}'s videos on Crensa`,
    [creator.name, 'creator', creator.category || 'videos'],
    `/profile/${creator.username}`,
    creator.avatarUrl
  );
}

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const creator = await getCreatorByUsername(params.username);
  const stats = await getCreatorStats(creator.id);

  const schemas = [
    getPersonSchema(
      creator.name,
      creator.bio,
      `${SITE_URL}/profile/${creator.username}`,
      creator.avatarUrl
    ),
  ];

  // Add rating schema if creator has ratings
  if (stats.rating && stats.ratingCount > 0) {
    schemas.push(
      getAggregateRatingSchema(
        stats.rating,
        stats.ratingCount,
        creator.name
      )
    );
  }

  return (
    <>
      <SchemaRenderer schema={schemas} />
      
      {/* Profile content */}
    </>
  );
}
*/

// ============================================================================
// EXAMPLE 3: Search Results Page
// ============================================================================
// File: src/app/search/page.tsx

/*
import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';

export function generateMetadata({
  searchParams,
}: {
  searchParams: { q: string };
}): Metadata {
  const query = decodeURIComponent(searchParams.q || '');

  return createPageMetadata(
    `Search results for "${query}" - Crensa`,
    `Find videos and creators related to "${query}" on Crensa`,
    [query, 'search', 'videos', 'creators'],
    `/search?q=${encodeURIComponent(query)}`
  );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q: string };
}) {
  return (
    <>
      {/* Search results content */}
    </>
  );
}
*/

// ============================================================================
// EXAMPLE 4: Category/Collection Page
// ============================================================================
// File: src/app/category/[slug]/page.tsx

/*
import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';
import { SchemaRenderer } from '@/components/schema/SchemaRenderer';
import { getBreadcrumbSchema } from '@/lib/seo/schema';
import { SITE_URL } from '@/lib/seo/metadata';

const CATEGORIES = {
  music: {
    title: 'Music Videos',
    description: 'Discover amazing music videos from talented creators',
  },
  dance: {
    title: 'Dance Videos',
    description: 'Watch incredible dance performances and choreography',
  },
  comedy: {
    title: 'Comedy Videos',
    description: 'Laugh with hilarious comedy content from creators',
  },
  education: {
    title: 'Educational Videos',
    description: 'Learn something new with educational content',
  },
};

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const category = CATEGORIES[params.slug as keyof typeof CATEGORIES];

  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The category you are looking for does not exist.',
    };
  }

  return createPageMetadata(
    `${category.title} - Browse Videos | Crensa`,
    category.description,
    [params.slug, 'videos', 'content', category.title.toLowerCase()],
    `/category/${params.slug}`,
    `${SITE_URL}/og-image-${params.slug}.png`
  );
}

export default function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = CATEGORIES[params.slug as keyof typeof CATEGORIES];

  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    { name: 'Discover', url: `${SITE_URL}/discover` },
    { name: category.title, url: `${SITE_URL}/category/${params.slug}` },
  ];

  return (
    <>
      <SchemaRenderer schema={getBreadcrumbSchema(breadcrumbs)} />
      
      {/* Category content */}
    </>
  );
}
*/

// ============================================================================
// EXAMPLE 5: Article/Blog Post Page
// ============================================================================
// File: src/app/blog/[slug]/page.tsx

/*
import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';
import { SchemaRenderer } from '@/components/schema/SchemaRenderer';
import { getArticleSchema } from '@/lib/seo/schema';
import { SITE_URL } from '@/lib/seo/metadata';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The blog post you are looking for does not exist.',
    };
  }

  return createPageMetadata(
    post.title,
    post.excerpt,
    post.tags || ['blog', 'crensa'],
    `/blog/${params.slug}`,
    post.imageUrl
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getBlogPost(params.slug);

  return (
    <>
      <SchemaRenderer
        schema={getArticleSchema(
          post.title,
          post.excerpt,
          `${SITE_URL}/blog/${params.slug}`,
          post.imageUrl,
          post.publishedAt.toISOString(),
          post.updatedAt.toISOString(),
          post.author?.name
        )}
      />
      
      {/* Blog post content */}
    </>
  );
}
*/

// ============================================================================
// UTILITIES FOR DYNAMIC SEO
// ============================================================================
// Add these to src/lib/seo/dynamic-helpers.ts

export const TITLE_LIMITS = {
  min: 30,
  recommended: 50,
  max: 60,
};

export const DESCRIPTION_LIMITS = {
  min: 120,
  recommended: 155,
  max: 160,
};

/**
 * Validates and truncates metadata strings
 */
export function validateMetadata(
  title: string,
  description: string
): { title: string; description: string; warnings: string[] } {
  const warnings: string[] = [];

  let validTitle = title.trim();
  if (validTitle.length < TITLE_LIMITS.min) {
    warnings.push(
      `Title too short (${validTitle.length} chars, min ${TITLE_LIMITS.min})`
    );
  } else if (validTitle.length > TITLE_LIMITS.max) {
    validTitle = validTitle.substring(0, TITLE_LIMITS.max).trim();
    warnings.push(`Title truncated to ${TITLE_LIMITS.max} chars`);
  }

  let validDescription = description.trim();
  if (validDescription.length < DESCRIPTION_LIMITS.min) {
    warnings.push(
      `Description too short (${validDescription.length} chars, min ${DESCRIPTION_LIMITS.min})`
    );
  } else if (validDescription.length > DESCRIPTION_LIMITS.max) {
    validDescription = validDescription
      .substring(0, DESCRIPTION_LIMITS.max)
      .trim();
    warnings.push(`Description truncated to ${DESCRIPTION_LIMITS.max} chars`);
  }

  return {
    title: validTitle,
    description: validDescription,
    warnings,
  };
}

/**
 * Slugify text for URL usage
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string, limit: number = 5): string[] {
  const stopwords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'is',
    'are',
    'be',
    'been',
    'being',
  ]);

  const words = text
    .toLowerCase()
    .match(/\b\w+\b/g)
    ?.filter((word) => !stopwords.has(word) && word.length > 3) || [];

  // Count words
  const wordCount: { [key: string]: number } = {};
  words.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Sort by frequency
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

/**
 * Format ISO duration to human-readable
 * Example: PT5M30S -> 5:30
 */
export function formatDuration(iso8601: string): string {
  const match = iso8601.match(/PT(\d+)M(\d+)S/);
  if (!match) return '0:00';

  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Convert seconds to ISO 8601 duration
 * Example: 330 -> PT5M30S
 */
export function secondsToISO8601(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `PT${minutes}M${secs}S`;
}

export default {
  validateMetadata,
  slugify,
  extractKeywords,
  formatDuration,
  secondsToISO8601,
};
