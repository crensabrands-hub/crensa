import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileDropdown from '../ProfileDropdown';

const mockUseAuthContext = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: () => mockUseAuthContext(),
}));

jest.mock('next/link', () => {
 const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
 <a href={href}>{children}</a>
 );
 MockLink.displayName = 'MockLink';
 return MockLink;
});

describe('ProfileDropdown', () => {
 const mockSignOut = jest.fn();
 
 const mockCreatorProfile = {
 id: '1',
 clerkId: 'clerk_1',
 email: 'creator@test.com',
 username: 'testcreator',
 role: 'creator' as const,
 avatar: 'https://example.com/avatar.jpg',
 createdAt: new Date(),
 updatedAt: new Date(),
 displayName: 'Test Creator',
 bio: 'Test bio',
 totalEarnings: 100,
 totalViews: 1000,
 videoCount: 5,
 socialLinks: [],
 };

 const mockMemberProfile = {
 id: '2',
 clerkId: 'clerk_2',
 email: 'member@test.com',
 username: 'testmember',
 role: 'member' as const,
 createdAt: new Date(),
 updatedAt: new Date(),
 walletBalance: 50,
 membershipStatus: 'free' as const,
 watchHistory: [],
 favoriteCreators: [],
 };

 beforeEach(() => {
 jest.clearAllMocks();
 mockUseAuthContext.mockClear();
 });

 it('shows loading state when loading', () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: null,
 isLoading: true,
 signOut: mockSignOut,
 user: null,
 isSignedIn: false,
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 });

 render(<ProfileDropdown />);
 
 expect(screen.getByLabelText('Loading')).toBeInTheDocument();
 });

 it('renders creator profile dropdown correctly', () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 isLoading: false,
 signOut: mockSignOut,
 user: null,
 isSignedIn: true,
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 });

 render(<ProfileDropdown />);

 const avatarButton = screen.getByRole('button', { name: /open profile menu/i });
 expect(avatarButton).toBeInTheDocument();

 expect(screen.getByText('Test Creator')).toBeInTheDocument();
 expect(screen.getByText('creator')).toBeInTheDocument();
 });

 it('renders member profile dropdown correctly', () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockMemberProfile,
 isLoading: false,
 signOut: mockSignOut,
 user: null,
 isSignedIn: true,
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 });

 render(<ProfileDropdown />);

 const avatarButton = screen.getByRole('button', { name: /open profile menu/i });
 expect(avatarButton).toBeInTheDocument();

 expect(screen.getByText('testmember')).toBeInTheDocument();
 expect(screen.getByText('member')).toBeInTheDocument();
 });

 it('opens dropdown menu when clicked', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 isLoading: false,
 signOut: mockSignOut,
 user: null,
 isSignedIn: true,
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 });

 render(<ProfileDropdown />);
 
 const avatarButton = screen.getByRole('button', { name: /open profile menu/i });
 fireEvent.click(avatarButton);
 
 await waitFor(() => {
 expect(screen.getByText('Profile')).toBeInTheDocument();
 expect(screen.getByText('Settings')).toBeInTheDocument();
 expect(screen.getByText('Notifications')).toBeInTheDocument();
 expect(screen.getByText('Sign Out')).toBeInTheDocument();
 });
 });

 it('calls signOut when sign out button is clicked', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 isLoading: false,
 signOut: mockSignOut,
 user: null,
 isSignedIn: true,
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 });

 render(<ProfileDropdown />);
 
 const avatarButton = screen.getByRole('button', { name: /open profile menu/i });
 fireEvent.click(avatarButton);
 
 await waitFor(() => {
 const signOutButton = screen.getByText('Sign Out');
 fireEvent.click(signOutButton);
 });
 
 expect(mockSignOut).toHaveBeenCalledTimes(1);
 });

 it('closes dropdown when clicking outside', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 isLoading: false,
 signOut: mockSignOut,
 user: null,
 isSignedIn: true,
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 });

 render(<ProfileDropdown />);
 
 const avatarButton = screen.getByRole('button', { name: /open profile menu/i });
 fireEvent.click(avatarButton);
 
 await waitFor(() => {
 expect(screen.getByText('Profile')).toBeInTheDocument();
 });

 fireEvent.mouseDown(document.body);
 
 await waitFor(() => {
 expect(screen.queryByText('Profile')).not.toBeInTheDocument();
 });
 });

 it('displays avatar image when provided', () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 isLoading: false,
 signOut: mockSignOut,
 user: null,
 isSignedIn: true,
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 });

 render(<ProfileDropdown />);
 
 const avatarImage = screen.getByAltText("Test Creator's avatar");
 expect(avatarImage).toBeInTheDocument();
 expect(avatarImage).toHaveAttribute('src', 'https://example.com/avatar.jpg');
 });

 it('displays initials when no avatar provided', () => {
 const profileWithoutAvatar = { ...mockCreatorProfile, avatar: undefined };
 
 mockUseAuthContext.mockReturnValue({
 userProfile: profileWithoutAvatar,
 isLoading: false,
 signOut: mockSignOut,
 user: null,
 isSignedIn: true,
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 });

 render(<ProfileDropdown />);
 
 expect(screen.getByText('T')).toBeInTheDocument(); // First letter of "Test Creator"
 });
});