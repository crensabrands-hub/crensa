import React from 'react';

export const KEYBOARD_KEYS = {
 ENTER: 'Enter',
 SPACE: ' ',
 ESCAPE: 'Escape',
 ARROW_UP: 'ArrowUp',
 ARROW_DOWN: 'ArrowDown',
 ARROW_LEFT: 'ArrowLeft',
 ARROW_RIGHT: 'ArrowRight',
 TAB: 'Tab',
 HOME: 'Home',
 END: 'End',
} as const;

export type KeyboardKey = typeof KEYBOARD_KEYS[keyof typeof KEYBOARD_KEYS];

export const handleKeyboardNavigation = (
 event: React.KeyboardEvent,
 callbacks: {
 onEnter?: () => void;
 onSpace?: () => void;
 onEscape?: () => void;
 onArrowUp?: () => void;
 onArrowDown?: () => void;
 onArrowLeft?: () => void;
 onArrowRight?: () => void;
 onHome?: () => void;
 onEnd?: () => void;
 }
) => {
 const { key } = event;
 
 switch (key) {
 case KEYBOARD_KEYS.ENTER:
 callbacks.onEnter?.();
 break;
 case KEYBOARD_KEYS.SPACE:
 event.preventDefault(); // Prevent page scroll
 callbacks.onSpace?.();
 break;
 case KEYBOARD_KEYS.ESCAPE:
 callbacks.onEscape?.();
 break;
 case KEYBOARD_KEYS.ARROW_UP:
 event.preventDefault();
 callbacks.onArrowUp?.();
 break;
 case KEYBOARD_KEYS.ARROW_DOWN:
 event.preventDefault();
 callbacks.onArrowDown?.();
 break;
 case KEYBOARD_KEYS.ARROW_LEFT:
 event.preventDefault();
 callbacks.onArrowLeft?.();
 break;
 case KEYBOARD_KEYS.ARROW_RIGHT:
 event.preventDefault();
 callbacks.onArrowRight?.();
 break;
 case KEYBOARD_KEYS.HOME:
 event.preventDefault();
 callbacks.onHome?.();
 break;
 case KEYBOARD_KEYS.END:
 event.preventDefault();
 callbacks.onEnd?.();
 break;
 }
};

export const generateId = (prefix: string): string => {
 return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
 const announcement = document.createElement('div');
 announcement.setAttribute('aria-live', priority);
 announcement.setAttribute('aria-atomic', 'true');
 announcement.setAttribute('class', 'sr-only');
 announcement.textContent = message;
 
 document.body.appendChild(announcement);

 setTimeout(() => {
 document.body.removeChild(announcement);
 }, 1000);
};

export const trapFocus = (element: HTMLElement) => {
 const focusableElements = element.querySelectorAll(
 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
 ) as NodeListOf<HTMLElement>;
 
 const firstElement = focusableElements[0];
 const lastElement = focusableElements[focusableElements.length - 1];
 
 const handleTabKey = (event: KeyboardEvent) => {
 if (event.key !== KEYBOARD_KEYS.TAB) return;
 
 if (event.shiftKey) {
 if (document.activeElement === firstElement) {
 event.preventDefault();
 lastElement.focus();
 }
 } else {
 if (document.activeElement === lastElement) {
 event.preventDefault();
 firstElement.focus();
 }
 }
 };
 
 element.addEventListener('keydown', handleTabKey);

 return () => {
 element.removeEventListener('keydown', handleTabKey);
 };
};

export const prefersReducedMotion = (): boolean => {
 return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const generateAriaLabel = {
 carousel: (current: number, total: number) => 
 `Slide ${current} of ${total}`,
 
 accordion: (isExpanded: boolean, title: string) => 
 `${isExpanded ? 'Collapse' : 'Expand'} ${title}`,
 
 navigation: (current: string) => 
 `Navigate to ${current}`,
 
 rating: (rating: number, maxRating: number = 5) => 
 `${rating} out of ${maxRating} stars`,
 
 loading: (item: string) => 
 `Loading ${item}`,
 
 error: (item: string) => 
 `Error loading ${item}`,
};

export const SkipLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => {
 return (
 <a
 href={href}
 className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-primary-navy text-white px-4 py-2 rounded-lg font-medium"
 >
 {children}
 </a>
 );
};