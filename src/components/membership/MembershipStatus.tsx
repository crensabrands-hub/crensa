"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
 StarIcon,
 CalendarIcon,
 ClockIcon,
 ArrowPathIcon,
 ExclamationTriangleIcon,
 CheckCircleIcon,
 XCircleIcon,
 CreditCardIcon,
 GiftIcon,
} from "@heroicons/react/24/outline";
import { useAuthContext, type MemberProfile } from "@/contexts/AuthContext";
import { useMemberStats } from "@/hooks/useMemberStats";
import type { MembershipStatus as MembershipStatusType } from "@/types";

interface UsageStats {
 videosWatched: number;
 watchTime: number;
 creditsUsed: number;
 exclusiveContentAccessed: number;
}

interface MembershipHistoryItem {
 id: string;
 type: "activation" | "upgrade" | "renewal" | "cancellation";
 planName: string;
 amount: number;
 date: string;
 status: "completed" | "pending" | "failed";
}

export default function MembershipStatus() {
 const { userProfile } = useAuthContext();
 const { stats: memberStats, loading: statsLoading } = useMemberStats();
 const [membershipStatus, setMembershipStatus] =
 useState<MembershipStatusType | null>(null);
 const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
 const [membershipHistory, setMembershipHistory] = useState<
 MembershipHistoryItem[]
 >([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchMembershipData = async () => {
 if (userProfile?.role === "member") {
 try {

 const statusResponse = await fetch(
 `/api/membership/status/${userProfile.id}`
 );
 if (statusResponse.ok) {
 const status = await statusResponse.json();
 setMembershipStatus({
 ...status,
 expiry: status.expiry ? new Date(status.expiry) : undefined,
 });
 } else {

 const profile = userProfile as MemberProfile;
 const status: MembershipStatusType = {
 status: profile.membershipStatus,
 expiry: profile.membershipExpiry
 ? new Date(profile.membershipExpiry)
 : undefined,
 daysRemaining: profile.membershipExpiry
 ? Math.max(
 0,
 Math.ceil(
 (new Date(profile.membershipExpiry).getTime() -
 Date.now()) /
 (1000 * 60 * 60 * 24)
 )
 )
 : undefined,
 autoRenew: profile.autoRenew || false,
 };
 setMembershipStatus(status);
 }

 try {
 const usageResponse = await fetch(
 `/api/membership/usage/${userProfile.id}`
 );
 if (usageResponse.ok) {
 const usage = await usageResponse.json();
 setUsageStats(usage);
 }
 } catch (error) {
 console.error("Error fetching usage stats:", error);
 }

 try {
 const historyResponse = await fetch(
 `/api/membership/history/${userProfile.id}`
 );
 if (historyResponse.ok) {
 const history = await historyResponse.json();
 setMembershipHistory(history);
 }
 } catch (error) {
 console.error("Error fetching membership history:", error);
 }
 } catch (error) {
 console.error("Error fetching membership status:", error);

 const profile = userProfile as MemberProfile;
 const status: MembershipStatusType = {
 status: profile.membershipStatus,
 expiry: profile.membershipExpiry
 ? new Date(profile.membershipExpiry)
 : undefined,
 daysRemaining: profile.membershipExpiry
 ? Math.max(
 0,
 Math.ceil(
 (new Date(profile.membershipExpiry).getTime() -
 Date.now()) /
 (1000 * 60 * 60 * 24)
 )
 )
 : undefined,
 autoRenew: false,
 };
 setMembershipStatus(status);
 }
 }
 setLoading(false);
 };

 fetchMembershipData();
 }, [userProfile]);

 const handleUpgrade = () => {

 window.location.href = "/membership";
 };

 const handleRenew = () => {

 window.location.href = "/membership?action=renew";
 };

 const handleCancelSubscription = async () => {

 const confirmed = window.confirm(
 "Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period."
 );

 if (confirmed && userProfile?.id) {
 try {
 const response = await fetch("/api/membership/cancel", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 },
 body: JSON.stringify({ userId: userProfile.id }),
 });

 if (response.ok) {
 alert(
 "Your subscription has been cancelled. You will retain access until your current billing period ends."
 );

 window.location.reload();
 } else {
 alert(
 "Failed to cancel subscription. Please try again or contact support."
 );
 }
 } catch (error) {
 console.error("Error cancelling subscription:", error);
 alert(
 "Failed to cancel subscription. Please try again or contact support."
 );
 }
 }
 };

 if (loading) {
 return (
 <div className="bg-white rounded-2xl border border-gray-200 p-8">
 <div className="animate-pulse">
 <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
 <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
 <div className="space-y-4">
 <div className="h-24 bg-gray-200 rounded-lg"></div>
 <div className="h-24 bg-gray-200 rounded-lg"></div>
 </div>
 </div>
 </div>
 );
 }

 if (!membershipStatus) {
 return (
 <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
 <ExclamationTriangleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
 <h3 className="text-lg font-medium text-gray-900 mb-2">
 Unable to load membership status
 </h3>
 <p className="text-gray-600">
 Please try refreshing the page or contact support if the issue
 persists.
 </p>
 </div>
 );
 }

 const isPremium = membershipStatus.status === "premium";
 const isExpiringSoon =
 membershipStatus.daysRemaining !== undefined &&
 membershipStatus.daysRemaining <= 7;
 const isExpired = membershipStatus.daysRemaining === 0;

 return (
 <div className="space-y-6">
 {}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className={`bg-white rounded-2xl border-2 p-8 ${
 isPremium
 ? isExpired
 ? "border-red-200 bg-red-50"
 : isExpiringSoon
 ? "border-yellow-200 bg-yellow-50"
 : "border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50"
 : "border-gray-200"
 }`}
 >
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-4">
 <div
 className={`w-16 h-16 rounded-full flex items-center justify-center ${
 isPremium
 ? "bg-gradient-to-r from-purple-500 to-pink-500"
 : "bg-gray-100"
 }`}
 >
 {isPremium ? (
 <StarIcon className="w-8 h-8 text-white" />
 ) : (
 <StarIcon className="w-8 h-8 text-gray-400" />
 )}
 </div>
 <div>
 <h2 className="text-2xl font-bold text-gray-900">
 {isPremium ? "Premium Member" : "Free Member"}
 </h2>
 <p className="text-gray-600">
 {isPremium
 ? "You have access to all premium features"
 : "Upgrade to unlock exclusive content and features"}
 </p>
 </div>
 </div>

 {}
 <div
 className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
 isPremium
 ? isExpired
 ? "bg-red-100 text-red-800"
 : isExpiringSoon
 ? "bg-yellow-100 text-yellow-800"
 : "bg-green-100 text-green-800"
 : "bg-gray-100 text-gray-800"
 }`}
 >
 {isPremium ? (
 isExpired ? (
 <>
 <XCircleIcon className="w-4 h-4" />
 Expired
 </>
 ) : isExpiringSoon ? (
 <>
 <ExclamationTriangleIcon className="w-4 h-4" />
 Expiring Soon
 </>
 ) : (
 <>
 <CheckCircleIcon className="w-4 h-4" />
 Active
 </>
 )
 ) : (
 "Free Plan"
 )}
 </div>
 </div>

 {}
 {isPremium && membershipStatus.expiry && (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
 <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg">
 <CalendarIcon className="w-6 h-6 text-purple-600" />
 <div>
 <p className="text-sm text-gray-600">Expires On</p>
 <p className="font-semibold text-gray-900">
 {membershipStatus.expiry.toLocaleDateString()}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg">
 <ClockIcon className="w-6 h-6 text-purple-600" />
 <div>
 <p className="text-sm text-gray-600">Days Remaining</p>
 <p
 className={`font-semibold ${
 isExpired
 ? "text-red-600"
 : isExpiringSoon
 ? "text-yellow-600"
 : "text-gray-900"
 }`}
 >
 {membershipStatus.daysRemaining || 0} days
 </p>
 </div>
 </div>

 <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg">
 <ArrowPathIcon className="w-6 h-6 text-purple-600" />
 <div>
 <p className="text-sm text-gray-600">Auto Renew</p>
 <p className="font-semibold text-gray-900">
 {membershipStatus.autoRenew ? "Enabled" : "Disabled"}
 </p>
 </div>
 </div>
 </div>
 )}

 {}
 <div className="flex flex-wrap gap-3">
 {!isPremium ? (
 <button
 onClick={handleUpgrade}
 className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center gap-2"
 >
 <StarIcon className="w-5 h-5" />
 Upgrade to Premium
 </button>
 ) : isExpired || isExpiringSoon ? (
 <button
 onClick={handleRenew}
 className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
 >
 <CreditCardIcon className="w-5 h-5" />
 Renew Membership
 </button>
 ) : (
 <button
 onClick={handleCancelSubscription}
 className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
 >
 Manage Subscription
 </button>
 )}

 <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2">
 <GiftIcon className="w-5 h-5" />
 View Benefits
 </button>
 </div>
 </motion.div>

 {}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, delay: 0.1 }}
 className="bg-white rounded-2xl border border-gray-200 p-8"
 >
 <h3 className="text-xl font-bold text-gray-900 mb-6">
 Your Usage This Month
 </h3>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="text-center p-4 bg-gray-50 rounded-lg">
 <div className="text-2xl font-bold text-purple-600 mb-2">
 {statsLoading ? '...' : (memberStats?.videosWatched || 0)}
 </div>
 <p className="text-sm text-gray-600">Videos Watched</p>
 </div>

 <div className="text-center p-4 bg-gray-50 rounded-lg">
 <div className="text-2xl font-bold text-purple-600 mb-2">8.5h</div>
 <p className="text-sm text-gray-600">Watch Time</p>
 </div>

 <div className="text-center p-4 bg-gray-50 rounded-lg">
 <div className="text-2xl font-bold text-purple-600 mb-2">
 {isPremium ? "∞" : "12"}
 </div>
 <p className="text-sm text-gray-600">
 {isPremium ? "Unlimited Access" : "Credits Used"}
 </p>
 </div>
 </div>
 </motion.div>

 {}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, delay: 0.2 }}
 className="bg-white rounded-2xl border border-gray-200 p-8"
 >
 <h3 className="text-xl font-bold text-gray-900 mb-6">
 Membership History
 </h3>

 <div className="space-y-4">
 {membershipHistory.length > 0 ? (
 membershipHistory.map((item) => {
 const getIcon = (type: string) => {
 switch (type) {
 case "activation":
 return (
 <CheckCircleIcon className="w-6 h-6 text-green-600" />
 );
 case "upgrade":
 return <StarIcon className="w-6 h-6 text-blue-600" />;
 case "renewal":
 return (
 <ArrowPathIcon className="w-6 h-6 text-purple-600" />
 );
 case "cancellation":
 return <XCircleIcon className="w-6 h-6 text-red-600" />;
 default:
 return <CreditCardIcon className="w-6 h-6 text-gray-600" />;
 }
 };

 const getIconBg = (type: string) => {
 switch (type) {
 case "activation":
 return "bg-green-100";
 case "upgrade":
 return "bg-blue-100";
 case "renewal":
 return "bg-purple-100";
 case "cancellation":
 return "bg-red-100";
 default:
 return "bg-gray-100";
 }
 };

 const getDescription = (type: string, planName: string) => {
 switch (type) {
 case "activation":
 return `${planName} Activated`;
 case "upgrade":
 return `Upgraded to ${planName}`;
 case "renewal":
 return `${planName} Renewed`;
 case "cancellation":
 return `${planName} Cancelled`;
 default:
 return planName;
 }
 };

 return (
 <div
 key={item.id}
 className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
 >
 <div className="flex items-center gap-3">
 <div
 className={`w-10 h-10 ${getIconBg(
 item.type
 )} rounded-full flex items-center justify-center`}
 >
 {getIcon(item.type)}
 </div>
 <div>
 <p className="font-medium text-gray-900">
 {getDescription(item.type, item.planName)}
 </p>
 <p className="text-sm text-gray-600">
 {new Date(item.date).toLocaleDateString("en-IN", {
 year: "numeric",
 month: "long",
 day: "numeric",
 })}
 </p>
 </div>
 </div>
 <div className="text-right">
 <span className="text-sm text-gray-500">
 {item.amount > 0 ? `₹${item.amount}` : "Free"}
 </span>
 {item.status !== "completed" && (
 <p
 className={`text-xs ${
 item.status === "pending"
 ? "text-yellow-600"
 : "text-red-600"
 }`}
 >
 {item.status}
 </p>
 )}
 </div>
 </div>
 );
 })
 ) : (
 <div className="text-center py-8 text-gray-500">
 <CreditCardIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
 <p>No membership history available</p>
 </div>
 )}
 </div>
 </motion.div>
 </div>
 );
}
