import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { useResponsive } from '@/hooks/useResponsive';
import MemberSidebar from '../MemberSidebar';

jest.mock('next/navigation');
jest.mock('@/contexts/AuthContext');
jest.mock('@/hooks/useResponsive');
jest.mock('@/hooks/useNotificationCount');
jest.mock('@/hooks/useMemberNavigation');
jest.mock('@/hooks/useWalletBalance');

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>;
const mockUseResponsive = useResponsive as jest.MockedFunction<typeof useResponsive>;

describe('MemberSidebar', () => {
 const mockUserProfile = {
 id: 'user-1',
 username: 'testmember',
 email: 'test@example.com',
 role: 'member' as const,
 };

 const mockOnClose = jest.fn();

 beforeEach(() => {
 mockUsePathname.mockReturnValue('/dashboard');
 
 mockUseAuthContext.mockReturnValue({
 user: { id: 'user-1' } as any,
 userProfile: mockUserProfile,
 isLoading: false,
 hasRole: jest.fn().mockReturnValue(false),
 } as any);

 mockUseResponsive.mockReturnValue({
 isMobile: false,
 isTablet: false,
 isDesktop: true,
 isTouchDevice: false,
 isSmallMobile: false,
 });

 jest.requireMock('@/hooks/useNotificationCount').useNotificationCount = jest.fn().mockReturnValue({
 unreadCount: 0,
 loading: false,
 });

 jest.requireMock('@/hooks/useMemberNavigation').useMemberNavigation = jest.fn().mockReturnValue({
 navigationItems: [
 { name: 'Home', href: '/dashboard', icon: 'home', isActive: true },
 { name: 'Browse', href: '/discover', icon: 'search', isActive: false },
 { name: 'My Library', href: '/history', icon: 'play', isActive: false },
 { name: 'Coin Balance', href: '/wallet', icon: 'wallet', badge: 100, showBadgeAsCoins: true, isActive: false },
 { name: 'Settings', href: '/preferences', icon: 'settings', isActive: false },
 ],
 navigationContext: { section: 'dashboard', title: 'Dashboard', showBackButton: false, breadcrumbs: [] },
 });

 jest.requireMock('@/hooks/useWalletBalance').useWalletBalance = jest.fn().mockReturnValue({
 balance: { balance: 100, lastUpdated: new Date(), pendingTransactions: 0 },
 isLoading: false,
 error: null,
 });

 jest.requireMock('@/hooks/useResponsive').useSidebarTouch = jest.fn().mockReturnValue({
 sidebarTouchHandlers: {},
 });
 });

 afterEach(() => {
 jest.clearAllMocks();
 });

 it('renders member sidebar with navigation items', () => {
 render(<MemberSidebar isOpen={true} onClose={mockOnClose} />);

 expect(screen.getByText('Crensa')).toBeInTheDocument();
 expect(screen.getByText('Member Portal')).toBeInTheDocument();
 expect(screen.getByText('Home')).toBeInTheDocument();
 expect(screen.getByText('Browse')).toBeInTheDocument();
 expect(screen.getByText('My Library')).toBeInTheDocument();
 expect(screen.getByText('Coin Balance')).toBeInTheDocument();
 expect(screen.getByText('Settings')).toBeInTheDocument();
 });

 it('displays user profile information', () => {
 render(<MemberSidebar isOpen={true} onClose={mockOnClose} />);

 expect(screen.getByText('testmember')).toBeInTheDocument();
 expect(screen.getByText('Member Account')).toBeInTheDocument();
 });

 it('highlights active navigation item', () => {
 render(<MemberSidebar isOpen={true} onClose={mockOnClose} />);

 const homeLink = screen.getByRole('link', { name: /home/i });
 expect(homeLink).toHaveClass('bg-primary-neon-yellow', 'text-primary-navy');
 });

 it('shows coin balance badge', () => {
 render(<MemberSidebar isOpen={true} onClose={mockOnClose} />);

 const coinBalanceLink = screen.getByRole('link', { name: /coin balance/i });
 expect(coinBalanceLink).toBeInTheDocument();
 });

 it('displays quick actions section', () => {
 render(<MemberSidebar isOpen={true} onClose={mockOnClose} />);

 expect(screen.getByText('Quick Actions')).toBeInTheDocument();
 expect(screen.getByText('Discover New Content →')).toBeInTheDocument();
 expect(screen.getByText('Top Up Wallet →')).toBeInTheDocument();
 });

 it('displays help section', () => {
 render(<MemberSidebar isOpen={true} onClose={mockOnClose} />);

 expect(screen.getByText('Help & Support')).toBeInTheDocument();
 });

 it('calls onClose when close button is clicked on mobile', () => {
 mockUseResponsive.mockReturnValue({
 isMobile: true,
 isTablet: false,
 isDesktop: false,
 isTouchDevice: true,
 });

 render(<MemberSidebar isOpen={true} onClose={mockOnClose} />);

 const closeButton = screen.getByLabelText('Close sidebar');
 fireEvent.click(closeButton);

 expect(mockOnClose).toHaveBeenCalledTimes(1);
 });

 it('applies correct visibility classes based on isOpen prop', () => {
 const { rerender } = render(<MemberSidebar isOpen={false} onClose={mockOnClose} />);
 
 let sidebar = screen.getByRole('complementary', { hidden: true });
 expect(sidebar).toHaveClass('-translate-x-full');

 rerender(<MemberSidebar isOpen={true} onClose={mockOnClose} />);
 
 sidebar = screen.getByRole('complementary');
 expect(sidebar).toHaveClass('translate-x-0');
 });

 it('handles different screen sizes correctly', () => {

 mockUseResponsive.mockReturnValue({
 isMobile: true,
 isTablet: false,
 isDesktop: false,
 isTouchDevice: true,
 });

 const { rerender } = render(<MemberSidebar isOpen={true} onClose={mockOnClose} />);
 
 let sidebar = screen.getByRole('complementary');
 expect(sidebar).toHaveClass('w-full', 'max-w-sm');

 mockUseResponsive.mockReturnValue({
 isMobile: false,
 isTablet: false,
 isDesktop: true,
 isTouchDevice: false,
 });

 rerender(<MemberSidebar isOpen={true} onClose={mockOnClose} />);
 
 sidebar = screen.getByRole('complementary');
 expect(sidebar).toHaveClass('w-64');
 });

 it('calls onClose when navigation links are clicked on mobile', () => {
 mockUseResponsive.mockReturnValue({
 isMobile: true,
 isTablet: false,
 isDesktop: false,
 isTouchDevice: true,
 });

 render(<MemberSidebar isOpen={true} onClose={mockOnClose} />);

 const browseLink = screen.getByRole('link', { name: /browse/i });
 fireEvent.click(browseLink);

 expect(mockOnClose).toHaveBeenCalledTimes(1);
 });
});