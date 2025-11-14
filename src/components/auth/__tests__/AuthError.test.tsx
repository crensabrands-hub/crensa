import { render, screen, fireEvent } from '@testing-library/react';
import { AuthError } from '../AuthError';
import type { AuthError as AuthErrorType } from '@/contexts/AuthContext';

describe('AuthError', () => {
 const mockRetry = jest.fn();
 const mockDismiss = jest.fn();

 beforeEach(() => {
 jest.clearAllMocks();
 });

 it('should render network error correctly', () => {
 const error: AuthErrorType = {
 type: 'network',
 message: 'Network connection failed',
 retryable: true,
 };

 render(<AuthError error={error} onRetry={mockRetry} onDismiss={mockDismiss} />);

 expect(screen.getByText('Connection Error')).toBeInTheDocument();
 expect(screen.getByText('Network connection failed')).toBeInTheDocument();
 expect(screen.getByText('Try again')).toBeInTheDocument();
 expect(screen.getByText('Dismiss')).toBeInTheDocument();
 });

 it('should render unauthorized error correctly', () => {
 const error: AuthErrorType = {
 type: 'unauthorized',
 message: 'Authentication required',
 retryable: false,
 };

 render(<AuthError error={error} onDismiss={mockDismiss} />);

 expect(screen.getByText('Authentication Required')).toBeInTheDocument();
 expect(screen.getByText('Authentication required')).toBeInTheDocument();
 expect(screen.queryByText('Try again')).not.toBeInTheDocument();
 expect(screen.getByText('Dismiss')).toBeInTheDocument();
 });

 it('should render session expired error correctly', () => {
 const error: AuthErrorType = {
 type: 'session_expired',
 message: 'Your session has expired',
 retryable: false,
 };

 render(<AuthError error={error} />);

 expect(screen.getByText('Session Expired')).toBeInTheDocument();
 expect(screen.getByText('Your session has expired')).toBeInTheDocument();
 expect(screen.queryByText('Try again')).not.toBeInTheDocument();
 expect(screen.queryByText('Dismiss')).not.toBeInTheDocument();
 });

 it('should render profile not found error correctly', () => {
 const error: AuthErrorType = {
 type: 'profile_not_found',
 message: 'Profile setup required',
 retryable: false,
 };

 render(<AuthError error={error} />);

 expect(screen.getByText('Profile Setup Required')).toBeInTheDocument();
 expect(screen.getByText('Profile setup required')).toBeInTheDocument();
 });

 it('should render unknown error correctly', () => {
 const error: AuthErrorType = {
 type: 'unknown',
 message: 'Something went wrong',
 retryable: true,
 };

 render(<AuthError error={error} onRetry={mockRetry} />);

 expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
 expect(screen.getByText('Try again')).toBeInTheDocument();
 });

 it('should call onRetry when retry button is clicked', () => {
 const error: AuthErrorType = {
 type: 'network',
 message: 'Network error',
 retryable: true,
 };

 render(<AuthError error={error} onRetry={mockRetry} />);

 fireEvent.click(screen.getByText('Try again'));
 expect(mockRetry).toHaveBeenCalledTimes(1);
 });

 it('should call onDismiss when dismiss button is clicked', () => {
 const error: AuthErrorType = {
 type: 'network',
 message: 'Network error',
 retryable: true,
 };

 render(<AuthError error={error} onDismiss={mockDismiss} />);

 fireEvent.click(screen.getByText('Dismiss'));
 expect(mockDismiss).toHaveBeenCalledTimes(1);
 });

 it('should call onDismiss when close button is clicked', () => {
 const error: AuthErrorType = {
 type: 'network',
 message: 'Network error',
 retryable: true,
 };

 render(<AuthError error={error} onDismiss={mockDismiss} />);

 const closeButton = screen.getByLabelText('Dismiss error');
 fireEvent.click(closeButton);
 expect(mockDismiss).toHaveBeenCalledTimes(1);
 });

 it('should apply custom className', () => {
 const error: AuthErrorType = {
 type: 'network',
 message: 'Network error',
 retryable: true,
 };

 const { container } = render(<AuthError error={error} className="custom-class" />);
 expect(container.firstChild).toHaveClass('custom-class');
 });
});