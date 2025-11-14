import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ProfileDropdown from '../ProfileDropdown';
import { useAuthContext } from '@/contexts/AuthContext';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
 useRouter: () => ({
 push: mockPush,
 }),
}));

const mockUserProfile = {
 id: '1',
 clerkId: 'clerk_123',
 email: 'test@example.com',
 username: 'testuser',
 role: 'member' as const,
 avatar: null,
 createdAt: new Date(),
 updatedAt: new Date(),
};

const mockSignOut = jest.fn();

jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: jest.fn(),
}));

jest.mock('../ProfileErrorBoundary', () => ({
 ProfileErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('ProfileDropdown Navigation', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 
 (useAuthContext as jest.Mock).mockReturnValue({
 userProfile: mockUserProfile,
 signOut: mockSignOut,
 isLoading: false,
 });
 });

 it('should render profile dropdown with navigation items', () => {
 render(<ProfileDropdown />);

 const avatarButton = screen.getByRole('button', { name: /open profile menu/i });
 fireEvent.click(avatarButton);

 expect(screen.getByText('Profile')).toBeInTheDocument();
 expect(screen.getByText('Settings')).toBeInTheDocument();
 expect(screen.getByText('Notifications')).toBeInTheDocument();
 });

 it('should handle profile navigation successfully', async () => {
 mockPush.mockResolvedValue(undefined);
 
 render(<ProfileDropdown />);

 const avatarButton = screen.getByRole('button', { name: /open profile menu/i });
 fireEvent.click(avatarButton);

 const profileButton = screen.getByText('Profile');
 fireEvent.click(profileButton);

 await waitFor(() => {
 expect(mockPush).toHaveBeenCalledWith('/profile');
 });
 });

 it('should handle navigation errors gracefully', async () => {
 const navigationError = new Error('Navigation failed');
 mockPush.mockRejectedValue(navigationError);

 delete (window as any).location;
 window.location = { href: '' } as any;

 render(<ProfileDropdown />);

 const avatarButton = screen.getByRole('button', { name: /open profile menu/i });
 fireEvent.click(avatarButton);

 const profileButton = screen.getByText('Profile');
 fireEvent.click(profileButton);

 await waitFor(() => {
 expect(mockPush).toHaveBeenCalledWith('/profile');
 });

 await waitFor(() => {
 expect(screen.getByText(/Failed to navigate to Profile/)).toBeInTheDocument();
 });
 });

 it('should provide fallback navigation for profile page', async () => {
 const navigationError = new Error('Navigation failed');
 mockPush.mockRejectedValue(navigationError);

 const mockLocationHref = jest.fn();
 delete (window as any).location;
 window.location = { href: mockLocationHref } as any;

 render(<ProfileDropdown />);

 const avatarButton = screen.getByRole('button', { name: /open profile menu/i });
 fireEvent.click(avatarButton);

 const profileButton = screen.getByText('Profile');
 fireEvent.click(profileButton);

 await waitFor(() => {
 expect(window.location.href).toBe('/profile');
 });
 });

 it('should dismiss navigation error when clicked', async () => {
 const navigationError = new Error('Navigation failed');
 mockPush.mockRejectedValue(navigationError);
 
 render(<ProfileDropdown />);

 const avatarButton = screen.getByRole('button', { name: /open profile menu/i });
 fireEvent.click(avatarButton);

 const profileButton = screen.getByText('Profile');
 fireEvent.click(profileButton);

 await waitFor(() => {
 expect(screen.getByText(/Failed to navigate to Profile/)).toBeInTheDocument();
 });

 const dismissButton = screen.getByText('Dismiss');
 fireEvent.click(dismissButton);

 await waitFor(() => {
 expect(screen.queryByText(/Failed to navigate to Profile/)).not.toBeInTheDocument();
 });
 });

 it('should show role information correctly', () => {
 render(<ProfileDropdown />);

 const avatarButton = screen.getByRole('button', { name: /open profile menu/i });
 expect(avatarButton).toHaveAttribute('title', 'testuser (member)');

 fireEvent.click(avatarButton);
 
 expect(screen.getByText('member')).toBeInTheDocument();
 });

 it('should handle sign out correctly', async () => {
 render(<ProfileDropdown />);

 const avatarButton = screen.getByRole('button', { name: /open profile menu/i });
 fireEvent.click(avatarButton);

 const signOutButton = screen.getByText('Sign Out');
 fireEvent.click(signOutButton);

 await waitFor(() => {
 expect(mockSignOut).toHaveBeenCalled();
 });
 });

 it('should show loading state when user profile is loading', () => {
 (useAuthContext as jest.Mock).mockReturnValue({
 userProfile: null,
 signOut: mockSignOut,
 isLoading: true,
 });

 render(<ProfileDropdown />);

 expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
 });

 it('should close dropdown when clicking outside', () => {
 render(<ProfileDropdown />);

 const avatarButton = screen.getByRole('button', { name: /open profile menu/i });
 fireEvent.click(avatarButton);

 expect(screen.getByText('Profile')).toBeInTheDocument();

 fireEvent.mouseDown(document.body);

 expect(screen.queryByText('Profile')).not.toBeInTheDocument();
 });
});