import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeatureSection } from '../FeatureSection';
import { HowItWorksSection } from '../HowItWorksSection';
import { TestimonialsSection } from '../TestimonialsSection';
import { FAQSection } from '../FAQSection';
import { WhyJoinNowSection } from '../WhyJoinNowSection';
import type { FeatureItem, Testimonial, FAQItem } from '@/types';

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, whileHover, whileTap, ...props }: any) => <div {...props}>{children}</div>,
 section: ({ children, whileHover, whileTap, ...props }: any) => <section {...props}>{children}</section>,
 h1: ({ children, whileHover, whileTap, ...props }: any) => <h1 {...props}>{children}</h1>,
 h2: ({ children, whileHover, whileTap, ...props }: any) => <h2 {...props}>{children}</h2>,
 h3: ({ children, whileHover, whileTap, ...props }: any) => <h3 {...props}>{children}</h3>,
 p: ({ children, whileHover, whileTap, ...props }: any) => <p {...props}>{children}</p>,
 button: ({ children, whileHover, whileTap, ...props }: any) => <button {...props}>{children}</button>,
 a: ({ children, whileHover, whileTap, ...props }: any) => <a {...props}>{children}</a>,
 },
 useReducedMotion: () => false,
 useInView: () => true,
 AnimatePresence: ({ children }: any) => children,
}));

const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
 observe: () => null,
 unobserve: () => null,
 disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

describe('Scroll Animations Integration', () => {
 const mockFeatures: FeatureItem[] = [
 {
 icon: '🎥',
 title: 'Upload Videos',
 description: 'Upload your short videos easily',
 },
 {
 icon: '💰',
 title: 'Earn Money',
 description: 'Monetize your content instantly',
 },
 ];

 const mockTestimonials: Testimonial[] = [
 {
 name: 'John Doe',
 role: 'creator',
 avatar: '/images/testimonials/john.svg',
 content: 'Great platform!',
 rating: 5,
 },
 ];

 const mockFAQs: FAQItem[] = [
 {
 question: 'How does it work?',
 answer: 'It works great!',
 category: 'general',
 },
 ];

 describe('FeatureSection animations', () => {
 it('should render with animation props', () => {
 render(
 <FeatureSection
 title="Test Features"
 subtitle="Test subtitle"
 features={mockFeatures}
 />
 );

 expect(screen.getByText('Test Features')).toBeInTheDocument();
 expect(screen.getByText('Test subtitle')).toBeInTheDocument();
 expect(screen.getByText('Upload Videos')).toBeInTheDocument();
 });

 it('should have proper ARIA labels', () => {
 render(
 <FeatureSection
 title="Test Features"
 features={mockFeatures}
 />
 );

 const section = screen.getByRole('region', { name: 'Test Features' });
 expect(section).toBeInTheDocument();
 });
 });

 describe('HowItWorksSection animations', () => {
 it('should render with animation structure', () => {
 render(
 <HowItWorksSection
 title="How It Works"
 steps={mockFeatures}
 />
 );

 expect(screen.getByText('How It Works')).toBeInTheDocument();
 expect(screen.getAllByText('Upload Videos')).toHaveLength(2); // Mobile and desktop versions
 expect(screen.getByText('Get Started Now')).toBeInTheDocument();
 });

 it('should have proper section labeling', () => {
 render(
 <HowItWorksSection
 title="How It Works"
 steps={mockFeatures}
 />
 );

 const section = screen.getByRole('region', { name: 'How It Works' });
 expect(section).toBeInTheDocument();
 });
 });

 describe('TestimonialsSection animations', () => {
 it('should render with carousel structure', () => {
 render(
 <TestimonialsSection
 title="Testimonials"
 testimonials={mockTestimonials}
 />
 );

 expect(screen.getByText('Testimonials')).toBeInTheDocument();
 expect(screen.getByText('John Doe')).toBeInTheDocument();
 });

 it('should have navigation controls for multiple testimonials', () => {
 const multipleTestimonials = [
 ...mockTestimonials,
 {
 name: 'Jane Smith',
 role: 'viewer' as const,
 avatar: '/images/testimonials/jane.svg',
 content: 'Amazing content!',
 rating: 5,
 },
 ];

 render(
 <TestimonialsSection
 title="Testimonials"
 testimonials={multipleTestimonials}
 />
 );

 expect(screen.getByLabelText('Previous testimonial')).toBeInTheDocument();
 expect(screen.getByLabelText('Next testimonial')).toBeInTheDocument();
 });
 });

 describe('FAQSection animations', () => {
 it('should render with search and filter functionality', () => {
 render(
 <FAQSection
 title="FAQ"
 faqs={mockFAQs}
 />
 );

 expect(screen.getByText('FAQ')).toBeInTheDocument();
 expect(screen.getByPlaceholderText('Search frequently asked questions...')).toBeInTheDocument();
 expect(screen.getByText('All Categories')).toBeInTheDocument();
 });

 it('should have expandable FAQ items', () => {
 render(
 <FAQSection
 title="FAQ"
 faqs={mockFAQs}
 />
 );

 const faqButton = screen.getByRole('button', { name: /How does it work?/i });
 expect(faqButton).toBeInTheDocument();
 expect(faqButton).toHaveAttribute('aria-expanded', 'false');
 });
 });

 describe('WhyJoinNowSection animations', () => {
 it('should render with urgency elements', () => {
 const benefits = ['Benefit 1', 'Benefit 2'];
 
 render(
 <WhyJoinNowSection
 title="Why Join Now"
 benefits={benefits}
 ctaText="Join Now"
 ctaLink="/signup"
 />
 );

 expect(screen.getByText('Why Join Now')).toBeInTheDocument();
 expect(screen.getByText('Limited Time Offer')).toBeInTheDocument();
 expect(screen.getByText('Early Adopters')).toBeInTheDocument();
 expect(screen.getByText('Benefit 1')).toBeInTheDocument();
 });

 it('should have proper CTA structure', () => {
 const benefits = ['Benefit 1'];
 
 render(
 <WhyJoinNowSection
 title="Why Join Now"
 benefits={benefits}
 ctaText="Join Now"
 ctaLink="/signup"
 />
 );

 const ctaLink = screen.getByRole('link', { name: /Join Now - Join as early adopter/i });
 expect(ctaLink).toBeInTheDocument();
 expect(ctaLink).toHaveAttribute('href', '/signup');
 });
 });

 describe('Animation performance', () => {
 it('should not cause layout shifts during animation setup', () => {
 const { container } = render(
 <FeatureSection
 title="Performance Test"
 features={mockFeatures}
 />
 );

 expect(screen.getByText('Performance Test')).toBeVisible();
 expect(container.firstChild).toHaveClass('section-padding');
 });

 it('should handle reduced motion preferences', () => {

 render(
 <HowItWorksSection
 title="Reduced Motion Test"
 steps={mockFeatures}
 />
 );

 expect(screen.getByText('Reduced Motion Test')).toBeInTheDocument();
 expect(screen.getAllByText('Upload Videos')).toHaveLength(2); // Mobile and desktop versions
 });
 });
});