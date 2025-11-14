

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { WatchErrorHandler } from '../utils/errorHandler';
import WatchErrorBoundary from '../WatchErrorBoundary';
import { VideoNotFoundError, NetworkError, AccessDeniedError, InvalidLinkError, ServerError } from '../error-pages';

jest.mock('next/navigation', () => ({
 useRouter: jest.fn()
}));

const mockRouter = {
 push: jest.fn(),
 back: jest.fn(),
 forward: jest.fn(),
 refresh: jest.fn()
};

beforeEach(() => {
 (useRouter as jest.Mock).mockReturnValue(mockRouter);
 jest.clearAllMocks();
});

describe('WatchErrorHandler', () => {
 describe('analyzeError', () => {
 it('should identify network errors correctly', () => {
 const networkErrors = [
 'Failed to fetch',
 'Network error',
 'Connection timeout',
 'ERR_NETWORK'
 ];

 networkErrors.forEach(error => {
 const result = WatchErrorHandler.analyzeError(error);
 expect(result.type).toBe('network');
 expect(result.isRetryable).toBe(true);
 });
 });

 it('should identify not found errors correctly', () => {
 const notFoundErrors = [
 'Video not found',
 'Share token not found or expired',
 'Content does not exist'
 ];

 notFoundErrors.forEach(error => {
 const result = WatchErrorHandler.analyzeError(error);
 expect(result.type).toBe('not_found');
 expect(result.isRetryable).toBe(false);
 });
 });

 it('should identify access denied errors correctly', () => {
 const accessErrors = [
 'Access denied',
 'Unauthorized access',
 'Insufficient credits',
 'Membership required'
 ];

 accessErrors.forEach(error => {
 const result = WatchErrorHandler.analyzeError(error);
 expect(result.type).toBe('access_denied');
 expect(result.isRetryable).toBe(false);
 });
 });

 it('should identify invalid link errors correctly', () => {
 const invalidErrors = [
 'Invalid identifier',
 'Malformed token',
 'Empty identifier provided'
 ];

 invalidErrors.forEach(error => {
 const result = WatchErrorHandler.analyzeError(error);
 expect(result.type).toBe('invalid_link');
 expect(result.isRetryable).toBe(false);
 });
 });

 it('should identify server errors correctly', () => {
 const serverErrors = [
 'Internal server error',
 'Service unavailable',
 'Server temporarily unavailable'
 ];

 serverErrors.forEach(error => {
 const result = WatchErrorHandler.analyzeError(error);
 expect(result.type).toBe('server_error');
 expect(result.isRetryable).toBe(true);
 });
 });

 it('should handle HTTP status codes correctly', () => {
 const statusTests = [
 { status: 400, expectedType: 'invalid_link' },
 { status: 401, expectedType: 'access_denied' },
 { status: 403, expectedType: 'access_denied' },
 { status: 404, expectedType: 'not_found' },
 { status: 410, expectedType: 'not_found' },
 { status: 500, expectedType: 'server_error' },
 { status: 503, expectedType: 'server_error' }
 ];

 statusTests.forEach(({ status, expectedType }) => {
 const result = WatchErrorHandler.analyzeError('Test error', status);
 expect(result.type).toBe(expectedType);
 expect(result.statusCode).toBe(status);
 });
 });

 it('should extract credit cost from error messages', () => {
 const creditCost = WatchErrorHandler.extractCreditCost('You need 5 credits to watch this video');
 expect(creditCost).toBe(5);

 const noCost = WatchErrorHandler.extractCreditCost('Access denied');
 expect(noCost).toBeUndefined();
 });
 });
});

