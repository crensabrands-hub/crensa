"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import {
 BellIcon,
 CheckIcon,
 XMarkIcon,
 CogIcon,
 ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { NotificationPreferences } from "@/components/notifications";

export default function NotificationsPage() {
 const { userProfile, isLoading } = useAuthContext();
 const {
 notifications,
 unreadCount,
 isLoading: isLoadingNotifications,
 error,
 markAsRead,
 markAllAsRead,
 deleteNotification,
 fetchNotifications,
 clearError,
 } = useNotifications();

 const [filter, setFilter] = useState<"all" | "unread">("all");
 const [activeTab, setActiveTab] = useState<"notifications" | "preferences">(
 "notifications"
 );

 const handleRetry = () => {
 clearError();
 fetchNotifications(true);
 };

 useEffect(() => {
 if (error) {
 const timer = setTimeout(() => {
 clearError();
 }, 5000); // Auto-clear error after 5 seconds
 return () => clearTimeout(timer);
 }
 }, [error, clearError]);

 const getNotificationIcon = (type: string): string => {
 switch (type) {
 case "earning":
 return "💰";
 case "follower":
 return "👤";
 case "video_view":
 return "🎥";
 case "payment":
 return "💳";
 case "comment":
 return "💬";
 case "like":
 return "❤️";
 case "system":
 return "🔔";
 default:
 return "📢";
 }
 };

 const formatTimeAgo = (date: string | Date) => {
 const now = new Date();
 const notificationDate = new Date(date);
 const diffInSeconds = Math.floor(
 (now.getTime() - notificationDate.getTime()) / 1000
 );

 if (diffInSeconds < 60) return "Just now";
 if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
 if (diffInSeconds < 86400)
 return `${Math.floor(diffInSeconds / 3600)}h ago`;
 if (diffInSeconds < 604800)
 return `${Math.floor(diffInSeconds / 86400)}d ago`;
 return notificationDate.toLocaleDateString();
 };

 if (isLoading) {
 return (
 <div className="min-h-screen bg-neutral-gray/5 flex items-center justify-center">
 <div className="w-8 h-8 animate-spin rounded-full border-2 border-accent-pink/20 border-t-accent-pink"></div>
 </div>
 );
 }

 if (!userProfile) {
 return (
 <div className="min-h-screen bg-neutral-gray/5 flex items-center justify-center">
 <div className="text-center">
 <h1 className="text-2xl font-bold text-primary-navy mb-4">
 Access Denied
 </h1>
 <p className="text-neutral-gray">
 Please sign in to view notifications.
 </p>
 </div>
 </div>
 );
 }

 const roleFilteredNotifications =
 userProfile.role === "creator"
 ? notifications
 : notifications.filter(
 (n) => n.type !== "earning" && n.type !== "follower"
 );

 const filteredNotifications =
 filter === "unread"
 ? roleFilteredNotifications.filter((n) => !n.isRead)
 : roleFilteredNotifications;

 return (
 <div className="min-h-screen bg-neutral-gray/5">
 <div className="container mx-auto px-4 py-8">
 <div className="max-w-4xl mx-auto">
 {}
 <div className="flex items-center justify-between mb-8">
 <div className="flex items-center space-x-4">
 <BellIcon className="w-8 h-8 text-accent-pink" />
 <div>
 <h1 className="text-3xl font-bold text-primary-navy">
 Notifications
 </h1>
 {unreadCount > 0 && (
 <p className="text-sm text-neutral-gray">
 {unreadCount} unread notification
 {unreadCount !== 1 ? "s" : ""}
 </p>
 )}
 </div>
 </div>

 <div className="flex items-center space-x-4">
 {unreadCount > 0 && activeTab === "notifications" && (
 <button
 onClick={markAllAsRead}
 className="px-4 py-2 text-accent-pink border border-accent-pink rounded-lg hover:bg-accent-pink hover:text-neutral-white transition-all duration-200"
 >
 Mark All Read
 </button>
 )}

 <button
 onClick={() =>
 setActiveTab(
 activeTab === "notifications"
 ? "preferences"
 : "notifications"
 )
 }
 className="p-2 text-neutral-gray hover:text-accent-pink transition-colors duration-200"
 title="Settings"
 >
 <CogIcon className="w-6 h-6" />
 </button>
 </div>
 </div>

 {}
 <div className="flex space-x-4 mb-6">
 <button
 onClick={() => setActiveTab("notifications")}
 className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
 activeTab === "notifications"
 ? "bg-accent-pink text-neutral-white"
 : "text-primary-navy hover:bg-neutral-gray/10"
 }`}
 >
 Notifications
 </button>
 <button
 onClick={() => setActiveTab("preferences")}
 className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
 activeTab === "preferences"
 ? "bg-accent-pink text-neutral-white"
 : "text-primary-navy hover:bg-neutral-gray/10"
 }`}
 >
 Preferences
 </button>
 </div>

 {}
 {error && (
 <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
 <div className="flex items-start space-x-3">
 <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
 <div className="flex-1">
 <h3 className="text-sm font-semibold text-red-800 mb-1">
 Error Loading Notifications
 </h3>
 <p className="text-sm text-red-700 mb-3">
 {error}
 </p>
 <button
 onClick={handleRetry}
 className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors duration-200"
 >
 Try Again
 </button>
 </div>
 <button
 onClick={clearError}
 className="text-red-400 hover:text-red-600 transition-colors duration-200"
 >
 <XMarkIcon className="w-4 h-4" />
 </button>
 </div>
 </div>
 )}

 {}
 {activeTab === "preferences" ? (
 <NotificationPreferences />
 ) : (
 <>
 {}
 <div className="flex space-x-4 mb-6">
 <button
 onClick={() => setFilter("all")}
 className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
 filter === "all"
 ? "bg-accent-pink text-neutral-white"
 : "text-primary-navy hover:bg-neutral-gray/10"
 }`}
 >
 All ({roleFilteredNotifications.length})
 </button>
 <button
 onClick={() => setFilter("unread")}
 className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
 filter === "unread"
 ? "bg-accent-pink text-neutral-white"
 : "text-primary-navy hover:bg-neutral-gray/10"
 }`}
 >
 Unread ({unreadCount})
 </button>
 </div>

 {}
 <div className="bg-neutral-white rounded-lg shadow-lg overflow-hidden">
 {isLoadingNotifications ? (
 <div className="flex flex-col justify-center items-center py-12" role="status" aria-live="polite">
 <div className="w-8 h-8 animate-spin rounded-full border-2 border-accent-pink/20 border-t-accent-pink mb-3"></div>
 <p className="text-sm text-neutral-gray">Loading notifications...</p>
 </div>
 ) : filteredNotifications.length === 0 ? (
 <div className="text-center py-12">
 <BellIcon className="w-16 h-16 text-neutral-gray mx-auto mb-4" />
 <h3 className="text-lg font-semibold text-primary-navy mb-2">
 {filter === "unread"
 ? "No unread notifications"
 : "No notifications"}
 </h3>
 <p className="text-neutral-gray">
 {filter === "unread"
 ? "All caught up! Check back later for new notifications."
 : "You'll see notifications here when you have them."}
 </p>
 </div>
 ) : (
 <div className="divide-y divide-neutral-gray/20">
 {filteredNotifications.map((notification) => (
 <div
 key={notification.id}
 className={`p-6 hover:bg-neutral-gray/5 transition-colors duration-200 ${
 !notification.isRead ? "bg-accent-pink/5" : ""
 }`}
 >
 <div className="flex items-start space-x-4">
 {}
 <div className="flex-shrink-0">
 <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-lg">
 {getNotificationIcon(notification.type)}
 </div>
 </div>

 {}
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between">
 <div className="flex-1 pr-4">
 <h3
 className={`text-sm font-semibold leading-tight mb-1 ${
 !notification.isRead
 ? "text-primary-navy"
 : "text-neutral-gray"
 }`}
 >
 {notification.title}
 </h3>
 <p className="text-sm text-neutral-gray mt-1 leading-relaxed break-words">
 {notification.message}
 </p>
 <p className="text-xs text-neutral-gray mt-2">
 {formatTimeAgo(notification.createdAt)}
 </p>
 </div>

 {}
 <div className="flex items-center space-x-2 ml-4">
 {!notification.isRead && (
 <button
 onClick={() => markAsRead(notification.id)}
 className="p-1 text-accent-pink hover:bg-accent-pink/10 rounded transition-colors duration-200"
 title="Mark as read"
 >
 <CheckIcon className="w-4 h-4" />
 </button>
 )}
 <button
 onClick={() =>
 deleteNotification(notification.id)
 }
 className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors duration-200"
 title="Delete notification"
 >
 <XMarkIcon className="w-4 h-4" />
 </button>
 </div>
 </div>

 {notification.metadata &&
 typeof notification.metadata === "object" &&
 notification.metadata !== null &&
 "actionUrl" in notification.metadata &&
 typeof (notification.metadata as any).actionUrl === "string" ? (
 <div className="mt-3">
 <a
 href={(notification.metadata as any).actionUrl}
 className="inline-flex items-center text-sm text-accent-pink hover:text-accent-pink/80 font-medium transition-colors duration-200"
 >
 View Details →
 </a>
 </div>
 ) : null}
 </div>

 {}
 {!notification.isRead && (
 <div className="w-2 h-2 bg-accent-pink rounded-full flex-shrink-0"></div>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </>
 )}
 </div>
 </div>
 </div>
 );
}