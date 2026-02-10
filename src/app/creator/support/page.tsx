"use client";

import { useState } from "react";
import Link from "next/link";
import { CreatorProtectedRoute } from "@/components/layout/ProtectedRoute";
import { HelpCircle, Mail, MessageSquare, Book, Video, DollarSign, Upload, BarChart, ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

function CreatorSupportContent() {
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
    const [contactForm, setContactForm] = useState({
        subject: "",
        category: "general",
        message: "",
        priority: "normal"
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const faqs: FAQItem[] = [
        {
            category: "Getting Started",
            question: "How do I start uploading content?",
            answer: "Navigate to the Creator Dashboard and click 'Upload Video'. Fill in the required information including title, description, category, and set your coin price. You can upload videos up to 2GB in size."
        },
        {
            category: "Getting Started",
            question: "What video formats are supported?",
            answer: "We support MP4, MOV, AVI, and WebM formats. For best results, use MP4 with H.264 codec. Recommended resolution is 1080p (1920x1080) or higher."
        },
        {
            category: "Monetization",
            question: "How does the coin system work?",
            answer: "The platform uses a coin-based system where 1 rupee = 20 coins. You can price your content between 1-2000 coins (₹0.05 - ₹100). When users purchase your content, you earn coins that can be withdrawn as rupees."
        },
        {
            category: "Monetization",
            question: "How do I set prices for my content?",
            answer: "When uploading or editing content, use the coin price input field. Enter a value between 1-2000 coins. The system will show you the rupee equivalent. Consider your content quality, length, and audience when setting prices."
        },
        {
            category: "Monetization",
            question: "When can I withdraw my earnings?",
            answer: "You can request a withdrawal once you have earned at least ₹500 (10,000 coins). Withdrawals are processed within 7-10 business days. Make sure your payment details are up to date in your settings."
        },
        {
            category: "Monetization",
            question: "How are earnings calculated?",
            answer: "You earn the full coin price when someone purchases your video or series. Coins are automatically added to your creator wallet. You can track all earnings in real-time through your Analytics and Earnings pages."
        },
        {
            category: "Content Management",
            question: "Can I edit my videos after uploading?",
            answer: "Yes! Go to Creator Dashboard > Videos, find your video, and click 'Edit'. You can update the title, description, category, tags, and coin price. Note that you cannot replace the video file itself."
        },
        {
            category: "Content Management",
            question: "How do I create a series?",
            answer: "Go to Creator Dashboard > Series and click 'Create Series'. Add a title, description, and set a total price for the series. After creating the series, you can add existing videos or upload new ones to the series."
        },
        {
            category: "Content Management",
            question: "Can I delete my videos?",
            answer: "Yes, you can delete videos from your Creator Dashboard. However, if users have already purchased the video, they will retain access. Consider carefully before deleting content."
        },
        {
            category: "Analytics",
            question: "How do I track my video performance?",
            answer: "Visit Creator Dashboard > Analytics to see detailed metrics including views, purchases, earnings, and engagement. You can filter by date range and specific videos."
        },
        {
            category: "Analytics",
            question: "What metrics should I focus on?",
            answer: "Key metrics include: view count, purchase conversion rate, total earnings, average watch time, and audience retention. Use these insights to improve your content strategy."
        },
        {
            category: "Technical Issues",
            question: "My video upload failed. What should I do?",
            answer: "Check your internet connection and ensure the file size is under 2GB. Try using MP4 format. If the issue persists, contact support with the error message you received."
        },
        {
            category: "Technical Issues",
            question: "Why isn't my video appearing in search?",
            answer: "New videos may take a few minutes to appear in search. Ensure you've added relevant tags and selected the correct category. Videos must also comply with content guidelines to be searchable."
        },
        {
            category: "Account & Settings",
            question: "How do I update my payment information?",
            answer: "Go to Creator Dashboard > Settings > Payment Details. Update your bank account or payment method information. Changes may take 24-48 hours to verify."
        },
        {
            category: "Account & Settings",
            question: "Can I change my creator name?",
            answer: "Yes, go to Settings > Profile and update your display name. Note that your username (URL) cannot be changed once set."
        }
    ];

    const categories = Array.from(new Set(faqs.map(faq => faq.category)));

    const supportCategories = [
        {
            icon: Upload,
            title: "Upload Issues",
            description: "Problems with uploading or processing videos"
        },
        {
            icon: DollarSign,
            title: "Earnings & Payments",
            description: "Questions about earnings, withdrawals, or payments"
        },
        {
            icon: BarChart,
            title: "Analytics",
            description: "Understanding your performance metrics"
        },
        {
            icon: Video,
            title: "Content Management",
            description: "Managing your videos and series"
        },
        {
            icon: HelpCircle,
            title: "General Support",
            description: "Other questions or issues"
        }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {

            await new Promise(resolve => setTimeout(resolve, 1500));

            setSubmitStatus({
                type: 'success',
                message: 'Your support request has been submitted successfully! Our team will respond within 24-48 hours.'
            });

            setContactForm({
                subject: "",
                category: "general",
                message: "",
                priority: "normal"
            });
        } catch (error) {
            setSubmitStatus({
                type: 'error',
                message: 'Failed to submit your request. Please try again or email us directly.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            { }
            <div>
                <h1 className="text-3xl font-bold text-primary-navy mb-2">
                    Creator Support
                </h1>
                <p className="text-neutral-dark-gray text-lg">
                    Get help with your creator account, content, and earnings.
                </p>
            </div>

            { }
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/creator/resources" className="card hover:shadow-lg transition-shadow cursor-pointer">
                    <Book className="w-8 h-8 text-accent-teal mb-3" />
                    <h3 className="font-semibold text-primary-navy mb-1">Resources</h3>
                    <p className="text-sm text-neutral-dark-gray">Guides and tutorials</p>
                </Link>
                <Link href="/creator/guidelines" className="card hover:shadow-lg transition-shadow cursor-pointer">
                    <MessageSquare className="w-8 h-8 text-accent-pink mb-3" />
                    <h3 className="font-semibold text-primary-navy mb-1">Guidelines</h3>
                    <p className="text-sm text-neutral-dark-gray">Content policies</p>
                </Link>
                <Link href="/creator/analytics" className="card hover:shadow-lg transition-shadow cursor-pointer">
                    <BarChart className="w-8 h-8 text-accent-green mb-3" />
                    <h3 className="font-semibold text-primary-navy mb-1">Analytics</h3>
                    <p className="text-sm text-neutral-dark-gray">Track performance</p>
                </Link>
            </div>

            { }
            <div>
                <h2 className="text-2xl font-semibold text-primary-navy mb-6">
                    Frequently Asked Questions
                </h2>
                <div className="space-y-6">
                    {categories.map((category) => (
                        <div key={category}>
                            <h3 className="text-lg font-semibold text-accent-teal mb-3">
                                {category}
                            </h3>
                            <div className="space-y-2">
                                {faqs
                                    .filter(faq => faq.category === category)
                                    .map((faq, index) => {
                                        const faqIndex = faqs.indexOf(faq);
                                        const isExpanded = expandedFAQ === faqIndex;
                                        return (
                                            <div key={faqIndex} className="card">
                                                <button
                                                    onClick={() => setExpandedFAQ(isExpanded ? null : faqIndex)}
                                                    className="w-full flex items-center justify-between text-left"
                                                >
                                                    <span className="font-medium text-primary-navy pr-4">
                                                        {faq.question}
                                                    </span>
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-5 h-5 text-accent-teal flex-shrink-0" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-neutral-dark-gray flex-shrink-0" />
                                                    )}
                                                </button>
                                                {isExpanded && (
                                                    <div className="mt-3 pt-3 border-t border-neutral-light-gray">
                                                        <p className="text-neutral-dark-gray">{faq.answer}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            { }
            <div className="card">
                <h2 className="text-2xl font-semibold text-primary-navy mb-2">
                    Contact Creator Support
                </h2>
                <p className="text-neutral-dark-gray mb-6">
                    Can&apos;t find what you&apos;re looking for? Send us a message and we&apos;ll get back to you within 24-48 hours.
                </p>

                {submitStatus && (
                    <div className={`mb-6 p-4 rounded-lg ${submitStatus.type === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                        {submitStatus.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-primary-navy mb-2">
                                Category
                            </label>
                            <select
                                value={contactForm.category}
                                onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-light-gray rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-transparent"
                                required
                            >
                                <option value="general">General Support</option>
                                <option value="upload">Upload Issues</option>
                                <option value="earnings">Earnings & Payments</option>
                                <option value="analytics">Analytics</option>
                                <option value="content">Content Management</option>
                                <option value="technical">Technical Issues</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-primary-navy mb-2">
                                Priority
                            </label>
                            <select
                                value={contactForm.priority}
                                onChange={(e) => setContactForm({ ...contactForm, priority: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-light-gray rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-transparent"
                                required
                            >
                                <option value="low">Low - General inquiry</option>
                                <option value="normal">Normal - Need assistance</option>
                                <option value="high">High - Urgent issue</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary-navy mb-2">
                            Subject
                        </label>
                        <input
                            type="text"
                            value={contactForm.subject}
                            onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                            placeholder="Brief description of your issue"
                            className="w-full px-4 py-2 border border-neutral-light-gray rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary-navy mb-2">
                            Message
                        </label>
                        <textarea
                            value={contactForm.message}
                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                            placeholder="Please provide as much detail as possible about your issue..."
                            rows={6}
                            className="w-full px-4 py-2 border border-neutral-light-gray rounded-lg focus:ring-2 focus:ring-accent-teal focus:border-transparent resize-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full md:w-auto"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Support Request'}
                    </button>
                </form>
            </div>

            { }
            <div className="card bg-gradient-to-r from-accent-teal/10 to-accent-pink/10 border-accent-teal/20">
                <h3 className="text-xl font-semibold text-primary-navy mb-4">
                    Other Ways to Reach Us
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-accent-teal mt-1" />
                        <div>
                            <p className="font-medium text-primary-navy">Email Support</p>
                            <p className="text-sm text-neutral-dark-gray">creator-support@platform.com</p>
                            <p className="text-xs text-neutral-dark-gray mt-1">Response within 24-48 hours</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-accent-pink mt-1" />
                        <div>
                            <p className="font-medium text-primary-navy">Priority Support</p>
                            <p className="text-sm text-neutral-dark-gray">For urgent issues</p>
                            <p className="text-xs text-neutral-dark-gray mt-1">Available for verified creators</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CreatorSupportPage() {
    return (
        <CreatorProtectedRoute>
            <CreatorSupportContent />
        </CreatorProtectedRoute>
    );
}

export default CreatorSupportPage;
