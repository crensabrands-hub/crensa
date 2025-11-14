import { render, screen } from '@testing-library/react';
import { FeatureSection } from '../FeatureSection';
import { FeatureItem } from '@/types';

const mockAnimationStart = jest.fn();
const mockAnimationComplete = jest.fn();

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, whileHover, variants, initial, animate, transition, onAnimationStart, onAnimationComplete, ...props }: any) => {
 if (onAnimationStart) mockAnimationStart();
 if (onAnimationComplete) mockAnimationComplete();
 return <div {...props}>{children}</div>;
 },
 section: ({ children, variants, initial, animate, onAnimationStart, onAnimationComplete, ...props }: any) => {
 if (onAnimationStart) mockAnimationStart();
 if (onAnimationComplete) mockAnimationComplete();
 return <section {...props}>{children}</section>;
 },
 },
 useReducedMotion: () => false,
 useInView: () => true,
}));

const createMockFeatures = (count: number): FeatureItem[] => {
 return Array.from({ length: count }, (_, index) => ({
 icon: `🎯`,
 title: `Feature ${index + 1}`,
 description: `Description for feature ${index + 1} with some detailed text to test performance.`
 }));
};

describe('FeatureSection Performance', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 it('renders efficiently with multiple features', () => {
 const startTime = performance.now();
 const manyFeatures = createMockFeatures(12); // Test with many features
 
 render(
 <FeatureSection
 title="Performance Test"
 features={manyFeatures}
 />
 );
 
 const endTime = performance.now();
 const renderTime = endTime - startTime;

 expect(renderTime).toBeLessThan(100);

 expect(screen.getAllByText(/Feature \d+/)).toHaveLength(12);
 });

 it('handles responsive grid layout efficiently', () => {
 const features = createMockFeatures(6);
 
 render(
 <FeatureSection
 title="Responsive Test"
 features={features}
 />
 );
 
 const gridContainer = screen.getByText('Feature 1').closest('.grid');
 expect(gridContainer).toHaveClass(
 'grid',
 'grid-cols-1',
 'md:grid-cols-2', 
 'lg:grid-cols-3'
 );

 expect(screen.getAllByText(/Feature \d+/)).toHaveLength(6);
 });

 it('maintains accessibility with many features', () => {
 const features = createMockFeatures(9);
 
 render(
 <FeatureSection
 title="Accessibility Test"
 features={features}
 />
 );

 const icons = screen.getAllByRole('img');
 expect(icons).toHaveLength(9);
 
 icons.forEach((icon, index) => {
 expect(icon).toHaveAttribute('aria-label', `Feature ${index + 1} icon`);
 });

 const headings = screen.getAllByRole('heading', { level: 3 });
 expect(headings).toHaveLength(9);
 });

 it('handles reduced motion preferences', () => {

 jest.doMock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
 },
 useReducedMotion: () => true, // Reduced motion enabled
 useInView: () => true,
 }));
 
 const features = createMockFeatures(3);
 
 render(
 <FeatureSection
 title="Reduced Motion Test"
 features={features}
 />
 );

 expect(screen.getByText('Reduced Motion Test')).toBeInTheDocument();
 expect(screen.getAllByText(/Feature \d+/)).toHaveLength(3);
 });

 it('optimizes re-renders with stable props', () => {
 const features = createMockFeatures(3);
 const props = {
 title: 'Stable Props Test',
 features,
 };
 
 const { rerender } = render(<FeatureSection {...props} />);

 const startTime = performance.now();
 rerender(<FeatureSection {...props} />);
 const endTime = performance.now();
 
 const rerenderTime = endTime - startTime;

 expect(rerenderTime).toBeLessThan(10);
 });
});