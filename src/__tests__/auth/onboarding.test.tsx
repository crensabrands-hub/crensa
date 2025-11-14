import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import OnboardingPage from '@/app/onboarding/page';

jest.mock('@clerk/nextjs', () => ({
 useUser: jest.fn(),
}));

jest.mock('next/navigation', () => ({
 useRouter: jest.fn(),
}));

global.fetch = jest.fn();

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('OnboardingPage', () => {
 const mockPush = jest.fn();

 beforeEach(() => {
 jest.clearAllMocks();
 mockFetch.mockClear();
 
 mockUseRouter.mockReturnValue({
 push: mockPush,
 } as any);
 });

 it('should render role selection options', () => {
 mockUseUser.mockReturnValue({
 user: {
 id: 'user_123',
 emailAddresses: [{ emailAddress: 'test@example.com' }],
 username: 'testuser',
 },
 } as any);

 render(<OnboardingPage />);

 expect(screen.getByText('Welcome to Crensa!')).toBeInTheDocument();
 expect(screen.getByText('Creator')).toBeInTheDocument();
 expect(screen.getByText('Member')).toBeInTheDocument();
 expect(screen.getByText(/Upload and monetize your short video content/)).toBeInTheDocument();
 expect(screen.getByText(/Discover and watch amazing content from creators/)).toBeInTheDocument();
 });

 it('should allow selecting creator role', () => {
 mockUseUser.mockReturnValue({
 user: {
 id: 'user_123',
 emailAddresses: [{ emailAddress: 'test@example.com' }],
 username: 'testuser',
 },
 } as any);

 render(<OnboardingPage />);

 const creatorOption = screen.getByText('Creator').closest('div');
 fireEvent.click(creatorOption!);

 expect(screen.getByText('Continue as Creator')).toBeInTheDocument();
 });

 it('should allow selecting member role', () => {
 mockUseUser.mockReturnValue({
 user: {
 id: 'user_123',
 emailAddresses: [{ emailAddress: 'test@example.com' }],
 username: 'testuser',
 },
 } as any);

 render(<OnboardingPage />);

 const memberOption = screen.getByText('Member').closest('div');
 fireEvent.click(memberOption!);

 expect(screen.getByText('Continue as Member')).toBeInTheDocument();
 });

 it('should handle creator role selection and redirect', async () => {
 mockUseUser.mockReturnValue({
 user: {
 id: 'user_123',
 emailAddresses: [{ emailAddress: 'test@example.com' }],
 username: 'testuser',
 },
 } as any);

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => ({ success: true }),
 } as Response);

 render(<OnboardingPage />);

 const creatorOption = screen.getByText('Creator').closest('div');
 fireEvent.click(creatorOption!);

 const continueButton = screen.getByText('Continue as Creator');
 fireEvent.click(continueButton);

 await waitFor(() => {
 expect(mockFetch).toHaveBeenCalledWith('/api/auth/setup-profile', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 role: 'creator',
 email: 'test@example.com',
 username: 'testuser',
 }),
 });
 });

 await waitFor(() => {
 expect(mockPush).toHaveBeenCalledWith('/creator/dashboard');
 });
 });

 it('should handle member role selection and redirect', async () => {
 mockUseUser.mockReturnValue({
 user: {
 id: 'user_123',
 emailAddresses: [{ emailAddress: 'test@example.com' }],
 username: 'testuser',
 },
 } as any);

 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => ({ success: true }),
 } as Response);

 render(<OnboardingPage />);

 const memberOption = screen.getByText('Member').closest('div');
 fireEvent.click(memberOption!);

 const continueButton = screen.getByText('Continue as Member');
 fireEvent.click(continueButton);

 await waitFor(() => {
 expect(mockFetch).toHaveBeenCalledWith('/api/auth/setup-profile', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 role: 'member',
 email: 'test@example.com',
 username: 'testuser',
 }),
 });
 });

 await waitFor(() => {
 expect(mockPush).toHaveBeenCalledWith('/dashboard');
 });
 });

 it('should show loading state during role setup', async () => {
 mockUseUser.mockReturnValue({
 user: {
 id: 'user_123',
 emailAddresses: [{ emailAddress: 'test@example.com' }],
 username: 'testuser',
 },
 } as any);

 mockFetch.mockImplementationOnce(() => 
 new Promise(resolve => 
 setTimeout(() => resolve({
 ok: true,
 json: async () => ({ success: true }),
 } as Response), 100)
 )
 );

 render(<OnboardingPage />);

 const creatorOption = screen.getByText('Creator').closest('div');
 fireEvent.click(creatorOption!);

 const continueButton = screen.getByText('Continue as Creator');
 fireEvent.click(continueButton);

 expect(screen.getByText('Setting up your account...')).toBeInTheDocument();
 expect(continueButton).toBeDisabled();

 await waitFor(() => {
 expect(mockPush).toHaveBeenCalledWith('/creator/dashboard');
 });
 });

 it('should handle API errors gracefully', async () => {
 mockUseUser.mockReturnValue({
 user: {
 id: 'user_123',
 emailAddresses: [{ emailAddress: 'test@example.com' }],
 username: 'testuser',
 },
 } as any);

 const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

 mockFetch.mockResolvedValueOnce({
 ok: false,
 status: 500,
 } as Response);

 render(<OnboardingPage />);

 const creatorOption = screen.getByText('Creator').closest('div');
 fireEvent.click(creatorOption!);

 const continueButton = screen.getByText('Continue as Creator');
 fireEvent.click(continueButton);

 await waitFor(() => {
 expect(consoleSpy).toHaveBeenCalledWith('Failed to setup profile');
 });

 expect(mockPush).not.toHaveBeenCalled();
 consoleSpy.mockRestore();
 });
});