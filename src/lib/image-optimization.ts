

import { useState, useEffect, useCallback } from 'react';

export const getOptimizedImageProps = (
 src: string,
 alt: string,
 priority: boolean = false
) => ({
 src,
 alt,
 loading: priority ? 'eager' : 'lazy',
 priority,
 quality: 85,
 sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
 placeholder: 'blur' as const,
 blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
});

export const useProgressiveImage = (src: string, placeholder?: string) => {
 const [imgSrc, setImgSrc] = useState(placeholder || '');
 const [isLoading, setIsLoading] = useState(true);
 const [hasError, setHasError] = useState(false);

 useEffect(() => {
 const img = new Image();
 
 img.onload = () => {
 setImgSrc(src);
 setIsLoading(false);
 };
 
 img.onerror = () => {
 setHasError(true);
 setIsLoading(false);
 };
 
 img.src = src;
 
 return () => {
 img.onload = null;
 img.onerror = null;
 };
 }, [src]);

 return { imgSrc, isLoading, hasError };
};

export const useLazyLoading = (threshold: number = 0.1) => {
 const [isIntersecting, setIsIntersecting] = useState(false);
 const [element, setElement] = useState<Element | null>(null);

 const ref = useCallback((node: Element | null) => {
 if (node) setElement(node);
 }, []);

 useEffect(() => {
 if (!element) return;

 const observer = new IntersectionObserver(
 ([entry]) => {
 if (entry.isIntersecting) {
 setIsIntersecting(true);
 observer.disconnect();
 }
 },
 { threshold, rootMargin: '50px' }
 );

 observer.observe(element);

 return () => observer.disconnect();
 }, [element, threshold]);

 return { ref, isIntersecting };
};

export const preloadImage = (src: string): Promise<void> => {
 return new Promise((resolve, reject) => {
 const img = new Image();
 img.onload = () => resolve();
 img.onerror = reject;
 img.src = src;
 });
};

export const preloadImages = async (sources: string[]): Promise<void> => {
 const promises = sources.map(preloadImage);
 await Promise.allSettled(promises);
};

export const generateResponsiveSizes = (
 breakpoints: { [key: string]: number } = {
 sm: 640,
 md: 768,
 lg: 1024,
 xl: 1280,
 }
) => {
 const sizes = Object.entries(breakpoints)
 .sort(([, a], [, b]) => a - b)
 .map(([name, width]) => `(max-width: ${width}px) 100vw`)
 .join(', ');
 
 return `${sizes}, 100vw`;
};

export const supportsWebP = (): Promise<boolean> => {
 return new Promise((resolve) => {
 const webP = new Image();
 webP.onload = webP.onerror = () => {
 resolve(webP.height === 2);
 };
 webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
 });
};

export const supportsAVIF = (): Promise<boolean> => {
 return new Promise((resolve) => {
 const avif = new Image();
 avif.onload = avif.onerror = () => {
 resolve(avif.height === 2);
 };
 avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
 });
};

export const getOptimalImageFormat = async (originalSrc: string): Promise<string> => {
 const [webpSupported, avifSupported] = await Promise.all([
 supportsWebP(),
 supportsAVIF(),
 ]);

 if (!webpSupported && !avifSupported) {
 return originalSrc;
 }

 if (avifSupported) {
 return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.avif');
 }

 if (webpSupported) {
 return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
 }

 return originalSrc;
};

export const trackImageLoadTime = (src: string) => {
 const startTime = performance.now();
 
 return new Promise<number>((resolve) => {
 const img = new Image();
 img.onload = () => {
 const loadTime = performance.now() - startTime;
 console.log(`Image loaded in ${loadTime.toFixed(2)}ms: ${src}`);
 resolve(loadTime);
 };
 img.onerror = () => {
 const loadTime = performance.now() - startTime;
 console.warn(`Image failed to load after ${loadTime.toFixed(2)}ms: ${src}`);
 resolve(loadTime);
 };
 img.src = src;
 });
};

export const createResponsiveImageProps = (
 src: string,
 alt: string,
 options: {
 priority?: boolean;
 quality?: number;
 sizes?: string;
 placeholder?: 'blur' | 'empty';
 blurDataURL?: string;
 } = {}
) => {
 const {
 priority = false,
 quality = 85,
 sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
 placeholder = 'blur',
 blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
 } = options;

 return {
 src,
 alt,
 loading: priority ? ('eager' as const) : ('lazy' as const),
 priority,
 quality,
 sizes,
 placeholder,
 blurDataURL: placeholder === 'blur' ? blurDataURL : undefined,
 };
};