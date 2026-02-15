import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;

  // Main pages that should always be indexed
  const mainPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/discover`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/creator-landing`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/creator-signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/member-landing`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/community-guidelines`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    },
  ];

  return mainPages;
}
