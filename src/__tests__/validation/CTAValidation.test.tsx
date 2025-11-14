import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Home from '@/app/page';
import { getLandingPageContent } from '@/lib/content-config';

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

describe('CTA Links and Form Integration Validation', () => {
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

 describe('Primary CTA Validation', () => {
 it('should have correct primary CTA link in hero section', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 const primaryCTA = screen.getByRole('button', { name: /start creating/i });
 expect(primaryCTA).toBeInTheDocument();
 expect(primaryCTA).toHaveAttribute('href', '/creator-onboarding');
 expect(primaryCTA).toHaveClass('bg-primary-neonYellow');
 });

 it('should have proper accessibility attributes for primary CTA', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 const primaryCTA = screen.getByRole('button', { name: /start creating/i });
 expect(primaryCTA).toHaveAccessibleName();
 expect(primaryCTA).not.toHaveAttribute('aria-disabled', 'true');
 expect(primaryCTA).toHaveAttribute('role', 'button');
 });

 it('should handle primary CTA interactions correctly', async () => {
 const user = userEvent.setup();
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 const primaryCTA = screen.getByRole('button', { name: /start creating/i });

 await user.hover(primaryCTA);
 expect(primaryCTA).toHaveClass('hover:scale-105');

 primaryCTA.focus();
 expect(primaryCTA).toHaveFocus();
 expect(primaryCTA).toHaveClass('focus:ring-2');
 });
 });

 describe('Secondary CTA Validation', () => {
 it('should have secondary CTAs in appropriate sections', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 await waitFor(() => {
 expect(screen.getByText(/why join now/i)).toBeInTheDocument();
 });

 const secondaryCTAs = screen.getAllByRole('button', { name: /join now|learn more|get started/i });
 expect(secondaryCTAs.length).toBeGreaterThan(0);

 secondaryCTAs.forEach(cta => {
 expect(cta).toHaveAttribute('href');
 expect(cta.getAttribute('href')).toBeTruthy();
 });
 });

 it('should have correct styling for secondary CTAs', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByText(/why join now/i)).toBeInTheDocument();
 });

 const secondaryCTAs = screen.getAllByRole('button', { name: /join now|learn more/i });
 secondaryCTAs.forEach(cta => {

 expect(cta).not.toHaveClass('bg-primary-neonYellow');
 expect(cta).toHaveClass('border-2');
 });
 });
 });

 describe('Header Navigation CTAs', () => {
 it('should have login and signup CTAs in header', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('banner')).toBeInTheDocument();
 });

 const loginCTA = screen.getByRole('button', { name: /log in/i });
 const signupCTA = screen.getByRole('button', { name: /sign up/i });

 expect(loginCTA).toBeInTheDocument();
 expect(signupCTA).toBeInTheDocument();

 expect(loginCTA).toHaveAttribute('href', '/login');
 expect(signupCTA).toHaveAttribute('href', '/signup');
 });

 it('should have proper header CTA styling', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('banner')).toBeInTheDocument();
 });

 const loginCTA = screen.getByRole('button', { name: /log in/i });
 const signupCTA = screen.getByRole('button', { name: /sign up/i });

 expect(loginCTA).toHaveClass('text-primary-navy');

 expect(signupCTA).toHaveClass('bg-primary-navy');
 expect(signupCTA).toHaveClass('text-white');
 });
 });

 describe('Footer CTAs and Links', () => {
 it('should have final conversion CTA in footer', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('contentinfo')).toBeInTheDocument();
 });

 const footerCTA = screen.getByRole('button', { name: /start your journey/i });
 expect(footerCTA).toBeInTheDocument();
 expect(footerCTA).toHaveAttribute('href', '/creator-onboarding');
 });

 it('should have social media links with proper attributes', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('contentinfo')).toBeInTheDocument();
 });

 const socialLinks = screen.getAllByRole('link', { name: /twitter|linkedin|instagram|facebook/i });
 expect(socialLinks.length).toBeGreaterThan(0);

 socialLinks.forEach(link => {
 expect(link).toHaveAttribute('target', '_blank');
 expect(link).toHaveAttribute('rel', 'noopener noreferrer');
 expect(link).toHaveAttribute('href');
 expect(link.getAttribute('href')).toMatch(/^https?:\/\//);
 });
 });

 it('should have contact and support links', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('contentinfo')).toBeInTheDocument();
 });

 const contactLink = screen.getByRole('link', { name: /contact/i });
 const supportLink = screen.getByRole('link', { name: /support/i });

 expect(contactLink).toBeInTheDocument();
 expect(supportLink).toBeInTheDocument();

 expect(contactLink).toHaveAttribute('href', '/contact');
 expect(supportLink).toHaveAttribute('href', '/support');
 });
 });

 describe('Content Configuration Validation', () => {
 it('should load CTA links from content configuration', () => {
 const content = getLandingPageContent();

 expect(content.hero.ctaLink).toBe('/creator-onboarding');
 expect(content.hero.ctaText).toBeTruthy();

 expect(content.whyJoinNow.ctaLink).toBeTruthy();
 expect(content.whyJoinNow.ctaText).toBeTruthy();

 expect(content.footer.socialLinks).toBeDefined();
 expect(Array.isArray(content.footer.socialLinks)).toBe(true);
 expect(content.footer.socialLinks.length).toBeGreaterThan(0);
 });

 it('should have valid URLs in content configuration', () => {
 const content = getLandingPageContent();

 expect(content.hero.ctaLink).toMatch(/^\/|^https?:\/\//);

 content.footer.socialLinks.forEach((link: any) => {
 expect(link.url).toMatch(/^https?:\/\//);
 expect(link.name).toBeTruthy();
 });

 if (content.footer.links) {
 content.footer.links.forEach((link: any) => {
 expect(link.url).toMatch(/^\/|^https?:\/\//);
 expect(link.text).toBeTruthy();
 });
 }
 });
 });

 describe('CTA Analytics and Tracking', () => {
 it('should have tracking attributes on CTAs', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 const primaryCTA = screen.getByRole('button', { name: /start creating/i });

 expect(primaryCTA).toHaveAttribute('data-analytics-event', 'cta_click');
 expect(primaryCTA).toHaveAttribute('data-analytics-location', 'hero');
 });

 it('should have unique tracking for different CTA locations', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 await waitFor(() => {
 expect(screen.getByText(/why join now/i)).toBeInTheDocument();
 });

 const heroCTA = screen.getByRole('button', { name: /start creating/i });
 const footerCTA = screen.getByRole('button', { name: /start your journey/i });

 expect(heroCTA).toHaveAttribute('data-analytics-location', 'hero');
 expect(footerCTA).toHaveAttribute('data-analytics-location', 'footer');
 });
 });

 describe('CTA Performance and Loading', () => {
 it('should have CTAs available immediately on page load', async () => {
 const startTime = performance.now();
 
 render(<Home />);

 expect(screen.getByRole('button', { name: /start creating/i })).toBeInTheDocument();
 
 const endTime = performance.now();
 expect(endTime - startTime).toBeLessThan(100);
 });

 it('should handle CTA loading states gracefully', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 const allCTAs = screen.getAllByRole('button');
 allCTAs.forEach(cta => {
 expect(cta).not.toHaveAttribute('disabled');
 expect(cta).not.toHaveAttribute('aria-disabled', 'true');
 });
 });
 });

 describe('Mobile CTA Optimization', () => {
 it('should have touch-friendly CTA sizes on mobile', async () => {

 Object.defineProperty(window, 'matchMedia', {
 writable: true,
 value: jest.fn().mockImplementation(query => ({
 matches: query.includes('max-width: 768px'),
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

 const primaryCTA = screen.getByRole('button', { name: /start creating/i });

 expect(primaryCTA).toHaveClass('py-4'); // Adequate touch target
 expect(primaryCTA).toHaveClass('px-8'); // Adequate touch target
 });

 it('should maintain CTA visibility on mobile', async () => {

 Object.defineProperty(window, 'matchMedia', {
 writable: true,
 value: jest.fn().mockImplementation(query => ({
 matches: query.includes('max-width: 768px'),
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

 const primaryCTA = screen.getByRole('button', { name: /start creating/i });
 expect(primaryCTA).toBeVisible();
 expect(primaryCTA).toHaveClass('w-full'); // Full width on mobile
 });
 });

 describe('Error Handling for CTAs', () => {
 it('should handle missing CTA configuration gracefully', async () => {

 jest.doMock('@/lib/content-config', () => ({
 getLandingPageContent: () => ({
 hero: {
 headline: 'Test',
 subheadline: 'Test',
 ctaText: '',
 ctaLink: ''
 },

 })
 }));

 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 expect(screen.getByText(/transform your creativity/i)).toBeInTheDocument();
 });

 it('should handle invalid CTA links gracefully', async () => {
 render(<Home />);

 await waitFor(() => {
 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 const allCTAs = screen.getAllByRole('button');
 allCTAs.forEach(cta => {
 const href = cta.getAttribute('href');
 if (href) {
 expect(href).toBeTruthy();
 expect(href).not.toBe('#');
 }
 });
 });
 });
});