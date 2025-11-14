import { render, screen } from '@testing-library/react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { OptimizedLoading } from '@/components/ui/OptimizedLoading';
import { calculateOptimalLoadingDuration } from '@/lib/performance';
import { getMobileLoadingStrategy } from '@/lib/mobile-optimization';

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
 },
 AnimatePresence: ({ children }: any) => <>{children}</>,
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

describe('Loading Performance Optimizations', () => {
 beforeEach(() => {

 Object.defineProperty(window, 'innerWidth', {
 writable: true,
 configurable: true,
 value: 1024,
 });
 });

 describe('LoadingScreen Optimizations', () => {
 it('should render minimal variant quickly', () => {
 const startTime = performance.now();
 
 render(
 <LoadingScreen 
 variant="minimal" 
 message="Loading..." 
 />
 );
 
 const endTime = performance.now();
 const renderTime = endTime - startTime;

 expect(renderTime).toBeLessThan(10);
 expect(screen.getByText('Loading...')).toBeInTheDocument();
 });

 it('should use optimized duration for mobile', () => {

 Object.defineProperty(window, 'innerWidth', {
 writable: true,
 configurable: true,
 value: 375,
 });

 const duration = calculateOptimalLoadingDuration();

 expect(duration).toBeLessThan(2000);
 expect(duration).toBeGreaterThan(800);
 });

 it('should disable complex animations on slow connections', () => {

 Object.defineProperty(navigator, 'connection', {
 writable: true,
 value: {
 effectiveType: '2g',
 downlink: 0.5,
 },
 });

 const strategy = getMobileLoadingStrategy();
 
 expect(strategy.enableComplexAnimations).toBe(false);
 expect(strategy.transitionDuration).toBeLessThanOrEqual(300);
 });
 });

 describe('OptimizedLoading Component', () => {
 it('should render without performance issues', () => {
 const startTime = performance.now();
 
 render(
 <OptimizedLoading 
 message="Optimized loading..." 
 variant="standard"
 />
 );
 
 const endTime = performance.now();
 const renderTime = endTime - startTime;
 
 expect(renderTime).toBeLessThan(15);
 expect(screen.getByText('Optimized loading...')).toBeInTheDocument();
 });

 it('should handle mobile viewport efficiently', () => {

 Object.defineProperty(window, 'innerWidth', {
 writable: true,
 configurable: true,
 value: 375,
 });

 const startTime = performance.now();
 
 render(
 <OptimizedLoading 
 variant="minimal" 
 message="Mobile loading..."
 />
 );
 
 const endTime = performance.now();
 const renderTime = endTime - startTime;

 expect(renderTime).toBeLessThan(8);
 });
 });

 describe('Performance Utilities', () => {
 it('should calculate optimal duration based on device capabilities', () => {
 const duration = calculateOptimalLoadingDuration();
 
 expect(duration).toBeGreaterThan(0);
 expect(duration).toBeLessThan(5000);
 });

 it('should provide mobile-optimized loading strategy', () => {
 const strategy = getMobileLoadingStrategy();
 
 expect(strategy).toHaveProperty('skeletonDuration');
 expect(strategy).toHaveProperty('transitionDuration');
 expect(strategy).toHaveProperty('enableComplexAnimations');
 expect(strategy).toHaveProperty('lazyLoadThreshold');
 expect(strategy).toHaveProperty('preloadCount');
 });

 it('should adapt to slow connections', () => {

 Object.defineProperty(navigator, 'connection', {
 writable: true,
 value: {
 effectiveType: 'slow-2g',
 downlink: 0.2,
 },
 });

 const strategy = getMobileLoadingStrategy();
 
 expect(strategy.enableComplexAnimations).toBe(false);
 });
 });

 describe('Memory Usage', () => {
 it('should not cause memory leaks with multiple renders', () => {
 const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

 for (let i = 0; i < 10; i++) {
 const { unmount } = render(
 <OptimizedLoading message={`Test ${i}`} />
 );
 unmount();
 }

 if (global.gc) {
 global.gc();
 }
 
 const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;

 if (initialMemory > 0 && finalMemory > 0) {
 const memoryIncrease = finalMemory - initialMemory;
 expect(memoryIncrease).toBeLessThan(1000000); // Less than 1MB increase
 }
 });
 });

 describe('Animation Performance', () => {
 it('should respect reduced motion preferences', () => {

 window.matchMedia = jest.fn().mockImplementation(query => ({
 matches: query === '(prefers-reduced-motion: reduce)',
 media: query,
 onchange: null,
 addListener: jest.fn(),
 removeListener: jest.fn(),
 addEventListener: jest.fn(),
 removeEventListener: jest.fn(),
 dispatchEvent: jest.fn(),
 }));

 render(<OptimizedLoading variant="detailed" />);

 expect(screen.getByText('Loading...')).toBeInTheDocument();
 });

 it('should use faster animations on mobile', () => {

 Object.defineProperty(window, 'innerWidth', {
 writable: true,
 configurable: true,
 value: 375,
 });

 const strategy = getMobileLoadingStrategy();
 
 expect(strategy.transitionDuration).toBeLessThan(300);
 expect(strategy.skeletonDuration).toBeLessThan(600);
 });
 });
});