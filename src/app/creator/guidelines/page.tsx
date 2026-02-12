"use client";

import Link from "next/link";
import { CreatorProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Shield, AlertTriangle, CheckCircle, XCircle, DollarSign, Copyright } from "lucide-react";

function CreatorGuidelinesContent() {
    const contentPolicies = [
        {
            title: "Allowed Content",
            icon: CheckCircle,
            color: "text-green-600",
            items: [
                "Educational and informative videos",
                "Entertainment content (comedy, music, art)",
                "How-to guides and tutorials",
                "Product reviews and demonstrations",
                "Original creative content",
                "Documentary and storytelling content"
            ]
        },
        {
            title: "Prohibited Content",
            icon: XCircle,
            color: "text-red-600",
            items: [
                "Violent, graphic, or disturbing content",
                "Hate speech or discriminatory content",
                "Sexually explicit or adult content",
                "Content promoting illegal activities",
                "Spam, misleading, or deceptive content",
                "Content that infringes on others' rights"
            ]
        }
    ];

    const monetizationRules = [
        {
            title: "Coin Pricing Guidelines",
            description: "Set fair and competitive prices for your content.",
            rules: [
                "Price range: 1-2000 coins per video or series",
                "1 rupee = 20 coins (e.g., 100 coins = ₹5)",
                "Consider content length and quality when pricing",
                "Series should be priced competitively vs individual videos",
                "Avoid extreme pricing that may discourage viewers"
            ]
        },
        {
            title: "Earnings & Payouts",
            description: "Understand how you earn and withdraw your money.",
            rules: [
                "You earn coins when users purchase your content",
                "Coins are converted to rupees for withdrawal (20 coins = ₹1)",
                "Minimum withdrawal amount: ₹500",
                "Payouts are processed within 7-10 business days",
                "Ensure your payment details are up to date"
            ]
        },
        {
            title: "Eligibility Requirements",
            description: "Requirements to monetize your content.",
            rules: [
                "Complete creator profile with valid information",
                "Verified payment method on file",
                "Compliance with all platform guidelines",
                "Original content that you own or have rights to",
                "Active account in good standing"
            ]
        }
    ];

    const copyrightGuidelines = [
        {
            title: "Original Content",
            description: "Only upload content you created or have permission to use."
        },
        {
            title: "Music & Audio",
            description: "Use only royalty-free music or music you have licensed."
        },
        {
            title: "Fair Use",
            description: "Understand fair use principles for commentary and criticism."
        },
        {
            title: "Attribution",
            description: "Give proper credit when using others' work with permission."
        },
        {
            title: "DMCA Compliance",
            description: "Respond promptly to copyright claims and takedown notices."
        }
    ];

    return (
        <div className="space-y-8">
            { }
            <div>
                <h1 className="text-3xl font-bold text-primary-navy mb-2">
                    Creator Guidelines
                </h1>
                <p className="text-neutral-dark-gray text-lg">
                    Follow these guidelines to maintain a safe, fair, and thriving creator community.
                </p>
            </div>

            { }
            <div className="card bg-amber-50 border-2 border-amber-200">
                <div className="flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="text-lg font-semibold text-amber-900 mb-2">
                            Important Notice
                        </h3>
                        <p className="text-amber-800">
                            Violation of these guidelines may result in content removal, monetization suspension,
                            or account termination. Please review these guidelines carefully and ensure all your
                            content complies with our policies.
                        </p>
                    </div>
                </div>
            </div>

            { }
            <div>
                <h2 className="text-2xl font-semibold text-primary-navy mb-6 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-accent-teal" />
                    Content Policies
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {contentPolicies.map((policy, index) => {
                        const Icon = policy.icon;
                        return (
                            <div key={index} className="card">
                                <div className="flex items-center gap-3 mb-4">
                                    <Icon className={`w-6 h-6 ${policy.color}`} />
                                    <h3 className="text-xl font-semibold text-primary-navy">
                                        {policy.title}
                                    </h3>
                                </div>
                                <ul className="space-y-2">
                                    {policy.items.map((item, itemIndex) => (
                                        <li key={itemIndex} className="flex items-start gap-2">
                                            <span className={`${policy.color} mt-1`}>•</span>
                                            <span className="text-neutral-dark-gray">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>

            { }
            <div>
                <h2 className="text-2xl font-semibold text-primary-navy mb-6 flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-accent-green" />
                    Monetization Rules
                </h2>
                <div className="space-y-6">
                    {monetizationRules.map((section, index) => (
                        <div key={index} className="card">
                            <h3 className="text-xl font-semibold text-primary-navy mb-2">
                                {section.title}
                            </h3>
                            <p className="text-neutral-dark-gray mb-4">
                                {section.description}
                            </p>
                            <ul className="space-y-2">
                                {section.rules.map((rule, ruleIndex) => (
                                    <li key={ruleIndex} className="flex items-start gap-2">
                                        <span className="text-accent-teal mt-1">•</span>
                                        <span className="text-neutral-dark-gray">{rule}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            { }
            <div>
                <h2 className="text-2xl font-semibold text-primary-navy mb-6 flex items-center gap-2">
                    <Copyright className="w-6 h-6 text-accent-pink" />
                    Copyright & Intellectual Property
                </h2>
                <div className="card">
                    <p className="text-neutral-dark-gray mb-6">
                        Respecting copyright and intellectual property rights is crucial. Here&apos;s what you need to know:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {copyrightGuidelines.map((guideline, index) => (
                            <div key={index} className="border-l-4 border-accent-teal pl-4">
                                <h4 className="font-semibold text-primary-navy mb-1">
                                    {guideline.title}
                                </h4>
                                <p className="text-sm text-neutral-dark-gray">
                                    {guideline.description}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-900">
                            <strong>Note:</strong> If you receive a copyright claim, review it carefully and respond
                            appropriately. Repeated copyright violations may result in account suspension.
                        </p>
                    </div>
                </div>
            </div>

            { }
            <div className="card bg-gradient-to-r from-accent-teal/10 to-accent-pink/10 border-accent-teal/20">
                <h2 className="text-2xl font-semibold text-primary-navy mb-4">
                    Community Standards
                </h2>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-primary-navy mb-2">Be Respectful</h4>
                        <p className="text-neutral-dark-gray">
                            Treat your audience and fellow creators with respect. Foster a positive community.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-primary-navy mb-2">Be Authentic</h4>
                        <p className="text-neutral-dark-gray">
                            Create genuine content and be honest with your audience about sponsorships or partnerships.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-primary-navy mb-2">Be Responsible</h4>
                        <p className="text-neutral-dark-gray">
                            Consider the impact of your content and take responsibility for what you create and share.
                        </p>
                    </div>
                </div>
            </div>

            { }
            <div className="card border-2 border-accent-pink/20">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-primary-navy mb-2">
                        Questions About Guidelines?
                    </h2>
                    <p className="text-neutral-dark-gray mb-6">
                        If you&apos;re unsure about any guideline or need clarification, we&apos;re here to help.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/creator/support" className="btn-primary">
                            Contact Support
                        </Link>
                        <Link href="/creator/resources" className="btn-outline">
                            View Resources
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CreatorGuidelinesPage() {
    return (
        <CreatorProtectedRoute>
            <CreatorGuidelinesContent />
        </CreatorProtectedRoute>
    );
}

export default CreatorGuidelinesPage;
