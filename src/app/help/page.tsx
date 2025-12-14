'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';
import HelpContactForm from '@/components/help/HelpContactForm';
import {
    QuestionMarkCircleIcon,
    ChatBubbleLeftRightIcon,
    BookOpenIcon,
    PhoneIcon,
    EnvelopeIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: 'general' | 'membership' | 'technical' | 'billing';
}

const faqData: FAQItem[] = [
    {
        id: '1',
        question: 'How do I upgrade my membership?',
        answer: 'You can upgrade your membership by visiting the Membership page in your dashboard. Choose your preferred plan and follow the payment process. Your upgrade will be active immediately after successful payment.',
        category: 'membership'
    },
    {
        id: '2',
        question: 'How do I top up my wallet?',
        answer: 'Go to your Wallet page and click "Top Up". You can add coins using various payment methods including credit cards, debit cards, and digital wallets. Coins are added instantly after successful payment.',
        category: 'billing'
    },
    {
        id: '3',
        question: 'Why can&apos;t I see some videos?',
        answer: 'Some videos are exclusive to premium members or require specific membership tiers. Check your membership status and consider upgrading to access more content.',
        category: 'membership'
    },
    {
        id: '4',
        question: 'How do I reset my password?',
        answer: 'Click on "Forgot Password" on the sign-in page. Enter your email address and follow the instructions sent to your email to reset your password.',
        category: 'technical'
    },
    {
        id: '5',
        question: 'Can I cancel my membership anytime?',
        answer: 'Yes, you can cancel your membership at any time from your Membership page. Your access will continue until the end of your current billing period.',
        category: 'membership'
    },
    {
        id: '6',
        question: 'How do I contact customer support?',
        answer: 'You can contact our support team using the contact form on this page, or email us directly at support@crensa.com. We typically respond within 24 hours.',
        category: 'general'
    }
];

const supportResources = [
    {
        title: 'Getting Started Guide',
        description: 'Learn the basics of using Crensa platform',
        icon: BookOpenIcon,
        link: '#getting-started'
    },
    {
        title: 'Membership Benefits',
        description: 'Understand what each membership tier offers',
        icon: CheckCircleIcon,
        link: '/membership'
    },
    {
        title: 'Technical Support',
        description: 'Troubleshoot common technical issues',
        icon: ExclamationTriangleIcon,
        link: '#technical-support'
    }
];