describe('Error Page Components', () => {
 const mockHandlers = {
 onGoHome: jest.fn(),
 onGoDiscover: jest.fn(),
 onRetry: jest.fn(),
 onGoMembership: jest.fn(),
 onGoWallet: jest.fn(),
 onContactSupport: jest.fn()
 };

 beforeEach(() => {
 Object.values(mockHandlers).forEach(mock => mock.mockClear());
 });

 describe('VideoNotFoundError', () => {
 it('should render video not found error correctly', () => {
 render(
 <VideoNotFoundError
 onGoHome={mockHandlers.onGoHome}
 onGoDiscover={mockHandlers.onGoDiscover}
 />
 );

 expect(screen.getByText('Video Not Found')).toBeInTheDocument();
 expect(screen.getByText(/might have been removed/)).toBeInTheDocument();
 expect(screen.getByText('Discover Videos')).toBeInTheDocument();
 expect(screen.getByText('Go to Home')).toBeInTheDocument();
 });

 it('should render share token specific message', () => {
 render(
 <VideoNotFoundError
 onGoHome={mockHandlers.onGoHome}
 onGoDiscover={mockHandlers.onGoDiscover}
 isShareToken={true}
 />
 );

 expect(screen.getByText('Link Not Found')).toBeInTheDocument();
 expect(screen.getByText(/share link may have expired/)).toBeInTheDocument();
 });

 it('should handle navigation correctly', () => {
 render(
 <VideoNotFoundError
 onGoHome={mockHandlers.onGoHome}
 onGoDiscover={mockHandlers.onGoDiscover}
 />
 );

 fireEvent.click(screen.getByText('Discover Videos'));
 expect(mockHandlers.onGoDiscover).toHaveBeenCalled();

 fireEvent.click(screen.getByText('Go to Home'));
 expect(mockHandlers.onGoHome).toHaveBeenCalled();
 });
 });

 describe('NetworkError', () => {
 it('should render network error correctly', () => {
 render(
 <NetworkError
 onRetry={mockHandlers.onRetry}
 onGoHome={mockHandlers.onGoHome}
 />
 );

 expect(screen.getByText('Connection Problem')).toBeInTheDocument();
 expect(screen.getByText('Try Again')).toBeInTheDocument();
 expect(screen.getByText(/troubleshooting tips/i)).toBeInTheDocument();
 });

 it('should show offline specific message', () => {
 render(
 <NetworkError
 onRetry={mockHandlers.onRetry}
 onGoHome={mockHandlers.onGoHome}
 isOffline={true}
 />
 );

 expect(screen.getByText('No Internet Connection')).toBeInTheDocument();
 expect(screen.getByText('Offline')).toBeInTheDocument();
 });

 it('should handle retry correctly', () => {
 render(
 <NetworkError
 onRetry={mockHandlers.onRetry}
 onGoHome={mockHandlers.onGoHome}
 />
 );

 fireEvent.click(screen.getByText('Try Again'));
 expect(mockHandlers.onRetry).toHaveBeenCalled();
 });
 });

 describe('AccessDeniedError', () => {
 it('should render membership required error', () => {
 render(
 <AccessDeniedError
 onGoMembership={mockHandlers.onGoMembership}
 onGoHome={mockHandlers.onGoHome}
 onGoWallet={mockHandlers.onGoWallet}
 requiresMembership={true}
 />
 );

 expect(screen.getByText('Membership Required')).toBeInTheDocument();
 expect(screen.getByText('Upgrade Membership')).toBeInTheDocument();
 expect(screen.getByText(/membership benefits/i)).toBeInTheDocument();
 });

 it('should render credits required error', () => {
 render(
 <AccessDeniedError
 onGoMembership={mockHandlers.onGoMembership}
 onGoHome={mockHandlers.onGoHome}
 onGoWallet={mockHandlers.onGoWallet}
 requiresCredits={true}
 creditCost={5}
 />
 );

 expect(screen.getByText('Credits Required')).toBeInTheDocument();
 expect(screen.getByText('Top Up Wallet')).toBeInTheDocument();
 expect(screen.getByText(/need 5 credits/)).toBeInTheDocument();
 });

 it('should handle navigation to membership', () => {
 render(
 <AccessDeniedError
 onGoMembership={mockHandlers.onGoMembership}
 onGoHome={mockHandlers.onGoHome}
 onGoWallet={mockHandlers.onGoWallet}
 requiresMembership={true}
 />
 );

 fireEvent.click(screen.getByText('Upgrade Membership'));
 expect(mockHandlers.onGoMembership).toHaveBeenCalled();
 });

 it('should handle navigation to wallet', () => {
 render(
 <AccessDeniedError
 onGoMembership={mockHandlers.onGoMembership}
 onGoHome={mockHandlers.onGoHome}
 onGoWallet={mockHandlers.onGoWallet}
 requiresCredits={true}
 />
 );

 fireEvent.click(screen.getByText('Top Up Wallet'));
 expect(mockHandlers.onGoWallet).toHaveBeenCalled();
 });
 });

 describe('InvalidLinkError', () => {
 it('should render invalid link error correctly', () => {
 render(
 <InvalidLinkError
 onGoHome={mockHandlers.onGoHome}
 onGoDiscover={mockHandlers.onGoDiscover}
 identifier="invalid-id-123"
 />
 );

 expect(screen.getByText('Invalid Link')).toBeInTheDocument();
 expect(screen.getByText(/appears to be invalid/)).toBeInTheDocument();
 expect(screen.getByText(/common issues/i)).toBeInTheDocument();
 });

 it('should show identifier in development mode', () => {
 const originalEnv = process.env.NODE_ENV;
 process.env.NODE_ENV = 'development';

 render(
 <InvalidLinkError
 onGoHome={mockHandlers.onGoHome}
 onGoDiscover={mockHandlers.onGoDiscover}
 identifier="test-identifier"
 />
 );

 expect(screen.getByText('test-identifier')).toBeInTheDocument();

 process.env.NODE_ENV = originalEnv;
 });
 });

 describe('ServerError', () => {
 it('should render server error correctly', () => {
 render(
 <ServerError
 onRetry={mockHandlers.onRetry}
 onGoHome={mockHandlers.onGoHome}
 onContactSupport={mockHandlers.onContactSupport}
 />
 );

 expect(screen.getByText('Server Error')).toBeInTheDocument();
 expect(screen.getByText(/technical difficulties/)).toBeInTheDocument();
 expect(screen.getByText('Try Again')).toBeInTheDocument();
 });

 it('should show error code in development mode', () => {
 render(
 <ServerError
 onRetry={mockHandlers.onRetry}
 onGoHome={mockHandlers.onGoHome}
 errorCode="500"
 showDetails={true}
 />
 );

 expect(screen.getByText('500')).toBeInTheDocument();
 });

 it('should handle contact support', () => {
 render(
 <ServerError
 onRetry={mockHandlers.onRetry}
 onGoHome={mockHandlers.onGoHome}
 onContactSupport={mockHandlers.onContactSupport}
 />
 );

 fireEvent.click(screen.getByText('Contact Support'));
 expect(mockHandlers.onContactSupport).toHaveBeenCalled();
 });
 });
});

