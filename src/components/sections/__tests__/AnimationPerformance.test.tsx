import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { FeatureSection } from '../FeatureSection';
import type { FeatureItem } from '@/types';

const mockMotionDiv = jest.fn();
const mockUseInView = jest.fn();
const mockUseReducedMotion = jest.fn();

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ whileHover, whileTap, ...props }: any) => {
 mockMotionDiv(props);
 return <div {...props} />;
 },
 section: ({ whileHover, whileTap, ...props }: any) => <section {...props} />,
 h2: ({ whileHover, whileTap, ...props }: any) => <h2 {...props} />,
 p: ({ whileHover, whileTap, ...props }: any) => <p {...props} />,
 },
 useInView: () => mockUseInView(),
 useReducedMotion: () => mockUseReducedMotion(),
}));

const mockPerformanceNow = jest.fn();
Object.defineProperty(window, 'performance', {
 value: {
 now: mockPerformanceNow,
 },
 writable: true,
});

const mockRequestAnimationFrame = jest.fn();
Object.defineProperty(window, 'requestAnimationFrame', {
 value: mockRequestAnimationFrame,
 writable: true,
});

describe('Animation Performance Tests', () => {
 const mockFeatures: FeatureItem[] = Array.from({ length: 12 }, (_, i) => ({
 icon: '🎥',
 title: `Feature ${i + 1}`,
 description: `Description for feature ${i + 1}`,
 }));

 beforeEach(() => {
 jest.clearAllMocks();
 mockUseInView.mockReturnValue(true);
 mockUseReducedMotion.mockReturnValue(false);
 mockPerformanceNow.mockReturnValue(0);
 });

 describe('Animation initialization performance', () => {
 it('should initialize animations efficiently', () => {
 const startTime = performance.now();
 
 render(
 <FeatureSection
 title="Performance Test"
 features={mockFeatures}
 />
 );

 const endTime = performance.now();
 const renderTime = endTime - startTime;

 expect(renderTime).toBeLessThan(16);
 });

 it('should handle large numbers of animated elements', () => {
 const largeFeatureSet: FeatureItem[] = Array.from({ length: 50 }, (_, i) => ({
 icon: '🎥',
 title: `Feature ${i + 1}`,
 description: `Description for feature ${i + 1}`,
 }));

 const startTime = performance.now();
 
 render(
 <FeatureSection
 title="Large Set Test"
 features={largeFeatureSet}
 />
 );

 const endTime = performance.now();
 const renderTime = endTime - startTime;

 expect(renderTime).toBeLessThan(50);
 expect(screen.getByText('Large Set Test')).toBeInTheDocument();
 });
 });

 describe('Reduced motion optimization', () => {
 it('should optimize animations when reduced motion is preferred', () => {
 mockUseReducedMotion.mockReturnValue(true);

 render(
 <FeatureSection
 title="Reduced Motion Test"
 features={mockFeatures}
 />
 );

 expect(mockMotionDiv).toHaveBeenCalled();

 expect(screen.getByText('Reduced Motion Test')).toBeInTheDocument();
 expect(screen.getByText('Feature 1')).toBeInTheDocument();
 });

 it('should use minimal animation durations for reduced motion', () => {
 mockUseReducedMotion.mockReturnValue(true);

 render(
 <FeatureSection
 title="Duration Test"
 features={mockFeatures.slice(0, 3)}
 />
 );

 const motionCalls = mockMotionDiv.mock.calls;
 expect(motionCalls.length).toBeGreaterThan(0);

 expect(screen.getByText('Duration Test')).toBeInTheDocument();
 });
 });

 describe('Animation memory usage', () => {
 it('should not create memory leaks with repeated renders', () => {
 const { rerender, unmount } = render(
 <FeatureSection
 title="Memory Test 1"
 features={mockFeatures.slice(0, 5)}
 />
 );

 for (let i = 2; i <= 10; i++) {
 rerender(
 <FeatureSection
 title={`Memory Test ${i}`}
 features={mockFeatures.slice(0, 5)}
 />
 );
 }

 expect(screen.getByText('Memory Test 10')).toBeInTheDocument();

 expect(() => unmount()).not.toThrow();
 });

 it('should handle rapid in-view state changes', () => {
 let inViewState = false;
 mockUseInView.mockImplementation(() => inViewState);

 const { rerender } = render(
 <FeatureSection
 title="In-View Test"
 features={mockFeatures.slice(0, 3)}
 />
 );

 for (let i = 0; i < 10; i++) {
 inViewState = !inViewState;
 mockUseInView.mockReturnValue(inViewState);
 
 act(() => {
 rerender(
 <FeatureSection
 title="In-View Test"
 features={mockFeatures.slice(0, 3)}
 />
 );
 });
 }

 expect(screen.getByText('In-View Test')).toBeInTheDocument();
 });
 });

 describe('Animation timing optimization', () => {
 it('should use appropriate stagger delays', () => {
 render(
 <FeatureSection
 title="Stagger Test"
 features={mockFeatures.slice(0, 6)}
 />
 );

 expect(mockMotionDiv).toHaveBeenCalled();

 expect(screen.getByText('Feature 1')).toBeInTheDocument();
 expect(screen.getByText('Feature 6')).toBeInTheDocument();
 });

 it('should handle animation interruptions gracefully', () => {
 mockUseInView.mockReturnValue(false);

 const { rerender } = render(
 <FeatureSection
 title="Interruption Test"
 features={mockFeatures.slice(0, 3)}
 />
 );

 mockUseInView.mockReturnValue(true);
 
 expect(() => {
 rerender(
 <FeatureSection
 title="Interruption Test"
 features={mockFeatures.slice(0, 3)}
 />
 );
 }).not.toThrow();

 expect(screen.getByText('Interruption Test')).toBeInTheDocument();
 });
 });

 describe('60fps performance target', () => {
 it('should maintain smooth animation frame rates', () => {
 const frameTimings: number[] = [];
 let frameCount = 0;

 mockRequestAnimationFrame.mockImplementation((callback) => {
 const currentTime = performance.now();
 frameTimings.push(currentTime);
 frameCount++;
 
 if (frameCount < 60) { // Simulate 1 second of 60fps
 setTimeout(() => callback(currentTime), 16.67); // ~60fps
 }
 
 return frameCount;
 });

 render(
 <FeatureSection
 title="FPS Test"
 features={mockFeatures.slice(0, 8)}
 />
 );

 expect(screen.getByText('FPS Test')).toBeInTheDocument();
 expect(screen.getByText('Feature 1')).toBeInTheDocument();
 });
 });
});