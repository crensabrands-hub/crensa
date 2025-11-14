import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SignupFlowProvider } from '@/contexts/SignupFlowContext';
import ResponsiveSignupLoader from '@/components/auth/ResponsiveSignupLoader';
import { useSignupFlow } from '@/hooks/useSignupFlow';

jest.mock('next/navigation', () => ({
 useRouter: () => ({
 replace: jest.fn(),
 push: jest.fn(),
 }),
}));

jest.mock('@/hooks/useResponsive', () => ({
 useResponsive: jest.fn(),
}));

global.fetch = jest.fn();

const TestSignupComponent: React.FC = () => {
 const {
 step,
 isLoading,
 error,
 progress,
 shouldShowRetry,
 isMobile,
 isTablet,
 isDesktop,
 checkProfile,
 selectRole,
 setupProfile,
 retry,
 } = useSignupFlow();

 const handleStartFlow = () => {
 checkProfile();
 };

 const handleRoleSelect = (role: 'creator' | 'member') => {
 selectRole(role);
 };

 const handleProfileSetup = () => {
 setupProfile({ name: 'Test User', email: 'test@example.com' });
 };

 if (isLoading || step === 'checking' || step === 'finalizing') {
 return (
 <ResponsiveSignupLoader
 step={step}
 progress={progress}
 showRetry={shouldShowRetry}
 onRetry={retry}
 />
 );
 }

 if (error && !shouldShowRetry) {
 return (
 <div data-testid="error-screen">
 <h2>Error</h2>
 <p>{error.message}</p>
 </div>
 );
 }

 if (step === 'role_selection') {
 return (
 <div data-testid="role-selection" className={`role-selection ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
 <h2>Choose Your Role</h2>
 <button onClick={() => handleRoleSelect('creator')}>Creator</button>
 <button onClick={() => handleRoleSelect('member')}>Member</button>
 <div data-testid="device-info">
 Mobile: {isMobile.toString()}, Tablet: {isTablet.toString()}, Desktop: {isDesktop.toString()}
 </div>
 </div>
 );
 }

 if (step === 'profile_setup') {
 return (
 <div data-testid="profile-setup">
 <h2>Setup Profile</h2>
 <button onClick={handleProfileSetup}>Create Profile</button>
 </div>
 );
 }

 return (
 <div data-testid="start-screen">
 <button onClick={handleStartFlow}>Start Signup</button>
 </div>
 );
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
 <SignupFlowProvider>{children}</SignupFlowProvider>
);

describe('Responsive Signup Flow Integration', () => {
 const mockResponsive = require('@/hooks/useResponsive');

 beforeEach(() => {
 jest.clearAllMocks();
 (global.fetch as jest.Mock).mockClear();
 });

 describe('Mobile Viewport (320px - 767px)', () => {
 beforeEach(() => {
 mockResponsive.useResponsive.mockReturnValue({
 isMobile: true,
 isTablet: false,
 isDesktop: false,
 width: 375,
 height: 667,
 });

 Object.defineProperty(window, 'innerWidth', {
 writable: true,
 configurable: true,
 value: 375,
 });
 Object.defineProperty(window, 'innerHeight', {
 writable: true,
 configurable: true,
 value: 667,
 });
 });

 it('renders mobile-optimized signup flow', async () => {
 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 status: 404,
 });

 render(
 <TestWrapper>
 <TestSignupComponent />
 </TestWrapper>
 );

 fireEvent.click(screen.getByText('Start Signup'));

 await waitFor(() => {
 expect(screen.getByText('Welcome! Checking your account...')).toBeInTheDocument();
 });

 await waitFor(() => {
 expect(screen.getByTestId('role-selection')).toBeInTheDocument();
 });

 const roleSelection = screen.getByTestId('role-selection');
 expect(roleSelection).toHaveClass('mobile');

 expect(screen.getByTestId('device-info')).toHaveTextContent('Mobile: true, Tablet: false, Desktop: false');
 });

 it('handles mobile-specific loading states and delays', async () => {
 jest.useFakeTimers();

 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 status: 200,
 json: async () => ({ id: '123', name: 'Test User', role: 'creator' }),
 });

 render(
 <TestWrapper>
 <TestSignupComponent />
 </TestWrapper>
 );

 fireEvent.click(screen.getByText('Start Signup'));

 await waitFor(() => {
 expect(screen.getByText('Welcome to the platform!')).toBeInTheDocument();
 });

 act(() => {
 jest.advanceTimersByTime(500); // Desktop delay
 });

 expect(screen.getByText('Welcome to the platform!')).toBeInTheDocument();

 act(() => {
 jest.advanceTimersByTime(500); // Complete mobile delay (1000ms total)
 });

 jest.useRealTimers();
 });

 it('shows mobile-optimized error recovery', async () => {
 (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

 render(
 <TestWrapper>
 <TestSignupComponent />
 </TestWrapper>
 );

 fireEvent.click(screen.getByText('Start Signup'));

 await waitFor(() => {
 expect(screen.getByText('Try Again')).toBeInTheDocument();
 });

 const retryButton = screen.getByText('Try Again');
 expect(retryButton).toHaveClass('w-full'); // Full width on mobile
 });
 });

 describe('Tablet Viewport (768px - 1023px)', () => {
 beforeEach(() => {
 mockResponsive.useResponsive.mockReturnValue({
 isMobile: false,
 isTablet: true,
 isDesktop: false,
 width: 768,
 height: 1024,
 });

 Object.defineProperty(window, 'innerWidth', {
 writable: true,
 configurable: true,
 value: 768,
 });
 });

 it('renders tablet-optimized signup flow', async () => {
 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 status: 404,
 });

 render(
 <TestWrapper>
 <TestSignupComponent />
 </TestWrapper>
 );

 fireEvent.click(screen.getByText('Start Signup'));

 await waitFor(() => {
 expect(screen.getByTestId('role-selection')).toBeInTheDocument();
 });

 const roleSelection = screen.getByTestId('role-selection');
 expect(roleSelection).toHaveClass('tablet');

 expect(screen.getByTestId('device-info')).toHaveTextContent('Mobile: false, Tablet: true, Desktop: false');
 });

 it('uses appropriate spacing for tablet', () => {
 render(
 <TestWrapper>
 <ResponsiveSignupLoader step="checking" />
 </TestWrapper>
 );

 const container = screen.getByText('Welcome! Checking your account...').closest('div');
 expect(container).toHaveClass('sm:p-8'); // Larger padding on tablet
 });
 });

 describe('Desktop Viewport (1024px+)', () => {
 beforeEach(() => {
 mockResponsive.useResponsive.mockReturnValue({
 isMobile: false,
 isTablet: false,
 isDesktop: true,
 width: 1200,
 height: 800,
 });

 Object.defineProperty(window, 'innerWidth', {
 writable: true,
 configurable: true,
 value: 1200,
 });
 });

 it('renders desktop-optimized signup flow', async () => {
 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 status: 404,
 });

 render(
 <TestWrapper>
 <TestSignupComponent />
 </TestWrapper>
 );

 fireEvent.click(screen.getByText('Start Signup'));

 await waitFor(() => {
 expect(screen.getByTestId('role-selection')).toBeInTheDocument();
 });

 const roleSelection = screen.getByTestId('role-selection');
 expect(roleSelection).toHaveClass('desktop');

 expect(screen.getByTestId('device-info')).toHaveTextContent('Mobile: false, Tablet: false, Desktop: true');
 });

 it('uses faster redirect delays on desktop', async () => {
 jest.useFakeTimers();

 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 status: 200,
 json: async () => ({ id: '123', name: 'Test User', role: 'creator' }),
 });

 render(
 <TestWrapper>
 <TestSignupComponent />
 </TestWrapper>
 );

 fireEvent.click(screen.getByText('Start Signup'));

 await waitFor(() => {
 expect(screen.getByText('Welcome to the platform!')).toBeInTheDocument();
 });

 act(() => {
 jest.advanceTimersByTime(500);
 });

 jest.useRealTimers();
 });

 it('shows desktop-optimized retry button', async () => {
 (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

 render(
 <TestWrapper>
 <TestSignupComponent />
 </TestWrapper>
 );

 fireEvent.click(screen.getByText('Start Signup'));

 await waitFor(() => {
 expect(screen.getByText('Try Again')).toBeInTheDocument();
 });

 const retryButton = screen.getByText('Try Again');
 expect(retryButton).toHaveClass('sm:w-auto'); // Auto width on desktop
 });
 });

 describe('Responsive Breakpoint Transitions', () => {
 it('adapts when viewport changes from mobile to desktop', async () => {

 mockResponsive.useResponsive.mockReturnValue({
 isMobile: true,
 isTablet: false,
 isDesktop: false,
 });

 const { rerender } = render(
 <TestWrapper>
 <TestSignupComponent />
 </TestWrapper>
 );

 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 status: 404,
 });

 fireEvent.click(screen.getByText('Start Signup'));

 await waitFor(() => {
 expect(screen.getByTestId('role-selection')).toBeInTheDocument();
 });

 expect(screen.getByTestId('role-selection')).toHaveClass('mobile');

 mockResponsive.useResponsive.mockReturnValue({
 isMobile: false,
 isTablet: false,
 isDesktop: true,
 });

 rerender(
 <TestWrapper>
 <TestSignupComponent />
 </TestWrapper>
 );

 await waitFor(() => {
 expect(screen.getByTestId('role-selection')).toHaveClass('desktop');
 });
 });
 });

 describe('Complete Flow Integration', () => {
 it('completes entire signup flow with device-aware behavior', async () => {
 jest.useFakeTimers();

 mockResponsive.useResponsive.mockReturnValue({
 isMobile: true,
 isTablet: false,
 isDesktop: false,
 });

 (global.fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: false,
 status: 404, // No existing profile
 })
 .mockResolvedValueOnce({
 ok: true,
 status: 200,
 json: async () => ({ id: '123', name: 'Test User', role: 'creator' }),
 });

 render(
 <TestWrapper>
 <TestSignupComponent />
 </TestWrapper>
 );

 fireEvent.click(screen.getByText('Start Signup'));

 await waitFor(() => {
 expect(screen.getByText('Welcome! Checking your account...')).toBeInTheDocument();
 });

 await waitFor(() => {
 expect(screen.getByTestId('role-selection')).toBeInTheDocument();
 });

 fireEvent.click(screen.getByText('Creator'));

 await waitFor(() => {
 expect(screen.getByTestId('profile-setup')).toBeInTheDocument();
 });

 fireEvent.click(screen.getByText('Create Profile'));

 await waitFor(() => {
 expect(screen.getByText('Almost ready...')).toBeInTheDocument();
 });

 await waitFor(() => {
 expect(screen.getByText('Welcome to the platform!')).toBeInTheDocument();
 });

 jest.useRealTimers();
 });
 });

 describe('Error Handling Across Devices', () => {
 it('handles network errors consistently across all devices', async () => {
 const devices = [
 { isMobile: true, isTablet: false, isDesktop: false },
 { isMobile: false, isTablet: true, isDesktop: false },
 { isMobile: false, isTablet: false, isDesktop: true },
 ];

 for (const device of devices) {
 mockResponsive.useResponsive.mockReturnValue(device);

 (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

 const { unmount } = render(
 <TestWrapper>
 <TestSignupComponent />
 </TestWrapper>
 );

 fireEvent.click(screen.getByText('Start Signup'));

 await waitFor(() => {
 expect(screen.getByText('Try Again')).toBeInTheDocument();
 });

 expect(screen.getByText('Network connection failed. Please check your internet connection.')).toBeInTheDocument();

 unmount();
 }
 });
 });
});