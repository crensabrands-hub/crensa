import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemberPreferences } from '@/components/member/MemberPreferences';
import { useAuthContext } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: jest.fn(),
}));

global.fetch = jest.fn();

const mockUserProfile = {
 id: 'user-1',
 username: 'testuser',
 role: 'member',
};

const mockPreferencesData = {
 notifications: {
 email: true,
 push: true,
 earnings: true,
 newFollowers: true,
 videoComments: true,
 },
 privacy: {
 profileVisibility: 'public' as const,
 showEarnings: true,
 showViewCount: true,
 },
 playback: {
 autoplay: true,
 quality: 'auto' as const,
 volume: 80,
 },
};

describe('MemberPreferences', () => {
 beforeEach(() => {
 (useAuthContext as jest.Mock).mockReturnValue({
 userProfile: mockUserProfile,
 });

 (fetch as jest.Mock).mockImplementation((url, options) => {
 if (options?.method === 'PUT') {
 return Promise.resolve({
 ok: true,
 json: async () => ({
 success: true,
 data: mockPreferencesData,
 message: 'Preferences updated successfully',
 }),
 });
 }
 
 return Promise.resolve({
 ok: true,
 json: async () => ({
 success: true,
 data: mockPreferencesData,
 }),
 });
 });
 });

 afterEach(() => {
 jest.clearAllMocks();
 });

 it('renders loading state initially', () => {
 render(<MemberPreferences />);

 expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
 });

 it('fetches and displays preferences data', async () => {
 render(<MemberPreferences />);

 await waitFor(() => {
 expect(screen.getByText('Preferences')).toBeInTheDocument();
 });

 expect(fetch).toHaveBeenCalledWith('/api/member/preferences');

 await waitFor(() => {
 expect(screen.getByText('Email Notifications')).toBeInTheDocument();
 expect(screen.getByText('Push Notifications')).toBeInTheDocument();
 });
 });

 it('displays notifications tab content by default', async () => {
 render(<MemberPreferences />);

 await waitFor(() => {
 expect(screen.getByText('Notification Settings')).toBeInTheDocument();
 expect(screen.getByText('Email Notifications')).toBeInTheDocument();
 expect(screen.getByText('Push Notifications')).toBeInTheDocument();
 expect(screen.getByText('Earnings Updates')).toBeInTheDocument();
 expect(screen.getByText('New Followers')).toBeInTheDocument();
 expect(screen.getByText('Video Comments')).toBeInTheDocument();
 });
 });

 it('switches between tabs correctly', async () => {
 render(<MemberPreferences />);

 await waitFor(() => {
 expect(screen.getByText('Preferences')).toBeInTheDocument();
 });

 fireEvent.click(screen.getByText('Privacy'));
 
 await waitFor(() => {
 expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
 expect(screen.getByText('Profile Visibility')).toBeInTheDocument();
 expect(screen.getByText('Show Earnings')).toBeInTheDocument();
 expect(screen.getByText('Show View Count')).toBeInTheDocument();
 });

 fireEvent.click(screen.getByText('Playback'));
 
 await waitFor(() => {
 expect(screen.getByText('Playback Settings')).toBeInTheDocument();
 expect(screen.getByText('Autoplay')).toBeInTheDocument();
 expect(screen.getByText('Default Video Quality')).toBeInTheDocument();
 expect(screen.getByText('Default Volume')).toBeInTheDocument();
 });
 });

 it('toggles notification preferences and saves', async () => {
 render(<MemberPreferences />);

 await waitFor(() => {
 expect(screen.getByText('Email Notifications')).toBeInTheDocument();
 });

 const emailToggle = screen.getAllByRole('checkbox')[0]; // First checkbox is email notifications
 fireEvent.click(emailToggle);

 await waitFor(() => {
 expect(fetch).toHaveBeenCalledWith('/api/member/preferences', {
 method: 'PUT',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 notifications: {
 ...mockPreferencesData.notifications,
 email: false,
 },
 }),
 });
 });
 });

 it('changes privacy settings and saves', async () => {
 render(<MemberPreferences />);

 await waitFor(() => {
 fireEvent.click(screen.getByText('Privacy'));
 });

 await waitFor(() => {
 expect(screen.getByText('Profile Visibility')).toBeInTheDocument();
 });

 const privateRadio = screen.getByDisplayValue('private');
 fireEvent.click(privateRadio);

 await waitFor(() => {
 expect(fetch).toHaveBeenCalledWith('/api/member/preferences', {
 method: 'PUT',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 privacy: {
 ...mockPreferencesData.privacy,
 profileVisibility: 'private',
 },
 }),
 });
 });
 });

 it('changes playback settings and saves', async () => {
 render(<MemberPreferences />);

 await waitFor(() => {
 fireEvent.click(screen.getByText('Playback'));
 });

 await waitFor(() => {
 expect(screen.getByText('Default Video Quality')).toBeInTheDocument();
 });

 const qualitySelect = screen.getByDisplayValue('Auto (Recommended)');
 fireEvent.change(qualitySelect, { target: { value: 'high' } });

 await waitFor(() => {
 expect(fetch).toHaveBeenCalledWith('/api/member/preferences', {
 method: 'PUT',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 playback: {
 ...mockPreferencesData.playback,
 quality: 'high',
 },
 }),
 });
 });
 });

 it('changes volume setting and saves', async () => {
 render(<MemberPreferences />);

 await waitFor(() => {
 fireEvent.click(screen.getByText('Playback'));
 });

 await waitFor(() => {
 expect(screen.getByText('Default Volume')).toBeInTheDocument();
 });

 const volumeSlider = screen.getByRole('slider');
 fireEvent.change(volumeSlider, { target: { value: '60' } });

 await waitFor(() => {
 expect(fetch).toHaveBeenCalledWith('/api/member/preferences', {
 method: 'PUT',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 playback: {
 ...mockPreferencesData.playback,
 volume: 60,
 },
 }),
 });
 });
 });

 it('displays success message after saving', async () => {
 render(<MemberPreferences />);

 await waitFor(() => {
 expect(screen.getByText('Email Notifications')).toBeInTheDocument();
 });

 const emailToggle = screen.getAllByRole('checkbox')[0]; // First checkbox is email notifications
 fireEvent.click(emailToggle);

 await waitFor(() => {
 expect(screen.getByText('Preferences saved successfully!')).toBeInTheDocument();
 });
 });

 it('handles API error gracefully', async () => {
 (fetch as jest.Mock).mockImplementation((url, options) => {
 if (options?.method === 'PUT') {
 return Promise.resolve({
 ok: false,
 json: async () => ({
 error: 'Failed to save preferences',
 }),
 });
 }
 
 return Promise.resolve({
 ok: true,
 json: async () => ({
 success: true,
 data: mockPreferencesData,
 }),
 });
 });

 render(<MemberPreferences />);

 await waitFor(() => {
 expect(screen.getByText('Email Notifications')).toBeInTheDocument();
 });

 const emailToggle = screen.getAllByRole('checkbox')[0]; // First checkbox is email notifications
 fireEvent.click(emailToggle);

 await waitFor(() => {
 expect(screen.queryByText('Preferences saved successfully!')).not.toBeInTheDocument();
 });
 });

 it('handles fetch error gracefully', async () => {
 (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

 render(<MemberPreferences />);

 await waitFor(() => {
 expect(screen.getByText('Error Loading Preferences')).toBeInTheDocument();
 expect(screen.getByText('Network error')).toBeInTheDocument();
 });
 });

 it('displays no data message when preferences data is null', async () => {
 (fetch as jest.Mock).mockResolvedValue({
 ok: true,
 json: async () => ({
 success: true,
 data: null,
 }),
 });

 render(<MemberPreferences />);

 await waitFor(() => {
 expect(screen.getByText('No preferences data available.')).toBeInTheDocument();
 });
 });

 it('shows saving indicator when updating preferences', async () => {

 (fetch as jest.Mock).mockImplementation((url, options) => {
 if (options?.method === 'PUT') {
 return new Promise(resolve => {
 setTimeout(() => {
 resolve({
 ok: true,
 json: async () => ({
 success: true,
 data: mockPreferencesData,
 message: 'Preferences updated successfully',
 }),
 });
 }, 100);
 });
 }
 
 return Promise.resolve({
 ok: true,
 json: async () => ({
 success: true,
 data: mockPreferencesData,
 }),
 });
 });

 render(<MemberPreferences />);

 await waitFor(() => {
 expect(screen.getByText('Email Notifications')).toBeInTheDocument();
 });

 const emailToggle = screen.getAllByRole('checkbox')[0]; // First checkbox is email notifications
 fireEvent.click(emailToggle);

 await waitFor(() => {
 expect(screen.getByText('Saving...')).toBeInTheDocument();
 });

 await waitFor(() => {
 expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
 });
 });
});