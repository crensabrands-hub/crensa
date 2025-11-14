import { render, screen } from '@testing-library/react';
import { HowItWorksSection } from '../HowItWorksSection';
import { FeatureItem } from '@/types';

jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, whileHover, variants, initial, animate, transition, style, ...props }: any) => <div {...props} style={style}>{children}</div>,
 section: ({ children, variants, initial, animate, ...props }: any) => <section {...props}>{children}</section>,
 button: ({ children, whileHover, whileTap, transition, ...props }: any) => <button {...props}>{children}</button>,
 },
 useReducedMotion: () => false,
 useInView: () => true,
}));

const mockMatchMedia = (matches: boolean) => {
 Object.defineProperty(window, 'matchMedia', {
 writable: true,
 value: jest.fn().mockImplementation(query => ({
 matches,
 media: query,
 onchange: null,
 addListener: jest.fn(), // deprecated
 removeListener: jest.fn(), // deprecated
 addEventListener: jest.fn(),
 removeEventListener: jest.fn(),
 dispatchEvent: jest.fn(),
 })),
 });
};

const mockSteps: FeatureItem[] = [
 {
 icon: '📱',
 title: 'Upload Your Videos',
 description: 'Share your short-form content with our easy-to-use upload system.'
 },
 {
 icon: '💳',
 title: 'Set Your Price',
 description: 'Choose how many credits viewers need to spend to watch your content.'
 },
 {
 icon: '🎉',
 title: 'Earn & Grow',
 description: 'Get paid when viewers watch and build a loyal following.'
 }
];

