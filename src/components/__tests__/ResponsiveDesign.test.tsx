import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { 
 isMobileDevice, 
 isTouchDevice, 
 getViewportSize, 
 isMobileViewport,
 isTabletViewport,
 isDesktopViewport,
 debounce,
 throttle
} from '@/lib/mobile-optimization';

import { useResponsive } from '@/hooks/useResponsive';

describe('Responsive Design Tests', () => {

 const setViewport = (width: number, height: number) => {
 Object.defineProperty(window, 'innerWidth', {
 writable: true,
 configurable: true,
 value: width,
 });
 Object.defineProperty(window, 'innerHeight', {
 writable: true,
 configurable: true,
 value: height,
 });

 window.dispatchEvent(new Event('resize'));
 };

 beforeEach(() => {

 setViewport(1024, 768);
 });

 describe('Mobile Optimization Utilities', () => {
 test('should detect mobile viewport correctly', () => {
 setViewport(375, 667);
 expect(isMobileViewport()).toBe(true);
 
 setViewport(1024, 768);
 expect(isMobileViewport()).toBe(false);
 });

 test('should detect tablet viewport correctly', () => {
 setViewport(768, 1024);
 expect(isTabletViewport()).toBe(true);
 
 setViewport(375, 667);
 expect(isTabletViewport()).toBe(false);
 
 setViewport(1440, 900);
 expect(isTabletViewport()).toBe(false);
 });

 test('should detect desktop viewport correctly', () => {
 setViewport(1440, 900);
 expect(isDesktopViewport()).toBe(true);
 
 setViewport(768, 1024);
 expect(isDesktopViewport()).toBe(false);
 });

 test('should get viewport size correctly', () => {
 setViewport(375, 667);
 const size = getViewportSize();
 expect(size.width).toBe(375);
 expect(size.height).toBe(667);
 });
 });

 describe('Utility Functions', () => {
 test('should debounce function calls', (done) => {
 let callCount = 0;
 const debouncedFn = debounce(() => {
 callCount++;
 }, 100);

 debouncedFn();
 debouncedFn();
 debouncedFn();

 setTimeout(() => {
 expect(callCount).toBe(1);
 done();
 }, 150);
 });

 test('should throttle function calls', (done) => {
 let callCount = 0;
 const throttledFn = throttle(() => {
 callCount++;
 }, 100);

 throttledFn();
 throttledFn();
 throttledFn();

 expect(callCount).toBe(1);

 setTimeout(() => {
 throttledFn();
 expect(callCount).toBe(2);
 done();
 }, 150);
 });
 });

 describe('Responsive Breakpoints', () => {
 test('should handle mobile breakpoint (320px - 767px)', () => {
 const testSizes = [320, 375, 414, 767];
 
 testSizes.forEach(width => {
 setViewport(width, 667);
 expect(isMobileViewport()).toBe(true);
 expect(isTabletViewport()).toBe(false);
 expect(isDesktopViewport()).toBe(false);
 });
 });

 test('should handle tablet breakpoint (768px - 1023px)', () => {
 const testSizes = [768, 834, 1023];
 
 testSizes.forEach(width => {
 setViewport(width, 1024);
 expect(isMobileViewport()).toBe(false);
 expect(isTabletViewport()).toBe(true);
 expect(isDesktopViewport()).toBe(false);
 });
 });

 test('should handle desktop breakpoint (1024px+)', () => {
 const testSizes = [1024, 1440, 1920, 2560];
 
 testSizes.forEach(width => {
 setViewport(width, 900);
 expect(isMobileViewport()).toBe(false);
 expect(isTabletViewport()).toBe(false);
 expect(isDesktopViewport()).toBe(true);
 });
 });
 });

 describe('Touch Interactions', () => {
 test('should handle touch events properly', () => {
 const element = document.createElement('div');
 document.body.appendChild(element);

 const touchStart = new TouchEvent('touchstart', {
 touches: [{ clientX: 100, clientY: 100 } as Touch],
 });
 
 const touchEnd = new TouchEvent('touchend', {
 changedTouches: [{ clientX: 150, clientY: 100 } as Touch],
 });

 let touchStartCalled = false;
 let touchEndCalled = false;

 element.addEventListener('touchstart', () => {
 touchStartCalled = true;
 });

 element.addEventListener('touchend', () => {
 touchEndCalled = true;
 });

 element.dispatchEvent(touchStart);
 element.dispatchEvent(touchEnd);

 expect(touchStartCalled).toBe(true);
 expect(touchEndCalled).toBe(true);

 document.body.removeChild(element);
 });
 });

 describe('Performance Considerations', () => {
 test('should handle rapid resize events efficiently', () => {
 let resizeCallCount = 0;
 const debouncedResize = debounce(() => {
 resizeCallCount++;
 }, 100);

 for (let i = 0; i < 10; i++) {
 setViewport(320 + i * 10, 667);
 debouncedResize();
 }

 setTimeout(() => {
 expect(resizeCallCount).toBe(1);
 }, 150);
 });

 test('should maintain performance with frequent viewport checks', () => {
 const startTime = performance.now();

 for (let i = 0; i < 1000; i++) {
 getViewportSize();
 isMobileViewport();
 isTabletViewport();
 isDesktopViewport();
 }
 
 const endTime = performance.now();

 expect(endTime - startTime).toBeLessThan(100);
 });
 });

 describe('Edge Cases', () => {
 test('should handle very small viewports', () => {
 setViewport(240, 320);
 expect(isMobileViewport()).toBe(true);
 expect(getViewportSize().width).toBe(240);
 });

 test('should handle very large viewports', () => {
 setViewport(3840, 2160);
 expect(isDesktopViewport()).toBe(true);
 expect(getViewportSize().width).toBe(3840);
 });

 test('should handle square viewports', () => {
 setViewport(768, 768);
 expect(isTabletViewport()).toBe(true);
 });

 test('should handle portrait orientation on tablets', () => {
 setViewport(768, 1024);
 expect(isTabletViewport()).toBe(true);
 
 const size = getViewportSize();
 expect(size.width).toBe(768);
 expect(size.height).toBe(1024);
 });
 });
});