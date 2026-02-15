import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = createPageMetadata(
  'Contact Crensa - Support & Inquiries',
  'Get in touch with the Crensa team. Have questions about creating, monetizing, or our platform? We\'d love to hear from you.',
  [
    'contact crensa',
    'support',
    'crensa support',
    'contact us',
    'get help',
  ],
  '/contact',
  'https://crensa.com/og-image-contact.png'
);


import ContactClient from './ContactClient';

export default function ContactPage() {
  return <ContactClient />;
}
