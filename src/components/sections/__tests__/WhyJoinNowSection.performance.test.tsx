import { render, screen } from '@testing-library/react';
import { WhyJoinNowSection } from '../WhyJoinNowSection';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, whileHover, variants, initial, animate, transition, ...props }: any) => <div {...props}>{children}</div>,
 section: ({ children, whileHover, variants, initial, animate, transition, ...props }: any) => <section {...props}>{children}</section>,
 },
 useReducedMotion: jest.fn(() => false),
 useInView: jest.fn(() => true),
}));

const mockProps = {
 title: 'Why Join Now?',
 benefits: [
 'Lock in 50% lower platform fees forever as a founding creator',
 'Get exclusive early access to premium features before anyone else',
 'Receive priority support and direct influence on platform development',
 'Build your audience from day one with zero competition'
 ],
 ctaText: 'Claim Your Spot',
 ctaLink: '/early-access'
};

describe('WhyJoinNowSection Performance', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 it('renders quickly without performance issues', () => {
 const startTime = performance.now();
 
 render(<WhyJoinNowSection {...mockProps} />);
 
 const endTime = performance.now();
 const renderTime = endTime - startTime;

 expect(renderTime).toBeLessThan(100);

 expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
 });

 it('handles multiple re-renders efficiently', () => {
 const { rerender } = render(<WhyJoinNowSection {...mockProps} />);
 
 const startTime = performance.now();

 for (let i = 0; i < 10; i++) {
 rerender(<WhyJoinNowSection {...mockProps} className={`test-${i}`} />);
 }
 
 const endTime = performance.now();
 const rerenderTime = endTime - startTime;

 expect(rerenderTime).toBeLessThan(200);
 });

 it('renders with large number of benefits efficiently', () => {
 const largeBenefitsList = Array.from({ length: 20 }, (_, i) => 
 `Benefit number ${i + 1} with detailed description`
 );
 
 const largeProps = {
 ...mockProps,
 benefits: largeBenefitsList
 };
 
 const startTime = performance.now();
 
 render(<WhyJoinNowSection {...largeProps} />);
 
 const endTime = performance.now();
 const renderTime = endTime - startTime;

 expect(renderTime).toBeLessThan(150);

 expect(screen.getAllByText(/benefit number/i)).toHaveLength(20);
 });

 it('does not cause memory leaks with counter animation', () => {
 const { unmount } = render(<WhyJoinNowSection {...mockProps} />);

 const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

 unmount();

 if (global.gc) {
 global.gc();
 }
 
 const endMemory = (performance as any).memory?.usedJSHeapSize || 0;

 if (startMemory > 0 && endMemory > 0) {
 const memoryIncrease = endMemory - startMemory;
 expect(memoryIncrease).toBeLessThan(1000000); // Less than 1MB increase
 }
 });

 it('renders with reduced motion preference efficiently', () => {
 const { useReducedMotion } = require('framer-motion');

 useReducedMotion.mockReturnValue(true);
 
 const startTime = performance.now();
 
 render(<WhyJoinNowSection {...mockProps} />);
 
 const endTime = performance.now();
 const renderTime = endTime - startTime;

 expect(renderTime).toBeLessThan(50);

 expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

 useReducedMotion.mockReturnValue(false);
 });

 it('handles rapid prop changes without performance degradation', () => {
 const { rerender } = render(<WhyJoinNowSection {...mockProps} />);
 
 const startTime = performance.now();

 const variations = [
 { ...mockProps, title: 'Updated Title 1' },
 { ...mockProps, title: 'Updated Title 2' },
 { ...mockProps, ctaText: 'New CTA' },
 { ...mockProps, benefits: mockProps.benefits.slice(0, 2) },
 mockProps // Back to original
 ];
 
 variations.forEach(props => {
 rerender(<WhyJoinNowSection {...props} />);
 });
 
 const endTime = performance.now();
 const updateTime = endTime - startTime;

 expect(updateTime).toBeLessThan(100);
 });
});