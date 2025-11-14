import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HowItWorksSection } from '../HowItWorksSection';
import { FeatureItem } from '@/types';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
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
 div: ({ children, whileHover, variants, initial, animate, transition, style, ...props }: any) => <div {...props} style={style}>{children}</div>,
 section: ({ children, variants, initial, animate, ...props }: any) => <section {...props}>{children}</section>,
 button: ({ children, whileHover, whileTap, transition, ...props }: any) => <button {...props}>{children}</button>,
 },
 useReducedMotion: () => false,
 useInView: () => true,
}));

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

describe('HowItWorksSection', () => {
 const defaultProps = {
 title: 'How It Works',
 steps: mockSteps,
 };

 beforeEach(() => {

 jest.clearAllMocks();
 });

 it('renders the section with title', () => {
 render(<HowItWorksSection {...defaultProps} />);
 
 expect(screen.getByText('How It Works')).toBeInTheDocument();
 expect(screen.getByText('Get started in three simple steps and begin monetizing your content today')).toBeInTheDocument();
 });

 it('renders all step items correctly', () => {
 render(<HowItWorksSection {...defaultProps} />);

 expect(screen.getAllByText('Upload Your Videos')).toHaveLength(2);
 expect(screen.getAllByText('Set Your Price')).toHaveLength(2);
 expect(screen.getAllByText('Earn & Grow')).toHaveLength(2);

 expect(screen.getAllByText(/Share your short-form content/)).toHaveLength(2);
 expect(screen.getAllByText(/Choose how many credits viewers/)).toHaveLength(2);
 expect(screen.getAllByText(/Get paid when viewers watch/)).toHaveLength(2);

 expect(screen.getAllByText('📱')).toHaveLength(2);
 expect(screen.getAllByText('💳')).toHaveLength(2);
 expect(screen.getAllByText('🎉')).toHaveLength(2);
 });

 it('renders step numbers correctly', () => {
 render(<HowItWorksSection {...defaultProps} />);

 expect(screen.getAllByText('1')).toHaveLength(2);
 expect(screen.getAllByText('2')).toHaveLength(2);
 expect(screen.getAllByText('3')).toHaveLength(2);
 });

 it('applies custom className when provided', () => {
 const customClass = 'custom-test-class';
 render(<HowItWorksSection {...defaultProps} className={customClass} />);
 
 const section = screen.getByRole('region', { name: 'How It Works' });
 expect(section).toHaveClass(customClass);
 });

 it('has proper accessibility attributes', () => {
 render(<HowItWorksSection {...defaultProps} />);

 const section = screen.getByRole('region', { name: 'How It Works' });
 expect(section).toBeInTheDocument();

 const icons = screen.getAllByRole('img');
 expect(icons).toHaveLength(6); // 3 icons x 2 layouts (mobile + desktop)

 expect(icons[0]).toHaveAttribute('aria-label', 'Upload Your Videos icon');
 expect(icons[1]).toHaveAttribute('aria-label', 'Set Your Price icon');
 expect(icons[2]).toHaveAttribute('aria-label', 'Earn & Grow icon');
 });

 it('renders mobile layout with vertical structure', () => {
 render(<HowItWorksSection {...defaultProps} />);

 const mobileContainer = document.querySelector('.block.lg\\:hidden');
 expect(mobileContainer).toBeInTheDocument();
 expect(mobileContainer).toHaveClass('space-y-8');
 });

 it('renders desktop layout with horizontal structure', () => {
 render(<HowItWorksSection {...defaultProps} />);

 const desktopContainer = document.querySelector('.hidden.lg\\:block');
 expect(desktopContainer).toBeInTheDocument();

 const gridContainer = desktopContainer?.querySelector('.grid.grid-cols-3');
 expect(gridContainer).toBeInTheDocument();
 });

 it('renders connecting line in desktop layout', () => {
 render(<HowItWorksSection {...defaultProps} />);

 const desktopContainer = document.querySelector('.hidden.lg\\:block');
 const connectingLine = desktopContainer?.querySelector('.absolute.top-8.left-8.right-8');
 expect(connectingLine).toBeInTheDocument();
 expect(connectingLine).toHaveClass('bg-gradient-to-r', 'from-accent-pink', 'to-accent-teal');
 });

 it('renders call-to-action button', () => {
 render(<HowItWorksSection {...defaultProps} />);
 
 const ctaButton = screen.getByRole('button', { name: 'Get Started Now' });
 expect(ctaButton).toBeInTheDocument();
 expect(ctaButton).toHaveClass('btn-primary');
 });

 it('handles empty steps array gracefully', () => {
 const propsWithEmptySteps = {
 title: 'How It Works',
 steps: [],
 };
 
 render(<HowItWorksSection {...propsWithEmptySteps} />);
 
 expect(screen.getByText('How It Works')).toBeInTheDocument();
 expect(screen.queryByText('Upload Your Videos')).not.toBeInTheDocument();
 });

 it('renders steps in correct order', () => {
 render(<HowItWorksSection {...defaultProps} />);

 const mobileStepTitles = screen.getAllByRole('heading', { level: 3 });
 expect(mobileStepTitles[0]).toHaveTextContent('Upload Your Videos');
 expect(mobileStepTitles[1]).toHaveTextContent('Set Your Price');
 expect(mobileStepTitles[2]).toHaveTextContent('Earn & Grow');
 });

 it('has proper semantic structure', () => {
 render(<HowItWorksSection {...defaultProps} />);

 const mainHeading = screen.getByRole('heading', { level: 2 });
 expect(mainHeading).toHaveTextContent('How It Works');

 const stepHeadings = screen.getAllByRole('heading', { level: 3 });
 expect(stepHeadings.length).toBeGreaterThanOrEqual(3);
 });

 it('applies correct styling classes', () => {
 render(<HowItWorksSection {...defaultProps} />);
 
 const section = screen.getByRole('region');
 expect(section).toHaveClass('section-padding', 'bg-neutral-gray');
 
 const container = section.querySelector('.container');
 expect(container).toBeInTheDocument();
 
 const headerDiv = screen.getByText('How It Works').closest('div');
 expect(headerDiv).toHaveClass('text-center', 'mb-12', 'lg:mb-16');
 });

 it('renders step number circles with proper styling', () => {
 render(<HowItWorksSection {...defaultProps} />);

 const stepNumbers = screen.getAllByText('1');
 expect(stepNumbers.length).toBeGreaterThan(0);
 
 stepNumbers.forEach(numberElement => {
 const container = numberElement.closest('div');
 expect(container).toHaveClass(
 'rounded-full',
 'bg-gradient-to-br',
 'from-accent-pink',
 'to-accent-teal'
 );
 });
 });

 it('handles single step correctly', () => {
 const singleStepProps = {
 title: 'How It Works',
 steps: [mockSteps[0]],
 };
 
 render(<HowItWorksSection {...singleStepProps} />);
 
 expect(screen.getAllByText('Upload Your Videos')).toHaveLength(2); // Mobile + desktop
 expect(screen.getAllByText('1')).toHaveLength(2); // Mobile + desktop
 expect(screen.queryByText('2')).not.toBeInTheDocument();
 });

 it('renders with maximum width container', () => {
 render(<HowItWorksSection {...defaultProps} />);
 
 const maxWidthContainer = document.querySelector('.max-w-6xl');
 expect(maxWidthContainer).toBeInTheDocument();
 expect(maxWidthContainer).toHaveClass('mx-auto');
 });

 it('has proper responsive classes for mobile layout', () => {
 render(<HowItWorksSection {...defaultProps} />);

 const mobileLayout = document.querySelector('.block.lg\\:hidden');
 expect(mobileLayout).toBeInTheDocument();
 expect(mobileLayout).toHaveClass('block', 'lg:hidden', 'space-y-8');
 });

 it('has proper responsive classes for desktop layout', () => {
 render(<HowItWorksSection {...defaultProps} />);

 const desktopLayout = document.querySelector('.hidden.lg\\:block');
 expect(desktopLayout).toBeInTheDocument();
 expect(desktopLayout).toHaveClass('hidden', 'lg:block');
 });
});