import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = createPageMetadata(
  'Community Guidelines - Crensa',
  'Learn about Crensa\'s community guidelines. Understand what content is allowed, community standards, and how we keep Crensa a safe platform for all creators and viewers.',
  [
    'community guidelines',
    'content guidelines',
    'community standards',
    'platform rules',
    'content policy',
  ],
  '/community-guidelines',
  'https://crensa.com/og-image-guidelines.png'
);

'use client';

import React from 'react';
import Link from 'next/link';
import {
 ArrowLeftIcon,
 ShieldCheckIcon,
 HeartIcon,
 UserGroupIcon,
 ExclamationTriangleIcon,
 CheckCircleIcon,
 XCircleIcon,
 FlagIcon,
 LightBulbIcon
} from '@heroicons/react/24/outline';

export default function CommunityGuidelinesPage() {
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
 <h1 className="text-3xl font-bold text-primary-navy">Community Guidelines</h1>
 <p className="text-neutral-dark-gray mt-1">
 Building a safe and respectful community together
 </p>
 </div>
 </div>

 {}
 <div className="bg-gradient-to-r from-accent-pink/10 to-accent-teal/10 rounded-lg p-6 mb-8 border border-accent-pink/20">
 <div className="flex items-start space-x-4">
 <div className="w-12 h-12 bg-accent-pink rounded-full flex items-center justify-center flex-shrink-0">
 <UserGroupIcon className="w-6 h-6 text-neutral-white" />
 </div>
 <div>
 <h2 className="text-xl font-bold text-primary-navy mb-2">Welcome to Crensa Community</h2>
 <p className="text-neutral-dark-gray">
 Our community guidelines help create a safe, respectful, and inclusive environment for all 
 users. By using Crensa, you agree to follow these guidelines and contribute to a positive 
 community experience.
 </p>
 </div>
 </div>
 </div>

 {}
 <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray p-8 mb-8">
 <h2 className="text-2xl font-bold text-primary-navy mb-6">Our Core Principles</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="flex items-start space-x-3">
 <div className="w-10 h-10 bg-accent-pink/10 rounded-lg flex items-center justify-center flex-shrink-0">
 <HeartIcon className="w-5 h-5 text-accent-pink" />
 </div>
 <div>
 <h3 className="font-bold text-primary-navy mb-1">Respect</h3>
 <p className="text-sm text-neutral-dark-gray">
 Treat everyone with kindness and respect, regardless of differences
 </p>
 </div>
 </div>

 <div className="flex items-start space-x-3">
 <div className="w-10 h-10 bg-accent-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
 <ShieldCheckIcon className="w-5 h-5 text-accent-teal" />
 </div>
 <div>
 <h3 className="font-bold text-primary-navy mb-1">Safety</h3>
 <p className="text-sm text-neutral-dark-gray">
 Keep our platform safe for all users, especially minors
 </p>
 </div>
 </div>

 <div className="flex items-start space-x-3">
 <div className="w-10 h-10 bg-primary-neon-yellow/10 rounded-lg flex items-center justify-center flex-shrink-0">
 <LightBulbIcon className="w-5 h-5 text-primary-navy" />
 </div>
 <div>
 <h3 className="font-bold text-primary-navy mb-1">Authenticity</h3>
 <p className="text-sm text-neutral-dark-gray">
 Be genuine and honest in your interactions and content
 </p>
 </div>
 </div>

 <div className="flex items-start space-x-3">
 <div className="w-10 h-10 bg-accent-pink/10 rounded-lg flex items-center justify-center flex-shrink-0">
 <UserGroupIcon className="w-5 h-5 text-accent-pink" />
 </div>
 <div>
 <h3 className="font-bold text-primary-navy mb-1">Inclusivity</h3>
 <p className="text-sm text-neutral-dark-gray">
 Welcome and celebrate diversity in all its forms
 </p>
 </div>
 </div>
 </div>
 </div>

 {}
 <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray">
 <div className="p-8 space-y-8">
 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
 <CheckCircleIcon className="w-5 h-5 text-green-600" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">What We Encourage</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <ul className="list-disc pl-6 space-y-2">
 <li>Original, creative content that adds value to the community</li>
 <li>Respectful discussions and constructive feedback</li>
 <li>Educational and informative content</li>
 <li>Entertainment that is appropriate for diverse audiences</li>
 <li>Authentic self-expression within community standards</li>
 <li>Supporting fellow creators and community members</li>
 <li>Reporting violations to help keep the community safe</li>
 </ul>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
 <XCircleIcon className="w-5 h-5 text-red-600" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">Prohibited Content and Behavior</h2>
 </div>
 <div className="ml-13 space-y-4 text-neutral-dark-gray">
 <div>
 <h3 className="font-bold text-primary-navy mb-2">Harmful or Dangerous Content</h3>
 <ul className="list-disc pl-6 space-y-1">
 <li>Violence, gore, or content that promotes harm to self or others</li>
 <li>Instructions for dangerous activities or illegal acts</li>
 <li>Content that promotes eating disorders or self-harm</li>
 <li>Dangerous challenges or pranks that could cause injury</li>
 </ul>
 </div>

 <div>
 <h3 className="font-bold text-primary-navy mb-2">Hate Speech and Harassment</h3>
 <ul className="list-disc pl-6 space-y-1">
 <li>Content that promotes hatred or discrimination based on race, ethnicity, religion, gender, sexual orientation, disability, or other protected characteristics</li>
 <li>Bullying, harassment, or targeted attacks against individuals or groups</li>
 <li>Threats of violence or intimidation</li>
 <li>Doxxing or sharing private information without consent</li>
 </ul>
 </div>

 <div>
 <h3 className="font-bold text-primary-navy mb-2">Adult and Sexual Content</h3>
 <ul className="list-disc pl-6 space-y-1">
 <li>Nudity or sexually explicit content</li>
 <li>Sexual solicitation or exploitation</li>
 <li>Content involving minors in sexual or suggestive contexts</li>
 <li>Pornographic material of any kind</li>
 </ul>
 </div>

 <div>
 <h3 className="font-bold text-primary-navy mb-2">Illegal Activities</h3>
 <ul className="list-disc pl-6 space-y-1">
 <li>Promotion or facilitation of illegal activities</li>
 <li>Sale of illegal goods or services</li>
 <li>Copyright infringement or piracy</li>
 <li>Fraud, scams, or deceptive practices</li>
 </ul>
 </div>

 <div>
 <h3 className="font-bold text-primary-navy mb-2">Spam and Manipulation</h3>
 <ul className="list-disc pl-6 space-y-1">
 <li>Spam, including repetitive or unsolicited content</li>
 <li>Artificial engagement (fake views, likes, or followers)</li>
 <li>Misleading metadata or clickbait</li>
 <li>Impersonation of others or misrepresentation</li>
 </ul>
 </div>

 <div>
 <h3 className="font-bold text-primary-navy mb-2">Misinformation</h3>
 <ul className="list-disc pl-6 space-y-1">
 <li>Deliberate spread of false information</li>
 <li>Medical misinformation that could cause harm</li>
 <li>Manipulated media intended to deceive</li>
 <li>Election or civic process misinformation</li>
 </ul>
 </div>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-accent-pink/10 rounded-lg flex items-center justify-center">
 <LightBulbIcon className="w-5 h-5 text-accent-pink" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">Guidelines for Content Creators</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <ul className="list-disc pl-6 space-y-2">
 <li>
 <strong>Original Content:</strong> Only upload content you have created or have permission to use
 </li>
 <li>
 <strong>Accurate Descriptions:</strong> Provide honest and accurate titles, descriptions, and tags
 </li>
 <li>
 <strong>Age-Appropriate:</strong> Clearly mark content that may not be suitable for all audiences
 </li>
 <li>
 <strong>Copyright Compliance:</strong> Respect intellectual property rights and use licensed content
 </li>
 <li>
 <strong>Transparency:</strong> Disclose sponsored content, partnerships, and affiliations
 </li>
 <li>
 <strong>Community Engagement:</strong> Respond to your audience respectfully and professionally
 </li>
 </ul>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-accent-teal/10 rounded-lg flex items-center justify-center">
 <UserGroupIcon className="w-5 h-5 text-accent-teal" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">Guidelines for Viewers</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <ul className="list-disc pl-6 space-y-2">
 <li>
 <strong>Respectful Comments:</strong> Keep comments constructive and respectful
 </li>
 <li>
 <strong>No Harassment:</strong> Don&apos;t engage in bullying or harassment of creators or other viewers
 </li>
 <li>
 <strong>Report Issues:</strong> Use the report feature to flag inappropriate content
 </li>
 <li>
 <strong>Support Creators:</strong> Show appreciation through legitimate means (coins, follows, shares)
 </li>
 <li>
 <strong>Respect Privacy:</strong> Don&apos;t share personal information about creators or other users
 </li>
 </ul>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-primary-neon-yellow/10 rounded-lg flex items-center justify-center">
 <FlagIcon className="w-5 h-5 text-primary-navy" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">Reporting Violations</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>
 If you encounter content or behavior that violates these guidelines, please report it immediately. 
 We review all reports and take appropriate action, which may include:
 </p>
 <ul className="list-disc pl-6 space-y-2">
 <li>Content removal</li>
 <li>Warning to the user</li>
 <li>Temporary suspension</li>
 <li>Permanent account termination</li>
 <li>Legal action in severe cases</li>
 </ul>
 <p className="mt-4">
 <strong>How to Report:</strong> Use the report button on any content or contact us at 
 <a href="mailto:report@crensa.com" className="text-accent-pink hover:underline ml-1">
 report@crensa.com
 </a>
 </p>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
 <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">Consequences of Violations</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>
 Violations of these guidelines may result in the following actions:
 </p>
 <div className="space-y-3 mt-4">
 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
 <p className="font-bold text-yellow-800">First Violation (Minor)</p>
 <p className="text-sm text-yellow-700">Warning and content removal</p>
 </div>
 <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
 <p className="font-bold text-orange-800">Second Violation or Moderate Violation</p>
 <p className="text-sm text-orange-700">Temporary suspension (7-30 days)</p>
 </div>
 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
 <p className="font-bold text-red-800">Severe or Repeated Violations</p>
 <p className="text-sm text-red-700">Permanent account termination</p>
 </div>
 </div>
 </div>
 </section>

 {}
 <section>
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-accent-teal/10 rounded-lg flex items-center justify-center">
 <ShieldCheckIcon className="w-5 h-5 text-accent-teal" />
 </div>
 <h2 className="text-xl font-bold text-primary-navy">Appeals Process</h2>
 </div>
 <div className="ml-13 space-y-3 text-neutral-dark-gray">
 <p>
 If you believe your content was removed or your account was suspended in error, you can 
 submit an appeal:
 </p>
 <ul className="list-disc pl-6 space-y-2">
 <li>Submit an appeal through your account dashboard</li>
 <li>Provide detailed explanation and any relevant evidence</li>
 <li>Our team will review your appeal within 5-7 business days</li>
 <li>You will receive a response via email</li>
 </ul>
 <p className="mt-4">
 Contact our appeals team at 
 <a href="mailto:appeals@crensa.com" className="text-accent-pink hover:underline ml-1">
 appeals@crensa.com
 </a>
 </p>
 </div>
 </section>
 </div>
 </div>

 {}
 <div className="mt-8 bg-primary-navy rounded-lg p-6 text-center">
 <h2 className="text-xl font-bold text-neutral-white mb-2">Thank You for Being Part of Our Community</h2>
 <p className="text-neutral-white/80 mb-4">
 Together, we can create a safe, respectful, and thriving community for everyone.
 </p>
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <Link
 href="/help"
 className="inline-block px-6 py-3 bg-neutral-white text-primary-navy rounded-lg font-medium hover:bg-neutral-gray/10 transition-colors duration-200"
 >
 Get Help
 </Link>
 <Link
 href="/contact"
 className="inline-block px-6 py-3 bg-accent-pink text-neutral-white rounded-lg font-medium hover:bg-accent-pink/90 transition-colors duration-200"
 >
 Report an Issue
 </Link>
 </div>
 </div>
 </div>
 </div>
 );
}
