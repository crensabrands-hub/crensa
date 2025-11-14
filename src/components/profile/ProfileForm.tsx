'use client';

import React, { useState, useEffect } from 'react';
import { useAuthContext, CreatorProfile, MemberProfile } from '@/contexts/AuthContext';
import AvatarUpload from './AvatarUpload';
import { ProfileComponentErrorBoundary } from './ProfileErrorBoundary';

interface ProfileFormProps {
 onSave?: () => void;
 onCancel?: () => void;
 className?: string;
}

interface FormData {
 username: string;
 email: string;
 displayName?: string;
 bio?: string;
 socialLinks?: Array<{ platform: string; url: string }>;
}

interface FormErrors {
 username?: string;
 email?: string;
 displayName?: string;
 bio?: string;
 socialLinks?: string;
}

export default function ProfileForm({ onSave, onCancel, className = '' }: ProfileFormProps) {
 const { userProfile, updateUserProfile } = useAuthContext();
 const [formData, setFormData] = useState<FormData>({
 username: '',
 email: '',
 });
 const [errors, setErrors] = useState<FormErrors>({});
 const [isLoading, setIsLoading] = useState(false);
 const [avatarFile, setAvatarFile] = useState<File | null>(null);
 const [isAvatarLoading, setIsAvatarLoading] = useState(false);

 useEffect(() => {
 if (userProfile) {
 const baseData: FormData = {
 username: userProfile.username,
 email: userProfile.email,
 };

 if (userProfile.role === 'creator') {
 const creatorProfile = userProfile as CreatorProfile;
 baseData.displayName = creatorProfile.displayName;
 baseData.bio = creatorProfile.bio;
 baseData.socialLinks = creatorProfile.socialLinks || [];
 }

 setFormData(baseData);
 }
 }, [userProfile]);

 const validateForm = (): boolean => {
 const newErrors: FormErrors = {};

 if (!formData.username.trim()) {
 newErrors.username = 'Username is required';
 } else if (formData.username.length < 3) {
 newErrors.username = 'Username must be at least 3 characters';
 } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
 newErrors.username = 'Username can only contain letters, numbers, and underscores';
 }

 if (!formData.email.trim()) {
 newErrors.email = 'Email is required';
 } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
 newErrors.email = 'Please enter a valid email address';
 }

 if (userProfile?.role === 'creator') {
 if (!formData.displayName?.trim()) {
 newErrors.displayName = 'Display name is required for creators';
 }

 if (formData.bio && formData.bio.length > 500) {
 newErrors.bio = 'Bio must be less than 500 characters';
 }

 if (formData.socialLinks) {
 const invalidLinks = formData.socialLinks.some(link => {
 if (link.url && !isValidUrl(link.url)) {
 return true;
 }
 return false;
 });

 if (invalidLinks) {
 newErrors.socialLinks = 'Please enter valid URLs for social links';
 }
 }
 }

 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };

 const isValidUrl = (url: string): boolean => {
 try {
 new URL(url);
 return true;
 } catch {
 return false;
 }
 };

 const handleInputChange = (field: keyof FormData, value: string) => {
 setFormData(prev => ({ ...prev, [field]: value }));
 if (errors[field]) {
 setErrors(prev => ({ ...prev, [field]: undefined }));
 }
 };

 const handleSocialLinkChange = (index: number, field: 'platform' | 'url', value: string) => {
 if (!formData.socialLinks) return;

 const updatedLinks = [...formData.socialLinks];
 updatedLinks[index] = { ...updatedLinks[index], [field]: value };
 setFormData(prev => ({ ...prev, socialLinks: updatedLinks }));

 if (errors.socialLinks) {
 setErrors(prev => ({ ...prev, socialLinks: undefined }));
 }
 };

 const addSocialLink = () => {
 const currentLinks = formData.socialLinks || [];
 setFormData(prev => ({
 ...prev,
 socialLinks: [...currentLinks, { platform: '', url: '' }]
 }));
 };

 const removeSocialLink = (index: number) => {
 if (!formData.socialLinks) return;
 const updatedLinks = formData.socialLinks.filter((_, i) => i !== index);
 setFormData(prev => ({ ...prev, socialLinks: updatedLinks }));
 };

 const handleAvatarChange = async (file: File | null) => {
 setAvatarFile(file);
 
 if (file) {
 setIsAvatarLoading(true);
 try {

 const avatarUrl = URL.createObjectURL(file);
 await updateUserProfile({ avatar: avatarUrl });
 } catch (error) {
 console.error('Failed to update avatar:', error);
 } finally {
 setIsAvatarLoading(false);
 }
 } else {

 await updateUserProfile({ avatar: undefined });
 }
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 
 if (!validateForm()) {
 return;
 }

 setIsLoading(true);
 try {
 const updateData: any = {
 username: formData.username,
 email: formData.email,
 };

 if (userProfile?.role === 'creator') {
 updateData.displayName = formData.displayName;
 updateData.bio = formData.bio;
 updateData.socialLinks = formData.socialLinks?.filter(link => 
 link.platform.trim() && link.url.trim()
 );
 }

 await updateUserProfile(updateData);
 onSave?.();
 } catch (error) {
 console.error('Failed to update profile:', error);
 } finally {
 setIsLoading(false);
 }
 };

 if (!userProfile) {
 return (
 <div className="flex justify-center items-center py-8">
 <div className="w-8 h-8 animate-spin rounded-full border-2 border-accent-pink/20 border-t-accent-pink"></div>
 </div>
 );
 }

 return (
 <ProfileComponentErrorBoundary componentName="Profile Form">
 <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
 {}
 <div className="flex justify-center">
 <AvatarUpload
 currentAvatar={userProfile.avatar}
 username={userProfile.username}
 onAvatarChange={handleAvatarChange}
 isLoading={isAvatarLoading}
 />
 </div>

 {}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label htmlFor="username" className="block text-sm font-medium text-primary-navy mb-2">
 Username *
 </label>
 <input
 type="text"
 id="username"
 value={formData.username}
 onChange={(e) => handleInputChange('username', e.target.value)}
 className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-pink focus:border-accent-pink transition-colors duration-200 ${
 errors.username ? 'border-red-500' : 'border-neutral-gray'
 }`}
 placeholder="Enter your username"
 />
 {errors.username && (
 <p className="text-red-500 text-sm mt-1">{errors.username}</p>
 )}
 </div>

 <div>
 <label htmlFor="email" className="block text-sm font-medium text-primary-navy mb-2">
 Email *
 </label>
 <input
 type="email"
 id="email"
 value={formData.email}
 onChange={(e) => handleInputChange('email', e.target.value)}
 className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-pink focus:border-accent-pink transition-colors duration-200 ${
 errors.email ? 'border-red-500' : 'border-neutral-gray'
 }`}
 placeholder="Enter your email"
 />
 {errors.email && (
 <p className="text-red-500 text-sm mt-1">{errors.email}</p>
 )}
 </div>
 </div>

 {}
 {userProfile.role === 'creator' && (
 <>
 <div>
 <label htmlFor="displayName" className="block text-sm font-medium text-primary-navy mb-2">
 Display Name *
 </label>
 <input
 type="text"
 id="displayName"
 value={formData.displayName || ''}
 onChange={(e) => handleInputChange('displayName', e.target.value)}
 className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-pink focus:border-accent-pink transition-colors duration-200 ${
 errors.displayName ? 'border-red-500' : 'border-neutral-gray'
 }`}
 placeholder="Enter your display name"
 />
 {errors.displayName && (
 <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>
 )}
 </div>

 <div>
 <label htmlFor="bio" className="block text-sm font-medium text-primary-navy mb-2">
 Bio
 </label>
 <textarea
 id="bio"
 value={formData.bio || ''}
 onChange={(e) => handleInputChange('bio', e.target.value)}
 rows={4}
 className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-pink focus:border-accent-pink transition-colors duration-200 resize-none ${
 errors.bio ? 'border-red-500' : 'border-neutral-gray'
 }`}
 placeholder="Tell us about yourself..."
 />
 <div className="flex justify-between items-center mt-1">
 {errors.bio && (
 <p className="text-red-500 text-sm">{errors.bio}</p>
 )}
 <p className="text-neutral-gray text-sm ml-auto">
 {(formData.bio || '').length}/500
 </p>
 </div>
 </div>

 {}
 <div>
 <div className="flex justify-between items-center mb-4">
 <label className="block text-sm font-medium text-primary-navy">
 Social Links
 </label>
 <button
 type="button"
 onClick={addSocialLink}
 className="text-sm text-accent-pink hover:text-accent-pink/80 font-medium transition-colors duration-200"
 >
 + Add Link
 </button>
 </div>
 
 {formData.socialLinks?.map((link, index) => (
 <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
 <input
 type="text"
 value={link.platform}
 onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
 className="px-4 py-3 border border-neutral-gray rounded-lg focus:ring-2 focus:ring-accent-pink focus:border-accent-pink transition-colors duration-200"
 placeholder="Platform (e.g., Instagram)"
 />
 <input
 type="url"
 value={link.url}
 onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
 className="px-4 py-3 border border-neutral-gray rounded-lg focus:ring-2 focus:ring-accent-pink focus:border-accent-pink transition-colors duration-200"
 placeholder="https://..."
 />
 <button
 type="button"
 onClick={() => removeSocialLink(index)}
 className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
 >
 Remove
 </button>
 </div>
 ))}
 
 {errors.socialLinks && (
 <p className="text-red-500 text-sm mt-1">{errors.socialLinks}</p>
 )}
 </div>
 </>
 )}

 {}
 <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-gray/20">
 {onCancel && (
 <button
 type="button"
 onClick={onCancel}
 className="px-6 py-3 text-primary-navy border border-primary-navy rounded-lg hover:bg-primary-navy hover:text-neutral-white transition-all duration-200"
 >
 Cancel
 </button>
 )}
 <button
 type="submit"
 disabled={isLoading}
 className="px-6 py-3 bg-accent-pink text-neutral-white rounded-lg hover:bg-accent-pink/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
 >
 {isLoading && (
 <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
 )}
 <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
 </button>
 </div>
 </form>
 </ProfileComponentErrorBoundary>
 );
}