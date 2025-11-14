

export const trackWebVitals = () => {
 if (typeof window === "undefined") return;

 const observer = new PerformanceObserver((list) => {
 list.getEntries().forEach((entry) => {

 const value = (entry as any).value || entry.duration || 0;
 console.log(`${entry.name}: ${value}ms`);
 });
 });

 try {
 observer.observe({ entryTypes: ["measure", "navigation", "paint"] });
 } catch (e) {

 console.warn("Performance Observer not fully supported");
 }
};

export const createIntersectionObserver = (
 callback: (entries: IntersectionObserverEntry[]) => void,
 options: IntersectionObserverInit = {}
) => {
 const defaultOptions: IntersectionObserverInit = {
 root: null,
 rootMargin: "50px",
 threshold: 0.1,
 ...options,
 };

 return new IntersectionObserver(callback, defaultOptions);
};

export const optimizedImageProps = {
 loading: "lazy" as const,
 quality: 85,
 sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
};

export const preloadResource = (href: string, as: string, type?: string) => {
 if (typeof document === "undefined") return;

 const link = document.createElement("link");
 link.rel = "preload";
 link.href = href;
 link.as = as;
 if (type) link.type = type;

 document.head.appendChild(link);
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

export const supportsHover = (): boolean => {
 if (typeof window === "undefined") return true;
 return window.matchMedia("(hover: hover)").matches;
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

export const getMemoryUsage = () => {
 if (typeof performance === "undefined" || !("memory" in performance)) {
 return null;
 }

 const memory = (performance as any).memory;
 return {
 used: Math.round(memory.usedJSHeapSize / 1048576), // MB
 total: Math.round(memory.totalJSHeapSize / 1048576), // MB
 limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
 };
};

export const requestAnimationFrame = (callback: () => void) => {
 if (typeof window === "undefined") {
 callback();
 return;
 }

 window.requestAnimationFrame(callback);
};

export const prefetchPage = (href: string) => {
 if (typeof document === "undefined") return;

 if (isSlowConnection()) {
 console.log(`Skipping prefetch on slow connection: ${href}`);
 return;
 }

 const link = document.createElement("link");
 link.rel = "prefetch";
 link.href = href;
 document.head.appendChild(link);
};

export const smartPreload = async (resources: string[]) => {
 const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
 const isSlowConn = isSlowConnection();

 const maxPreloads = isMobile || isSlowConn ? 2 : resources.length;
 const resourcesToPreload = resources.slice(0, maxPreloads);
 
 for (const resource of resourcesToPreload) {
 if (resource.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
 preloadResource(resource, 'image');
 } else if (resource.match(/\.(js|mjs)$/i)) {
 preloadResource(resource, 'script');
 } else if (resource.match(/\.css$/i)) {
 preloadResource(resource, 'style');
 }

 await new Promise(resolve => setTimeout(resolve, 100));
 }
};

export const calculateOptimalLoadingDuration = () => {
 const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
 const isSlowConn = isSlowConnection();
 const memory = getMemoryUsage();
 
 let baseDuration = 2000; // 2 seconds default

 if (isMobile) {
 baseDuration *= 0.6; // 40% reduction
 }

 if (isSlowConn) {
 baseDuration *= 1.5; // 50% increase
 }

 if (memory && memory.total > 4000) { // > 4GB
 baseDuration *= 0.8; // 20% reduction
 }
 
 return Math.max(800, Math.min(baseDuration, 3000)); // Between 0.8s and 3s
};

export const requestOptimizedAnimationFrame = (callback: () => void) => {
 if (typeof window === "undefined") {
 callback();
 return;
 }

 const isSlowDevice = isSlowConnection() || (getMemoryUsage()?.total || 0) < 2000;
 
 if (isSlowDevice) {
 setTimeout(callback, 16); // ~60fps fallback
 } else {
 window.requestAnimationFrame(callback);
 }
};
