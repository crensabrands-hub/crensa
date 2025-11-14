'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useLayout } from '@/contexts/LayoutContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useResponsive } from '@/hooks/useResponsive';
import { useMemberNavigation } from '@/hooks/useMemberNavigation';
import { LayoutErrorBoundary } from './LayoutErrorBoundary';
import MemberHeader from './MemberHeader';
import MemberSidebar from './MemberSidebar';

interface MemberLayoutProps {
 children: ReactNode;
 showSidebar?: boolean;
}

export default function MemberLayout({ children, showSidebar = false }: MemberLayoutProps) {
 const { navigation, setSidebarOpen, setMobileMenuOpen, setSidebarVisible } = useLayout();
 const { userProfile } = useAuthContext();
 const { isMobile } = useResponsive();
 const { navigationContext, navigateToDashboard } = useMemberNavigation();

 useEffect(() => {
 setSidebarVisible(showSidebar);
 }, [showSidebar, setSidebarVisible]);

 useEffect(() => {
 if (showSidebar) {
 if (isMobile) {

 setSidebarOpen(false);
 setMobileMenuOpen(false);
 } else {

 setSidebarOpen(true);
 }
 }
 }, [isMobile, showSidebar, setSidebarOpen, setMobileMenuOpen]);

 const handleSidebarToggle = () => {
 if (isMobile) {
 setMobileMenuOpen(!navigation.mobileMenuOpen);
 } else {
 setSidebarOpen(!navigation.sidebarOpen);
 }
 };

 const handleMobileOverlayClick = () => {
 if (isMobile) {
 setMobileMenuOpen(false);
 }
 };

 return (
 <LayoutErrorBoundary>
 <div className="min-h-screen bg-neutral-gray">
 {}
 {showSidebar && isMobile && navigation.mobileMenuOpen && (
 <div
 className="fixed inset-0 z-40 bg-primary-navy/50 backdrop-blur-sm"
 onClick={handleMobileOverlayClick}
 aria-hidden="true"
 />
 )}

 {}
 {showSidebar && navigation.sidebarVisible && (
 <MemberSidebar
 isOpen={isMobile ? navigation.mobileMenuOpen : navigation.sidebarOpen}
 onClose={() => isMobile ? setMobileMenuOpen(false) : setSidebarOpen(false)}
 />
 )}

 {}
 <div
 className={`min-h-screen transition-all duration-300 ease-in-out ${
 showSidebar && navigation.sidebarVisible && !isMobile && navigation.sidebarOpen 
 ? 'ml-64' 
 : 'ml-0'
 }`}
 >
 {}
 <MemberHeader 
 onSidebarToggle={showSidebar ? handleSidebarToggle : undefined}
 sidebarOpen={isMobile ? navigation.mobileMenuOpen : navigation.sidebarOpen}
 />

 {}
 <main className="flex-1 p-4 sm:p-6 lg:p-8">
 <div className="max-w-7xl mx-auto">
 {children}
 </div>
 </main>
 </div>
 </div>
 </LayoutErrorBoundary>
 );
}