'use client';

import React from 'react';
import Link from 'next/link';
import {
 ArrowLeftIcon,
 SparklesIcon,
 UserGroupIcon,
 GlobeAltIcon,
 HeartIcon,
 LightBulbIcon,
 TrophyIcon
} from '@heroicons/react/24/outline';

export default function AboutPage() {
 return (
 <div className="min-h-screen bg-neutral-gray/5">
 <div className="container mx-auto px-4 py-8 max-w-5xl">
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
 <h1 className="text-3xl font-bold text-primary-navy">About Crensa</h1>
 <p className="text-neutral-dark-gray mt-1">
 Empowering creators and connecting audiences
 </p>
 </div>
 </div>

 {}
 <div className="bg-gradient-to-r from-accent-pink/10 to-accent-teal/10 rounded-lg p-8 mb-8 border border-accent-pink/20">
 <div className="flex items-center space-x-4 mb-4">
 <div className="w-16 h-16 bg-accent-pink rounded-full flex items-center justify-center">
 <SparklesIcon className="w-8 h-8 text-neutral-white" />
 </div>
 <div>
 <h2 className="text-2xl font-bold text-primary-navy">Our Mission</h2>
 </div>
 </div>
 <p className="text-lg text-neutral-dark-gray leading-relaxed">
 Crensa is a revolutionary platform that connects content creators with audiences worldwide. 
 We believe in empowering creators to monetize their passion while providing viewers with 
 high-quality, diverse content. Our mission is to build a sustainable ecosystem where creativity 
 thrives and everyone benefits.
 </p>
 </div>

 {}
 <div className="mb-12">
 <h2 className="text-2xl font-bold text-primary-navy mb-6">Our Core Values</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="bg-neutral-white rounded-lg p-6 shadow-sm border border-neutral-light-gray">
 <div className="flex items-start space-x-4">
 <div className="w-12 h-12 bg-accent-pink/10 rounded-lg flex items-center justify-center flex-shrink-0">
 <HeartIcon className="w-6 h-6 text-accent-pink" />
 </div>
 <div>
 <h3 className="text-lg font-bold text-primary-navy mb-2">Creator First</h3>
 <p className="text-neutral-dark-gray">
 We put creators at the heart of everything we do, providing tools and support 
 to help them succeed and grow their audience.
 </p>
 </div>
 </div>
 </div>

 <div className="bg-neutral-white rounded-lg p-6 shadow-sm border border-neutral-light-gray">
 <div className="flex items-start space-x-4">
 <div className="w-12 h-12 bg-accent-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
 <UserGroupIcon className="w-6 h-6 text-accent-teal" />
 </div>
 <div>
 <h3 className="text-lg font-bold text-primary-navy mb-2">Community Driven</h3>
 <p className="text-neutral-dark-gray">
 Our platform thrives on the strength of our community. We foster meaningful 
 connections between creators and their audiences.
 </p>
 </div>
 </div>
 </div>

 <div className="bg-neutral-white rounded-lg p-6 shadow-sm border border-neutral-light-gray">
 <div className="flex items-start space-x-4">
 <div className="w-12 h-12 bg-primary-neon-yellow/10 rounded-lg flex items-center justify-center flex-shrink-0">
 <LightBulbIcon className="w-6 h-6 text-primary-navy" />
 </div>
 <div>
 <h3 className="text-lg font-bold text-primary-navy mb-2">Innovation</h3>
 <p className="text-neutral-dark-gray">
 We continuously innovate to provide the best experience for both creators 
 and viewers, staying ahead of industry trends.
 </p>
 </div>
 </div>
 </div>

 <div className="bg-neutral-white rounded-lg p-6 shadow-sm border border-neutral-light-gray">
 <div className="flex items-start space-x-4">
 <div className="w-12 h-12 bg-accent-pink/10 rounded-lg flex items-center justify-center flex-shrink-0">
 <TrophyIcon className="w-6 h-6 text-accent-pink" />
 </div>
 <div>
 <h3 className="text-lg font-bold text-primary-navy mb-2">Excellence</h3>
 <p className="text-neutral-dark-gray">
 We strive for excellence in every aspect of our platform, from content quality 
 to user experience and customer support.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>

 {}
 <div className="bg-neutral-white rounded-lg p-8 shadow-sm border border-neutral-light-gray mb-12">
 <h2 className="text-2xl font-bold text-primary-navy mb-6 text-center">Platform at a Glance</h2>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 <div className="text-center">
 <div className="text-4xl font-bold text-accent-pink mb-2">10K+</div>
 <p className="text-neutral-dark-gray">Active Creators</p>
 </div>
 <div className="text-center">
 <div className="text-4xl font-bold text-accent-teal mb-2">100K+</div>
 <p className="text-neutral-dark-gray">Community Members</p>
 </div>
 <div className="text-center">
 <div className="text-4xl font-bold text-primary-neon-yellow mb-2">1M+</div>
 <p className="text-neutral-dark-gray">Videos Watched</p>
 </div>
 </div>
 </div>

 {}
 <div className="bg-neutral-white rounded-lg p-8 shadow-sm border border-neutral-light-gray mb-12">
 <h2 className="text-2xl font-bold text-primary-navy mb-4">Our Story</h2>
 <div className="space-y-4 text-neutral-dark-gray">
 <p>
 Crensa was founded with a simple yet powerful vision: to create a platform where creators 
 can truly own their content and build sustainable careers doing what they love. We saw a 
 gap in the market for a creator-centric platform that prioritizes fair monetization and 
 meaningful audience connections.
 </p>
 <p>
 Since our launch, we&apos;ve grown into a thriving community of creators and viewers who share 
 our passion for quality content and authentic connections. Our innovative coin-based system 
 ensures that creators are fairly compensated for their work while giving viewers flexible 
 options to support their favorite creators.
 </p>
 <p>
 Today, Crensa continues to evolve, driven by feedback from our community and our commitment 
 to building the best platform for content creators and their audiences.
 </p>
 </div>
 </div>

 {}
 <div className="bg-gradient-to-r from-accent-teal/10 to-accent-pink/10 rounded-lg p-8 border border-accent-teal/20 mb-12">
 <div className="flex items-center space-x-4 mb-4">
 <div className="w-16 h-16 bg-accent-teal rounded-full flex items-center justify-center">
 <GlobeAltIcon className="w-8 h-8 text-neutral-white" />
 </div>
 <div>
 <h2 className="text-2xl font-bold text-primary-navy">Vision for the Future</h2>
 </div>
 </div>
 <p className="text-lg text-neutral-dark-gray leading-relaxed">
 We envision a future where Crensa becomes the go-to platform for creators worldwide, 
 offering unparalleled tools, support, and opportunities for growth. We&apos;re committed to 
 expanding our features, improving our technology, and building a global community that 
 celebrates creativity in all its forms.
 </p>
 </div>

 {}
 <div className="bg-primary-navy rounded-lg p-8 text-center">
 <h2 className="text-2xl font-bold text-neutral-white mb-4">Join Our Community</h2>
 <p className="text-neutral-white/80 mb-6 max-w-2xl mx-auto">
 Whether you&apos;re a creator looking to share your passion or a viewer seeking quality content, 
 Crensa is the place for you. Join us today and be part of something special.
 </p>
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <Link
 href="/sign-up"
 className="px-8 py-3 bg-accent-pink text-neutral-white rounded-lg font-medium hover:bg-accent-pink/90 transition-colors duration-200"
 >
 Get Started
 </Link>
 <Link
 href="/browse"
 className="px-8 py-3 bg-neutral-white text-primary-navy rounded-lg font-medium hover:bg-neutral-gray/10 transition-colors duration-200"
 >
 Browse Content
 </Link>
 </div>
 </div>
 </div>
 </div>
 );
}
