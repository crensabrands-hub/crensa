'use client';

import React from 'react';
import { CreatorProfile } from '@/contexts/AuthContext';
import { EyeIcon, CurrencyDollarIcon, PlayIcon, LinkIcon } from '@heroicons/react/24/outline';
import { ProfileComponentErrorBoundary } from './ProfileErrorBoundary';

interface CreatorProfileViewProps {
 profile: CreatorProfile;
 onEdit?: () => void;
 className?: string;
}

export default function CreatorProfileView({ 
 profile, 
 onEdit, 
 className = '' 
}: CreatorProfileViewProps) {
 const stats = [
 {
 label: 'Total Earnings',
 value: `$${profile.totalEarnings.toLocaleString()}`,
 icon: CurrencyDollarIcon,
 color: 'text-green-600',
 },
 {
 label: 'Total Views',
 value: profile.totalViews.toLocaleString(),
 icon: EyeIcon,
 color: 'text-blue-600',
 },
 {
 label: 'Videos',
 value: profile.videoCount.toString(),
 icon: PlayIcon,
 color: 'text-purple-600',
 },
 ];

 return (
 <ProfileComponentErrorBoundary componentName="Creator Profile">
 <div className={`bg-neutral-white rounded-lg shadow-lg p-6 ${className}`}>
 {}
 <div className="flex justify-between items-start mb-6">
 <div className="flex items-center space-x-4">
 <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden">
 {profile.avatar ? (
 <img
 src={profile.avatar}
 alt={`${profile.displayName}'s avatar`}
 className="w-full h-full object-cover"
 />
 ) : (
 <span className="text-primary-navy font-bold text-xl">
 {profile.displayName.charAt(0).toUpperCase()}
 </span>
 )}
 </div>
 <div>
 <h1 className="text-2xl font-bold text-primary-navy">
 {profile.displayName}
 </h1>
 <p className="text-neutral-gray">@{profile.username}</p>
 <p className="text-sm text-accent-pink font-medium">Creator</p>
 </div>
 </div>
 
 {onEdit && (
 <button
 onClick={onEdit}
 className="px-4 py-2 text-accent-pink border border-accent-pink rounded-lg hover:bg-accent-pink hover:text-neutral-white transition-all duration-200"
 >
 Edit Profile
 </button>
 )}
 </div>

 {}
 {profile.bio && (
 <div className="mb-6">
 <h2 className="text-lg font-semibold text-primary-navy mb-2">About</h2>
 <p className="text-neutral-gray leading-relaxed">{profile.bio}</p>
 </div>
 )}

 {}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
 {stats.map((stat) => (
 <div
 key={stat.label}
 className="bg-neutral-gray/5 rounded-lg p-4 text-center"
 >
 <div className="flex justify-center mb-2">
 <stat.icon className={`w-6 h-6 ${stat.color}`} />
 </div>
 <p className="text-2xl font-bold text-primary-navy">{stat.value}</p>
 <p className="text-sm text-neutral-gray">{stat.label}</p>
 </div>
 ))}
 </div>

 {}
 {profile.socialLinks && profile.socialLinks.length > 0 && (
 <div>
 <h2 className="text-lg font-semibold text-primary-navy mb-4">Social Links</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {profile.socialLinks.map((link, index) => (
 <a
 key={index}
 href={link.url}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center space-x-3 p-3 bg-neutral-gray/5 rounded-lg hover:bg-neutral-gray/10 transition-colors duration-200"
 >
 <LinkIcon className="w-5 h-5 text-accent-pink" />
 <div>
 <p className="font-medium text-primary-navy">{link.platform}</p>
 <p className="text-sm text-neutral-gray truncate">{link.url}</p>
 </div>
 </a>
 ))}
 </div>
 </div>
 )}

 {}
 <div className="mt-6 pt-6 border-t border-neutral-gray/20">
 <h2 className="text-lg font-semibold text-primary-navy mb-4">Contact</h2>
 <div className="space-y-2">
 <p className="text-sm text-neutral-gray">
 <span className="font-medium">Email:</span> {profile.email}
 </p>
 <p className="text-sm text-neutral-gray">
 <span className="font-medium">Member since:</span>{' '}
 {new Date(profile.createdAt).toLocaleDateString()}
 </p>
 </div>
 </div>
 </div>
 </ProfileComponentErrorBoundary>
 );
}