import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = createPageMetadata(
  'Terms of Service - Crensa',
  'Review Crensa\'s Terms of Service. Understand the rules, rights, and responsibilities for using our video platform and monetization services.',
  [
    'terms of service',
    'terms of use',
    'user agreement',
    'platform terms',
    'service terms',
  ],
  '/terms',
  'https://crensa.com/og-image-terms.png'
);

import React from 'react';
import Link from 'next/link';
import {
 ArrowLeftIcon,
 DocumentTextIcon,
 ScaleIcon,
 ExclamationTriangleIcon,
 CheckCircleIcon,
 XCircleIcon,
 ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function TermsOfServicePage() {
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
 <h1 className="text-3xl font-bold text-primary-navy">Terms of Service</h1>
 <p className="text-neutral-dark-gray mt-1">
 Last updated: October 31, 2025
 </p>
 </div>
 </div>

 {}
 <div className="bg-gradient-to-r from-accent-pink/10 to-accent-teal/10 rounded-lg p-6 mb-8 border border-accent-pink/20">
 <div className="flex items-start space-x-4">
 <div className="w-12 h-12 bg-accent-pink rounded-full flex items-center justify-center flex-shrink-0">
 <ScaleIcon className="w-6 h-6 text-neutral-white" />
 </div>
 <div>
 <h2 className="text-xl font-bold text-primary-navy mb-2">Agreement to Terms</h2>
 <p className="text-neutral-dark-gray">
 By accessing or using Crensa, you agree to be bound by these Terms of Service. Please read 
 them carefully before using our platform.
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
 <h2 className="text-xl font-bold text-primary-navy">1. Acceptance of Terms</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>
 These Terms of Service (&quot;Terms&quot;) govern your access to and use of Crensa&apos;s website, 
 applications, and services (collectively, the &quot;Platform&quot;). By creating an account or 
 using the Platform, you agree to these Terms and our Privacy Policy.
 </p>
 <p>
 If you do not agree to these Terms, you may not access or use the Platform.
 </p>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-accent-teal/10 rounded-lg flex items-center justify-center">
 <CheckCircleIcon className="w-5 h-5 text-accent-teal" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">2. Eligibility</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>To use Crensa, you must:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li>Be at least 13 years of age (or the minimum age required in your jurisdiction)</li>
 <li>Have the legal capacity to enter into a binding agreement</li>
 <li>Not be prohibited from using the Platform under applicable laws</li>
 <li>Provide accurate and complete registration information</li>
 </ul>
 <p>
 Users under 18 should have parental or guardian consent to use the Platform.
 </p>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-primary-neon-yellow/10 rounded-lg flex items-center justify-center">
 <ShieldCheckIcon className="w-5 h-5 text-primary-navy" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">3. User Accounts</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>When you create an account on Crensa:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li>You are responsible for maintaining the security of your account credentials</li>
 <li>You must provide accurate, current, and complete information</li>
 <li>You are responsible for all activities that occur under your account</li>
 <li>You must notify us immediately of any unauthorized access or security breach</li>
 <li>You may not transfer or share your account with others</li>
 <li>You may not create multiple accounts to circumvent restrictions</li>
 </ul>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-accent-pink/10 rounded-lg flex items-center justify-center">
 <DocumentTextIcon className="w-5 h-5 text-accent-pink" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">4. Content and Intellectual Property</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <h3 className="font-bold text-primary-navy mt-4">4.1 Your Content</h3>
 <p>When you upload content to Crensa:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li>You retain ownership of your content</li>
 <li>You grant Crensa a license to host, display, and distribute your content</li>
 <li>You represent that you have all necessary rights to the content</li>
 <li>You are responsible for ensuring your content complies with all applicable laws</li>
 </ul>

 <h3 className="font-bold text-primary-navy mt-4">4.2 Platform Content</h3>
 <p>
 All content on the Platform, including text, graphics, logos, and software, is owned by 
 Crensa or its licensors and is protected by intellectual property laws. You may not copy, 
 modify, distribute, or create derivative works without permission.
 </p>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-accent-teal/10 rounded-lg flex items-center justify-center">
 <ExclamationTriangleIcon className="w-5 h-5 text-accent-teal" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">5. Prohibited Conduct</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>You agree not to:</p>
 <ul className="list-disc pl-6 space-y-2">
 <li>Violate any laws or regulations</li>
 <li>Infringe on intellectual property rights</li>
 <li>Upload harmful, offensive, or inappropriate content</li>
 <li>Harass, threaten, or abuse other users</li>
 <li>Spam or send unsolicited communications</li>
 <li>Attempt to gain unauthorized access to the Platform</li>
 <li>Use automated systems (bots) without permission</li>
 <li>Interfere with the Platform&apos;s operation or security</li>
 <li>Impersonate others or misrepresent your affiliation</li>
 <li>Engage in fraudulent activities or money laundering</li>
 </ul>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-primary-neon-yellow/10 rounded-lg flex items-center justify-center">
 <DocumentTextIcon className="w-5 h-5 text-primary-navy" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">6. Coin System and Payments</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <h3 className="font-bold text-primary-navy mt-4">6.1 Coin Purchases</h3>
 <ul className="list-disc pl-6 space-y-2">
 <li>Coins are virtual currency used on the Platform (1 rupee = 20 coins)</li>
 <li>All coin purchases are final and non-refundable except as required by law</li>
 <li>Coins have no cash value and cannot be exchanged for cash</li>
 <li>Unused coins do not expire but may be forfeited if your account is terminated</li>
 </ul>

 <h3 className="font-bold text-primary-navy mt-4">6.2 Content Purchases</h3>
 <ul className="list-disc pl-6 space-y-2">
 <li>Content purchases using coins are final</li>
 <li>You receive a license to view purchased content, not ownership</li>
 <li>Access to purchased content may be revoked if it violates our policies</li>
 </ul>

 <h3 className="font-bold text-primary-navy mt-4">6.3 Creator Earnings</h3>
 <ul className="list-disc pl-6 space-y-2">
 <li>Creators earn coins when users purchase their content</li>
 <li>Coins can be withdrawn and converted to rupees</li>
 <li>Withdrawals are subject to minimum thresholds and processing fees</li>
 <li>We reserve the right to withhold earnings if fraud is suspected</li>
 </ul>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-accent-pink/10 rounded-lg flex items-center justify-center">
 <XCircleIcon className="w-5 h-5 text-accent-pink" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">7. Content Moderation and Removal</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>
 We reserve the right to review, moderate, and remove content that violates these Terms or 
 our Community Guidelines. We may also suspend or terminate accounts that repeatedly violate 
 our policies.
 </p>
 <p>
 Content removal decisions are made at our sole discretion. We are not obligated to provide 
 advance notice, though we will make reasonable efforts to do so.
 </p>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-accent-teal/10 rounded-lg flex items-center justify-center">
 <ExclamationTriangleIcon className="w-5 h-5 text-accent-teal" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">8. Disclaimers and Limitations of Liability</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>
 THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND. 
 WE DO NOT GUARANTEE THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
 </p>
 <p>
 TO THE MAXIMUM EXTENT PERMITTED BY LAW, CRENSA SHALL NOT BE LIABLE FOR ANY INDIRECT, 
 INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.
 </p>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-primary-neon-yellow/10 rounded-lg flex items-center justify-center">
 <ShieldCheckIcon className="w-5 h-5 text-primary-navy" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">9. Indemnification</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>
 You agree to indemnify and hold harmless Crensa, its affiliates, and their respective 
 officers, directors, employees, and agents from any claims, damages, losses, liabilities, 
 and expenses arising from:
 </p>
 <ul className="list-disc pl-6 space-y-2">
 <li>Your use of the Platform</li>
 <li>Your violation of these Terms</li>
 <li>Your violation of any rights of another party</li>
 <li>Your content uploaded to the Platform</li>
 </ul>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-accent-pink/10 rounded-lg flex items-center justify-center">
 <XCircleIcon className="w-5 h-5 text-accent-pink" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">10. Termination</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>
 We may suspend or terminate your account at any time for any reason, including violation 
 of these Terms. You may also terminate your account at any time through your account settings.
 </p>
 <p>
 Upon termination:
 </p>
 <ul className="list-disc pl-6 space-y-2">
 <li>Your right to access the Platform will cease immediately</li>
 <li>We may delete your content and account data</li>
 <li>Unused coins will be forfeited</li>
 <li>Creator earnings may be withheld pending investigation of violations</li>
 </ul>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-accent-teal/10 rounded-lg flex items-center justify-center">
 <DocumentTextIcon className="w-5 h-5 text-accent-teal" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">11. Changes to Terms</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>
 We may modify these Terms at any time. We will notify you of material changes by posting 
 the updated Terms on the Platform and updating the &quot;Last updated&quot; date. Your continued use 
 of the Platform after changes constitutes acceptance of the new Terms.
 </p>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-primary-neon-yellow/10 rounded-lg flex items-center justify-center">
 <ScaleIcon className="w-5 h-5 text-primary-navy" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">12. Governing Law and Dispute Resolution</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>
 These Terms are governed by the laws of India. Any disputes arising from these Terms or 
 your use of the Platform shall be resolved through binding arbitration in accordance with 
 Indian arbitration laws.
 </p>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-accent-pink/10 rounded-lg flex items-center justify-center">
 <DocumentTextIcon className="w-5 h-5 text-accent-pink" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">13. Contact Information</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>
 If you have questions about these Terms, please contact us:
 </p>
 <div className="bg-neutral-gray/5 rounded-lg p-4 mt-4">
 <p><strong>Email:</strong> legal@crensa.com</p>
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
 By using Crensa, you agree to these Terms of Service.
 </p>
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <Link
 href="/privacy"
 className="inline-block px-6 py-3 bg-neutral-white text-primary-navy rounded-lg font-medium hover:bg-neutral-gray/10 transition-colors duration-200"
 >
 View Privacy Policy
 </Link>
 <Link
 href="/community-guidelines"
 className="inline-block px-6 py-3 bg-accent-pink text-neutral-white rounded-lg font-medium hover:bg-accent-pink/90 transition-colors duration-200"
 >
 Community Guidelines
 </Link>
 </div>
 </div>
 </div>
 </div>
 );
}
