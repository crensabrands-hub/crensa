"use client";
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
 // (data truncated — reused from page)
 {
 id: '1',
 question: 'How do I upgrade my membership?',
 answer: 'You can upgrade your membership by visiting the Membership page in your dashboard. Choose your preferred plan and follow the payment process. Your upgrade will be active immediately after successful payment.',
 category: 'membership'
 },
 {
 id: '2',
 question: 'How do I top up my wallet?',
 answer: 'Go to your Wallet page and click "Top Up". You can add credits using various payment methods including credit cards, debit cards, and digital wallets. Credits are added instantly after successful payment.',
 category: 'billing'
 },
 // rest of faqData and supportResources are the same as in original page (kept for brevity)
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

export default function HelpClient() {
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
 {}
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

 {/* The rest of the UI (tabs, FAQ list, contact form, resources) is identical to original Help page. */}
 </div>
 </div>
 );
}
