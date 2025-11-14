import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveSignupLoader from '@/components/auth/ResponsiveSignupLoader';

jest.mock('lucide-react', () => ({
 Loader2: ({ className }: { className: string }) => (
 <div data-testid="loader-icon" className={className}>Loading...</div>
 ),
}));

describe('ResponsiveSignupLoader', () => {
 const defaultProps = {
 step: 'checking' as const,
 progress: 0,
 };

 beforeEach(() => {

 Object.defineProperty(window, 'innerWidth', {
 writable: true,
 configurable: true,
 value: 1024,
 });
 Object.defineProperty(window, 'innerHeight', {
 writable: true,
 configurable: true,
 value: 768,
 });
 });

 describe('Responsive Design', () => {
 it('renders correctly on mobile viewport (320px)', () => {
 Object.defineProperty(window, 'innerWidth', {
 writable: true,
 configurable: true,
 value: 320,
 });

 render(<ResponsiveSignupLoader {...defaultProps} />);
 
 const container = screen.getByText('Welcome! Checking your account...').closest('div');
 expect(container).toHaveClass('bg-white', 'rounded-2xl', 'shadow-xl');

 expect(container).toHaveClass('p-6');
 });

 it('renders correctly on tablet viewport (768px)', () => {
 Object.defineProperty(window, 'innerWidth', {
 writable: true,
 configurable: true,
 value: 768,
 });

 render(<ResponsiveSignupLoader {...defaultProps} />);
 
 const container = screen.getByText('Welcome! Checking your account...').closest('div');
 expect(container).toHaveClass('sm:p-8');
 });

 it('renders correctly on desktop viewport (1024px+)', () => {
 Object.defineProperty(window, 'innerWidth', {
 writable: true,
 configurable: true,
 value: 1200,
 });

 render(<ResponsiveSignupLoader {...defaultProps} />);
 
 const heading = screen.getByText('Welcome! Checking your account...');
 expect(heading).toHaveClass('sm:text-xl');
 });

 it('adapts loader size based on viewport', () => {
 const { rerender } = render(<ResponsiveSignupLoader {...defaultProps} />);
 
 const loaderIcon = screen.getByTestId('loader-icon');
 expect(loaderIcon).toHaveClass('w-full', 'h-full');

 const loaderContainer = loaderIcon.parentElement;
 expect(loaderContainer).toHaveClass('w-16', 'h-16', 'sm:w-20', 'sm:h-20');
 });
 });

 describe('Step Messages', () => {
 it('displays correct message for each step', () => {
 const steps = [
 { step: 'checking', message: 'Welcome! Checking your account...' },
 { step: 'role_selection', message: 'Choose your role to continue' },
 { step: 'profile_setup', message: 'Setting up your profile...' },
 { step: 'finalizing', message: 'Almost ready...' },
 { step: 'complete', message: 'Welcome to the platform!' },
 ] as const;

 steps.forEach(({ step, message }) => {
 const { rerender } = render(<ResponsiveSignupLoader step={step} />);
 expect(screen.getByText(message)).toBeInTheDocument();
 rerender(<div />);
 });
 });

 it('displays custom message when provided', () => {
 const customMessage = 'Custom loading message';
 render(<ResponsiveSignupLoader {...defaultProps} message={customMessage} />);
 
 expect(screen.getByText(customMessage)).toBeInTheDocument();
 expect(screen.queryByText('Welcome! Checking your account...')).not.toBeInTheDocument();
 });
 });

 describe('Progress Indicator', () => {
 it('shows progress bar when progress > 0', () => {
 render(<ResponsiveSignupLoader {...defaultProps} progress={50} />);
 
 const progressBar = screen.getByRole('progressbar', { hidden: true });
 expect(progressBar).toBeInTheDocument();
 expect(progressBar).toHaveStyle('width: 50%');
 });

 it('shows progress percentage in loader icon', () => {
 render(<ResponsiveSignupLoader {...defaultProps} progress={75} />);
 
 expect(screen.getByText('75%')).toBeInTheDocument();
 });

 it('hides progress bar when progress is 0', () => {
 render(<ResponsiveSignupLoader {...defaultProps} progress={0} />);
 
 const progressBar = screen.queryByRole('progressbar', { hidden: true });
 expect(progressBar).not.toBeInTheDocument();
 });

 it('clamps progress between 0 and 100', () => {
 const { rerender } = render(<ResponsiveSignupLoader {...defaultProps} progress={150} />);
 expect(screen.getByText('100%')).toBeInTheDocument();
 
 rerender(<ResponsiveSignupLoader {...defaultProps} progress={-10} />);
 expect(screen.queryByText('-10%')).not.toBeInTheDocument();
 });
 });

 describe('Retry Functionality', () => {
 it('shows retry button when showRetry is true', () => {
 const onRetry = jest.fn();
 render(<ResponsiveSignupLoader {...defaultProps} showRetry={true} onRetry={onRetry} />);
 
 const retryButton = screen.getByRole('button', { name: /try again/i });
 expect(retryButton).toBeInTheDocument();
 });

 it('calls onRetry when retry button is clicked', () => {
 const onRetry = jest.fn();
 render(<ResponsiveSignupLoader {...defaultProps} showRetry={true} onRetry={onRetry} />);
 
 const retryButton = screen.getByRole('button', { name: /try again/i });
 fireEvent.click(retryButton);
 
 expect(onRetry).toHaveBeenCalledTimes(1);
 });

 it('hides retry button when showRetry is false', () => {
 render(<ResponsiveSignupLoader {...defaultProps} showRetry={false} />);
 
 const retryButton = screen.queryByRole('button', { name: /try again/i });
 expect(retryButton).not.toBeInTheDocument();
 });

 it('has responsive button styling', () => {
 const onRetry = jest.fn();
 render(<ResponsiveSignupLoader {...defaultProps} showRetry={true} onRetry={onRetry} />);
 
 const retryButton = screen.getByRole('button', { name: /try again/i });
 expect(retryButton).toHaveClass('w-full', 'sm:w-auto');
 });
 });

 describe('Accessibility', () => {
 it('has proper heading structure', () => {
 render(<ResponsiveSignupLoader {...defaultProps} />);
 
 const heading = screen.getByRole('heading', { level: 2 });
 expect(heading).toBeInTheDocument();
 expect(heading).toHaveTextContent('Welcome! Checking your account...');
 });

 it('has descriptive text for screen readers', () => {
 render(<ResponsiveSignupLoader {...defaultProps} />);
 
 expect(screen.getByText('This will only take a moment')).toBeInTheDocument();
 expect(screen.getByText('Having trouble? Make sure you have a stable internet connection.')).toBeInTheDocument();
 });

 it('retry button has proper focus styles', () => {
 const onRetry = jest.fn();
 render(<ResponsiveSignupLoader {...defaultProps} showRetry={true} onRetry={onRetry} />);
 
 const retryButton = screen.getByRole('button', { name: /try again/i });
 expect(retryButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500', 'focus:ring-offset-2');
 });
 });

 describe('Touch-Friendly Design', () => {
 it('has appropriate touch targets for mobile', () => {
 render(<ResponsiveSignupLoader {...defaultProps} showRetry={true} onRetry={jest.fn()} />);
 
 const retryButton = screen.getByRole('button', { name: /try again/i });
 expect(retryButton).toHaveClass('px-6', 'py-3'); // Minimum 44px touch target
 });

 it('has mobile-optimized spacing', () => {
 render(<ResponsiveSignupLoader {...defaultProps} />);
 
 const container = screen.getByText('Welcome! Checking your account...').closest('div');
 expect(container).toHaveClass('p-6', 'sm:p-8');
 });
 });
});