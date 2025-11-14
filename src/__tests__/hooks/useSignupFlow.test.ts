import { renderHook, act, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSignupFlow } from '@/hooks/useSignupFlow';
import { SignupFlowProvider } from '@/contexts/SignupFlowContext';
import { useResponsive } from '@/hooks/useResponsive';
import React from 'react';

jest.mock('next/navigation', () => ({
 useRouter: jest.fn(),
}));

jest.mock('@/hooks/useResponsive', () => ({
 useResponsive: jest.fn(),
}));

global.fetch = jest.fn();

const mockRouter = {
 replace: jest.fn(),
 push: jest.fn(),
};

const mockResponsive = {
 isMobile: false,
 isTablet: false,
 isDesktop: true,
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
 React.createElement(SignupFlowProvider, null, children)
);

describe('useSignupFlow', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 (useRouter as jest.Mock).mockReturnValue(mockRouter);
 (useResponsive as jest.Mock).mockReturnValue(mockResponsive);
 (global.fetch as jest.Mock).mockClear();
 });

 afterEach(() => {
 jest.restoreAllMocks();
 });

 describe('Device Awareness', () => {
 it('updates device type when responsive values change', () => {
 const { result, rerender } = renderHook(() => useSignupFlow(), { wrapper });

 expect(result.current.isMobile).toBe(false);
 expect(result.current.isTablet).toBe(false);
 expect(result.current.isDesktop).toBe(true);

 (useResponsive as jest.Mock).mockReturnValue({
 isMobile: true,
 isTablet: false,
 isDesktop: false,
 });

 rerender();

 expect(result.current.isMobile).toBe(true);
 expect(result.current.isTablet).toBe(false);
 expect(result.current.isDesktop).toBe(false);
 });

 it('applies device-aware redirect delays', async () => {
 jest.useFakeTimers();

 (useResponsive as jest.Mock).mockReturnValue({
 isMobile: true,
 isTablet: false,
 isDesktop: false,
 });

 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 status: 200,
 json: async () => ({ id: '123', name: 'Test User', role: 'creator' }),
 });

 const { result } = renderHook(() => useSignupFlow(), { wrapper });

 await act(async () => {
 await result.current.checkProfile();
 });

 expect(result.current.step).toBe('complete');
 expect(mockRouter.replace).not.toHaveBeenCalled();

 act(() => {
 jest.advanceTimersByTime(1000);
 });

 expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');

 jest.useRealTimers();
 });

 it('applies different delays for desktop', async () => {
 jest.useFakeTimers();

 (useResponsive as jest.Mock).mockReturnValue({
 isMobile: false,
 isTablet: false,
 isDesktop: true,
 });

 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 status: 200,
 json: async () => ({ id: '123', name: 'Test User', role: 'creator' }),
 });

 const { result } = renderHook(() => useSignupFlow(), { wrapper });

 await act(async () => {
 await result.current.checkProfile();
 });

 expect(result.current.step).toBe('complete');
 expect(mockRouter.replace).not.toHaveBeenCalled();

 act(() => {
 jest.advanceTimersByTime(500);
 });

 expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');

 jest.useRealTimers();
 });
 });

 describe('Profile Checking', () => {
 it('handles successful profile check for existing user', async () => {
 const mockProfile = { id: '123', name: 'Test User', role: 'creator' };
 
 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 status: 200,
 json: async () => mockProfile,
 });

 const { result } = renderHook(() => useSignupFlow(), { wrapper });

 await act(async () => {
 await result.current.checkProfile();
 });

 expect(result.current.profileExists).toBe(true);
 expect(result.current.step).toBe('complete');
 expect(result.current.progress).toBe(100);
 });

 it('handles profile check for new user (404)', async () => {
 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 status: 404,
 });

 const { result } = renderHook(() => useSignupFlow(), { wrapper });

 await act(async () => {
 await result.current.checkProfile();
 });

 expect(result.current.profileExists).toBe(false);
 expect(result.current.step).toBe('role_selection');
 expect(result.current.progress).toBe(75);
 });

 it('handles network errors during profile check', async () => {
 (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

 const { result } = renderHook(() => useSignupFlow(), { wrapper });

 await act(async () => {
 await result.current.checkProfile();
 });

 expect(result.current.error).toEqual({
 type: 'unknown',
 message: 'Failed to check profile',
 retryable: true,
 });
 expect(result.current.isLoading).toBe(false);
 });

 it('handles API errors during profile check', async () => {
 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 status: 500,
 statusText: 'Internal Server Error',
 });

 const { result } = renderHook(() => useSignupFlow(), { wrapper });

 await act(async () => {
 await result.current.checkProfile();
 });

 expect(result.current.error).toEqual({
 type: 'unknown',
 message: 'Failed to check profile',
 retryable: true,
 });
 });

 it('cancels previous requests when new one is made', async () => {
 const abortSpy = jest.fn();
 const mockAbortController = {
 abort: abortSpy,
 signal: { aborted: false },
 };
 
 jest.spyOn(global, 'AbortController').mockImplementation(() => mockAbortController as any);

 (global.fetch as jest.Mock)
 .mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 1000)))
 .mockResolvedValueOnce({
 ok: false,
 status: 404,
 });

 const { result } = renderHook(() => useSignupFlow(), { wrapper });

 act(() => {
 result.current.checkProfile();
 });

 await act(async () => {
 await result.current.checkProfile();
 });

 expect(abortSpy).toHaveBeenCalled();
 });
 });

 describe('Role Selection', () => {
 it('handles role selection correctly', async () => {
 const { result } = renderHook(() => useSignupFlow(), { wrapper });

 await act(async () => {
 await result.current.selectRole('creator');
 });

 expect(result.current.selectedRole).toBe('creator');
 expect(result.current.step).toBe('profile_setup');
 expect(result.current.progress).toBe(80);
 });

 it('adds delay for mobile role selection', async () => {
 jest.useFakeTimers();
 
 (useResponsive as jest.Mock).mockReturnValue({
 isMobile: true,
 isTablet: false,
 isDesktop: false,
 });

 const { result } = renderHook(() => useSignupFlow(), { wrapper });

 const selectRolePromise = act(async () => {
 await result.current.selectRole('member');
 });

 act(() => {
 jest.advanceTimersByTime(300);
 });

 await selectRolePromise;

 expect(result.current.selectedRole).toBe('member');

 jest.useRealTimers();
 });
 });

 describe('Profile Setup', () => {
 it('handles successful profile setup', async () => {
 const profileData = { name: 'Test User', email: 'test@example.com' };
 const mockResponse = { id: '123', ...profileData, role: 'creator' };

 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 status: 200,
 json: async () => mockResponse,
 });

 const { result } = renderHook(() => useSignupFlow(), { wrapper });

 await act(async () => {
 await result.current.selectRole('creator');
 });

 await act(async () => {
 await result.current.setupProfile(profileData);
 });

 expect(result.current.step).toBe('complete');
 expect(result.current.progress).toBe(100);
 });

 it('requires role selection before profile setup', async () => {
 const { result } = renderHook(() => useSignupFlow(), { wrapper });

 await act(async () => {
 await result.current.setupProfile({ name: 'Test User' });
 });

 expect(result.current.error).toEqual({
 type: 'api',
 message: 'Please select a role first',
 retryable: false,
 });
 });

 it('handles profile setup errors', async () => {
 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 status: 400,
 statusText: 'Bad Request',
 });

 const { result } = renderHook(() => useSignupFlow(), { wrapper });

 await act(async () => {
 await result.current.selectRole('creator');
 });

 await act(async () => {
 await result.current.setupProfile({ name: 'Test User' });
 });

 expect(result.current.error).toEqual({
 type: 'unknown',
 message: 'Failed to create profile',
 retryable: true,
 });
 });
 });

 describe('Error Handling', () => {
 it('creates appropriate error types for different scenarios', async () => {
 const { result } = renderHook(() => useSignupFlow(), { wrapper });

 (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('fetch failed'));
 await act(async () => {
 await result.current.checkProfile();
 });
 expect(result.current.error?.type).toBe('network');

 (global.fetch as jest.Mock).mockRejectedValueOnce({ message: 'timeout' });
 await act(async () => {
 await result.current.checkProfile();
 });
 expect(result.current.error?.type).toBe('timeout');

 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 status: 409,
 });
 await act(async () => {
 await result.current.checkProfile();
 });
 expect(result.current.error?.type).toBe('profile_conflict');
 });

 it('handles manual error setting', () => {
 const { result } = renderHook(() => useSignupFlow(), { wrapper });

 const customError = {
 type: 'api' as const,
 message: 'Custom error',
 retryable: true,
 };

 act(() => {
 result.current.handleError(customError);
 });

 expect(result.current.error).toEqual(customError);
 expect(result.current.isLoading).toBe(false);
 });
 });

 describe('Retry Logic', () => {
 it('retries based on current step', async () => {
 const { result } = renderHook(() => useSignupFlow(), { wrapper });

 (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
 await act(async () => {
 await result.current.checkProfile();
 });

 expect(result.current.error).toBeTruthy();

 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: false,
 status: 404,
 });

 await act(async () => {
 result.current.retry();
 });

 expect(result.current.error).toBeNull();
 expect(result.current.step).toBe('role_selection');
 });

 it('does not retry when max retries reached', () => {
 const { result } = renderHook(() => useSignupFlow(), { wrapper });

 act(() => {
 for (let i = 0; i < 3; i++) {
 result.current.handleError({
 type: 'network',
 message: 'Network error',
 retryable: true,
 });
 }
 });

 expect(result.current.canRetry).toBe(false);

 const checkProfileSpy = jest.spyOn(result.current, 'checkProfile');
 act(() => {
 result.current.retry();
 });

 expect(checkProfileSpy).not.toHaveBeenCalled();
 });
 });

 describe('Flow Reset', () => {
 it('resets flow and cancels ongoing requests', () => {
 const abortSpy = jest.fn();
 const mockAbortController = {
 abort: abortSpy,
 signal: { aborted: false },
 };
 
 jest.spyOn(global, 'AbortController').mockImplementation(() => mockAbortController as any);

 const { result } = renderHook(() => useSignupFlow(), { wrapper });

 act(() => {
 result.current.checkProfile();
 });

 act(() => {
 result.current.resetFlow();
 });

 expect(abortSpy).toHaveBeenCalled();
 expect(result.current.step).toBe('checking');
 expect(result.current.isLoading).toBe(false);
 expect(result.current.error).toBeNull();
 });
 });

 describe('Cleanup', () => {
 it('cancels requests on unmount', () => {
 const abortSpy = jest.fn();
 const mockAbortController = {
 abort: abortSpy,
 signal: { aborted: false },
 };
 
 jest.spyOn(global, 'AbortController').mockImplementation(() => mockAbortController as any);

 const { result, unmount } = renderHook(() => useSignupFlow(), { wrapper });

 act(() => {
 result.current.checkProfile();
 });

 unmount();

 expect(abortSpy).toHaveBeenCalled();
 });
 });
});