import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HeroSection } from '@/components/sections/HeroSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { FAQSection } from '@/components/sections/FAQSection';

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
 h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
 h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
 p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
 a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
 button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
 },
 AnimatePresence: ({ children }: any) => children,
 useReducedMotion: () => false,
 useInView: () => true,
}));

const mockUseResponsive = jest.fn();
jest.mock('@/hooks/useResponsive', () => ({
 useResponsive: () => mockUseResponsive(),
 useTouch: () => ({
 isTouchDevice: true,
 touchHandlers: {
 onTouchStart: jest.fn(),
 onTouchMove: jest.fn(),
 onTouchEnd: jest.fn(),
 },
 getSwipeDirection: () => ({ isLeftSwipe: false, isRightSwipe: false }),
 }),
}));

jest.mock('@/lib/mobile-optimization', () => ({
 optimizeVideoForMobile: jest.fn(),
}));

describe('Mobile Optimization Tests', () => {
 beforeEach(() => {

 mockUseResponsive.mockReturnValue({
 width: 375,
 height: 667,
 isMobile: true,
 isTablet: false,
 isDesktop: false,
 isTouchDevice: true,
 isMobileDevice: true,
 orientation: 'portrait',
 });
 });

 describe('HeroSection Mobile Optimization', () => {
 const mockHeroContent = {
 headline: 'Test Headline',
 subheadline: 'Test Subheadline',
 ctaText: 'Get Started',
 ctaLink: '/signup',
 backgroundVideo: '/videos/hero-background.mp4',
 };

 test('should apply mobile-specific text sizing', () => {
 render(<HeroSection content={mockHeroContent} />);
 
 const headline = screen.getByText('Test Headline');
 expect(headline).toHaveClass('text-2xl', 'sm:text-3xl');
 });

 test('should apply mobile-specific CTA button sizing', () => {
 render(<HeroSection content={mockHeroContent} />);
 
 const ctaButton = screen.getByText('Get Started');
 expect(ctaButton).toHaveClass('min-h-[44px]', 'min-w-[44px]');
 expect(ctaButton).toHaveStyle('touch-action: manipulation');
 });

 test('should disable video on mobile', () => {
 render(<HeroSection content={mockHeroContent} />);

 const videos = document.querySelectorAll('video');
 expect(videos).toHaveLength(0);
 });

 test('should show fallback image on mobile', () => {
 render(<HeroSection content={mockHeroContent} />);

 const fallbackDiv = document.querySelector('[style*="hero-fallback.svg"]');
 expect(fallbackDiv).toBeInTheDocument();
 expect(fallbackDiv).toHaveClass('opacity-100');
 });
 });

 describe('TestimonialsSection Mobile Optimization', () => {
 const mockTestimonials = [
 {
 name: 'John Doe',
 role: 'creator' as const,
 avatar: '/images/testimonials/john.svg',
 content: 'Great platform!',
 rating: 5,
 },
 {
 name: 'Jane Smith',
 role: 'viewer' as const,
 avatar: '/images/testimonials/jane.svg',
 content: 'Love the content!',
 rating: 4,
 },
 ];

 test('should apply mobile-specific button sizing', () => {
 render(<TestimonialsSection title="Testimonials" testimonials={mockTestimonials} />);
 
 const prevButton = screen.getByLabelText(/Previous testimonial/);
 const nextButton = screen.getByLabelText(/Next testimonial/);
 
 expect(prevButton).toHaveClass('w-12', 'h-12');
 expect(nextButton).toHaveClass('w-12', 'h-12');
 expect(prevButton).toHaveStyle('min-width: 44px; min-height: 44px');
 expect(nextButton).toHaveStyle('min-width: 44px; min-height: 44px');
 });

 test('should apply mobile-specific dot indicator sizing', () => {
 render(<TestimonialsSection title="Testimonials" testimonials={mockTestimonials} />);
 
 const dots = screen.getAllByRole('tab');
 dots.forEach(dot => {
 expect(dot).toHaveClass('w-4', 'h-4');
 expect(dot).toHaveStyle('min-width: 44px; min-height: 44px');
 });
 });

 test('should handle touch interactions', () => {
 render(<TestimonialsSection title="Testimonials" testimonials={mockTestimonials} />);
 
 const carousel = screen.getByRole('region', { name: /testimonials carousel/i });
 expect(carousel).toHaveStyle('touch-action: pan-y pinch-zoom');
 });
 });

 describe('FAQSection Mobile Optimization', () => {
 const mockFAQs = [
 {
 question: 'What is this platform?',
 answer: 'It is a great platform.',
 category: 'general' as const,
 },
 {
 question: 'How do I sign up?',
 answer: 'Click the sign up button.',
 category: 'general' as const,
 },
 ];

 test('should apply mobile-specific input styling', () => {
 render(<FAQSection title="FAQ" faqs={mockFAQs} />);
 
 const searchInput = screen.getByLabelText('Search FAQs');
 expect(searchInput).toHaveClass('px-3', 'py-3', 'text-base');
 expect(searchInput).toHaveStyle('font-size: 16px'); // Prevent iOS zoom
 });

 test('should apply mobile-specific button styling', () => {
 render(<FAQSection title="FAQ" faqs={mockFAQs} />);
 
 const categoryButtons = screen.getAllByRole('button', { pressed: false });
 categoryButtons.forEach(button => {
 if (button.textContent?.includes('Categories') || button.textContent?.includes('General')) {
 expect(button).toHaveClass('min-h-[44px]');
 expect(button).toHaveStyle('touch-action: manipulation');
 }
 });
 });

 test('should use single column layout on mobile', () => {
 render(<FAQSection title="FAQ" faqs={mockFAQs} />);
 
 const gridContainer = document.querySelector('.grid');
 expect(gridContainer).toHaveClass('grid-cols-1');
 expect(gridContainer).not.toHaveClass('lg:grid-cols-2');
 });

 test('should apply mobile-specific FAQ item styling', () => {
 render(<FAQSection title="FAQ" faqs={mockFAQs} />);
 
 const faqButtons = screen.getAllByRole('button', { expanded: false });
 const faqButton = faqButtons.find(button => 
 button.textContent?.includes('What is this platform?')
 );
 
 if (faqButton) {
 expect(faqButton).toHaveClass('px-4', 'py-4');
 expect(faqButton).toHaveStyle('touch-action: manipulation');
 }
 });
 });

 describe('Desktop vs Mobile Comparison', () => {
 test('should render differently on desktop', () => {

 mockUseResponsive.mockReturnValue({
 width: 1440,
 height: 900,
 isMobile: false,
 isTablet: false,
 isDesktop: true,
 isTouchDevice: false,
 isMobileDevice: false,
 orientation: 'landscape',
 });

 const mockHeroContent = {
 headline: 'Test Headline',
 subheadline: 'Test Subheadline',
 ctaText: 'Get Started',
 ctaLink: '/signup',
 backgroundVideo: '/videos/hero-background.mp4',
 };

 render(<HeroSection content={mockHeroContent} />);
 
 const headline = screen.getByText('Test Headline');
 expect(headline).toHaveClass('text-3xl', 'sm:text-4xl', 'md:text-5xl', 'lg:text-6xl', 'xl:text-7xl');
 expect(headline).not.toHaveClass('text-2xl');
 });

 test('should show video on desktop', () => {

 mockUseResponsive.mockReturnValue({
 width: 1440,
 height: 900,
 isMobile: false,
 isTablet: false,
 isDesktop: true,
 isTouchDevice: false,
 isMobileDevice: false,
 orientation: 'landscape',
 });

 const mockHeroContent = {
 headline: 'Test Headline',
 subheadline: 'Test Subheadline',
 ctaText: 'Get Started',
 ctaLink: '/signup',
 backgroundVideo: '/videos/hero-background.mp4',
 };

 render(<HeroSection content={mockHeroContent} />);

 const video = document.querySelector('video');
 expect(video).toBeInTheDocument();
 });
 });

 describe('Touch Target Accessibility', () => {
 test('should ensure all interactive elements meet minimum touch target size', () => {
 const mockTestimonials = [
 {
 name: 'John Doe',
 role: 'creator' as const,
 avatar: '/images/testimonials/john.svg',
 content: 'Great platform!',
 rating: 5,
 },
 ];

 render(<TestimonialsSection title="Testimonials" testimonials={mockTestimonials} />);

 const buttons = screen.getAllByRole('button');
 buttons.forEach(button => {
 const styles = window.getComputedStyle(button);
 const minWidth = styles.getPropertyValue('min-width');
 const minHeight = styles.getPropertyValue('min-height');

 expect(minWidth === '44px' || button.classList.contains('w-12') || button.classList.contains('w-4')).toBe(true);
 expect(minHeight === '44px' || button.classList.contains('h-12') || button.classList.contains('h-4')).toBe(true);
 });
 });
 });

 describe('Performance on Mobile', () => {
 test('should render quickly on mobile viewport', () => {
 const startTime = performance.now();
 
 const mockHeroContent = {
 headline: 'Test Headline',
 subheadline: 'Test Subheadline',
 ctaText: 'Get Started',
 ctaLink: '/signup',
 backgroundVideo: '/videos/hero-background.mp4',
 };

 render(<HeroSection content={mockHeroContent} />);
 
 const endTime = performance.now();

 expect(endTime - startTime).toBeLessThan(100);
 });

 test('should handle multiple mobile components efficiently', () => {
 const startTime = performance.now();
 
 const mockHeroContent = {
 headline: 'Test Headline',
 subheadline: 'Test Subheadline',
 ctaText: 'Get Started',
 ctaLink: '/signup',
 backgroundVideo: '/videos/hero-background.mp4',
 };

 const mockTestimonials = [
 {
 name: 'John Doe',
 role: 'creator' as const,
 avatar: '/images/testimonials/john.svg',
 content: 'Great platform!',
 rating: 5,
 },
 ];

 const mockFAQs = [
 {
 question: 'What is this platform?',
 answer: 'It is a great platform.',
 category: 'general' as const,
 },
 ];

 render(
 <div>
 <HeroSection content={mockHeroContent} />
 <TestimonialsSection title="Testimonials" testimonials={mockTestimonials} />
 <FAQSection title="FAQ" faqs={mockFAQs} />
 </div>
 );
 
 const endTime = performance.now();

 expect(endTime - startTime).toBeLessThan(200);
 });
 });
});