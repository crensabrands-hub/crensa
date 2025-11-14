import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserSettings from '../UserSettings';

const mockUseAuthContext = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: () => mockUseAuthContext(),
}));

global.fetch = jest.fn();

describe('UserSettings', () => {
 const mockOnSave = jest.fn();

 const mockCreatorProfile = {
 id: '1',
 clerkId: 'clerk_1',
 email: 'creator@test.com',
 username: 'testcreator',
 role: 'creator' as const,
 createdAt: new Date(),
 updatedAt: new Date(),
 displayName: 'Test Creator',
 totalEarnings: 100,
 totalViews: 1000,
 videoCount: 5,
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
 (global.fetch as jest.Mock).mockClear();

 const localStorageMock = {
 getItem: jest.fn(),
 setItem: jest.fn(),
 removeItem: jest.fn(),
 clear: jest.fn(),
 };
 Object.defineProperty(window, 'localStorage', {
 value: localStorageMock,
 });
 });

 it('renders loading state when no user profile', () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: null,
 isLoading: false,
 signOut: jest.fn(),
 user: null,
 isSignedIn: false,
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 });

 render(<UserSettings />);
 
 expect(screen.getByRole('status')).toBeInTheDocument();
 });

 it('renders settings form for creator', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 isLoading: false,
 signOut: jest.fn(),
 user: null,
 isSignedIn: true,
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 });

 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 notifications: {
 email: true,
 push: true,
 earnings: true,
 newFollowers: true,
 videoComments: true,
 },
 privacy: {
 profileVisibility: 'public',
 showEarnings: true,
 showViewCount: true,
 },
 playback: {
 autoplay: true,
 quality: 'auto',
 volume: 80,
 },
 }),
 });

 render(<UserSettings onSave={mockOnSave} />);
 
 await waitFor(() => {
 expect(screen.getByText('Settings')).toBeInTheDocument();
 expect(screen.getByText('Notifications')).toBeInTheDocument();
 expect(screen.getByText('Privacy')).toBeInTheDocument();
 expect(screen.getByText('Playback')).toBeInTheDocument();
 });

 expect(screen.getByText('Earnings Notifications')).toBeInTheDocument();
 expect(screen.getByText('New Followers')).toBeInTheDocument();
 expect(screen.getByText('Show Earnings')).toBeInTheDocument();
 expect(screen.getByText('Show View Count')).toBeInTheDocument();
 });

 it('renders settings form for member without creator-specific options', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockMemberProfile,
 isLoading: false,
 signOut: jest.fn(),
 user: null,
 isSignedIn: true,
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 });

 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 notifications: {
 email: true,
 push: true,
 earnings: true,
 newFollowers: true,
 videoComments: true,
 },
 privacy: {
 profileVisibility: 'public',
 showEarnings: true,
 showViewCount: true,
 },
 playback: {
 autoplay: true,
 quality: 'auto',
 volume: 80,
 },
 }),
 });

 render(<UserSettings onSave={mockOnSave} />);
 
 await waitFor(() => {
 expect(screen.getByText('Settings')).toBeInTheDocument();
 });

 expect(screen.queryByText('Earnings Notifications')).not.toBeInTheDocument();
 expect(screen.queryByText('New Followers')).not.toBeInTheDocument();
 expect(screen.queryByText('Show Earnings')).not.toBeInTheDocument();
 expect(screen.queryByText('Show View Count')).not.toBeInTheDocument();
 });

 it('toggles notification settings', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 isLoading: false,
 signOut: jest.fn(),
 user: null,
 isSignedIn: true,
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 });

 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 notifications: {
 email: true,
 push: true,
 earnings: true,
 newFollowers: true,
 videoComments: true,
 },
 privacy: {
 profileVisibility: 'public',
 showEarnings: true,
 showViewCount: true,
 },
 playback: {
 autoplay: true,
 quality: 'auto',
 volume: 80,
 },
 }),
 });

 render(<UserSettings onSave={mockOnSave} />);
 
 await waitFor(() => {
 const emailToggle = screen.getByRole('checkbox', { name: /email notifications/i });
 expect(emailToggle).toBeChecked();
 
 fireEvent.click(emailToggle);
 expect(emailToggle).not.toBeChecked();
 });
 });

 it('changes privacy settings', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 isLoading: false,
 signOut: jest.fn(),
 user: null,
 isSignedIn: true,
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 });

 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 notifications: {
 email: true,
 push: true,
 earnings: true,
 newFollowers: true,
 videoComments: true,
 },
 privacy: {
 profileVisibility: 'public',
 showEarnings: true,
 showViewCount: true,
 },
 playback: {
 autoplay: true,
 quality: 'auto',
 volume: 80,
 },
 }),
 });

 render(<UserSettings onSave={mockOnSave} />);
 
 await waitFor(() => {
 const visibilitySelect = screen.getByDisplayValue('Public - Anyone can view your profile');
 fireEvent.change(visibilitySelect, { target: { value: 'private' } });
 expect(visibilitySelect).toHaveValue('private');
 });
 });

 it('adjusts playback settings', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 isLoading: false,
 signOut: jest.fn(),
 user: null,
 isSignedIn: true,
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 });

 (global.fetch as jest.Mock).mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 notifications: {
 email: true,
 push: true,
 earnings: true,
 newFollowers: true,
 videoComments: true,
 },
 privacy: {
 profileVisibility: 'public',
 showEarnings: true,
 showViewCount: true,
 },
 playback: {
 autoplay: true,
 quality: 'auto',
 volume: 80,
 },
 }),
 });

 render(<UserSettings onSave={mockOnSave} />);
 
 await waitFor(() => {
 const volumeSlider = screen.getByDisplayValue('80');
 fireEvent.change(volumeSlider, { target: { value: '60' } });
 expect(volumeSlider).toHaveValue('60');
 });
 });

 it('saves settings successfully', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 isLoading: false,
 signOut: jest.fn(),
 user: null,
 isSignedIn: true,
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 });

 (global.fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 notifications: { email: true, push: true, earnings: true, newFollowers: true, videoComments: true },
 privacy: { profileVisibility: 'public', showEarnings: true, showViewCount: true },
 playback: { autoplay: true, quality: 'auto', volume: 80 },
 }),
 })
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({ success: true }),
 });

 render(<UserSettings onSave={mockOnSave} />);
 
 await waitFor(() => {
 const saveButton = screen.getByText('Save Settings');
 fireEvent.click(saveButton);
 });

 await waitFor(() => {
 expect(screen.getByText('Saved!')).toBeInTheDocument();
 expect(mockOnSave).toHaveBeenCalled();
 });
 });

 it('handles save error gracefully', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 isLoading: false,
 signOut: jest.fn(),
 user: null,
 isSignedIn: true,
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 });

 (global.fetch as jest.Mock)
 .mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 notifications: { email: true, push: true, earnings: true, newFollowers: true, videoComments: true },
 privacy: { profileVisibility: 'public', showEarnings: true, showViewCount: true },
 playback: { autoplay: true, quality: 'auto', volume: 80 },
 }),
 })
 .mockRejectedValueOnce(new Error('Save failed'));

 render(<UserSettings onSave={mockOnSave} />);
 
 await waitFor(() => {
 const saveButton = screen.getByText('Save Settings');
 fireEvent.click(saveButton);
 });

 await waitFor(() => {

 expect(screen.getByText('Saved!')).toBeInTheDocument();
 });
 });

 it('loads preferences from localStorage when API fails', async () => {
 mockUseAuthContext.mockReturnValue({
 userProfile: mockCreatorProfile,
 isLoading: false,
 signOut: jest.fn(),
 user: null,
 isSignedIn: true,
 updateUserProfile: jest.fn(),
 hasRole: jest.fn(),
 });

 const mockPreferences = {
 notifications: { email: false, push: false, earnings: false, newFollowers: false, videoComments: false },
 privacy: { profileVisibility: 'private', showEarnings: false, showViewCount: false },
 playback: { autoplay: false, quality: 'low', volume: 50 },
 };

 (window.localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockPreferences));

 (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API failed'));

 render(<UserSettings onSave={mockOnSave} />);
 
 await waitFor(() => {
 expect(screen.getByText('Settings')).toBeInTheDocument();
 });

 expect(window.localStorage.getItem).toHaveBeenCalledWith('userPreferences');
 });
});