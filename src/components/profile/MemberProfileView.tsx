"use client";

import React from "react";
import { MemberProfile } from "@/contexts/AuthContext";
import {
 WalletIcon,
 StarIcon,
 EyeIcon,
 HeartIcon,
} from "@heroicons/react/24/outline";
import { ProfileComponentErrorBoundary } from "./ProfileErrorBoundary";

interface MemberProfileViewProps {
 profile: MemberProfile;
 onEdit?: () => void;
 className?: string;
}

export default function MemberProfileView({
 profile,
 onEdit,
 className = "",
}: MemberProfileViewProps) {

 const memberProfile = profile as any; // Type assertion for now
 const walletBalance = memberProfile.walletBalance || 0;
 const watchHistory = memberProfile.watchHistory || [];
 const favoriteCreators = memberProfile.favoriteCreators || [];
 const membershipStatus = memberProfile.membershipStatus || "free";
 const membershipExpiry = memberProfile.membershipExpiry;

 const stats = [
 {
 label: "Wallet Balance",
 value: `${walletBalance} credits`,
 icon: WalletIcon,
 color: "text-green-600",
 },
 {
 label: "Videos Watched",
 value: watchHistory.length.toString(),
 icon: EyeIcon,
 color: "text-blue-600",
 },
 {
 label: "Favorite Creators",
 value: favoriteCreators.length.toString(),
 icon: HeartIcon,
 color: "text-red-600",
 },
 ];

 const getMembershipBadgeColor = (status: string) => {
 switch (status) {
 case "premium":
 return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
 case "free":
 default:
 return "bg-neutral-gray text-neutral-white";
 }
 };

 return (
 <ProfileComponentErrorBoundary componentName="Member Profile">
 <div className={`bg-neutral-white rounded-lg shadow-lg p-6 ${className}`}>
 {}
 <div className="flex justify-between items-start mb-6">
 <div className="flex items-center space-x-4">
 <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden">
 {profile.avatar ? (
 <img
 src={profile.avatar}
 alt={`${profile.username}'s avatar`}
 className="w-full h-full object-cover"
 />
 ) : (
 <span className="text-primary-navy font-bold text-xl">
 {profile.username.charAt(0).toUpperCase()}
 </span>
 )}
 </div>
 <div>
 <h1 className="text-2xl font-bold text-primary-navy">
 {profile.username}
 </h1>
 <p className="text-neutral-gray">@{profile.username}</p>
 <div className="flex items-center space-x-2 mt-1">
 <span className="text-sm text-accent-pink font-medium">
 Member
 </span>
 <span
 className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getMembershipBadgeColor(
 membershipStatus
 )}`}
 >
 {membershipStatus}
 </span>
 </div>
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
 {membershipStatus === "premium" && membershipExpiry && (
 <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
 <div className="flex items-center space-x-2 mb-2">
 <StarIcon className="w-5 h-5 text-yellow-600" />
 <h2 className="text-lg font-semibold text-yellow-800">
 Premium Member
 </h2>
 </div>
 <p className="text-sm text-yellow-700">
 Your premium membership expires on{" "}
 {new Date(membershipExpiry).toLocaleDateString()}
 </p>
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
 <p className="text-2xl font-bold text-primary-navy">
 {stat.value}
 </p>
 <p className="text-sm text-neutral-gray">{stat.label}</p>
 </div>
 ))}
 </div>

 {}
 <div className="mb-6">
 <h2 className="text-lg font-semibold text-primary-navy mb-4">
 Quick Actions
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <button className="flex items-center justify-center space-x-2 p-4 bg-accent-pink text-neutral-white rounded-lg hover:bg-accent-pink/90 transition-colors duration-200">
 <WalletIcon className="w-5 h-5" />
 <span>Top Up Wallet</span>
 </button>
 <button className="flex items-center justify-center space-x-2 p-4 border border-accent-pink text-accent-pink rounded-lg hover:bg-accent-pink hover:text-neutral-white transition-all duration-200">
 <StarIcon className="w-5 h-5" />
 <span>Upgrade to Premium</span>
 </button>
 </div>
 </div>

 {}
 <div className="mb-6">
 <h2 className="text-lg font-semibold text-primary-navy mb-4">
 Recent Activity
 </h2>
 {watchHistory.length > 0 ? (
 <div className="space-y-2">
 <p className="text-sm text-neutral-gray">
 You&apos;ve watched {watchHistory.length} videos
 </p>
 <p className="text-sm text-neutral-gray">
 Following {favoriteCreators.length} creators
 </p>
 </div>
 ) : (
 <p className="text-sm text-neutral-gray">
 Start watching videos to see your activity here!
 </p>
 )}
 </div>

 {}
 <div className="pt-6 border-t border-neutral-gray/20">
 <h2 className="text-lg font-semibold text-primary-navy mb-4">
 Account Information
 </h2>
 <div className="space-y-2">
 <p className="text-sm text-neutral-gray">
 <span className="font-medium">Email:</span> {profile.email}
 </p>
 <p className="text-sm text-neutral-gray">
 <span className="font-medium">Member since:</span>{" "}
 {new Date(profile.createdAt).toLocaleDateString()}
 </p>
 <p className="text-sm text-neutral-gray">
 <span className="font-medium">Last updated:</span>{" "}
 {new Date(profile.updatedAt).toLocaleDateString()}
 </p>
 </div>
 </div>
 </div>
 </ProfileComponentErrorBoundary>
 );
}
