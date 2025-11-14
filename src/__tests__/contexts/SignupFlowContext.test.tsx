import React from 'react';
import { render, screen, act, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
 SignupFlowProvider,
 useSignupFlowContext,
 SignupFlowState,
 SignupError,
 UserRole
} from '@/contexts/SignupFlowContext';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
 <SignupFlowProvider>{children}</SignupFlowProvider>
);

const TestComponent: React.FC = () => {
 const context = useSignupFlowContext();
 return (
 <div>
 <div data-testid="step">{context.state.step}</div>
 <div data-testid="loading">{context.state.isLoading.toString()}</div>
 <div data-testid="progress">{context.state.progress}</div>
 <div data-testid="can-retry">{context.canRetry.toString()}</div>
 <div data-testid="should-show-retry">{context.shouldShowRetry?.toString() || 'false'}</div>
 <button onClick={() => context.setStep('role_selection')}>Set Role Selection</button>
 <button onClick={() => context.setLoading(true)}>Set Loading</button>
 <button onClick={() => context.setProgress(50)}>Set Progress</button>
 <button onClick={() => context.incrementRetry()}>Increment Retry</button>
 <button onClick={() => context.resetState()}>Reset State</button>
 </div>
 );
};

describe('SignupFlowContext', () => {
 describe('Provider', () => {
 it('provides initial state correctly', () => {
 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 expect(screen.getByTestId('step')).toHaveTextContent('checking');
 expect(screen.getByTestId('loading')).toHaveTextContent('false');
 expect(screen.getByTestId('progress')).toHaveTextContent('0');
 expect(screen.getByTestId('can-retry')).toHaveTextContent('true');
 expect(screen.getByTestId('should-show-retry')).toHaveTextContent('false');
 });

 it('throws error when used outside provider', () => {

 const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
 
 expect(() => {
 render(<TestComponent />);
 }).toThrow('useSignupFlowContext must be used within a SignupFlowProvider');
 
 consoleSpy.mockRestore();
 });
 });

 describe('State Management', () => {
 it('updates step correctly', () => {
 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 act(() => {
 screen.getByText('Set Role Selection').click();
 });

 expect(screen.getByTestId('step')).toHaveTextContent('role_selection');
 });

 it('updates loading state correctly', () => {
 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 act(() => {
 screen.getByText('Set Loading').click();
 });

 expect(screen.getByTestId('loading')).toHaveTextContent('true');
 });

 it('updates progress correctly and clamps values', () => {
 const { result } = renderHook(() => useSignupFlowContext(), {
 wrapper: TestWrapper,
 });

 act(() => {
 result.current.setProgress(50);
 });
 expect(result.current.state.progress).toBe(50);

 act(() => {
 result.current.setProgress(150);
 });
 expect(result.current.state.progress).toBe(100);

 act(() => {
 result.current.setProgress(-10);
 });
 expect(result.current.state.progress).toBe(0);
 });

 it('manages error state correctly', () => {
 const { result } = renderHook(() => useSignupFlowContext(), {
 wrapper: TestWrapper,
 });

 const error: SignupError = {
 type: 'network',
 message: 'Network error',
 retryable: true
 };

 act(() => {
 result.current.setError(error);
 });

 expect(result.current.state.error).toEqual(error);
 expect(result.current.state.isLoading).toBe(false);
 });

 it('manages profile data correctly', () => {
 const { result } = renderHook(() => useSignupFlowContext(), {
 wrapper: TestWrapper,
 });

 const profileData = {
 id: '123',
 email: 'test@example.com',
 name: 'Test User',
 role: 'creator' as UserRole
 };

 act(() => {
 result.current.setProfileData(profileData);
 });

 expect(result.current.state.profileData).toEqual(profileData);
 });

 it('manages selected role correctly', () => {
 const { result } = renderHook(() => useSignupFlowContext(), {
 wrapper: TestWrapper,
 });

 act(() => {
 result.current.setSelectedRole('creator');
 });

 expect(result.current.state.selectedRole).toBe('creator');

 act(() => {
 result.current.setSelectedRole('member');
 });

 expect(result.current.state.selectedRole).toBe('member');
 });

 it('manages device type correctly', () => {
 const { result } = renderHook(() => useSignupFlowContext(), {
 wrapper: TestWrapper,
 });

 const deviceInfo = {
 isMobile: true,
 isTablet: false,
 isDesktop: false
 };

 act(() => {
 result.current.setDeviceType(deviceInfo);
 });

 expect(result.current.state.isMobile).toBe(true);
 expect(result.current.state.isTablet).toBe(false);
 expect(result.current.state.isDesktop).toBe(false);
 });
 });

 describe('Retry Logic', () => {
 it('manages retry count correctly', () => {
 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 expect(screen.getByTestId('can-retry')).toHaveTextContent('true');

 act(() => {
 screen.getByText('Increment Retry').click();
 });

 expect(screen.getByTestId('can-retry')).toHaveTextContent('true');

 act(() => {
 screen.getByText('Increment Retry').click();
 screen.getByText('Increment Retry').click();
 });

 expect(screen.getByTestId('can-retry')).toHaveTextContent('false');
 });

 it('shows retry button only for retryable errors within retry limit', () => {
 const { result } = renderHook(() => useSignupFlowContext(), {
 wrapper: TestWrapper,
 });

 expect(result.current.shouldShowRetry).toBe(false);

 act(() => {
 result.current.setError({
 type: 'network',
 message: 'Network error',
 retryable: true
 });
 });
 expect(result.current.shouldShowRetry).toBe(true);

 act(() => {
 result.current.setError({
 type: 'profile_conflict',
 message: 'Profile exists',
 retryable: false
 });
 });
 expect(result.current.shouldShowRetry).toBe(false);

 act(() => {
 result.current.setError({
 type: 'network',
 message: 'Network error',
 retryable: true
 });
 result.current.incrementRetry();
 result.current.incrementRetry();
 result.current.incrementRetry();
 });
 expect(result.current.shouldShowRetry).toBe(false);
 });

 it('resets retry count correctly', () => {
 const { result } = renderHook(() => useSignupFlowContext(), {
 wrapper: TestWrapper,
 });

 act(() => {
 result.current.incrementRetry();
 result.current.incrementRetry();
 });

 expect(result.current.state.retryCount).toBe(2);

 act(() => {
 result.current.resetRetry();
 });

 expect(result.current.state.retryCount).toBe(0);
 });
 });

 describe('State Reset', () => {
 it('resets all state to initial values', () => {
 render(
 <TestWrapper>
 <TestComponent />
 </TestWrapper>
 );

 act(() => {
 screen.getByText('Set Role Selection').click();
 screen.getByText('Set Loading').click();
 screen.getByText('Set Progress').click();
 screen.getByText('Increment Retry').click();
 });

 expect(screen.getByTestId('step')).toHaveTextContent('role_selection');
 expect(screen.getByTestId('loading')).toHaveTextContent('true');
 expect(screen.getByTestId('progress')).toHaveTextContent('50');

 act(() => {
 screen.getByText('Reset State').click();
 });

 expect(screen.getByTestId('step')).toHaveTextContent('checking');
 expect(screen.getByTestId('loading')).toHaveTextContent('false');
 expect(screen.getByTestId('progress')).toHaveTextContent('0');
 expect(screen.getByTestId('can-retry')).toHaveTextContent('true');
 });
 });

 describe('Error Types', () => {
 it('handles different error types correctly', () => {
 const { result } = renderHook(() => useSignupFlowContext(), {
 wrapper: TestWrapper,
 });

 const errorTypes: SignupError[] = [
 { type: 'network', message: 'Network error', retryable: true },
 { type: 'profile_conflict', message: 'Profile conflict', retryable: false },
 { type: 'timeout', message: 'Timeout error', retryable: true },
 { type: 'api', message: 'API error', retryable: false },
 { type: 'unknown', message: 'Unknown error', retryable: true }
 ];

 errorTypes.forEach(error => {
 act(() => {
 result.current.setError(error);
 });

 expect(result.current.state.error).toEqual(error);
 expect(result.current.shouldShowRetry).toBe(error.retryable);
 });
 });
 });

 describe('Computed Properties', () => {
 it('calculates canRetry correctly based on retry count', () => {
 const { result } = renderHook(() => useSignupFlowContext(), {
 wrapper: TestWrapper,
 });

 expect(result.current.canRetry).toBe(true);

 act(() => {
 result.current.incrementRetry();
 result.current.incrementRetry();
 result.current.incrementRetry();
 });

 expect(result.current.canRetry).toBe(false);
 });

 it('calculates shouldShowRetry correctly', () => {
 const { result } = renderHook(() => useSignupFlowContext(), {
 wrapper: TestWrapper,
 });

 expect(result.current.shouldShowRetry).toBe(false);

 act(() => {
 result.current.setError({
 type: 'network',
 message: 'Network error',
 retryable: true
 });
 });
 expect(result.current.shouldShowRetry).toBe(true);

 act(() => {
 result.current.incrementRetry();
 result.current.incrementRetry();
 result.current.incrementRetry();
 });
 expect(result.current.shouldShowRetry).toBe(false);
 });
 });
});