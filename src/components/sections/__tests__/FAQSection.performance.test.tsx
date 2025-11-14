import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FAQSection } from '../FAQSection';
import { FAQItem } from '@/types';

const mockUseReducedMotion = jest.fn();
const mockUseInView = jest.fn();

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
 },
 useReducedMotion: () => mockUseReducedMotion(),
 useInView: () => mockUseInView(),
 AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const generateLargeFAQDataset = (count: number): FAQItem[] => {
 const categories: Array<'general' | 'creator' | 'viewer' | 'payment'> = ['general', 'creator', 'viewer', 'payment'];
 const faqs: FAQItem[] = [];
 
 for (let i = 0; i < count; i++) {
 faqs.push({
 question: `FAQ Question ${i + 1} - This is a sample question that might be asked frequently by users`,
 answer: `This is the answer to FAQ question ${i + 1}. It contains detailed information that helps users understand the topic better. The answer might be quite long and contain multiple sentences to provide comprehensive information.`,
 category: categories[i % categories.length]
 });
 }
 
 return faqs;
};

describe('FAQSection Performance', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 mockUseReducedMotion.mockReturnValue(false);
 mockUseInView.mockReturnValue(true);
 });

 describe('Rendering Performance', () => {
 it('renders efficiently with large FAQ dataset', () => {
 const largeFaqs = generateLargeFAQDataset(100);
 const startTime = performance.now();
 
 render(<FAQSection title="Performance Test FAQs" faqs={largeFaqs} />);
 
 const endTime = performance.now();
 const renderTime = endTime - startTime;

 expect(renderTime).toBeLessThan(500);

 expect(screen.getByText('FAQ Question 1 - This is a sample question that might be asked frequently by users')).toBeInTheDocument();
 expect(screen.getByText('FAQ Question 100 - This is a sample question that might be asked frequently by users')).toBeInTheDocument();
 });

 it('handles reduced motion preferences efficiently', () => {
 mockUseReducedMotion.mockReturnValue(true);
 const largeFaqs = generateLargeFAQDataset(50);
 
 const startTime = performance.now();
 render(<FAQSection title="Reduced Motion Test" faqs={largeFaqs} />);
 const endTime = performance.now();
 
 expect(endTime - startTime).toBeLessThan(200);
 expect(mockUseReducedMotion).toHaveBeenCalled();
 });

 it('efficiently handles component re-renders', () => {
 const faqs = generateLargeFAQDataset(20);
 const { rerender } = render(<FAQSection title="Initial Title" faqs={faqs} />);
 
 const startTime = performance.now();

 for (let i = 0; i < 10; i++) {
 rerender(<FAQSection title={`Updated Title ${i}`} faqs={faqs} />);
 }
 
 const endTime = performance.now();
 expect(endTime - startTime).toBeLessThan(200);
 });
 });

 describe('Search Performance', () => {
 it('performs search efficiently with large dataset', async () => {
 const user = userEvent.setup();
 const largeFaqs = generateLargeFAQDataset(200);
 
 render(<FAQSection title="Search Performance Test" faqs={largeFaqs} />);
 
 const searchInput = screen.getByLabelText('Search FAQs');
 
 const startTime = performance.now();
 await user.type(searchInput, 'Question 1');
 const endTime = performance.now();

 expect(endTime - startTime).toBeLessThan(500);

 expect(screen.getByText(/FAQ Question 1 /)).toBeInTheDocument();
 expect(screen.getByText(/FAQ Question 10 /)).toBeInTheDocument();
 expect(screen.getByText(/FAQ Question 100 /)).toBeInTheDocument();
 });

 it('handles rapid search input changes efficiently', async () => {
 const user = userEvent.setup();
 const largeFaqs = generateLargeFAQDataset(100);
 
 render(<FAQSection title="Rapid Search Test" faqs={largeFaqs} />);
 
 const searchInput = screen.getByLabelText('Search FAQs');
 
 const startTime = performance.now();

 await user.type(searchInput, 'a');
 await user.type(searchInput, 'b');
 await user.type(searchInput, 'c');
 await user.clear(searchInput);
 await user.type(searchInput, 'Question');
 
 const endTime = performance.now();
 
 expect(endTime - startTime).toBeLessThan(200);
 });

 it('efficiently filters by category with large dataset', async () => {
 const user = userEvent.setup();
 const largeFaqs = generateLargeFAQDataset(200);
 
 render(<FAQSection title="Category Filter Performance" faqs={largeFaqs} />);
 
 const startTime = performance.now();

 await user.click(screen.getByRole('button', { name: 'For Creators' }));
 await user.click(screen.getByRole('button', { name: 'General' }));
 await user.click(screen.getByRole('button', { name: 'For Viewers' }));
 await user.click(screen.getByRole('button', { name: 'All Categories' }));
 
 const endTime = performance.now();
 
 expect(endTime - startTime).toBeLessThan(500);
 });
 });

 describe('Accordion Performance', () => {
 it('handles multiple accordion expansions efficiently', async () => {
 const user = userEvent.setup();
 const faqs = generateLargeFAQDataset(50);
 
 render(<FAQSection title="Accordion Performance Test" faqs={faqs} />);
 
 const startTime = performance.now();

 const faqButtons = screen.getAllByRole('button', { name: /FAQ Question/ });
 for (let i = 0; i < Math.min(10, faqButtons.length); i++) {
 await user.click(faqButtons[i]);
 }
 
 const endTime = performance.now();
 
 expect(endTime - startTime).toBeLessThan(200);
 });

 it('efficiently handles rapid accordion toggling', async () => {
 const user = userEvent.setup();
 const faqs = generateLargeFAQDataset(20);
 
 render(<FAQSection title="Rapid Toggle Test" faqs={faqs} />);
 
 const faqButton = screen.getAllByRole('button', { name: /FAQ Question 1/ })[0];
 
 const startTime = performance.now();

 for (let i = 0; i < 20; i++) {
 await user.click(faqButton);
 }
 
 const endTime = performance.now();
 
 expect(endTime - startTime).toBeLessThan(300);
 });
 });

 describe('Memory Management', () => {
 it('does not create memory leaks with frequent re-renders', () => {
 const faqs = generateLargeFAQDataset(30);
 const { rerender, unmount } = render(<FAQSection title="Memory Test" faqs={faqs} />);

 for (let i = 0; i < 50; i++) {
 rerender(<FAQSection title={`Memory Test ${i}`} faqs={faqs} />);
 }

 expect(() => unmount()).not.toThrow();
 });

 it('efficiently handles state updates with large datasets', async () => {
 const user = userEvent.setup();
 const largeFaqs = generateLargeFAQDataset(100);
 
 render(<FAQSection title="State Update Test" faqs={largeFaqs} />);
 
 const searchInput = screen.getByLabelText('Search FAQs');

 await user.type(searchInput, 'test');
 await user.click(screen.getByRole('button', { name: 'For Creators' }));
 await user.clear(searchInput);
 await user.type(searchInput, 'question');

 expect(screen.getByDisplayValue('question')).toBeInTheDocument();
 });
 });

 describe('Animation Performance', () => {
 it('respects reduced motion preferences for performance', () => {
 mockUseReducedMotion.mockReturnValue(true);
 const faqs = generateLargeFAQDataset(30);
 
 render(<FAQSection title="Reduced Motion Performance" faqs={faqs} />);

 expect(mockUseReducedMotion).toHaveBeenCalled();
 });

 it('efficiently handles scroll-based animations', () => {
 mockUseInView.mockReturnValue(false);
 const faqs = generateLargeFAQDataset(20);
 
 const { rerender } = render(<FAQSection title="Scroll Animation Test" faqs={faqs} />);

 mockUseInView.mockReturnValue(true);
 rerender(<FAQSection title="Scroll Animation Test" faqs={faqs} />);
 
 expect(mockUseInView).toHaveBeenCalled();
 });
 });

 describe('DOM Performance', () => {
 it('minimizes DOM queries during filtering', async () => {
 const user = userEvent.setup();
 const faqs = generateLargeFAQDataset(50);
 
 render(<FAQSection title="DOM Performance Test" faqs={faqs} />);

 const originalQuerySelector = document.querySelector;
 let queryCount = 0;
 document.querySelector = jest.fn((...args) => {
 queryCount++;
 return originalQuerySelector.apply(document, args);
 });
 
 await user.type(screen.getByLabelText('Search FAQs'), 'test');

 document.querySelector = originalQuerySelector;

 expect(queryCount).toBeLessThan(20);
 });

 it('efficiently updates DOM during category changes', async () => {
 const user = userEvent.setup();
 const faqs = generateLargeFAQDataset(40);
 
 render(<FAQSection title="DOM Update Test" faqs={faqs} />);
 
 const startTime = performance.now();

 await user.click(screen.getByRole('button', { name: 'For Creators' }));
 await user.click(screen.getByRole('button', { name: 'General' }));
 await user.click(screen.getByRole('button', { name: 'All Categories' }));
 
 const endTime = performance.now();
 
 expect(endTime - startTime).toBeLessThan(50);
 });
 });

 describe('Edge Case Performance', () => {
 it('handles empty search results efficiently', async () => {
 const user = userEvent.setup();
 const faqs = generateLargeFAQDataset(100);
 
 render(<FAQSection title="Empty Results Test" faqs={faqs} />);
 
 const startTime = performance.now();
 await user.type(screen.getByLabelText('Search FAQs'), 'nonexistentquery12345');
 const endTime = performance.now();
 
 expect(endTime - startTime).toBeLessThan(50);
 expect(screen.getByText('No FAQs found matching your search criteria.')).toBeInTheDocument();
 });

 it('efficiently handles single category with many items', async () => {
 const singleCategoryFaqs: FAQItem[] = Array.from({ length: 100 }, (_, i) => ({
 question: `Single Category Question ${i + 1}`,
 answer: `Answer ${i + 1}`,
 category: 'general'
 }));
 
 const startTime = performance.now();
 render(<FAQSection title="Single Category Test" faqs={singleCategoryFaqs} />);
 const endTime = performance.now();
 
 expect(endTime - startTime).toBeLessThan(100);
 expect(screen.getByText('Single Category Question 1')).toBeInTheDocument();
 });
 });
});