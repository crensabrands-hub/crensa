"use client";

import Link from "next/link";
import { CreatorProtectedRoute } from "@/components/layout/ProtectedRoute";
import { BookOpen, Video, TrendingUp, Users, DollarSign, Shield } from "lucide-react";

function CreatorResourcesContent() {
    const resources = [
        {
            icon: BookOpen,
            title: "Getting Started Guide",
            description: "Learn the basics of creating and uploading content on our platform.",
            items: [
                "Setting up your creator profile",
                "Understanding the creator dashboard",
                "Uploading your first video",
                "Creating and managing series",
                "Setting coin prices for your content"
            ]
        },
        {
            icon: Video,
            title: "Content Best Practices",
            description: "Tips and techniques to create engaging content that resonates with your audience.",
            items: [
                "Video quality guidelines (resolution, format, length)",
                "Thumbnail design tips for better click-through rates",
                "Writing compelling titles and descriptions",
                "Using tags and categories effectively",
                "Organizing content into series"
            ]
        },
        {
            icon: TrendingUp,
            title: "Growing Your Audience",
            description: "Strategies to increase your reach and build a loyal following.",
            items: [
                "Consistency is key: Upload schedules that work",
                "Engaging with your audience through comments",
                "Promoting your content on social media",
                "Collaborating with other creators",
                "Understanding your analytics data"
            ]
        },
        {
            icon: DollarSign,
            title: "Monetization Strategies",
            description: "Maximize your earnings with smart pricing and content strategies.",
            items: [
                "Understanding the coin system (1 rupee = 20 coins)",
                "Pricing your content competitively (1-2000 coins)",
                "Creating premium series for higher earnings",
                "Balancing free and paid content",
                "Tracking your earnings and withdrawals"
            ]
        },
        {
            icon: Users,
            title: "Community Building",
            description: "Build a strong community around your content.",
            items: [
                "Creating content that encourages discussion",
                "Responding to viewer feedback",
                "Building anticipation for upcoming content",
                "Creating exclusive content for loyal viewers",
                "Maintaining a positive community culture"
            ]
        },
        {
            icon: Shield,
            title: "Content Guidelines & Safety",
            description: "Ensure your content meets platform standards and stays safe.",
            items: [
                "Understanding content policies",
                "Copyright and fair use guidelines",
                "Avoiding prohibited content",
                "Reporting issues and getting support",
                "Protecting your intellectual property"
            ]
        }
    ];

    return (
        <div className="space-y-8">
            { }
            <div>
                <h1 className="text-3xl font-bold text-primary-navy mb-2">
                    Creator Resources
                </h1>
                <p className="text-neutral-dark-gray text-lg">
                    Everything you need to succeed as a creator on our platform.
                </p>
            </div>

            { }
            <div className="card bg-gradient-to-r from-accent-teal/10 to-accent-pink/10 border-accent-teal/20">
                <h2 className="text-xl font-semibold text-primary-navy mb-4">
                    Quick Links
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/creator/dashboard" className="btn-outline text-center">
                        Creator Dashboard
                    </Link>
                    <Link href="/creator/analytics" className="btn-outline text-center">
                        Analytics
                    </Link>
                    <Link href="/creator/earnings" className="btn-outline text-center">
                        Earnings & Payouts
                    </Link>
                </div>
            </div>

            { }
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {resources.map((resource, index) => {
                    const Icon = resource.icon;
                    return (
                        <div key={index} className="card hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 bg-accent-teal/10 rounded-lg">
                                    <Icon className="w-6 h-6 text-accent-teal" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-primary-navy mb-2">
                                        {resource.title}
                                    </h3>
                                    <p className="text-neutral-dark-gray text-sm">
                                        {resource.description}
                                    </p>
                                </div>
                            </div>
                            <ul className="space-y-2">
                                {resource.items.map((item, itemIndex) => (
                                    <li key={itemIndex} className="flex items-start gap-2 text-sm">
                                        <span className="text-accent-teal mt-1">•</span>
                                        <span className="text-neutral-dark-gray">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>

            { }
            <div className="card bg-primary-navy text-white">
                <h2 className="text-2xl font-semibold mb-4">
                    Video Tutorials
                </h2>
                <p className="text-neutral-light-gray mb-6">
                    Watch step-by-step video guides to help you get started and master the platform.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer">
                        <div className="aspect-video bg-white/20 rounded mb-3 flex items-center justify-center">
                            <Video className="w-12 h-12 text-white/60" />
                        </div>
                        <h4 className="font-semibold mb-1">Getting Started</h4>
                        <p className="text-sm text-neutral-light-gray">5 min tutorial</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer">
                        <div className="aspect-video bg-white/20 rounded mb-3 flex items-center justify-center">
                            <Video className="w-12 h-12 text-white/60" />
                        </div>
                        <h4 className="font-semibold mb-1">Uploading Content</h4>
                        <p className="text-sm text-neutral-light-gray">8 min tutorial</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer">
                        <div className="aspect-video bg-white/20 rounded mb-3 flex items-center justify-center">
                            <Video className="w-12 h-12 text-white/60" />
                        </div>
                        <h4 className="font-semibold mb-1">Maximizing Earnings</h4>
                        <p className="text-sm text-neutral-light-gray">10 min tutorial</p>
                    </div>
                </div>
            </div>

            { }
            <div className="card border-2 border-accent-pink/20">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-primary-navy mb-2">
                        Need More Help?
                    </h2>
                    <p className="text-neutral-dark-gray mb-6">
                        Our creator support team is here to help you succeed.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/creator/support" className="btn-primary">
                            Contact Creator Support
                        </Link>
                        <Link href="/creator/guidelines" className="btn-outline">
                            View Creator Guidelines
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CreatorResourcesPage() {
    return (
        <CreatorProtectedRoute>
            <CreatorResourcesContent />
        </CreatorProtectedRoute>
    );
}

export default CreatorResourcesPage;
