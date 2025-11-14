import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemberHeader from '@/components/layout/MemberHeader';

jest.mock('@/contexts/AuthContext', () => ({
 useAuthContext: () => ({
 user: { id: 'test-user' },
 userProfile: { username: 'testuser', role: 'member' },
 }),
}));

jest.mock('@/contexts/LayoutContext', () => ({
 useLayout: () => ({
 navigation: {
 activeRoute: '/dashboard',
 breadcrumbs: [{ label: 'Dashboard' }],
 },
 }),
}));

jest.mock('@/contexts/NotificationContext', () => ({
 useNotifications: () => ({
 unreadCount: 0,
 }),
}));

jest.mock('@/hooks/useResponsive', () => ({
 useResponsive: () => ({
 isMobile: false,
 isTablet: false,
 isTouchDevice: false,
 isSmallMobile: false,
 }),
}));

jest.mock('@/hooks/useMemberNavigation', () => ({
 useMemberNavigation: () => ({
 navigationItems: [
 { name: 'Home', href: '/dashboard', icon: 'home' },
 { name: 'Discover', href: '/discover', icon: 'search' },
 ],
 navigationContext: {},
 navigateTo: jest.fn(),
 }),
}));

jest.mock('@/components/profile', () => ({
 ProfileDropdown: () => <div data-testid="profile-dropdown">Profile</div>,
}));

jest.mock('next/link', () => {
 return function MockLink({ children, href, ...props }: any) {
 return <a href={href} {...props}>{children}</a>;
 };
});

global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('MemberHeader Search Integration', () => {
 beforeEach(() => {
 jest.clearAllMocks();
 Element.prototype.scrollIntoView = jest.fn();
 });

 it('renders search input on desktop', () => {
 render(<MemberHeader />);
 
 const searchInput = screen.getByPlaceholderText('Search videos...');
 expect(searchInput).toBeInTheDocument();
 expect(searchInput).toHaveAttribute('aria-label', 'Search videos');
 });

 it('shows search results when typing', async () => {
 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: true,
 videos: [
 {
 id: '1',
 title: 'Test Video',
 thumbnailUrl: '/test.jpg',
 creator: { username: 'creator', displayName: 'Creator' },
 creditCost: 5,
 duration: 120,
 },
 ],
 }),
 } as Response);

 render(<MemberHeader />);
 
 const searchInput = screen.getByPlaceholderText('Search videos...');

 fireEvent.change(searchInput, { target: { value: 'test' } });
 fireEvent.focus(searchInput);

 await waitFor(() => {
 expect(mockFetch).toHaveBeenCalledWith(
 '/api/discover/videos?search=test&limit=8&page=1',
 expect.any(Object)
 );
 }, { timeout: 1000 });

 await waitFor(() => {
 expect(screen.getByText('Test Video')).toBeInTheDocument();
 });
 });

 it('handles search errors gracefully', async () => {
 mockFetch.mockRejectedValueOnce(new Error('Network error'));

 render(<MemberHeader />);
 
 const searchInput = screen.getByPlaceholderText('Search videos...');
 
 fireEvent.change(searchInput, { target: { value: 'test' } });
 fireEvent.focus(searchInput);

 await waitFor(() => {
 expect(screen.getByText('Search Error')).toBeInTheDocument();
 expect(screen.getByText('Network error')).toBeInTheDocument();
 }, { timeout: 1000 });
 });

 it('shows clear button when there is text', () => {
 render(<MemberHeader />);
 
 const searchInput = screen.getByPlaceholderText('Search videos...');

 expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();

 fireEvent.change(searchInput, { target: { value: 'test' } });

 expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
 });

 it('clears search when clear button is clicked', () => {
 render(<MemberHeader />);
 
 const searchInput = screen.getByPlaceholderText('Search videos...');

 fireEvent.change(searchInput, { target: { value: 'test' } });
 expect(searchInput).toHaveValue('test');

 const clearButton = screen.getByLabelText('Clear search');
 fireEvent.click(clearButton);

 expect(searchInput).toHaveValue('');
 });

 it('has proper accessibility attributes', () => {
 render(<MemberHeader />);
 
 const searchInput = screen.getByPlaceholderText('Search videos...');
 
 expect(searchInput).toHaveAttribute('role', 'combobox');
 expect(searchInput).toHaveAttribute('aria-autocomplete', 'list');
 expect(searchInput).toHaveAttribute('aria-haspopup', 'listbox');
 expect(searchInput).toHaveAttribute('aria-expanded', 'false');
 });

 it('updates aria-expanded when search results are shown', async () => {
 mockFetch.mockResolvedValueOnce({
 ok: true,
 json: async () => ({
 success: true,
 videos: [
 {
 id: '1',
 title: 'Test Video',
 creator: { username: 'creator', displayName: 'Creator' },
 },
 ],
 }),
 } as Response);

 render(<MemberHeader />);
 
 const searchInput = screen.getByPlaceholderText('Search videos...');

 expect(searchInput).toHaveAttribute('aria-expanded', 'false');

 fireEvent.change(searchInput, { target: { value: 'test' } });
 fireEvent.focus(searchInput);

 await waitFor(() => {
 expect(searchInput).toHaveAttribute('aria-expanded', 'true');
 }, { timeout: 1000 });
 });
});