describe('HowItWorksSection - Responsive Layout', () => {
 const defaultProps = {
 title: 'How It Works',
 steps: mockSteps,
 };

 beforeEach(() => {
 jest.clearAllMocks();
 });

 afterEach(() => {

 delete (window as any).matchMedia;
 });

 describe('Mobile Layout (< 1024px)', () => {
 beforeEach(() => {
 mockMatchMedia(false); // Simulate mobile viewport
 });

 it('displays mobile layout structure', () => {
 render(<HowItWorksSection {...defaultProps} />);

 const mobileContainer = document.querySelector('.block.lg\\:hidden');
 expect(mobileContainer).toBeInTheDocument();
 expect(mobileContainer).toHaveClass('block', 'lg:hidden');
 });

 it('uses vertical layout with proper spacing', () => {
 render(<HowItWorksSection {...defaultProps} />);
 
 const mobileContainer = document.querySelector('.space-y-8');
 expect(mobileContainer).toBeInTheDocument();
 expect(mobileContainer).toHaveClass('space-y-8');
 });

 it('renders steps with flex layout for mobile', () => {
 render(<HowItWorksSection {...defaultProps} />);

 const stepContainers = document.querySelectorAll('.flex.items-start.gap-6');
 
 expect(stepContainers.length).toBe(3); // 3 steps in mobile layout
 stepContainers.forEach(container => {
 expect(container).toHaveClass('flex', 'items-start', 'gap-6');
 });
 });

 it('positions step numbers on the left in mobile layout', () => {
 render(<HowItWorksSection {...defaultProps} />);

 const mobileStepNumbers = document.querySelectorAll('.flex-shrink-0.w-16.h-16');
 
 expect(mobileStepNumbers.length).toBe(3); // 3 steps in mobile layout
 mobileStepNumbers.forEach(container => {
 expect(container).toHaveClass('flex-shrink-0', 'w-16', 'h-16');
 });
 });

 it('stacks content vertically in mobile layout', () => {
 render(<HowItWorksSection {...defaultProps} />);

 const contentContainers = document.querySelectorAll('.flex-1.pt-2');
 
 expect(contentContainers.length).toBe(3); // 3 steps in mobile layout
 contentContainers.forEach(container => {
 expect(container).toHaveClass('flex-1', 'pt-2');
 });
 });
 });

 describe('Desktop Layout (>= 1024px)', () => {
 beforeEach(() => {
 mockMatchMedia(true); // Simulate desktop viewport
 });

 it('displays desktop layout structure', () => {
 render(<HowItWorksSection {...defaultProps} />);

 const desktopContainer = document.querySelector('.hidden.lg\\:block');
 expect(desktopContainer).toBeInTheDocument();
 expect(desktopContainer).toHaveClass('hidden', 'lg:block');
 });

 it('uses horizontal grid layout', () => {
 render(<HowItWorksSection {...defaultProps} />);
 
 const gridContainer = document.querySelector('.grid.grid-cols-3');
 expect(gridContainer).toBeInTheDocument();
 expect(gridContainer).toHaveClass('grid', 'grid-cols-3', 'gap-8');
 });

 it('renders connecting line between steps', () => {
 render(<HowItWorksSection {...defaultProps} />);
 
 const connectingLine = document.querySelector('.absolute.top-8.left-8.right-8.h-0\\.5');
 
 expect(connectingLine).toBeInTheDocument();
 expect(connectingLine).toHaveClass(
 'absolute',
 'top-8',
 'left-8',
 'right-8',
 'h-0.5',
 'bg-gradient-to-r',
 'from-accent-pink',
 'to-accent-teal'
 );
 });

 it('centers step numbers above content in desktop layout', () => {
 render(<HowItWorksSection {...defaultProps} />);

 const desktopStepNumbers = document.querySelectorAll('.w-16.h-16.mx-auto.mb-6');
 
 expect(desktopStepNumbers.length).toBe(3); // 3 steps in desktop layout
 desktopStepNumbers.forEach(container => {
 expect(container).toHaveClass('w-16', 'h-16', 'mx-auto', 'mb-6');
 });
 });

 it('centers content in desktop layout', () => {
 render(<HowItWorksSection {...defaultProps} />);

 const desktopStepContainers = document.querySelectorAll('.text-center.group.cursor-pointer');
 
 expect(desktopStepContainers.length).toBe(3); // 3 steps in desktop layout
 desktopStepContainers.forEach(container => {
 expect(container).toHaveClass('text-center');
 });
 });

 it('positions step numbers with z-index for layering', () => {
 render(<HowItWorksSection {...defaultProps} />);
 
 const stepNumberContainers = document.querySelectorAll('.z-10');
 
 expect(stepNumberContainers.length).toBe(3); // 3 steps in desktop layout
 });
 });

 describe('Responsive Breakpoint Behavior', () => {
 it('hides mobile layout on large screens', () => {
 render(<HowItWorksSection {...defaultProps} />);
 
 const mobileContainer = document.querySelector('.lg\\:hidden');
 expect(mobileContainer).toHaveClass('lg:hidden');
 });

 it('hides desktop layout on small screens', () => {
 render(<HowItWorksSection {...defaultProps} />);
 
 const desktopContainer = document.querySelector('.hidden.lg\\:block');
 expect(desktopContainer).toHaveClass('hidden');
 });

 it('maintains consistent content across layouts', () => {
 render(<HowItWorksSection {...defaultProps} />);

 const stepTitles = screen.getAllByText('Upload Your Videos');
 expect(stepTitles.length).toBe(2); // One for mobile, one for desktop
 
 const stepDescriptions = screen.getAllByText(/Share your short-form content/);
 expect(stepDescriptions.length).toBe(2); // One for mobile, one for desktop
 });

 it('uses appropriate spacing for different screen sizes', () => {
 render(<HowItWorksSection {...defaultProps} />);

 const mobileContainer = document.querySelector('.space-y-8');
 expect(mobileContainer).toHaveClass('space-y-8');

 const desktopGrid = document.querySelector('.gap-8');
 expect(desktopGrid).toHaveClass('gap-8');
 });

 it('maintains accessibility across responsive layouts', () => {
 render(<HowItWorksSection {...defaultProps} />);

 const icons = screen.getAllByRole('img');
 expect(icons.length).toBe(6); // 3 steps × 2 layouts

 const uploadIcons = screen.getAllByLabelText('Upload Your Videos icon');
 expect(uploadIcons.length).toBe(2); // Mobile + desktop
 
 const priceIcons = screen.getAllByLabelText('Set Your Price icon');
 expect(priceIcons.length).toBe(2); // Mobile + desktop
 
 const earnIcons = screen.getAllByLabelText('Earn & Grow icon');
 expect(earnIcons.length).toBe(2); // Mobile + desktop
 });
 });

 describe('Container and Spacing Responsiveness', () => {
 it('uses appropriate container max-width', () => {
 render(<HowItWorksSection {...defaultProps} />);
 
 const maxWidthContainer = document.querySelector('.max-w-6xl');
 expect(maxWidthContainer).toBeInTheDocument();
 expect(maxWidthContainer).toHaveClass('max-w-6xl', 'mx-auto');
 });

 it('applies responsive section padding', () => {
 render(<HowItWorksSection {...defaultProps} />);
 
 const section = screen.getByRole('region');
 expect(section).toHaveClass('section-padding');
 });

 it('uses responsive header spacing', () => {
 render(<HowItWorksSection {...defaultProps} />);
 
 const headerContainer = document.querySelector('.mb-12.lg\\:mb-16');
 expect(headerContainer).toHaveClass('mb-12', 'lg:mb-16');
 });

 it('applies responsive CTA spacing', () => {
 render(<HowItWorksSection {...defaultProps} />);
 
 const ctaContainer = document.querySelector('.mt-12.lg\\:mt-16');
 expect(ctaContainer).toHaveClass('mt-12', 'lg:mt-16');
 });
 });
});