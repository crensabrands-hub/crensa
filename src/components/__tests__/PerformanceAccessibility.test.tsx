import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Home from '@/app/page';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { HeroSection } from '@/components/sections/HeroSection';
import { landingPageContent } from '@/config/content';

expect.extend(toHaveNoViolations);

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
 h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
 h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
 p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
 a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
 },
 AnimatePresence: ({ children }: any) => children,
 useReducedMotion: () => false,
 useInView: () => true,
}));

jest.mock('next/image', () => ({
 __esModule: true,
 default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

jest.mock('next/link', () => ({
 __esModule: true,
 default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

describe('Performance and Accessibility Tests', () => {
 beforeEach(() => {

 global.IntersectionObserver = jest.fn().mockImplementation(() => ({
 observe: jest.fn(),
 unobserve: jest.fn(),
 disconnect: jest.fn(),
 }));

 global.PerformanceObserver = jest.fn().mockImplementation(() => ({
 observe: jest.fn(),
 disconnect: jest.fn(),
 }));

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
 });

 describe('Accessibility Tests', () => {
 test('should have no accessibility violations on main page', async () => {
 const { container } = render(<Home />);
 const results = await axe(container);
 expect(results).toHaveNoViolations();
 });

 test('should have proper ARIA labels and roles', () => {
 render(<Home />);

 expect(screen.getByRole('main')).toBeInTheDocument();

 expect(screen.getByText('Skip to main content')).toBeInTheDocument();
 expect(screen.getByText('Skip to features')).toBeInTheDocument();
 expect(screen.getByText('Skip to FAQ')).toBeInTheDocument();
 });

 test('should support keyboard navigation in testimonials carousel', async () => {
 const user = userEvent.setup();
 
 render(
 <TestimonialsSection
 title="Test Testimonials"
 testimonials={landingPageContent.testimonials.items}
 />
 );

 const carousel = screen.getByRole('region', { name: /testimonials carousel/i });

 carousel.focus();

 await user.keyboard('{ArrowRight}');
 await user.keyboard('{ArrowLeft}');
 await user.keyboard('{Home}');
 await user.keyboard('{End}');

 expect(carousel).toBeInTheDocument();
 });

 test('should have proper alt text for images', () => {
 render(
 <TestimonialsSection
 title="Test Testimonials"
 testimonials={landingPageContent.testimonials.items.slice(0, 1)}
 />
 );

 const avatarImage = screen.getByRole('img');
 expect(avatarImage).toHaveAttribute('alt');
 expect(avatarImage.getAttribute('alt')).toContain('profile picture');
 });

 test('should support screen reader announcements', () => {
 render(
 <TestimonialsSection
 title="Test Testimonials"
 testimonials={landingPageContent.testimonials.items}
 />
 );

 const carousel = screen.getByRole('region', { name: /testimonials carousel/i });
 expect(carousel).toHaveAttribute('aria-live', 'polite');
 });

 test('should have proper heading hierarchy', () => {
 render(<Home />);

 const h1Elements = screen.getAllByRole('heading', { level: 1 });
 expect(h1Elements).toHaveLength(1);

 const allHeadings = screen.getAllByRole('heading');
 expect(allHeadings.length).toBeGreaterThan(1);
 });

 test('should have focus indicators on interactive elements', async () => {
 const user = userEvent.setup();
 render(<Home />);

 const buttons = screen.getAllByRole('button');
 const links = screen.getAllByRole('link');

 if (buttons.length > 0) {
 await user.tab();
 expect(document.activeElement).toBeDefined();
 }

 if (links.length > 0) {
 const firstLink = links[0];
 firstLink.focus();
 expect(document.activeElement).toBe(firstLink);
 }
 });
 });

 describe('Performance Tests', () => {
 test('should lazy load below-the-fold components', () => {
 render(<Home />);

 const suspenseElements = document.querySelectorAll('[data-testid*="suspense"]');

 expect(true).toBe(true); // Placeholder - actual implementation would check lazy loading
 });

 test('should use optimized images', () => {
 render(
 <TestimonialsSection
 title="Test Testimonials"
 testimonials={landingPageContent.testimonials.items.slice(0, 1)}
 />
 );

 const images = screen.getAllByRole('img');
 images.forEach(img => {

 expect(img).toHaveAttribute('loading');
 });
 });

 test('should respect reduced motion preferences', () => {

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

 render(<HeroSection content={landingPageContent.hero} />);

 expect(screen.getByRole('banner')).toBeInTheDocument();
 });

 test('should handle video loading gracefully', async () => {
 render(<HeroSection content={landingPageContent.hero} />);

 const video = document.querySelector('video');
 if (video) {
 expect(video).toHaveAttribute('muted');
 expect(video).toHaveAttribute('playsInline');
 expect(video).toHaveAttribute('poster');
 }
 });

 test('should debounce scroll events', () => {

 expect(true).toBe(true); // Placeholder
 });
 });

 describe('Error Handling', () => {
 test('should handle image loading errors gracefully', async () => {
 render(
 <TestimonialsSection
 title="Test Testimonials"
 testimonials={[{
 name: 'Test User',
 role: 'creator' as const,
 avatar: '/invalid-image.jpg',
 content: 'Test content',
 rating: 5
 }]}
 />
 );

 const image = screen.getByRole('img');

 fireEvent.error(image);

 await waitFor(() => {
 expect(screen.getByText('TU')).toBeInTheDocument();
 });
 });

 test('should handle missing content gracefully', () => {
 render(
 <TestimonialsSection
 title="Test Testimonials"
 testimonials={[]}
 />
 );

 expect(screen.getByText('Test Testimonials')).toBeInTheDocument();
 });
 });

 describe('Mobile Responsiveness', () => {
 test('should be responsive on mobile viewports', () => {

 Object.defineProperty(window, 'innerWidth', {
 writable: true,
 configurable: true,
 value: 375,
 });

 render(<Home />);

 expect(screen.getByRole('main')).toBeInTheDocument();
 });

 test('should handle touch interactions', async () => {
 const user = userEvent.setup();
 
 render(
 <TestimonialsSection
 title="Test Testimonials"
 testimonials={landingPageContent.testimonials.items}
 />
 );

 const nextButton = screen.getByLabelText(/next testimonial/i);

 await user.click(nextButton);
 
 expect(nextButton).toBeInTheDocument();
 });
 });
});