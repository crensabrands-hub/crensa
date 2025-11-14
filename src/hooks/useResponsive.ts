import { useState, useEffect } from 'react';
import { debounce, getViewportSize, isMobileDevice, isTouchDevice } from '@/lib/mobile-optimization';

interface ViewportInfo {
 width: number;
 height: number;
 isMobile: boolean;
 isTablet: boolean;
 isDesktop: boolean;
 isTouchDevice: boolean;
 isMobileDevice: boolean;
 orientation: 'portrait' | 'landscape';

 isSmallMobile: boolean;
 isLargeMobile: boolean;
 isSmallTablet: boolean;
 isLargeTablet: boolean;
 isSmallDesktop: boolean;
 isLargeDesktop: boolean;
}

export const useResponsive = () => {
 const [viewportInfo, setViewportInfo] = useState<ViewportInfo>(() => {
 if (typeof window === 'undefined') {
 return {
 width: 0,
 height: 0,
 isMobile: false,
 isTablet: false,
 isDesktop: true,
 isTouchDevice: false,
 isMobileDevice: false,
 orientation: 'landscape' as const,
 isSmallMobile: false,
 isLargeMobile: false,
 isSmallTablet: false,
 isLargeTablet: false,
 isSmallDesktop: false,
 isLargeDesktop: false,
 };
 }

 const { width, height } = getViewportSize();
 return {
 width,
 height,
 isMobile: width < 768,
 isTablet: width >= 768 && width < 1024,
 isDesktop: width >= 1024,
 isTouchDevice: isTouchDevice(),
 isMobileDevice: isMobileDevice(),
 orientation: width > height ? 'landscape' : 'portrait',

 isSmallMobile: width < 480,
 isLargeMobile: width >= 480 && width < 768,
 isSmallTablet: width >= 768 && width < 900,
 isLargeTablet: width >= 900 && width < 1024,
 isSmallDesktop: width >= 1024 && width < 1280,
 isLargeDesktop: width >= 1280,
 };
 });

 useEffect(() => {
 const updateViewportInfo = debounce(() => {
 const { width, height } = getViewportSize();
 setViewportInfo({
 width,
 height,
 isMobile: width < 768,
 isTablet: width >= 768 && width < 1024,
 isDesktop: width >= 1024,
 isTouchDevice: isTouchDevice(),
 isMobileDevice: isMobileDevice(),
 orientation: width > height ? 'landscape' : 'portrait',

 isSmallMobile: width < 480,
 isLargeMobile: width >= 480 && width < 768,
 isSmallTablet: width >= 768 && width < 900,
 isLargeTablet: width >= 900 && width < 1024,
 isSmallDesktop: width >= 1024 && width < 1280,
 isLargeDesktop: width >= 1280,
 });
 }, 150);

 window.addEventListener('resize', updateViewportInfo);
 window.addEventListener('orientationchange', updateViewportInfo);

 return () => {
 window.removeEventListener('resize', updateViewportInfo);
 window.removeEventListener('orientationchange', updateViewportInfo);
 };
 }, []);

 return viewportInfo;
};

export const useBreakpoint = () => {
 const { isMobile, isTablet, isDesktop } = useResponsive();

 return {
 isMobile,
 isTablet,
 isDesktop,

 showOnMobile: (content: React.ReactNode) => isMobile ? content : null,
 showOnTablet: (content: React.ReactNode) => isTablet ? content : null,
 showOnDesktop: (content: React.ReactNode) => isDesktop ? content : null,
 hideOnMobile: (content: React.ReactNode) => !isMobile ? content : null,
 hideOnTablet: (content: React.ReactNode) => !isTablet ? content : null,
 hideOnDesktop: (content: React.ReactNode) => !isDesktop ? content : null,
 };
};

export const useTouch = () => {
 const { isTouchDevice } = useResponsive();
 const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
 const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null);
 const [isDragging, setIsDragging] = useState(false);

 const handleTouchStart = (e: React.TouchEvent) => {
 setTouchEnd(null);
 setIsDragging(false);
 setTouchStart({
 x: e.targetTouches[0].clientX,
 y: e.targetTouches[0].clientY,
 time: Date.now(),
 });
 };

 const handleTouchMove = (e: React.TouchEvent) => {
 if (!touchStart) return;
 
 const currentTouch = {
 x: e.targetTouches[0].clientX,
 y: e.targetTouches[0].clientY,
 time: Date.now(),
 };
 
 setTouchEnd(currentTouch);

 const distanceX = Math.abs(currentTouch.x - touchStart.x);
 const distanceY = Math.abs(currentTouch.y - touchStart.y);
 if (distanceX > 10 || distanceY > 10) {
 setIsDragging(true);
 }
 };

 const handleTouchEnd = () => {
 if (!touchStart || !touchEnd) return null;

 const distanceX = touchStart.x - touchEnd.x;
 const distanceY = touchStart.y - touchEnd.y;
 const timeElapsed = touchEnd.time - touchStart.time;

 const velocityX = Math.abs(distanceX) / timeElapsed;
 const velocityY = Math.abs(distanceY) / timeElapsed;

 const minSwipeDistance = 50;
 const minSwipeVelocity = 0.3;
 
 const isLeftSwipe = distanceX > minSwipeDistance && velocityX > minSwipeVelocity;
 const isRightSwipe = distanceX < -minSwipeDistance && velocityX > minSwipeVelocity;
 const isUpSwipe = distanceY > minSwipeDistance && velocityY > minSwipeVelocity;
 const isDownSwipe = distanceY < -minSwipeDistance && velocityY > minSwipeVelocity;

 const isTap = timeElapsed < 200 && Math.abs(distanceX) < 10 && Math.abs(distanceY) < 10;

 const isLongPress = timeElapsed > 500 && Math.abs(distanceX) < 10 && Math.abs(distanceY) < 10;

 setIsDragging(false);

 return {
 isLeftSwipe,
 isRightSwipe,
 isUpSwipe,
 isDownSwipe,
 isTap,
 isLongPress,
 isDragging,
 distanceX,
 distanceY,
 velocityX,
 velocityY,
 timeElapsed,
 };
 };

 return {
 isTouchDevice,
 isDragging,
 touchHandlers: {
 onTouchStart: handleTouchStart,
 onTouchMove: handleTouchMove,
 onTouchEnd: handleTouchEnd,
 },
 getSwipeDirection: handleTouchEnd,
 };
};

export const useSidebarTouch = (onClose: () => void, isOpen: boolean) => {
 const { isTouchDevice, isMobile } = useResponsive();
 const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);

 const handleTouchStart = (e: React.TouchEvent) => {
 if (!isMobile || !isTouchDevice) return;
 
 setTouchStart({
 x: e.touches[0].clientX,
 y: e.touches[0].clientY,
 time: Date.now(),
 });
 };

 const handleTouchMove = (e: React.TouchEvent) => {
 if (!touchStart || !isMobile || !isTouchDevice) return;
 
 const currentX = e.touches[0].clientX;
 const deltaX = currentX - touchStart.x;
 const deltaY = Math.abs(e.touches[0].clientY - touchStart.y);

 if (deltaY > 50) return;

 if (isOpen && deltaX < -100) {
 onClose();
 }
 };

 const handleTouchEnd = () => {
 setTouchStart(null);
 };

 return {
 sidebarTouchHandlers: isTouchDevice && isMobile ? {
 onTouchStart: handleTouchStart,
 onTouchMove: handleTouchMove,
 onTouchEnd: handleTouchEnd,
 } : {},
 };
};