import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/metadata';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api',
          '/dashboard',
          '/settings',
          '/wallet',
          '/payment',
          '/onboarding',
          '/analytics',
          '/notifications',
          '/preferences',
          '/history',
          '/profile/edit',
          '/*?*sort=',
          '/*?*filter=',
        ],
      },
      {
        userAgent: 'AdsBot-Google',
        allow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 0,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
