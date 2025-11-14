'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
 ArrowLeftIcon,
 EnvelopeIcon,
 PhoneIcon,
 MapPinIcon,
 ChatBubbleLeftRightIcon,
 ClockIcon,
 CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function ContactPage() {
 const [formData, setFormData] = useState({
 name: '',
 email: '',
 subject: '',
 message: '',
 category: 'general'
 });
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
 setFormData({
 ...formData,
 [e.target.name]: e.target.value
 });
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);
 setSubmitStatus('idle');

 setTimeout(() => {
 setIsSubmitting(false);
 setSubmitStatus('success');
 setFormData({
 name: '',
 email: '',
 subject: '',
 message: '',
 category: 'general'
 });
 }, 1500);
 };

 return (
 <div className="min-h-screen bg-neutral-gray/5">
 <div className="container mx-auto px-4 py-8 max-w-6xl">
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
 <h1 className="text-3xl font-bold text-primary-navy">Contact Us</h1>
 <p className="text-neutral-dark-gray mt-1">
 Get in touch with our team
 </p>
 </div>
 </div>

 {}
 <div className="bg-gradient-to-r from-accent-pink/10 to-accent-teal/10 rounded-lg p-6 mb-8 border border-accent-pink/20">
 <div className="flex items-start space-x-4">
 <div className="w-12 h-12 bg-accent-pink rounded-full flex items-center justify-center flex-shrink-0">
 <ChatBubbleLeftRightIcon className="w-6 h-6 text-neutral-white" />
 </div>
 <div>
 <h2 className="text-xl font-bold text-primary-navy mb-2">We&apos;re Here to Help</h2>
 <p className="text-neutral-dark-gray">
 Have a question, suggestion, or need assistance? Fill out the form below and our team 
 will get back to you as soon as possible.
 </p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {}
 <div className="lg:col-span-2">
 <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray p-8">
 <h2 className="text-2xl font-bold text-primary-navy mb-6">Send Us a Message</h2>

 {submitStatus === 'success' && (
 <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
 <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
 <div>
 <p className="text-green-800 font-medium">Message sent successfully!</p>
 <p className="text-green-700 text-sm">We&apos;ll get back to you within 24 hours.</p>
 </div>
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-6">
 {}
 <div>
 <label htmlFor="name" className="block text-sm font-medium text-primary-navy mb-2">
 Full Name *
 </label>
 <input
 type="text"
 id="name"
 name="name"
 value={formData.name}
 onChange={handleChange}
 required
 className="w-full px-4 py-3 border border-neutral-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-pink focus:border-transparent"
 placeholder="Enter your full name"
 />
 </div>

 {}
 <div>
 <label htmlFor="email" className="block text-sm font-medium text-primary-navy mb-2">
 Email Address *
 </label>
 <input
 type="email"
 id="email"
 name="email"
 value={formData.email}
 onChange={handleChange}
 required
 className="w-full px-4 py-3 border border-neutral-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-pink focus:border-transparent"
 placeholder="your.email@example.com"
 />
 </div>

 {}
 <div>
 <label htmlFor="category" className="block text-sm font-medium text-primary-navy mb-2">
 Category *
 </label>
 <select
 id="category"
 name="category"
 value={formData.category}
 onChange={handleChange}
 required
 className="w-full px-4 py-3 border border-neutral-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-pink focus:border-transparent"
 >
 <option value="general">General Inquiry</option>
 <option value="technical">Technical Support</option>
 <option value="billing">Billing & Payments</option>
 <option value="content">Content Issues</option>
 <option value="creator">Creator Support</option>
 <option value="partnership">Partnership Opportunities</option>
 <option value="feedback">Feedback & Suggestions</option>
 </select>
 </div>

 {}
 <div>
 <label htmlFor="subject" className="block text-sm font-medium text-primary-navy mb-2">
 Subject *
 </label>
 <input
 type="text"
 id="subject"
 name="subject"
 value={formData.subject}
 onChange={handleChange}
 required
 className="w-full px-4 py-3 border border-neutral-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-pink focus:border-transparent"
 placeholder="Brief description of your inquiry"
 />
 </div>

 {}
 <div>
 <label htmlFor="message" className="block text-sm font-medium text-primary-navy mb-2">
 Message *
 </label>
 <textarea
 id="message"
 name="message"
 value={formData.message}
 onChange={handleChange}
 required
 rows={6}
 className="w-full px-4 py-3 border border-neutral-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-pink focus:border-transparent resize-none"
 placeholder="Please provide as much detail as possible..."
 />
 </div>

 {}
 <button
 type="submit"
 disabled={isSubmitting}
 className="w-full px-6 py-3 bg-accent-pink text-neutral-white rounded-lg font-medium hover:bg-accent-pink/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {isSubmitting ? 'Sending...' : 'Send Message'}
 </button>
 </form>
 </div>
 </div>

 {}
 <div className="space-y-6">
 {}
 <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray p-6">
 <h3 className="text-lg font-bold text-primary-navy mb-4">Contact Information</h3>
 <div className="space-y-4">
 <div className="flex items-start space-x-3">
 <div className="w-10 h-10 bg-accent-pink/10 rounded-lg flex items-center justify-center flex-shrink-0">
 <EnvelopeIcon className="w-5 h-5 text-accent-pink" />
 </div>
 <div>
 <p className="font-medium text-primary-navy">Email</p>
 <a href="mailto:support@crensa.com" className="text-accent-pink hover:underline">
 support@crensa.com
 </a>
 </div>
 </div>

 <div className="flex items-start space-x-3">
 <div className="w-10 h-10 bg-accent-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
 <PhoneIcon className="w-5 h-5 text-accent-teal" />
 </div>
 <div>
 <p className="font-medium text-primary-navy">Phone</p>
 <p className="text-neutral-dark-gray">+91 (800) 123-4567</p>
 <p className="text-sm text-neutral-dark-gray">Available 24/7</p>
 </div>
 </div>

 <div className="flex items-start space-x-3">
 <div className="w-10 h-10 bg-primary-neon-yellow/10 rounded-lg flex items-center justify-center flex-shrink-0">
 <MapPinIcon className="w-5 h-5 text-primary-navy" />
 </div>
 <div>
 <p className="font-medium text-primary-navy">Address</p>
 <p className="text-neutral-dark-gray">
 Crensa Technologies<br />
 123 Innovation Street<br />
 Bangalore, Karnataka 560001<br />
 India
 </p>
 </div>
 </div>
 </div>
 </div>

 {}
 <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray p-6">
 <div className="flex items-center space-x-3 mb-4">
 <div className="w-10 h-10 bg-accent-pink/10 rounded-lg flex items-center justify-center">
 <ClockIcon className="w-5 h-5 text-accent-pink" />
 </div>
 <h3 className="text-lg font-bold text-primary-navy">Support Hours</h3>
 </div>
 <div className="space-y-2 text-neutral-dark-gray">
 <div className="flex justify-between">
 <span>Monday - Friday</span>
 <span className="font-medium">9:00 AM - 6:00 PM</span>
 </div>
 <div className="flex justify-between">
 <span>Saturday</span>
 <span className="font-medium">10:00 AM - 4:00 PM</span>
 </div>
 <div className="flex justify-between">
 <span>Sunday</span>
 <span className="font-medium">Closed</span>
 </div>
 <div className="mt-4 pt-4 border-t border-neutral-light-gray">
 <p className="text-sm">
 <strong>Emergency Support:</strong> Available 24/7 for critical issues
 </p>
 </div>
 </div>
 </div>

 {}
 <div className="bg-neutral-white rounded-lg shadow-sm border border-neutral-light-gray p-6">
 <h3 className="text-lg font-bold text-primary-navy mb-4">Quick Links</h3>
 <div className="space-y-2">
 <Link
 href="/help"
 className="block text-accent-pink hover:underline"
 >
 Help Center & FAQs
 </Link>
 <Link
 href="/community-guidelines"
 className="block text-accent-pink hover:underline"
 >
 Community Guidelines
 </Link>
 <Link
 href="/privacy"
 className="block text-accent-pink hover:underline"
 >
 Privacy Policy
 </Link>
 <Link
 href="/terms"
 className="block text-accent-pink hover:underline"
 >
 Terms of Service
 </Link>
 </div>
 </div>

 {}
 <div className="bg-gradient-to-r from-accent-pink/10 to-accent-teal/10 rounded-lg p-6 border border-accent-pink/20">
 <div className="flex items-center space-x-3 mb-2">
 <CheckCircleIcon className="w-6 h-6 text-accent-pink" />
 <h3 className="font-bold text-primary-navy">Fast Response</h3>
 </div>
 <p className="text-sm text-neutral-dark-gray">
 We typically respond to all inquiries within 24 hours during business days.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
