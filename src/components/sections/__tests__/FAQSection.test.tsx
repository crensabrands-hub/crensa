import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const mockFaqs: FAQItem[] = [
 {
 question: 'How do I get started as a creator?',
 answer: 'Simply sign up for a creator account, verify your identity, and start uploading your short videos.',
 category: 'creator'
 },
 {
 question: 'How does the credit system work?',
 answer: 'Viewers purchase credits that they can spend to watch premium content.',
 category: 'general'
 },
 {
 question: 'How do I purchase credits as a viewer?',
 answer: 'You can purchase credit packages through our secure payment system.',
 category: 'viewer'
 },
 {
 question: 'What payment methods are accepted?',
 answer: 'We accept all major credit cards, PayPal, and bank transfers.',
 category: 'payment'
 }
];

describe('FAQSection', () => {
 const defaultProps = {
 title: 'Frequently Asked Questions',
 faqs: mockFaqs
 };

 beforeEach(() => {
 jest.clearAllMocks();
 });

 describe('Rendering', () => {
 it('renders the FAQ section with title', () => {
 render(<FAQSection {...defaultProps} />);
 
 expect(screen.getByRole('region', { name: 'Frequently Asked Questions' })).toBeInTheDocument();
 expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
 });

 it('renders search input', () => {
 render(<FAQSection {...defaultProps} />);
 
 expect(screen.getByLabelText('Search FAQs')).toBeInTheDocument();
 expect(screen.getByPlaceholderText('Search frequently asked questions...')).toBeInTheDocument();
 });

 it('renders category filter buttons', () => {
 render(<FAQSection {...defaultProps} />);
 
 expect(screen.getByRole('button', { name: 'All Categories' })).toBeInTheDocument();
 expect(screen.getByRole('button', { name: 'For Creators' })).toBeInTheDocument();
 expect(screen.getByRole('button', { name: 'General' })).toBeInTheDocument();
 expect(screen.getByRole('button', { name: 'For Viewers' })).toBeInTheDocument();
 expect(screen.getByRole('button', { name: 'Payments' })).toBeInTheDocument();
 });

 it('renders all FAQ questions', () => {
 render(<FAQSection {...defaultProps} />);
 
 mockFaqs.forEach(faq => {
 expect(screen.getByText(faq.question)).toBeInTheDocument();
 });
 });

 it('applies custom className', () => {
 render(<FAQSection {...defaultProps} className="custom-class" />);
 
 const section = screen.getByRole('region', { name: 'Frequently Asked Questions' });
 expect(section).toHaveClass('custom-class');
 });
 });

 describe('Accordion Functionality', () => {
 it('expands FAQ item when clicked', async () => {
 const user = userEvent.setup();
 render(<FAQSection {...defaultProps} />);
 
 const faqButton = screen.getByRole('button', { name: /How do I get started as a creator?/i });

 expect(faqButton).toHaveAttribute('aria-expanded', 'false');

 await user.click(faqButton);
 
 expect(faqButton).toHaveAttribute('aria-expanded', 'true');
 expect(screen.getByText('Simply sign up for a creator account, verify your identity, and start uploading your short videos.')).toBeInTheDocument();
 });

 it('collapses FAQ item when clicked again', async () => {
 const user = userEvent.setup();
 render(<FAQSection {...defaultProps} />);
 
 const faqButton = screen.getByRole('button', { name: /How do I get started as a creator?/i });

 await user.click(faqButton);
 expect(faqButton).toHaveAttribute('aria-expanded', 'true');

 await user.click(faqButton);
 expect(faqButton).toHaveAttribute('aria-expanded', 'false');
 });

 it('allows multiple FAQ items to be expanded simultaneously', async () => {
 const user = userEvent.setup();
 render(<FAQSection {...defaultProps} />);
 
 const faq1Button = screen.getByRole('button', { name: /How do I get started as a creator?/i });
 const faq2Button = screen.getByRole('button', { name: /How does the credit system work?/i });

 await user.click(faq1Button);
 await user.click(faq2Button);
 
 expect(faq1Button).toHaveAttribute('aria-expanded', 'true');
 expect(faq2Button).toHaveAttribute('aria-expanded', 'true');
 });

 it('has proper ARIA controls relationship', async () => {
 const user = userEvent.setup();
 render(<FAQSection {...defaultProps} />);
 
 const faqButton = screen.getByRole('button', { name: /How do I get started as a creator?/i });
 await user.click(faqButton);
 
 const controlsId = faqButton.getAttribute('aria-controls');
 expect(controlsId).toBeTruthy();
 expect(document.getElementById(controlsId!)).toBeInTheDocument();
 });
 });

 describe('Search Functionality', () => {
 it('filters FAQs based on search term in question', async () => {
 const user = userEvent.setup();
 render(<FAQSection {...defaultProps} />);
 
 const searchInput = screen.getByLabelText('Search FAQs');
 await user.type(searchInput, 'creator');
 
 expect(screen.getByText('How do I get started as a creator?')).toBeInTheDocument();
 expect(screen.queryByText('How does the credit system work?')).not.toBeInTheDocument();
 });

 it('filters FAQs based on search term in answer', async () => {
 const user = userEvent.setup();
 render(<FAQSection {...defaultProps} />);
 
 const searchInput = screen.getByLabelText('Search FAQs');
 await user.type(searchInput, 'PayPal');
 
 expect(screen.getByText('What payment methods are accepted?')).toBeInTheDocument();
 expect(screen.queryByText('How do I get started as a creator?')).not.toBeInTheDocument();
 });

 it('shows no results message when search yields no matches', async () => {
 const user = userEvent.setup();
 render(<FAQSection {...defaultProps} />);
 
 const searchInput = screen.getByLabelText('Search FAQs');
 await user.type(searchInput, 'nonexistent');
 
 expect(screen.getByText('No FAQs found matching your search criteria.')).toBeInTheDocument();
 });

 it('is case insensitive', async () => {
 const user = userEvent.setup();
 render(<FAQSection {...defaultProps} />);
 
 const searchInput = screen.getByLabelText('Search FAQs');
 await user.type(searchInput, 'CREATOR');
 
 expect(screen.getByText('How do I get started as a creator?')).toBeInTheDocument();
 });

 it('clears search results when input is cleared', async () => {
 const user = userEvent.setup();
 render(<FAQSection {...defaultProps} />);
 
 const searchInput = screen.getByLabelText('Search FAQs');

 await user.type(searchInput, 'creator');
 expect(screen.queryByText('How does the credit system work?')).not.toBeInTheDocument();

 await user.clear(searchInput);
 expect(screen.getByText('How does the credit system work?')).toBeInTheDocument();
 });
 });

 describe('Category Filtering', () => {
 it('filters FAQs by category', async () => {
 const user = userEvent.setup();
 render(<FAQSection {...defaultProps} />);
 
 const creatorButton = screen.getByRole('button', { name: 'For Creators' });
 await user.click(creatorButton);
 
 expect(screen.getByText('How do I get started as a creator?')).toBeInTheDocument();
 expect(screen.queryByText('How does the credit system work?')).not.toBeInTheDocument();
 });

 it('shows all FAQs when "All Categories" is selected', async () => {
 const user = userEvent.setup();
 render(<FAQSection {...defaultProps} />);

 const creatorButton = screen.getByRole('button', { name: 'For Creators' });
 await user.click(creatorButton);

 const allButton = screen.getByRole('button', { name: 'All Categories' });
 await user.click(allButton);
 
 mockFaqs.forEach(faq => {
 expect(screen.getByText(faq.question)).toBeInTheDocument();
 });
 });

 it('updates button states when category is selected', async () => {
 const user = userEvent.setup();
 render(<FAQSection {...defaultProps} />);
 
 const allButton = screen.getByRole('button', { name: 'All Categories' });
 const creatorButton = screen.getByRole('button', { name: 'For Creators' });

 expect(allButton).toHaveAttribute('aria-pressed', 'true');
 expect(creatorButton).toHaveAttribute('aria-pressed', 'false');

 await user.click(creatorButton);
 
 expect(allButton).toHaveAttribute('aria-pressed', 'false');
 expect(creatorButton).toHaveAttribute('aria-pressed', 'true');
 });

 it('combines search and category filtering', async () => {
 const user = userEvent.setup();
 render(<FAQSection {...defaultProps} />);

 const creatorButton = screen.getByRole('button', { name: 'For Creators' });
 await user.click(creatorButton);

 const searchInput = screen.getByLabelText('Search FAQs');
 await user.type(searchInput, 'started');
 
 expect(screen.getByText('How do I get started as a creator?')).toBeInTheDocument();
 expect(screen.queryByText('How does the credit system work?')).not.toBeInTheDocument();
 });
 });

 describe('Responsive Layout', () => {
 it('organizes FAQs by category with proper headers', () => {
 render(<FAQSection {...defaultProps} />);

 const categoryHeaders = screen.getAllByText('For Creators');
 expect(categoryHeaders.some(header => header.tagName === 'H3')).toBe(true);
 
 const generalHeaders = screen.getAllByText('General');
 expect(generalHeaders.some(header => header.tagName === 'H3')).toBe(true);
 
 const viewerHeaders = screen.getAllByText('For Viewers');
 expect(viewerHeaders.some(header => header.tagName === 'H3')).toBe(true);
 
 const paymentHeaders = screen.getAllByText('Payments');
 expect(paymentHeaders.some(header => header.tagName === 'H3')).toBe(true);
 });

 it('groups FAQs under their respective categories', () => {
 render(<FAQSection {...defaultProps} />);

 const creatorHeaders = screen.getAllByText('For Creators');
 const creatorCategoryHeader = creatorHeaders.find(header => 
 header.tagName === 'H3' && header.className.includes('text-sm')
 );
 const creatorSection = creatorCategoryHeader?.closest('.space-y-4');
 expect(creatorSection).toContainElement(screen.getByText('How do I get started as a creator?'));
 });
 });

 describe('Accessibility', () => {
 it('has proper ARIA labels and roles', () => {
 render(<FAQSection {...defaultProps} />);
 
 expect(screen.getByRole('region', { name: 'Frequently Asked Questions' })).toBeInTheDocument();
 expect(screen.getByLabelText('Search FAQs')).toBeInTheDocument();
 });

 it('supports keyboard navigation', async () => {
 const user = userEvent.setup();
 render(<FAQSection {...defaultProps} />);
 
 const faqButton = screen.getByRole('button', { name: /How do I get started as a creator?/i });

 faqButton.focus();
 expect(faqButton).toHaveFocus();
 
 await user.keyboard('{Enter}');
 expect(faqButton).toHaveAttribute('aria-expanded', 'true');
 });

 it('maintains focus management during interactions', async () => {
 const user = userEvent.setup();
 render(<FAQSection {...defaultProps} />);
 
 const searchInput = screen.getByLabelText('Search FAQs');

 await user.click(searchInput);
 expect(searchInput).toHaveFocus();

 const allCategoriesButton = screen.getByRole('button', { name: 'All Categories' });
 allCategoriesButton.focus();
 expect(allCategoriesButton).toHaveFocus();
 });
 });

 describe('Edge Cases', () => {
 it('handles empty FAQ list', () => {
 render(<FAQSection title="Empty FAQs" faqs={[]} />);
 
 expect(screen.getByText('No FAQs found matching your search criteria.')).toBeInTheDocument();
 });

 it('handles FAQs with same category', () => {
 const sameCategoryFaqs: FAQItem[] = [
 {
 question: 'Question 1',
 answer: 'Answer 1',
 category: 'general'
 },
 {
 question: 'Question 2',
 answer: 'Answer 2',
 category: 'general'
 }
 ];
 
 render(<FAQSection title="Same Category FAQs" faqs={sameCategoryFaqs} />);
 
 expect(screen.getByText('Question 1')).toBeInTheDocument();
 expect(screen.getByText('Question 2')).toBeInTheDocument();
 expect(screen.getAllByText('General')).toHaveLength(2); // One in filter, one in category header
 });

 it('handles very long questions and answers', () => {
 const longFaq: FAQItem[] = [
 {
 question: 'This is a very long question that might wrap to multiple lines and should still be displayed properly in the accordion interface',
 answer: 'This is a very long answer that contains a lot of detailed information about the topic and should be displayed properly when the accordion item is expanded. It might contain multiple sentences and should maintain proper formatting and readability.',
 category: 'general'
 }
 ];
 
 render(<FAQSection title="Long Content FAQs" faqs={longFaq} />);
 
 expect(screen.getByText(/This is a very long question/)).toBeInTheDocument();
 });
 });
});