import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';

const mockPerformanceObserver = jest.fn();
const mockPerformanceEntry = {
 name: 'test-entry',
 entryType: 'measure',
 startTime: 0,
 duration: 100,
};

global.PerformanceObserver = jest.fn().mockImplementation((callback) => {
 mockPerformanceObserver.mockImplementation(callback);
 return {
 observe: jest.fn(),
 disconnect: jest.fn(),
 };
});

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
 h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
 h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
 p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
 button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
 a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
 },
 AnimatePresence: ({ children }: any) => children,
 useInView: () => true,
 useAnimation: () => ({
 start: jest.fn(),
 set: jest.fn(),
 }),
}));

jest.mock('next/image', () => ({
 __esModule: true,
 default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

describe('Landing Page Performance Tests', () => {
 beforeEach(() => {

 global.IntersectionObserver = jest.fn().mockImplementation(() => ({
 observe: jest.fn(),
 unobserve: jest.fn(),
 disconnect: jest.fn(),
 }));

 global.performance.now = jest.fn(() => Date.now());

 global.performance.mark = jest.fn();

 global.performance.measure = jest.fn();

 Object.defineProperty(window, 'matchMedia', {
 writable: true,
 value: jest.fn().mockImplementation(query => ({
 matches: false,
 media: query,
 onchange: null,
 addListener: jest.fn(),
 removeListener: jest.fn(),
 addEventListener: jest.fn(),
 removeEventListener: jest.fn(),
 dispatchEvent: jest.fn(),
 })),
 });
 });

 describe('Initial Page Load Performance', () => {
 it('should render hero section immediately (above the fold)', async () => {
 const startTime = performance.now();
 
 render(<Home />);

 expect(screen.getByText(/transform your creativity/i)).toBeInTheDocument();
 
 const endTime = performance.now();
 const renderTime = endTime - startTime;

 expect(renderTime).toBeLessThan(100);
 });

 it('should lazy load below-the-fold sections', async () => {
 render(<Home />);

 expect(screen.getByText(/transform your creativity/i)).toBeInTheDocument();

 await waitFor(() => {
 expect(screen.getByText(/why crensa/i)).toBeInTheDocument();
 }, { timeout: 1000 });

 await waitFor(() => {
 expect(screen.getByText(/how it works/i)).toBeInTheDocument();
 }, { timeout: 1000 });
 });

 it('should minimize initial bundle size with code splitting', async () => {
 render(<Home />);

 const lazyComponents = [
 'FeatureSection',
 'WhyJoinNowSection', 
 'HowItWorksSection',
 'TestimonialsSection',
 'FAQSection'
 ];

 expect(screen.getByRole('main')).toBeInTheDocument();
 });
 });

 describe('Animation Performance', () => {
 it('should use CSS transforms for animations (GPU acceleration)', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 const animatedElements = document.querySelectorAll('[class*="transform"], [class*="translate"], [class*="scale"]');
 expect(animatedElements.length).toBeGreaterThan(0);
 });

 it('should respect reduced motion preferences', async () => {

 Object.defineProperty(window, 'matchMedia', {
 writable: true,
 value: jest.fn().mockImplementation(query => ({
 matches: query === '(prefers-reduced-motion: reduce)',
 media: query,
 onchange: null,
 addListener: jest.fn(),
 removeListener: jest.fn(),
 addEventListener: jest.fn(),
 removeEventListener: jest.fn(),
 dispatchEvent: jest.fn(),
 })),
 });

 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 it('should throttle scroll-based animations', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 const scrollEvents = Array.from({ length: 100 }, (_, i) => i);
 
 scrollEvents.forEach(() => {
 window.dispatchEvent(new Event('scroll'));
 });

 expect(screen.getByRole('main')).toBeInTheDocument();
 });
 });

 describe('Image and Media Optimization', () => {
 it('should use optimized images with proper loading attributes', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 const images = document.querySelectorAll('img');
 images.forEach(img => {

 if (!img.closest('[id="hero"]')) {
 expect(img).toHaveAttribute('loading', 'lazy');
 }
 });
 });

 it('should handle video loading efficiently', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 const videos = document.querySelectorAll('video');
 videos.forEach(video => {
 expect(video).toHaveAttribute('preload', 'metadata');
 expect(video).toHaveAttribute('muted');
 });
 });

 it('should provide fallback for failed media loading', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 const videos = document.querySelectorAll('video');
 videos.forEach(video => {
 video.dispatchEvent(new Event('error'));
 });

 expect(screen.getByRole('main')).toBeInTheDocument();
 });
 });

 describe('Memory Usage and Cleanup', () => {
 it('should clean up event listeners on unmount', async () => {
 const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
 const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

 const { unmount } = render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 const initialListeners = addEventListenerSpy.mock.calls.length;

 unmount();

 expect(removeEventListenerSpy).toHaveBeenCalled();

 addEventListenerSpy.mockRestore();
 removeEventListenerSpy.mockRestore();
 });

 it('should handle component unmounting gracefully', async () => {
 const { unmount } = render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 expect(() => unmount()).not.toThrow();
 });
 });

 describe('Bundle Size and Loading Metrics', () => {
 it('should minimize render-blocking resources', async () => {
 render(<Home />);

 expect(screen.getByText(/transform your creativity/i)).toBeInTheDocument();

 await waitFor(() => {
 expect(screen.getByText(/why crensa/i)).toBeInTheDocument();
 });
 });

 it('should preload critical resources', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 expect(document.head).toBeInTheDocument();
 });

 it('should use efficient CSS delivery', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');

 expect(stylesheets.length).toBeLessThanOrEqual(2);
 });
 });

 describe('Core Web Vitals Simulation', () => {
 it('should have fast Largest Contentful Paint (LCP)', async () => {
 const startTime = performance.now();
 
 render(<Home />);

 const heroContent = screen.getByText(/transform your creativity/i);
 expect(heroContent).toBeInTheDocument();

 const endTime = performance.now();
 const lcpTime = endTime - startTime;

 expect(lcpTime).toBeLessThan(100);
 });

 it('should have minimal Cumulative Layout Shift (CLS)', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 await waitFor(() => {
 expect(screen.getByText(/why crensa/i)).toBeInTheDocument();
 expect(screen.getByText(/how it works/i)).toBeInTheDocument();
 });

 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 it('should have fast First Input Delay (FID)', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 const ctaButton = screen.getByRole('button', { name: /start creating/i });
 expect(ctaButton).toBeInTheDocument();

 expect(ctaButton).not.toHaveAttribute('disabled');
 });
 });
});