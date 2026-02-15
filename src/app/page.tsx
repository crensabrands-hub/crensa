import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';
import { HOMEPAGE_SEO_INDIA } from '@/lib/seo/india-keywords';
import NewLandingPage from "@/components/landing/NewLandingPage";

export const metadata: Metadata = createPageMetadata(
  HOMEPAGE_SEO_INDIA.title,
  HOMEPAGE_SEO_INDIA.description,
  HOMEPAGE_SEO_INDIA.keywords,
  '/',
  HOMEPAGE_SEO_INDIA.ogImage
);

export default function Home() {
 return <NewLandingPage />;
}