'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { BellIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import type { Notification } from '@/lib/database/schema';

interface NotificationItemProps {
 notification: Notification;
 onMarkAsRead: (id: string) => void;
 onDelete: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
 const getNotificationIcon = (type: string) => {
 switch (type) {
 case 'earning':
 return '💰';
 case 'follower':
 return '👤';
 case 'video_view':
 return '🎥';
 case 'payment':
 return '💳';
 case 'comment':
 return '💬';
 case 'like':
 return '❤️';
 case 'system':
 return '🔔';
 default:
 return '📢';
 }
 };

 const formatTimeAgo = (date: string | Date) => {
 const now = new Date();
 const notificationDate = new Date(date);
 const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

 if (diffInSeconds < 60) return 'Just now';
 if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
 if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
 if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
 return notificationDate.toLocaleDateString();
 };

 const actionUrl = notification.metadata && 
 typeof notification.metadata === 'object' && 
 'actionUrl' in notification.metadata 
 ? notification.metadata.actionUrl as string 
 : undefined;

 return (
 <div className={`p-4 hover:bg-neutral-gray/5 transition-colors duration-200 ${
 !notification.isRead ? 'bg-accent-pink/5' : ''
 }`}>
 <div className="flex items-start space-x-3">
 {}
 <div className="flex-shrink-0">
 <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-sm">
 {getNotificationIcon(notification.type)}
 </div>
 </div>

 {}
 <div className="flex-1 min-w-0">
 <h4 className={`text-sm font-semibold leading-tight ${
 !notification.isRead ? 'text-primary-navy' : 'text-neutral-gray'
 }`}>
 {notification.title}
 </h4>
 <p className="text-sm text-neutral-gray mt-1 leading-relaxed break-words">
 {notification.message}
 </p>
 <p className="text-xs text-neutral-gray mt-2">
 {formatTimeAgo(notification.createdAt)}
 </p>
 
 {}
 {actionUrl && (
 <Link
 href={actionUrl}
 className="inline-flex items-center text-xs text-accent-pink hover:text-accent-pink/80 font-medium mt-2 transition-colors duration-200"
 >
 View Details →
 </Link>
 )}
 </div>

 {}
 <div className="flex items-center space-x-1">
 {!notification.isRead && (
 <button
 onClick={(e) => {
 e.stopPropagation();
 onMarkAsRead(notification.id);
 }}
 className="p-1 text-accent-pink hover:bg-accent-pink/10 rounded transition-colors duration-200"
 title="Mark as read"
 >
 <CheckIcon className="w-4 h-4" />
 </button>
 )}
 <button
 onClick={(e) => {
 e.stopPropagation();
 onDelete(notification.id);
 }}
 className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors duration-200"
 title="Delete notification"
 >
 <XMarkIcon className="w-4 h-4" />
 </button>
 </div>

 {}
 {!notification.isRead && (
 <div className="w-2 h-2 bg-accent-pink rounded-full flex-shrink-0"></div>
 )}
 </div>
 </div>
 );
}

export default function NotificationBell() {
 const {
 notifications,
 unreadCount,
 isLoading,
 markAsRead,
 markAllAsRead,
 deleteNotification,
 fetchNotifications,
 } = useNotifications();
 
 const [isOpen, setIsOpen] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);
 const buttonRef = useRef<HTMLButtonElement>(null);

 useEffect(() => {
 function handleClickOutside(event: MouseEvent) {
 if (
 dropdownRef.current &&
 !dropdownRef.current.contains(event.target as Node) &&
 buttonRef.current &&
 !buttonRef.current.contains(event.target as Node)
 ) {
 setIsOpen(false);
 }
 }

 document.addEventListener('mousedown', handleClickOutside);
 return () => {
 document.removeEventListener('mousedown', handleClickOutside);
 };
 }, []);

 useEffect(() => {
 if (isOpen) {
 fetchNotifications();
 }
 }, [isOpen, fetchNotifications]);

 const handleToggleDropdown = () => {
 setIsOpen(!isOpen);
 };

 const handleMarkAllAsRead = async () => {
 await markAllAsRead();
 };

 const recentNotifications = notifications.slice(0, 5);
 const hasNotifications = notifications.length > 0;

 return (
 <div className="relative">
 {}
 <button
 ref={buttonRef}
 onClick={handleToggleDropdown}
 className="relative p-2 text-neutral-gray hover:text-accent-pink transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-pink focus:ring-offset-2 rounded-lg"
 aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
 >
 {unreadCount > 0 ? (
 <BellSolidIcon className="w-6 h-6" />
 ) : (
 <BellIcon className="w-6 h-6" />
 )}
 
 {}
 {unreadCount > 0 && (
 <span className="absolute -top-1 -right-1 bg-accent-pink text-neutral-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
 {unreadCount > 99 ? '99+' : unreadCount}
 </span>
 )}
 </button>

 {}
 {isOpen && (
 <div
 ref={dropdownRef}
 className="absolute right-0 mt-2 w-96 bg-neutral-white rounded-lg shadow-xl border border-neutral-gray/20 z-50 max-h-96 overflow-hidden"
 >
 {}
 <div className="px-4 py-3 border-b border-neutral-gray/20 bg-neutral-gray/5">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-semibold text-primary-navy">
 Notifications
 {unreadCount > 0 && (
 <span className="ml-2 text-xs text-accent-pink">
 ({unreadCount} unread)
 </span>
 )}
 </h3>
 
 <div className="flex items-center space-x-2">
 {unreadCount > 0 && (
 <button
 onClick={handleMarkAllAsRead}
 className="text-xs text-accent-pink hover:text-accent-pink/80 font-medium transition-colors duration-200"
 >
 Mark all read
 </button>
 )}
 <Link
 href="/notifications"
 className="text-xs text-primary-navy hover:text-accent-pink font-medium transition-colors duration-200"
 onClick={() => setIsOpen(false)}
 >
 View all
 </Link>
 </div>
 </div>
 </div>

 {}
 <div className="max-h-80 overflow-y-auto">
 {isLoading ? (
 <div className="flex flex-col justify-center items-center py-8" role="status" aria-live="polite">
 <div className="w-6 h-6 animate-spin rounded-full border-2 border-accent-pink/20 border-t-accent-pink mb-2"></div>
 <p className="text-xs text-neutral-gray">Loading notifications...</p>
 </div>
 ) : !hasNotifications ? (
 <div className="text-center py-8">
 <BellIcon className="w-12 h-12 text-neutral-gray mx-auto mb-3" />
 <h4 className="text-sm font-semibold text-primary-navy mb-1">No notifications</h4>
 <p className="text-xs text-neutral-gray">
 You&apos;ll see notifications here when you have them.
 </p>
 </div>
 ) : (
 <div className="divide-y divide-neutral-gray/10">
 {recentNotifications.map((notification) => (
 <NotificationItem
 key={notification.id}
 notification={notification}
 onMarkAsRead={markAsRead}
 onDelete={deleteNotification}
 />
 ))}
 
 {notifications.length > 5 && (
 <div className="p-4 text-center border-t border-neutral-gray/20">
 <Link
 href="/notifications"
 className="text-sm text-accent-pink hover:text-accent-pink/80 font-medium transition-colors duration-200"
 onClick={() => setIsOpen(false)}
 >
 View all {notifications.length} notifications
 </Link>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 );
}