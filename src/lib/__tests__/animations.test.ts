import { createScrollAnimationVariants, createHoverVariants, smoothScrollTo } from '../animations';

const mockScrollTo = jest.fn();
Object.defineProperty(window, 'scrollTo', {
 value: mockScrollTo,
 writable: true,
});

const mockGetElementById = jest.fn();
Object.defineProperty(document, 'getElementById', {
 value: mockGetElementById,
 writable: true,
});

const mockGetBoundingClientRect = jest.fn();

describe('Animation utilities', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 });

 describe('createScrollAnimationVariants', () => {
 it('should create animation variants with normal motion', () => {
 const variants = createScrollAnimationVariants(false);
 
 expect(variants.container.visible.transition.duration).toBe(0.6);
 expect(variants.container.visible.transition.staggerChildren).toBe(0.15);
 expect(variants.header.hidden.y).toBe(30);
 expect(variants.item.hidden.scale).toBe(0.95);
 });

 it('should create reduced motion variants when shouldReduceMotion is true', () => {
 const variants = createScrollAnimationVariants(true);
 
 expect(variants.container.visible.transition.duration).toBe(0.01);
 expect(variants.container.visible.transition.staggerChildren).toBe(0);
 expect(variants.header.hidden.y).toBe(0);
 expect(variants.item.hidden.scale).toBe(1);
 });

 it('should have consistent structure across all variants', () => {
 const variants = createScrollAnimationVariants(false);
 
 expect(variants).toHaveProperty('container');
 expect(variants).toHaveProperty('header');
 expect(variants).toHaveProperty('item');
 expect(variants).toHaveProperty('staggeredItem');

 Object.values(variants).forEach(variant => {
 expect(variant).toHaveProperty('hidden');
 expect(variant).toHaveProperty('visible');
 });
 });
 });

 describe('createHoverVariants', () => {
 it('should create hover variants with normal motion', () => {
 const variants = createHoverVariants(false);
 
 expect(variants.cardHover.scale).toBe(1.02);
 expect(variants.cardHover.y).toBe(-8);
 expect(variants.buttonHover.scale).toBe(1.05);
 expect(variants.iconHover.scale).toBe(1.1);
 });

 it('should create reduced motion hover variants', () => {
 const variants = createHoverVariants(true);
 
 expect(variants.cardHover.scale).toBe(1);
 expect(variants.cardHover.y).toBe(0);
 expect(variants.buttonHover.scale).toBe(1);
 expect(variants.iconHover.scale).toBe(1);
 });
 });

 describe('smoothScrollTo', () => {
 it('should scroll to element with default offset', () => {
 const mockElement = {
 getBoundingClientRect: mockGetBoundingClientRect.mockReturnValue({
 top: 500,
 }),
 };
 
 mockGetElementById.mockReturnValue(mockElement);
 Object.defineProperty(window, 'pageYOffset', {
 value: 100,
 writable: true,
 });

 smoothScrollTo('test-section');

 expect(mockGetElementById).toHaveBeenCalledWith('test-section');
 expect(mockScrollTo).toHaveBeenCalledWith({
 top: 520, // 500 + 100 - 80 (default offset)
 behavior: 'smooth',
 });
 });

 it('should scroll to element with custom offset', () => {
 const mockElement = {
 getBoundingClientRect: mockGetBoundingClientRect.mockReturnValue({
 top: 500,
 }),
 };
 
 mockGetElementById.mockReturnValue(mockElement);
 Object.defineProperty(window, 'pageYOffset', {
 value: 100,
 writable: true,
 });

 smoothScrollTo('test-section', 120);

 expect(mockScrollTo).toHaveBeenCalledWith({
 top: 480, // 500 + 100 - 120 (custom offset)
 behavior: 'smooth',
 });
 });

 it('should handle hash prefixed element IDs', () => {
 const mockElement = {
 getBoundingClientRect: mockGetBoundingClientRect.mockReturnValue({
 top: 300,
 }),
 };
 
 mockGetElementById.mockReturnValue(mockElement);
 Object.defineProperty(window, 'pageYOffset', {
 value: 0,
 writable: true,
 });

 smoothScrollTo('#test-section');

 expect(mockGetElementById).toHaveBeenCalledWith('test-section');
 });

 it('should not scroll if element is not found', () => {
 mockGetElementById.mockReturnValue(null);

 smoothScrollTo('non-existent-section');

 expect(mockScrollTo).not.toHaveBeenCalled();
 });
 });
});