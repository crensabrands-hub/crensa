import React from 'react';
import { render, screen } from '@testing-library/react';
import { FAQSection } from '../FAQSection';
import { FAQItem } from '@/types';

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
 },
 useReducedMotion: () => false,
 useInView: () => true,
 AnimatePresence: ({ children }: any) => <>{children}</>,
}));

Object.defineProperty(window, 'matchMedia', {
 writable: true,
 value: jest.fn().mockImplementation(query => ({
 matches: false,
 media: query,
 onchange: null,
 addListener: jest.fn(), // deprecated
 removeListener: jest.fn(), // deprecated
 addEventListener: jest.fn(),
 removeEventListener: jest.fn(),
 dispatchEvent: jest.fn(),
 })),
});

const mockFaqs: FAQItem[] = [
 {
 question: 'Creator Question 1',
 answer: 'Creator Answer 1',
 category: 'creator'
 },
 {
 question: 'Creator Question 2',
 answer: 'Creator Answer 2',
 category: 'creator'
 },
 {
 question: 'General Question 1',
 answer: 'General Answer 1',
 category: 'general'
 },
 {
 question: 'General Question 2',
 answer: 'General Answer 2',
 category: 'general'
 },
 {
 question: 'Viewer Question 1',
 answer: 'Viewer Answer 1',
 category: 'viewer'
 },
 {
 question: 'Payment Question 1',
 answer: 'Payment Answer 1',
 category: 'payment'
 }
];

