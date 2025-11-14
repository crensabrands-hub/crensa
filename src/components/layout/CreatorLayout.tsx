'use client';

import React, { ReactNode } from 'react';
import { useLayout } from '@/contexts/LayoutContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useResponsive } from '@/hooks/useResponsive';

import { LayoutErrorBoundary } from './LayoutErrorBoundary';
import CreatorSidebar from './CreatorSidebar';
import CreatorHeader from './CreatorHeader';

interface CreatorLayoutProps {
 children: ReactNode;
}

export default function CreatorLayout({ children }: CreatorLayoutProps) {
 const { navigation, preferences, setSidebarOpen, setMobileMenuOpen, updateLayoutPreferences } = useLayout();
 const { isMobile } = useResponsive();

 const handleSidebarToggle = () => {
 if (isMobile) {
 setMobileMenuOpen(!navigation.mobileMenuOpen);
 } else {
 setSidebarOpen(!navigation.sidebarOpen);
 }
 };

 const handleSidebarCollapse = () => {
 updateLayoutPreferences({ 
 sidebarCollapsed: !preferences.sidebarCollapsed 
 });
 };

 const handleMobileOverlayClick = () => {
 if (isMobile && navigation.mobileMenuOpen) {
 setMobileMenuOpen(false);
 }
 };

 return (
 <LayoutErrorBoundary>
 <div className="min-h-screen bg-neutral-gray">
 {}
 {isMobile && navigation.mobileMenuOpen && (
 <div
 className="fixed inset-0 z-40 bg-primary-navy/50 backdrop-blur-sm md:hidden"
 onClick={handleMobileOverlayClick}
 aria-hidden="true"
 />
 )}

 {}
 <CreatorSidebar
 isOpen={isMobile ? navigation.mobileMenuOpen : navigation.sidebarOpen}
 onClose={() => isMobile ? setMobileMenuOpen(false) : setSidebarOpen(false)}
 isCollapsed={!isMobile && preferences.sidebarCollapsed}
 onToggleCollapse={!isMobile ? handleSidebarCollapse : undefined}
 />

 {}
 <div
 className={`transition-all duration-300 ease-in-out ${
 !isMobile && navigation.sidebarOpen
 ? preferences.sidebarCollapsed 
 ? 'ml-16' 
 : 'ml-64'
 : 'ml-0'
 }`}
 >
 {}
 <CreatorHeader
 onSidebarToggle={handleSidebarToggle}
 sidebarOpen={isMobile ? navigation.mobileMenuOpen : navigation.sidebarOpen}
 />

 {}
 <main className="p-4 md:p-6 lg:p-8">
 <div className="max-w-7xl mx-auto">
 {children}
 </div>
 </main>
 </div>
 </div>
 </LayoutErrorBoundary>
 );
}