export default function HelpPage() {
    const { userProfile } = useAuthContext();
    const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'resources'>('faq');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

    const filteredFAQs = selectedCategory === 'all'
        ? faqData
        : faqData.filter(faq => faq.category === selectedCategory);

    const toggleFAQ = (id: string) => {
        setExpandedFAQ(expandedFAQ === id ? null : id);
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'membership': return 'bg-accent-pink/10 text-accent-pink';
            case 'billing': return 'bg-accent-teal/10 text-accent-teal';
            case 'technical': return 'bg-primary-neon-yellow/10 text-primary-navy';
            case 'general': return 'bg-primary-navy/10 text-primary-navy';
            default: return 'bg-neutral-gray/10 text-neutral-dark-gray';
        }
    };

    return (
        <div className="min-h-screen bg-neutral-gray/5">
            <div className="container mx-auto px-4 py-8">
                { }
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/dashboard"
                            className="p-2 rounded-lg hover:bg-neutral-white transition-colors duration-200"
                            aria-label="Back to dashboard"
                        >
                            <ArrowLeftIcon className="w-5 h-5 text-primary-navy" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-primary-navy">Help & Support</h1>
                            <p className="text-neutral-dark-gray mt-1">
                                Get help and find answers to common questions
                            </p>
                        </div>
                    </div>
                </div>

                { }
                <div className="bg-gradient-to-r from-accent-pink/10 to-accent-teal/10 rounded-lg p-6 mb-8 border border-accent-pink/20">
                    <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-accent-pink rounded-full flex items-center justify-center flex-shrink-0">
                            <ChatBubbleLeftRightIcon className="w-6 h-6 text-neutral-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-primary-navy mb-2">
                                Welcome to Crensa Support, {userProfile?.username || 'Member'}!
                            </h2>
                            <p className="text-neutral-dark-gray">
                                We&apos;re here to help you get the most out of your Crensa experience.
                                Browse our FAQ, explore resources, or contact our support team directly.
                            </p>
                        </div>
                    </div>
                </div>

                { }
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-neutral-white rounded-lg p-6 shadow-sm border border-neutral-light-gray">
                        <div className="flex items-center space-x-3">
                            <ClockIcon className="w-8 h-8 text-accent-teal" />
                            <div>
                                <p className="text-2xl font-bold text-primary-navy">24h</p>
                                <p className="text-sm text-neutral-dark-gray">Average Response Time</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-neutral-white rounded-lg p-6 shadow-sm border border-neutral-light-gray">
                        <div className="flex items-center space-x-3">
                            <CheckCircleIcon className="w-8 h-8 text-accent-pink" />
                            <div>
                                <p className="text-2xl font-bold text-primary-navy">98%</p>
                                <p className="text-sm text-neutral-dark-gray">Issue Resolution Rate</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-neutral-white rounded-lg p-6 shadow-sm border border-neutral-light-gray">
                        <div className="flex items-center space-x-3">
                            <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary-neon-yellow" />
                            <div>
                                <p className="text-2xl font-bold text-primary-navy">24/7</p>
                                <p className="text-sm text-neutral-dark-gray">Support Availability</p>
                            </div>
                        </div>
                    </div>
                </div>

                { }
                <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray mb-8">
                    <div className="border-b border-neutral-light-gray">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('faq')}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'faq'
                                    ? 'border-accent-pink text-accent-pink'
                                    : 'border-transparent text-neutral-dark-gray hover:text-primary-navy hover:border-neutral-gray'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <QuestionMarkCircleIcon className="w-5 h-5" />
                                    <span>Frequently Asked Questions</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('contact')}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'contact'
                                    ? 'border-accent-pink text-accent-pink'
                                    : 'border-transparent text-neutral-dark-gray hover:text-primary-navy hover:border-neutral-gray'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <EnvelopeIcon className="w-5 h-5" />
                                    <span>Contact Support</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('resources')}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'resources'
                                    ? 'border-accent-pink text-accent-pink'
                                    : 'border-transparent text-neutral-dark-gray hover:text-primary-navy hover:border-neutral-gray'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <BookOpenIcon className="w-5 h-5" />
                                    <span>Resources</span>
                                </div>
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        { }
                        {activeTab === 'faq' && (
                            <div>
                                { }
                                <div className="mb-6">
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedCategory('all')}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${selectedCategory === 'all'
                                                ? 'bg-primary-navy text-neutral-white'
                                                : 'bg-neutral-gray/20 text-neutral-dark-gray hover:bg-neutral-gray/30'
                                                }`}
                                        >
                                            All Questions
                                        </button>
                                        <button
                                            onClick={() => setSelectedCategory('general')}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${selectedCategory === 'general'
                                                ? 'bg-primary-navy text-neutral-white'
                                                : 'bg-neutral-gray/20 text-neutral-dark-gray hover:bg-neutral-gray/30'
                                                }`}
                                        >
                                            General
                                        </button>
                                        <button
                                            onClick={() => setSelectedCategory('membership')}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${selectedCategory === 'membership'
                                                ? 'bg-primary-navy text-neutral-white'
                                                : 'bg-neutral-gray/20 text-neutral-dark-gray hover:bg-neutral-gray/30'
                                                }`}
                                        >
                                            Membership
                                        </button>
                                        <button
                                            onClick={() => setSelectedCategory('billing')}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${selectedCategory === 'billing'
                                                ? 'bg-primary-navy text-neutral-white'
                                                : 'bg-neutral-gray/20 text-neutral-dark-gray hover:bg-neutral-gray/30'
                                                }`}
                                        >
                                            Billing
                                        </button>
                                        <button
                                            onClick={() => setSelectedCategory('technical')}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${selectedCategory === 'technical'
                                                ? 'bg-primary-navy text-neutral-white'
                                                : 'bg-neutral-gray/20 text-neutral-dark-gray hover:bg-neutral-gray/30'
                                                }`}
                                        >
                                            Technical
                                        </button>
                                    </div>
                                </div>

                                { }
                                <div className="space-y-4">
                                    {filteredFAQs.map((faq) => (
                                        <div
                                            key={faq.id}
                                            className="border border-neutral-light-gray rounded-lg overflow-hidden"
                                        >
                                            <button
                                                onClick={() => toggleFAQ(faq.id)}
                                                className="w-full px-6 py-4 text-left hover:bg-neutral-gray/5 transition-colors duration-200 focus:outline-none focus:bg-neutral-gray/5"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(faq.category)}`}>
                                                            {faq.category}
                                                        </span>
                                                        <h3 className="font-medium text-primary-navy">{faq.question}</h3>
                                                    </div>
                                                    <svg
                                                        className={`w-5 h-5 text-neutral-dark-gray transition-transform duration-200 ${expandedFAQ === faq.id ? 'rotate-180' : ''
                                                            }`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </button>
                                            {expandedFAQ === faq.id && (
                                                <div className="px-6 pb-4 text-neutral-dark-gray">
                                                    <p>{faq.answer}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {filteredFAQs.length === 0 && (
                                    <div className="text-center py-8">
                                        <QuestionMarkCircleIcon className="w-12 h-12 text-neutral-gray mx-auto mb-4" />
                                        <p className="text-neutral-dark-gray">No questions found for this category.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        { }
                        {activeTab === 'contact' && (
                            <div>
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-primary-navy mb-2">Contact Our Support Team</h3>
                                    <p className="text-neutral-dark-gray">
                                        Can&apos;t find what you&apos;re looking for? Send us a message and we&apos;ll get back to you as soon as possible.
                                    </p>
                                </div>

                                <HelpContactForm />

                                { }
                                <div className="mt-8 pt-8 border-t border-neutral-light-gray">
                                    <h4 className="font-bold text-primary-navy mb-4">Other Ways to Reach Us</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-3 p-4 bg-neutral-gray/5 rounded-lg">
                                            <EnvelopeIcon className="w-6 h-6 text-accent-pink" />
                                            <div>
                                                <p className="font-medium text-primary-navy">Email Support</p>
                                                <p className="text-sm text-neutral-dark-gray">support@crensa.com</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 p-4 bg-neutral-gray/5 rounded-lg">
                                            <PhoneIcon className="w-6 h-6 text-accent-teal" />
                                            <div>
                                                <p className="font-medium text-primary-navy">Phone Support</p>
                                                <p className="text-sm text-neutral-dark-gray">Available 24/7</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        { }
                        {activeTab === 'resources' && (
                            <div>
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-primary-navy mb-2">Support Resources</h3>
                                    <p className="text-neutral-dark-gray">
                                        Explore our comprehensive guides and resources to help you make the most of Crensa.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {supportResources.map((resource, index) => (
                                        <Link
                                            key={index}
                                            href={resource.link}
                                            className="block p-6 bg-neutral-white border border-neutral-light-gray rounded-lg hover:shadow-md transition-shadow duration-200 group"
                                        >
                                            <div className="flex items-center space-x-4 mb-4">
                                                <div className="w-12 h-12 bg-accent-pink/10 rounded-lg flex items-center justify-center group-hover:bg-accent-pink/20 transition-colors duration-200">
                                                    <resource.icon className="w-6 h-6 text-accent-pink" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-primary-navy group-hover:text-accent-pink transition-colors duration-200">
                                                        {resource.title}
                                                    </h4>
                                                </div>
                                            </div>
                                            <p className="text-neutral-dark-gray text-sm">{resource.description}</p>
                                        </Link>
                                    ))}
                                </div>

                                { }
                                <div className="mt-8 pt-8 border-t border-neutral-light-gray">
                                    <h4 className="font-bold text-primary-navy mb-4">Quick Links</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Link
                                            href="/membership"
                                            className="flex items-center space-x-3 p-4 bg-accent-pink/5 rounded-lg hover:bg-accent-pink/10 transition-colors duration-200 group"
                                        >
                                            <CheckCircleIcon className="w-6 h-6 text-accent-pink" />
                                            <div>
                                                <p className="font-medium text-primary-navy group-hover:text-accent-pink transition-colors duration-200">
                                                    Membership Plans
                                                </p>
                                                <p className="text-sm text-neutral-dark-gray">Compare and upgrade your plan</p>
                                            </div>
                                        </Link>
                                        <Link
                                            href="/wallet"
                                            className="flex items-center space-x-3 p-4 bg-accent-teal/5 rounded-lg hover:bg-accent-teal/10 transition-colors duration-200 group"
                                        >
                                            <svg className="w-6 h-6 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <div>
                                                <p className="font-medium text-primary-navy group-hover:text-accent-teal transition-colors duration-200">
                                                    Wallet & Billing
                                                </p>
                                                <p className="text-sm text-neutral-dark-gray">Manage your coins and payments</p>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