describe('FAQSection Responsive Behavior', () => {
 const defaultProps = {
 title: 'Frequently Asked Questions',
 faqs: mockFaqs
 };

 beforeEach(() => {
 jest.clearAllMocks();
 });

 describe('Layout Structure', () => {
 it('renders with proper container structure', () => {
 render(<FAQSection {...defaultProps} />);
 
 const section = screen.getByRole('region', { name: 'Frequently Asked Questions' });
 expect(section).toHaveClass('section-padding', 'bg-neutral-gray');

 const container = section.querySelector('.container');
 expect(container).toBeInTheDocument();
 });

 it('renders search and filter controls in proper container', () => {
 render(<FAQSection {...defaultProps} />);
 
 const searchInput = screen.getByLabelText('Search FAQs');
 const searchContainer = searchInput.closest('.max-w-2xl');
 expect(searchContainer).toHaveClass('mx-auto', 'space-y-6');
 });

 it('renders FAQ content in responsive grid', () => {
 render(<FAQSection {...defaultProps} />);
 
 const faqContainer = screen.getByText('Creator Question 1').closest('.grid');
 expect(faqContainer).toHaveClass('grid-cols-1', 'lg:grid-cols-2', 'gap-8');
 });

 it('renders category filter buttons with responsive flex layout', () => {
 render(<FAQSection {...defaultProps} />);
 
 const filterContainer = screen.getByRole('button', { name: 'All Categories' }).closest('.flex');
 expect(filterContainer).toHaveClass('flex-wrap', 'justify-center', 'gap-2');
 });
 });

 describe('Category Organization', () => {
 it('groups FAQs by category with proper spacing', () => {
 render(<FAQSection {...defaultProps} />);

 const categoryHeaders = screen.getAllByText(/For Creators|General|For Viewers|Payments/);
 categoryHeaders.forEach(header => {
 const categorySection = header.closest('.space-y-4');
 expect(categorySection).toBeInTheDocument();
 });
 });

 it('renders category headers with proper styling', () => {
 render(<FAQSection {...defaultProps} />);
 
 const creatorHeader = screen.getByText('For Creators');
 const headerContainer = creatorHeader.closest('.inline-flex');
 expect(headerContainer).toHaveClass(
 'items-center',
 'px-4',
 'py-2',
 'rounded-full',
 'bg-gradient-to-r',
 'border'
 );
 });

 it('applies different colors to different categories', () => {
 render(<FAQSection {...defaultProps} />);
 
 const creatorHeader = screen.getByText('For Creators').closest('.inline-flex');
 const generalHeader = screen.getByText('General').closest('.inline-flex');
 const viewerHeader = screen.getByText('For Viewers').closest('.inline-flex');
 const paymentHeader = screen.getByText('Payments').closest('.inline-flex');

 expect(creatorHeader?.className).toContain('from-accent-pink/10');
 expect(generalHeader?.className).toContain('from-accent-teal/10');
 expect(viewerHeader?.className).toContain('from-primary-neon-yellow/10');
 expect(paymentHeader?.className).toContain('from-accent-green/10');
 });
 });

 describe('FAQ Item Layout', () => {
 it('renders FAQ items with proper card styling', () => {
 render(<FAQSection {...defaultProps} />);
 
 const faqButton = screen.getByRole('button', { name: /Creator Question 1/i });
 const faqCard = faqButton.closest('.bg-neutral-white');
 
 expect(faqCard).toHaveClass(
 'bg-neutral-white',
 'rounded-lg',
 'shadow-sm',
 'border',
 'border-neutral-dark-gray/10',
 'overflow-hidden'
 );
 });

 it('renders FAQ buttons with proper responsive padding', () => {
 render(<FAQSection {...defaultProps} />);
 
 const faqButton = screen.getByRole('button', { name: /Creator Question 1/i });
 expect(faqButton).toHaveClass(
 'w-full',
 'px-6',
 'py-4',
 'text-left',
 'flex',
 'items-center',
 'justify-between'
 );
 });

 it('renders FAQ questions with responsive typography', () => {
 render(<FAQSection {...defaultProps} />);
 
 const questionElement = screen.getByText('Creator Question 1');
 expect(questionElement).toHaveClass(
 'text-lg',
 'font-semibold',
 'text-primary-navy',
 'pr-4'
 );
 });
 });

 describe('Search Input Responsive Design', () => {
 it('renders search input with proper responsive styling', () => {
 render(<FAQSection {...defaultProps} />);
 
 const searchInput = screen.getByLabelText('Search FAQs');
 expect(searchInput).toHaveClass(
 'w-full',
 'px-4',
 'py-3',
 'pl-12',
 'rounded-lg',
 'border'
 );
 });

 it('positions search icon properly', () => {
 render(<FAQSection {...defaultProps} />);
 
 const searchInput = screen.getByLabelText('Search FAQs');
 const searchContainer = searchInput.closest('.relative');
 const searchIcon = searchContainer?.querySelector('.absolute');
 
 expect(searchIcon).toHaveClass(
 'absolute',
 'left-4',
 'top-1/2',
 'transform',
 '-translate-y-1/2'
 );
 });
 });

 describe('Filter Buttons Responsive Design', () => {
 it('renders filter buttons with responsive text and padding', () => {
 render(<FAQSection {...defaultProps} />);
 
 const allCategoriesButton = screen.getByRole('button', { name: 'All Categories' });
 expect(allCategoriesButton).toHaveClass(
 'px-4',
 'py-2',
 'rounded-full',
 'text-sm',
 'font-medium'
 );
 });

 it('applies proper active and hover states', () => {
 render(<FAQSection {...defaultProps} />);
 
 const allCategoriesButton = screen.getByRole('button', { name: 'All Categories' });
 expect(allCategoriesButton).toHaveClass(
 'bg-accent-pink',
 'text-neutral-white'
 );
 
 const creatorButton = screen.getByRole('button', { name: 'For Creators' });
 expect(creatorButton).toHaveClass(
 'bg-neutral-white',
 'text-neutral-dark-gray',
 'hover:bg-accent-pink/10'
 );
 });
 });

 describe('Content Width Constraints', () => {
 it('constrains search controls to proper max width', () => {
 render(<FAQSection {...defaultProps} />);
 
 const searchInput = screen.getByLabelText('Search FAQs');
 const controlsContainer = searchInput.closest('.max-w-2xl');
 expect(controlsContainer).toHaveClass('max-w-2xl', 'mx-auto');
 });

 it('constrains FAQ content to proper max width', () => {
 render(<FAQSection {...defaultProps} />);
 
 const faqContent = screen.getByText('Creator Question 1').closest('.max-w-4xl');
 expect(faqContent).toHaveClass('max-w-4xl', 'mx-auto');
 });

 it('uses proper container constraints for section', () => {
 render(<FAQSection {...defaultProps} />);
 
 const section = screen.getByRole('region', { name: 'Frequently Asked Questions' });
 const container = section.querySelector('.container');
 expect(container).toHaveClass('container');
 });
 });

 describe('Spacing and Layout', () => {
 it('applies proper section padding', () => {
 render(<FAQSection {...defaultProps} />);
 
 const section = screen.getByRole('region', { name: 'Frequently Asked Questions' });
 expect(section).toHaveClass('section-padding');
 });

 it('applies proper spacing between elements', () => {
 render(<FAQSection {...defaultProps} />);
 
 const headerContainer = screen.getByText('Frequently Asked Questions').closest('.mb-12');
 expect(headerContainer).toHaveClass('mb-12', 'lg:mb-16');
 
 const controlsContainer = screen.getByLabelText('Search FAQs').closest('.space-y-6');
 expect(controlsContainer).toHaveClass('space-y-6');
 });

 it('applies proper spacing within FAQ categories', () => {
 render(<FAQSection {...defaultProps} />);
 
 const categorySection = screen.getByText('For Creators').closest('.space-y-4');
 expect(categorySection).toHaveClass('space-y-4');
 
 const faqItemsContainer = categorySection?.querySelector('.space-y-3');
 expect(faqItemsContainer).toHaveClass('space-y-3');
 });
 });

 describe('Background and Visual Design', () => {
 it('applies proper background color to section', () => {
 render(<FAQSection {...defaultProps} />);
 
 const section = screen.getByRole('region', { name: 'Frequently Asked Questions' });
 expect(section).toHaveClass('bg-neutral-gray');
 });

 it('applies proper background to FAQ items', () => {
 render(<FAQSection {...defaultProps} />);
 
 const faqButton = screen.getByRole('button', { name: /Creator Question 1/i });
 const faqCard = faqButton.closest('.bg-neutral-white');
 expect(faqCard).toHaveClass('bg-neutral-white');
 });

 it('applies proper hover states', () => {
 render(<FAQSection {...defaultProps} />);
 
 const faqButton = screen.getByRole('button', { name: /Creator Question 1/i });
 expect(faqButton).toHaveClass(
 'hover:bg-neutral-gray/50',
 'focus:bg-neutral-gray/50'
 );
 });
 });
});