import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileErrorBoundary, ProfileComponentErrorBoundary } from '../ProfileErrorBoundary';

jest.mock('next/navigation', () => ({
 useRouter: () => ({
 push: jest.fn(),
 back: jest.fn(),
 }),
}));

jest.mock('next/link', () => {
 const MockLink = ({ children, href, ...props }: any) => (
 <a href={href} {...props}>
 {children}
 </a>
 );
 MockLink.displayName = 'MockLink';
 return MockLink;
});

function ThrowError({ shouldThrow = true }: { shouldThrow?: boolean }) {
 if (shouldThrow) {
 throw new Error('Test error');
 }
 return <div>No error</div>;
}

describe('ProfileErrorBoundary', () => {
 beforeEach(() => {

 jest.spyOn(console, 'error').mockImplementation(() => {});
 });

 afterEach(() => {
 jest.restoreAllMocks();
 });

 it('should render children when there is no error', () => {
 render(
 <ProfileErrorBoundary>
 <ThrowError shouldThrow={false} />
 </ProfileErrorBoundary>
 );

 expect(screen.getByText('No error')).toBeInTheDocument();
 });

 it('should render error UI when child component throws', () => {
 render(
 <ProfileErrorBoundary>
 <ThrowError shouldThrow={true} />
 </ProfileErrorBoundary>
 );

 expect(screen.getByText('Profile Temporarily Unavailable')).toBeInTheDocument();
 expect(screen.getByText(/We're having trouble loading your profile/)).toBeInTheDocument();
 });

 it('should show retry button and handle retry', async () => {
 render(
 <ProfileErrorBoundary>
 <ThrowError shouldThrow={true} />
 </ProfileErrorBoundary>
 );

 const retryButton = screen.getByText('Try Again');
 expect(retryButton).toBeInTheDocument();

 fireEvent.click(retryButton);

 await waitFor(() => {
 expect(screen.queryByText('Profile Temporarily Unavailable')).not.toBeInTheDocument();
 });
 });

 it('should show navigation links', () => {
 render(
 <ProfileErrorBoundary>
 <ThrowError shouldThrow={true} />
 </ProfileErrorBoundary>
 );

 expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
 expect(screen.getByText('Contact Support')).toBeInTheDocument();
 });

 it('should render custom fallback when provided', () => {
 const customFallback = <div>Custom error message</div>;

 render(
 <ProfileErrorBoundary fallback={customFallback}>
 <ThrowError shouldThrow={true} />
 </ProfileErrorBoundary>
 );

 expect(screen.getByText('Custom error message')).toBeInTheDocument();
 expect(screen.queryByText('Profile Temporarily Unavailable')).not.toBeInTheDocument();
 });

 it('should call onError callback when provided', () => {
 const onError = jest.fn();

 render(
 <ProfileErrorBoundary onError={onError}>
 <ThrowError shouldThrow={true} />
 </ProfileErrorBoundary>
 );

 expect(onError).toHaveBeenCalledWith(
 expect.any(Error),
 expect.objectContaining({
 componentStack: expect.any(String),
 })
 );
 });
});

describe('ProfileComponentErrorBoundary', () => {
 beforeEach(() => {
 jest.spyOn(console, 'error').mockImplementation(() => {});
 });

 afterEach(() => {
 jest.restoreAllMocks();
 });

 it('should render children when there is no error', () => {
 render(
 <ProfileComponentErrorBoundary componentName="Test Component">
 <ThrowError shouldThrow={false} />
 </ProfileComponentErrorBoundary>
 );

 expect(screen.getByText('No error')).toBeInTheDocument();
 });

 it('should render component-specific error UI', () => {
 render(
 <ProfileComponentErrorBoundary componentName="Test Component">
 <ThrowError shouldThrow={true} />
 </ProfileComponentErrorBoundary>
 );

 expect(screen.getByText('Test Component Unavailable')).toBeInTheDocument();
 expect(screen.getByText(/This section of your profile couldn't load/)).toBeInTheDocument();
 });

 it('should show refresh button when showRetry is true', () => {
 render(
 <ProfileComponentErrorBoundary componentName="Test Component" showRetry={true}>
 <ThrowError shouldThrow={true} />
 </ProfileComponentErrorBoundary>
 );

 expect(screen.getByText('Refresh Page')).toBeInTheDocument();
 });

 it('should not show refresh button when showRetry is false', () => {
 render(
 <ProfileComponentErrorBoundary componentName="Test Component" showRetry={false}>
 <ThrowError shouldThrow={true} />
 </ProfileComponentErrorBoundary>
 );

 expect(screen.queryByText('Refresh Page')).not.toBeInTheDocument();
 expect(screen.getByText(/Please contact support if this continues/)).toBeInTheDocument();
 });
});