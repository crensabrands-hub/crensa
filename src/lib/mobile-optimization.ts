
export const isMobileDevice = (): boolean => {
 if (typeof window === 'undefined') return false;
 
 return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
 navigator.userAgent
 );
};

export const isTouchDevice = (): boolean => {
 if (typeof window === 'undefined') return false;
 
 return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const getViewportSize = () => {
 if (typeof window === 'undefined') return { width: 0, height: 0 };
 
 return {
 width: window.innerWidth,
 height: window.innerHeight,
 };
};

export const isMobileViewport = (): boolean => {
 const { width } = getViewportSize();
 return width < 768;
};

export const isTabletViewport = (): boolean => {
 const { width } = getViewportSize();
 return width >= 768 && width < 1024;
};

export const isDesktopViewport = (): boolean => {
 const { width } = getViewportSize();
 return width >= 1024;
};

export const optimizeTouchInteraction = (element: HTMLElement, options?: {
 minSize?: number;
 addPadding?: boolean;
 preventZoom?: boolean;
}) => {
 if (!isTouchDevice()) return;
 
 const { minSize = 44, addPadding = true, preventZoom = true } = options || {};

 element.style.touchAction = 'manipulation';
 (element.style as any).webkitTapHighlightColor = 'transparent';
 
 if (preventZoom) {

 element.style.touchAction = 'manipulation';
 }

 const rect = element.getBoundingClientRect();
 if (rect.width < minSize || rect.height < minSize) {
 element.style.minWidth = `${minSize}px`;
 element.style.minHeight = `${minSize}px`;
 
 if (addPadding) {

 const paddingX = Math.max(0, (minSize - rect.width) / 2);
 const paddingY = Math.max(0, (minSize - rect.height) / 2);
 element.style.paddingLeft = `${paddingX}px`;
 element.style.paddingRight = `${paddingX}px`;
 element.style.paddingTop = `${paddingY}px`;
 element.style.paddingBottom = `${paddingY}px`;
 }
 }

 element.style.transition = 'transform 0.1s ease, opacity 0.1s ease';
 
 const addTouchFeedback = () => {
 element.style.transform = 'scale(0.95)';
 element.style.opacity = '0.8';
 };
 
 const removeTouchFeedback = () => {
 element.style.transform = 'scale(1)';
 element.style.opacity = '1';
 };
 
 element.addEventListener('touchstart', addTouchFeedback, { passive: true });
 element.addEventListener('touchend', removeTouchFeedback, { passive: true });
 element.addEventListener('touchcancel', removeTouchFeedback, { passive: true });
};

export const optimizeVideoForMobile = (video: HTMLVideoElement) => {
 if (!isMobileDevice()) return;

 video.setAttribute('playsinline', 'true');
 video.setAttribute('webkit-playsinline', 'true');
 video.muted = true;

 if (isMobileViewport()) {
 video.style.maxWidth = '100%';
 video.style.height = 'auto';
 }
};

export const handleOrientationChange = (callback: () => void) => {
 if (typeof window === 'undefined') return;
 
 const handleChange = () => {

 setTimeout(callback, 100);
 };
 
 window.addEventListener('orientationchange', handleChange);
 window.addEventListener('resize', handleChange);
 
 return () => {
 window.removeEventListener('orientationchange', handleChange);
 window.removeEventListener('resize', handleChange);
 };
};

export const getOptimizedImageProps = (isMobile: boolean) => {
 return {
 quality: isMobile ? 75 : 85,
 priority: false,
 loading: 'lazy' as const,
 sizes: isMobile 
 ? '(max-width: 768px) 100vw, 50vw'
 : '(max-width: 1200px) 50vw, 33vw',
 };
};

export const debounce = <T extends (...args: any[]) => any>(
 func: T,
 wait: number
): ((...args: Parameters<T>) => void) => {
 let timeout: NodeJS.Timeout;
 
 return (...args: Parameters<T>) => {
 clearTimeout(timeout);
 timeout = setTimeout(() => func(...args), wait);
 };
};

export const throttle = <T extends (...args: any[]) => any>(
 func: T,
 limit: number
): ((...args: Parameters<T>) => void) => {
 let inThrottle: boolean;
 
 return (...args: Parameters<T>) => {
 if (!inThrottle) {
 func(...args);
 inThrottle = true;
 setTimeout(() => (inThrottle = false), limit);
 }
 };
};

export const prefersReducedMotion = (): boolean => {
 if (typeof window === 'undefined') return false;
 
 return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const getSafeAreaInsets = () => {
 if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 };
 
 const style = getComputedStyle(document.documentElement);
 
 return {
 top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
 bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
 left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
 right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
 };
};

export const optimizeFontLoading = () => {
 if (typeof document === 'undefined') return;

 const style = document.createElement('style');
 style.textContent = `
 @font-face {
 font-display: swap;
 }
 `;
 document.head.appendChild(style);
};

export const setViewportMeta = () => {
 if (typeof document === 'undefined') return;
 
 let viewport = document.querySelector('meta[name="viewport"]');
 
 if (!viewport) {
 viewport = document.createElement('meta');
 viewport.setAttribute('name', 'viewport');
 document.head.appendChild(viewport);
 }
 
 viewport.setAttribute(
 'content',
 'width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover'
 );
};

export const BREAKPOINTS = {
 smallMobile: 480,
 mobile: 768,
 tablet: 1024,
 desktop: 1280,
 largeDesktop: 1536,
} as const;

export const getBreakpointClasses = (breakpoint: keyof typeof BREAKPOINTS) => {
 const bp = BREAKPOINTS[breakpoint];
 return {
 hide: `max-${breakpoint}:hidden`,
 show: `${breakpoint}:block`,
 responsive: {
 padding: {
 sm: `${breakpoint}:p-2`,
 md: `${breakpoint}:p-4`,
 lg: `${breakpoint}:p-6`,
 },
 margin: {
 sm: `${breakpoint}:m-2`,
 md: `${breakpoint}:m-4`,
 lg: `${breakpoint}:m-6`,
 },
 text: {
 sm: `${breakpoint}:text-sm`,
 base: `${breakpoint}:text-base`,
 lg: `${breakpoint}:text-lg`,
 },
 },
 };
};

export const getSidebarWidth = (isCollapsed: boolean, isMobile: boolean, isTablet: boolean) => {
 if (isMobile) return 'w-full max-w-sm'; // Full width on mobile with max constraint
 if (isTablet) return isCollapsed ? 'w-16' : 'w-56'; // Slightly narrower on tablet
 return isCollapsed ? 'w-16' : 'w-64'; // Standard desktop width
};

export const getTouchOptimizedSpacing = (isTouchDevice: boolean) => {
 return {
 buttonPadding: isTouchDevice ? 'px-4 py-3' : 'px-3 py-2',
 listItemPadding: isTouchDevice ? 'px-4 py-4' : 'px-4 py-3',
 iconSize: isTouchDevice ? 'w-6 h-6' : 'w-5 h-5',
 minTouchTarget: isTouchDevice ? 'min-w-[44px] min-h-[44px]' : '',
 };
};

export const getOptimizedAnimationClasses = (prefersReducedMotion: boolean, isMobile: boolean) => {
 if (prefersReducedMotion) {
 return 'transition-none';
 }

 if (isMobile) {
 return 'transition-transform duration-200 ease-out';
 }
 
 return 'transition-all duration-300 ease-in-out';
};

export const isSlowConnection = (): boolean => {
 if (typeof navigator === "undefined" || !("connection" in navigator))
 return false;

 const connection = (navigator as any).connection;
 return (
 connection &&
 (connection.effectiveType === "slow-2g" ||
 connection.effectiveType === "2g" ||
 (connection.downlink && connection.downlink < 1.5))
 );
};

export const getMobileLoadingStrategy = () => {
 const isMobile = isMobileViewport();
 const isSlowConn = isSlowConnection();
 
 return {

 skeletonDuration: isMobile ? 300 : 600,

 transitionDuration: isMobile ? 200 : 300,

 enableComplexAnimations: !isSlowConn,

 lazyLoadThreshold: isMobile ? 0.05 : 0.1,

 preloadCount: isMobile ? 2 : 4,
 };
};

export const shouldRenderComponent = (
 componentName: string,
 priority: 'high' | 'medium' | 'low' = 'medium'
): boolean => {
 const isMobile = isMobileViewport();
 const isSlowConn = isSlowConnection();

 if (priority === 'high') return true;

 if (priority === 'low' && isMobile && isSlowConn) {
 console.log(`Skipping low priority component: ${componentName}`);
 return false;
 }
 
 return true;
};

export const getMobileOptimizedImageProps = (originalProps: any) => {
 const isMobile = isMobileViewport();
 const isSlowConn = isSlowConnection();
 
 if (!isMobile) return originalProps;
 
 return {
 ...originalProps,

 quality: isSlowConn ? 70 : 80,

 loading: 'lazy',

 sizes: '(max-width: 768px) 100vw, 50vw',

 priority: false,
 };
};

export const getMobileOptimizedMotionProps = (
 desktopProps: any,
 mobileProps?: any
) => {
 const isMobile = isMobileViewport();
 const prefersReduced = prefersReducedMotion();
 const isSlowConn = isSlowConnection();
 
 if (prefersReduced) {
 return { duration: 0, transition: { duration: 0 } };
 }
 
 if (isMobile || isSlowConn) {
 return mobileProps || {
 ...desktopProps,
 transition: {
 ...desktopProps.transition,
 duration: (desktopProps.transition?.duration || 0.3) * 0.7, // 30% faster
 ease: 'easeOut',
 },
 };
 }
 
 return desktopProps;
};

export const getBatteryOptimizations = async () => {
 if (typeof navigator === 'undefined' || !('getBattery' in navigator)) {
 return { lowBattery: false, charging: true };
 }
 
 try {
 const battery = await (navigator as any).getBattery();
 return {
 lowBattery: battery.level < 0.2,
 charging: battery.charging,
 level: battery.level,
 };
 } catch {
 return { lowBattery: false, charging: true };
 }
};

export const getAdaptiveLoadingConfig = async () => {
 const isMobile = isMobileViewport();
 const isSlowConn = isSlowConnection();
 const battery = await getBatteryOptimizations();
 
 return {

 enableHeavyAnimations: !battery.lowBattery && !isSlowConn,

 preloadImages: !isMobile && !isSlowConn,

 imageQuality: battery.lowBattery || isSlowConn ? 70 : 85,

 pollingInterval: battery.lowBattery ? 10000 : 5000,

 enableAggressiveCaching: isMobile || isSlowConn,
 };
};