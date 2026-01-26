'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthContext } from '@/contexts/AuthContext';
import { UserIcon, CogIcon, BellIcon, ArrowRightOnRectangleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ProfileErrorBoundary } from './ProfileErrorBoundary';

interface ProfileDropdownProps {
    className?: string;
}

export default function ProfileDropdown({ className = '' }: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [navigationError, setNavigationError] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { userProfile, signOut, isLoading } = useAuthContext();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        setIsOpen(false);
        await signOut();
    };

    const handleNavigation = async (href: string, label: string) => {
        try {
            setNavigationError(null);
            setIsOpen(false);

            await router.push(href);
        } catch (error) {
            console.error(`Navigation error to ${href}:`, error);
            setNavigationError(`Failed to navigate to ${label}. Please try again.`);

            if (href === '/profile') {
                window.location.href = href;
            }
        }
    };

    if (isLoading || !userProfile) {
        return (
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-accent-pink/20 border-t-accent-pink" role="status" aria-label="Loading"></div>
        );
    }

    const menuItems = [
        {
            label: 'Profile',
            href: '/profile',
            icon: UserIcon,
            description: 'View and edit your profile'
        },
        {
            label: 'Settings',
            href: '/settings',
            icon: CogIcon,
            description: 'Account settings and preferences'
        },
        {
            label: 'Notifications',
            href: '/notifications',
            icon: BellIcon,
            description: 'View your notifications'
        },
    ];

    return (
        <ProfileErrorBoundary>
            <div className={`relative ${className}`} ref={dropdownRef}>
                {/* Trigger Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-neutral-gray/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-pink focus:ring-offset-2 group"
                    aria-label={`Open profile menu - ${userProfile.role}`}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    title={`${userProfile.username || 'User'} (${userProfile.role})`}
                >
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden aspect-square">
                            {userProfile.avatar ? (
                                <Image
                                    src={userProfile.avatar}
                                    alt={`${userProfile.username}'s avatar`}
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover rounded-full"
                                    unoptimized
                                />
                            ) : (
                                <span className="text-primary-navy font-semibold text-sm leading-none select-none">
                                    {userProfile.username ? userProfile.username.charAt(0).toUpperCase() : 'U'}
                                </span>
                            )}
                        </div>
                        {/* Status Indicator */}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-neutral-white ${userProfile.role === 'creator'
                                ? 'bg-accent-teal'
                                : userProfile.role === 'member'
                                    ? 'bg-accent-pink'
                                    : 'bg-primary-navy'
                            }`} title={`${userProfile.role} account`}></div>
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-primary-navy">
                            {userProfile.role === 'creator'
                                ? (userProfile as any).displayName || userProfile.username || 'Creator'
                                : userProfile.username || 'User'
                            }
                        </p>
                        <div className="flex items-center space-x-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${userProfile.role === 'creator'
                                    ? 'text-accent-teal bg-accent-teal/10'
                                    : userProfile.role === 'member'
                                        ? 'text-accent-pink bg-accent-pink/10'
                                        : 'text-primary-navy bg-primary-navy/10'
                                }`}>
                                {userProfile.role}
                            </span>
                        </div>
                    </div>
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-neutral-white rounded-lg shadow-lg border border-neutral-gray/20 py-2 z-50">
                        {/* Status Section */}
                        <div className="px-4 py-3 border-b border-neutral-gray/20">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-primary-navy">
                                    {userProfile.role === 'creator'
                                        ? (userProfile as any).displayName || userProfile.username || 'Creator'
                                        : userProfile.username || 'User'
                                    }
                                </p>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${userProfile.role === 'creator'
                                        ? 'text-accent-teal bg-accent-teal/10 border border-accent-teal/20'
                                        : userProfile.role === 'member'
                                            ? 'text-accent-pink bg-accent-pink/10 border border-accent-pink/20'
                                            : 'text-primary-navy bg-primary-navy/10 border border-primary-navy/20'
                                    }`}>
                                    {userProfile.role}
                                </span>
                            </div>
                            <p className="text-xs text-neutral-dark-gray">{userProfile.email}</p>
                        </div>

                        {/* Error Message */}
                        {navigationError && (
                            <div className="px-4 py-3 border-b border-neutral-gray/20">
                                <div className="flex items-start space-x-2 p-2 bg-red-50 border border-red-200 rounded">
                                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-red-800">{navigationError}</p>
                                        <button
                                            onClick={() => setNavigationError(null)}
                                            className="text-xs text-red-600 hover:text-red-800 underline mt-1"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Menu Items */}
                        <div className="py-2">
                            {menuItems.map((item) => (
                                <button
                                    key={item.href}
                                    onClick={() => handleNavigation(item.href, item.label)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-primary-navy hover:bg-neutral-gray/10 transition-colors duration-200 focus:outline-none focus:bg-neutral-gray/10"
                                    title={item.description}
                                >
                                    <item.icon className="w-4 h-4 mr-3" />
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Sign Out */}
                        <div className="border-t border-neutral-gray/20 pt-2">
                            <button
                                onClick={handleSignOut}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                            >
                                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </ProfileErrorBoundary>
    );
}