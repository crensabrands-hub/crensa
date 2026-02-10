"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";
import { CreatorProtectedRoute } from "@/components/layout/ProtectedRoute";
import dynamic from "next/dynamic";

interface HelpFormData {
    subject: string;
    category: string;
    message: string;
    priority: "low" | "medium" | "high" | "urgent";
}

interface HelpCategory {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

function CreatorHelpContent() {
    const { userProfile } = useAuthContext();
    const [formData, setFormData] = useState<HelpFormData>({
        subject: "",
        category: "",
        message: "",
        priority: "medium",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{
        type: "success" | "error" | null;
        message: string;
    }>({ type: null, message: "" });

    const helpCategories: HelpCategory[] = [
        {
            id: "technical",
            label: "Technical Issues",
            description: "Video upload problems, platform bugs, performance issues",
            color: "from-accent-teal to-accent-green",
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
            ),
        },
        {
            id: "monetization",
            label: "Monetization & Earnings",
            description: "Payment issues, earnings questions, payout problems",
            color: "from-accent-green to-primary-neon-yellow",
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            ),
        },
        {
            id: "content",
            label: "Content Guidelines",
            description: "Content policy questions, video approval issues",
            color: "from-accent-pink to-accent-bright-pink",
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
            ),
        },
        {
            id: "account",
            label: "Account Management",
            description: "Profile settings, account verification, security",
            color: "from-primary-navy to-accent-dark-pink",
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                </svg>
            ),
        },
        {
            id: "analytics",
            label: "Analytics & Insights",
            description: "Understanding metrics, performance data questions",
            color: "from-accent-teal to-primary-navy",
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                </svg>
            ),
        },
        {
            id: "other",
            label: "Other",
            description: "General questions or issues not covered above",
            color: "from-neutral-dark-gray to-primary-navy",
            icon: (
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            ),
        },
    ];

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCategorySelect = (categoryId: string) => {
        setFormData((prev) => ({ ...prev, category: categoryId }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.subject.trim() ||
            !formData.category ||
            !formData.message.trim()
        ) {
            setSubmitStatus({
                type: "error",
                message: "Please fill in all required fields.",
            });
            return;
        }

        if (formData.message.trim().length < 20) {
            setSubmitStatus({
                type: "error",
                message:
                    "Please provide a more detailed description (minimum 20 characters).",
            });
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus({ type: null, message: "" });

        try {
            const response = await fetch("/api/creator/help", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    userProfile: {
                        id: userProfile?.id,
                        username: userProfile?.username,
                        email: userProfile?.email,
                        clerkId: userProfile?.clerkId,
                    },
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSubmitStatus({
                    type: "success",
                    message: `Your help request has been sent successfully! We'll get back to you within ${formData.priority === "urgent"
                            ? "2 hours"
                            : formData.priority === "high"
                                ? "8 hours"
                                : formData.priority === "medium"
                                    ? "24 hours"
                                    : "48 hours"
                        }. Ticket ID: ${result.ticketId}`,
                });

                setFormData({
                    subject: "",
                    category: "",
                    message: "",
                    priority: "medium",
                });
            } else {
                throw new Error(result.error || "Failed to send help request");
            }
        } catch (error) {
            console.error("Error submitting help request:", error);
            setSubmitStatus({
                type: "error",
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to send help request. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case "low":
                return {
                    color: "text-accent-green bg-green-50 border-accent-green",
                    emoji: "💭",
                    time: "48 hours",
                };
            case "medium":
                return {
                    color: "text-accent-teal bg-teal-50 border-accent-teal",
                    emoji: "📋",
                    time: "24 hours",
                };
            case "high":
                return {
                    color: "text-accent-pink bg-pink-50 border-accent-pink",
                    emoji: "⚠️",
                    time: "8 hours",
                };
            case "urgent":
                return {
                    color: "text-red-600 bg-red-50 border-red-300",
                    emoji: "🚨",
                    time: "2 hours",
                };
            default:
                return {
                    color:
                        "text-neutral-dark-gray bg-neutral-gray border-neutral-dark-gray",
                    emoji: "📋",
                    time: "24 hours",
                };
        }
    };

    const priorityConfig = getPriorityConfig(formData.priority);

    return (
        <div className="space-y-6">
            { }
            <div>
                <h1 className="text-3xl font-bold text-primary-navy mb-2">
                    Creator Help Center
                </h1>
                <p className="text-neutral-dark-gray">
                    Need assistance? We&apos;re here to help! Submit your question or issue
                    below and our support team will get back to you as soon as possible.
                </p>
            </div>

            { }
            <div className="card">
                <h2 className="text-xl font-semibold text-primary-navy mb-4">
                    What can we help you with?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {helpCategories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => handleCategorySelect(category.id)}
                            className={`group p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${formData.category === category.id
                                    ? "border-primary-navy bg-primary-navy/5 shadow-md"
                                    : "border-neutral-gray hover:border-primary-navy/30"
                                }`}
                        >
                            <div className="flex items-start space-x-3">
                                <div
                                    className={`p-2 rounded-lg bg-gradient-to-r ${category.color} text-white group-hover:scale-110 transition-transform duration-200`}
                                >
                                    {category.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-primary-navy mb-1 group-hover:text-accent-pink transition-colors duration-200">
                                        {category.label}
                                    </h3>
                                    <p className="text-sm text-neutral-dark-gray">
                                        {category.description}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            { }
            <div className="card">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-accent-pink to-accent-teal text-white">
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-primary-navy">
                        Submit Help Request
                    </h2>
                </div>

                { }
                {submitStatus.type && (
                    <div
                        className={`mb-6 p-4 rounded-xl border-2 ${submitStatus.type === "success"
                                ? "bg-green-50 border-accent-green text-green-800"
                                : "bg-red-50 border-red-300 text-red-800"
                            }`}
                    >
                        <div className="flex items-start space-x-3">
                            <span className="text-xl mt-0.5">
                                {submitStatus.type === "success" ? "✅" : "❌"}
                            </span>
                            <p className="font-medium">{submitStatus.message}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    { }
                    <div>
                        <label
                            htmlFor="subject"
                            className="block text-sm font-semibold text-primary-navy mb-2"
                        >
                            Subject *
                        </label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            placeholder="Brief description of your issue"
                            className="w-full px-4 py-3 border-2 border-neutral-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-pink focus:border-accent-pink transition-all duration-200"
                            required
                        />
                    </div>

                    { }
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label
                                htmlFor="category"
                                className="block text-sm font-semibold text-primary-navy mb-2"
                            >
                                Category *
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-neutral-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-pink focus:border-accent-pink transition-all duration-200"
                                required
                            >
                                <option value="">Select a category</option>
                                {helpCategories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="priority"
                                className="block text-sm font-semibold text-primary-navy mb-2"
                            >
                                Priority Level
                            </label>
                            <select
                                id="priority"
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-neutral-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-pink focus:border-accent-pink transition-all duration-200"
                            >
                                <option value="low">Low - General question</option>
                                <option value="medium">Medium - Standard issue</option>
                                <option value="high">High - Affecting my work</option>
                                <option value="urgent">Urgent - Critical issue</option>
                            </select>
                            <div
                                className={`mt-3 px-3 py-2 rounded-lg text-sm font-semibold inline-flex items-center space-x-2 border-2 ${priorityConfig.color}`}
                            >
                                <span>{priorityConfig.emoji}</span>
                                <span>
                                    {formData.priority.charAt(0).toUpperCase() +
                                        formData.priority.slice(1)}{" "}
                                    Priority
                                </span>
                                <span className="text-xs opacity-75">
                                    • Response within {priorityConfig.time}
                                </span>
                            </div>
                        </div>
                    </div>

                    { }
                    <div>
                        <label
                            htmlFor="message"
                            className="block text-sm font-semibold text-primary-navy mb-2"
                        >
                            Detailed Description *
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            rows={6}
                            placeholder="Please provide as much detail as possible about your issue or question. Include any error messages, steps you've tried, or relevant information that might help us assist you better."
                            className="w-full px-4 py-3 border-2 border-neutral-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-pink focus:border-accent-pink transition-all duration-200 resize-vertical"
                            required
                        />
                        <div className="mt-2 flex justify-between items-center">
                            <p className="text-sm text-neutral-dark-gray">
                                Minimum 20 characters. Be specific to help us provide better
                                assistance.
                            </p>
                            <span
                                className={`text-sm font-medium ${formData.message.length >= 20
                                        ? "text-accent-green"
                                        : "text-neutral-dark-gray"
                                    }`}
                            >
                                {formData.message.length}/20
                            </span>
                        </div>
                    </div>

                    { }
                    <div className="bg-gradient-to-r from-neutral-gray to-neutral-white p-4 rounded-xl border border-neutral-gray">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-primary-navy to-accent-dark-pink text-white">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-primary-navy">
                                Request will be sent from:
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div>
                                <span className="font-medium text-primary-navy">Username:</span>
                                <p className="text-neutral-dark-gray">
                                    {userProfile?.username}
                                </p>
                            </div>
                            <div>
                                <span className="font-medium text-primary-navy">Email:</span>
                                <p className="text-neutral-dark-gray">{userProfile?.email}</p>
                            </div>
                            <div>
                                <span className="font-medium text-primary-navy">User ID:</span>
                                <p className="text-neutral-dark-gray font-mono text-xs">
                                    {userProfile?.id}
                                </p>
                            </div>
                        </div>
                    </div>

                    { }
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={
                                isSubmitting ||
                                !formData.subject.trim() ||
                                !formData.category ||
                                !formData.message.trim() ||
                                formData.message.trim().length < 20
                            }
                            className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2 text-lg font-semibold"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-primary-navy border-t-transparent rounded-full animate-spin"></div>
                                    <span>Sending Request...</span>
                                </>
                            ) : (
                                <>
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                        />
                                    </svg>
                                    <span>Send Help Request</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            { }
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                { }
                <div className="card">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-accent-teal to-accent-green text-white">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-primary-navy">
                            Additional Resources
                        </h2>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-gradient-to-r from-neutral-gray to-neutral-white border border-neutral-gray hover:shadow-md transition-all duration-200">
                            <h3 className="font-semibold text-primary-navy mb-2 flex items-center space-x-2">
                                <span>📚</span>
                                <span>Documentation</span>
                            </h3>
                            <p className="text-sm text-neutral-dark-gray mb-3">
                                Check out our comprehensive guides and tutorials for creators.
                            </p>
                            <Link
                                href="/creator/docs"
                                className="text-accent-pink hover:text-accent-bright-pink text-sm font-semibold transition-colors duration-200"
                            >
                                View Documentation →
                            </Link>
                        </div>
                        <div className="p-4 rounded-lg bg-gradient-to-r from-neutral-gray to-neutral-white border border-neutral-gray hover:shadow-md transition-all duration-200">
                            <h3 className="font-semibold text-primary-navy mb-2 flex items-center space-x-2">
                                <span>💬</span>
                                <span>Community</span>
                            </h3>
                            <p className="text-sm text-neutral-dark-gray mb-3">
                                Connect with other creators and share experiences.
                            </p>
                            <Link
                                href="/creator/community"
                                className="text-accent-pink hover:text-accent-bright-pink text-sm font-semibold transition-colors duration-200"
                            >
                                Join Community →
                            </Link>
                        </div>
                    </div>
                </div>

                { }
                <div className="card">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-accent-pink to-accent-bright-pink text-white">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-primary-navy">
                            Response Times
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {[
                            {
                                priority: "urgent",
                                emoji: "🚨",
                                time: "Within 2 hours",
                                color: "from-red-500 to-red-600",
                            },
                            {
                                priority: "high",
                                emoji: "⚠️",
                                time: "Within 8 hours",
                                color: "from-accent-pink to-accent-bright-pink",
                            },
                            {
                                priority: "medium",
                                emoji: "📋",
                                time: "Within 24 hours",
                                color: "from-accent-teal to-accent-green",
                            },
                            {
                                priority: "low",
                                emoji: "💭",
                                time: "Within 48 hours",
                                color: "from-accent-green to-primary-neon-yellow",
                            },
                        ].map((item) => (
                            <div
                                key={item.priority}
                                className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-neutral-gray to-neutral-white border border-neutral-gray"
                            >
                                <div className="flex items-center space-x-3">
                                    <div
                                        className={`p-1.5 rounded-lg bg-gradient-to-r ${item.color} text-white text-sm`}
                                    >
                                        {item.emoji}
                                    </div>
                                    <span className="font-semibold text-primary-navy capitalize">
                                        {item.priority}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-neutral-dark-gray">
                                    {item.time}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-primary-neon-yellow/20 to-primary-light-yellow/20 border border-primary-neon-yellow/30">
                        <p className="text-sm text-primary-navy font-medium">
                            💡 <strong>Tip:</strong> For faster resolution, provide detailed
                            information and select the appropriate category.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CreatorHelpPage() {
    return (
        <CreatorProtectedRoute>
            <CreatorHelpContent />
        </CreatorProtectedRoute>
    );
}

export default CreatorHelpPage;
