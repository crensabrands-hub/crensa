'use client';

import React, { useState, useRef } from 'react';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AvatarUploadProps {
 currentAvatar?: string;
 username: string;
 onAvatarChange: (file: File | null) => void;
 isLoading?: boolean;
 className?: string;
}

export default function AvatarUpload({
 currentAvatar,
 username,
 onAvatarChange,
 isLoading = false,
 className = '',
}: AvatarUploadProps) {
 const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null);
 const fileInputRef = useRef<HTMLInputElement>(null);

 const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
 const file = event.target.files?.[0];
 
 if (file) {

 if (!file.type.startsWith('image/')) {
 alert('Please select an image file');
 return;
 }

 if (file.size > 5 * 1024 * 1024) {
 alert('File size must be less than 5MB');
 return;
 }

 const url = URL.createObjectURL(file);
 setPreviewUrl(url);
 onAvatarChange(file);
 }
 };

 const handleRemoveAvatar = () => {
 setPreviewUrl(null);
 onAvatarChange(null);
 if (fileInputRef.current) {
 fileInputRef.current.value = '';
 }
 };

 const handleClick = () => {
 fileInputRef.current?.click();
 };

 return (
 <div className={`flex flex-col items-center space-y-4 ${className}`}>
 {}
 <div className="relative group">
 <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden border-4 border-neutral-white shadow-lg">
 {previewUrl ? (
 <img
 src={previewUrl}
 alt={`${username}'s avatar`}
 className="w-full h-full object-cover"
 />
 ) : (
 <span className="text-primary-navy font-bold text-2xl">
 {username ? username.charAt(0).toUpperCase() : 'U'}
 </span>
 )}
 </div>

 {}
 <button
 onClick={handleClick}
 disabled={isLoading}
 className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:cursor-not-allowed"
 aria-label="Upload avatar"
 >
 {isLoading ? (
 <div className="w-6 h-6 animate-spin rounded-full border-2 border-white/20 border-t-white" role="status" aria-label="Loading"></div>
 ) : (
 <CameraIcon className="w-6 h-6 text-white" />
 )}
 </button>

 {}
 {previewUrl && !isLoading && (
 <button
 onClick={handleRemoveAvatar}
 className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors duration-200"
 aria-label="Remove avatar"
 >
 <XMarkIcon className="w-4 h-4" />
 </button>
 )}
 </div>

 {}
 <div className="text-center">
 <button
 onClick={handleClick}
 disabled={isLoading}
 className="text-sm text-accent-pink hover:text-accent-pink/80 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {previewUrl ? 'Change Avatar' : 'Upload Avatar'}
 </button>
 <p className="text-xs text-neutral-gray mt-1">
 JPG, PNG or GIF. Max size 5MB.
 </p>
 </div>

 {}
 <input
 ref={fileInputRef}
 type="file"
 accept="image/*"
 onChange={handleFileSelect}
 className="hidden"
 aria-label="Avatar file input"
 />
 </div>
 );
}