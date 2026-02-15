import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = createPageMetadata(
  'Help & Support - Crensa',
  'Get help and answers to frequently asked questions about Crensa. Learn how to upload videos, earn money, manage your membership, and troubleshoot issues.',
  [
    'help',
    'support',
    'faq',
    'frequently asked questions',
    'crensa help',
    'troubleshooting',
    'user support',
  ],
  '/help',
  'https://crensa.com/og-image-help.png'
);


import HelpClient from './HelpClient';

export default function HelpPage() {
  return <HelpClient />;
}