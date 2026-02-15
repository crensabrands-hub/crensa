import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = createPageMetadata(
  'Privacy Policy - Crensa',
  'Read Crensa\'s privacy policy. Learn how we collect, use, protect, and manage your data. Your privacy is important to us.',
  [
    'privacy policy',
    'data privacy',
    'user privacy',
    'privacy protection',
    'data protection',
  ],
  '/privacy',
  'https://crensa.com/og-image-privacy.png'
);

'use client';

import React from 'react';
import Link from 'next/link';
import {
 ArrowLeftIcon,
 ShieldCheckIcon,
 LockClosedIcon,
 EyeIcon,
 DocumentTextIcon,
 UserIcon,
 GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function PrivacyPolicyPage() {
 return (
 <div className="min-h-screen bg-neutral-gray/5">
 <div className="container mx-auto px-4 py-8 max-w-4xl">
 {}
 <div className="flex items-center space-x-4 mb-8">
 <Link
 href="/"
 className="p-2 rounded-lg hover:bg-neutral-white transition-colors duration-200"
 aria-label="Back to home"
 >
 <ArrowLeftIcon className="w-5 h-5 text-primary-navy" />
 </Link>
 <div>
 <h1 className="text-3xl font-bold text-primary-navy">Privacy Policy</h1>
 <p className="text-neutral-dark-gray mt-1">
 Last updated: October 31, 2025
 </p>
 </div>
 </div>

 {}
 <div className="bg-gradient-to-r from-accent-pink/10 to-accent-teal/10 rounded-lg p-6 mb-8 border border-accent-pink/20">
 <div className="flex items-start space-x-4">
 <div className="w-12 h-12 bg-accent-pink rounded-full flex items-center justify-center flex-shrink-0">
 <ShieldCheckIcon className="w-6 h-6 text-neutral-white" />
 </div>
 <div>
 <h2 className="text-xl font-bold text-primary-navy mb-2">Your Privacy Matters</h2>
 <p className="text-neutral-dark-gray">
 At Crensa, we are committed to protecting your privacy and ensuring the security of your 
 personal information. This Privacy Policy explains how we collect, use, and safeguard your data.
 </p>
 </div>
 </div>
 </div>

 {}
 <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray">
 <div className="p-8 space-y-8">
 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-accent-pink/10 rounded-lg flex items-center justify-center">
 <DocumentTextIcon className="w-5 h-5 text-accent-pink" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">1. Information We Collect</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>We collect several types of information to provide and improve our services:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li>
 <strong>Account Information:</strong> When you create an account, we collect your name, 
 email address, username, and password.
 </li>
 <li>
 <strong>Profile Information:</strong> You may choose to provide additional information 
 such as profile picture, bio, and social media links.
 </li>
 <li>
 <strong>Payment Information:</strong> When you purchase coins or process payments, we 
 collect payment details through our secure payment processor (Razorpay).
 </li>
 <li>
 <strong>Content Data:</strong> For creators, we collect information about uploaded videos, 
 series, and other content you create on the platform.
 </li>
 <li>
 <strong>Usage Data:</strong> We collect information about how you interact with our platform, 
 including pages visited, videos watched, and features used.
 </li>
 <li>
 <strong>Device Information:</strong> We collect information about the device you use to 
 access Crensa, including IP address, browser type, and operating system.
 </li>
 </ul>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-accent-teal/10 rounded-lg flex items-center justify-center">
 <EyeIcon className="w-5 h-5 text-accent-teal" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">2. How We Use Your Information</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>We use the information we collect for the following purposes:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li>To provide, maintain, and improve our services</li>
 <li>To process transactions and send related information</li>
 <li>To send you technical notices, updates, and support messages</li>
 <li>To respond to your comments, questions, and customer service requests</li>
 <li>To personalize your experience and recommend relevant content</li>
 <li>To monitor and analyze trends, usage, and activities on our platform</li>
 <li>To detect, prevent, and address technical issues and fraudulent activity</li>
 <li>To comply with legal obligations and enforce our terms of service</li>
 </ul>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-primary-neon-yellow/10 rounded-lg flex items-center justify-center">
 <GlobeAltIcon className="w-5 h-5 text-primary-navy" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">3. Information Sharing and Disclosure</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li>
 <strong>With Your Consent:</strong> We may share your information when you give us explicit 
 permission to do so.
 </li>
 <li>
 <strong>Service Providers:</strong> We share information with third-party service providers 
 who perform services on our behalf, such as payment processing and analytics.
 </li>
 <li>
 <strong>Legal Requirements:</strong> We may disclose information if required by law or in 
 response to valid legal requests.
 </li>
 <li>
 <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, 
 your information may be transferred to the acquiring entity.
 </li>
 <li>
 <strong>Public Content:</strong> Content you choose to make public (such as videos and profile 
 information) will be visible to other users.
 </li>
 </ul>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-accent-pink/10 rounded-lg flex items-center justify-center">
 <LockClosedIcon className="w-5 h-5 text-accent-pink" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">4. Data Security</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>
 We implement appropriate technical and organizational measures to protect your personal 
 information against unauthorized access, alteration, disclosure, or destruction. These measures include:
 </p>
 <ul className="list-disc pl-6 space-y-2">
 <li>Encryption of data in transit and at rest</li>
 <li>Regular security assessments and updates</li>
 <li>Access controls and authentication mechanisms</li>
 <li>Secure payment processing through certified payment gateways</li>
 <li>Regular backups and disaster recovery procedures</li>
 </ul>
 <p className="mt-3">
 However, no method of transmission over the internet or electronic storage is 100% secure. 
 While we strive to protect your information, we cannot guarantee absolute security.
 </p>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-accent-teal/10 rounded-lg flex items-center justify-center">
 <UserIcon className="w-5 h-5 text-accent-teal" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">5. Your Rights and Choices</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>You have the following rights regarding your personal information:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li>
 <strong>Access:</strong> You can request access to the personal information we hold about you.
 </li>
 <li>
 <strong>Correction:</strong> You can update or correct your personal information through 
 your account settings.
 </li>
 <li>
 <strong>Deletion:</strong> You can request deletion of your account and associated data.
 </li>
 <li>
 <strong>Data Portability:</strong> You can request a copy of your data in a portable format.
 </li>
 <li>
 <strong>Opt-Out:</strong> You can opt out of marketing communications at any time.
 </li>
 <li>
 <strong>Cookie Preferences:</strong> You can manage cookie preferences through your browser settings.
 </li>
 </ul>
 <p className="mt-3">
 To exercise these rights, please contact us at privacy@crensa.com.
 </p>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-primary-neon-yellow/10 rounded-lg flex items-center justify-center">
 <DocumentTextIcon className="w-5 h-5 text-primary-navy" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">6. Data Retention</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>
 We retain your personal information for as long as necessary to provide our services and 
 fulfill the purposes outlined in this Privacy Policy. When you delete your account, we will 
 delete or anonymize your personal information, except where we are required to retain it for 
 legal or regulatory purposes.
 </p>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-accent-pink/10 rounded-lg flex items-center justify-center">
 <GlobeAltIcon className="w-5 h-5 text-accent-pink" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">7. International Data Transfers</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>
 Your information may be transferred to and processed in countries other than your country of 
 residence. These countries may have different data protection laws. We ensure appropriate 
 safeguards are in place to protect your information in accordance with this Privacy Policy.
 </p>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-accent-teal/10 rounded-lg flex items-center justify-center">
 <UserIcon className="w-5 h-5 text-accent-teal" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">8. Children&apos;s Privacy</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>
 Crensa is not intended for children under the age of 13. We do not knowingly collect personal 
 information from children under 13. If you believe we have collected information from a child 
 under 13, please contact us immediately at privacy@crensa.com.
 </p>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-primary-neon-yellow/10 rounded-lg flex items-center justify-center">
 <DocumentTextIcon className="w-5 h-5 text-primary-navy" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">9. Changes to This Privacy Policy</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>
 We may update this Privacy Policy from time to time. We will notify you of any changes by 
 posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We encourage 
 you to review this Privacy Policy periodically for any changes.
 </p>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-accent-pink/10 rounded-lg flex items-center justify-center">
 <ShieldCheckIcon className="w-5 h-5 text-accent-pink" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">10. Contact Us</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>
 If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
 </p>
 <div className="bg-neutral-gray/5 rounded-lg p-4 mt-4">
 <p><strong>Email:</strong> privacy@crensa.com</p>
 <p><strong>Support:</strong> <Link href="/help" className="text-accent-pink hover:underline">Visit our Help Center</Link></p>
 <p><strong>Contact Form:</strong> <Link href="/contact" className="text-accent-pink hover:underline">Send us a message</Link></p>
 </div>
 </div>
 </section>
 </div>
 </div>

 {}
 <div className="mt-8 bg-primary-navy rounded-lg p-6 text-center">
 <p className="text-neutral-white mb-4">
 Have questions about your privacy? We&apos;re here to help.
 </p>
 <Link
 href="/help"
 className="inline-block px-6 py-3 bg-accent-pink text-neutral-white rounded-lg font-medium hover:bg-accent-pink/90 transition-colors duration-200"
 >
 Contact Support
 </Link>
 </div>
 </div>
 </div>
 );
}