describe('WatchErrorBoundary Integration', () => {
 const mockHandlers = {
 onRetry: jest.fn(),
 onGoHome: jest.fn(),
 onGoDiscover: jest.fn()
 };

 beforeEach(() => {
 Object.values(mockHandlers).forEach(mock => mock.mockClear());
 });

 it('should render appropriate error component based on error type', () => {
 const testCases = [
 { error: 'Video not found', expectedText: 'Video Not Found' },
 { error: 'Network error', expectedText: 'Connection Problem' },
 { error: 'Invalid identifier', expectedText: 'Invalid Link' },
 { error: 'Access denied', expectedText: 'Access Denied' },
 { error: 'Server error', expectedText: 'Server Error' }
 ];

 testCases.forEach(({ error, expectedText }) => {
 const { unmount } = render(
 <WatchErrorBoundary
 error={error}
 onRetry={mockHandlers.onRetry}
 onGoHome={mockHandlers.onGoHome}
 onGoDiscover={mockHandlers.onGoDiscover}
 />
 );

 expect(screen.getByText(expectedText)).toBeInTheDocument();
 unmount();
 });
 });

 it('should pass correct props to error components', () => {
 render(
 <WatchErrorBoundary
 error="You need 10 credits to watch this video"
 onRetry={mockHandlers.onRetry}
 onGoHome={mockHandlers.onGoHome}
 onGoDiscover={mockHandlers.onGoDiscover}
 statusCode={403}
 identifier="test-id"
 />
 );

 expect(screen.getByText(/need 10 credits/)).toBeInTheDocument();
 });

 it('should handle network status changes', async () => {

 Object.defineProperty(navigator, 'onLine', {
 writable: true,
 value: false
 });

 render(
 <WatchErrorBoundary
 error="Network error"
 onRetry={mockHandlers.onRetry}
 onGoHome={mockHandlers.onGoHome}
 onGoDiscover={mockHandlers.onGoDiscover}
 />
 );

 expect(screen.getByText('No Internet Connection')).toBeInTheDocument();

 Object.defineProperty(navigator, 'onLine', {
 value: true
 });

 fireEvent(window, new Event('online'));

 await waitFor(() => {

 });
 });
});