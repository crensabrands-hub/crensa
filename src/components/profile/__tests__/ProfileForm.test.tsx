import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileForm from '../ProfileForm';

const mockUseAuthContext = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: () => mockUseAuthContext(),
}));

jest.mock('../AvatarUpload', () => {
 return function MockAvatarUpload({ onAvatarChange }: { onAvatarChange: (file: File | null) => void }) {
 return (
 <div data-testid="avatar-upload">
 <button onClick={() => onAvatarChange(new File(['test'], 'test.jpg', { type: 'image/jpeg' }))}>
 Upload Avatar
 </button>
 </div>
 );
 };
});

describe('ProfileForm', () => {
 const mockUpdateUserProfile = jest.fn();
 const mockOnSave = jest.fn();
 const mockOnCancel = jest.fn();

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
 socialLinks: [{ platform: 'Instagram', url: 'https://instagram.com/test' }],
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
 global.URL.createObjectURL = jest.fn(() => 'mock-url');
 });

 it('renders loading state when no user profile', () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: null,
 isLoading: false,
 signOut: jest.fn(),
 user: null,
 isSignedIn: false,
 updateUserProfile: mockUpdateUserProfile,
 hasRole: jest.fn(),
 });

 render(<ProfileForm />);
 
 expect(screen.getByRole('status')).toBeInTheDocument();
 });

 it('renders creator profile form correctly', () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 isLoading: false,
 signOut: jest.fn(),
 user: null,
 isSignedIn: true,
 updateUserProfile: mockUpdateUserProfile,
 hasRole: jest.fn(),
 });

 render(<ProfileForm onSave={mockOnSave} onCancel={mockOnCancel} />);
 
 expect(screen.getByDisplayValue('testcreator')).toBeInTheDocument();
 expect(screen.getByDisplayValue('creator@test.com')).toBeInTheDocument();
 expect(screen.getByDisplayValue('Test Creator')).toBeInTheDocument();
 expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
 expect(screen.getByDisplayValue('Instagram')).toBeInTheDocument();
 expect(screen.getByDisplayValue('https://instagram.com/test')).toBeInTheDocument();
 });

 it('renders member profile form correctly', () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockMemberProfile,
 isLoading: false,
 signOut: jest.fn(),
 user: null,
 isSignedIn: true,
 updateUserProfile: mockUpdateUserProfile,
 hasRole: jest.fn(),
 });

 render(<ProfileForm onSave={mockOnSave} onCancel={mockOnCancel} />);
 
 expect(screen.getByDisplayValue('testmember')).toBeInTheDocument();
 expect(screen.getByDisplayValue('member@test.com')).toBeInTheDocument();

 expect(screen.queryByLabelText(/display name/i)).not.toBeInTheDocument();
 expect(screen.queryByLabelText(/bio/i)).not.toBeInTheDocument();
 });

 it('validates required fields', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 isLoading: false,
 signOut: jest.fn(),
 user: null,
 isSignedIn: true,
 updateUserProfile: mockUpdateUserProfile,
 hasRole: jest.fn(),
 });

 render(<ProfileForm onSave={mockOnSave} />);

 const usernameInput = screen.getByLabelText(/username/i);
 const emailInput = screen.getByLabelText(/email/i);
 const displayNameInput = screen.getByLabelText(/display name/i);
 
 fireEvent.change(usernameInput, { target: { value: '' } });
 fireEvent.change(emailInput, { target: { value: '' } });
 fireEvent.change(displayNameInput, { target: { value: '' } });
 
 const submitButton = screen.getByText('Save Changes');
 fireEvent.click(submitButton);
 
 await waitFor(() => {
 expect(screen.getByText('Username is required')).toBeInTheDocument();
 expect(screen.getByText('Email is required')).toBeInTheDocument();
 expect(screen.getByText('Display name is required for creators')).toBeInTheDocument();
 });
 
 expect(mockUpdateUserProfile).not.toHaveBeenCalled();
 });

 it('validates username format', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 isLoading: false,
 signOut: jest.fn(),
 user: null,
 isSignedIn: true,
 updateUserProfile: mockUpdateUserProfile,
 hasRole: jest.fn(),
 });

 render(<ProfileForm onSave={mockOnSave} />);
 
 const usernameInput = screen.getByLabelText(/username/i);

 fireEvent.change(usernameInput, { target: { value: 'test@user' } });
 
 const submitButton = screen.getByText('Save Changes');
 fireEvent.click(submitButton);
 
 await waitFor(() => {
 expect(screen.getByText('Username can only contain letters, numbers, and underscores')).toBeInTheDocument();
 });
 });

 it('validates email format', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 isLoading: false,
 signOut: jest.fn(),
 user: null,
 isSignedIn: true,
 updateUserProfile: mockUpdateUserProfile,
 hasRole: jest.fn(),
 });

 render(<ProfileForm onSave={mockOnSave} />);
 
 const emailInput = screen.getByLabelText(/email/i);
 
 fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
 
 const submitButton = screen.getByText('Save Changes');
 fireEvent.click(submitButton);
 
 await waitFor(() => {
 expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
 });
 });

 it('validates bio length for creators', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 isLoading: false,
 signOut: jest.fn(),
 user: null,
 isSignedIn: true,
 updateUserProfile: mockUpdateUserProfile,
 hasRole: jest.fn(),
 });

 render(<ProfileForm onSave={mockOnSave} />);
 
 const bioInput = screen.getByLabelText(/bio/i);

 fireEvent.change(bioInput, { target: { value: 'x'.repeat(501) } });
 
 const submitButton = screen.getByText('Save Changes');
 fireEvent.click(submitButton);
 
 await waitFor(() => {
 expect(screen.getByText('Bio must be less than 500 characters')).toBeInTheDocument();
 });
 });

 it('adds and removes social links for creators', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 isLoading: false,
 signOut: jest.fn(),
 user: null,
 isSignedIn: true,
 updateUserProfile: mockUpdateUserProfile,
 hasRole: jest.fn(),
 });

 render(<ProfileForm onSave={mockOnSave} />);

 const addLinkButton = screen.getByText('+ Add Link');
 fireEvent.click(addLinkButton);
 
 await waitFor(() => {
 const platformInputs = screen.getAllByPlaceholderText('Platform (e.g., Instagram)');
 expect(platformInputs).toHaveLength(2); // Original + new one
 });

 const removeButtons = screen.getAllByText('Remove');
 fireEvent.click(removeButtons[0]);
 
 await waitFor(() => {
 const platformInputs = screen.getAllByPlaceholderText('Platform (e.g., Instagram)');
 expect(platformInputs).toHaveLength(1);
 });
 });

 it('submits form with valid data', async () => {
 mockUpdateUserProfile.mockResolvedValue(undefined);
 
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 isLoading: false,
 signOut: jest.fn(),
 user: null,
 isSignedIn: true,
 updateUserProfile: mockUpdateUserProfile,
 hasRole: jest.fn(),
 });

 render(<ProfileForm onSave={mockOnSave} />);
 
 const submitButton = screen.getByText('Save Changes');
 fireEvent.click(submitButton);
 
 await waitFor(() => {
 expect(mockUpdateUserProfile).toHaveBeenCalledWith({
 username: 'testcreator',
 email: 'creator@test.com',
 displayName: 'Test Creator',
 bio: 'Test bio',
 socialLinks: [{ platform: 'Instagram', url: 'https://instagram.com/test' }],
 });
 expect(mockOnSave).toHaveBeenCalled();
 });
 });

 it('calls onCancel when cancel button is clicked', () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 isLoading: false,
 signOut: jest.fn(),
 user: null,
 isSignedIn: true,
 updateUserProfile: mockUpdateUserProfile,
 hasRole: jest.fn(),
 });

 render(<ProfileForm onSave={mockOnSave} onCancel={mockOnCancel} />);
 
 const cancelButton = screen.getByText('Cancel');
 fireEvent.click(cancelButton);
 
 expect(mockOnCancel).toHaveBeenCalled();
 });

 it('shows character count for bio', () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 isLoading: false,
 signOut: jest.fn(),
 user: null,
 isSignedIn: true,
 updateUserProfile: mockUpdateUserProfile,
 hasRole: jest.fn(),
 });

 render(<ProfileForm onSave={mockOnSave} />);
 
 expect(screen.getByText('8/500')).toBeInTheDocument(); // "Test bio" is 8 characters
 });
});