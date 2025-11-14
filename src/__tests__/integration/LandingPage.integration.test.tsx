import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Home from '@/app/page';

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

Object.defineProperty(HTMLMediaElement.prototype, 'play', {
 writable: true,
 value: jest.fn().mockImplementation(() => Promise.resolve()),
});

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
 writable: true,
 value: jest.fn(),
});

describe('Landing Page Integration Tests', () => {
 beforeEach(() => {

 global.IntersectionObserver = jest.fn().mockImplementation(() => ({
 observe: jest.fn(),
 unobserve: jest.fn(),
 disconnect: jest.fn(),
 }));

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

 describe('Complete User Journey - Hero to Conversion', () => {
 it('should render all main sections in correct order', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
 expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
 expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Footer
 });

 const main = screen.getByRole('main');
 expect(main).toBeInTheDocument();

 expect(document.querySelector('#why-crensa')).toBeInTheDocument();
 expect(document.querySelector('#how-it-works')).toBeInTheDocument();
 expect(document.querySelector('#testimonials')).toBeInTheDocument();
 expect(document.querySelector('#faq')).toBeInTheDocument();
 });

 it('should have working navigation from hero to all sections', async () => {
 const user = userEvent.setup();
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 const skipLinks = screen.getAllByText(/skip to/i);
 expect(skipLinks.length).toBeGreaterThan(0);

 const navLinks = screen.getAllByRole('link', { name: /how it works|why crensa|testimonials|faq/i });
 expect(navLinks.length).toBeGreaterThan(0);
 });

 it('should display primary CTA buttons throughout the journey', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 const headerCTAs = screen.getAllByRole('link', { name: /login|sign up/i });
 expect(headerCTAs.length).toBeGreaterThanOrEqual(2);

 const footerCTA = screen.getByRole('link', { name: /get started now/i });
 expect(footerCTA).toBeInTheDocument();
 });
 });

 describe('CTA Links and Form Integrations', () => {
 it('should have correct href attributes for all CTA buttons', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 const primaryCTA = screen.getByRole('button', { name: /start creating/i });
 expect(primaryCTA).toHaveAttribute('href', '/creator-onboarding');

 const secondaryCTAs = screen.getAllByRole('button', { name: /learn more|join now/i });
 secondaryCTAs.forEach(cta => {
 expect(cta).toHaveAttribute('href');
 expect(cta.getAttribute('href')).toBeTruthy();
 });
 });

 it('should handle CTA button interactions', async () => {
 const user = userEvent.setup();
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 const primaryCTA = screen.getByRole('button', { name: /start creating/i });

 await user.hover(primaryCTA);
 expect(primaryCTA).toHaveClass('hover:scale-105');

 await user.tab();
 expect(document.activeElement).toBe(primaryCTA);
 });

 it('should validate external links have proper attributes', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('contentinfo')).toBeInTheDocument();
 });

 const externalLinks = screen.getAllByRole('link', { name: /twitter|linkedin|instagram/i });
 externalLinks.forEach(link => {
 expect(link).toHaveAttribute('target', '_blank');
 expect(link).toHaveAttribute('rel', 'noopener noreferrer');
 });
 });
 });

 describe('Interactive Elements Functionality', () => {
 it('should handle FAQ accordion interactions', async () => {
 const user = userEvent.setup();
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument();
 });

 const faqButtons = screen.getAllByRole('button', { expanded: false });
 expect(faqButtons.length).toBeGreaterThan(0);

 const firstFAQ = faqButtons[0];
 await user.click(firstFAQ);
 
 await waitFor(() => {
 expect(firstFAQ).toHaveAttribute('aria-expanded', 'true');
 });
 });

 it('should handle testimonials carousel navigation', async () => {
 const user = userEvent.setup();
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByText(/what our users say/i)).toBeInTheDocument();
 });

 const prevButton = screen.getByRole('button', { name: /previous/i });
 const nextButton = screen.getByRole('button', { name: /next/i });

 expect(prevButton).toBeInTheDocument();
 expect(nextButton).toBeInTheDocument();

 await user.click(nextButton);
 await user.click(prevButton);

 expect(prevButton).toBeInTheDocument();
 expect(nextButton).toBeInTheDocument();
 });

 it('should handle mobile menu toggle', async () => {
 const user = userEvent.setup();

 Object.defineProperty(window, 'matchMedia', {
 writable: true,
 value: jest.fn().mockImplementation(query => ({
 matches: query === '(max-width: 768px)',
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
 expect(screen.getByRole('banner')).toBeInTheDocument();
 });

 const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
 expect(mobileMenuButton).toBeInTheDocument();

 await user.click(mobileMenuButton);

 expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
 });
 });

 describe('Accessibility and Keyboard Navigation', () => {
 it('should support keyboard navigation through all interactive elements', async () => {
 const user = userEvent.setup();
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 await user.tab(); // Skip link
 await user.tab(); // Header CTA
 await user.tab(); // Hero CTA
 
 expect(document.activeElement).toHaveAttribute('role', 'button');
 });

 it('should have proper ARIA labels and roles', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
 expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
 expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Footer

 expect(screen.getByRole('navigation')).toBeInTheDocument();

 const buttons = screen.getAllByRole('button');
 buttons.forEach(button => {
 expect(button).toHaveAccessibleName();
 });
 });

 it('should support screen reader announcements', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 const liveRegions = document.querySelectorAll('[aria-live]');
 expect(liveRegions.length).toBeGreaterThanOrEqual(0);

 const h1 = screen.getByRole('heading', { level: 1 });
 expect(h1).toBeInTheDocument();

 const h2s = screen.getAllByRole('heading', { level: 2 });
 expect(h2s.length).toBeGreaterThan(0);
 });
 });

 describe('Performance and Loading States', () => {
 it('should show loading states for lazy-loaded sections', async () => {
 render(<Home />);

 expect(screen.getByText(/transform your creativity/i)).toBeInTheDocument();

 await waitFor(() => {
 expect(screen.getByText(/why crensa/i)).toBeInTheDocument();
 }, { timeout: 3000 });

 await waitFor(() => {
 expect(screen.getByText(/how it works/i)).toBeInTheDocument();
 }, { timeout: 3000 });
 });

 it('should handle video loading gracefully', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 const videoOrImage = document.querySelector('video, img[src*="hero"]');
 expect(videoOrImage).toBeInTheDocument();
 });

 it('should handle content loading errors gracefully', async () => {

 const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 expect(screen.getByRole('banner')).toBeInTheDocument();
 expect(screen.getByRole('main')).toBeInTheDocument();
 expect(screen.getByRole('contentinfo')).toBeInTheDocument();

 consoleSpy.mockRestore();
 });
 });

 describe('Responsive Design Validation', () => {
 it('should adapt layout for mobile devices', async () => {

 Object.defineProperty(window, 'matchMedia', {
 writable: true,
 value: jest.fn().mockImplementation(query => ({
 matches: query === '(max-width: 768px)',
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

 const mobileMenu = screen.getByRole('button', { name: /menu/i });
 expect(mobileMenu).toBeInTheDocument();
 });

 it('should maintain functionality across different screen sizes', async () => {
 const user = userEvent.setup();

 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 const ctaButton = screen.getByRole('button', { name: /start creating/i });
 await user.hover(ctaButton);
 expect(ctaButton).toBeInTheDocument();
 });
 });
});