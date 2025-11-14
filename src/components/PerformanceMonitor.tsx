'use client';

import { useEffect } from 'react';
import { trackWebVitals } from '@/lib/performance';

export function PerformanceMonitor() {
 useEffect(() => {

 trackWebVitals();

 if (typeof window !== 'undefined' && 'performance' in window) {

 window.addEventListener('load', () => {
 const loadTime = performance.now();
 console.log(`Page load time: ${loadTime.toFixed(2)}ms`);
 });

 const observer = new PerformanceObserver((list) => {
 list.getEntries().forEach((entry) => {
 if (entry.name === 'first-contentful-paint') {
 console.log(`First Contentful Paint: ${entry.startTime.toFixed(2)}ms`);
 }
 });
 });

 try {
 observer.observe({ entryTypes: ['paint'] });
 } catch (e) {
 console.warn('Performance Observer not supported');
 }

 const lcpObserver = new PerformanceObserver((list) => {
 list.getEntries().forEach((entry) => {
 console.log(`Largest Contentful Paint: ${entry.startTime.toFixed(2)}ms`);
 });
 });

 try {
 lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
 } catch (e) {
 console.warn('LCP Observer not supported');
 }

 const clsObserver = new PerformanceObserver((list) => {
 let clsValue = 0;
 list.getEntries().forEach((entry) => {
 if (!(entry as any).hadRecentInput) {
 clsValue += (entry as any).value;
 }
 });
 if (clsValue > 0) {
 console.log(`Cumulative Layout Shift: ${clsValue.toFixed(4)}`);
 }
 });

 try {
 clsObserver.observe({ entryTypes: ['layout-shift'] });
 } catch (e) {
 console.warn('CLS Observer not supported');
 }
 }
 }, []);

 return null;
}