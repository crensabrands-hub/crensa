'use client';

import React, { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { 
 PaperAirplaneIcon, 
 CheckCircleIcon, 
 ExclamationTriangleIcon,
 InformationCircleIcon
} from '@heroicons/react/24/outline';

interface FormData {
 subject: string;
 category: string;
 priority: 'low' | 'medium' | 'high' | 'urgent';
 message: string;
}

interface FormErrors {
 subject?: string;
 category?: string;
 priority?: string;
 message?: string;
}

const categories = [
 { value: 'general', label: 'General Question', description: 'General inquiries about Crensa' },
 { value: 'membership', label: 'Membership & Billing', description: 'Questions about plans, payments, and billing' },
 { value: 'technical', label: 'Technical Issue', description: 'App bugs, login issues, or technical problems' },
 { value: 'content', label: 'Content & Videos', description: 'Issues with video playback or content access' },
 { value: 'account', label: 'Account Management', description: 'Profile, settings, and account-related questions' },
 { value: 'other', label: 'Other', description: 'Something else not covered above' }
];

const priorities = [
 { 
 value: 'low' as const, 
 label: 'Low', 
 description: 'General question, no urgency',
 color: 'text-green-600',
 bgColor: 'bg-green-50 border-green-200'
 },
 { 
 value: 'medium' as const, 
 label: 'Medium', 
 description: 'Standard support request',
 color: 'text-blue-600',
 bgColor: 'bg-blue-50 border-blue-200'
 },
 { 
 value: 'high' as const, 
 label: 'High', 
 description: 'Important issue affecting usage',
 color: 'text-orange-600',
 bgColor: 'bg-orange-50 border-orange-200'
 },
 { 
 value: 'urgent' as const, 
 label: 'Urgent', 
 description: 'Critical issue requiring immediate attention',
 color: 'text-red-600',
 bgColor: 'bg-red-50 border-red-200'
 }
];

export default function HelpContactForm() {
 const { userProfile } = useAuthContext();
 const [formData, setFormData] = useState<FormData>({
 subject: '',
 category: '',
 priority: 'medium',
 message: ''
 });
 const [errors, setErrors] = useState<FormErrors>({});
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
 const [ticketId, setTicketId] = useState<string>('');

 const validateForm = (): boolean => {
 const newErrors: FormErrors = {};

 if (!formData.subject.trim()) {
 newErrors.subject = 'Subject is required';
 } else if (formData.subject.length < 5) {
 newErrors.subject = 'Subject must be at least 5 characters';
 } else if (formData.subject.length > 100) {
 newErrors.subject = 'Subject must be less than 100 characters';
 }

 if (!formData.category) {
 newErrors.category = 'Please select a category';
 }

 if (!formData.message.trim()) {
 newErrors.message = 'Message is required';
 } else if (formData.message.length < 20) {
 newErrors.message = 'Message must be at least 20 characters';
 } else if (formData.message.length > 2000) {
 newErrors.message = 'Message must be less than 2000 characters';
 }

 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };

 const handleInputChange = (field: keyof FormData, value: string) => {
 setFormData(prev => ({ ...prev, [field]: value }));
 if (errors[field]) {
 setErrors(prev => ({ ...prev, [field]: undefined }));
 }
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 
 if (!validateForm() || !userProfile) {
 return;
 }

 setIsSubmitting(true);
 setSubmitStatus('idle');

 try {
 const response = await fetch('/api/member/help', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 ...formData,
 userProfile: {
 id: userProfile.id,
 username: userProfile.username,
 email: userProfile.email,
 clerkId: userProfile.clerkId
 }
 }),
 });

 const result = await response.json();

 if (response.ok && result.success) {
 setSubmitStatus('success');
 setTicketId(result.ticketId || '');

 setFormData({
 subject: '',
 category: '',
 priority: 'medium',
 message: ''
 });
 } else {
 throw new Error(result.error || 'Failed to send help request');
 }
 } catch (error) {
 console.error('Error submitting help request:', error);
 setSubmitStatus('error');
 } finally {
 setIsSubmitting(false);
 }
 };

 const resetForm = () => {
 setSubmitStatus('idle');
 setTicketId('');
 setErrors({});
 };

 if (!userProfile) {
 return (
 <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
 <div className="flex items-center space-x-3">
 <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
 <div>
 <h3 className="font-medium text-amber-800">Sign In Required</h3>
 <p className="text-amber-700 text-sm mt-1">
 Please sign in to submit a help request. This helps us provide personalized support.
 </p>
 </div>
 </div>
 </div>
 );
 }

 if (submitStatus === 'success') {
 return (
 <div className="bg-green-50 border border-green-200 rounded-lg p-6">
 <div className="flex items-start space-x-3">
 <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
 <div>
 <h3 className="font-medium text-green-800 mb-2">Help Request Sent Successfully!</h3>
 <p className="text-green-700 text-sm mb-4">
 Thank you for contacting us. We&apos;ve received your help request and will respond as soon as possible.
 </p>
 {ticketId && (
 <div className="bg-green-100 border border-green-300 rounded p-3 mb-4">
 <p className="text-sm text-green-800">
 <strong>Ticket ID:</strong> {ticketId}
 </p>
 <p className="text-xs text-green-700 mt-1">
 Please save this ticket ID for your records.
 </p>
 </div>
 )}
 <div className="flex space-x-3">
 <button
 onClick={resetForm}
 className="text-sm font-medium text-green-700 hover:text-green-800 underline focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
 >
 Submit Another Request
 </button>
 </div>
 </div>
 </div>
 </div>
 );
 }

 if (submitStatus === 'error') {
 return (
 <div className="bg-red-50 border border-red-200 rounded-lg p-6">
 <div className="flex items-start space-x-3">
 <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
 <div>
 <h3 className="font-medium text-red-800 mb-2">Failed to Send Help Request</h3>
 <p className="text-red-700 text-sm mb-4">
 We encountered an error while sending your help request. Please try again or contact us directly at support@crensa.com.
 </p>
 <button
 onClick={resetForm}
 className="text-sm font-medium text-red-700 hover:text-red-800 underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
 >
 Try Again
 </button>
 </div>
 </div>
 </div>
 );
 }

 return (
 <form onSubmit={handleSubmit} className="space-y-6">
 {}
 <div className="bg-neutral-gray/5 rounded-lg p-4 border border-neutral-light-gray">
 <h4 className="font-medium text-primary-navy mb-2">Your Information</h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
 <div>
 <span className="text-neutral-dark-gray">Username:</span>
 <span className="ml-2 font-medium text-primary-navy">{userProfile.username}</span>
 </div>
 <div>
 <span className="text-neutral-dark-gray">Email:</span>
 <span className="ml-2 font-medium text-primary-navy">{userProfile.email}</span>
 </div>
 <div>
 <span className="text-neutral-dark-gray">Account Type:</span>
 <span className="ml-2 font-medium text-primary-navy capitalize">{userProfile.role}</span>
 </div>
 </div>
 </div>

 {}
 <div>
 <label htmlFor="subject" className="block text-sm font-medium text-primary-navy mb-2">
 Subject *
 </label>
 <input
 type="text"
 id="subject"
 value={formData.subject}
 onChange={(e) => handleInputChange('subject', e.target.value)}
 className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-pink focus:border-accent-pink transition-colors duration-200 ${
 errors.subject ? 'border-red-500' : 'border-neutral-gray'
 }`}
 placeholder="Brief description of your issue or question"
 maxLength={100}
 />
 <div className="flex justify-between items-center mt-1">
 {errors.subject && (
 <p className="text-red-500 text-sm">{errors.subject}</p>
 )}
 <p className="text-neutral-gray text-sm ml-auto">
 {formData.subject.length}/100
 </p>
 </div>
 </div>

 {}
 <div>
 <label htmlFor="category" className="block text-sm font-medium text-primary-navy mb-2">
 Category *
 </label>
 <select
 id="category"
 value={formData.category}
 onChange={(e) => handleInputChange('category', e.target.value)}
 className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-pink focus:border-accent-pink transition-colors duration-200 ${
 errors.category ? 'border-red-500' : 'border-neutral-gray'
 }`}
 >
 <option value="">Select a category</option>
 {categories.map((category) => (
 <option key={category.value} value={category.value}>
 {category.label}
 </option>
 ))}
 </select>
 {formData.category && (
 <p className="text-neutral-dark-gray text-sm mt-1">
 {categories.find(c => c.value === formData.category)?.description}
 </p>
 )}
 {errors.category && (
 <p className="text-red-500 text-sm mt-1">{errors.category}</p>
 )}
 </div>

 {}
 <div>
 <label className="block text-sm font-medium text-primary-navy mb-3">
 Priority Level
 </label>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {priorities.map((priority) => (
 <label
 key={priority.value}
 className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
 formData.priority === priority.value
 ? `${priority.bgColor} border-current`
 : 'bg-neutral-white border-neutral-light-gray hover:bg-neutral-gray/5'
 }`}
 >
 <input
 type="radio"
 name="priority"
 value={priority.value}
 checked={formData.priority === priority.value}
 onChange={(e) => handleInputChange('priority', e.target.value)}
 className="sr-only"
 />
 <div className="flex-1">
 <div className="flex items-center space-x-2">
 <span className={`font-medium ${
 formData.priority === priority.value ? priority.color : 'text-primary-navy'
 }`}>
 {priority.label}
 </span>
 {formData.priority === priority.value && (
 <CheckCircleIcon className={`w-4 h-4 ${priority.color}`} />
 )}
 </div>
 <p className={`text-sm mt-1 ${
 formData.priority === priority.value ? priority.color : 'text-neutral-dark-gray'
 }`}>
 {priority.description}
 </p>
 </div>
 </label>
 ))}
 </div>
 </div>

 {}
 <div>
 <label htmlFor="message" className="block text-sm font-medium text-primary-navy mb-2">
 Message *
 </label>
 <textarea
 id="message"
 value={formData.message}
 onChange={(e) => handleInputChange('message', e.target.value)}
 rows={6}
 className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-pink focus:border-accent-pink transition-colors duration-200 resize-none ${
 errors.message ? 'border-red-500' : 'border-neutral-gray'
 }`}
 placeholder="Please describe your issue or question in detail. Include any relevant information that might help us assist you better."
 maxLength={2000}
 />
 <div className="flex justify-between items-center mt-1">
 {errors.message && (
 <p className="text-red-500 text-sm">{errors.message}</p>
 )}
 <p className="text-neutral-gray text-sm ml-auto">
 {formData.message.length}/2000
 </p>
 </div>
 </div>

 {}
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
 <div className="flex items-start space-x-3">
 <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
 <div>
 <h4 className="font-medium text-blue-800 mb-1">Expected Response Time</h4>
 <p className="text-blue-700 text-sm">
 {formData.priority === 'urgent' && 'We aim to respond to urgent requests within 2 hours.'}
 {formData.priority === 'high' && 'We aim to respond to high priority requests within 8 hours.'}
 {formData.priority === 'medium' && 'We aim to respond to standard requests within 24 hours.'}
 {formData.priority === 'low' && 'We aim to respond to low priority requests within 48 hours.'}
 </p>
 </div>
 </div>
 </div>

 {}
 <div className="flex justify-end">
 <button
 type="submit"
 disabled={isSubmitting}
 className="flex items-center space-x-2 px-6 py-3 bg-accent-pink text-neutral-white rounded-lg hover:bg-accent-pink/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent-pink focus:ring-offset-2"
 >
 {isSubmitting ? (
 <>
 <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
 <span>Sending...</span>
 </>
 ) : (
 <>
 <PaperAirplaneIcon className="w-4 h-4" />
 <span>Send Help Request</span>
 </>
 )}
 </button>
 </div>
 </form>
 );
}